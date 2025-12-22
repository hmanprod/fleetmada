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
      console.log('[Service Programs API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Service Programs API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Service Programs API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// GET /api/service/programs - Liste programmes maintenance
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Service Programs - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const authParts = authHeader.split(' ')
    if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
      logAction('GET Service Programs - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = authParts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Service Programs - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('GET Service Programs - Missing user ID in token', 'unknown', {})
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
    const active = searchParams.get('active')

    const skip = (page - 1) * limit

    logAction('GET Service Programs', userId, {
      page, limit, search, active
    })

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (active !== null) {
      where.active = active === 'true'
    }

    const [programs, total] = await Promise.all([
      prisma.serviceProgram.findMany({
        where,
        orderBy: { createdAt: 'desc' },

        skip,
        take: limit,
        include: {
          vehicles: {
            include: {
              vehicle: {
                select: { id: true, name: true, make: true, model: true }
              }
            }
          },
          tasks: {
            include: {
              serviceTask: {
                select: { id: true, name: true, description: true }
              }
            }
          },
          _count: {
            select: {
              vehicles: true,
              tasks: true
            }
          }
        }
      }),
      prisma.serviceProgram.count({ where })
    ])

    // Enrichir les données avec des statistiques
    const programsWithStats = programs.map(program => ({
      ...program,
      vehicleCount: program.vehicles.length,
      taskCount: program.tasks.length,
      nextDueCount: program.vehicles.filter(v => v.nextService).length
    }))

    logAction('GET Service Programs - Success', userId, {
      userId, total, page, totalPages: Math.ceil(total / limit)
    })

    return NextResponse.json({
      success: true,
      data: {
        programs: programsWithStats,
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
    logAction('GET Service Programs - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// POST /api/service/programs - Nouveau programme
export async function POST(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('POST Service Program - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const authParts = authHeader.split(' ')
    if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
      logAction('POST Service Program - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = authParts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('POST Service Program - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('POST Service Program - Missing user ID in token', 'unknown', {})
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
      frequency,
      nextDue,
      active = true,
      tasks = []
    } = body

    logAction('POST Service Program', userId, {
      userId, name
    })

    // Validation
    if (!name || !frequency) {
      logAction('POST Service Program - Missing required fields', userId, {
        name, frequency
      })
      return NextResponse.json(
        { success: false, error: 'Le nom et la fréquence du programme sont requis' },
        { status: 400 }
      )
    }

    try {
      // Vérifier qu'un programme avec le même nom n'existe pas déjà
      const existingProgram = await prisma.serviceProgram.findFirst({
        where: { name }
      })

      if (existingProgram) {
        logAction('POST Service Program - Name already exists', userId, {
          name
        })

        return NextResponse.json(
          { success: false, error: 'Un programme avec ce nom existe déjà' },
          { status: 409 }
        )
      }

      // Création du programme
      const newProgram = await prisma.serviceProgram.create({
        data: {
          name,
          description,
          frequency,
          nextDue: nextDue ? new Date(nextDue) : null,
          active,
          tasks: {
            create: tasks.map((taskId: string) => ({
              serviceTaskId: taskId
            }))
          }
        },
        include: {
          tasks: {
            include: {
              serviceTask: {
                select: { id: true, name: true, description: true }
              }
            }
          },
          _count: {
            select: {
              vehicles: true,
              tasks: true
            }
          }
        }
      })

      logAction('POST Service Program - Success', userId, {
        userId, programId: newProgram.id, programName: newProgram.name
      })

      return NextResponse.json(
        {
          success: true,
          data: newProgram,
          message: 'Programme créé avec succès'
        },
        { status: 201 }
      )

    } catch (dbError) {
      logAction('POST Service Program - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création du programme' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('POST Service Program - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}