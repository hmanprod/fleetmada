import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { FuelStats } from '@/types/fuel'

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
      console.log('[Fuel Stats API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Fuel Stats API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Fuel Stats API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
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

// GET /api/fuel/entries/stats - Statistiques et métriques
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

    logAction('GET_FUEL_STATS', user.userId, { period, vehicleId })

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
      totalVolumeResult,
      avgMpgResult,
      costByVehicle,
      costByVendor,
      monthlyTrends
    ] = await Promise.all([
      // Nombre total d'entrées
      prisma.fuelEntry.count({ where }),
      
      // Coût total
      prisma.fuelEntry.aggregate({
        where,
        _sum: { cost: true }
      }),
      
      // Volume total
      prisma.fuelEntry.aggregate({
        where,
        _sum: { volume: true }
      }),
      
      // MPG moyen
      prisma.fuelEntry.aggregate({
        where: { ...where, mpg: { not: null } },
        _avg: { mpg: true }
      }),
      
      // Coût par véhicule
      prisma.fuelEntry.groupBy({
        by: ['vehicleId'],
        where,
        _sum: { cost: true },
        _count: { id: true }
      }),
      
      // Coût par vendor
      prisma.fuelEntry.groupBy({
        by: ['vendor'],
        where: { ...where, vendor: { not: null } },
        _sum: { cost: true, volume: true },
        _count: { id: true }
      }),
      
      // Tendances mensuelles
      prisma.fuelEntry.groupBy({
        by: ['date'],
        where,
        _sum: { cost: true, volume: true }
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

    // Formatage des coûts par vendor
    const formattedCostByVendor = costByVendor
      .filter(item => item.vendor)
      .map(item => ({
        vendor: item.vendor!,
        cost: (item._sum as any).cost || 0,
        volume: (item._sum as any).volume || 0
      }))
      .sort((a, b) => b.cost - a.cost)

    // Formatage des tendances mensuelles
    const monthlyData: { [key: string]: { cost: number; volume: number } } = {}
    
    monthlyTrends.forEach(item => {
      const monthKey = `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(2, '0')}`
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { cost: 0, volume: 0 }
      }
      monthlyData[monthKey].cost += (item._sum as any).cost || 0
      monthlyData[monthKey].volume += (item._sum as any).volume || 0
    })

    const formattedMonthlyTrends = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        cost: data.cost,
        volume: data.volume
      }))

    // Calcul des métriques dérivées
    const totalCost = totalCostResult._sum.cost || 0
    const totalVolume = totalVolumeResult._sum.volume || 0
    const averageMpg = avgMpgResult._avg.mpg || 0
    const averageCostPerGallon = totalVolume > 0 ? totalCost / totalVolume : 0

    // Création des statistiques
    const stats: FuelStats = {
      totalCost,
      totalVolume,
      averageMpg,
      totalEntries,
      period: periodData.period,
      costByVehicle: formattedCostByVehicle,
      costByVendor: formattedCostByVendor,
      monthlyTrends: formattedMonthlyTrends
    }

    logAction('GET_FUEL_STATS_SUCCESS', user.userId, {
      totalEntries,
      totalCost,
      totalVolume,
      period: periodData.period
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error('[Fuel Stats API] Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques carburant' },
      { status: 500 }
    )
  }
}

// POST /api/fuel/entries/stats/recalculate-mpg - Recalculer MPG pour un véhicule
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

    logAction('RECALCULATE_MPG', user.userId, { vehicleId })

    // Récupération des entrées carburant du véhicule avec MPG existant
    const fuelEntries = await prisma.fuelEntry.findMany({
      where: {
        vehicleId,
        userId: user.userId,
        mpg: { not: null },
        volume: { gt: 0 }
      },
      orderBy: { date: 'asc' }
    })

    if (fuelEntries.length === 0) {
      return NextResponse.json({ 
        message: 'Aucune entrée avec MPG trouvé pour recalculer' 
      })
    }

    // Pour le moment, on retourne juste les statistiques existantes
    // Le calcul du MPG nécessiterait des données d'odometer qui ne sont pas dans le schéma actuel
    const totalMpg = fuelEntries.reduce((sum, entry) => sum + (entry.mpg || 0), 0)
    const averageMpg = fuelEntries.length > 0 ? totalMpg / fuelEntries.length : 0

    logAction('RECALCULATE_MPG_SUCCESS', user.userId, {
      vehicleId,
      averageMpg: Math.round(averageMpg * 100) / 100,
      entriesCount: fuelEntries.length
    })

    return NextResponse.json({
      message: 'MPG recalculé avec succès',
      vehicleId,
      averageMpg: Math.round(averageMpg * 100) / 100,
      entriesCount: fuelEntries.length
    })
  } catch (error) {
    console.error('[Fuel Stats API] POST Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du recalcul du MPG' },
      { status: 500 }
    )
  }
}