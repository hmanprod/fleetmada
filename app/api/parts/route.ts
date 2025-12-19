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
      console.log('[Parts API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Parts API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Parts API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// GET /api/parts - Liste pièces avec stock
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Parts - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const authParts = authHeader.split(' ')
    if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
      logAction('GET Parts - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = authParts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Parts - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('GET Parts - Missing user ID in token', 'unknown', {})
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
    const lowStock = searchParams.get('lowStock') === 'true'
    const sortBy = searchParams.get('sortBy') || 'number'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    const skip = (page - 1) * limit

    logAction('GET Parts', userId, {
      page, limit, search, category, lowStock
    })

    const where: any = {}

    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category) {
      where.category = { contains: category, mode: 'insensitive' }
    }

    if (lowStock) {
      where.quantity = { lte: 10 } // Filtrer par stock faible (à ajuster selon les besoins)
    }

    const orderBy: any = {}
    if (sortBy === 'number' || sortBy === 'description' || sortBy === 'category' || 
        sortBy === 'quantity' || sortBy === 'cost' || sortBy === 'createdAt') {
      orderBy[sortBy] = sortOrder
    } else {
      orderBy.number = 'asc'
    }

    const [partsList, total] = await Promise.all([
      prisma.part.findMany({
        where,
        orderBy,
        skip,
        take: limit
      }),
      prisma.part.count({ where })
    ])

    // Calculer les alertes de stock
    const partsWithAlerts = partsList.map((part: any) => ({
      ...part,
      lowStockAlert: part.quantity <= part.minimumStock,
      stockStatus: part.quantity === 0 ? 'OUT_OF_STOCK' : 
                   part.quantity <= part.minimumStock ? 'LOW_STOCK' : 'IN_STOCK'
    }))

    logAction('GET Parts - Success', userId, {
      userId, total, page, totalPages: Math.ceil(total / limit)
    })

    return NextResponse.json({
      success: true,
      data: {
        parts: partsWithAlerts,
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
    logAction('GET Parts - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// POST /api/parts - Nouvelle pièce
export async function POST(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('POST Part - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const authParts = authHeader.split(' ')
    if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
      logAction('POST Part - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = authParts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('POST Part - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('POST Part - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    // Extraction et validation des données
    const body = await request.json()
    const {
      number,
      description,
      category,
      manufacturer,
      cost = 0,
      quantity = 0,
      minimumStock = 0
    } = body

    logAction('POST Part', userId, {
      userId, number
    })

    // Validation
    if (!number || !description) {
      logAction('POST Part - Missing required fields', userId, {
        number, description
      })
      return NextResponse.json(
        { success: false, error: 'Le numéro et la description de la pièce sont requis' },
        { status: 400 }
      )
    }

    try {
      // Vérifier qu'une pièce avec le même numéro n'existe pas déjà
      const existingPart = await prisma.part.findUnique({
        where: { number }
      })

      if (existingPart) {
        logAction('POST Part - Number already exists', userId, {
          number
        })

        return NextResponse.json(
          { success: false, error: 'Une pièce avec ce numéro existe déjà' },
          { status: 409 }
        )
      }

      // Création de la pièce
      const newPart = await prisma.part.create({
        data: {
          number,
          description,
          category,
          manufacturer,
          cost,
          quantity,
          minimumStock
        }
      })

      logAction('POST Part - Success', userId, {
        userId, partId: newPart.id, partNumber: newPart.number
      })

      return NextResponse.json(
        {
          success: true,
          data: newPart,
          message: 'Pièce créée avec succès'
        },
        { status: 201 }
      )

    } catch (dbError) {
      logAction('POST Part - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création de la pièce' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('POST Part - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}