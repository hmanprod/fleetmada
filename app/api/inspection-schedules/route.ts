import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// Helper to validate token
const verifyToken = (request: NextRequest) => {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) return null;
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (e) {
        return null;
    }
};

export interface ScheduledInspectionItem {
    scheduleId: string;
    templateId: string;
    templateName: string;
    templateCategory: string;
    templateColor?: string;
    vehicleId: string;
    vehicleName: string;
    vehicleVin: string;
    dueDate: string; // Calculated due date
    frequencyType: string | null;
    frequencyInterval: number | null;
    ruleType: string;
    isIgnored?: boolean;
    hasCompleted?: boolean;
}

// Calculate upcoming dates based on frequency
function calculateUpcomingDates(
    frequencyType: string | null,
    frequencyInterval: number | null,
    startDate: Date,
    endDate: Date
): Date[] {
    const dates: Date[] = [];
    if (!frequencyType) return dates;

    const interval = frequencyInterval || 1;
    let current = new Date(startDate);
    current.setHours(0, 0, 0, 0);

    while (current <= endDate) {
        dates.push(new Date(current));

        switch (frequencyType) {
            case 'DAILY':
                current.setDate(current.getDate() + interval);
                break;
            case 'WEEKLY':
                current.setDate(current.getDate() + (7 * interval));
                break;
            case 'MONTHLY':
                current.setMonth(current.getMonth() + interval);
                break;
            default:
                // For MILEAGE or unknown, just use start date
                return dates.length ? dates : [new Date(startDate)];
        }
    }

    return dates;
}

