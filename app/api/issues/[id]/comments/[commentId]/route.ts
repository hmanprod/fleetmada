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

// Schéma de validation
const CommentUpdateSchema = z.object({
  content: z.string().min(1, 'Le contenu est requis')
})

// Types TypeScript
type UpdateCommentInput = z.infer<typeof CommentUpdateSchema>

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Issues Comment Detail API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Issues Comment Detail API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Issues Comment Detail API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// PUT /api/issues/[id]/comments/[commentId] - Modifier un commentaire
export async function PUT(request: NextRequest, { params }: { params: { id: string, commentId: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('PUT Issue Comment - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('PUT Issue Comment - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('PUT Issue Comment - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const issueId = params.id
    const commentId = params.commentId

    if (!userId) {
      logAction('PUT Issue Comment - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    if (!issueId || !commentId) {
      logAction('PUT Issue Comment - Missing IDs', userId, { issueId, commentId })
      return NextResponse.json(
        { success: false, error: 'IDs manquants' },
        { status: 400 }
      )
    }

    // Extraction et validation des données
    const body = await request.json()
    const updateData = CommentUpdateSchema.parse(body)

    logAction('PUT Issue Comment', userId, { 
      issueId,
      commentId
    })

    try {
      // Vérifier que le commentaire existe et appartient à l'utilisateur via le problème
      const existingComment = await prisma.comment.findFirst({
        where: {
          id: commentId,
          issueId,
          issue: {
            userId
          }
        }
      })

      if (!existingComment) {
        logAction('PUT Issue Comment - Comment not found', userId, { commentId })
        return NextResponse.json(
          { success: false, error: 'Commentaire non trouvé' },
          { status: 404 }
        )
      }

      // Mise à jour du commentaire
      const updatedComment = await prisma.comment.update({
        where: {
          id: commentId
        },
        data: {
          content: updateData.content
        }
      })

      logAction('PUT Issue Comment - Success', userId, { 
        commentId
      })

      return NextResponse.json(
        {
          success: true,
          data: updatedComment,
          message: 'Commentaire modifié avec succès'
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('PUT Issue Comment - Database error', userId, {
        commentId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la modification du commentaire' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    
    // Gestion des erreurs de validation
    if (error instanceof Error && error.name === 'ZodError') {
      logAction('PUT Issue Comment - Validation error', userId, {
        error: error.message
      })

      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.message },
        { status: 400 }
      )
    }

    logAction('PUT Issue Comment - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// DELETE /api/issues/[id]/comments/[commentId] - Supprimer un commentaire
export async function DELETE(request: NextRequest, { params }: { params: { id: string, commentId: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('DELETE Issue Comment - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('DELETE Issue Comment - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('DELETE Issue Comment - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const issueId = params.id
    const commentId = params.commentId

    if (!userId) {
      logAction('DELETE Issue Comment - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    if (!issueId || !commentId) {
      logAction('DELETE Issue Comment - Missing IDs', userId, { issueId, commentId })
      return NextResponse.json(
        { success: false, error: 'IDs manquants' },
        { status: 400 }
      )
    }

    logAction('DELETE Issue Comment', userId, { 
      issueId,
      commentId
    })

    try {
      // Vérifier que le commentaire existe et appartient à l'utilisateur via le problème
      const existingComment = await prisma.comment.findFirst({
        where: {
          id: commentId,
          issueId,
          issue: {
            userId
          }
        }
      })

      if (!existingComment) {
        logAction('DELETE Issue Comment - Comment not found', userId, { commentId })
        return NextResponse.json(
          { success: false, error: 'Commentaire non trouvé' },
          { status: 404 }
        )
      }

      // Suppression du commentaire
      await prisma.comment.delete({
        where: {
          id: commentId
        }
      })

      logAction('DELETE Issue Comment - Success', userId, { 
        commentId
      })

      return NextResponse.json(
        {
          success: true,
          message: 'Commentaire supprimé avec succès'
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('DELETE Issue Comment - Database error', userId, {
        commentId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression du commentaire' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('DELETE Issue Comment - Server error', userId, {
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
    { success: false, error: 'Méthode GET non supportée. Utilisez /api/issues/[id]/comments' },
    { status: 405 }
  )
}

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Méthode POST non supportée. Utilisez /api/issues/[id]/comments' },
    { status: 405 }
  )
}