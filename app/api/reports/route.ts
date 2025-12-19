import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

// Interfaces
interface TokenPayload {
  userId: string
  email: string
  type: string
  iat: number
  exp?: number
}

interface ReportQueryParams {
  page?: string
  limit?: string
  category?: string
  favorites?: string
  saved?: string
  shared?: string
  search?: string
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Reports API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Reports API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Reports API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// GET /api/reports - Liste des rapports avec filtres
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Reports - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Reports - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Reports - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('GET Reports - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    // Extraction des paramètres de requête
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100) // Max 100
    const category = searchParams.get('category')
    const favorites = searchParams.get('favorites') === 'true'
    const saved = searchParams.get('saved') === 'true'
    const shared = searchParams.get('shared') === 'true'
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    logAction('GET Reports', userId, { 
      userId, 
      page, 
      limit, 
      category, 
      favorites, 
      saved, 
      shared, 
      search 
    })

    // Construction de la requête de base
    let whereClause: any = {
      OR: [
        { ownerId: userId },
        ...(shared ? [{
          shares: {
            some: {
              sharedWith: userId
            }
          }
        }] : [])
      ]
    }

    // Filtres
    if (category) {
      whereClause.category = category
    }

    if (favorites) {
      whereClause.isFavorite = true
    }

    if (saved) {
      whereClause.isSaved = true
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    try {
      // Récupération des rapports
      const [reports, totalCount] = await Promise.all([
        prisma.report.findMany({
          where: whereClause,
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            company: {
              select: {
                id: true,
                name: true
              }
            },
            shares: {
              select: {
                id: true,
                sharedWith: true,
                permission: true,
                createdAt: true
              }
            },
            _count: {
              select: {
                shares: true,
                schedules: true
              }
            }
          },
          orderBy: [
            { updatedAt: 'desc' },
            { createdAt: 'desc' }
          ],
          skip,
          take: limit
        }),
        prisma.report.count({
          where: whereClause
        })
      ])

      // Transformation des données pour la réponse
      const transformedReports = reports.map((report: any) => ({
        id: report.id,
        title: report.title,
        description: report.description,
        category: report.category,
        isFavorite: report.isFavorite,
        config: report.config,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        owner: report.owner,
        company: report.company,
        shares: report.shares,
        stats: {
          sharesCount: report._count.shares,
          schedulesCount: report._count.schedules
        }
      }))

      const hasMore = skip + limit < totalCount

      const response = {
        success: true,
        data: {
          reports: transformedReports,
          pagination: {
            page,
            limit,
            total: totalCount,
            hasMore,
            totalPages: Math.ceil(totalCount / limit)
          }
        }
      }

      logAction('GET Reports - Success', userId, { 
        userId, 
        count: reports.length,
        total: totalCount,
        page,
        hasMore
      })

      return NextResponse.json(response, { status: 200 })

    } catch (dbError) {
      logAction('GET Reports - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des rapports' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Reports - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// POST /api/reports - Créer un nouveau rapport
export async function POST(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('POST Report - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('POST Report - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('POST Report - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('POST Report - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    // Extraction et validation du body
    const body = await request.json()
    
    if (!body.title || !body.description) {
      return NextResponse.json(
        { success: false, error: 'Titre et description requis' },
        { status: 400 }
      )
    }

    logAction('POST Report', userId, { userId, title: body.title })

    try {
      // Création du rapport
      const newReport = await prisma.report.create({
        data: {
          title: body.title,
          description: body.description,
          type: body.type || 'CUSTOM',
          category: body.category || 'Custom',
          template: body.template || 'custom',
          isPublic: body.isPublic || false,
          isFavorite: body.isFavorite || false,
          isSaved: body.isSaved || true,
          config: body.config || {},
          data: body.data || null,
          ownerId: userId,
          companyId: body.companyId || null
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          company: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

      const response = {
        success: true,
        data: {
          report: {
            id: newReport.id,
            title: newReport.title,
            description: newReport.description,
            type: newReport.type,
            category: newReport.category,
            template: newReport.template,
            isPublic: newReport.isPublic,
            isFavorite: newReport.isFavorite,
            isSaved: newReport.isSaved,
            config: newReport.config,
            data: newReport.data,
            createdAt: newReport.createdAt,
            updatedAt: newReport.updatedAt,
            owner: newReport.owner,
            company: newReport.company
          }
        }
      }

      logAction('POST Report - Success', userId, { 
        userId, 
        reportId: newReport.id,
        title: newReport.title
      })

      return NextResponse.json(response, { status: 201 })

    } catch (dbError) {
      logAction('POST Report - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création du rapport' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('POST Report - Server error', userId, {
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
    { error: 'Méthode non autorisée - Utilisez /api/reports/[id]' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Méthode non autorisée - Utilisez /api/reports/[id]' },
    { status: 405 }
  )
}