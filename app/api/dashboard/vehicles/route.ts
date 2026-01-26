import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateToken, getBaseFilter } from '@/lib/api-utils'

// Interface pour les paramètres de requête
interface VehicleQueryParams {
  status?: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'DISPOSED'
  limit?: string
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Dashboard Vehicles API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// GET /api/dashboard/vehicles - Métriques détaillées des véhicules
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const tokenPayload = validateToken(request)

    if (!tokenPayload) {
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const { userId, role, companyId, email } = tokenPayload

    // Extraction des paramètres de requête
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as VehicleQueryParams['status'] || undefined
    const limit = parseInt(searchParams.get('limit') || '10')

    logAction('GET Vehicles', userId, { role, status, limit })

    // Base filter: by company if available, otherwise by user
    const baseFilter = getBaseFilter(tokenPayload, 'user')

    // Role-specific filters
    const isDriver = role === 'DRIVER'

    // For vehicles, drivers see only their assigned vehicles
    const vehicleFilter: any = isDriver ? { assignments: { some: { contact: { email }, status: 'ACTIVE' } } } : baseFilter

    try {
      const [
        totalVehicles,
        vehiclesByStatus,
        vehiclesByType,
        recentVehicles,
        vehiclesWithMetrics,
        inactiveVehicles
      ] = await Promise.all([
        // Total des véhicules
        prisma.vehicle.count({
          where: vehicleFilter
        }),

        // Véhicules par statut
        prisma.vehicle.groupBy({
          by: ['status'],
          where: vehicleFilter,
          _count: { id: true }
        }),

        // Véhicules par type
        prisma.vehicle.groupBy({
          by: ['type'],
          where: vehicleFilter,
          _count: { id: true },
          orderBy: {
            _count: {
              id: 'desc'
            }
          }
        }),

        // Véhicules récents (ajoutés récemment)
        prisma.vehicle.findMany({
          where: vehicleFilter,
          orderBy: {
            createdAt: 'desc'
          },
          take: 5,
          select: {
            id: true,
            name: true,
            make: true,
            model: true,
            year: true,
            type: true,
            status: true,
            createdAt: true
          }
        }),

        // Véhicules avec métriques détaillées
        prisma.vehicle.findMany({
          where: {
            ...vehicleFilter,
            ...(status && { status })
          },
          orderBy: {
            updatedAt: 'desc'
          },
          take: limit,
          include: {
            _count: {
              select: {
                fuelEntries: true,
                serviceEntries: true,
                issues: true,
                chargingEntries: true,
                reminders: true
              }
            }
          }
        }),

        // Véhicules inactifs
        prisma.vehicle.findMany({
          where: {
            ...vehicleFilter,
            status: 'INACTIVE'
          },
          orderBy: {
            updatedAt: 'desc'
          },
          take: 5,
          select: {
            id: true,
            name: true,
            make: true,
            model: true,
            year: true,
            type: true,
            status: true,
            updatedAt: true
          }
        })
      ])

      // Transformation des données de statut
      const statusBreakdown = vehiclesByStatus.reduce((acc: any, item: any) => {
        acc[item.status.toLowerCase()] = item._count.id
        return acc
      }, {})

      // Transformation des données de type
      const typeBreakdown = vehiclesByType.map((item: any) => ({
        type: item.type,
        count: item._count.id
      }))

      // Transformation des véhicules récents
      const recentVehiclesData = recentVehicles.map(vehicle => ({
        id: vehicle.id,
        name: vehicle.name,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        type: vehicle.type,
        status: vehicle.status,
        createdAt: vehicle.createdAt
      }))

      // Transformation des véhicules avec métriques
      const vehiclesWithMetricsData = await Promise.all(
        vehiclesWithMetrics.map(async (vehicle: any) => {
          // Calcul des coûts récents (30 derniers jours)
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

          const [fuelCosts, serviceCosts, chargingCosts] = await Promise.all([
            prisma.fuelEntry.aggregate({
              where: {
                vehicleId: vehicle.id,
                date: { gte: thirtyDaysAgo }
              },
              _sum: { cost: true }
            }),
            prisma.serviceEntry.aggregate({
              where: {
                vehicleId: vehicle.id,
                date: { gte: thirtyDaysAgo }
              },
              _sum: { totalCost: true }
            }),
            prisma.chargingEntry.aggregate({
              where: {
                vehicleId: vehicle.id,
                date: { gte: thirtyDaysAgo }
              },
              _sum: { cost: true }
            })
          ])

          const recentCosts = (fuelCosts._sum.cost || 0) +
            (serviceCosts._sum.totalCost || 0) +
            (chargingCosts._sum.cost || 0)

          // Dernière lecture de compteur
          const lastMeterReading = await prisma.meterEntry.findFirst({
            where: {
              vehicleId: vehicle.id,
              type: 'MILEAGE'
            },
            orderBy: {
              date: 'desc'
            },
            select: {
              value: true,
              date: true
            }
          })

          return {
            id: vehicle.id,
            name: vehicle.name,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            type: vehicle.type,
            status: vehicle.status,
            meterReading: vehicle.meterReading,
            lastMeterReading: lastMeterReading?.value || null,
            lastMeterDate: lastMeterReading?.date || null,
            metrics: {
              fuelEntries: vehicle._count.fuelEntries,
              serviceEntries: vehicle._count.serviceEntries,
              issues: vehicle._count.issues,
              chargingEntries: vehicle._count.chargingEntries,
              reminders: vehicle._count.reminders
            },
            recentCosts: Math.round(recentCosts * 100) / 100,
            lastUpdated: vehicle.updatedAt
          }
        })
      )

      // Calculs supplémentaires
      const utilizationRate = totalVehicles > 0 ?
        Math.round(((totalVehicles - (statusBreakdown.inactive || 0)) / totalVehicles) * 100) : 0

      const maintenanceRate = totalVehicles > 0 ?
        Math.round(((statusBreakdown.maintenance || 0) / totalVehicles) * 100) : 0

      const vehiclesData = {
        summary: {
          totalVehicles,
          statusBreakdown,
          typeBreakdown,
          utilizationRate,
          maintenanceRate
        },
        recentVehicles: recentVehiclesData,
        vehiclesWithMetrics: vehiclesWithMetricsData,
        inactiveVehicles: inactiveVehicles.map(vehicle => ({
          id: vehicle.id,
          name: vehicle.name,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          type: vehicle.type,
          status: vehicle.status,
          lastActive: vehicle.updatedAt
        })),
        lastUpdated: new Date().toISOString()
      }

      return NextResponse.json(
        {
          success: true,
          data: vehiclesData
        },
        { status: 200 }
      )

    } catch (dbError) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des données des véhicules' },
        { status: 500 }
      )
    }

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// Gestion des autres méthodes
export async function POST() {
  return NextResponse.json({ error: 'Méthode non autorisée' }, { status: 405 })
}
export async function PUT() {
  return NextResponse.json({ error: 'Méthode non autorisée' }, { status: 405 })
}
export async function DELETE() {
  return NextResponse.json({ error: 'Méthode non autorisée' }, { status: 405 })
}