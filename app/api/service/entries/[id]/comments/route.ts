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

// Schémas de validation
const CommentCreateSchema = z.object({
    author: z.string().min(1, 'L\'auteur est requis'),
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
            console.log('[Service Entry Comments API] Token type invalide:', decoded.type)
            return null
        }

        return decoded
    } catch (error) {
        console.log('[Service Entry Comments API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
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

// GET /api/service/entries/[id]/comments - Liste des commentaires d'une entrée de service
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authHeader = request.headers.get('authorization')

        if (!authHeader) {
            logAction('GET Service Entry Comments - Missing authorization header', 'unknown', {})
            return NextResponse.json(
                { success: false, error: 'Token d\'authentification manquant' },
                { status: 401 }
            )
        }

        const parts = authHeader.split(' ')
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            logAction('GET Service Entry Comments - Invalid authorization header format', 'unknown', {})
            return NextResponse.json(
                { success: false, error: 'Format de token invalide' },
                { status: 401 }
            )
        }

        const token = parts[1]
        const tokenPayload = validateToken(token)

        if (!tokenPayload) {
            logAction('GET Service Entry Comments - Invalid token', 'unknown', {})
            return NextResponse.json(
                { success: false, error: 'Token invalide ou expiré' },
                { status: 401 }
            )
        }

        const userId = tokenPayload.userId
        const serviceEntryId = params.id

        if (!userId) {
            logAction('GET Service Entry Comments - Missing user ID in token', 'unknown', {})
            return NextResponse.json(
                { success: false, error: 'ID utilisateur manquant' },
                { status: 401 }
            )
        }

        if (!serviceEntryId) {
            logAction('GET Service Entry Comments - Missing service entry ID', userId, {})
            return NextResponse.json(
                { success: false, error: 'ID de l\'entrée de service manquant' },
                { status: 400 }
            )
        }

        logAction('GET Service Entry Comments', userId, { serviceEntryId })

        // Vérifier l'accès à l'entrée de service
        const hasAccess = await checkServiceEntryAccess(serviceEntryId, userId)
        if (!hasAccess) {
            logAction('GET Service Entry Comments - Access denied', userId, { serviceEntryId })
            return NextResponse.json(
                { success: false, error: 'Entrée de service non trouvée ou accès refusé' },
                { status: 404 }
            )
        }

        // Récupération des commentaires triés par date de création
        const comments = await prisma.comment.findMany({
            where: {
                entityType: 'serviceEntry',
                entityId: serviceEntryId
            },
            orderBy: {
                createdAt: 'asc'
            }
        })

        logAction('GET Service Entry Comments - Success', userId, {
            serviceEntryId,
            commentsCount: comments.length
        })

        return NextResponse.json(comments, { status: 200 })

    } catch (error) {
        const userId = request.headers.get('x-user-id') || 'unknown'
        logAction('GET Service Entry Comments - Server error', userId, {
            error: error instanceof Error ? error.message : 'Unknown server error',
            stack: error instanceof Error ? error.stack : undefined
        })

        return NextResponse.json(
            { success: false, error: 'Erreur serveur interne' },
            { status: 500 }
        )
    }
}

// POST /api/service/entries/[id]/comments - Ajouter un commentaire
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authHeader = request.headers.get('authorization')

        if (!authHeader) {
            logAction('POST Service Entry Comment - Missing authorization header', 'unknown', {})
            return NextResponse.json(
                { success: false, error: 'Token d\'authentification manquant' },
                { status: 401 }
            )
        }

        const parts = authHeader.split(' ')
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            logAction('POST Service Entry Comment - Invalid authorization header format', 'unknown', {})
            return NextResponse.json(
                { success: false, error: 'Format de token invalide' },
                { status: 401 }
            )
        }

        const token = parts[1]
        const tokenPayload = validateToken(token)

        if (!tokenPayload) {
            logAction('POST Service Entry Comment - Invalid token', 'unknown', {})
            return NextResponse.json(
                { success: false, error: 'Token invalide ou expiré' },
                { status: 401 }
            )
        }

        const userId = tokenPayload.userId
        const serviceEntryId = params.id

        if (!userId) {
            logAction('POST Service Entry Comment - Missing user ID in token', 'unknown', {})
            return NextResponse.json(
                { success: false, error: 'ID utilisateur manquant' },
                { status: 401 }
            )
        }

        if (!serviceEntryId) {
            logAction('POST Service Entry Comment - Missing service entry ID', userId, {})
            return NextResponse.json(
                { success: false, error: 'ID de l\'entrée de service manquant' },
                { status: 400 }
            )
        }

        // Vérifier l'accès à l'entrée de service
        const hasAccess = await checkServiceEntryAccess(serviceEntryId, userId)
        if (!hasAccess) {
            logAction('POST Service Entry Comment - Access denied', userId, { serviceEntryId })
            return NextResponse.json(
                { success: false, error: 'Entrée de service non trouvée ou accès refusé' },
                { status: 404 }
            )
        }

        // Extraction et validation des données
        const body = await request.json()
        const commentData = CommentCreateSchema.parse(body)

        logAction('POST Service Entry Comment', userId, {
            serviceEntryId,
            author: commentData.author
        })

        // Création du commentaire
        const newComment = await prisma.comment.create({
            data: {
                entityType: 'serviceEntry',
                entityId: serviceEntryId,
                author: commentData.author,
                content: commentData.content,
                userId: userId
            }
        })

        logAction('POST Service Entry Comment - Success', userId, {
            serviceEntryId,
            commentId: newComment.id
        })

        return NextResponse.json(newComment, { status: 201 })

    } catch (error) {
        const userId = request.headers.get('x-user-id') || 'unknown'

        // Gestion des erreurs de validation
        if (error instanceof Error && error.name === 'ZodError') {
            logAction('POST Service Entry Comment - Validation error', userId, {
                error: error.message
            })

            return NextResponse.json(
                { success: false, error: 'Données invalides', details: error.message },
                { status: 400 }
            )
        }

        logAction('POST Service Entry Comment - Server error', userId, {
            error: error instanceof Error ? error.message : 'Unknown server error',
            stack: error instanceof Error ? error.stack : undefined
        })

        return NextResponse.json(
            { success: false, error: 'Erreur serveur interne' },
            { status: 500 }
        )
    }
}
