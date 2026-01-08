
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const search = searchParams.get('search') || '';
        const sortBy = searchParams.get('sortBy') || 'date';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        // Filters
        const vehicleId = searchParams.get('vehicleId');
        const type = searchParams.get('type');
        const vendor = searchParams.get('vendor');
        const status = searchParams.get('status');
        const source = searchParams.get('source');
        const vehicleStatus = searchParams.get('vehicleStatus');

        // Date range filters
        const dateGte = searchParams.get('date_gte');
        const dateLte = searchParams.get('date_lte');

        // Amount range filters (handled as string from params)
        const amountGte = searchParams.get('amount_gte');
        const amountLte = searchParams.get('amount_lte');

        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {};

        if (search) {
            where.OR = [
                { vehicle: { name: { contains: search, mode: 'insensitive' } } },
                { vehicle: { vin: { contains: search, mode: 'insensitive' } } },
                { vendorName: { contains: search, mode: 'insensitive' } },
                { notes: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (vehicleId) where.vehicleId = vehicleId;
        if (type) where.type = type;
        if (vendor) {
            where.OR = [
                { vendorId: vendor },
                { vendorName: { contains: vendor, mode: 'insensitive' } }
            ];
        }
        if (status) where.status = status;
        if (source) where.source = { contains: source, mode: 'insensitive' };
        if (vehicleStatus) where.vehicle = { status: vehicleStatus };

        if (dateGte) where.date = { ...where.date, gte: new Date(dateGte) };
        if (dateLte) where.date = { ...where.date, lte: new Date(dateLte) };

        if (amountGte) where.amount = { ...where.amount, gte: parseFloat(amountGte) };
        if (amountLte) where.amount = { ...where.amount, lte: parseFloat(amountLte) };

        // Execute query
        const [expenses, totalCount] = await Promise.all([
            prisma.expenseEntry.findMany({
                where,
                include: {
                    vehicle: { select: { id: true, name: true, vin: true } },
                    vendor: { select: { id: true, name: true } }
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
            }),
            prisma.expenseEntry.count({ where }),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        // Calculate stats (optional, mimicking MeterEntries structure)
        const totalAmount = await prisma.expenseEntry.aggregate({
            where,
            _sum: { amount: true }
        });

        return NextResponse.json({
            success: true,
            data: {
                expenses,
                pagination: {
                    page,
                    limit,
                    totalCount,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
                stats: {
                    totalAmount: totalAmount._sum.amount || 0,
                    count: totalCount
                }
            },
        });
    } catch (error) {
        console.error('Error fetching expenses:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch expenses' },
            { status: 500 }
        );
    }
}
