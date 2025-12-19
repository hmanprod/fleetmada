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
      console.log('[Vehicle Renewals API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Vehicle Renewals API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Vehicle Renewals API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// GET /api/vehicle-renewals - Liste des renouvellements véhicules
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Vehicle Renewals - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const authParts = authHeader.split(' ')
    if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
      logAction('GET Vehicle Renewals - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = authParts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Vehicle Renewals - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('GET Vehicle Renewals - Missing user ID in token', 'unknown', {})
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
    const type = searchParams.get('type')
    const vehicleId = searchParams.get('vehicleId')
    const overdue = searchParams.get('overdue') === 'true'
    const dueSoon = searchParams.get('dueSoon') === 'true'

    const skip = (page - 1) * limit

    logAction('GET Vehicle Renewals', userId, {
      page, limit, status, type, vehicleId, overdue, dueSoon
    })

    const where: any = {
      vehicle: {
        userId
      },
      isActive: true
    }

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    if (vehicleId) {
      where.vehicleId = vehicleId
    }

    const now = new Date()
    if (overdue) {
      where.dueDate = { lt: now }
      where.status = { in: ['DUE', 'OVERDUE'] }
    }

    if (dueSoon) {
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      where.dueDate = { gte: now, lte: sevenDaysFromNow }
      where.status = 'DUE'
    }

    const [renewals, total] = await Promise.all([
      prisma.vehicleRenewal.findMany({
        where,
        orderBy: { dueDate: 'asc' },
        skip,
        take: limit,
        include: {
          vehicle: {
            select: { id: true, name: true, make: true, model: true }
          }
        }
      }),
      prisma.vehicleRenewal.count({ where })
    ])

    // Enrichir les renouvellements avec des informations sur leur statut
    const renewalsWithStatus = renewals.map(renewal => {
      let isOverdue = false
      let daysUntilDue: number | null = null
      let priority = 'NORMAL'
      
      if (renewal.dueDate) {
        isOverdue = renewal.dueDate < now
        daysUntilDue = Math.ceil((renewal.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        
        if (isOverdue) priority = 'OVERDUE'
        else if (daysUntilDue !== null && daysUntilDue <= 7) priority = 'SOON'
      }
      
      return {
        ...renewal,
        isOverdue,
        daysUntilDue,
        priority
      }
    })

    logAction('GET Vehicle Renewals - Success', userId, {
      userId, total, page, totalPages: Math.ceil(total / limit)
    })

    return NextResponse.json({
      success: true,
      data: {
        renewals: renewalsWithStatus,
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
    logAction('GET Vehicle Renewals - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// POST /api/vehicle-renewals - Nouveau renouvellement véhicule
export async function POST(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('POST Vehicle Renewal - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const authParts = authHeader.split(' ')
    if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
      logAction('POST Vehicle Renewal - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = authParts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('POST Vehicle Renewal - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('POST Vehicle Renewal - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    // Extraction et validation des données
    const body = await request.json()
    const {
      vehicleId,
      type,
      title,
      description,
      dueDate,
      nextDueDate,
      priority = 'MEDIUM',
      cost,
      provider,
      notes,
      watchers = []
    } = body

    logAction('POST Vehicle Renewal', userId, {
      userId, vehicleId, type, title
    })

    // Validation
    if (!vehicleId) {
      return NextResponse.json(
        { success: false, error: 'Vehicle ID requis' },
        { status: 400 }
      )
    }

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Type de renouvellement requis' },
        { status: 400 }
      )
    }

    if (!dueDate) {
      return NextResponse.json(
        { success: false, error: 'Date d\'échéance requise' },
        { status: 400 }
      )
    }

    try {
      // Vérifier que le véhicule appartient à l'utilisateur
      const vehicle = await prisma.vehicle.findFirst({
        where: { id: vehicleId, userId }
      })

      if (!vehicle) {
        logAction('POST Vehicle Renewal - Vehicle not found or access denied', userId, {
          vehicleId, userId
        })
        return NextResponse.json(
          { success: false, error: 'Véhicule non trouvé ou accès refusé' },
          { status: 404 }
        )
      }

      // Créer le renouvellement
      const renewalData = {
        vehicleId,
        type: type as any, // Enum RenewalType
        title,
        description,
        dueDate: new Date(dueDate),
        nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
        priority: priority as any, // Enum Priority
        cost: cost ? parseFloat(cost) : null,
        provider,
        notes,
        watchers,
        status: 'DUE' as any, // Enum RenewalStatus
        isActive: true
      }

      const newRenewal = await prisma.vehicleRenewal.create({
        data: renewalData,
        include: {
          vehicle: {
            select: { id: true, name: true, make: true, model: true }
          }
        }
      })

      logAction('POST Vehicle Renewal - Success', userId, {
        userId, renewalId: newRenewal.id
      })

      return NextResponse.json(
        {
          success: true,
          data: newRenewal,
          message: 'Renouvellement créé avec succès'
        },
        { status: 201 }
      )

    } catch (dbError) {
      logAction('POST Vehicle Renewal - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création du renouvellement' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('POST Vehicle Renewal - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}