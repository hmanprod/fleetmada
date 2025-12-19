import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UpdateMeterEntrySchema } from '@/lib/validations/vehicle-validations'
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
  console.log(`[Meter Entry API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Meter Entry API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Meter Entry API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction utilitaire pour vérifier l'accès au véhicule et à l'entrée
const checkMeterEntryAccess = async (vehicleId: string, entryId: string, userId: string) => {
  const meterEntry = await prisma.meterEntry.findFirst({
    where: {
      id: entryId,
      vehicleId,
      vehicle: {
        userId
      }
    },
    include: {
      vehicle: true
    }
  })

  if (!meterEntry) {
    return null
  }

  return meterEntry
}

// GET /api/vehicles/[id]/meter-entries/[entryId] - Détails d'une entrée de compteur spécifique
export async function GET(request: NextRequest, { params }: { params: { id: string, entryId: string } }) {
  try {
    const { id: vehicleId, entryId } = params

    if (!vehicleId || !entryId) {
      return NextResponse.json(
        { success: false, error: 'ID du véhicule ou de l\'entrée manquant' },
        { status: 400 }
      )
    }

    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Meter Entry - Missing authorization header', 'unknown', { vehicleId, entryId })
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Meter Entry - Invalid authorization header format', 'unknown', { vehicleId, entryId })
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Meter Entry - Invalid token', 'unknown', { vehicleId, entryId })
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('GET Meter Entry - Missing user ID in token', 'unknown', { vehicleId, entryId })
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    logAction('GET Meter Entry', userId, { userId, vehicleId, entryId })

    try {
      // Vérification de l'accès à l'entrée de compteur
      const meterEntry = await checkMeterEntryAccess(vehicleId, entryId, userId)

      if (!meterEntry) {
        logAction('GET Meter Entry - Entry not found or access denied', userId, { vehicleId, entryId })
        return NextResponse.json(
          { success: false, error: 'Entrée de compteur non trouvée ou accès refusé' },
          { status: 404 }
        )
      }

      const meterEntryData = {
        id: meterEntry.id,
        vehicleId: meterEntry.vehicleId,
        date: meterEntry.date,
        value: meterEntry.value,
        type: meterEntry.type,
        unit: meterEntry.unit,
        isVoid: meterEntry.void,
        voidStatus: meterEntry.voidStatus,
        autoVoidReason: meterEntry.autoVoidReason,
        source: meterEntry.source,
        createdAt: meterEntry.createdAt,
        vehicle: {
          id: meterEntry.vehicle.id,
          name: meterEntry.vehicle.name,
          vin: meterEntry.vehicle.vin
        }
      }

      logAction('GET Meter Entry - Success', userId, { 
        userId, 
        vehicleId,
        entryId: meterEntry.id,
        entryValue: meterEntry.value
      })

      return NextResponse.json(
        {
          success: true,
          data: meterEntryData
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('GET Meter Entry - Database error', userId, {
        vehicleId,
        entryId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération de l\'entrée de compteur' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    const { id: vehicleId, entryId } = params || { id: 'unknown', entryId: 'unknown' }
    
    logAction('GET Meter Entry - Server error', userId, {
      vehicleId,
      entryId,
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// PUT /api/vehicles/[id]/meter-entries/[entryId] - Modification d'une entrée de compteur
export async function PUT(request: NextRequest, { params }: { params: { id: string, entryId: string } }) {
  try {
    const { id: vehicleId, entryId } = params

    if (!vehicleId || !entryId) {
      return NextResponse.json(
        { success: false, error: 'ID du véhicule ou de l\'entrée manquant' },
        { status: 400 }
      )
    }

    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('PUT Meter Entry - Missing authorization header', 'unknown', { vehicleId, entryId })
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('PUT Meter Entry - Invalid authorization header format', 'unknown', { vehicleId, entryId })
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('PUT Meter Entry - Invalid token', 'unknown', { vehicleId, entryId })
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('PUT Meter Entry - Missing user ID in token', 'unknown', { vehicleId, entryId })
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    // Extraction et validation des données
    const body = await request.json()
    const updateData = UpdateMeterEntrySchema.parse({ ...body, id: entryId, vehicleId })

    logAction('PUT Meter Entry', userId, { 
      userId, 
      vehicleId,
      entryId,
      updateFields: Object.keys(body)
    })

    try {
      // Vérification de l'accès à l'entrée de compteur
      const existingMeterEntry = await checkMeterEntryAccess(vehicleId, entryId, userId)

      if (!existingMeterEntry) {
        logAction('PUT Meter Entry - Entry not found or access denied', userId, { vehicleId, entryId })
        return NextResponse.json(
          { success: false, error: 'Entrée de compteur non trouvée ou accès refusé' },
          { status: 404 }
        )
      }

      // Vérification de la cohérence des valeurs si c'est une modification de mileage
      if (body.value !== undefined && body.type === 'MILEAGE' && !existingMeterEntry.void) {
        const otherMileageEntries = await prisma.meterEntry.findMany({
          where: {
            vehicleId,
            type: 'MILEAGE',
            void: false,
            id: { not: entryId }
          },
          orderBy: {
            date: 'desc'
          }
        })

        // Vérification qu'il n'y a pas d'entrée avec une valeur plus élevée après celle-ci
        if (body.value < existingMeterEntry.value) {
          const laterEntries = await prisma.meterEntry.findMany({
            where: {
              vehicleId,
              type: 'MILEAGE',
              void: false,
              id: { not: entryId },
              date: { gt: existingMeterEntry.date }
            },
            orderBy: {
              date: 'asc'
            }
          })

          if (laterEntries.some(entry => entry.value > body.value)) {
            logAction('PUT Meter Entry - Invalid mileage value', userId, { 
              vehicleId,
              entryId,
              newValue: body.value,
              conflictingValue: laterEntries.find(entry => entry.value > body.value)?.value
            })

            return NextResponse.json(
              { 
                success: false, 
                error: `Cette modification créerait une incohérence dans l'historique du compteur` 
              },
              { status: 400 }
            )
          }
        }
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

      // Mise à jour de l'entrée de compteur
      const updatedMeterEntry = await prisma.meterEntry.update({
        where: { id: entryId },
        data: updateFields
      })

      // Mise à jour du meterReading du véhicule si c'est une lecture de mileage et que c'est la dernière
      if (updateFields.type === 'MILEAGE' && !updatedMeterEntry.void) {
        const latestMileageEntry = await prisma.meterEntry.findFirst({
          where: {
            vehicleId,
            type: 'MILEAGE',
            void: false
          },
          orderBy: {
            date: 'desc'
          }
        })

        if (latestMileageEntry && latestMileageEntry.id === entryId) {
          await prisma.vehicle.update({
            where: { id: vehicleId },
            data: { meterReading: updatedMeterEntry.value }
          })
        }
      }

      logAction('PUT Meter Entry - Success', userId, { 
        userId, 
        vehicleId,
        entryId: updatedMeterEntry.id,
        entryValue: updatedMeterEntry.value
      })

      return NextResponse.json(
        {
          success: true,
          data: {
            id: updatedMeterEntry.id,
            vehicleId: updatedMeterEntry.vehicleId,
            date: updatedMeterEntry.date,
            value: updatedMeterEntry.value,
            type: updatedMeterEntry.type,
            unit: updatedMeterEntry.unit,
            isVoid: updatedMeterEntry.void,
            voidStatus: updatedMeterEntry.voidStatus,
            autoVoidReason: updatedMeterEntry.autoVoidReason,
            source: updatedMeterEntry.source,
            createdAt: updatedMeterEntry.createdAt
          },
          message: 'Entrée de compteur mise à jour avec succès'
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('PUT Meter Entry - Database error', userId, {
        vehicleId,
        entryId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour de l\'entrée de compteur' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    const { id: vehicleId, entryId } = params || { id: 'unknown', entryId: 'unknown' }
    
    // Gestion des erreurs de validation
    if (error instanceof Error && error.name === 'ZodError') {
      logAction('PUT Meter Entry - Validation error', userId, {
        vehicleId,
        entryId,
        error: error.message
      })

      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.message },
        { status: 400 }
      )
    }

    logAction('PUT Meter Entry - Server error', userId, {
      vehicleId,
      entryId,
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// DELETE /api/vehicles/[id]/meter-entries/[entryId] - Suppression d'une entrée de compteur
export async function DELETE(request: NextRequest, { params }: { params: { id: string, entryId: string } }) {
  try {
    const { id: vehicleId, entryId } = params

    if (!vehicleId || !entryId) {
      return NextResponse.json(
        { success: false, error: 'ID du véhicule ou de l\'entrée manquant' },
        { status: 400 }
      )
    }

    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('DELETE Meter Entry - Missing authorization header', 'unknown', { vehicleId, entryId })
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('DELETE Meter Entry - Invalid authorization header format', 'unknown', { vehicleId, entryId })
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('DELETE Meter Entry - Invalid token', 'unknown', { vehicleId, entryId })
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('DELETE Meter Entry - Missing user ID in token', 'unknown', { vehicleId, entryId })
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    logAction('DELETE Meter Entry', userId, { userId, vehicleId, entryId })

    try {
      // Vérification de l'accès à l'entrée de compteur
      const meterEntry = await checkMeterEntryAccess(vehicleId, entryId, userId)

      if (!meterEntry) {
        logAction('DELETE Meter Entry - Entry not found or access denied', userId, { vehicleId, entryId })
        return NextResponse.json(
          { success: false, error: 'Entrée de compteur non trouvée ou accès refusé' },
          { status: 404 }
        )
      }

      // Vérification que ce n'est pas la dernière entrée de mileage active
      if (meterEntry.type === 'MILEAGE' && !meterEntry.void) {
        const otherMileageEntries = await prisma.meterEntry.count({
          where: {
            vehicleId,
            type: 'MILEAGE',
            void: false,
            id: { not: entryId }
          }
        })

        if (otherMileageEntries === 0) {
          logAction('DELETE Meter Entry - Cannot delete last mileage entry', userId, { vehicleId, entryId })
          return NextResponse.json(
            { 
              success: false, 
              error: 'Impossible de supprimer la dernière entrée de mileage active' 
            },
            { status: 409 }
          )
        }

        // Vérification si c'est la dernière entrée en date
        if (meterEntry.date >= new Date(Date.now() - 24 * 60 * 60 * 1000)) { // Moins de 24h
          const latestEntry = await prisma.meterEntry.findFirst({
            where: {
              vehicleId,
              type: 'MILEAGE',
              void: false,
              date: { gte: meterEntry.date }
            },
            orderBy: {
              date: 'desc'
            }
          })

          if (latestEntry && latestEntry.id === entryId) {
            logAction('DELETE Meter Entry - Cannot delete recent mileage entry', userId, { vehicleId, entryId })
            return NextResponse.json(
              { 
                success: false, 
                error: 'Impossible de supprimer une entrée de mileage récente (moins de 24h)' 
              },
              { status: 409 }
            )
          }
        }
      }

      // Suppression de l'entrée de compteur
      await prisma.meterEntry.delete({
        where: { id: entryId }
      })

      // Mise à jour du meterReading du véhicule si nécessaire
      if (meterEntry.type === 'MILEAGE' && !meterEntry.void) {
        const latestMileageEntry = await prisma.meterEntry.findFirst({
          where: {
            vehicleId,
            type: 'MILEAGE',
            void: false
          },
          orderBy: {
            date: 'desc'
          }
        })

        if (latestMileageEntry) {
          await prisma.vehicle.update({
            where: { id: vehicleId },
            data: { meterReading: latestMileageEntry.value }
          })
        } else {
          await prisma.vehicle.update({
            where: { id: vehicleId },
            data: { meterReading: null }
          })
        }
      }

      logAction('DELETE Meter Entry - Success', userId, { 
        userId, 
        vehicleId,
        entryId,
        entryValue: meterEntry.value
      })

      return NextResponse.json(
        {
          success: true,
          message: 'Entrée de compteur supprimée avec succès'
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('DELETE Meter Entry - Database error', userId, {
        vehicleId,
        entryId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression de l\'entrée de compteur' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    const { id: vehicleId, entryId } = params || { id: 'unknown', entryId: 'unknown' }
    
    logAction('DELETE Meter Entry - Server error', userId, {
      vehicleId,
      entryId,
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}