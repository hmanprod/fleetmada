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

// PUT /api/parts/manufacturers/[id] - Mettre à jour un fabricant
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const { id } = params
        const body = await request.json()
        const { name, description, website } = body

        const manufacturer = await prisma.partManufacturer.update({
            where: { id },
            data: { name, description, website }
        })

        return NextResponse.json({
            success: true,
            data: manufacturer,
            message: 'Fabricant mis à jour avec succès'
        })
    } catch (error) {
        console.error('[API Manufacturers] PUT Error:', error)
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Erreur serveur' }, { status: 500 })
    }
}

// DELETE /api/parts/manufacturers/[id] - Supprimer un fabricant
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const { id } = params

        await prisma.partManufacturer.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            message: 'Fabricant supprimé avec succès'
        })
    } catch (error) {
        console.error('[API Manufacturers] DELETE Error:', error)
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Erreur serveur' }, { status: 500 })
    }
}
