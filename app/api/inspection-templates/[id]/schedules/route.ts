import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

// Schema validation for Schedule
const CreateScheduleSchema = z.object({
    ruleType: z.enum(['ALL_VEHICLES', 'BY_ATTRIBUTE', 'SPECIFIC_VEHICLE']),
    ruleValue: z.string().optional(),
    scheduleEnabled: z.boolean(),
    frequencyType: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'MILEAGE']).optional(),
    frequencyInterval: z.number().int().optional(),
});

// Helper to validate token (should be extracted to middleware/lib in real app but following pattern)
const verifyToken = (request: NextRequest) => {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) return null;
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (e) {
        return null;
    }
};

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const user = verifyToken(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const schedules = await prisma.inspectionSchedule.findMany({
            where: { templateId: params.id },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, data: schedules });
    } catch (error) {
        console.error('Failed to fetch schedules:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const user = verifyToken(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validation = CreateScheduleSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.errors }, { status: 400 });
        }

        const { ruleType, ruleValue, scheduleEnabled, frequencyType, frequencyInterval } = validation.data;

        // Optional: Calculate nextDueDate immediately if possible, for now leave null or logic elsewhere
        // If scheduleEnabled is true, we might want to set nextDueDate = now + interval? 
        // Simplified logic: just save the rule.

        const schedule = await prisma.inspectionSchedule.create({
            data: {
                templateId: params.id,
                ruleType,
                ruleValue,
                scheduleEnabled,
                frequencyType: frequencyType as any, // enum cast
                frequencyInterval,
            }
        });

        return NextResponse.json({ success: true, data: schedule });
    } catch (error) {
        console.error('Failed to create schedule:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
