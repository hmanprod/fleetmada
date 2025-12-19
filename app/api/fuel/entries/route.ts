import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { FuelEntryFilters, PaginatedFuelEntries } from '@/types/fuel'

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
      console.log('[Fuel Entries API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Fuel Entries API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Fuel Entries API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction pour construire les filtres WHERE
const buildWhereClause = (filters: FuelEntryFilters, userId: string) => {
  const where: any = {
    userId: userId // Filtrer par utilisateur
  }

  if (filters.vehicleId) {
    where.vehicleId = filters.vehicleId
  }

  if (filters.startDate || filters.endDate) {
    where.date = {}
    if (filters.startDate) {
      where.date.gte = new Date(filters.startDate)
    }
    if (filters.endDate) {
      where.date.lte = new Date(filters.endDate)
    }
  }

  if (filters.vendor) {
    where.vendor = {
      contains: filters.vendor,
      mode: 'insensitive'
    }
  }

  if (filters.minCost !== undefined) {
    where.cost = { ...where.cost, gte: filters.minCost }
  }

  if (filters.maxCost !== undefined) {
    where.cost = { ...where.cost, lte: filters.maxCost }
  }

  if (filters.minVolume !== undefined) {
    where.volume = { ...where.volume, gte: filters.minVolume }
  }

  if (filters.maxVolume !== undefined) {
    where.volume = { ...where.volume, lte: filters.maxVolume }
  }

  if (filters.search) {
    where.OR = [
      { vendor: { contains: filters.search, mode: 'insensitive' } },
      { vehicle: { name: { contains: filters.search, mode: 'insensitive' } } }
    ]
  }

  return where
}

// Fonction pour construire l'ordre de tri
const buildOrderBy = (sortBy?: string, sortOrder?: string) => {
  const orderBy: any = {}
  
  switch (sortBy) {
    case 'date':
      orderBy.date = sortOrder === 'desc' ? 'desc' : 'asc'
      break
    case 'cost':
      orderBy.cost = sortOrder === 'desc' ? 'desc' : 'asc'
      break
    case 'volume':
      orderBy.volume = sortOrder === 'desc' ? 'desc' : 'asc'
      break
    case 'mpg':
      orderBy.mpg = sortOrder === 'desc' ? 'desc' : 'asc'
      break
    default:
      orderBy.createdAt = 'desc'
      break
  }
  
  return orderBy
}

// GET /api/fuel/entries - Liste paginée avec filtres
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

    // Récupération des paramètres de requête
    const { searchParams } = new URL(request.url)
    const filters: FuelEntryFilters = {
      vehicleId: searchParams.get('vehicleId') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      vendor: searchParams.get('vendor') || undefined,
      minCost: searchParams.get('minCost') ? parseFloat(searchParams.get('minCost')!) : undefined,
      maxCost: searchParams.get('maxCost') ? parseFloat(searchParams.get('maxCost')!) : undefined,
      minVolume: searchParams.get('minVolume') ? parseFloat(searchParams.get('minVolume')!) : undefined,
      maxVolume: searchParams.get('maxVolume') ? parseFloat(searchParams.get('maxVolume')!) : undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      sortBy: (searchParams.get('sortBy') as any) || undefined,
      sortOrder: (searchParams.get('sortOrder') as any) || undefined
    }

    logAction('GET_FUEL_ENTRIES', user.userId, { filters })

    const where = buildWhereClause(filters, user.userId)
    const orderBy = buildOrderBy(filters.sortBy, filters.sortOrder)
    const skip = (filters.page! - 1) * filters.limit!

    // Récupération des données avec pagination
    const [entries, total] = await Promise.all([
      prisma.fuelEntry.findMany({
        where,
        include: {
          vehicle: {
            select: {
              id: true,
              name: true,
              vin: true,
              make: true,
              model: true,
              year: true,
              type: true,
              status: true
            }
          }
        },
        orderBy,
        skip,
        take: filters.limit
      }),
      prisma.fuelEntry.count({ where })
    ])

    // Conversion au format attendu par le frontend
    const formattedEntries = entries.map(entry => ({
      id: entry.id,
      vehicleId: entry.vehicleId,
      userId: entry.userId,
      date: entry.date.toISOString(),
      vendor: entry.vendorName || '',
      usage: entry.usage || 0,
      volume: entry.volume,
      cost: entry.cost,
      mpg: entry.mpg || undefined,
      odometer: undefined,
      fuelType: '',
      fuelCard: false,
      reference: '',
      notes: '',
      receipt: '',
      location: '',
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.createdAt.toISOString(),

      vehicle: entry.vehicle
    }))

    const totalPages = Math.ceil(total / filters.limit!)
    const result: PaginatedFuelEntries = {
      entries: formattedEntries,
      total,
      page: filters.page!,
      totalPages,
      hasNext: filters.page! < totalPages,
      hasPrev: filters.page! > 1
    }

    logAction('GET_FUEL_ENTRIES_SUCCESS', user.userId, { count: entries.length, total, page: filters.page })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[Fuel Entries API] GET Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des entrées carburant' },
      { status: 500 }
    )
  }
}

