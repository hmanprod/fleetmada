import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { 
  CreateMeterEntrySchema, 
  MeterEntriesQuerySchema,
  type CreateMeterEntryInput,
  type MeterEntriesQuery 
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
  console.log(`[Meter Entries API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Meter Entries API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Meter Entries API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction utilitaire pour vérifier l'accès au véhicule
const checkVehicleAccess = async (vehicleId: string, userId: string) => {
  const vehicle = await prisma.vehicle.findFirst({
    where: {
      id: vehicleId,
      userId
    }
  })

  if (!vehicle) {
    return null
  }

  return vehicle
}

// Fonction utilitaire pour construire les filtres de recherche
const buildMeterEntryFilters = (query: MeterEntriesQuery, vehicleId: string) => {
  const filters: any = {
    vehicleId
  }

  if (query.type) {
    filters.type = query.type
  }

  if (query.void !== undefined) {
    filters.void = query.void
  }

  if (query.startDate && query.endDate) {
    filters.date = {
      gte: new Date(query.startDate),
      lte: new Date(query.endDate)
    }
  } else if (query.startDate) {
    filters.date = {
      gte: new Date(query.startDate)
    }
  } else if (query.endDate) {
    filters.date = {
      lte: new Date(query.endDate)
    }
  }

  return filters
}

// Fonction utilitaire pour construire l'ordre de tri
const buildOrderBy = (query: MeterEntriesQuery) => {
  const orderBy: any = {}
  
  if (query.sortBy === 'date' || query.sortBy === 'value' || query.sortBy === 'createdAt') {
    orderBy[query.sortBy] = query.sortOrder
  } else {
    orderBy.date = 'desc'
  }
  
  return orderBy
}

// GET /api/vehicles/[id]/meter-entries - Liste paginée des entrées de compteur
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const vehicleId = params.id

    if (!vehicleId) {
      return NextResponse.json(
        { success: false, error: 'ID du véhicule manquant' },
        { status: 400 }
      )
    }

    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Meter Entries - Missing authorization header', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Meter Entries - Invalid authorization header format', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Meter Entries - Invalid token', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('GET Meter Entries - Missing user ID in token', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    // Extraction et validation des paramètres de requête
    const { searchParams } = new URL(request.url)
    const queryParams: any = {}
    
    for (const [key, value] of searchParams.entries()) {
      queryParams[key] = value
    }

    const query = MeterEntriesQuerySchema.parse(queryParams)
    
    const offset = (query.page - 1) * query.limit

    logAction('GET Meter Entries', userId, { 
      userId, 
      vehicleId,
      page: query.page, 
      limit: query.limit,
      filters: { 
        type: query.type, 
        void: query.void,
        startDate: query.startDate,
        endDate: query.endDate
      }
    })

    try {
      // Vérification de l'accès au véhicule
      const vehicle = await checkVehicleAccess(vehicleId, userId)

      if (!vehicle) {
        logAction('GET Meter Entries - Vehicle not found or access denied', userId, { vehicleId })
        return NextResponse.json(
          { success: false, error: 'Véhicule non trouvé ou accès refusé' },
          { status: 404 }
        )
      }

      // Construction des filtres et de l'ordre
      const filters = buildMeterEntryFilters(query, vehicleId)
      const orderBy = buildOrderBy(query)

      // Récupération des entrées de compteur avec pagination
      const [meterEntries, totalCount] = await Promise.all([
        prisma.meterEntry.findMany({
          where: filters,
          orderBy,
          skip: offset,
          take: query.limit
        }),
        prisma.meterEntry.count({
          where: filters
        })
      ])

      // Transformation des données pour l'API
      const meterEntriesData = meterEntries.map(entry => ({
        id: entry.id,
        vehicleId: entry.vehicleId,
        date: entry.date,
        value: entry.value,
        type: entry.type,
        unit: entry.unit,
        isVoid: entry.void,
        voidStatus: entry.voidStatus,
        autoVoidReason: entry.autoVoidReason,
        source: entry.source,
        createdAt: entry.createdAt
      }))

      const totalPages = Math.ceil(totalCount / query.limit)

      // Calcul des statistiques
      const stats = {
        totalEntries: totalCount,
        voidEntries: await prisma.meterEntry.count({
          where: { ...filters, void: true }
        }),
        activeEntries: await prisma.meterEntry.count({
          where: { ...filters, void: false }
        }),
        averageValue: totalCount > 0 ? 
          meterEntries.reduce((sum, entry) => sum + entry.value, 0) / totalCount : 0,
        latestReading: meterEntries.length > 0 ? {
          value: meterEntries[0].value,
          date: meterEntries[0].date,
          unit: meterEntries[0].unit
        } : null
      }

      logAction('GET Meter Entries - Success', userId, { 
        userId, 
        vehicleId,
        totalCount,
        page: query.page,
        totalPages
      })

      return NextResponse.json(
        {
          success: true,
          data: {
            meterEntries: meterEntriesData,
            pagination: {
              page: query.page,
              limit: query.limit,
              totalCount,
              totalPages,
              hasNext: query.page < totalPages,
              hasPrev: query.page > 1
            },
            stats
          }
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('GET Meter Entries - Database error', userId, {
        vehicleId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des entrées de compteur' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    const vehicleId = params?.id || 'unknown'
    
    logAction('GET Meter Entries - Server error', userId, {
      vehicleId,
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// POST /api/vehicles/[id]/meter-entries - Création d'une nouvelle entrée de compteur
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const vehicleId = params.id

    if (!vehicleId) {
      return NextResponse.json(
        { success: false, error: 'ID du véhicule manquant' },
        { status: 400 }
      )
    }

    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('POST Meter Entry - Missing authorization header', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('POST Meter Entry - Invalid authorization header format', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('POST Meter Entry - Invalid token', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('POST Meter Entry - Missing user ID in token', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    // Extraction et validation des données
    const body = await request.json()
    const meterEntryData = CreateMeterEntrySchema.parse({
      ...body,
      vehicleId
    })

    logAction('POST Meter Entry', userId, { 
      userId, 
      vehicleId,
      entryValue: meterEntryData.value,
      entryType: meterEntryData.type
    })

    try {
      // Vérification de l'accès au véhicule
      const vehicle = await checkVehicleAccess(vehicleId, userId)

      if (!vehicle) {
        logAction('POST Meter Entry - Vehicle not found or access denied', userId, { vehicleId })
        return NextResponse.json(
          { success: false, error: 'Véhicule non trouvé ou accès refusé' },
          { status: 404 }
        )
      }

      // Vérification de la cohérence des valeurs (pas de recul du compteur)
      if (meterEntryData.type === 'MILEAGE') {
        const lastMileageEntry = await prisma.meterEntry.findFirst({
          where: {
            vehicleId,
            type: 'MILEAGE',
            void: false
          },
          orderBy: {
            date: 'desc'
          }
        })

        if (lastMileageEntry && meterEntryData.value < lastMileageEntry.value) {
          logAction('POST Meter Entry - Invalid mileage value', userId, { 
            vehicleId,
            newValue: meterEntryData.value,
            lastValue: lastMileageEntry.value
          })

          return NextResponse.json(
            { 
              success: false, 
              error: `La valeur du compteur (${meterEntryData.value}) ne peut pas être inférieure à la dernière lecture (${lastMileageEntry.value})` 
            },
            { status: 400 }
          )
        }
      }

      // Création de l'entrée de compteur
      const newMeterEntry = await prisma.meterEntry.create({
        data: {
          ...meterEntryData,
          date: new Date(meterEntryData.date)
        }
      })

      // Mise à jour du meterReading du véhicule si c'est une lecture de mileage
      if (meterEntryData.type === 'MILEAGE') {
        await prisma.vehicle.update({
          where: { id: vehicleId },
          data: { meterReading: meterEntryData.value }
        })
      }

      logAction('POST Meter Entry - Success', userId, { 
        userId, 
        vehicleId,
        meterEntryId: newMeterEntry.id,
        meterEntryValue: newMeterEntry.value
      })

      return NextResponse.json(
        {
          success: true,
          data: {
            id: newMeterEntry.id,
            vehicleId: newMeterEntry.vehicleId,
            date: newMeterEntry.date,
            value: newMeterEntry.value,
            type: newMeterEntry.type,
            unit: newMeterEntry.unit,
            isVoid: newMeterEntry.void,
            voidStatus: newMeterEntry.voidStatus,
            autoVoidReason: newMeterEntry.autoVoidReason,
            source: newMeterEntry.source,
            createdAt: newMeterEntry.createdAt
          },
          message: 'Entrée de compteur créée avec succès'
        },
        { status: 201 }
      )

    } catch (dbError) {
      logAction('POST Meter Entry - Database error', userId, {
        vehicleId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création de l\'entrée de compteur' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    const vehicleId = params?.id || 'unknown'
    
    // Gestion des erreurs de validation
    if (error instanceof Error && error.name === 'ZodError') {
      logAction('POST Meter Entry - Validation error', userId, {
        vehicleId,
        error: error.message
      })

      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.message },
        { status: 400 }
      )
    }

    logAction('POST Meter Entry - Server error', userId, {
      vehicleId,
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
    { error: 'Méthode non autorisée. Utilisez /api/vehicles/[id]/meter-entries/[entryId] pour la modification' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Méthode non autorisée. Utilisez /api/vehicles/[id]/meter-entries/[entryId] pour la suppression' },
    { status: 405 }
  )
}