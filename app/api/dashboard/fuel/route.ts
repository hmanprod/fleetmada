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
interface FuelQueryParams {
  period?: '7d' | '30d' | '90d' | '1y'
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Dashboard Fuel API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Dashboard Fuel API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Dashboard Fuel API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
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

// GET /api/dashboard/fuel - Données carburant et consommation
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Fuel - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Fuel - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Fuel - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('GET Fuel - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    // Extraction des paramètres de requête
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'

    logAction('GET Fuel', userId, { userId, period })

    const startDate = getStartDate(period)

    // Récupération des données carburant
    try {
      const [
        fuelSummary,
        chargingSummary,
        monthlyConsumption,
        topConsumers,
        fuelEfficiency,
        recentEntries
      ] = await Promise.all([
        // Résumé carburant (essence/diesel)
        prisma.fuelEntry.aggregate({
          where: {
            userId,
            date: { gte: startDate }
          },
          _sum: { 
            volume: true,
            cost: true,
            usage: true 
          },
          _avg: { 
            mpg: true,
            cost: true 
          },
          _count: { id: true }
        }),
        
        // Résumé chargement électrique
        prisma.chargingEntry.aggregate({
          where: {
            userId,
            date: { gte: startDate }
          },
          _sum: { 
            energyKwh: true,
            cost: true,
            durationMin: true
          },
          _avg: { 
            cost: true,
            energyKwh: true
          },
          _count: { id: true }
        }),
        
        // Consommation mensuelle
        prisma.fuelEntry.groupBy({
          by: ['date'],
          where: {
            userId,
            date: { gte: startDate }
          },
          _sum: { 
            volume: true,
            cost: true 
          },
          _count: { id: true }
        }),
        
        // Véhicules les plus consommateurs
        prisma.fuelEntry.groupBy({
          by: ['vehicleId'],
          where: {
            userId,
            date: { gte: startDate }
          },
          _sum: { 
            volume: true,
            cost: true,
            usage: true
          },
          _avg: { mpg: true },
          _count: { id: true },
          orderBy: {
            _sum: {
              cost: 'desc'
            }
          },
          take: 5
        }),
        
        // Efficacité carburant par véhicule
        prisma.vehicle.findMany({
          where: { userId },
          select: {
            id: true,
            name: true,
            make: true,
            model: true,
            _count: {
              select: {
                fuelEntries: {
                  where: {
                    date: { gte: startDate },
                    mpg: { not: null }
                  }
                }
              }
            }
          },
          take: 10
        }),
        
        // Entrées récentes
        prisma.fuelEntry.findMany({
          where: {
            userId,
            date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // 7 derniers jours
          },
          include: {
            vehicle: {
              select: {
                id: true,
                name: true,
                make: true,
                model: true
              }
            },
            vendor: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            date: 'desc'
          },
          take: 10
        })
      ])

      // Calculs totaux
      const totalFuelVolume = fuelSummary._sum.volume || 0
      const totalFuelCost = fuelSummary._sum.cost || 0
      const totalFuelUsage = fuelSummary._sum.usage || 0
      const averageMPG = fuelSummary._avg.mpg || 0
      const averageFuelCost = fuelSummary._avg.cost || 0

      const totalChargingEnergy = chargingSummary._sum.energyKwh || 0
      const totalChargingCost = chargingSummary._sum.cost || 0
      const totalChargingDuration = chargingSummary._sum.durationMin || 0
      const averageChargingCost = chargingSummary._avg.cost || 0
      const averageEnergyPerSession = chargingSummary._avg.energyKwh || 0

      // Consommation mensuelle (regroupement par mois)
      const monthlyData = monthlyConsumption.reduce((acc: any, item: any) => {
        const month = new Date(item.date).toISOString().substring(0, 7) // YYYY-MM
        if (!acc[month]) {
          acc[month] = {
            month,
            volume: 0,
            cost: 0,
            entries: 0
          }
        }
        acc[month].volume += item._sum.volume || 0
        acc[month].cost += item._sum.cost || 0
        acc[month].entries += item._count.id || 0
        return acc
      }, {})

      const monthlyTrends = Object.values(monthlyData)

      // Véhicules les plus consommateurs avec détails
      const topConsumersWithDetails = await Promise.all(
        topConsumers.map(async (consumer: any) => {
          const vehicle = await prisma.vehicle.findUnique({
            where: { id: consumer.vehicleId },
            select: {
              name: true,
              make: true,
              model: true
            }
          })
          return {
            vehicleId: consumer.vehicleId,
            vehicleName: vehicle?.name || 'Véhicule inconnu',
            vehicleMake: vehicle?.make || '',
            vehicleModel: vehicle?.model || '',
            totalVolume: consumer._sum.volume || 0,
            totalCost: consumer._sum.cost || 0,
            totalUsage: consumer._sum.usage || 0,
            averageMPG: consumer._avg.mpg || 0,
            entriesCount: consumer._count.id || 0
          }
        })
      )

      // Entrées récentes avec détails véhicules
      const recentEntriesWithDetails = recentEntries.map(entry => ({
        id: entry.id,
        date: entry.date,
        vendor: entry.vendor?.name || null,
        volume: entry.volume,
        cost: entry.cost,
        mpg: entry.mpg,
        usage: entry.usage,
        vehicleName: entry.vehicle.name,
        vehicleMake: entry.vehicle.make,
        vehicleModel: entry.vehicle.model
      }))

      const fuelData = {
        summary: {
          fuel: {
            totalVolume: totalFuelVolume,
            totalCost: totalFuelCost,
            totalUsage: totalFuelUsage,
            averageMPG: Math.round(averageMPG * 10) / 10,
            averageCost: Math.round(averageFuelCost * 100) / 100,
            entriesCount: fuelSummary._count.id || 0
          },
          charging: {
            totalEnergyKwh: Math.round(totalChargingEnergy * 100) / 100,
            totalCost: totalChargingCost,
            totalDuration: totalChargingDuration,
            averageCost: Math.round(averageChargingCost * 100) / 100,
            averageEnergyPerSession: Math.round(averageEnergyPerSession * 100) / 100,
            sessionsCount: chargingSummary._count.id || 0
          },
          period
        },
        monthlyTrends,
        topConsumers: topConsumersWithDetails,
        recentEntries: recentEntriesWithDetails,
        lastUpdated: new Date().toISOString()
      }

      logAction('GET Fuel - Success', userId, { 
        userId, 
        period,
        totalFuelCost: totalFuelCost.toFixed(2),
        totalChargingCost: totalChargingCost.toFixed(2),
        averageMPG: averageMPG.toFixed(1)
      })

      return NextResponse.json(
        {
          success: true,
          data: fuelData
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('GET Fuel - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des données carburant' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Fuel - Server error', userId, {
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