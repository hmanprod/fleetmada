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
const IssueCreateSchema = z.object({
  vehicleId: z.string().optional(),
  summary: z.string().min(1, 'Le résumé est requis'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  reportedDate: z.string().optional().transform(val => val ? new Date(val) : new Date()),
  dueDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  labels: z.array(z.string()).default([]),
  assignedTo: z.array(z.string()).optional()
})

const IssueListQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  search: z.string().optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  vehicleId: z.string().optional(),
  assignedTo: z.string().optional(),
  labels: z.string().optional(),
  groupId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  userId: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'status', 'reportedDate']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

const IssueUpdateSchema = z.object({
  summary: z.string().min(1, 'Le résumé est requis').optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  labels: z.array(z.string()).optional(),
  assignedTo: z.array(z.string()).optional()
})

// Types TypeScript
type CreateIssueInput = z.infer<typeof IssueCreateSchema>
type IssueListQuery = z.infer<typeof IssueListQuerySchema>
type UpdateIssueInput = z.infer<typeof IssueUpdateSchema>

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Issues API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Issues API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Issues API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction utilitaire pour construire les filtres de recherche
const buildIssueFilters = (query: IssueListQuery, userId: string) => {
  const filters: any = {}

  // Si on demande spécifiquement les issues assignées à quelqu'un ou créées par quelqu'un (userId filter)
  if (query.assignedTo) {
    filters.assignedTo = { has: query.assignedTo }
  } else if (query.userId) {
    filters.userId = query.userId
  } else {
    // Par défaut, on ne montre que les siennes si aucun autre critère utilisateur n'est fourni
    filters.userId = userId
  }

  if (query.search) {
    filters.OR = [
      { summary: { contains: query.search, mode: 'insensitive' } },
      { labels: { hasSome: [query.search] } }
    ]
  }

  if (query.status) {
    filters.status = query.status
  }

  if (query.priority) {
    filters.priority = query.priority
  }

  if (query.vehicleId) {
    filters.vehicleId = query.vehicleId
  }

  if (query.labels) {
    const labelList = query.labels.split(',').map(l => l.trim()).filter(Boolean)
    if (labelList.length > 0) {
      filters.labels = { hasSome: labelList }
    }
  }

  if (query.groupId) {
    filters.vehicle = {
      group: query.groupId
    }
  }

  if (query.startDate || query.endDate) {
    filters.reportedDate = {}
    if (query.startDate) {
      filters.reportedDate.gte = new Date(query.startDate)
    }
    if (query.endDate) {
      filters.reportedDate.lte = new Date(query.endDate)
    }
  }

  return filters
}

// Fonction utilitaire pour construire l'ordre de tri
const buildOrderBy = (query: IssueListQuery) => {
  const orderBy: any = {}

  if (query.sortBy === 'createdAt' || query.sortBy === 'updatedAt' ||
    query.sortBy === 'priority' || query.sortBy === 'status' || query.sortBy === 'reportedDate') {
    orderBy[query.sortBy] = query.sortOrder
  } else {
    orderBy.createdAt = 'desc'
  }

  return orderBy
}

// GET /api/issues - Liste paginée avec filtres
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Issues - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Issues - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Issues - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('GET Issues - Missing user ID in token', 'unknown', {})
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

    const query = IssueListQuerySchema.parse(queryParams)
    const offset = (query.page - 1) * query.limit

    logAction('GET Issues', userId, {
      userId,
      page: query.page,
      limit: query.limit,
      filters: {
        search: query.search,
        status: query.status,
        priority: query.priority,
        vehicleId: query.vehicleId,
        assignedTo: query.assignedTo
      }
    })

    try {
      // Construction des filtres et de l'ordre
      const filters = buildIssueFilters(query, userId)
      const orderBy = buildOrderBy(query)

      // Récupération des issues avec pagination
      const [issues, totalCount] = await Promise.all([
        prisma.issue.findMany({
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
                model: true
              }
            },
            _count: {
              select: {
                comments: true,
                images: true
              }
            }
          }
        }),
        prisma.issue.count({
          where: filters
        })
      ])

      const totalPages = Math.ceil(totalCount / query.limit)

      logAction('GET Issues - Success', userId, {
        userId,
        totalCount,
        page: query.page,
        totalPages
      })

      return NextResponse.json(
        {
          success: true,
          data: {
            issues,
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
      logAction('GET Issues - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des problèmes' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Issues - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// POST /api/issues - Création d'un nouveau problème
export async function POST(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('POST Issues - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('POST Issues - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('POST Issues - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('POST Issues - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    // Extraction et validation des données
    const body = await request.json()
    const issueData = IssueCreateSchema.parse(body)

    logAction('POST Issues', userId, {
      userId,
      summary: issueData.summary,
      priority: issueData.priority,
      vehicleId: issueData.vehicleId
    })

    try {
      // Création du problème
      const newIssue = await prisma.issue.create({
        data: {
          ...issueData,
          userId
        } as any,
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

      logAction('POST Issues - Success', userId, {
        userId,
        issueId: newIssue.id,
        summary: newIssue.summary
      })

      return NextResponse.json(
        {
          success: true,
          data: newIssue,
          message: 'Problème créé avec succès'
        },
        { status: 201 }
      )

    } catch (dbError) {
      logAction('POST Issues - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création du problème' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'

    // Gestion des erreurs de validation
    if (error instanceof Error && error.name === 'ZodError') {
      logAction('POST Issues - Validation error', userId, {
        error: error.message
      })

      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.message },
        { status: 400 }
      )
    }

    logAction('POST Issues - Server error', userId, {
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
    { success: false, error: 'Méthode PUT non supportée. Utilisez /api/issues/[id]' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Méthode DELETE non supportée. Utilisez /api/issues/[id]' },
    { status: 405 }
  )
}