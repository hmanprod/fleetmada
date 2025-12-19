import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UpdateExpenseEntrySchema } from '@/lib/validations/vehicle-validations'
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
  console.log(`[Expense Entry API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Expense Entry API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Expense Entry API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction utilitaire pour vérifier l'accès à la dépense
const checkExpenseAccess = async (vehicleId: string, expenseId: string, userId: string) => {
  const expense = await prisma.expenseEntry.findFirst({
    where: {
      id: expenseId,
      vehicleId,
      vehicle: {
        userId
      }
    },
    include: {
      vehicle: true
    }
  })

  if (!expense) {
    return null
  }

  return expense
}

// GET /api/vehicles/[id]/expenses/[expenseId] - Détails d'une dépense spécifique
export async function GET(request: NextRequest, { params }: { params: { id: string, expenseId: string } }) {
  try {
    const { id: vehicleId, expenseId } = params

    if (!vehicleId || !expenseId) {
      return NextResponse.json(
        { success: false, error: 'ID du véhicule ou de la dépense manquant' },
        { status: 400 }
      )
    }

    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Expense - Missing authorization header', 'unknown', { vehicleId, expenseId })
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Expense - Invalid authorization header format', 'unknown', { vehicleId, expenseId })
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Expense - Invalid token', 'unknown', { vehicleId, expenseId })
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('GET Expense - Missing user ID in token', 'unknown', { vehicleId, expenseId })
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    logAction('GET Expense', userId, { userId, vehicleId, expenseId })

    try {
      // Vérification de l'accès à la dépense
      const expense = await checkExpenseAccess(vehicleId, expenseId, userId)

      if (!expense) {
        logAction('GET Expense - Expense not found or access denied', userId, { vehicleId, expenseId })
        return NextResponse.json(
          { success: false, error: 'Dépense non trouvée ou accès refusé' },
          { status: 404 }
        )
      }

      const expenseData = {
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
        updatedAt: expense.updatedAt,
        vehicle: {
          id: expense.vehicle.id,
          name: expense.vehicle.name,
          vin: expense.vehicle.vin
        }
      }

      logAction('GET Expense - Success', userId, { 
        userId, 
        vehicleId,
        expenseId: expense.id,
        amount: expense.amount
      })

      return NextResponse.json(
        {
          success: true,
          data: expenseData
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('GET Expense - Database error', userId, {
        vehicleId,
        expenseId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération de la dépense' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    const { id: vehicleId, expenseId } = params || { id: 'unknown', expenseId: 'unknown' }
    
    logAction('GET Expense - Server error', userId, {
      vehicleId,
      expenseId,
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// PUT /api/vehicles/[id]/expenses/[expenseId] - Modification d'une dépense
export async function PUT(request: NextRequest, { params }: { params: { id: string, expenseId: string } }) {
  try {
    const { id: vehicleId, expenseId } = params

    if (!vehicleId || !expenseId) {
      return NextResponse.json(
        { success: false, error: 'ID du véhicule ou de la dépense manquant' },
        { status: 400 }
      )
    }

    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('PUT Expense - Missing authorization header', 'unknown', { vehicleId, expenseId })
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('PUT Expense - Invalid authorization header format', 'unknown', { vehicleId, expenseId })
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('PUT Expense - Invalid token', 'unknown', { vehicleId, expenseId })
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('PUT Expense - Missing user ID in token', 'unknown', { vehicleId, expenseId })
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    // Extraction et validation des données
    const body = await request.json()
    const updateData = UpdateExpenseEntrySchema.parse({ ...body, id: expenseId, vehicleId })

    logAction('PUT Expense', userId, { 
      userId, 
      vehicleId,
      expenseId,
      updateFields: Object.keys(body)
    })

    try {
      // Vérification de l'accès à la dépense
      const existingExpense = await checkExpenseAccess(vehicleId, expenseId, userId)

      if (!existingExpense) {
        logAction('PUT Expense - Expense not found or access denied', userId, { vehicleId, expenseId })
        return NextResponse.json(
          { success: false, error: 'Dépense non trouvée ou accès refusé' },
          { status: 404 }
        )
      }

      // Préparation des données de mise à jour
      const updateFields: any = { ...body }
      
      // Conversion de la date si elle est modifiée
      if (updateFields.date) {
        updateFields.date = new Date(updateFields.date)
      }

      // Suppression des champs non modifiables
      delete updateFields.id
      delete updateFields.vehicleId
      delete updateFields.createdAt

      // Mise à jour de la dépense
      const updatedExpense = await prisma.expenseEntry.update({
        where: { id: expenseId },
        data: updateFields
      })

      logAction('PUT Expense - Success', userId, { 
        userId, 
        vehicleId,
        expenseId: updatedExpense.id,
        amount: updatedExpense.amount
      })

      return NextResponse.json(
        {
          success: true,
          data: {
            id: updatedExpense.id,
            vehicleId: updatedExpense.vehicleId,
            date: updatedExpense.date,
            type: updatedExpense.type,
            vendor: updatedExpense.vendor,
            source: updatedExpense.source,
            amount: updatedExpense.amount,
            currency: updatedExpense.currency,
            notes: updatedExpense.notes,
            status: updatedExpense.status,
            docs: updatedExpense.docs,
            photos: updatedExpense.photos,
            createdAt: updatedExpense.createdAt,
            updatedAt: updatedExpense.updatedAt
          },
          message: 'Dépense mise à jour avec succès'
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('PUT Expense - Database error', userId, {
        vehicleId,
        expenseId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour de la dépense' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    const { id: vehicleId, expenseId } = params || { id: 'unknown', expenseId: 'unknown' }
    
    // Gestion des erreurs de validation
    if (error instanceof Error && error.name === 'ZodError') {
      logAction('PUT Expense - Validation error', userId, {
        vehicleId,
        expenseId,
        error: error.message
      })

      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.message },
        { status: 400 }
      )
    }

    logAction('PUT Expense - Server error', userId, {
      vehicleId,
      expenseId,
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// DELETE /api/vehicles/[id]/expenses/[expenseId] - Suppression d'une dépense
export async function DELETE(request: NextRequest, { params }: { params: { id: string, expenseId: string } }) {
  try {
    const { id: vehicleId, expenseId } = params

    if (!vehicleId || !expenseId) {
      return NextResponse.json(
        { success: false, error: 'ID du véhicule ou de la dépense manquant' },
        { status: 400 }
      )
    }

    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('DELETE Expense - Missing authorization header', 'unknown', { vehicleId, expenseId })
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('DELETE Expense - Invalid authorization header format', 'unknown', { vehicleId, expenseId })
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('DELETE Expense - Invalid token', 'unknown', { vehicleId, expenseId })
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('DELETE Expense - Missing user ID in token', 'unknown', { vehicleId, expenseId })
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    logAction('DELETE Expense', userId, { userId, vehicleId, expenseId })

    try {
      // Vérification de l'accès à la dépense
      const expense = await checkExpenseAccess(vehicleId, expenseId, userId)

      if (!expense) {
        logAction('DELETE Expense - Expense not found or access denied', userId, { vehicleId, expenseId })
        return NextResponse.json(
          { success: false, error: 'Dépense non trouvée ou accès refusé' },
          { status: 404 }
        )
      }

      // Vérification si la dépense a des documents associés
      if (expense.docs > 0) {
        logAction('DELETE Expense - Cannot delete expense with documents', userId, { 
          vehicleId, 
          expenseId,
          docs: expense.docs
        })

        return NextResponse.json(
          { 
            success: false, 
            error: 'Impossible de supprimer cette dépense car elle contient des documents' 
          },
          { status: 409 }
        )
      }

      // Vérification de la date (ne pas supprimer les dépenses récentes)
      const daysSinceCreation = Math.floor((Date.now() - expense.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysSinceCreation < 7) {
        logAction('DELETE Expense - Cannot delete recent expense', userId, { 
          vehicleId, 
          expenseId,
          daysSinceCreation
        })

        return NextResponse.json(
          { 
            success: false, 
            error: 'Impossible de supprimer une dépense récente (moins de 7 jours)' 
          },
          { status: 409 }
        )
      }

      // Suppression de la dépense
      await prisma.expenseEntry.delete({
        where: { id: expenseId }
      })

      logAction('DELETE Expense - Success', userId, { 
        userId, 
        vehicleId,
        expenseId,
        amount: expense.amount
      })

      return NextResponse.json(
        {
          success: true,
          message: 'Dépense supprimée avec succès'
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('DELETE Expense - Database error', userId, {
        vehicleId,
        expenseId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression de la dépense' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    const { id: vehicleId, expenseId } = params || { id: 'unknown', expenseId: 'unknown' }
    
    logAction('DELETE Expense - Server error', userId, {
      vehicleId,
      expenseId,
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}