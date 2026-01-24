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
const IssueAssignSchema = z.object({
  assignedTo: z.string().min(1, 'Utilisateur assigné requis')
})

// Types TypeScript
type IssueAssignInput = z.infer<typeof IssueAssignSchema>

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Issues Assign API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Issues Assign API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Issues Assign API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// POST /api/issues/[id]/assign - Assigner un problème à un utilisateur
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('POST Issue Assign - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('POST Issue Assign - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('POST Issue Assign - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const issueId = params.id

    if (!userId) {
      logAction('POST Issue Assign - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    if (!issueId) {
      logAction('POST Issue Assign - Missing issue ID', userId, {})
      return NextResponse.json(
        { success: false, error: 'ID du problème manquant' },
        { status: 400 }
      )
    }

    // Extraction et validation des données
    const body = await request.json()
    const assignData = IssueAssignSchema.parse(body)

    logAction('POST Issue Assign', userId, {
      issueId,
      assignedTo: assignData.assignedTo
    })

    try {
      // Vérifier que le problème existe et appartient à l'utilisateur
      const existingIssue = await prisma.issue.findFirst({
        where: {
          id: issueId,
          userId
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      if (!existingIssue) {
        logAction('POST Issue Assign - Issue not found', userId, { issueId })
        return NextResponse.json(
          { success: false, error: 'Problème non trouvé' },
          { status: 404 }
        )
      }

      // Vérifier que l'utilisateur assigné existe (optionnel - peut être un nom plutôt qu'un ID)
      let assignedUser: { id: string; name: string; email: string } | null = null
      if (assignData.assignedTo) {
        assignedUser = await prisma.user.findUnique({
          where: {
            id: assignData.assignedTo
          },
          select: {
            id: true,
            name: true,
            email: true
          }
        })
      }

      // Mise à jour de l'assignation
      const updatedIssue = await prisma.issue.update({
        where: {
          id: issueId
        },
        data: {
          assignedTo: [assignData.assignedTo],
          updatedAt: new Date(),
          // Si le problème était OPEN et qu'on l'assigne, on peut changer le statut à IN_PROGRESS
          status: existingIssue.status === 'OPEN' ? 'IN_PROGRESS' : existingIssue.status
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

      logAction('POST Issue Assign - Success', userId, {
        issueId,
        assignedTo: assignData.assignedTo,
        assignedUser: assignedUser ? assignedUser.name : 'Unknown user',
        statusChanged: existingIssue.status !== updatedIssue.status
      })

      return NextResponse.json(
        {
          success: true,
          data: updatedIssue,
          message: assignedUser
            ? `Problème assigné à ${assignedUser.name}`
            : `Problème assigné à ${assignData.assignedTo}`
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('POST Issue Assign - Database error', userId, {
        issueId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de l\'assignation du problème' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'

    // Gestion des erreurs de validation
    if (error instanceof Error && error.name === 'ZodError') {
      logAction('POST Issue Assign - Validation error', userId, {
        error: error.message
      })

      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.message },
        { status: 400 }
      )
    }

    logAction('POST Issue Assign - Server error', userId, {
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
    { success: false, error: 'Méthode GET non supportée' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Méthode PUT non supportée' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Méthode DELETE non supportée' },
    { status: 405 }
  )
}