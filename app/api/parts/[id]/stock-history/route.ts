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
      console.log('[Parts Stock History API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Parts Stock History API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Parts Stock History API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// GET /api/parts/[id]/stock-history - Historique des mouvements de stock
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('Stock History - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const authParts = authHeader.split(' ')
    if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
      logAction('Stock History - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = authParts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('Stock History - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const { id } = params

    // Extraction des paramètres de requête
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const type = searchParams.get('type') // Filtrer par type de mouvement
    const startDate = searchParams.get('startDate') // Date de début
    const endDate = searchParams.get('endDate') // Date de fin

    const skip = (page - 1) * limit

    logAction('Stock History', userId, {
      partId: id,
      page,
      limit,
      type,
      startDate,
      endDate
    })

    try {
      // Vérifier que la pièce existe
      const part = await prisma.part.findUnique({
        where: { id },
        select: {
          id: true,
          number: true,
          description: true,
          quantity: true
        }
      })

      if (!part) {
        logAction('Stock History - Part not found', userId, { partId: id })
        return NextResponse.json(
          { success: false, error: 'Pièce non trouvée' },
          { status: 404 }
        )
      }

      // Construire les filtres
      const where: any = { partId: id }

      if (type) {
        where.type = type
      }

      if (startDate || endDate) {
        where.createdAt = {}
        if (startDate) {
          where.createdAt.gte = new Date(startDate)
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate)
        }
      }

      // Récupérer l'historique des mouvements
      const [movements, total] = await Promise.all([
        // Utilisation de any temporairement pour éviter l'erreur TypeScript
        (prisma as any).stockMovement.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            // Les données du service lié si applicable
            ...(where.referenceType === 'serviceEntry' && {
              serviceEntry: {
                select: {
                  id: true,
                  date: true,
                  vendor: true,
                  vehicle: {
                    select: {
                      id: true,
                      name: true,
                      vin: true
                    }
                  }
                }
              }
            })
          }
        }),
        (prisma as any).stockMovement.count({ where })
      ])

      // Enrichir les données avec des informations supplémentaires
      const enrichedMovements = movements.map((movement: any) => ({
        ...movement,
        movementType: movement.type,
        isPositive: movement.quantity > 0,
        isNegative: movement.quantity < 0,
        impact: movement.quantity > 0 ? 'INCREASE' : 'DECREASE',
        formattedDate: movement.createdAt.toISOString(),
        formattedDateHuman: new Intl.DateTimeFormat('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(movement.createdAt)
      }))

      // Calculer les statistiques de l'historique
      const totalMovements = movements.length
      const totalAdded = movements.reduce((sum: number, m: any) => m.quantity > 0 ? sum + m.quantity : sum, 0)
      const totalRemoved = movements.reduce((sum: number, m: any) => m.quantity < 0 ? sum + Math.abs(m.quantity) : sum, 0)
      const netChange = totalAdded - totalRemoved

      // Grouper par type de mouvement
      const movementsByType = movements.reduce((acc: any, movement: any) => {
        if (!acc[movement.type]) {
          acc[movement.type] = { count: 0, quantity: 0 }
        }
        acc[movement.type].count++
        acc[movement.type].quantity += movement.quantity
        return acc
      }, {})

      logAction('Stock History - Success', userId, {
        partId: id,
        partNumber: part.number,
        totalMovements,
        page,
        totalPages: Math.ceil(total / limit)
      })

      return NextResponse.json({
        success: true,
        data: {
          part,
          movements: enrichedMovements,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
          },
          statistics: {
            totalMovements,
            totalAdded,
            totalRemoved,
            netChange,
            currentStock: part.quantity,
            movementsByType
          }
        }
      })

    } catch (dbError) {
      logAction('Stock History - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération de l\'historique' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('Stock History - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}