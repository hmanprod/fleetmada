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
const InspectionTemplateUpdateSchema = z.object({
  name: z.string().min(1, 'Nom requis').optional(),
  description: z.string().optional().nullable(),
  category: z.string().min(1, 'Catégorie requise').optional(),
  isActive: z.boolean().optional(),
  color: z.string().optional().nullable(),
  enableLocationException: z.boolean().optional(),
  preventStoredPhotos: z.boolean().optional(),
  items: z.array(z.object({
    name: z.string().min(1, 'Nom de l\'élément requis'),
    description: z.string().optional().nullable(),
    category: z.string().min(1, 'Catégorie requise'),
    isRequired: z.boolean().default(false),
    sortOrder: z.number().default(0),
    type: z.enum(['PASS_FAIL', 'NUMERIC', 'TEXT', 'MULTIPLE_CHOICE', 'SIGNATURE', 'PHOTO', 'HEADER', 'DATE_TIME', 'METER']).default('PASS_FAIL'),
    options: z.array(z.string()).default([]),
    unit: z.string().optional().nullable(),
    instructions: z.string().optional().nullable(),
    shortDescription: z.string().optional().nullable(),
    passLabel: z.string().default('Pass'),
    failLabel: z.string().default('Fail'),
    requirePhotoOnPass: z.boolean().default(false),
    requirePhotoOnFail: z.boolean().default(false),
    enableNA: z.boolean().default(true),
    dateTimeType: z.string().optional().nullable(),
    minRange: z.number().optional().nullable(),
    maxRange: z.number().optional().nullable(),
    requireSecondaryMeter: z.boolean().default(false),
    canCreateIssue: z.boolean().default(false)
  })).optional()
})

