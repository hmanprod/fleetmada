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

// PUT /api/parts/categories/[id] - Mettre à jour une catégorie
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

        const body = await request.json()
        const { name, description } = body

        if (!name) {
            return NextResponse.json({ success: false, error: 'Le nom est requis' }, { status: 400 })
        }

        // Si on change le nom, on doit aussi mettre à jour les pièces qui utilisaient l'ancien nom
        // car le schéma actuel utilise une chaîne de caractères simple dans le modèle Part.
        const oldCategory = await prisma.partCategory.findUnique({
            where: { id: params.id }
        })

        if (!oldCategory) {
            return NextResponse.json({ success: false, error: 'Catégorie non trouvée' }, { status: 404 })
        }

        const category = await prisma.partCategory.update({
            where: { id: params.id },
            data: { name, description }
        })

        if (oldCategory.name !== name) {
            await prisma.part.updateMany({
                where: { category: oldCategory.name },
                data: { category: name }
            })
        }

        return NextResponse.json({
            success: true,
            data: category,
            message: 'Catégorie mise à jour avec succès'
        })
    } catch (error) {
        console.error('[Categories API] PUT Error:', error)
        return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
    }
}

// DELETE /api/parts/categories/[id] - Supprimer une catégorie
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

        const category = await prisma.partCategory.delete({
            where: { id: params.id }
        })

        return NextResponse.json({
            success: true,
            data: category,
            message: 'Catégorie supprimée avec succès'
        })
    } catch (error) {
        console.error('[Categories API] DELETE Error:', error)
        return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
    }
}
