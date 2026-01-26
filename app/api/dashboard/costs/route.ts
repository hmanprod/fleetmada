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

// Interface pour les paramètres de requête
interface CostQueryParams {
  period?: '7d' | '30d' | '90d' | '1y'
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Dashboard Costs API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Dashboard Costs API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Dashboard Costs API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction pour obtenir la date de début selon la période
const getStartDate = (period: string): Date => {
  const now = new Date()
  switch (period) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    case '1y':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // Default: 30d
  }
}

// GET /api/dashboard/costs - Analyse des coûts et dépenses
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Costs - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Costs - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Costs - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('GET Costs - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    // Extraction des paramètres de requête
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'

    logAction('GET Costs', userId, { userId, period })

    const startDate = getStartDate(period)

    // Récupération des données de coûts simplifiées
    try {
      const [
        fuelCosts,
        serviceCosts,
        chargingCosts,
        fuelEntries,
        serviceEntries,
        chargingEntries
      ] = await Promise.all([
        // Coûts carburant
        prisma.fuelEntry.aggregate({
          where: {
            userId,
            date: { gte: startDate }
          },
          _sum: { cost: true },
          _avg: { mpg: true }
        }),

        // Coûts de service/entretien
        prisma.serviceEntry.aggregate({
          where: {
            userId,
            date: { gte: startDate }
          },
          _sum: { totalCost: true }
        }),

        // Coûts de chargement électrique
        prisma.chargingEntry.aggregate({
          where: {
            userId,
            date: { gte: startDate }
          },
          _sum: { cost: true }
        }),

        // Comptage des entrées carburant
        prisma.fuelEntry.count({
          where: {
            userId,
            date: { gte: startDate }
          }
        }),

        // Comptage des entrées de service
        prisma.serviceEntry.count({
          where: {
            userId,
            date: { gte: startDate }
          }
        }),

        // Comptage des entrées de chargement
        prisma.chargingEntry.count({
          where: {
            userId,
            date: { gte: startDate }
          }
        })
      ])

      // Calculs totaux
      const totalFuelCost = fuelCosts._sum.cost || 0
      const totalServiceCost = serviceCosts._sum.totalCost || 0
      const totalChargingCost = chargingCosts._sum.cost || 0
      const totalCosts = totalFuelCost + totalServiceCost + totalChargingCost
      const averageMPG = fuelCosts._avg.mpg || 0

      // Répartition des coûts
      const breakdown = {
        fuel: {
          total: totalFuelCost,
          count: fuelEntries,
          percentage: totalCosts > 0 ? Math.round((totalFuelCost / totalCosts) * 100) : 0
        },
        service: {
          total: totalServiceCost,
          count: serviceEntries,
          percentage: totalCosts > 0 ? Math.round((totalServiceCost / totalCosts) * 100) : 0
        },
        charging: {
          total: totalChargingCost,
          count: chargingEntries,
          percentage: totalCosts > 0 ? Math.round((totalChargingCost / totalCosts) * 100) : 0
        }
      }

      // 2. Historique des coûts (6 derniers mois)
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
      sixMonthsAgo.setDate(1)
      sixMonthsAgo.setHours(0, 0, 0, 0)

      const [historicalFuel, historicalService, historicalCharging] = await Promise.all([
        prisma.fuelEntry.findMany({
          where: { userId, date: { gte: sixMonthsAgo } },
          select: { date: true, cost: true }
        }),
        prisma.serviceEntry.findMany({
          where: { userId, date: { gte: sixMonthsAgo } },
          select: { date: true, totalCost: true }
        }),
        prisma.chargingEntry.findMany({
          where: { userId, date: { gte: sixMonthsAgo } },
          select: { date: true, cost: true }
        })
      ])

      // Grouper par mois
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc']
      const monthlyData: Record<string, number> = {}

      for (let i = 5; i >= 0; i--) {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        const monthKey = `${months[d.getMonth()]} ${d.getFullYear().toString().substr(-2)}`
        monthlyData[monthKey] = 0
      }

      historicalFuel.forEach(entry => {
        const d = new Date(entry.date)
        const monthKey = `${months[d.getMonth()]} ${d.getFullYear().toString().substr(-2)}`
        if (monthlyData[monthKey] !== undefined) monthlyData[monthKey] += entry.cost
      })

      historicalService.forEach(entry => {
        const d = new Date(entry.date)
        const monthKey = `${months[d.getMonth()]} ${d.getFullYear().toString().substr(-2)}`
        if (monthlyData[monthKey] !== undefined) monthlyData[monthKey] += entry.totalCost
      })

      historicalCharging.forEach(entry => {
        const d = new Date(entry.date)
        const monthKey = `${months[d.getMonth()]} ${d.getFullYear().toString().substr(-2)}`
        if (monthlyData[monthKey] !== undefined) monthlyData[monthKey] += entry.cost
      })

      const history = Object.entries(monthlyData).map(([name, costs]) => ({ name, costs }))

      const costsData = {
        summary: {
          totalCosts,
          totalFuelCost,
          totalServiceCost,
          totalChargingCost,
          averageMPG,
          period,
          entryCount: fuelEntries + serviceEntries + chargingEntries
        },
        breakdown,
        history,
        lastUpdated: new Date().toISOString()
      }

      logAction('GET Costs - Success', userId, {
        userId,
        period,
        totalCosts: totalCosts.toFixed(2)
      })

      return NextResponse.json(
        {
          success: true,
          data: costsData
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('GET Costs - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des données de coûts' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Costs - Server error', userId, {
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
export async function POST() {
  return NextResponse.json(
    { error: 'Méthode non autorisée' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Méthode non autorisée' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Méthode non autorisée' },
    { status: 405 }
  )
}