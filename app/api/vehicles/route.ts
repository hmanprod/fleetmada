import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  CreateVehicleSchema,
  VehicleListQuerySchema,
  type CreateVehicleInput,
  type VehicleListQuery
} from '@/lib/validations/vehicle-validations'
import jwt from 'jsonwebtoken'

// Interface pour les données du token JWT décodé
interface TokenPayload {
  userId: string
  email: string
  type: string
  iat: number
  exp?: number
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Vehicles API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Vehicles API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Vehicles API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction utilitaire pour construire les filtres de recherche
const buildVehicleFilters = (query: VehicleListQuery, userId: string, companyId: string | null) => {
  const filters: any = {}

  if (companyId) {
    filters.user = { companyId }
  } else {
    filters.userId = userId
  }

  if (query.search) {
    filters.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { make: { contains: query.search, mode: 'insensitive' } },
      { model: { contains: query.search, mode: 'insensitive' } },
      { vin: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  // Dynamic Filters parsing
  Object.keys(query).forEach(key => {
    const value = query[key]
    if (value === undefined || value === null || value === '' || key === 'page' || key === 'limit' || key === 'search' || key === 'sortBy' || key === 'sortOrder') return

    // Handle range suffixes
    if (key.endsWith('_gte')) {
      const field = key.replace('_gte', '')
      const isDateField = ['inServiceDate', 'purchaseDate', 'outOfServiceDate'].includes(field)
      filters[field] = { ...filters[field], gte: isDateField ? new Date(value as string) : (isNaN(Number(value)) ? value : Number(value)) }
    } else if (key.endsWith('_lte')) {
      const field = key.replace('_lte', '')
      const isDateField = ['inServiceDate', 'purchaseDate', 'outOfServiceDate'].includes(field)
      filters[field] = { ...filters[field], lte: isDateField ? new Date(value as string) : (isNaN(Number(value)) ? value : Number(value)) }
    }
    // Handle multi-value fields (comma separated)
    else if (typeof value === 'string' && value.includes(',')) {
      const values = value.split(',').map(v => v.trim())
      filters[key] = { in: values }
    }
    // Handle specific fields with contains mode
    else if (['group', 'operator', 'make', 'model', 'purchaseVendor'].includes(key) && typeof value === 'string') {
      filters[key] = { contains: value, mode: 'insensitive' }
    }
    // Default exact match
    else {
      filters[key] = value
    }
  })

  return filters
}

// Fonction utilitaire pour construire l'ordre de tri
const buildOrderBy = (query: VehicleListQuery) => {
  const orderBy: any = {}

  if (query.sortBy === 'name' || query.sortBy === 'year' || query.sortBy === 'status' ||
    query.sortBy === 'createdAt' || query.sortBy === 'updatedAt') {
    orderBy[query.sortBy] = query.sortOrder
  } else {
    orderBy.name = 'asc'
  }

  return orderBy
}

// GET /api/vehicles - Liste paginée avec filtres
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Vehicles - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Vehicles - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Vehicles - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('GET Vehicles - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    // Récupération du companyId de l'utilisateur
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true }
    })

    const companyId = currentUser?.companyId || null

    // Extraction et validation des paramètres de requête
    const { searchParams } = new URL(request.url)
    const queryParams: any = {}

    for (const [key, value] of searchParams.entries()) {
      queryParams[key] = value
    }

    const result = VehicleListQuerySchema.safeParse(queryParams)
    if (!result.success) {
      logAction('GET Vehicles - Validation Error', userId, result.error.format())
      return NextResponse.json(
        { success: false, error: 'Paramètres de requête invalides', details: result.error.format() },
        { status: 400 }
      )
    }

    const query = result.data
    const offset = (query.page - 1) * query.limit

    logAction('GET Vehicles', userId, {
      userId,
      page: query.page,
      limit: query.limit,
      filters: {
        search: query.search,
        status: query.status,
        type: query.type,
        ownership: query.ownership,
        group: query.group,
        operator: query.operator
      }
    })