export async function GET(request: NextRequest) {
    const user = verifyToken(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Date range: today to 7 days from now (for active) + past dates for missed
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sevenDaysFromNow = new Date(today);
        sevenDaysFromNow.setDate(today.getDate() + 7);
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30); // Include missed from last 30 days

        // 1. Fetch all enabled schedules with their templates
        const schedules = await prisma.inspectionSchedule.findMany({
            where: { scheduleEnabled: true },
            include: {
                template: {
                    select: {
                        id: true,
                        name: true,
                        category: true,
                        color: true,
                        isActive: true
                    }
                }
            }
        });

        // 2. Fetch all active vehicles
        const vehicles = await prisma.vehicle.findMany({
            where: { status: 'ACTIVE' },
            select: {
                id: true,
                name: true,
                vin: true,
                type: true,
                make: true,
                model: true,
                year: true,
                group: true,
                labels: true
            }
        });

        // 3. Fetch existing inspections to check for completed/ignored status
        const existingInspections = await prisma.inspection.findMany({
            where: {
                scheduledDate: {
                    gte: thirtyDaysAgo,
                    lte: sevenDaysFromNow
                }
            },
            select: {
                vehicleId: true,
                inspectionTemplateId: true,
                scheduledDate: true,
                status: true
            }
        });

        // 4. Expand schedules per vehicle AND per date
        const result: ScheduledInspectionItem[] = [];

        for (const schedule of schedules) {
            if (!schedule.template.isActive) continue;

            let matchingVehicles = vehicles;

            if (schedule.ruleType === 'SPECIFIC_VEHICLE') {
                if (schedule.ruleValue) {
                    matchingVehicles = vehicles.filter(v => v.id === schedule.ruleValue);
                }
            } else if (schedule.ruleType === 'BY_ATTRIBUTE') {
                if (schedule.ruleValue) {
                    try {
                        const rule = JSON.parse(schedule.ruleValue);
                        if (rule.attribute && rule.value) {
                            matchingVehicles = vehicles.filter(v => {
                                const vehicleValue = (v as any)[rule.attribute];
                                if (Array.isArray(vehicleValue)) {
                                    return vehicleValue.includes(rule.value);
                                }
                                return vehicleValue === rule.value;
                            });
                        }
                    } catch (e) {
                        console.error('Failed to parse ruleValue:', e);
                    }
                }
            }

            // Calculate upcoming dates based on frequency
            // Start from nextDueDate if set, otherwise from today
            const scheduleStart = schedule.nextDueDate ? new Date(schedule.nextDueDate) : new Date(today);

            // For missed: calculate from 30 days ago to today
            // For active: calculate from today to 7 days ahead
            const missedDates = calculateUpcomingDates(
                schedule.frequencyType,
                schedule.frequencyInterval,
                thirtyDaysAgo,
                new Date(today.getTime() - 86400000) // Yesterday
            );

            const activeDates = calculateUpcomingDates(
                schedule.frequencyType,
                schedule.frequencyInterval,
                today,
                sevenDaysFromNow
            );

            const allDates = [...missedDates, ...activeDates];

            // If no dates calculated (e.g., MILEAGE type), use nextDueDate or today
            if (allDates.length === 0 && schedule.nextDueDate) {
                allDates.push(new Date(schedule.nextDueDate));
            }

            for (const vehicle of matchingVehicles) {
                for (const dueDate of allDates) {
                    // Check if this slot already has an inspection
                    const slotStart = new Date(dueDate);
                    slotStart.setHours(0, 0, 0, 0);
                    const slotEnd = new Date(dueDate);
                    slotEnd.setHours(23, 59, 59, 999);

                    const existing = existingInspections.find(ins =>
                        ins.vehicleId === vehicle.id &&
                        ins.inspectionTemplateId === schedule.templateId &&
                        ins.scheduledDate &&
                        new Date(ins.scheduledDate) >= slotStart &&
                        new Date(ins.scheduledDate) <= slotEnd
                    );

                    result.push({
                        scheduleId: schedule.id,
                        templateId: schedule.templateId,
                        templateName: schedule.template.name,
                        templateCategory: schedule.template.category,
                        templateColor: schedule.template.color || undefined,
                        vehicleId: vehicle.id,
                        vehicleName: vehicle.name,
                        vehicleVin: vehicle.vin,
                        dueDate: dueDate.toISOString(),
                        frequencyType: schedule.frequencyType,
                        frequencyInterval: schedule.frequencyInterval,
                        ruleType: schedule.ruleType,
                        isIgnored: existing?.status === 'CANCELLED',
                        hasCompleted: existing?.status === 'COMPLETED' || existing?.status === 'IN_PROGRESS' || existing?.status === 'DRAFT'
                    });
                }
            }
        }

        // Sort by date
        result.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        return NextResponse.json({
            success: true,
            data: result,
            count: result.length
        });
    } catch (error) {
        console.error('Failed to fetch inspection schedules:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const user = verifyToken(request);
    if (!user || !(user as any).userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userId = (user as any).userId;
        const body = await request.json();
        const { action, items: itemsIn, ...singleItem } = body;

        const items = itemsIn || [singleItem];

        if (!action || items.length === 0) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        for (const item of items) {
            const { vehicleId, templateId, dueDate, templateName } = item;
            if (!vehicleId || !templateId || !dueDate) continue;

            const scheduledDate = new Date(dueDate);
            const dayStart = new Date(scheduledDate);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(scheduledDate);
            dayEnd.setHours(23, 59, 59, 999);

            if (action === 'IGNORE') {
                const existing = await prisma.inspection.findFirst({
                    where: {
                        vehicleId,
                        inspectionTemplateId: templateId,
                        scheduledDate: {
                            gte: dayStart,
                            lte: dayEnd
                        }
                    }
                });

                if (!existing) {
                    await prisma.inspection.create({
                        data: {
                            vehicleId,
                            inspectionTemplateId: templateId,
                            userId: userId,
                            title: `Ignorée - ${templateName || 'Inspection'}`,
                            status: 'CANCELLED',
                            scheduledDate: scheduledDate
                        }
                    });
                } else {
                    await prisma.inspection.update({
                        where: { id: existing.id },
                        data: { status: 'CANCELLED' }
                    });
                }
            } else if (action === 'RESTORE') {
                await prisma.inspection.deleteMany({
                    where: {
                        vehicleId,
                        inspectionTemplateId: templateId,
                        scheduledDate: {
                            gte: dayStart,
                            lte: dayEnd
                        },
                        status: 'CANCELLED'
                    }
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to update inspection schedule status:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
