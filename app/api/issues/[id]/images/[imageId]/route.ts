import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { unlink } from 'fs/promises'
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
  console.log(`[Issues Image Detail API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Issues Image Detail API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Issues Image Detail API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction pour supprimer le fichier physique
const deleteFile = async (filePath: string, issueId: string) => {
  try {
    // Construire le chemin complet du fichier
    const fullPath = join(process.cwd(), filePath)
    await unlink(fullPath)
    logAction('File deleted from disk', 'system', { filePath: fullPath })
  } catch (error) {
    logAction('File deletion failed', 'system', { 
      filePath, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
    // Ne pas faire échouer la suppression en base si le fichier physique n'existe pas
  }
}

// DELETE /api/issues/[id]/images/[imageId] - Supprimer une image
export async function DELETE(request: NextRequest, { params }: { params: { id: string, imageId: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('DELETE Issue Image - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('DELETE Issue Image - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('DELETE Issue Image - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const issueId = params.id
    const imageId = params.imageId

    if (!userId) {
      logAction('DELETE Issue Image - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    if (!issueId || !imageId) {
      logAction('DELETE Issue Image - Missing IDs', userId, { issueId, imageId })
      return NextResponse.json(
        { success: false, error: 'IDs manquants' },
        { status: 400 }
      )
    }

    logAction('DELETE Issue Image', userId, { 
      issueId,
      imageId
    })

    try {
      // Vérifier que l'image existe et appartient à l'utilisateur via le problème
      const existingImage = await prisma.issueImage.findFirst({
        where: {
          id: imageId,
          issueId,
          issue: {
            userId
          }
        }
      })

      if (!existingImage) {
        logAction('DELETE Issue Image - Image not found', userId, { imageId })
        return NextResponse.json(
          { success: false, error: 'Image non trouvée' },
          { status: 404 }
        )
      }

      // Supprimer le fichier physique d'abord
      await deleteFile(existingImage.filePath, issueId)

      // Supprimer l'enregistrement en base de données
      await prisma.issueImage.delete({
        where: {
          id: imageId
        }
      })

      logAction('DELETE Issue Image - Success', userId, { 
        imageId,
        fileName: existingImage.fileName
      })

      return NextResponse.json(
        {
          success: true,
          message: 'Image supprimée avec succès'
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('DELETE Issue Image - Database error', userId, {
        imageId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression de l\'image' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('DELETE Issue Image - Server error', userId, {
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
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Méthode GET non supportée. Utilisez /api/issues/[id]/images' },
    { status: 405 }
  )
}

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Méthode POST non supportée. Utilisez /api/issues/[id]/images' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Méthode PUT non supportée' },
    { status: 405 }
  )
}