    try {
      // Construction des filtres et de l'ordre
      const filters = buildVehicleFilters(query, userId, companyId)
      const orderBy = buildOrderBy(query)

      // Récupération des véhicules avec pagination
      const [vehicles, totalCount] = await Promise.all([
        prisma.vehicle.findMany({
          where: filters,
          orderBy,
          skip: offset,
          take: query.limit,
          include: {
            _count: {
              select: {
                fuelEntries: true,
                serviceEntries: true,
                issues: true,
                chargingEntries: true,
                meterEntries: true,
                reminders: true,
                expenses: true,
                assignments: true
              }
            }
          }
        }),
        prisma.vehicle.count({
          where: filters
        })
      ])

      // Récupération de la dernière lecture de compteur pour chaque véhicule
      const vehiclesWithLastMeterReading = await Promise.all(
        vehicles.map(async (vehicle) => {
          const lastMeterReading = await prisma.meterEntry.findFirst({
            where: {
              vehicleId: vehicle.id,
              type: 'MILEAGE',
              void: false
            },
            orderBy: {
              date: 'desc'
            },
            select: {
              value: true,
              date: true,
              unit: true
            }
          })

          // Calcul des coûts récents (30 derniers jours)
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

          const [fuelCosts, serviceCosts, chargingCosts, expenseCosts] = await Promise.all([
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
            }),
            prisma.expenseEntry.aggregate({
              where: {
                vehicleId: vehicle.id,
                date: { gte: thirtyDaysAgo }
              },
              _sum: { amount: true }
            })
          ])

          const recentCosts = (fuelCosts._sum.cost || 0) +
            (serviceCosts._sum.totalCost || 0) +
            (chargingCosts._sum.cost || 0) +
            (expenseCosts._sum.amount || 0)

          return {
            id: vehicle.id,
            name: vehicle.name,
            vin: vehicle.vin,
            type: vehicle.type,
            year: vehicle.year,
            make: vehicle.make,
            model: vehicle.model,
            status: vehicle.status,
            ownership: vehicle.ownership,
            labels: vehicle.labels || [],
            serviceProgram: vehicle.serviceProgram,
            image: vehicle.image,
            licensePlate: (vehicle as any).licensePlate,
            meterReading: (vehicle as any).meterReading,
            passengerCount: (vehicle as any).passengerCount,
            // Lifecycle
            inServiceDate: vehicle.inServiceDate,
            inServiceOdometer: vehicle.inServiceOdometer,
            estimatedServiceLifeMonths: vehicle.estimatedServiceLifeMonths,
            estimatedServiceLifeMiles: vehicle.estimatedServiceLifeMiles,
            estimatedResaleValue: vehicle.estimatedResaleValue,
            outOfServiceDate: vehicle.outOfServiceDate,
            outOfServiceOdometer: vehicle.outOfServiceOdometer,
            // Purchase information
            purchaseVendor: vehicle.purchaseVendor,
            purchaseDate: vehicle.purchaseDate,
            purchasePrice: vehicle.purchasePrice,
            purchaseOdometer: vehicle.purchaseOdometer,
            purchaseNotes: vehicle.purchaseNotes,
            loanLeaseType: vehicle.loanLeaseType,
            // Settings
            primaryMeter: vehicle.primaryMeter,
            fuelUnit: vehicle.fuelUnit,
            measurementUnits: vehicle.measurementUnits,
            // Computed/Other
            group: vehicle.group,
            operator: vehicle.operator,
            lastMeterReading: lastMeterReading?.value || null,
            lastMeterDate: lastMeterReading?.date || null,
            lastMeterUnit: lastMeterReading?.unit || 'mi',
            metrics: {
              fuelEntries: vehicle._count.fuelEntries,
              serviceEntries: vehicle._count.serviceEntries,
              issues: vehicle._count.issues,
              chargingEntries: vehicle._count.chargingEntries,
              meterEntries: vehicle._count.meterEntries,
              reminders: vehicle._count.reminders,
              expenses: vehicle._count.expenses,
              assignments: vehicle._count.assignments
            },
            recentCosts: Math.round(recentCosts * 100) / 100,
            createdAt: vehicle.createdAt,
            updatedAt: vehicle.updatedAt
          }
        })
      )

      const totalPages = Math.ceil(totalCount / query.limit)

      logAction('GET Vehicles - Success', userId, {
        userId,
        totalCount,
        page: query.page,
        totalPages
      })

      return NextResponse.json(
        {
          success: true,
          data: {
            vehicles: vehiclesWithLastMeterReading,
            pagination: {
              page: query.page,
              limit: query.limit,
              totalCount,
              totalPages,
              hasNext: query.page < totalPages,
              hasPrev: query.page > 1
            }
          }
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('GET Vehicles - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des véhicules' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Vehicles - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// POST /api/vehicles - Création d'un nouveau véhicule
export async function POST(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('POST Vehicles - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('POST Vehicles - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('POST Vehicles - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('POST Vehicles - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    // Extraction et validation des données
    const body = await request.json()
    const vehicleData = CreateVehicleSchema.parse(body)

    logAction('POST Vehicles', userId, {
      userId,
      vehicleName: vehicleData.name,
      vehicleVin: vehicleData.vin
    })

    try {
      // Vérification que le VIN n'existe pas déjà
      const existingVehicle = await prisma.vehicle.findUnique({
        where: { vin: vehicleData.vin }
      })

      if (existingVehicle) {
        logAction('POST Vehicles - VIN already exists', userId, {
          vin: vehicleData.vin
        })

        return NextResponse.json(
          { success: false, error: 'Un véhicule avec ce VIN existe déjà' },
          { status: 409 }
        )
      }

      // Création du véhicule
      const newVehicle = await prisma.vehicle.create({
        data: {
          ...vehicleData,
          userId,
          // Conversion des dates
          inServiceDate: vehicleData.inServiceDate ? new Date(vehicleData.inServiceDate) : null,
          purchaseDate: vehicleData.purchaseDate ? new Date(vehicleData.purchaseDate) : null,
          outOfServiceDate: vehicleData.outOfServiceDate ? new Date(vehicleData.outOfServiceDate) : null,
        }
      })

      logAction('POST Vehicles - Success', userId, {
        userId,
        vehicleId: newVehicle.id,
        vehicleName: newVehicle.name
      })

      return NextResponse.json(
        {
          success: true,
          data: newVehicle,
          message: 'Véhicule créé avec succès'
        },
        { status: 201 }
      )

    } catch (dbError) {
      logAction('POST Vehicles - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création du véhicule' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'

    // Gestion des erreurs de validation
    if (error instanceof Error && error.name === 'ZodError') {
      logAction('POST Vehicles - Validation error', userId, {
        error: error.message
      })

      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.message },
        { status: 400 }
      )
    }

    logAction('POST Vehicles - Server error', userId, {
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
export async function PUT() {
  return NextResponse.json(
    { error: 'Méthode non autorisée. Utilisez /api/vehicles/[id] pour la modification' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Méthode non autorisée. Utilisez /api/vehicles/[id] pour la suppression' },
    { status: 405 }
  )
}