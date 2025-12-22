import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { ChargingEntryFilters, PaginatedChargingEntries } from '@/types/fuel'

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
      return null
    }

    return decoded
  } catch (error) {
    return null
  }
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Charging Entries API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction pour construire les filtres WHERE
const buildWhereClause = (filters: ChargingEntryFilters, userId: string) => {
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

  if (filters.location) {
    where.location = {
      contains: filters.location,
      mode: 'insensitive'
    }
  }

  if (filters.minCost !== undefined) {
    where.cost = { ...where.cost, gte: filters.minCost }
  }

  if (filters.maxCost !== undefined) {
    where.cost = { ...where.cost, lte: filters.maxCost }
  }

  if (filters.minEnergyKwh !== undefined) {
    where.energyKwh = { ...where.energyKwh, gte: filters.minEnergyKwh }
  }

  if (filters.maxEnergyKwh !== undefined) {
    where.energyKwh = { ...where.energyKwh, lte: filters.maxEnergyKwh }
  }

  if (filters.search) {
    where.OR = [
      { location: { contains: filters.search, mode: 'insensitive' } },
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
    case 'energyKwh':
      orderBy.energyKwh = sortOrder === 'desc' ? 'desc' : 'asc'
      break
    case 'durationMin':
      orderBy.durationMin = sortOrder === 'desc' ? 'desc' : 'asc'
      break
    default:
      orderBy.createdAt = 'desc'
      break
  }

  return orderBy
}

// GET /api/charging/entries - Liste paginée avec filtres
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
    const filters: ChargingEntryFilters = {
      vehicleId: searchParams.get('vehicleId') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      location: searchParams.get('location') || undefined,
      minCost: searchParams.get('minCost') ? parseFloat(searchParams.get('minCost')!) : undefined,
      maxCost: searchParams.get('maxCost') ? parseFloat(searchParams.get('maxCost')!) : undefined,
      minEnergyKwh: searchParams.get('minEnergyKwh') ? parseFloat(searchParams.get('minEnergyKwh')!) : undefined,
      maxEnergyKwh: searchParams.get('maxEnergyKwh') ? parseFloat(searchParams.get('maxEnergyKwh')!) : undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      sortBy: (searchParams.get('sortBy') as any) || undefined,
      sortOrder: (searchParams.get('sortOrder') as any) || undefined
    }

    logAction('GET_CHARGING_ENTRIES', user.userId, { filters })

    const where = buildWhereClause(filters, user.userId)
    const orderBy = buildOrderBy(filters.sortBy, filters.sortOrder)
    const skip = (filters.page! - 1) * filters.limit!

    // Récupération des données avec pagination
    const [entries, total] = await Promise.all([
      prisma.chargingEntry.findMany({
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
      prisma.chargingEntry.count({ where })
    ])

    // Conversion au format attendu par le frontend (uniquement les champs du schéma)
    const formattedEntries = entries.map(entry => ({
      id: entry.id,
      vehicleId: entry.vehicleId,
      userId: entry.userId,
      date: entry.date.toISOString(),
      location: entry.location || '',
      energyKwh: entry.energyKwh,
      cost: entry.cost,
      durationMin: entry.durationMin || 0,
      createdAt: entry.createdAt.toISOString(),

      vehicle: entry.vehicle
    }))

    const totalPages = Math.ceil(total / filters.limit!)
    const result: PaginatedChargingEntries = {
      entries: formattedEntries,
      total,
      page: filters.page!,
      totalPages,
      hasNext: filters.page! < totalPages,
      hasPrev: filters.page! > 1
    }

    logAction('GET_CHARGING_ENTRIES_SUCCESS', user.userId, { count: entries.length, total, page: filters.page })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[Charging Entries API] GET Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des entrées de recharge' },
      { status: 500 }
    )
  }
}

// POST /api/charging/entries - Création nouvelle entrée de recharge
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

    // Validation des données (uniquement les champs du schéma)
    if (!body.vehicleId || !body.date || !body.energyKwh || body.cost === undefined) {
      return NextResponse.json(
        { error: 'vehicleId, date, energyKwh et cost sont requis' },
        { status: 400 }
      )
    }

    // Validation des valeurs numériques
    if (body.energyKwh <= 0) {
      return NextResponse.json({ error: 'L\'énergie en kWh doit être supérieure à 0' }, { status: 400 })
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



    logAction('CREATE_CHARGING_ENTRY', user.userId, {
      vehicleId: body.vehicleId,
      energyKwh: body.energyKwh,
      cost: body.cost
    })

    // Création de l'entrée (uniquement avec les champs du schéma)
    const newEntry = await prisma.chargingEntry.create({
      data: {
        vehicleId: body.vehicleId,
        userId: user.userId,
        date: new Date(body.date),
        location: body.location || null,
        energyKwh: body.energyKwh,
        cost: body.cost,
        durationMin: body.durationMin || null
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

    // Format de réponse (uniquement les champs disponibles)
    const formattedEntry = {
      id: newEntry.id,
      vehicleId: newEntry.vehicleId,
      userId: newEntry.userId,
      date: newEntry.date.toISOString(),
      location: newEntry.location || '',
      energyKwh: newEntry.energyKwh,
      cost: newEntry.cost,
      durationMin: newEntry.durationMin || 0,
      createdAt: newEntry.createdAt.toISOString(),
      vehicle: newEntry.vehicle
    }

    logAction('CREATE_CHARGING_ENTRY_SUCCESS', user.userId, { entryId: newEntry.id })

    return NextResponse.json(formattedEntry, { status: 201 })
  } catch (error) {
    console.error('[Charging Entries API] POST Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'entrée de recharge' },
      { status: 500 }
    )
  }
}