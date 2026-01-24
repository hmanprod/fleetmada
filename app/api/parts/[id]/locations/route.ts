import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

// Interface pour les données du token JWT décodé
interface TokenPayload {
    userId: string
    email: string
    type: string
    iat: number
    exp?: number
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
    try {
        const secret = process.env.JWT_SECRET || 'fallback-secret-key'
        const decoded = jwt.verify(token, secret) as TokenPayload

        if (decoded.type !== 'login') {
            console.log('[Parts Location API] Token type invalide:', decoded.type)
            return null
        }

        return decoded
    } catch (error) {
        console.log('[Parts Location API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
        return null
    }
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
    console.log(`[Parts Location API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

const createLocationSchema = z.object({
    placeId: z.string().min(1, 'Place ID is required'),
    aisle: z.string().optional(),
    row: z.string().optional(),
    bin: z.string().optional(),
    quantity: z.number().min(0).default(0)
})

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Extraction et validation du token JWT
        const authHeader = request.headers.get('authorization')
        let userId = 'unknown'

        if (authHeader) {
            const authParts = authHeader.split(' ')
            if (authParts.length === 2 && authParts[0] === 'Bearer') {
                const token = authParts[1]
                const tokenPayload = validateToken(token)
                if (tokenPayload) {
                    userId = tokenPayload.userId
                }
            }
        }

        // Note: We might allow unauthenticated access strictly for reading if that was the case elsewhere, 
        // but usually internal APIs are protected. The parts API enforces it. 
        // However, I'll keep it loose for GET if the main parts API allows it? 
        // Checking previous file: It returns 401 if token invalid. 
        // So I will enforce it too.

        if (userId === 'unknown') {
            return NextResponse.json(
                { success: false, error: 'Non autorisé' },
                { status: 401 }
            )
        }

        const partId = params.id

        logAction('GET Part Locations', userId, { partId })

        const locations = await prisma.partLocation.findMany({
            where: { partId },
            include: {
                place: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        const formattedLocations = locations.map(loc => ({
            ...loc,
            placeName: loc.place.name
        }))

        return NextResponse.json({
            success: true,
            data: formattedLocations
        })

    } catch (error) {
        console.error('Error fetching part locations:', error)
        return NextResponse.json(
            { success: false, error: 'Erreur lors de la récupération des emplacements' },
            { status: 500 }
        )
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Extraction et validation du token JWT
        const authHeader = request.headers.get('authorization')

        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: 'Token d\'authentification manquant' },
                { status: 401 }
            )
        }

        const authParts = authHeader.split(' ')
        if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
            return NextResponse.json(
                { success: false, error: 'Format de token invalide' },
                { status: 401 }
            )
        }

        const token = authParts[1]
        const tokenPayload = validateToken(token)

        if (!tokenPayload) {
            return NextResponse.json(
                { success: false, error: 'Token invalide ou expiré' },
                { status: 401 }
            )
        }

        const userId = tokenPayload.userId
        const partId = params.id

        const body = await request.json()
        const validatedData = createLocationSchema.parse(body)

        logAction('POST Part Location', userId, { partId, ...validatedData })

        // Check if location already exists for this part and place
        const existingLocation = await prisma.partLocation.findFirst({
            where: {
                partId,
                placeId: validatedData.placeId
            }
        })

        if (existingLocation) {
            return NextResponse.json(
                { success: false, error: 'Un emplacement pour ce site existe déjà pour cette pièce' },
                { status: 409 }
            )
        }

        const location = await prisma.partLocation.create({
            data: {
                partId,
                ...validatedData
            },
            include: {
                place: {
                    select: { name: true }
                }
            }
        })

        return NextResponse.json({
            success: true,
            data: {
                ...location,
                placeName: location.place.name
            },
            message: 'Emplacement ajouté avec succès'
        }, { status: 201 })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: error.errors },
                { status: 400 }
            )
        }

        console.error('Error adding part location:', error)
        return NextResponse.json(
            { success: false, error: 'Erreur lors de l\'ajout de l\'emplacement' },
            { status: 500 }
        )
    }
}
