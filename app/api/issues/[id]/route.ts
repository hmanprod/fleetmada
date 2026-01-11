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
const IssueUpdateSchema = z.object({
  summary: z.string().min(1, 'Le résumé est requis').optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  labels: z.array(z.string()).optional(),
  assignedTo: z.array(z.string()).optional()
})

const IssueStatusUpdateSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
})

const IssueAssignSchema = z.object({
  assignedTo: z.array(z.string()).min(1, 'Au moins un utilisateur assigné requis')
})

// Types TypeScript
type UpdateIssueInput = z.infer<typeof IssueUpdateSchema>
type IssueStatusUpdateInput = z.infer<typeof IssueStatusUpdateSchema>
type IssueAssignInput = z.infer<typeof IssueAssignSchema>

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Issues Detail API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Issues Detail API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Issues Detail API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// GET /api/issues/[id] - Détails d'un problème
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Issue Detail - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Issue Detail - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Issue Detail - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const issueId = params.id

    if (!userId) {
      logAction('GET Issue Detail - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    if (!issueId) {
      logAction('GET Issue Detail - Missing issue ID', userId, {})
      return NextResponse.json(
        { success: false, error: 'ID du problème manquant' },
        { status: 400 }
      )
    }

    logAction('GET Issue Detail', userId, { issueId })

    try {
      // Récupération du problème avec toutes les relations
      const issue = await prisma.issue.findFirst({
        where: {
          id: issueId,
          userId // Assurer que l'utilisateur ne peut voir que ses propres problèmes
        },
        include: {
          vehicle: {
            select: {
              id: true,
              name: true,
              vin: true,
              make: true,
              model: true,
              year: true,
              type: true,
              status: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          },
          comments: {
            orderBy: {
              createdAt: 'asc'
            },
            include: {
              // Pas de relation User pour les commentaires car ils utilisent un champ author
            }
          },
          images: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      })

      if (!issue) {
        logAction('GET Issue Detail - Issue not found', userId, { issueId })
        return NextResponse.json(
          { success: false, error: 'Problème non trouvé' },
          { status: 404 }
        )
      }

      logAction('GET Issue Detail - Success', userId, {
        issueId,
        hasComments: issue.comments.length,
        hasImages: issue.images.length
      })

      return NextResponse.json(
        {
          success: true,
          data: issue
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('GET Issue Detail - Database error', userId, {
        issueId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération du problème' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Issue Detail - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// PUT /api/issues/[id] - Modification d'un problème
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('PUT Issue - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('PUT Issue - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('PUT Issue - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const issueId = params.id

    if (!userId) {
      logAction('PUT Issue - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    if (!issueId) {
      logAction('PUT Issue - Missing issue ID', userId, {})
      return NextResponse.json(
        { success: false, error: 'ID du problème manquant' },
        { status: 400 }
      )
    }

    // Extraction et validation des données
    const body = await request.json()
    const updateData = IssueUpdateSchema.parse(body)

    logAction('PUT Issue', userId, {
      issueId,
      updateFields: Object.keys(updateData)
    })

    try {
      // Vérifier que le problème existe et appartient à l'utilisateur
      const existingIssue = await prisma.issue.findFirst({
        where: {
          id: issueId,
          userId
        }
      })

      if (!existingIssue) {
        logAction('PUT Issue - Issue not found', userId, { issueId })
        return NextResponse.json(
          { success: false, error: 'Problème non trouvé' },
          { status: 404 }
        )
      }

      // Mise à jour du problème
      const updatedIssue = await prisma.issue.update({
        where: {
          id: issueId
        },
        data: {
          ...updateData,
          updatedAt: new Date()
        },
        include: {
          vehicle: {
            select: {
              id: true,
              name: true,
              vin: true,
              make: true,
              model: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      logAction('PUT Issue - Success', userId, {
        issueId,
        updatedFields: Object.keys(updateData)
      })

      return NextResponse.json(
        {
          success: true,
          data: updatedIssue,
          message: 'Problème modifié avec succès'
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('PUT Issue - Database error', userId, {
        issueId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la modification du problème' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'

    // Gestion des erreurs de validation
    if (error instanceof Error && error.name === 'ZodError') {
      logAction('PUT Issue - Validation error', userId, {
        error: error.message
      })

      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.message },
        { status: 400 }
      )
    }

    logAction('PUT Issue - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// DELETE /api/issues/[id] - Suppression d'un problème
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('DELETE Issue - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('DELETE Issue - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('DELETE Issue - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const issueId = params.id

    if (!userId) {
      logAction('DELETE Issue - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    if (!issueId) {
      logAction('DELETE Issue - Missing issue ID', userId, {})
      return NextResponse.json(
        { success: false, error: 'ID du problème manquant' },
        { status: 400 }
      )
    }

    logAction('DELETE Issue', userId, { issueId })

    try {
      // Vérifier que le problème existe et appartient à l'utilisateur
      const existingIssue = await prisma.issue.findFirst({
        where: {
          id: issueId,
          userId
        }
      })

      if (!existingIssue) {
        logAction('DELETE Issue - Issue not found', userId, { issueId })
        return NextResponse.json(
          { success: false, error: 'Problème non trouvé' },
          { status: 404 }
        )
      }

      // Suppression du problème (cascade supprimera les commentaires et images)
      await prisma.issue.delete({
        where: {
          id: issueId
        }
      })

      logAction('DELETE Issue - Success', userId, { issueId })

      return NextResponse.json(
        {
          success: true,
          message: 'Problème supprimé avec succès'
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('DELETE Issue - Database error', userId, {
        issueId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression du problème' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('DELETE Issue - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}
