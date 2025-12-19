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
const InspectionUpdateSchema = z.object({
  title: z.string().min(1, 'Titre requis').optional(),
  description: z.string().optional(),
  scheduledDate: z.string().datetime().optional(),
  inspectorName: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional()
})

// Types TypeScript
type UpdateInspectionInput = z.infer<typeof InspectionUpdateSchema>

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Inspections Detail API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Inspections Detail API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Inspections Detail API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// GET /api/inspections/[id] - Détails d'une inspection
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Inspection Detail - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Inspection Detail - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Inspection Detail - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const inspectionId = params.id

    if (!userId) {
      logAction('GET Inspection Detail - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    if (!inspectionId) {
      logAction('GET Inspection Detail - Missing inspection ID', userId, {})
      return NextResponse.json(
        { success: false, error: 'ID de l\'inspection manquant' },
        { status: 400 }
      )
    }

    logAction('GET Inspection Detail', userId, { inspectionId })

    try {
      // Récupération de l'inspection avec toutes les relations
      const inspection = await prisma.inspection.findFirst({
        where: {
          id: inspectionId,
          userId // Assurer que l'utilisateur ne peut voir que ses propres inspections
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
          inspectionTemplate: {
            include: {
              items: {
                orderBy: {
                  sortOrder: 'asc'
                }
              }
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
          items: {
            orderBy: {
              sortOrder: 'asc'
            },
            include: {
              templateItem: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  category: true,
                  isRequired: true
                }
              }
            }
          },
          results: {
            orderBy: {
              createdAt: 'asc'
            },
            include: {
              inspectionItem: {
                select: {
                  id: true,
                  name: true,
                  category: true
                }
              }
            }
          }
        }
      })

      if (!inspection) {
        logAction('GET Inspection Detail - Inspection not found', userId, { inspectionId })
        return NextResponse.json(
          { success: false, error: 'Inspection non trouvée' },
          { status: 404 }
        )
      }

      logAction('GET Inspection Detail - Success', userId, { 
        inspectionId,
        hasItems: inspection.items.length,
        hasResults: inspection.results.length
      })

      return NextResponse.json(
        {
          success: true,
          data: inspection
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('GET Inspection Detail - Database error', userId, {
        inspectionId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération de l\'inspection' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Inspection Detail - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// PUT /api/inspections/[id] - Modification d'une inspection
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('PUT Inspection - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('PUT Inspection - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('PUT Inspection - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const inspectionId = params.id

    if (!userId) {
      logAction('PUT Inspection - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    if (!inspectionId) {
      logAction('PUT Inspection - Missing inspection ID', userId, {})
      return NextResponse.json(
        { success: false, error: 'ID de l\'inspection manquant' },
        { status: 400 }
      )
    }

    // Extraction et validation des données
    const body = await request.json()
    const updateData = InspectionUpdateSchema.parse(body)

    logAction('PUT Inspection', userId, { 
      inspectionId,
      updateFields: Object.keys(updateData)
    })

    try {
      // Vérifier que l'inspection existe et appartient à l'utilisateur
      const existingInspection = await prisma.inspection.findFirst({
        where: {
          id: inspectionId,
          userId
        }
      })

      if (!existingInspection) {
        logAction('PUT Inspection - Inspection not found', userId, { inspectionId })
        return NextResponse.json(
          { success: false, error: 'Inspection non trouvée' },
          { status: 404 }
        )
      }

      // Préparer les données de mise à jour
      const updateFields: any = { ...updateData, updatedAt: new Date() }
      
      if (updateData.scheduledDate) {
        updateFields.scheduledDate = new Date(updateData.scheduledDate)
      }

      // Mise à jour de l'inspection
      const updatedInspection = await prisma.inspection.update({
        where: {
          id: inspectionId
        },
        data: updateFields,
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

      logAction('PUT Inspection - Success', userId, { 
        inspectionId,
        updatedFields: Object.keys(updateData)
      })

      return NextResponse.json(
        {
          success: true,
          data: updatedInspection,
          message: 'Inspection modifiée avec succès'
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('PUT Inspection - Database error', userId, {
        inspectionId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la modification de l\'inspection' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    
    // Gestion des erreurs de validation
    if (error instanceof Error && error.name === 'ZodError') {
      logAction('PUT Inspection - Validation error', userId, {
        error: error.message
      })

      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.message },
        { status: 400 }
      )
    }

    logAction('PUT Inspection - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// DELETE /api/inspections/[id] - Suppression d'une inspection
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('DELETE Inspection - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('DELETE Inspection - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('DELETE Inspection - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const inspectionId = params.id

    if (!userId) {
      logAction('DELETE Inspection - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    if (!inspectionId) {
      logAction('DELETE Inspection - Missing inspection ID', userId, {})
      return NextResponse.json(
        { success: false, error: 'ID de l\'inspection manquant' },
        { status: 400 }
      )
    }

    logAction('DELETE Inspection', userId, { inspectionId })

    try {
      // Vérifier que l'inspection existe et appartient à l'utilisateur
      const existingInspection = await prisma.inspection.findFirst({
        where: {
          id: inspectionId,
          userId
        }
      })

      if (!existingInspection) {
        logAction('DELETE Inspection - Inspection not found', userId, { inspectionId })
        return NextResponse.json(
          { success: false, error: 'Inspection non trouvée' },
          { status: 404 }
        )
      }

      // Vérifier si l'inspection est en cours ou complétée (empêcher la suppression)
      if (existingInspection.status === 'IN_PROGRESS' || existingInspection.status === 'COMPLETED') {
        logAction('DELETE Inspection - Cannot delete in-progress inspection', userId, { 
          inspectionId,
          status: existingInspection.status
        })
        return NextResponse.json(
          { success: false, error: 'Impossible de supprimer une inspection en cours ou complétée' },
          { status: 400 }
        )
      }

      // Suppression de l'inspection (cascade supprimera les items et results)
      await prisma.inspection.delete({
        where: {
          id: inspectionId
        }
      })

      logAction('DELETE Inspection - Success', userId, { inspectionId })

      return NextResponse.json(
        {
          success: true,
          message: 'Inspection supprimée avec succès'
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('DELETE Inspection - Database error', userId, {
        inspectionId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression de l\'inspection' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('DELETE Inspection - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// POST /api/inspections/[id]/complete - Marquer une inspection comme terminée
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('POST Inspection Complete - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('POST Inspection Complete - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('POST Inspection Complete - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const inspectionId = params.id

    if (!userId) {
      logAction('POST Inspection Complete - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    if (!inspectionId) {
      logAction('POST Inspection Complete - Missing inspection ID', userId, {})
      return NextResponse.json(
        { success: false, error: 'ID de l\'inspection manquant' },
        { status: 400 }
      )
    }

    logAction('POST Inspection Complete', userId, { inspectionId })

    try {
      // Vérifier que l'inspection existe et appartient à l'utilisateur
      const existingInspection = await prisma.inspection.findFirst({
        where: {
          id: inspectionId,
          userId
        },
        include: {
          items: true,
          results: true
        }
      })

      if (!existingInspection) {
        logAction('POST Inspection Complete - Inspection not found', userId, { inspectionId })
        return NextResponse.json(
          { success: false, error: 'Inspection non trouvée' },
          { status: 404 }
        )
      }

      // Vérifier que l'inspection a des résultats
      if (existingInspection.results.length === 0) {
        logAction('POST Inspection Complete - No results found', userId, { inspectionId })
        return NextResponse.json(
          { success: false, error: 'Aucun résultat d\'inspection trouvé' },
          { status: 400 }
        )
      }

      // Calculer le statut de conformité
      const totalResults = existingInspection.results.length
      const compliantResults = existingInspection.results.filter(r => r.isCompliant).length
      const complianceRate = totalResults > 0 ? (compliantResults / totalResults) * 100 : 0

      // Déterminer le statut de conformité global
      let complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING_REVIEW'
      if (complianceRate === 100) {
        complianceStatus = 'COMPLIANT'
      } else if (complianceRate < 70) {
        complianceStatus = 'NON_COMPLIANT'
      } else {
        complianceStatus = 'PENDING_REVIEW'
      }

      // Mettre à jour l'inspection comme complétée
      const updatedInspection = await prisma.inspection.update({
        where: {
          id: inspectionId
        },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          complianceStatus,
          overallScore: Math.round(complianceRate * 100) / 100,
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

      logAction('POST Inspection Complete - Success', userId, { 
        inspectionId,
        complianceRate: Math.round(complianceRate * 100) / 100,
        complianceStatus
      })

      return NextResponse.json(
        {
          success: true,
          data: updatedInspection,
          message: `Inspection complétée avec succès (${Math.round(complianceRate)}% conforme)`
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('POST Inspection Complete - Database error', userId, {
        inspectionId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la complétion de l\'inspection' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('POST Inspection Complete - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}