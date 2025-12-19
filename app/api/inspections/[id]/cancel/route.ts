import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

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
  console.log(`[Inspection Cancel API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Inspection Cancel API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Inspection Cancel API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// POST /api/inspections/[id]/cancel - Annuler une inspection
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('CANCEL - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('CANCEL - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('CANCEL - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const inspectionId = params.id

    if (!userId) {
      logAction('CANCEL - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    if (!inspectionId) {
      logAction('CANCEL - Missing inspection ID', userId, {})
      return NextResponse.json(
        { success: false, error: 'ID de l\'inspection manquant' },
        { status: 400 }
      )
    }

    logAction('CANCEL', userId, { inspectionId })

    try {
      // Vérifier que l'inspection existe et appartient à l'utilisateur
      const inspection = await prisma.inspection.findFirst({
        where: {
          id: inspectionId,
          userId
        }
      })

      if (!inspection) {
        logAction('CANCEL - Inspection not found', userId, { inspectionId })
        return NextResponse.json(
          { success: false, error: 'Inspection non trouvée' },
          { status: 404 }
        )
      }

      // Vérifier que l'inspection peut être annulée
      if (inspection.status === 'COMPLETED') {
        logAction('CANCEL - Cannot cancel completed inspection', userId, { inspectionId })
        return NextResponse.json(
          { success: false, error: 'Impossible d\'annuler une inspection complétée' },
          { status: 400 }
        )
      }

      if (inspection.status === 'CANCELLED') {
        logAction('CANCEL - Inspection already cancelled', userId, { inspectionId })
        return NextResponse.json(
          { success: false, error: 'L\'inspection est déjà annulée' },
          { status: 400 }
        )
      }

      // Annuler l'inspection en transaction
      const cancelledInspection = await prisma.$transaction(async (tx) => {
        // Supprimer les éléments et résultats d'inspection existants
        await tx.inspectionResult.deleteMany({
          where: { inspectionId }
        })

        await tx.inspectionItem.deleteMany({
          where: { inspectionId }
        })

        // Mettre à jour l'inspection
        const updatedInspection = await tx.inspection.update({
          where: { id: inspectionId },
          data: {
            status: 'CANCELLED',
            complianceStatus: 'PENDING_REVIEW',
            overallScore: null,
            startedAt: null,
            completedAt: null,
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
            inspectionTemplate: {
              select: {
                id: true,
                name: true,
                category: true
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

        return updatedInspection
      })

      logAction('CANCEL - Success', userId, { inspectionId })

      return NextResponse.json(
        {
          success: true,
          data: cancelledInspection,
          message: 'Inspection annulée avec succès'
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('CANCEL - Database error', userId, {
        inspectionId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de l\'annulation de l\'inspection' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('CANCEL - Server error', userId, {
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
    { success: false, error: 'Méthode GET non supportée. Utilisez POST pour annuler l\'inspection' },
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
