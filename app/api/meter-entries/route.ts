import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MeterEntriesQuerySchema } from '@/lib/validations/vehicle-validations'
import jwt from 'jsonwebtoken'

interface TokenPayload {
    userId: string
    email: string
    type: string
}

const validateToken = (token: string): TokenPayload | null => {
    try {
        const secret = process.env.JWT_SECRET || 'fallback-secret-key'
        return jwt.verify(token, secret) as TokenPayload
    } catch (error) {
        return null
    }
}

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const token = authHeader.split(' ')[1]
        const decoded = validateToken(token)
        if (!decoded) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const queryParams: any = {}
        for (const [key, value] of searchParams.entries()) {
            queryParams[key] = value
        }

        const result = MeterEntriesQuerySchema.safeParse(queryParams)
        if (!result.success) {
            return NextResponse.json({ success: false, error: 'Invalid query parameters', details: result.error.format() }, { status: 400 })
        }

        const query = result.data
        const offset = (query.page - 1) * query.limit

        const where: any = {
            vehicle: {
                userId: decoded.userId
            }
        }

        // Handle Search
        if (query.search) {
            where.OR = [
                { vehicle: { name: { contains: query.search, mode: 'insensitive' } } },
                { vehicle: { vin: { contains: query.search, mode: 'insensitive' } } }
            ]
        }

        // Common Fields
        if (query.type) where.type = query.type;
        if (query.void !== undefined) where.void = query.void;

        // Dynamic Filters
        Object.keys(query).forEach(key => {
            const value = query[key];
            if (value === undefined || value === null || value === '') return;

            // Date Range
            if (key === 'startDate' && typeof value === 'string') {
                where.date = { ...where.date, gte: new Date(value) };
            } else if (key === 'endDate' && typeof value === 'string') {
                where.date = { ...where.date, lte: new Date(value) };
            }

            // Check for suffixes
            else if (key.endsWith('_gte') && (typeof value === 'string' || typeof value === 'number')) {
                const field = key.replace('_gte', '');
                const isDateField = ['date', 'createdAt', 'updatedAt'].includes(field);
                where[field] = { ...where[field], gte: isDateField ? new Date(value as string) : Number(value) };
            } else if (key.endsWith('_lte') && (typeof value === 'string' || typeof value === 'number')) {
                const field = key.replace('_lte', '');
                const isDateField = ['date', 'createdAt', 'updatedAt'].includes(field);
                where[field] = { ...where[field], lte: isDateField ? new Date(value as string) : Number(value) };
            }

            // Handle Vehicle Level Filters (e.g. status, group, operator)
            else if (['status', 'group', 'operator', 'make', 'model', 'year'].includes(key) && typeof value === 'string') {
                where.vehicle = {
                    ...where.vehicle,
                    [key]: value.includes(',') ? { in: value.split(',') } : value
                };
            }
        });

        const [entries, totalCount] = await Promise.all([
            prisma.meterEntry.findMany({
                where,
                include: {
                    vehicle: {
                        select: {
                            id: true,
                            name: true,
                            vin: true,
                            status: true,
                            group: true,
                            operator: true
                        }
                    }
                },
                orderBy: { [query.sortBy]: query.sortOrder },
                skip: offset,
                take: query.limit
            }),
            prisma.meterEntry.count({ where })
        ])

        return NextResponse.json({
            success: true,
            data: {
                meterEntries: entries,
                pagination: {
                    page: query.page,
                    limit: query.limit,
                    totalCount,
                    totalPages: Math.ceil(totalCount / query.limit),
                    hasNext: query.page < Math.ceil(totalCount / query.limit),
                    hasPrev: query.page > 1
                }
            }
        })

    } catch (error) {
        console.error('Error fetching meter entries:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
