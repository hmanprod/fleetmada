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
const InspectionTemplateCreateSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  description: z.string().optional(),
  category: z.string().min(1, 'Catégorie requise'),
  isActive: z.boolean().default(true),
  items: z.array(z.object({
    name: z.string().min(1, 'Nom de l\'élément requis'),
    description: z.string().optional(),
    category: z.string().min(1, 'Catégorie requise'),
    isRequired: z.boolean().default(false),
    sortOrder: z.number().default(0)
  })).min(1, 'Au moins un élément requis')
})

const InspectionTemplateListQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  search: z.string().optional(),
  category: z.string().optional(),
  isActive: z.string().transform(val => val === 'true').optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'category']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// Types TypeScript
type CreateInspectionTemplateInput = z.infer<typeof InspectionTemplateCreateSchema>
type InspectionTemplateListQuery = z.infer<typeof InspectionTemplateListQuerySchema>

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Inspection Templates API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Inspection Templates API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Inspection Templates API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction utilitaire pour construire les filtres de recherche
const buildTemplateFilters = (query: InspectionTemplateListQuery) => {
  const filters: any = {}

  if (query.search) {
    filters.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
      { category: { contains: query.search, mode: 'insensitive' } }
    ]
  }

  if (query.category) {
    filters.category = { contains: query.category, mode: 'insensitive' }
  }

  if (query.isActive !== undefined) {
    filters.isActive = query.isActive
  }

  return filters
}

// Fonction utilitaire pour construire l'ordre de tri
const buildOrderBy = (query: InspectionTemplateListQuery) => {
  const orderBy: any = {}
  
  if (query.sortBy === 'createdAt' || query.sortBy === 'updatedAt' || 
      query.sortBy === 'name' || query.sortBy === 'category') {
    orderBy[query.sortBy] = query.sortOrder
  } else {
    orderBy.createdAt = 'desc'
  }
  
  return orderBy
}

// GET /api/inspection-templates - Liste paginée avec filtres
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Inspection Templates - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Inspection Templates - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Inspection Templates - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('GET Inspection Templates - Missing user ID in token', 'unknown', {})
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

    const query = InspectionTemplateListQuerySchema.parse(queryParams)
    const offset = (query.page - 1) * query.limit

    logAction('GET Inspection Templates', userId, { 
      userId, 
      page: query.page, 
      limit: query.limit,
      filters: { 
        search: query.search, 
        category: query.category, 
        isActive: query.isActive
      }
    })

    try {
      // Construction des filtres et de l'ordre
      const filters = buildTemplateFilters(query)
      const orderBy = buildOrderBy(query)

      // Récupération des templates avec pagination
      const [templates, totalCount] = await Promise.all([
        prisma.inspectionTemplate.findMany({
          where: filters,
          orderBy,
          skip: offset,
          take: query.limit,
          include: {
            _count: {
              select: {
                items: true,
                inspections: true
              }
            }
          }
        }),
        prisma.inspectionTemplate.count({
          where: filters
        })
      ])

      const totalPages = Math.ceil(totalCount / query.limit)

      logAction('GET Inspection Templates - Success', userId, { 
        userId, 
        totalCount,
        page: query.page,
        totalPages
      })

      return NextResponse.json(
        {
          success: true,
          data: {
            templates,
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
      logAction('GET Inspection Templates - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des modèles d\'inspection' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Inspection Templates - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// POST /api/inspection-templates - Création d'un nouveau modèle d'inspection
export async function POST(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('POST Inspection Templates - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('POST Inspection Templates - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('POST Inspection Templates - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('POST Inspection Templates - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    // Extraction et validation des données
    const body = await request.json()
    const templateData = InspectionTemplateCreateSchema.parse(body)

    logAction('POST Inspection Templates', userId, { 
      userId, 
      templateName: templateData.name,
      category: templateData.category,
      itemsCount: templateData.items.length
    })

    try {
      // Vérifier qu'un template avec le même nom n'existe pas déjà
      const existingTemplate = await prisma.inspectionTemplate.findFirst({
        where: {
          name: templateData.name,
          isActive: true
        }
      })

      if (existingTemplate) {
        logAction('POST Inspection Templates - Template name already exists', userId, {
          name: templateData.name
        })

        return NextResponse.json(
          { success: false, error: 'Un modèle d\'inspection avec ce nom existe déjà' },
          { status: 409 }
        )
      }

      // Création du template avec ses éléments en une transaction
      const newTemplate = await prisma.$transaction(async (tx) => {
        // Créer le template principal
        const template = await tx.inspectionTemplate.create({
          data: {
            name: templateData.name,
            description: templateData.description,
            category: templateData.category,
            isActive: templateData.isActive
          }
        })

        // Créer les éléments du template
        const templateItems = await Promise.all(
          templateData.items.map((item, index) => 
            tx.inspectionTemplateItem.create({
              data: {
                inspectionTemplateId: template.id,
                name: item.name,
                description: item.description,
                category: item.category,
                isRequired: item.isRequired,
                sortOrder: item.sortOrder || index
              }
            })
          )
        )

        return {
          ...template,
          items: templateItems
        }
      })

      logAction('POST Inspection Templates - Success', userId, { 
        userId, 
        templateId: newTemplate.id,
        templateName: newTemplate.name
      })

      return NextResponse.json(
        {
          success: true,
          data: newTemplate,
          message: 'Modèle d\'inspection créé avec succès'
        },
        { status: 201 }
      )

    } catch (dbError) {
      logAction('POST Inspection Templates - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création du modèle d\'inspection' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    
    // Gestion des erreurs de validation
    if (error instanceof Error && error.name === 'ZodError') {
      logAction('POST Inspection Templates - Validation error', userId, {
        error: error.message
      })

      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.message },
        { status: 400 }
      )
    }

    logAction('POST Inspection Templates - Server error', userId, {
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
    { success: false, error: 'Méthode PUT non supportée. Utilisez /api/inspection-templates/[id]' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Méthode DELETE non supportée. Utilisez /api/inspection-templates/[id]' },
    { status: 405 }
  )
}