// POST /api/fuel/entries - Création nouvelle entrée carburant
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
    
    // Validation des données
    if (!body.vehicleId || !body.date || !body.volume || body.cost === undefined) {
      return NextResponse.json(
        { error: 'vehicleId, date, volume et cost sont requis' },
        { status: 400 }
      )
    }

    // Validation des valeurs numériques
    if (body.volume <= 0) {
      return NextResponse.json({ error: 'Le volume doit être supérieur à 0' }, { status: 400 })
    }

    if (body.cost < 0) {
      return NextResponse.json({ error: 'Le coût ne peut pas être négatif' }, { status: 400 })
    }

    // Vérification que le véhicule appartient à l'utilisateur
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: body.vehicleId,
        userId: user.userId
      }
    })

    if (!vehicle) {
      return NextResponse.json({ error: 'Véhicule non trouvé' }, { status: 404 })
    }

    logAction('CREATE_FUEL_ENTRY', user.userId, { 
      vehicleId: body.vehicleId, 
      volume: body.volume, 
      cost: body.cost 
    })

    // Création de l'entrée avec le schéma correct
    const newEntry = await prisma.fuelEntry.create({
      data: {
        vehicleId: body.vehicleId,
        userId: user.userId,
        date: new Date(body.date),
        vendor: body.vendor || null,
        usage: body.usage || null,
        volume: body.volume,
        cost: body.cost,
        mpg: body.mpg || null
      },
      include: {
        vehicle: {
          select: {
            id: true,
            name: true,
            vin: true,
            make: true,
            model: true,
            year: true,
            type: true,
            status: true
          }
        }
      }
    })

    // Format de réponse
    const formattedEntry = {
      id: newEntry.id,
      vehicleId: newEntry.vehicleId,
      userId: newEntry.userId,
      date: newEntry.date.toISOString(),
      vendor: newEntry.vendorName || '',
      usage: newEntry.usage || 0,
      volume: newEntry.volume,
      cost: newEntry.cost,
      mpg: newEntry.mpg || undefined,
      odometer: undefined,
      fuelType: '',
      fuelCard: false,
      reference: '',
      notes: '',
      receipt: '',
      location: '',
      createdAt: newEntry.createdAt.toISOString(),
      updatedAt: newEntry.createdAt.toISOString(),
      vehicle: newEntry.vehicle
    }

    logAction('CREATE_FUEL_ENTRY_SUCCESS', user.userId, { entryId: newEntry.id })

    return NextResponse.json(formattedEntry, { status: 201 })
  } catch (error) {
    console.error('[Fuel Entries API] POST Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'entrée carburant' },
      { status: 500 }
    )
  }
}