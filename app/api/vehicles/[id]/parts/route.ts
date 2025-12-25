import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const validateToken = (token: string) => {
    try {
        const secret = process.env.JWT_SECRET || 'fallback-secret-key'
        const decoded = jwt.verify(token, secret) as any
        if (decoded.type !== 'login') return null
        return decoded
    } catch {
        return null
    }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const vehicleId = params.id
        const authHeader = request.headers.get('authorization')
        if (!authHeader) return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 })

        const token = authHeader.split(' ')[1]
        const payload = validateToken(token)
        if (!payload) return NextResponse.json({ success: false, error: 'Token invalide' }, { status: 401 })

        const partsHistory = await prisma.serviceEntryPart.findMany({
            where: {
                serviceEntry: {
                    vehicleId
                }
            },
            include: {
                part: true,
                serviceEntry: {
                    select: {
                        id: true,
                        date: true,
                        isWorkOrder: true,
                        status: true,
                        notes: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ success: true, data: partsHistory })

    } catch (error) {
        console.error('GET Parts History Error:', error)
        return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
    }
}
