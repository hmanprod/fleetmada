import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

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
            return null
        }

        return decoded
    } catch (error) {
        return null
    }
}

// GET /api/parts/manufacturers - Liste des fabricants
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 })
        }

        const token = authHeader.split(' ')[1]
        const tokenPayload = validateToken(token)
        if (!tokenPayload) {
            return NextResponse.json({ success: false, error: 'Token invalide' }, { status: 401 })
        }

        const manufacturers = await prisma.partManufacturer.findMany({
            orderBy: { name: 'asc' }
        })

        return NextResponse.json({
            success: true,
            data: manufacturers
        })
    } catch (error) {
        console.error('[API Manufacturers] GET Error:', error)
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Erreur serveur' }, { status: 500 })
    }
}

// POST /api/parts/manufacturers - Nouveau fabricant
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 })
        }

        const token = authHeader.split(' ')[1]
        const tokenPayload = validateToken(token)
        if (!tokenPayload) {
            return NextResponse.json({ success: false, error: 'Token invalide' }, { status: 401 })
        }

        const body = await request.json()
        const { name, description, website } = body

        if (!name) {
            return NextResponse.json({ success: false, error: 'Le nom est requis' }, { status: 400 })
        }

        const manufacturer = await prisma.partManufacturer.create({
            data: { name, description, website }
        })

        return NextResponse.json({
            success: true,
            data: manufacturer,
            message: 'Fabricant créé avec succès'
        })
    } catch (error) {
        console.error('[API Manufacturers] POST Error:', error)
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Erreur serveur' }, { status: 500 })
    }
}
