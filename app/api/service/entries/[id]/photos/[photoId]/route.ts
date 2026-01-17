import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { unlink } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

// Interface pour les données du token JWT décodé
interface TokenPayload {
    userId: string
    email: string
    type: string
    iat: number
    exp?: number
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
    console.log(`[Service Entry Photos API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
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

// DELETE /api/service/entries/[id]/photos/[photoId] - Supprimer une photo
export async function DELETE(request: NextRequest, { params }: { params: { id: string; photoId: string } }) {
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
        const photoId = params.photoId

        // Vérifier l'accès à l'entrée de service
        const hasAccess = await checkServiceEntryAccess(serviceEntryId, userId)
        if (!hasAccess) {
            return NextResponse.json(
                { success: false, error: 'Entrée de service non trouvée ou accès refusé' },
                { status: 404 }
            )
        }

        // Vérifier que la photo existe
        const existingPhoto = await prisma.photo.findFirst({
            where: {
                id: photoId,
                entityType: 'serviceEntry',
                entityId: serviceEntryId
            }
        })

        if (!existingPhoto) {
            return NextResponse.json(
                { success: false, error: 'Photo non trouvée' },
                { status: 404 }
            )
        }

        // Supprimer le fichier physique
        const fullPath = path.join(process.cwd(), 'public', existingPhoto.filePath)
        if (existsSync(fullPath)) {
            await unlink(fullPath)
        }

        // Supprimer l'entrée de la base de données
        await prisma.photo.delete({
            where: { id: photoId }
        })

        logAction('DELETE Service Entry Photo - Success', userId, {
            serviceEntryId,
            photoId
        })

        return NextResponse.json(
            { success: true, message: 'Photo supprimée avec succès' },
            { status: 200 }
        )

    } catch (error) {
        console.error('Error deleting photo:', error)
        return NextResponse.json(
            { success: false, error: 'Erreur serveur interne' },
            { status: 500 }
        )
    }
}
