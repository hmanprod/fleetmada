import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { writeFile, mkdir } from 'fs/promises'
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

// GET /api/service/entries/[id]/photos - Liste des photos d'une entrée de service
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

        // Vérifier l'accès à l'entrée de service
        const hasAccess = await checkServiceEntryAccess(serviceEntryId, userId)
        if (!hasAccess) {
            return NextResponse.json(
                { success: false, error: 'Entrée de service non trouvée ou accès refusé' },
                { status: 404 }
            )
        }

        // Récupération des photos triées par date de création
        const photos = await prisma.photo.findMany({
            where: {
                entityType: 'serviceEntry',
                entityId: serviceEntryId
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        logAction('GET Service Entry Photos - Success', userId, {
            serviceEntryId,
            photosCount: photos.length
        })

        return NextResponse.json(photos, { status: 200 })

    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Erreur serveur interne' },
            { status: 500 }
        )
    }
}

// POST /api/service/entries/[id]/photos - Upload des photos
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

        // Vérifier l'accès à l'entrée de service
        const hasAccess = await checkServiceEntryAccess(serviceEntryId, userId)
        if (!hasAccess) {
            return NextResponse.json(
                { success: false, error: 'Entrée de service non trouvée ou accès refusé' },
                { status: 404 }
            )
        }

        // Parse the form data
        const formData = await request.formData()
        const files = formData.getAll('photos') as File[]

        if (!files || files.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Aucun fichier fourni' },
                { status: 400 }
            )
        }

        // Créer le répertoire uploads s'il n'existe pas
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'service-entries', serviceEntryId)
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true })
        }

        const uploadedPhotos: any[] = []

        for (const file of files) {
            // Générer un nom de fichier unique
            const timestamp = Date.now()
            const randomStr = Math.random().toString(36).substring(2, 8)
            const extension = path.extname(file.name) || '.jpg'
            const fileName = `${timestamp}-${randomStr}${extension}`
            const filePath = `/uploads/service-entries/${serviceEntryId}/${fileName}`
            const fullPath = path.join(uploadDir, fileName)

            // Écrire le fichier
            const buffer = Buffer.from(await file.arrayBuffer())
            await writeFile(fullPath, buffer)

            // Créer l'entrée dans la base de données
            const photo = await prisma.photo.create({
                data: {
                    entityType: 'serviceEntry',
                    entityId: serviceEntryId,
                    fileName: file.name,
                    filePath: filePath,
                    fileSize: file.size,
                    mimeType: file.type || 'image/jpeg',
                    userId: userId,
                    isPublic: false
                }
            })

            uploadedPhotos.push(photo)
        }

        logAction('POST Service Entry Photos - Success', userId, {
            serviceEntryId,
            uploadedCount: uploadedPhotos.length
        })

        return NextResponse.json({ success: true, data: uploadedPhotos }, { status: 201 })

    } catch (error) {
        console.error('Error uploading photos:', error)
        return NextResponse.json(
            { success: false, error: 'Erreur serveur interne' },
            { status: 500 }
        )
    }
}
