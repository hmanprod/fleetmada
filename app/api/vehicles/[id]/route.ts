import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UpdateVehicleSchema } from '@/lib/validations/vehicle-validations'
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
  console.log(`[Vehicle API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Vehicle API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Vehicle API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction utilitaire pour vérifier l'accès au véhicule
const checkVehicleAccess = async (vehicleId: string, userId: string) => {
  const vehicle = await prisma.vehicle.findFirst({
    where: {
      id: vehicleId,
      userId
    },
    include: {
      _count: {
        select: {
          fuelEntries: true,
          serviceEntries: true,
          issues: true,
          chargingEntries: true,
          meterEntries: true,
          reminders: true,
          expenses: true,
          assignments: true
        }
      }
    }
  })

  if (!vehicle) {
    return null
  }

  return vehicle
}

// GET /api/vehicles/[id] - Détails d'un véhicule spécifique
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
      logAction('GET Vehicle - Missing authorization header', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Vehicle - Invalid authorization header format', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Vehicle - Invalid token', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('GET Vehicle - Missing user ID in token', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    logAction('GET Vehicle', userId, { userId, vehicleId })

    try {
      // Vérification de l'accès au véhicule
      const vehicle = await checkVehicleAccess(vehicleId, userId)

      if (!vehicle) {
        logAction('GET Vehicle - Vehicle not found or access denied', userId, { vehicleId })
        return NextResponse.json(
          { success: false, error: 'Véhicule non trouvé ou accès refusé' },
          { status: 404 }
        )
      }

      // Récupération de la dernière lecture de compteur
      const lastMeterReading = await prisma.meterEntry.findFirst({
        where: {
          vehicleId: vehicle.id,
          type: 'MILEAGE',
          void: false
        },
        orderBy: {
          date: 'desc'
        },
        select: {
          value: true,
          date: true,
          unit: true
        }
      })

      // Récupération de l'assignation active
      const activeAssignment = await prisma.vehicleAssignment.findFirst({
        where: {
          vehicleId: vehicle.id,
          status: 'ACTIVE'
        },
        orderBy: {
          startDate: 'desc'
        }
      })

      // Calcul des coûts récents (30 derniers jours)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

      const [fuelCosts, serviceCosts, chargingCosts, expenseCosts] = await Promise.all([
        prisma.fuelEntry.aggregate({
          where: {
            vehicleId: vehicle.id,
            date: { gte: thirtyDaysAgo }
          },
          _sum: { cost: true }
        }),
        prisma.serviceEntry.aggregate({
          where: {
            vehicleId: vehicle.id,
            date: { gte: thirtyDaysAgo }
          },
          _sum: { totalCost: true }
        }),
        prisma.chargingEntry.aggregate({
          where: {
            vehicleId: vehicle.id,
            date: { gte: thirtyDaysAgo }
          },
          _sum: { cost: true }
        }),
        prisma.expenseEntry.aggregate({
          where: {
            vehicleId: vehicle.id,
            date: { gte: thirtyDaysAgo }
          },
          _sum: { amount: true }
        })
      ])

      const recentCosts = (fuelCosts._sum.cost || 0) +
        (serviceCosts._sum.totalCost || 0) +
        (chargingCosts._sum.cost || 0) +
        (expenseCosts._sum.amount || 0)

      // Récupération des statistiques générales
      const [
        totalFuelEntries,
        totalServiceEntries,
        totalIssues,
        totalExpenses,
        totalAssignments,
        totalMeterEntries
      ] = await Promise.all([
        prisma.fuelEntry.count({ where: { vehicleId: vehicle.id } }),
        prisma.serviceEntry.count({ where: { vehicleId: vehicle.id } }),
        prisma.issue.count({ where: { vehicleId: vehicle.id } }),
        prisma.expenseEntry.count({ where: { vehicleId: vehicle.id } }),
        prisma.vehicleAssignment.count({ where: { vehicleId: vehicle.id } }),
        prisma.meterEntry.count({ where: { vehicleId: vehicle.id } })
      ])

      const vehicleData = {
        id: vehicle.id,
        name: vehicle.name,
        vin: vehicle.vin,
        type: vehicle.type,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        status: vehicle.status,
        ownership: vehicle.ownership,
        labels: vehicle.labels || [],
        serviceProgram: vehicle.serviceProgram,
        image: vehicle.image,
        licensePlate: vehicle.licensePlate,
        meterReading: vehicle.meterReading,
        passengerCount: vehicle.passengerCount,
        // Lifecycle
        inServiceDate: vehicle.inServiceDate,
        inServiceOdometer: vehicle.inServiceOdometer,
        estimatedServiceLifeMonths: vehicle.estimatedServiceLifeMonths,
        estimatedServiceLifeMiles: vehicle.estimatedServiceLifeMiles,
        estimatedResaleValue: vehicle.estimatedResaleValue,
        outOfServiceDate: vehicle.outOfServiceDate,
        outOfServiceOdometer: vehicle.outOfServiceOdometer,
        // Purchase information
        purchaseVendor: vehicle.purchaseVendor,
        purchaseDate: vehicle.purchaseDate,
        purchasePrice: vehicle.purchasePrice,
        purchaseOdometer: vehicle.purchaseOdometer,
        purchaseNotes: vehicle.purchaseNotes,
        loanLeaseType: vehicle.loanLeaseType,
        // Settings
        primaryMeter: vehicle.primaryMeter,
        fuelUnit: vehicle.fuelUnit,
        measurementUnits: vehicle.measurementUnits,
        // Specifications - Dimensions
        bodyType: vehicle.bodyType,
        bodySubtype: vehicle.bodySubtype,
        msrp: vehicle.msrp,
        width: vehicle.width,
        height: vehicle.height,
        length: vehicle.length,
        interiorVolume: vehicle.interiorVolume,
        passengerVolume: vehicle.passengerVolume,
        cargoVolume: vehicle.cargoVolume,
        groundClearance: vehicle.groundClearance,
        bedLength: vehicle.bedLength,
        // Specifications - Weight
        curbWeight: vehicle.curbWeight,
        grossVehicleWeight: vehicle.grossVehicleWeight,
        // Specifications - Performance
        towingCapacity: vehicle.towingCapacity,
        maxPayload: vehicle.maxPayload,
        // Specifications - Fuel Economy
        epaCity: vehicle.epaCity,
        epaHighway: vehicle.epaHighway,
        epaCombined: vehicle.epaCombined,
        // Specifications - Fuel & Oil
        fuelQuality: vehicle.fuelQuality,
        fuelTankCapacity: vehicle.fuelTankCapacity,
        fuelTank2Capacity: vehicle.fuelTank2Capacity,
        oilCapacity: vehicle.oilCapacity,
        // Specifications - Engine
        engineDescription: vehicle.engineDescription,
        engineBrand: vehicle.engineBrand,
        engineAspiration: vehicle.engineAspiration,
        engineBlockType: vehicle.engineBlockType,
        engineBore: vehicle.engineBore,
        engineCamType: vehicle.engineCamType,
        engineCompression: vehicle.engineCompression,
        engineCylinders: vehicle.engineCylinders,
        engineDisplacement: vehicle.engineDisplacement,
        fuelInduction: vehicle.fuelInduction,
        maxHp: vehicle.maxHp,
        maxTorque: vehicle.maxTorque,
        redlineRpm: vehicle.redlineRpm,
        engineStroke: vehicle.engineStroke,
        engineValves: vehicle.engineValves,
        // Specifications - Transmission
        transmissionDescription: vehicle.transmissionDescription,
        transmissionBrand: vehicle.transmissionBrand,
        transmissionType: vehicle.transmissionType,
        transmissionGears: vehicle.transmissionGears,
        // Specifications - Wheels & Tires
        driveType: vehicle.driveType,
        brakeSystem: vehicle.brakeSystem,
        frontTrackWidth: vehicle.frontTrackWidth,
        rearTrackWidth: vehicle.rearTrackWidth,
        wheelbase: vehicle.wheelbase,
        frontWheelDiameter: vehicle.frontWheelDiameter,
        rearWheelDiameter: vehicle.rearWheelDiameter,
        rearAxleType: vehicle.rearAxleType,
        frontTireType: vehicle.frontTireType,
        frontTirePsi: vehicle.frontTirePsi,
        rearTireType: vehicle.rearTireType,
        rearTirePsi: vehicle.rearTirePsi,
        // Computed/Other
        group: vehicle.group,
        operator: vehicle.operator,
        lastMeterReading: lastMeterReading?.value || null,
        lastMeterDate: lastMeterReading?.date || null,
        lastMeterUnit: lastMeterReading?.unit || 'mi',
        activeAssignment: activeAssignment ? {
          operator: activeAssignment.operator,
          startDate: activeAssignment.startDate,
          endDate: activeAssignment.endDate
        } : null,
        metrics: {
          fuelEntries: totalFuelEntries,
          serviceEntries: totalServiceEntries,
          issues: totalIssues,
          chargingEntries: vehicle._count.chargingEntries,
          meterEntries: totalMeterEntries,
          reminders: vehicle._count.reminders,
          expenses: totalExpenses,
          assignments: totalAssignments
        },
        recentCosts: Math.round(recentCosts * 100) / 100,
        createdAt: vehicle.createdAt,
        updatedAt: vehicle.updatedAt
      }

      logAction('GET Vehicle - Success', userId, {
        userId,
        vehicleId: vehicle.id,
        vehicleName: vehicle.name
      })

      return NextResponse.json(
        {
          success: true,
          data: vehicleData
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('GET Vehicle - Database error', userId, {
        vehicleId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération du véhicule' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    const vehicleId = params?.id || 'unknown'

    logAction('GET Vehicle - Server error', userId, {
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

// PUT /api/vehicles/[id] - Modification d'un véhicule
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
      logAction('PUT Vehicle - Missing authorization header', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('PUT Vehicle - Invalid authorization header format', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('PUT Vehicle - Invalid token', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('PUT Vehicle - Missing user ID in token', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    // Extraction et validation des données
    const body = await request.json()
    const updateData = UpdateVehicleSchema.parse({ ...body, id: vehicleId })

    logAction('PUT Vehicle', userId, {
      userId,
      vehicleId,
      updateFields: Object.keys(body)
    })

    try {
      // Vérification de l'accès au véhicule
      const existingVehicle = await checkVehicleAccess(vehicleId, userId)

      if (!existingVehicle) {
        logAction('PUT Vehicle - Vehicle not found or access denied', userId, { vehicleId })
        return NextResponse.json(
          { success: false, error: 'Véhicule non trouvé ou accès refusé' },
          { status: 404 }
        )
      }

      // Vérification du VIN si il est modifié
      if (body.vin && body.vin !== existingVehicle.vin) {
        const vinExists = await prisma.vehicle.findUnique({
          where: { vin: body.vin }
        })

        if (vinExists) {
          logAction('PUT Vehicle - VIN already exists', userId, {
            vehicleId,
            vin: body.vin
          })

          return NextResponse.json(
            { success: false, error: 'Un véhicule avec ce VIN existe déjà' },
            { status: 409 }
          )
        }
      }

      // Préparation des données de mise à jour - Seuls les champs valides pour Prisma
      const validFields = [
        'name', 'vin', 'type', 'year', 'make', 'model', 'status', 'image', 'meterReading',
        'bodyType', 'bodySubtype', 'msrp', 'width', 'height', 'length', 'interiorVolume',
        'passengerVolume', 'cargoVolume', 'groundClearance', 'bedLength', 'curbWeight',
        'grossVehicleWeight', 'towingCapacity', 'maxPayload', 'epaCity', 'epaHighway',
        'epaCombined', 'fuelQuality', 'fuelTankCapacity', 'fuelTank2Capacity', 'oilCapacity',
        'engineDescription', 'engineBrand', 'engineAspiration', 'engineBlockType',
        'engineBore', 'engineCamType', 'engineCompression', 'engineCylinders',
        'engineDisplacement', 'fuelInduction', 'maxHp', 'maxTorque', 'redlineRpm',
        'engineStroke', 'engineValves', 'transmissionDescription', 'transmissionBrand',
        'transmissionType', 'transmissionGears', 'driveType', 'brakeSystem',
        'frontTrackWidth', 'rearTrackWidth', 'wheelbase', 'frontWheelDiameter',
        'rearWheelDiameter', 'rearAxleType', 'frontTireType', 'frontTirePsi',
        'rearTireType', 'rearTirePsi', 'ownership', 'labels', 'serviceProgram',
        'inServiceDate', 'inServiceOdometer', 'estimatedServiceLifeMonths',
        'estimatedServiceLifeMiles', 'estimatedResaleValue', 'outOfServiceDate',
        'outOfServiceOdometer', 'purchaseVendor', 'purchaseDate', 'purchasePrice',
        'purchaseOdometer', 'purchaseNotes', 'loanLeaseType', 'primaryMeter',
        'fuelUnit', 'measurementUnits', 'group', 'operator', 'licensePlate', 'passengerCount'
      ];

      const updateFields: any = {};

      Object.keys(body).forEach(key => {
        if (validFields.includes(key)) {
          let value = body[key];

          // Conversion des dates
          if (['inServiceDate', 'purchaseDate', 'outOfServiceDate'].includes(key) && value) {
            updateFields[key] = new Date(value);
          } else {
            updateFields[key] = value;
          }
        }
      });

      // Mise à jour du véhicule
      const updatedVehicle = await prisma.vehicle.update({
        where: { id: vehicleId },
        data: updateFields
      })

      logAction('PUT Vehicle - Success', userId, {
        userId,
        vehicleId: updatedVehicle.id,
        vehicleName: updatedVehicle.name
      })

      return NextResponse.json(
        {
          success: true,
          data: updatedVehicle,
          message: 'Véhicule mis à jour avec succès'
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('PUT Vehicle - Database error', userId, {
        vehicleId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour du véhicule' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    const vehicleId = params?.id || 'unknown'

    // Gestion des erreurs de validation
    if (error instanceof Error && error.name === 'ZodError') {
      logAction('PUT Vehicle - Validation error', userId, {
        vehicleId,
        error: error.message
      })

      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.message },
        { status: 400 }
      )
    }

    logAction('PUT Vehicle - Server error', userId, {
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

// DELETE /api/vehicles/[id] - Suppression d'un véhicule
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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
      logAction('DELETE Vehicle - Missing authorization header', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('DELETE Vehicle - Invalid authorization header format', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('DELETE Vehicle - Invalid token', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('DELETE Vehicle - Missing user ID in token', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    logAction('DELETE Vehicle', userId, { userId, vehicleId })

    try {
      // Vérification de l'accès au véhicule
      const vehicle = await checkVehicleAccess(vehicleId, userId)

      if (!vehicle) {
        logAction('DELETE Vehicle - Vehicle not found or access denied', userId, { vehicleId })
        return NextResponse.json(
          { success: false, error: 'Véhicule non trouvé ou accès refusé' },
          { status: 404 }
        )
      }

      // Vérification des dépendances importantes
      const hasFuelEntries = await prisma.fuelEntry.count({ where: { vehicleId } })
      const hasServiceEntries = await prisma.serviceEntry.count({ where: { vehicleId } })
      const hasIssues = await prisma.issue.count({ where: { vehicleId } })

      if (hasFuelEntries > 0 || hasServiceEntries > 0 || hasIssues > 0) {
        logAction('DELETE Vehicle - Cannot delete vehicle with dependencies', userId, {
          vehicleId,
          fuelEntries: hasFuelEntries,
          serviceEntries: hasServiceEntries,
          issues: hasIssues
        })

        return NextResponse.json(
          {
            success: false,
            error: 'Impossible de supprimer ce véhicule car il contient des données importantes (carburant, maintenance, problèmes)'
          },
          { status: 409 }
        )
      }

      // Suppression du véhicule (cascade automatique pour les autres tables)
      await prisma.vehicle.delete({
        where: { id: vehicleId }
      })

      logAction('DELETE Vehicle - Success', userId, {
        userId,
        vehicleId,
        vehicleName: vehicle.name
      })

      return NextResponse.json(
        {
          success: true,
          message: 'Véhicule supprimé avec succès'
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('DELETE Vehicle - Database error', userId, {
        vehicleId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression du véhicule' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    const vehicleId = params?.id || 'unknown'

    logAction('DELETE Vehicle - Server error', userId, {
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