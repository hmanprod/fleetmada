import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import jwt from 'jsonwebtoken'

// Interface pour les données du token JWT décodé
interface TokenPayload {
    userId: string
    email: string
    type: string
    iat: number
    exp?: number
}

// Schéma de validation pour la mise à jour
const CommentUpdateSchema = z.object({
    content: z.string().min(1, 'Le contenu est requis')
})

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
    console.log(`[Service Entry Comments API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
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

// Vérification de l'accès à l'entrée de service
async function checkServiceEntryAccess(serviceEntryId: string, userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true }
    })

    const serviceEntry = await prisma.serviceEntry.findFirst({
        where: {
            id: serviceEntryId,
            OR: [
                { userId: userId },
                {
                    vehicle: {
                        user: {
                            companyId: user?.companyId
                        }
                    }
                }
            ]
        }
    })

    return serviceEntry !== null
}

// PUT /api/service/entries/[id]/comments/[commentId] - Modifier un commentaire
export async function PUT(request: NextRequest, { params }: { params: { id: string; commentId: string } }) {
    try {
        const authHeader = request.headers.get('authorization')

        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: 'Token d\'authentification manquant' },
                { status: 401 }
            )
        }

        const parts = authHeader.split(' ')
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return NextResponse.json(
                { success: false, error: 'Format de token invalide' },
                { status: 401 }
            )
        }

        const token = parts[1]
        const tokenPayload = validateToken(token)

        if (!tokenPayload) {
            return NextResponse.json(
                { success: false, error: 'Token invalide ou expiré' },
                { status: 401 }
            )
        }

        const userId = tokenPayload.userId
        const serviceEntryId = params.id
        const commentId = params.commentId

        // Vérifier l'accès à l'entrée de service
        const hasAccess = await checkServiceEntryAccess(serviceEntryId, userId)
        if (!hasAccess) {
            return NextResponse.json(
                { success: false, error: 'Entrée de service non trouvée ou accès refusé' },
                { status: 404 }
            )
        }

        // Vérifier que le commentaire existe
        const existingComment = await prisma.comment.findFirst({
            where: {
                id: commentId,
                entityType: 'serviceEntry',
                entityId: serviceEntryId
            }
        })

        if (!existingComment) {
            return NextResponse.json(
                { success: false, error: 'Commentaire non trouvé' },
                { status: 404 }
            )
        }

        const body = await request.json()
        const updateData = CommentUpdateSchema.parse(body)

        const updatedComment = await prisma.comment.update({
            where: { id: commentId },
            data: {
                content: updateData.content,
                updatedAt: new Date()
            }
        })

        logAction('PUT Service Entry Comment - Success', userId, {
            serviceEntryId,
            commentId
        })

        return NextResponse.json(updatedComment, { status: 200 })

    } catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { success: false, error: 'Données invalides', details: error.message },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { success: false, error: 'Erreur serveur interne' },
            { status: 500 }
        )
    }
}

// DELETE /api/service/entries/[id]/comments/[commentId] - Supprimer un commentaire
export async function DELETE(request: NextRequest, { params }: { params: { id: string; commentId: string } }) {
    try {
        const authHeader = request.headers.get('authorization')

        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: 'Token d\'authentification manquant' },
                { status: 401 }
            )
        }

        const parts = authHeader.split(' ')
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return NextResponse.json(
                { success: false, error: 'Format de token invalide' },
                { status: 401 }
            )
        }

        const token = parts[1]
        const tokenPayload = validateToken(token)

        if (!tokenPayload) {
            return NextResponse.json(
                { success: false, error: 'Token invalide ou expiré' },
                { status: 401 }
            )
        }

        const userId = tokenPayload.userId
        const serviceEntryId = params.id
        const commentId = params.commentId

        // Vérifier l'accès à l'entrée de service
        const hasAccess = await checkServiceEntryAccess(serviceEntryId, userId)
        if (!hasAccess) {
            return NextResponse.json(
                { success: false, error: 'Entrée de service non trouvée ou accès refusé' },
                { status: 404 }
            )
        }

        // Vérifier que le commentaire existe
        const existingComment = await prisma.comment.findFirst({
            where: {
                id: commentId,
                entityType: 'serviceEntry',
                entityId: serviceEntryId
            }
        })

        if (!existingComment) {
            return NextResponse.json(
                { success: false, error: 'Commentaire non trouvé' },
                { status: 404 }
            )
        }

        await prisma.comment.delete({
            where: { id: commentId }
        })

        logAction('DELETE Service Entry Comment - Success', userId, {
            serviceEntryId,
            commentId
        })

        return NextResponse.json(
            { success: true, message: 'Commentaire supprimé avec succès' },
            { status: 200 }
        )

    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Erreur serveur interne' },
            { status: 500 }
        )
    }
}