// Types TypeScript
type UpdateInspectionTemplateInput = z.infer<typeof InspectionTemplateUpdateSchema>

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Inspection Template Detail API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Inspection Template Detail API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Inspection Template Detail API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// GET /api/inspection-templates/[id] - Détails d'un template d'inspection
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Inspection Template Detail - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Inspection Template Detail - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Inspection Template Detail - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const templateId = params.id

    if (!userId) {
      logAction('GET Inspection Template Detail - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    if (!templateId) {
      logAction('GET Inspection Template Detail - Missing template ID', userId, {})
      return NextResponse.json(
        { success: false, error: 'ID du modèle d\'inspection manquant' },
        { status: 400 }
      )
    }

    logAction('GET Inspection Template Detail', userId, { templateId })

    try {
      // Récupération du template avec ses éléments
      const template = await prisma.inspectionTemplate.findUnique({
        where: {
          id: templateId
        },
        include: {
          items: {
            orderBy: {
              sortOrder: 'asc'
            }
          },
          _count: {
            select: {
              inspections: true
            }
          }
        }
      })

      if (!template) {
        logAction('GET Inspection Template Detail - Template not found', userId, { templateId })
        return NextResponse.json(
          { success: false, error: 'Modèle d\'inspection non trouvé' },
          { status: 404 }
        )
      }

      logAction('GET Inspection Template Detail - Success', userId, {
        templateId,
        itemsCount: template.items.length
      })

      return NextResponse.json(
        {
          success: true,
          data: template
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('GET Inspection Template Detail - Database error', userId, {
        templateId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération du modèle d\'inspection' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Inspection Template Detail - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// PUT /api/inspection-templates/[id] - Modification d'un template d'inspection
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('PUT Inspection Template - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('PUT Inspection Template - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('PUT Inspection Template - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const templateId = params.id

    if (!userId) {
      logAction('PUT Inspection Template - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    if (!templateId) {
      logAction('PUT Inspection Template - Missing template ID', userId, {})
      return NextResponse.json(
        { success: false, error: 'ID du modèle d\'inspection manquant' },
        { status: 400 }
      )
    }

    // Extraction et validation des données
    const body = await request.json()
    const updateData = InspectionTemplateUpdateSchema.parse(body)

    logAction('PUT Inspection Template', userId, {
      templateId,
      updateFields: Object.keys(updateData)
    })

    try {
      // Vérifier que le template existe
      const existingTemplate = await prisma.inspectionTemplate.findUnique({
        where: {
          id: templateId
        }
      })

      if (!existingTemplate) {
        logAction('PUT Inspection Template - Template not found', userId, { templateId })
        return NextResponse.json(
          { success: false, error: 'Modèle d\'inspection non trouvé' },
          { status: 404 }
        )
      }

      // Vérifier l'unicité du nom si modifié
      if (updateData.name && updateData.name !== existingTemplate.name) {
        const duplicateTemplate = await prisma.inspectionTemplate.findFirst({
          where: {
            name: updateData.name,
            id: { not: templateId },
            isActive: true
          }
        })

        if (duplicateTemplate) {
          logAction('PUT Inspection Template - Template name already exists', userId, {
            name: updateData.name
          })

          return NextResponse.json(
            { success: false, error: 'Un modèle d\'inspection avec ce nom existe déjà' },
            { status: 409 }
          )
        }
      }

      // Mise à jour du template
      const updatedTemplate = await prisma.$transaction(async (tx) => {
        // Mettre à jour les champs de base
        const { items, ...baseData } = updateData;

        const template = await tx.inspectionTemplate.update({
          where: { id: templateId },
          data: {
            ...baseData,
            updatedAt: new Date()
          }
        });

        // Si des items sont fournis, on les remplace
        if (items) {
          // Supprimer les items existants
          await tx.inspectionTemplateItem.deleteMany({
            where: { inspectionTemplateId: templateId }
          });

          // Créer les nouveaux items
          await Promise.all(
            items.map((item, index) =>
              tx.inspectionTemplateItem.create({
                data: {
                  inspectionTemplateId: templateId,
                  name: item.name,
                  description: item.description,
                  category: item.category,
                  isRequired: item.isRequired,
                  sortOrder: item.sortOrder || index,
                  type: item.type as any,
                  options: item.options,
                  unit: item.unit,
                  instructions: item.instructions,
                  shortDescription: item.shortDescription,
                  passLabel: item.passLabel,
                  failLabel: item.failLabel,
                  requirePhotoOnPass: item.requirePhotoOnPass,
                  requirePhotoOnFail: item.requirePhotoOnFail,
                  enableNA: item.enableNA,
                  dateTimeType: item.dateTimeType,
                  minRange: item.minRange,
                  maxRange: item.maxRange,
                  requireSecondaryMeter: item.requireSecondaryMeter,
                  canCreateIssue: item.canCreateIssue
                } as any
              })
            )
          );
        }

        return tx.inspectionTemplate.findUnique({
          where: { id: templateId },
          include: {
            items: {
              orderBy: { sortOrder: 'asc' }
            },
            _count: {
              select: { inspections: true }
            }
          }
        });
      });

      logAction('PUT Inspection Template - Success', userId, {
        templateId,
        updatedFields: Object.keys(updateData)
      })

      return NextResponse.json(
        {
          success: true,
          data: updatedTemplate,
          message: 'Modèle d\'inspection modifié avec succès'
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('PUT Inspection Template - Database error', userId, {
        templateId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la modification du modèle d\'inspection' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'

    // Gestion des erreurs de validation
    if (error instanceof Error && error.name === 'ZodError') {
      logAction('PUT Inspection Template - Validation error', userId, {
        error: error.message
      })

      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.message },
        { status: 400 }
      )
    }

    logAction('PUT Inspection Template - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// DELETE /api/inspection-templates/[id] - Suppression d'un template d'inspection
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('DELETE Inspection Template - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('DELETE Inspection Template - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('DELETE Inspection Template - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const templateId = params.id

    if (!userId) {
      logAction('DELETE Inspection Template - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    if (!templateId) {
      logAction('DELETE Inspection Template - Missing template ID', userId, {})
      return NextResponse.json(
        { success: false, error: 'ID du modèle d\'inspection manquant' },
        { status: 400 }
      )
    }

    logAction('DELETE Inspection Template', userId, { templateId })

    try {
      // Vérifier que le template existe
      const existingTemplate = await prisma.inspectionTemplate.findUnique({
        where: {
          id: templateId
        },
        include: {
          _count: {
            select: {
              inspections: true
            }
          }
        }
      })

      if (!existingTemplate) {
        logAction('DELETE Inspection Template - Template not found', userId, { templateId })
        return NextResponse.json(
          { success: false, error: 'Modèle d\'inspection non trouvé' },
          { status: 404 }
        )
      }

      // Vérifier si le template est utilisé par des inspections
      if (existingTemplate._count.inspections > 0) {
        logAction('DELETE Inspection Template - Template in use', userId, {
          templateId,
          inspectionsCount: existingTemplate._count.inspections
        })
        return NextResponse.json(
          { success: false, error: 'Impossible de supprimer un modèle d\'inspection utilisé par des inspections' },
          { status: 400 }
        )
      }

      // Suppression du template (cascade supprimera les éléments)
      await prisma.inspectionTemplate.delete({
        where: {
          id: templateId
        }
      })

      logAction('DELETE Inspection Template - Success', userId, { templateId })

      return NextResponse.json(
        {
          success: true,
          message: 'Modèle d\'inspection supprimé avec succès'
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('DELETE Inspection Template - Database error', userId, {
        templateId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression du modèle d\'inspection' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('DELETE Inspection Template - Server error', userId, {
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
export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Méthode POST non supportée' },
    { status: 405 }
  )
}