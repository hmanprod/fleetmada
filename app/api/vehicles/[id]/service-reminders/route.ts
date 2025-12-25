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

        const reminders = await prisma.serviceReminder.findMany({
            where: { vehicleId: params.id },
            include: {
                serviceTask: true
            },
            orderBy: { nextDue: 'asc' }
        })

        return NextResponse.json({ success: true, data: reminders })

    } catch (error) {
        console.error('Error fetching reminders:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
