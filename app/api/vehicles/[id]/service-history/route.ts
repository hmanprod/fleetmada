import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

        // Fetch COMPLETED service entries (Service History)
        // Assuming Service History typically means completed entries, but could include all.
        // Given there is a separate Work Orders module (often pending/in-progress),
        // Service History usually implies completed work.
        const serviceEntries = await prisma.serviceEntry.findMany({
            where: {
                vehicleId: params.id,
                status: 'COMPLETED'
            },
            include: {
                vendor: true,
                parts: {
                    include: { part: true }
                }
            },
            orderBy: { date: 'desc' }
        })

        return NextResponse.json({ success: true, data: serviceEntries })

    } catch (error) {
        console.error('Error fetching service history:', error)
        return NextResponse.json({ success: false, error: 'Erreur interne du serveur' }, { status: 500 })
    }
}
