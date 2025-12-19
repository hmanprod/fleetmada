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
      console.log('[Charging Entry API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Charging Entry API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Charging Entry API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// GET /api/charging/entries/[id] - Détails entrée spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const entryId = params.id

    logAction('GET_CHARGING_ENTRY', user.userId, { entryId })

    // Récupération de l'entrée avec vérification des permissions
    const entry = await prisma.chargingEntry.findFirst({
      where: {
        id: entryId,
        userId: user.userId
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

    if (!entry) {
      return NextResponse.json({ error: 'Entrée de recharge non trouvée' }, { status: 404 })
    }

    // Format de réponse
    const formattedEntry = {
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
    }

    logAction('GET_CHARGING_ENTRY_SUCCESS', user.userId, { entryId })

    return NextResponse.json(formattedEntry)
  } catch (error) {
    console.error('[Charging Entry API] GET Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'entrée de recharge' },
      { status: 500 }
    )
  }
}

// PUT /api/charging/entries/[id] - Modification entrée
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const entryId = params.id
    const body = await request.json()

    logAction('UPDATE_CHARGING_ENTRY', user.userId, { entryId, body })

    // Vérification que l'entrée existe et appartient à l'utilisateur
    const existingEntry = await prisma.chargingEntry.findFirst({
      where: {
        id: entryId,
        userId: user.userId
      }
    })

    if (!existingEntry) {
      return NextResponse.json({ error: 'Entrée de recharge non trouvée' }, { status: 404 })
    }

    // Validation des données si fournies
    if (body.energyKwh !== undefined && body.energyKwh <= 0) {
      return NextResponse.json({ error: 'L\'énergie en kWh doit être supérieure à 0' }, { status: 400 })
    }

    if (body.cost !== undefined && body.cost < 0) {
      return NextResponse.json({ error: 'Le coût ne peut pas être négatif' }, { status: 400 })
    }

    // Si le véhicule est modifié, vérifier qu'il appartient à l'utilisateur
    if (body.vehicleId && body.vehicleId !== existingEntry.vehicleId) {
      const vehicle = await prisma.vehicle.findFirst({
        where: {
          id: body.vehicleId,
          userId: user.userId
        }
      })

      if (!vehicle) {
        return NextResponse.json({ error: 'Véhicule non trouvé' }, { status: 404 })
      }
    }

    // Préparation des données de mise à jour
    const updateData: any = {}
    
    if (body.vehicleId) updateData.vehicleId = body.vehicleId
    if (body.date) updateData.date = new Date(body.date)
    if (body.location !== undefined) updateData.location = body.location || null
    if (body.energyKwh !== undefined) updateData.energyKwh = body.energyKwh
    if (body.cost !== undefined) updateData.cost = body.cost
    if (body.durationMin !== undefined) updateData.durationMin = body.durationMin || null

    // Mise à jour de l'entrée
    const updatedEntry = await prisma.chargingEntry.update({
      where: { id: entryId },
      data: updateData,
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
      id: updatedEntry.id,
      vehicleId: updatedEntry.vehicleId,
      userId: updatedEntry.userId,
      date: updatedEntry.date.toISOString(),
      location: updatedEntry.location || '',
      energyKwh: updatedEntry.energyKwh,
      cost: updatedEntry.cost,
      durationMin: updatedEntry.durationMin || 0,
      createdAt: updatedEntry.createdAt.toISOString(),
      vehicle: updatedEntry.vehicle
    }

    logAction('UPDATE_CHARGING_ENTRY_SUCCESS', user.userId, { entryId })

    return NextResponse.json(formattedEntry)
  } catch (error) {
    console.error('[Charging Entry API] PUT Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'entrée de recharge' },
      { status: 500 }
    )
  }
}

// DELETE /api/charging/entries/[id] - Suppression entrée
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const entryId = params.id

    logAction('DELETE_CHARGING_ENTRY', user.userId, { entryId })

    // Vérification que l'entrée existe et appartient à l'utilisateur
    const existingEntry = await prisma.chargingEntry.findFirst({
      where: {
        id: entryId,
        userId: user.userId
      }
    })

    if (!existingEntry) {
      return NextResponse.json({ error: 'Entrée de recharge non trouvée' }, { status: 404 })
    }

    // Suppression de l'entrée
    await prisma.chargingEntry.delete({
      where: { id: entryId }
    })

    logAction('DELETE_CHARGING_ENTRY_SUCCESS', user.userId, { entryId })

    return NextResponse.json({ message: 'Entrée de recharge supprimée avec succès' })
  } catch (error) {
    console.error('[Charging Entry API] DELETE Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'entrée de recharge' },
      { status: 500 }
    )
  }
}