import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { 
  CreateExpenseEntrySchema,
  type CreateExpenseEntryInput
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
  console.log(`[Vehicle Expenses API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Vehicle Expenses API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Vehicle Expenses API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
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

// Schéma pour les paramètres de requête des dépenses
const ExpenseQuerySchema = {
  page: (val: string) => parseInt(val) || 1,
  limit: (val: string) => Math.min(Math.max(parseInt(val) || 20, 1), 100),
  type: (val: string) => val,
  status: (val: string) => val,
  startDate: (val: string) => val,
  endDate: (val: string) => val,
  sortBy: (val: string) => ['date', 'amount', 'type', 'createdAt'].includes(val) ? val : 'date',
  sortOrder: (val: string) => ['asc', 'desc'].includes(val) ? val : 'desc'
}

// Fonction utilitaire pour construire les filtres de recherche
const buildExpenseFilters = (query: any, vehicleId: string) => {
  const filters: any = {
    vehicleId
  }

  if (query.type) {
    filters.type = { contains: query.type, mode: 'insensitive' }
  }

  if (query.status) {
    filters.status = { contains: query.status, mode: 'insensitive' }
  }

  if (query.vendor) {
    filters.vendor = { contains: query.vendor, mode: 'insensitive' }
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

  if (query.minAmount) {
    filters.amount = { ...filters.amount, gte: parseFloat(query.minAmount) }
  }

  if (query.maxAmount) {
    filters.amount = { ...filters.amount, lte: parseFloat(query.maxAmount) }
  }

  return filters
}

// Fonction utilitaire pour construire l'ordre de tri
const buildExpenseOrderBy = (query: any) => {
  const orderBy: any = {}
  
  if (query.sortBy === 'date' || query.sortBy === 'amount' || query.sortBy === 'type' || query.sortBy === 'createdAt') {
    orderBy[query.sortBy] = query.sortOrder
  } else {
    orderBy.date = 'desc'
  }
  
  return orderBy
}

// GET /api/vehicles/[id]/expenses - Historique des dépenses
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
      logAction('GET Expenses - Missing authorization header', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Expenses - Invalid authorization header format', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Expenses - Invalid token', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('GET Expenses - Missing user ID in token', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    // Extraction et validation des paramètres de requête
    const { searchParams } = new URL(request.url)
    const query: any = {}
    
    for (const [key, value] of searchParams.entries()) {
      if (ExpenseQuerySchema[key as keyof typeof ExpenseQuerySchema]) {
        query[key] = ExpenseQuerySchema[key as keyof typeof ExpenseQuerySchema](value)
      }
    }

    const page = query.page || 1
    const limit = query.limit || 20
    const offset = (page - 1) * limit

    logAction('GET Expenses', userId, { 
      userId, 
      vehicleId,
      page, 
      limit,
      filters: { 
        type: query.type, 
        status: query.status,
        startDate: query.startDate,
        endDate: query.endDate
      }
    })

    try {
      // Vérification de l'accès au véhicule
      const vehicle = await checkVehicleAccess(vehicleId, userId)

      if (!vehicle) {
        logAction('GET Expenses - Vehicle not found or access denied', userId, { vehicleId })
        return NextResponse.json(
          { success: false, error: 'Véhicule non trouvé ou accès refusé' },
          { status: 404 }
        )
      }

      // Construction des filtres et de l'ordre
      const filters = buildExpenseFilters(query, vehicleId)
      const orderBy = buildExpenseOrderBy(query)

      // Récupération des dépenses avec pagination
      const [expenses, totalCount] = await Promise.all([
        prisma.expenseEntry.findMany({
          where: filters,
          orderBy,
          skip: offset,
          take: limit
        }),
        prisma.expenseEntry.count({
          where: filters
        })
      ])

      // Transformation des données pour l'API
      const expensesData = expenses.map(expense => ({
        id: expense.id,
        vehicleId: expense.vehicleId,
        date: expense.date,
        type: expense.type,
        vendor: expense.vendor,
        source: expense.source,
        amount: expense.amount,
        currency: expense.currency,
        notes: expense.notes,
        status: expense.status,
        docs: expense.docs,
        photos: expense.photos,
        createdAt: expense.createdAt,
        updatedAt: expense.updatedAt
      }))

      const totalPages = Math.ceil(totalCount / limit)

      // Calcul des statistiques
      const stats = await prisma.expenseEntry.aggregate({
        where: filters,
        _sum: { amount: true },
        _avg: { amount: true },
        _count: { id: true }
      })

      // Calculs par période
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

      const [last30Days, last90Days] = await Promise.all([
        prisma.expenseEntry.aggregate({
          where: { ...filters, date: { gte: thirtyDaysAgo } },
          _sum: { amount: true },
          _count: { id: true }
        }),
        prisma.expenseEntry.aggregate({
          where: { ...filters, date: { gte: ninetyDaysAgo } },
          _sum: { amount: true },
          _count: { id: true }
        })
      ])

      // Répartition par type
      const expenseByType = await prisma.expenseEntry.groupBy({
        by: ['type'],
        where: filters,
        _sum: { amount: true },
        _count: { id: true }
      })

      const typeBreakdown = expenseByType.map(item => ({
        type: item.type,
        totalAmount: item._sum.amount || 0,
        count: item._count.id,
        percentage: totalCount > 0 ? (item._count.id / totalCount) * 100 : 0
      })).sort((a, b) => b.totalAmount - a.totalAmount)

      logAction('GET Expenses - Success', userId, { 
        userId, 
        vehicleId,
        totalCount,
        page,
        totalPages,
        totalAmount: stats._sum.amount
      })

      return NextResponse.json(
        {
          success: true,
          data: {
            expenses: expensesData,
            pagination: {
              page,
              limit,
              totalCount,
              totalPages,
              hasNext: page < totalPages,
              hasPrev: page > 1
            },
            stats: {
              totalExpenses: stats._count.id || 0,
              totalAmount: Math.round((stats._sum.amount || 0) * 100) / 100,
              averageAmount: Math.round((stats._avg.amount || 0) * 100) / 100,
              last30Days: {
                count: last30Days._count.id || 0,
                amount: Math.round((last30Days._sum.amount || 0) * 100) / 100
              },
              last90Days: {
                count: last90Days._count.id || 0,
                amount: Math.round((last90Days._sum.amount || 0) * 100) / 100
              }
            },
            typeBreakdown
          }
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('GET Expenses - Database error', userId, {
        vehicleId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des dépenses' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    const vehicleId = params?.id || 'unknown'
    
    logAction('GET Expenses - Server error', userId, {
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

// POST /api/vehicles/[id]/expenses - Nouvelle dépense
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
      logAction('POST Expense - Missing authorization header', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('POST Expense - Invalid authorization header format', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('POST Expense - Invalid token', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('POST Expense - Missing user ID in token', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    // Extraction et validation des données
    const body = await request.json()
    const expenseData = CreateExpenseEntrySchema.parse({
      ...body,
      vehicleId
    })

    logAction('POST Expense', userId, { 
      userId, 
      vehicleId,
      expenseType: expenseData.type,
      amount: expenseData.amount
    })

    try {
      // Vérification de l'accès au véhicule
      const vehicle = await checkVehicleAccess(vehicleId, userId)

      if (!vehicle) {
        logAction('POST Expense - Vehicle not found or access denied', userId, { vehicleId })
        return NextResponse.json(
          { success: false, error: 'Véhicule non trouvé ou accès refusé' },
          { status: 404 }
        )
      }

      // Création de la nouvelle dépense
      const newExpense = await prisma.expenseEntry.create({
        data: {
          ...expenseData,
          date: new Date(expenseData.date)
        }
      })

      logAction('POST Expense - Success', userId, { 
        userId, 
        vehicleId,
        expenseId: newExpense.id,
        amount: newExpense.amount
      })

      return NextResponse.json(
        {
          success: true,
          data: {
            id: newExpense.id,
            vehicleId: newExpense.vehicleId,
            date: newExpense.date,
            type: newExpense.type,
            vendor: newExpense.vendor,
            source: newExpense.source,
            amount: newExpense.amount,
            currency: newExpense.currency,
            notes: newExpense.notes,
            status: newExpense.status,
            docs: newExpense.docs,
            photos: newExpense.photos,
            createdAt: newExpense.createdAt,
            updatedAt: newExpense.updatedAt
          },
          message: 'Dépense créée avec succès'
        },
        { status: 201 }
      )

    } catch (dbError) {
      logAction('POST Expense - Database error', userId, {
        vehicleId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création de la dépense' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    const vehicleId = params?.id || 'unknown'
    
    // Gestion des erreurs de validation
    if (error instanceof Error && error.name === 'ZodError') {
      logAction('POST Expense - Validation error', userId, {
        vehicleId,
        error: error.message
      })

      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.message },
        { status: 400 }
      )
    }

    logAction('POST Expense - Server error', userId, {
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
    { error: 'Méthode non autorisée. Utilisez /api/vehicles/[id]/expenses/[expenseId] pour la modification' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Méthode non autorisée. Utilisez /api/vehicles/[id]/expenses/[expenseId] pour la suppression' },
    { status: 405 }
  )
}