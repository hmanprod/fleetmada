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
      console.log('[Vehicle Renewals API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Vehicle Renewals API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Vehicle Renewals API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// POST /api/vehicle-renewals/[id]/complete - Marquer comme complété
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('COMPLETE Vehicle Renewal - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const authParts = authHeader.split(' ')
    if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
      logAction('COMPLETE Vehicle Renewal - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = authParts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('COMPLETE Vehicle Renewal - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const renewalId = params.id

    // Extraction des données de completion
    const body = await request.json()
    const { 
      completedDate,
      cost,
      provider,
      notes,
      documentId
    } = body

    logAction('COMPLETE Vehicle Renewal', userId, { renewalId, cost, provider })

    try {
      // Vérifier que le renouvellement existe et appartient à l'utilisateur
      const existingRenewal = await prisma.vehicleRenewal.findFirst({
        where: {
          id: renewalId,
          vehicle: {
            userId
          }
        },
        include: {
          vehicle: true
        }
      })

      if (!existingRenewal) {
        logAction('COMPLETE Vehicle Renewal - Not found', userId, { renewalId })
        return NextResponse.json(
          { success: false, error: 'Renouvellement non trouvé' },
          { status: 404 }
        )
      }

      // Calculer la prochaine date d'échéance si nécessaire
      let nextDueDate: Date | null = null
      if (existingRenewal.dueDate) {
        const currentDueDate = new Date(existingRenewal.dueDate)
        
        // Ajouter 1 an pour la plupart des renouvellements
        nextDueDate = new Date(currentDueDate)
        nextDueDate.setFullYear(nextDueDate.getFullYear() + 1)
      }

      // Marquer le renouvellement comme complété
      const updatedRenewal = await prisma.vehicleRenewal.update({
        where: { id: renewalId },
        data: { 
          status: 'COMPLETED',
          completedDate: completedDate ? new Date(completedDate) : new Date(),
          cost: cost ? parseFloat(cost) : null,
          provider,
          notes,
          documentId,
          nextDueDate
        },
        include: {
          vehicle: {
            select: { id: true, name: true, make: true, model: true }
          }
        }
      })

      logAction('COMPLETE Vehicle Renewal - Success', userId, { 
        renewalId, 
        nextDueDate: nextDueDate?.toISOString() 
      })

      return NextResponse.json({
        success: true,
        data: updatedRenewal,
        message: `Renouvellement complété. ${nextDueDate ? `Prochaine échéance: ${nextDueDate.toLocaleDateString('fr-FR')}` : ''}`
      })

    } catch (dbError) {
      logAction('COMPLETE Vehicle Renewal - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la complétion du renouvellement' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('COMPLETE Vehicle Renewal - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}