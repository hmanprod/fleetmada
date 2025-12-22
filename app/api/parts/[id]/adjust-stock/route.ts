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

// Interface pour les données d'ajustement de stock
interface AdjustStockData {
  quantity: number
  reason?: string
  type?: 'PURCHASE' | 'CONSUMPTION' | 'ADJUSTMENT' | 'TRANSFER' | 'RETURN' | 'DAMAGE' | 'EXPIRED'
  referenceId?: string
  referenceType?: string
  cost?: number
  notes?: string
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Parts Adjust Stock API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Parts Adjust Stock API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Parts Adjust Stock API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// POST /api/parts/[id]/adjust-stock - Ajuster le stock d'une pièce
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('Adjust Stock - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const authParts = authHeader.split(' ')
    if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
      logAction('Adjust Stock - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = authParts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('Adjust Stock - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const { id } = params

    // Extraction et validation des données
    const body: AdjustStockData = await request.json()
    const {
      quantity,
      reason,
      type = 'ADJUSTMENT',
      referenceId,
      referenceType,
      cost,
      notes
    } = body

    // Mappage des types du frontend vers l'énumération backend
    let mappedType = type as any;
    const typeStr = type as any;
    if (typeStr === 'add' || typeStr === 'remove' || typeStr === 'set') {
      mappedType = 'ADJUSTMENT';
    }


    logAction('Adjust Stock', userId, {
      partId: id,
      quantity,
      type: mappedType,
      originalType: type,
      reason
    })


    // Validation
    if (!quantity || quantity === 0) {
      logAction('Adjust Stock - Invalid quantity', userId, { quantity })
      return NextResponse.json(
        { success: false, error: 'La quantité doit être différente de zéro' },
        { status: 400 }
      )
    }

    if (!reason) {
      logAction('Adjust Stock - Missing reason', userId, {})
      return NextResponse.json(
        { success: false, error: 'La raison de l\'ajustement est requise' },
        { status: 400 }
      )
    }

    try {
      // Récupérer la pièce actuelle
      const currentPart = await prisma.part.findUnique({
        where: { id }
      })

      if (!currentPart) {
        logAction('Adjust Stock - Part not found', userId, { partId: id })
        return NextResponse.json(
          { success: false, error: 'Pièce non trouvée' },
          { status: 404 }
        )
      }

      const previousStock = currentPart.quantity
      const newStock = previousStock + quantity

      // Vérifier que le stock ne devient pas négatif
      if (newStock < 0) {
        logAction('Adjust Stock - Would create negative stock', userId, {
          currentStock: previousStock,
          adjustment: quantity,
          newStock
        })

        return NextResponse.json(
          {
            success: false,
            error: 'Impossible : cela créerait un stock négatif',
            currentStock: previousStock,
            requestedAdjustment: quantity,
            wouldResult: newStock
          },
          { status: 400 }
        )
      }

      // Calculer le coût total
      const totalCost = cost ? cost * Math.abs(quantity) : null

      // Utiliser une transaction pour garantir la cohérence
      const result = await prisma.$transaction(async (tx) => {
        // 1. Mettre à jour le stock de la pièce
        const updatedPart = await tx.part.update({
          where: { id },
          data: {
            quantity: newStock,
            updatedAt: new Date()
          }
        })

        // 2. Créer l'enregistrement de mouvement de stock
        const stockMovement = await tx.stockMovement.create({
          data: {
            partId: id,
            type: mappedType,
            quantity: quantity, // Peut être négatif

            previousStock,
            newStock,
            reason,
            referenceId,
            referenceType,
            cost: cost || null,
            totalCost,
            notes,
            createdBy: userId
          }
        })

        return { updatedPart, stockMovement }
      })

      logAction('Adjust Stock - Success', userId, {
        partId: id,
        partNumber: result.updatedPart.number,
        previousStock,
        newStock,
        adjustment: quantity,
        movementId: result.stockMovement.id
      })

      return NextResponse.json({
        success: true,
        data: {
          part: result.updatedPart,
          stockMovement: result.stockMovement,
          adjustment: {
            quantity,
            previousStock,
            newStock,
            type,
            reason
          }
        },
        message: `Stock ajusté avec succès (${quantity > 0 ? '+' : ''}${quantity})`
      })

    } catch (dbError) {
      logAction('Adjust Stock - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de l\'ajustement du stock' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('Adjust Stock - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}