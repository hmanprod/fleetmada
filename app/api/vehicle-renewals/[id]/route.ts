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

// GET /api/vehicle-renewals/[id] - Détails d'un renouvellement
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Vehicle Renewal Detail - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const authParts = authHeader.split(' ')
    if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
      logAction('GET Vehicle Renewal Detail - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = authParts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Vehicle Renewal Detail - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const renewalId = params.id

    logAction('GET Vehicle Renewal Detail', userId, { renewalId })

    // Vérifier que le renouvellement existe et appartient à l'utilisateur
    const renewal = await prisma.vehicleRenewal.findFirst({
      where: {
        id: renewalId,
        vehicle: {
          userId
        }
      },
      include: {
        vehicle: {
          select: { id: true, name: true, make: true, model: true, vin: true }
        }
      }
    })

    if (!renewal) {
      logAction('GET Vehicle Renewal Detail - Not found', userId, { renewalId })
      return NextResponse.json(
        { success: false, error: 'Renouvellement non trouvé' },
        { status: 404 }
      )
    }

    // Enrichir avec les informations de statut
    const now = new Date()
    let isOverdue = false
    let daysUntilDue: number | null = null
    
    if (renewal.dueDate) {
      isOverdue = renewal.dueDate < now
      daysUntilDue = Math.ceil((renewal.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    }

    const enrichedRenewal = {
      ...renewal,
      isOverdue,
      daysUntilDue,
      priority: isOverdue ? 'OVERDUE' : (daysUntilDue !== null && daysUntilDue <= 7 ? 'SOON' : 'NORMAL')
    }

    logAction('GET Vehicle Renewal Detail - Success', userId, { renewalId })

    return NextResponse.json({
      success: true,
      data: enrichedRenewal
    })

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Vehicle Renewal Detail - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// PUT /api/vehicle-renewals/[id] - Modifier un renouvellement
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('PUT Vehicle Renewal - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const authParts = authHeader.split(' ')
    if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
      logAction('PUT Vehicle Renewal - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = authParts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('PUT Vehicle Renewal - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const renewalId = params.id

    // Extraction et validation des données
    const body = await request.json()
    const {
      type,
      title,
      description,
      dueDate,
      nextDueDate,
      priority,
      cost,
      provider,
      notes,
      watchers,
      isActive
    } = body

    logAction('PUT Vehicle Renewal', userId, { renewalId, type, title })

    try {
      // Vérifier que le renouvellement existe et appartient à l'utilisateur
      const existingRenewal = await prisma.vehicleRenewal.findFirst({
        where: {
          id: renewalId,
          vehicle: {
            userId
          }
        }
      })

      if (!existingRenewal) {
        logAction('PUT Vehicle Renewal - Not found', userId, { renewalId })
        return NextResponse.json(
          { success: false, error: 'Renouvellement non trouvé' },
          { status: 404 }
        )
      }

      // Préparer les données de mise à jour
      const updateData: any = {}

      if (type !== undefined) updateData.type = type
      if (title !== undefined) updateData.title = title
      if (description !== undefined) updateData.description = description
      if (priority !== undefined) updateData.priority = priority
      if (cost !== undefined) updateData.cost = cost ? parseFloat(cost) : null
      if (provider !== undefined) updateData.provider = provider
      if (notes !== undefined) updateData.notes = notes
      if (watchers !== undefined) updateData.watchers = watchers
      if (isActive !== undefined) updateData.isActive = isActive

      if (dueDate !== undefined) {
        updateData.dueDate = dueDate ? new Date(dueDate) : null
      }

      if (nextDueDate !== undefined) {
        updateData.nextDueDate = nextDueDate ? new Date(nextDueDate) : null
      }

      // Mettre à jour le renouvellement
      const updatedRenewal = await prisma.vehicleRenewal.update({
        where: { id: renewalId },
        data: updateData,
        include: {
          vehicle: {
            select: { id: true, name: true, make: true, model: true }
          }
        }
      })

      logAction('PUT Vehicle Renewal - Success', userId, { renewalId })

      return NextResponse.json({
        success: true,
        data: updatedRenewal,
        message: 'Renouvellement modifié avec succès'
      })

    } catch (dbError) {
      logAction('PUT Vehicle Renewal - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la modification du renouvellement' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('PUT Vehicle Renewal - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// DELETE /api/vehicle-renewals/[id] - Supprimer un renouvellement
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('DELETE Vehicle Renewal - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const authParts = authHeader.split(' ')
    if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
      logAction('DELETE Vehicle Renewal - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = authParts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('DELETE Vehicle Renewal - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const renewalId = params.id

    logAction('DELETE Vehicle Renewal', userId, { renewalId })

    try {
      // Vérifier que le renouvellement existe et appartient à l'utilisateur
      const existingRenewal = await prisma.vehicleRenewal.findFirst({
        where: {
          id: renewalId,
          vehicle: {
            userId
          }
        }
      })

      if (!existingRenewal) {
        logAction('DELETE Vehicle Renewal - Not found', userId, { renewalId })
        return NextResponse.json(
          { success: false, error: 'Renouvellement non trouvé' },
          { status: 404 }
        )
      }

      // Supprimer le renouvellement
      await prisma.vehicleRenewal.delete({
        where: { id: renewalId }
      })

      logAction('DELETE Vehicle Renewal - Success', userId, { renewalId })

      return NextResponse.json({
        success: true,
        message: 'Renouvellement supprimé avec succès'
      })

    } catch (dbError) {
      logAction('DELETE Vehicle Renewal - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression du renouvellement' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('DELETE Vehicle Renewal - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}