import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
    CreateVehicleRenewalSchema,
} from '@/lib/validations/vehicle-validations'
import jwt from 'jsonwebtoken'

interface TokenPayload {
    userId: string
    email: string
    type: string
}

const validateToken = (token: string): TokenPayload | null => {
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
        if (!vehicleId) return NextResponse.json({ success: false, error: 'ID manquant' }, { status: 400 })

        const authHeader = request.headers.get('authorization')
        if (!authHeader) return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 })

        const token = authHeader.split(' ')[1]
        const payload = validateToken(token)
        if (!payload) return NextResponse.json({ success: false, error: 'Token invalide' }, { status: 401 })

        const vehicle = await prisma.vehicle.findFirst({
            where: { id: vehicleId, userId: payload.userId }
        })

        if (!vehicle) return NextResponse.json({ success: false, error: 'Véhicule non trouvé' }, { status: 404 })

        const renewals = await prisma.vehicleRenewal.findMany({
            where: { vehicleId },
            orderBy: { dueDate: 'asc' }
        })

        return NextResponse.json({
            success: true,
            data: renewals
        })

    } catch (error) {
        console.error('GET Renewals Error:', error)
        return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
    }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const vehicleId = params.id
        const authHeader = request.headers.get('authorization')
        if (!authHeader) return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 })

        const token = authHeader.split(' ')[1]
        const payload = validateToken(token)
        if (!payload) return NextResponse.json({ success: false, error: 'Token invalide' }, { status: 401 })

        const body = await request.json()
        const validatedData = CreateVehicleRenewalSchema.parse({ ...body, vehicleId })

        const vehicle = await prisma.vehicle.findFirst({
            where: { id: vehicleId, userId: payload.userId }
        })
        if (!vehicle) return NextResponse.json({ success: false, error: 'Véhicule non trouvé' }, { status: 404 })

        const newRenewal = await prisma.vehicleRenewal.create({
            data: {
                vehicleId: validatedData.vehicleId,
                type: validatedData.type,
                status: validatedData.status,
                dueDate: new Date(validatedData.dueDate),
                cost: validatedData.cost,
                provider: validatedData.provider,
                notes: validatedData.notes
            }
        })

        return NextResponse.json({ success: true, data: newRenewal }, { status: 201 })

    } catch (error) {
        console.error('POST Renewal Error:', error)
        return NextResponse.json({ success: false, error: 'Erreur création' }, { status: 500 })
    }
}
