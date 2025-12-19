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

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Service Tasks API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Service Tasks API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Service Tasks API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// GET /api/service/tasks - Liste des tâches de maintenance
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Service Tasks - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Service Tasks - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Service Tasks - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('GET Service Tasks - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    // Extraction des paramètres de requête
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const system = searchParams.get('system')

    const skip = (page - 1) * limit

    logAction('GET Service Tasks', userId, {
      page, limit, search, category, system
    })

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category) {
      where.categoryCode = { contains: category, mode: 'insensitive' }
    }

    if (system) {
      where.systemCode = { contains: system, mode: 'insensitive' }
    }

    const [tasks, total] = await Promise.all([
      prisma.serviceTask.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              taskEntries: true,
              programs: true
            }
          }
        }
      }),
      prisma.serviceTask.count({ where })
    ])

    logAction('GET Service Tasks - Success', userId, {
      userId, total, page, totalPages: Math.ceil(total / limit)
    })

    return NextResponse.json({
      success: true,
      data: {
        tasks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    })
  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Service Tasks - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// POST /api/service/tasks - Nouvelle tâche
export async function POST(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('POST Service Task - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('POST Service Task - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('POST Service Task - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('POST Service Task - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    // Extraction et validation des données
    const body = await request.json()
    const {
      name,
      description,
      categoryCode,
      systemCode,
      assemblyCode
    } = body

    logAction('POST Service Task', userId, {
      userId, name
    })

    // Validation
    if (!name) {
      logAction('POST Service Task - Missing required fields', userId, {
        name
      })
      return NextResponse.json(
        { success: false, error: 'Le nom de la tâche est requis' },
        { status: 400 }
      )
    }

    try {
      // Vérifier qu'une tâche avec le même nom n'existe pas déjà
      const existingTask = await prisma.serviceTask.findFirst({
        where: { name }
      })

      if (existingTask) {
        logAction('POST Service Task - Name already exists', userId, {
          name
        })

        return NextResponse.json(
          { success: false, error: 'Une tâche avec ce nom existe déjà' },
          { status: 409 }
        )
      }

      // Création de la tâche
      const newTask = await prisma.serviceTask.create({
        data: {
          name,
          description,
          categoryCode,
          systemCode,
          assemblyCode
        }
      })

      logAction('POST Service Task - Success', userId, {
        userId, taskId: newTask.id, taskName: newTask.name
      })

      return NextResponse.json(
        {
          success: true,
          data: newTask,
          message: 'Tâche créée avec succès'
        },
        { status: 201 }
      )

    } catch (dbError) {
      logAction('POST Service Task - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création de la tâche' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('POST Service Task - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}