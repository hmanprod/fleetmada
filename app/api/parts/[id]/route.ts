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

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Parts API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Parts API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Parts API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// GET /api/parts/[id] - Détails d'une pièce spécifique
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Part Details - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const authParts = authHeader.split(' ')
    if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
      logAction('GET Part Details - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = authParts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Part Details - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const { id } = params

    logAction('GET Part Details', userId, { partId: id })

    try {
      // Récupérer la pièce avec ses relations
      const part = await prisma.part.findUnique({
        where: { id },
        include: {
          serviceEntries: {
            include: {
              serviceEntry: {
                include: {
                  vehicle: {
                    select: {
                      id: true,
                      name: true,
                      vin: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      if (!part) {
        logAction('GET Part Details - Part not found', userId, { partId: id })
        return NextResponse.json(
          { success: false, error: 'Pièce non trouvée' },
          { status: 404 }
        )
      }

      // Calculer les statistiques d'utilisation
      const totalUsage = part.serviceEntries.reduce((sum, sep) => sum + sep.quantity, 0)
      const totalCost = part.serviceEntries.reduce((sum, sep) => sum + sep.totalCost, 0)
      
      // Calculer les alertes de stock
      const stockStatus = part.quantity === 0 ? 'OUT_OF_STOCK' : 
                         part.quantity <= part.minimumStock ? 'LOW_STOCK' : 'IN_STOCK'
      
      const partWithStats = {
        ...part,
        lowStockAlert: part.quantity <= part.minimumStock,
        stockStatus,
        usageStats: {
          totalUsage,
          totalCost,
          lastUsed: part.serviceEntries.length > 0 ? 
            part.serviceEntries[part.serviceEntries.length - 1].createdAt : null,
          usageCount: part.serviceEntries.length
        },
        serviceEntries: part.serviceEntries.map(sep => ({
          ...sep,
          serviceEntry: {
            ...sep.serviceEntry,
            // Ne pas inclure les données sensibles
            notes: sep.serviceEntry.notes ? sep.serviceEntry.notes.substring(0, 100) + '...' : null
          }
        }))
      }

      logAction('GET Part Details - Success', userId, { 
        partId: id, 
        partNumber: part.number,
        hasUsage: part.serviceEntries.length > 0 
      })

      return NextResponse.json({
        success: true,
        data: partWithStats
      })

    } catch (dbError) {
      logAction('GET Part Details - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération de la pièce' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Part Details - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// PUT /api/parts/[id] - Modification d'une pièce
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('PUT Part - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const authParts = authHeader.split(' ')
    if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
      logAction('PUT Part - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = authParts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('PUT Part - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const { id } = params

    // Extraction et validation des données
    const body = await request.json()
    const {
      number,
      description,
      category,
      manufacturer,
      cost,
      quantity,
      minimumStock
    } = body

    logAction('PUT Part', userId, {
      partId: id, number
    })

    // Validation
    if (!number || !description) {
      logAction('PUT Part - Missing required fields', userId, {
        number, description
      })
      return NextResponse.json(
        { success: false, error: 'Le numéro et la description de la pièce sont requis' },
        { status: 400 }
      )
    }

    try {
      // Vérifier que la pièce existe
      const existingPart = await prisma.part.findUnique({
        where: { id }
      })

      if (!existingPart) {
        logAction('PUT Part - Part not found', userId, { partId: id })
        return NextResponse.json(
          { success: false, error: 'Pièce non trouvée' },
          { status: 404 }
        )
      }

      // Vérifier que le nouveau numéro n'est pas déjà pris par une autre pièce
      if (number !== existingPart.number) {
        const duplicatePart = await prisma.part.findUnique({
          where: { number }
        })

        if (duplicatePart) {
          logAction('PUT Part - Number already exists', userId, {
            number
          })

          return NextResponse.json(
            { success: false, error: 'Une pièce avec ce numéro existe déjà' },
            { status: 409 }
          )
        }
      }

      // Mise à jour de la pièce
      const updatedPart = await prisma.part.update({
        where: { id },
        data: {
          number,
          description,
          category,
          manufacturer,
          cost,
          quantity,
          minimumStock,
          updatedAt: new Date()
        }
      })

      logAction('PUT Part - Success', userId, {
        partId: id, partNumber: updatedPart.number
      })

      return NextResponse.json({
        success: true,
        data: updatedPart,
        message: 'Pièce mise à jour avec succès'
      })

    } catch (dbError) {
      logAction('PUT Part - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour de la pièce' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('PUT Part - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// DELETE /api/parts/[id] - Suppression d'une pièce
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('DELETE Part - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const authParts = authHeader.split(' ')
    if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
      logAction('DELETE Part - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = authParts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('DELETE Part - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const { id } = params

    logAction('DELETE Part', userId, { partId: id })

    try {
      // Vérifier que la pièce existe
      const existingPart = await prisma.part.findUnique({
        where: { id },
        include: {
          serviceEntries: true
        }
      })

      if (!existingPart) {
        logAction('DELETE Part - Part not found', userId, { partId: id })
        return NextResponse.json(
          { success: false, error: 'Pièce non trouvée' },
          { status: 404 }
        )
      }

      // Vérifier si la pièce a été utilisée dans des services
      if (existingPart.serviceEntries.length > 0) {
        logAction('DELETE Part - Has usage history', userId, {
          partId: id,
          usageCount: existingPart.serviceEntries.length
        })

        return NextResponse.json(
          { 
            success: false, 
            error: 'Impossible de supprimer cette pièce car elle a été utilisée dans des interventions de service',
            usageCount: existingPart.serviceEntries.length
          },
          { status: 409 }
        )
      }

      // Vérifier si la pièce a du stock
      if (existingPart.quantity > 0) {
        logAction('DELETE Part - Has stock remaining', userId, {
          partId: id,
          quantity: existingPart.quantity
        })

        return NextResponse.json(
          { 
            success: false, 
            error: 'Impossible de supprimer cette pièce car elle a encore du stock en inventaire',
            quantity: existingPart.quantity
          },
          { status: 409 }
        )
      }

      // Suppression de la pièce
      await prisma.part.delete({
        where: { id }
      })

      logAction('DELETE Part - Success', userId, {
        partId: id, partNumber: existingPart.number
      })

      return NextResponse.json({
        success: true,
        message: 'Pièce supprimée avec succès'
      })

    } catch (dbError) {
      logAction('DELETE Part - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression de la pièce' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('DELETE Part - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}