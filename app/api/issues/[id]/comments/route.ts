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

const CommentUpdateSchema = z.object({
  content: z.string().min(1, 'Le contenu est requis')
})

// Types TypeScript
type CreateCommentInput = z.infer<typeof CommentCreateSchema>
type UpdateCommentInput = z.infer<typeof CommentUpdateSchema>

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Issues Comments API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Issues Comments API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Issues Comments API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// GET /api/issues/[id]/comments - Liste des commentaires d'un problème
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Issue Comments - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Issue Comments - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Issue Comments - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const issueId = params.id

    if (!userId) {
      logAction('GET Issue Comments - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    if (!issueId) {
      logAction('GET Issue Comments - Missing issue ID', userId, {})
      return NextResponse.json(
        { success: false, error: 'ID du problème manquant' },
        { status: 400 }
      )
    }

    logAction('GET Issue Comments', userId, { issueId })

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
        logAction('GET Issue Comments - Issue not found', userId, { issueId })
        return NextResponse.json(
          { success: false, error: 'Problème non trouvé' },
          { status: 404 }
        )
      }

      // Récupération des commentaires triés par date de création
      const comments = await prisma.comment.findMany({
        where: {
          issueId
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      logAction('GET Issue Comments - Success', userId, { 
        issueId,
        commentsCount: comments.length
      })

      return NextResponse.json(
        {
          success: true,
          data: comments
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('GET Issue Comments - Database error', userId, {
        issueId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des commentaires' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Issue Comments - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// POST /api/issues/[id]/comments - Ajouter un commentaire
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('POST Issue Comment - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('POST Issue Comment - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('POST Issue Comment - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const issueId = params.id

    if (!userId) {
      logAction('POST Issue Comment - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    if (!issueId) {
      logAction('POST Issue Comment - Missing issue ID', userId, {})
      return NextResponse.json(
        { success: false, error: 'ID du problème manquant' },
        { status: 400 }
      )
    }

    // Extraction et validation des données
    const body = await request.json()
    const commentData = CommentCreateSchema.parse(body)

    logAction('POST Issue Comment', userId, { 
      issueId,
      author: commentData.author
    })

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
        logAction('POST Issue Comment - Issue not found', userId, { issueId })
        return NextResponse.json(
          { success: false, error: 'Problème non trouvé' },
          { status: 404 }
        )
      }

      // Création du commentaire
      const newComment = await prisma.comment.create({
        data: {
          entityType: 'issue',
          entityId: issueId,
          author: commentData.author,
          content: commentData.content
        }
      })

      logAction('POST Issue Comment - Success', userId, { 
        issueId,
        commentId: newComment.id
      })

      return NextResponse.json(
        {
          success: true,
          data: newComment,
          message: 'Commentaire ajouté avec succès'
        },
        { status: 201 }
      )

    } catch (dbError) {
      logAction('POST Issue Comment - Database error', userId, {
        issueId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de l\'ajout du commentaire' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    
    // Gestion des erreurs de validation
    if (error instanceof Error && error.name === 'ZodError') {
      logAction('POST Issue Comment - Validation error', userId, {
        error: error.message
      })

      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.message },
        { status: 400 }
      )
    }

    logAction('POST Issue Comment - Server error', userId, {
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
    { success: false, error: 'Méthode PUT non supportée. Utilisez /api/issues/[id]/comments/[commentId]' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Méthode DELETE non supportée. Utilisez /api/issues/[id]/comments/[commentId]' },
    { status: 405 }
  )
}