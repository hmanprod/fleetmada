import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { ChargingStats } from '@/types/fuel'

// Interface pour les données du token JWT décodé
interface TokenPayload {
  userId: string
  email: string
  type: string
  iat: number
  exp?: number
}

// Interface pour les paramètres de période
interface StatsPeriod {
  period: string
  startDate: Date
  endDate: Date
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Charging Stats API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Charging Stats API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Charging Stats API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction pour obtenir la période
const getPeriod = (period: string): StatsPeriod => {
  const now = new Date()
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  
  switch (period) {
    case '7d':
      return {
        period: '7d',
        startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        endDate
      }
    case '30d':
      return {
        period: '30d',
        startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        endDate
      }
    case '90d':
      return {
        period: '90d',
        startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        endDate
      }
    case '1y':
      return {
        period: '1y',
        startDate: new Date(now.getFullYear(), now.getMonth() - 12, now.getDate()),
        endDate
      }
    default:
      return {
        period: '30d',
        startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        endDate
      }
  }
}

// GET /api/charging/entries/stats - Statistiques et métriques
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token d\'authentification manquant' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = validateToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Récupération des paramètres
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'
    const vehicleId = searchParams.get('vehicleId') || undefined

    const periodData = getPeriod(period)

    logAction('GET_CHARGING_STATS', user.userId, { period, vehicleId })

    // Construction du filtre WHERE
    const where: any = {
      userId: user.userId,
      date: {
        gte: periodData.startDate,
        lte: periodData.endDate
      }
    }

    if (vehicleId) {
      where.vehicleId = vehicleId
    }

    // Récupération des données de base
    const [
      totalEntries,
      totalCostResult,
      totalEnergyKwhResult,
      totalDurationResult,
      costByVehicle,
      monthlyTrends
    ] = await Promise.all([
      // Nombre total d'entrées
      prisma.chargingEntry.count({ where }),
      
      // Coût total
      prisma.chargingEntry.aggregate({
        where,
        _sum: { cost: true }
      }),
      
      // Énergie totale en kWh
      prisma.chargingEntry.aggregate({
        where,
        _sum: { energyKwh: true }
      }),
      
      // Durée totale
      prisma.chargingEntry.aggregate({
        where: { ...where, durationMin: { not: null } },
        _sum: { durationMin: true }
      }),
      
      // Coût par véhicule
      prisma.chargingEntry.groupBy({
        by: ['vehicleId'],
        where,
        _sum: { cost: true },
        _count: { id: true }
      }),
      
      // Tendances mensuelles
      prisma.chargingEntry.groupBy({
        by: ['date'],
        where,
        _sum: { cost: true, energyKwh: true }
      })
    ])

    // Récupération des informations des véhicules pour le coût par véhicule
    const vehicleIds = costByVehicle.map(item => item.vehicleId)
    const vehicles = await prisma.vehicle.findMany({
      where: { id: { in: vehicleIds } },
      select: { id: true, name: true }
    })

    // Formatage des coûts par véhicule
    const formattedCostByVehicle = costByVehicle.map(item => {
      const vehicle = vehicles.find(v => v.id === item.vehicleId)
      return {
        vehicleId: item.vehicleId,
        vehicleName: vehicle?.name || 'Véhicule inconnu',
        cost: item._sum.cost || 0
      }
    })

    // Formatage des tendances mensuelles
    const monthlyData: { [key: string]: { cost: number; energyKwh: number } } = {}
    
    monthlyTrends.forEach(item => {
      const monthKey = `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(2, '0')}`
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { cost: 0, energyKwh: 0 }
      }
      monthlyData[monthKey].cost += (item._sum as any).cost || 0
      monthlyData[monthKey].energyKwh += (item._sum as any).energyKwh || 0
    })

    const formattedMonthlyTrends = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        cost: data.cost,
        energyKwh: data.energyKwh
      }))

    // Calcul des métriques dérivées
    const totalCost = totalCostResult._sum.cost || 0
    const totalEnergyKwh = totalEnergyKwhResult._sum.energyKwh || 0
    const totalDuration = totalDurationResult._sum.durationMin || 0
    const averageCostPerKwh = totalEnergyKwh > 0 ? totalCost / totalEnergyKwh : 0
    const averageDuration = totalEntries > 0 ? totalDuration / totalEntries : 0

    // Création des statistiques
    const stats: ChargingStats = {
      totalCost,
      totalEnergyKwh,
      totalDuration,
      totalEntries,
      averageCostPerKwh,
      period: periodData.period,
      costByVehicle: formattedCostByVehicle,
      costByVendor: [], // Pas de champ vendor dans le schéma actuel
      monthlyTrends: formattedMonthlyTrends
    }

    logAction('GET_CHARGING_STATS_SUCCESS', user.userId, {
      totalEntries,
      totalCost,
      totalEnergyKwh,
      period: periodData.period
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error('[Charging Stats API] Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques de recharge' },
      { status: 500 }
    )
  }
}

// POST /api/charging/entries/stats/calculate-efficiency - Calculer l'efficacité énergétique
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token d\'authentification manquant' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = validateToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    const body = await request.json()
    const { vehicleId } = body

    if (!vehicleId) {
      return NextResponse.json({ error: 'vehicleId requis' }, { status: 400 })
    }

    // Vérification que le véhicule appartient à l'utilisateur
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        userId: user.userId
      }
    })

    if (!vehicle) {
      return NextResponse.json({ error: 'Véhicule non trouvé' }, { status: 404 })
    }

    logAction('CALCULATE_EFFICIENCY', user.userId, { vehicleId })

    // Récupération des entrées de recharge du véhicule
    const chargingEntries = await prisma.chargingEntry.findMany({
      where: {
        vehicleId,
        userId: user.userId
      },
      orderBy: { date: 'desc' },
      take: 50 // Limiter aux 50 dernières entrées
    })

    if (chargingEntries.length === 0) {
      return NextResponse.json({ 
        message: 'Aucune entrée de recharge trouvée pour ce véhicule' 
      })
    }

    // Calcul des métriques d'efficacité
    const totalCost = chargingEntries.reduce((sum, entry) => sum + entry.cost, 0)
    const totalEnergyKwh = chargingEntries.reduce((sum, entry) => sum + entry.energyKwh, 0)
    const totalDuration = chargingEntries.reduce((sum, entry) => sum + (entry.durationMin || 0), 0)

    const averageCostPerKwh = totalEnergyKwh > 0 ? totalCost / totalEnergyKwh : 0
    const averageDuration = chargingEntries.length > 0 ? totalDuration / chargingEntries.length : 0
    const averageEnergyPerSession = chargingEntries.length > 0 ? totalEnergyKwh / chargingEntries.length : 0

    logAction('CALCULATE_EFFICIENCY_SUCCESS', user.userId, {
      vehicleId,
      totalEntries: chargingEntries.length,
      averageCostPerKwh: Math.round(averageCostPerKwh * 100) / 100,
      averageEnergyPerSession: Math.round(averageEnergyPerSession * 100) / 100
    })

    return NextResponse.json({
      message: 'Efficacité énergétique calculée avec succès',
      vehicleId,
      totalEntries: chargingEntries.length,
      totalCost,
      totalEnergyKwh,
      totalDuration,
      averageCostPerKwh: Math.round(averageCostPerKwh * 100) / 100,
      averageEnergyPerSession: Math.round(averageEnergyPerSession * 100) / 100,
      averageDuration: Math.round(averageDuration)
    })
  } catch (error) {
    console.error('[Charging Stats API] POST Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du calcul de l\'efficacité énergétique' },
      { status: 500 }
    )
  }
}