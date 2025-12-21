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
      console.log('[Service Entries API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Service Entries API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Service Entries API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// GET /api/service/entries - Liste paginée (historique + work orders)
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Service Entries - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Service Entries - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Service Entries - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('GET Service Entries - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    // Extraction des paramètres de requête
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const vehicleId = searchParams.get('vehicleId')
    const isWorkOrder = searchParams.get('isWorkOrder')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    logAction('GET Service Entries', userId, {
      page, limit, status, vehicleId, isWorkOrder, startDate, endDate
    })

    const where: any = {
      userId
    }

    if (status) where.status = status
    if (vehicleId) where.vehicleId = vehicleId
    if (isWorkOrder !== null) where.isWorkOrder = isWorkOrder === 'true'
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const [entries, total] = await Promise.all([
      prisma.serviceEntry.findMany({
        where,
        include: {
          vehicle: {
            select: { id: true, name: true, make: true, model: true }
          },
          user: {
            select: { id: true, name: true, email: true }
          },
          tasks: {
            include: {
              serviceTask: {
                select: { id: true, name: true, description: true }
              }
            }
          },
          parts: {
            include: {
              part: {
                select: { id: true, number: true, description: true }
              }
            }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit
      }),
      prisma.serviceEntry.count({ where })
    ])

    logAction('GET Service Entries - Success', userId, {
      userId, total, page, totalPages: Math.ceil(total / limit)
    })

    return NextResponse.json({
      success: true,
      data: {
        entries,
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
    logAction('GET Service Entries - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// POST /api/service/entries - Création nouvelle intervention
export async function POST(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('POST Service Entry - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('POST Service Entry - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('POST Service Entry - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('POST Service Entry - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    // Extraction et validation des données
    const body = await request.json()
    const {
      vehicleId,
      date,
      status = 'SCHEDULED',
      totalCost = 0,
      meter,
      vendor,
      notes,
      priority,
      assignedToContactId,
      isWorkOrder = false,
      tasks = [],
      parts: serviceParts = []
    } = body

    logAction('POST Service Entry', userId, {
      userId, vehicleId, date, status, isWorkOrder
    })

    // Validation
    if (!vehicleId || !date) {
      logAction('POST Service Entry - Missing required fields', userId, {
        vehicleId, date
      })
      return NextResponse.json(
        { success: false, error: 'Vehicle ID and date are required' },
        { status: 400 }
      )
    }

    try {
      // Vérifier que le véhicule appartient à l'utilisateur
      const vehicle = await prisma.vehicle.findFirst({
        where: { id: vehicleId, userId }
      })

      if (!vehicle) {
        logAction('POST Service Entry - Vehicle not found or access denied', userId, {
          vehicleId, userId
        })
        return NextResponse.json(
          { success: false, error: 'Vehicle not found or access denied' },
          { status: 404 }
        )
      }

      // Créer l'entrée de service avec les relations
      const serviceEntry = await prisma.serviceEntry.create({
        data: {
          vehicleId,
          userId,
          date: new Date(date),
          status,
          totalCost,
          meter,
          vendor,
          notes,
          priority,
          assignedToContactId,
          isWorkOrder,
          tasks: {
            create: tasks.map((taskId: string) => ({
              serviceTaskId: taskId
            }))
          },
          parts: {
            create: serviceParts.map((part: any) => ({
              partId: part.partId,
              quantity: part.quantity || 1,
              unitCost: part.unitCost || 0,
              totalCost: (part.quantity || 1) * (part.unitCost || 0),
              notes: part.notes
            }))
          }
        },
        include: {
          vehicle: {
            select: { id: true, name: true, make: true, model: true }
          },
          user: {
            select: { id: true, name: true, email: true }
          },
          tasks: {
            include: {
              serviceTask: {
                select: { id: true, name: true, description: true }
              }
            }
          },
          parts: {
            include: {
              part: {
                select: { id: true, number: true, description: true }
              }
            }
          }
        }
      })

      logAction('POST Service Entry - Success', userId, {
        userId, serviceEntryId: serviceEntry.id
      })

      return NextResponse.json(
        {
          success: true,
          data: serviceEntry,
          message: 'Intervention créée avec succès'
        },
        { status: 201 }
      )

    } catch (dbError) {
      logAction('POST Service Entry - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création de l\'intervention' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('POST Service Entry - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}