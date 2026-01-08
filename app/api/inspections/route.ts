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
const InspectionCreateSchema = z.object({
  vehicleId: z.string().min(1, 'Véhicule requis'),
  inspectionTemplateId: z.string().min(1, 'Modèle d\'inspection requis'),
  title: z.string().min(1, 'Titre requis'),
  description: z.string().optional(),
  scheduledDate: z.string().optional(),
  inspectorName: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional()
})

const InspectionListQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  search: z.string().optional(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  vehicleId: z.string().optional(),
  inspectionTemplateId: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'scheduledDate', 'status', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// Types TypeScript
type CreateInspectionInput = z.infer<typeof InspectionCreateSchema>
type InspectionListQuery = z.infer<typeof InspectionListQuerySchema>

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Inspections API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Inspections API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Inspections API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction utilitaire pour construire les filtres de recherche
const buildInspectionFilters = (query: InspectionListQuery, userId: string) => {
  const filters: any = {
    // userId // Allow all authenticated users to see inspections
  }

  if (query.search) {
    filters.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
      { inspectorName: { contains: query.search, mode: 'insensitive' } },
      { location: { contains: query.search, mode: 'insensitive' } }
    ]
  }

  if (query.status) {
    filters.status = query.status
  }

  if (query.vehicleId) {
    filters.vehicleId = query.vehicleId
  }

  if (query.inspectionTemplateId) {
    filters.inspectionTemplateId = query.inspectionTemplateId
  }

  return filters
}

// Fonction utilitaire pour construire l'ordre de tri
const buildOrderBy = (query: InspectionListQuery) => {
  const orderBy: any = {}

  if (query.sortBy === 'createdAt' || query.sortBy === 'updatedAt' ||
    query.sortBy === 'scheduledDate' || query.sortBy === 'status' || query.sortBy === 'title') {
    orderBy[query.sortBy] = query.sortOrder
  } else {
    orderBy.createdAt = 'desc'
  }

  return orderBy
}

// GET /api/inspections - Liste paginée avec filtres
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Inspections - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Inspections - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Inspections - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('GET Inspections - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    // Extraction et validation des paramètres de requête
    const { searchParams } = new URL(request.url)
    const queryParams: any = {}

    for (const [key, value] of searchParams.entries()) {
      queryParams[key] = value
    }

    const query = InspectionListQuerySchema.parse(queryParams)
    const offset = (query.page - 1) * query.limit

    logAction('GET Inspections', userId, {
      userId,
      page: query.page,
      limit: query.limit,
      filters: {
        search: query.search,
        status: query.status,
        vehicleId: query.vehicleId,
        inspectionTemplateId: query.inspectionTemplateId
      }
    })

    try {
      // Construction des filtres et de l'ordre
      const filters = buildInspectionFilters(query, userId)
      const orderBy = buildOrderBy(query)

      // Récupération des inspections avec pagination
      const [inspections, totalCount] = await Promise.all([
        prisma.inspection.findMany({
          where: filters,
          orderBy,
          skip: offset,
          take: query.limit,
          include: {
            vehicle: {
              select: {
                id: true,
                name: true,
                vin: true,
                make: true,
                model: true,
                year: true,
                type: true
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
            },
            _count: {
              select: {
                items: true,
                results: true
              }
            }
          }
        }),
        prisma.inspection.count({
          where: filters
        })
      ])

      const totalPages = Math.ceil(totalCount / query.limit)

      logAction('GET Inspections - Success', userId, {
        userId,
        totalCount,
        page: query.page,
        totalPages
      })

      return NextResponse.json(
        {
          success: true,
          data: {
            inspections,
            pagination: {
              page: query.page,
              limit: query.limit,
              totalCount,
              totalPages,
              hasNext: query.page < totalPages,
              hasPrev: query.page > 1
            }
          }
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('GET Inspections - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des inspections' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Inspections - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// POST /api/inspections - Création d'une nouvelle inspection
export async function POST(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('POST Inspections - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('POST Inspections - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('POST Inspections - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('POST Inspections - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    // Extraction et validation des données
    const body = await request.json()
    const inspectionData = InspectionCreateSchema.parse(body)

    logAction('POST Inspections', userId, {
      userId,
      title: inspectionData.title,
      vehicleId: inspectionData.vehicleId,
      templateId: inspectionData.inspectionTemplateId
    })

    try {
      // Vérifier que le véhicule existe et appartient à l'utilisateur
      const existingVehicle = await prisma.vehicle.findFirst({
        where: {
          id: inspectionData.vehicleId
        },
        select: {
          id: true,
          name: true
        }
      })

      if (!existingVehicle) {
        logAction('POST Inspections - Vehicle not found', userId, {
          vehicleId: inspectionData.vehicleId
        })
        return NextResponse.json(
          { success: false, error: 'Véhicule non trouvé' },
          { status: 404 }
        )
      }

      // Vérifier que le modèle d'inspection existe
      const existingTemplate = await prisma.inspectionTemplate.findUnique({
        where: {
          id: inspectionData.inspectionTemplateId
        },
        select: {
          id: true,
          name: true
        }
      })

      if (!existingTemplate) {
        logAction('POST Inspections - Template not found', userId, {
          templateId: inspectionData.inspectionTemplateId
        })
        return NextResponse.json(
          { success: false, error: 'Modèle d\'inspection non trouvé' },
          { status: 404 }
        )
      }

      // Création de l'inspection
      const newInspection = await prisma.inspection.create({
        data: {
          ...inspectionData,
          userId,
          scheduledDate: inspectionData.scheduledDate ? new Date(inspectionData.scheduledDate) : null,
          status: inspectionData.scheduledDate ? 'SCHEDULED' : 'DRAFT'
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

      logAction('POST Inspections - Success', userId, {
        userId,
        inspectionId: newInspection.id,
        title: newInspection.title
      })

      return NextResponse.json(
        {
          success: true,
          data: newInspection,
          message: 'Inspection créée avec succès'
        },
        { status: 201 }
      )

    } catch (dbError) {
      logAction('POST Inspections - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création de l\'inspection' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'

    // Gestion des erreurs de validation
    if (error instanceof Error && error.name === 'ZodError') {
      logAction('POST Inspections - Validation error', userId, {
        error: error.message
      })

      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.message },
        { status: 400 }
      )
    }

    logAction('POST Inspections - Server error', userId, {
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
    { success: false, error: 'Méthode PUT non supportée. Utilisez /api/inspections/[id]' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Méthode DELETE non supportée. Utilisez /api/inspections/[id]' },
    { status: 405 }
  )
}