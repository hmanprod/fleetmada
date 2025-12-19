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

// Interface pour les données de réapprovisionnement
interface ReorderData {
  quantity: number
  vendor?: string
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  notes?: string
  targetDate?: string
  estimatedCost?: number
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Parts Reorder API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Parts Reorder API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Parts Reorder API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// POST /api/parts/[id]/reorder - Créer une commande de réapprovisionnement
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('Reorder - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const authParts = authHeader.split(' ')
    if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
      logAction('Reorder - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = authParts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('Reorder - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const { id } = params

    // Extraction et validation des données
    const body: ReorderData = await request.json()
    const {
      quantity,
      vendor,
      urgency = 'MEDIUM',
      notes,
      targetDate,
      estimatedCost
    } = body

    logAction('Reorder', userId, {
      partId: id,
      quantity,
      vendor,
      urgency,
      targetDate
    })

    // Validation
    if (!quantity || quantity <= 0) {
      logAction('Reorder - Invalid quantity', userId, { quantity })
      return NextResponse.json(
        { success: false, error: 'La quantité doit être positive' },
        { status: 400 }
      )
    }

    try {
      // Récupérer la pièce actuelle
      const part = await prisma.part.findUnique({
        where: { id }
      })

      if (!part) {
        logAction('Reorder - Part not found', userId, { partId: id })
        return NextResponse.json(
          { success: false, error: 'Pièce non trouvée' },
          { status: 404 }
        )
      }

      // Vérifier si un réapprovisionnement est nécessaire
      const currentStock = part.quantity
      const minimumStock = part.minimumStock
      const reorderPoint = Math.ceil(minimumStock * 1.5) // Réappro quand stock < 150% du minimum
      
      if (currentStock >= reorderPoint) {
        logAction('Reorder - Not needed', userId, {
          currentStock,
          reorderPoint,
          minimumStock
        })

        return NextResponse.json(
          {
            success: false,
            error: 'Réapprovisionnement non nécessaire - stock suffisant',
            currentStock,
            reorderPoint,
            recommendation: 'Attendre que le stock baisse en dessous du point de réapprovisionnement'
          },
          { status: 400 }
        )
      }

      // Calculer la quantité recommandée
      const recommendedQuantity = Math.max(quantity, minimumStock * 2 - currentStock)
      const totalEstimatedCost = estimatedCost || (part.cost || 0) * recommendedQuantity

      // Générer un numéro de commande unique
      const reorderNumber = `REO-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

      // Déterminer la priorité basée sur le niveau de stock
      let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
      if (currentStock === 0) {
        priority = 'CRITICAL'
      } else if (currentStock <= minimumStock * 0.5) {
        priority = 'HIGH'
      } else if (currentStock <= minimumStock) {
        priority = urgency
      } else {
        priority = 'LOW'
      }

      // Créer la commande de réapprovisionnement
      const reorderData = {
        reorderNumber,
        partId: id,
        partNumber: part.number,
        partDescription: part.description,
        currentStock,
        requestedQuantity: recommendedQuantity,
        minimumStock,
        reorderPoint,
        vendor: vendor || 'À déterminer',
        urgency: priority,
        estimatedCost: totalEstimatedCost,
        notes: notes || '',
        targetDate: targetDate ? new Date(targetDate) : null,
        createdBy: userId,
        createdAt: new Date()
      }

      logAction('Reorder - Success', userId, {
        partId: id,
        partNumber: part.number,
        reorderNumber,
        priority,
        requestedQuantity: recommendedQuantity,
        estimatedCost: totalEstimatedCost
      })

      // Dans une implémentation complète, on stockerait cette commande dans la DB
      // Pour l'instant, on retourne les données de la commande
      const reorderOrder = {
        ...reorderData,
        id: `reorder-${reorderNumber}`,
        status: 'PENDING',
        estimatedDeliveryDate: targetDate ? new Date(targetDate) : null,
        actions: {
          canEdit: true,
          canCancel: true,
          canSendToVendor: false // Feature future
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          reorder: reorderOrder,
          analysis: {
            currentSituation: {
              currentStock,
              minimumStock,
              reorderPoint,
              stockLevel: currentStock === 0 ? 'OUT_OF_STOCK' : 
                        currentStock <= minimumStock ? 'LOW_STOCK' : 
                        currentStock <= reorderPoint ? 'REORDER_POINT' : 'ADEQUATE'
            },
            recommendation: {
              requestedQuantity: recommendedQuantity,
              reasoning: currentStock === 0 ? 
                'Stock épuisé - réapprovisionnement urgent recommandé' :
                `Quantité pour maintenir 2x le stock minimum (${minimumStock * 2} unités)`,
              costEstimate: totalEstimatedCost,
              urgency: priority
            },
            timeline: {
              created: new Date(),
              targetDate: targetDate ? new Date(targetDate) : null,
              urgencyLevel: priority
            }
          }
        },
        message: `Commande de réapprovisionnement créée avec succès (${priority})`
      })

    } catch (dbError) {
      logAction('Reorder - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création de la commande' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('Reorder - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}