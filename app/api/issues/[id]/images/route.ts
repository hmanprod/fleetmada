import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

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
  console.log(`[Issues Images API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Issues Images API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Issues Images API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction pour sauvegarder le fichier
const saveFile = async (file: File, issueId: string): Promise<{ fileName: string, filePath: string, fileSize: number, mimeType: string }> => {
  const uploadsDir = join(process.cwd(), 'uploads', 'issues', issueId)
  
  // Créer le dossier s'il n'existe pas
  await mkdir(uploadsDir, { recursive: true })
  
  const timestamp = Date.now()
  const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const fileName = `${timestamp}_${originalName}`
  const filePath = join(uploadsDir, fileName)
  
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  
  await writeFile(filePath, buffer)
  
  return {
    fileName,
    filePath: `/uploads/issues/${issueId}/${fileName}`,
    fileSize: buffer.length,
    mimeType: file.type
  }
}

// GET /api/issues/[id]/images - Liste des images d'un problème
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Issue Images - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Issue Images - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Issue Images - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const issueId = params.id

    if (!userId) {
      logAction('GET Issue Images - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    if (!issueId) {
      logAction('GET Issue Images - Missing issue ID', userId, {})
      return NextResponse.json(
        { success: false, error: 'ID du problème manquant' },
        { status: 400 }
      )
    }

    logAction('GET Issue Images', userId, { issueId })

    try {
      // Vérifier que le problème existe et appartient à l'utilisateur
      const existingIssue = await prisma.issue.findFirst({
        where: {
          id: issueId,
          userId
        },
        select: {
          id: true
        }
      })

      if (!existingIssue) {
        logAction('GET Issue Images - Issue not found', userId, { issueId })
        return NextResponse.json(
          { success: false, error: 'Problème non trouvé' },
          { status: 404 }
        )
      }

      // Récupération des images triées par date de création
      const images = await prisma.issueImage.findMany({
        where: {
          issueId
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      logAction('GET Issue Images - Success', userId, { 
        issueId,
        imagesCount: images.length
      })

      return NextResponse.json(
        {
          success: true,
          data: images
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('GET Issue Images - Database error', userId, {
        issueId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des images' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Issue Images - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// POST /api/issues/[id]/images - Upload d'images
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('POST Issue Images - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('POST Issue Images - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('POST Issue Images - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const issueId = params.id

    if (!userId) {
      logAction('POST Issue Images - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    if (!issueId) {
      logAction('POST Issue Images - Missing issue ID', userId, {})
      return NextResponse.json(
        { success: false, error: 'ID du problème manquant' },
        { status: 400 }
      )
    }

    logAction('POST Issue Images', userId, { issueId })

    try {
      // Vérifier que le problème existe et appartient à l'utilisateur
      const existingIssue = await prisma.issue.findFirst({
        where: {
          id: issueId,
          userId
        },
        select: {
          id: true
        }
      })

      if (!existingIssue) {
        logAction('POST Issue Images - Issue not found', userId, { issueId })
        return NextResponse.json(
          { success: false, error: 'Problème non trouvé' },
          { status: 404 }
        )
      }

      // Extraction des fichiers du FormData
      const formData = await request.formData()
      const files = formData.getAll('images') as File[]

      if (!files || files.length === 0) {
        logAction('POST Issue Images - No files provided', userId, {})
        return NextResponse.json(
          { success: false, error: 'Aucune image fournie' },
          { status: 400 }
        )
      }

      // Validation des types de fichiers
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      const maxFileSize = 10 * 1024 * 1024 // 10MB

      const uploadedImages: any[] = []

      for (const file of files) {
        // Vérification du type de fichier
        if (!allowedTypes.includes(file.type)) {
          logAction('POST Issue Images - Invalid file type', userId, {
            fileName: file.name,
            mimeType: file.type
          })
          return NextResponse.json(
            { success: false, error: `Type de fichier non supporté: ${file.type}` },
            { status: 400 }
          )
        }

        // Vérification de la taille du fichier
        if (file.size > maxFileSize) {
          logAction('POST Issue Images - File too large', userId, {
            fileName: file.name,
            size: file.size
          })
          return NextResponse.json(
            { success: false, error: `Fichier trop volumineux: ${file.name} (max 10MB)` },
            { status: 400 }
          )
        }

        try {
          // Sauvegarde du fichier
          const { fileName, filePath, fileSize, mimeType } = await saveFile(file, issueId)

          // Enregistrement en base de données
          const imageRecord = await prisma.issueImage.create({
            data: {
              issueId,
              fileName,
              filePath,
              fileSize,
              mimeType
            }
          })

          uploadedImages.push(imageRecord)
          
          logAction('POST Issue Images - File uploaded', userId, {
            fileName,
            fileSize
          })

        } catch (fileError) {
          logAction('POST Issue Images - File save error', userId, {
            fileName: file.name,
            error: fileError instanceof Error ? fileError.message : 'Unknown file error'
          })
          
          return NextResponse.json(
            { success: false, error: `Erreur lors de la sauvegarde de ${file.name}` },
            { status: 500 }
          )
        }
      }

      logAction('POST Issue Images - Success', userId, { 
        issueId,
        uploadedCount: uploadedImages.length
      })

      return NextResponse.json(
        {
          success: true,
          data: uploadedImages,
          message: `${uploadedImages.length} image(s) uploadée(s) avec succès`
        },
        { status: 201 }
      )

    } catch (dbError) {
      logAction('POST Issue Images - Database error', userId, {
        issueId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de l\'enregistrement des images' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('POST Issue Images - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// Gestion des autres méthodes
export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Méthode PUT non supportée. Utilisez /api/issues/[id]/images/[imageId]' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Méthode DELETE non supportée. Utilisez /api/issues/[id]/images/[imageId]' },
    { status: 405 }
  )
}