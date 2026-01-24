import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

interface TokenPayload {
    userId: string
    email: string
    type: string
    iat: number
    exp?: number
}

const validateToken = (token: string): TokenPayload | null => {
    try {
        const secret = process.env.JWT_SECRET || 'fallback-secret-key'
        const decoded = jwt.verify(token, secret) as TokenPayload

        if (decoded.type !== 'login') {
            return null
        }

        return decoded
    } catch (error) {
        return null
    }
}

const updateLocationSchema = z.object({
    aisle: z.string().optional(),
    row: z.string().optional(),
    bin: z.string().optional(),
    quantity: z.number().min(0).optional()
})

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string, locationId: string } }
) {
    try {
        const authHeader = request.headers.get('authorization')
        if (!authHeader) return NextResponse.json({ success: false, error: 'Token manquant' }, { status: 401 })

        const authParts = authHeader.split(' ')
        if (authParts.length !== 2 || authParts[0] !== 'Bearer') return NextResponse.json({ success: false, error: 'Token invalide' }, { status: 401 })

        const tokenPayload = validateToken(authParts[1])
        if (!tokenPayload) return NextResponse.json({ success: false, error: 'Token invalide' }, { status: 401 })

        const { id: partId, locationId } = params
        const body = await request.json()
        const validatedData = updateLocationSchema.parse(body)

        const updatedLocation = await prisma.partLocation.update({
            where: { id: locationId },
            data: validatedData,
            include: {
                place: { select: { name: true } }
            }
        })

        return NextResponse.json({
            success: true,
            data: {
                ...updatedLocation,
                placeName: updatedLocation.place.name
            },
            message: 'Emplacement mis à jour'
        })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 })
        }
        console.error('Error updating location:', error)
        return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string, locationId: string } }
) {
    try {
        const authHeader = request.headers.get('authorization')
        if (!authHeader) return NextResponse.json({ success: false, error: 'Token manquant' }, { status: 401 })

        const authParts = authHeader.split(' ')
        if (authParts.length !== 2 || authParts[0] !== 'Bearer') return NextResponse.json({ success: false, error: 'Token invalide' }, { status: 401 })

        const tokenPayload = validateToken(authParts[1])
        if (!tokenPayload) return NextResponse.json({ success: false, error: 'Token invalide' }, { status: 401 })

        const { locationId } = params

        await prisma.partLocation.delete({
            where: { id: locationId }
        })

        return NextResponse.json({
            success: true,
            message: 'Emplacement supprimé'
        })

    } catch (error) {
        console.error('Error deleting location:', error)
        return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
    }
}
