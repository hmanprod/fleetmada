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
  console.log(`[Inspection Start API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Inspection Start API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Inspection Start API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// POST /api/inspections/[id]/start - Démarrer une inspection
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('START - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('START - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('START - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const inspectionId = params.id

    if (!userId) {
      logAction('START - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    if (!inspectionId) {
      logAction('START - Missing inspection ID', userId, {})
      return NextResponse.json(
        { success: false, error: 'ID de l\'inspection manquant' },
        { status: 400 }
      )
    }

    logAction('START', userId, { inspectionId })

    try {
      // Vérifier que l'inspection existe et appartient à l'utilisateur
      const inspection = await prisma.inspection.findFirst({
        where: {
          id: inspectionId,
          userId
        },
        include: {
          inspectionTemplate: {
            include: {
              items: {
                orderBy: {
                  sortOrder: 'asc'
                }
              }
            }
          }
        }
      })

      if (!inspection) {
        logAction('START - Inspection not found', userId, { inspectionId })
        return NextResponse.json(
          { success: false, error: 'Inspection non trouvée' },
          { status: 404 }
        )
      }

      // Vérifier que l'inspection peut être démarrée
      if (inspection.status === 'IN_PROGRESS') {
        logAction('START - Inspection already in progress', userId, { inspectionId })
        return NextResponse.json(
          { success: false, error: 'L\'inspection est déjà en cours' },
          { status: 400 }
        )
      }

      if (inspection.status === 'COMPLETED') {
        logAction('START - Cannot start completed inspection', userId, { inspectionId })
        return NextResponse.json(
          { success: false, error: 'Impossible de redémarrer une inspection complétée' },
          { status: 400 }
        )
      }

      // Démarrer l'inspection en transaction
      const startedInspection = await prisma.$transaction(async (tx) => {
        // Créer les éléments d'inspection à partir du template
        if (inspection.inspectionTemplate && inspection.inspectionTemplate.items.length > 0) {
          // Supprimer les éléments existants (s'il y en a)
          await tx.inspectionItem.deleteMany({
            where: { inspectionId }
          })

          // Créer les nouveaux éléments d'inspection
          await Promise.all(
            inspection.inspectionTemplate!.items.map((templateItem, index) =>
              tx.inspectionItem.create({
                data: {
                  inspectionId,
                  templateItemId: templateItem.id,
                  name: templateItem.name,
                  description: templateItem.description,
                  category: templateItem.category,
                  status: 'PENDING',
                  sortOrder: index,
                  isRequired: templateItem.isRequired
                }
              })
            )
          )
        }

        // Mettre à jour l'inspection
        const updatedInspection = await tx.inspection.update({
          where: { id: inspectionId },
          data: {
            status: 'IN_PROGRESS',
            startedAt: new Date(),
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

      logAction('START - Success', userId, { 
        inspectionId,
        templateItems: inspection.inspectionTemplate?.items.length || 0
      })

      return NextResponse.json(
        {
          success: true,
          data: startedInspection,
          message: 'Inspection démarrée avec succès'
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('START - Database error', userId, {
        inspectionId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors du démarrage de l\'inspection' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('START - Server error', userId, {
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
    { success: false, error: 'Méthode GET non supportée. Utilisez POST pour démarrer l\'inspection' },
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
