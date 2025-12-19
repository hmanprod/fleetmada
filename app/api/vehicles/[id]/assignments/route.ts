import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { 
  CreateVehicleAssignmentSchema,
  type CreateVehicleAssignmentInput
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
  console.log(`[Vehicle Assignments API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Vehicle Assignments API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Vehicle Assignments API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
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

// GET /api/vehicles/[id]/assignments - Historique des assignations
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
      logAction('GET Assignments - Missing authorization header', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Assignments - Invalid authorization header format', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Assignments - Invalid token', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('GET Assignments - Missing user ID in token', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    logAction('GET Assignments', userId, { userId, vehicleId })

    try {
      // Vérification de l'accès au véhicule
      const vehicle = await checkVehicleAccess(vehicleId, userId)

      if (!vehicle) {
        logAction('GET Assignments - Vehicle not found or access denied', userId, { vehicleId })
        return NextResponse.json(
          { success: false, error: 'Véhicule non trouvé ou accès refusé' },
          { status: 404 }
        )
      }

      // Récupération des assignations avec tri par date décroissante
      const assignments = await prisma.vehicleAssignment.findMany({
        where: { vehicleId },
        orderBy: {
          startDate: 'desc'
        }
      })

      // Transformation des données pour l'API
      const assignmentsData = assignments.map(assignment => ({
        id: assignment.id,
        vehicleId: assignment.vehicleId,
        operator: assignment.operator,
        startDate: assignment.startDate,
        endDate: assignment.endDate,
        status: assignment.status,
        duration: assignment.endDate ? 
          Math.ceil((assignment.endDate.getTime() - assignment.startDate.getTime()) / (1000 * 60 * 60 * 24)) : null,
        isActive: assignment.status === 'ACTIVE',
        createdAt: assignment.createdAt
      }))

      // Calcul des statistiques
      const stats = {
        totalAssignments: assignments.length,
        activeAssignments: assignments.filter(a => a.status === 'ACTIVE').length,
        completedAssignments: assignments.filter(a => a.status === 'INACTIVE').length,
        temporaryAssignments: assignments.filter(a => a.status === 'TEMPORARY').length,
        currentOperator: assignments.find(a => a.status === 'ACTIVE')?.operator || null,
        totalOperators: new Set(assignments.map(a => a.operator)).size,
        averageDuration: assignments.filter(a => a.endDate).length > 0 ?
          assignments.filter(a => a.endDate)
            .reduce((sum, a) => sum + Math.ceil((a.endDate!.getTime() - a.startDate.getTime()) / (1000 * 60 * 60 * 24)), 0) / 
          assignments.filter(a => a.endDate).length : 0
      }

      // Récupération des assignations récentes (30 derniers jours)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const recentAssignments = assignments.filter(a => a.startDate >= thirtyDaysAgo)

      logAction('GET Assignments - Success', userId, { 
        userId, 
        vehicleId,
        totalAssignments: assignments.length,
        activeAssignments: stats.activeAssignments
      })

      return NextResponse.json(
        {
          success: true,
          data: {
            assignments: assignmentsData,
            stats,
            recentActivity: recentAssignments.map(a => ({
              operator: a.operator,
              startDate: a.startDate,
              endDate: a.endDate,
              status: a.status
            }))
          }
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('GET Assignments - Database error', userId, {
        vehicleId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des assignations' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    const vehicleId = params?.id || 'unknown'
    
    logAction('GET Assignments - Server error', userId, {
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

// POST /api/vehicles/[id]/assignments - Nouvelle assignation
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
      logAction('POST Assignment - Missing authorization header', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('POST Assignment - Invalid authorization header format', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('POST Assignment - Invalid token', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('POST Assignment - Missing user ID in token', 'unknown', { vehicleId })
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    // Extraction et validation des données
    const body = await request.json()
    const assignmentData = CreateVehicleAssignmentSchema.parse({
      ...body,
      vehicleId
    })

    logAction('POST Assignment', userId, { 
      userId, 
      vehicleId,
      operator: assignmentData.operator,
      startDate: assignmentData.startDate
    })

    try {
      // Vérification de l'accès au véhicule
      const vehicle = await checkVehicleAccess(vehicleId, userId)

      if (!vehicle) {
        logAction('POST Assignment - Vehicle not found or access denied', userId, { vehicleId })
        return NextResponse.json(
          { success: false, error: 'Véhicule non trouvé ou accès refusé' },
          { status: 404 }
        )
      }

      // Vérification des chevauchements d'assignation
      const startDate = new Date(assignmentData.startDate)
      const endDate = assignmentData.endDate ? new Date(assignmentData.endDate) : null

      const overlappingAssignments = await prisma.vehicleAssignment.findMany({
        where: {
          vehicleId,
          status: 'ACTIVE'
        }
      })

      // Vérification des chevauchements pour les assignations actives
      if (assignmentData.status === 'ACTIVE') {
        for (const existing of overlappingAssignments) {
          if (endDate) {
            // Nouvelle assignation avec fin
            if (startDate < existing.endDate! && endDate > existing.startDate) {
              logAction('POST Assignment - Overlapping assignment', userId, { 
                vehicleId,
                operator: assignmentData.operator,
                conflictingOperator: existing.operator
              })

              return NextResponse.json(
                { 
                  success: false, 
                  error: `Chevauchement avec l'assignation existante de ${existing.operator}` 
                },
                { status: 409 }
              )
            }
          } else {
            // Nouvelle assignation sans fin (assignation permanente)
            if (startDate < existing.endDate!) {
              logAction('POST Assignment - Overlapping assignment', userId, { 
                vehicleId,
                operator: assignmentData.operator,
                conflictingOperator: existing.operator
              })

              return NextResponse.json(
                { 
                  success: false, 
                  error: `Chevauchement avec l'assignation existante de ${existing.operator}` 
                },
                { status: 409 }
              )
            }
          }
        }
      }

      // Vérification que l'opérateur n'est pas déjà assigné à ce véhicule
      const existingAssignment = await prisma.vehicleAssignment.findFirst({
        where: {
          vehicleId,
          operator: assignmentData.operator,
          status: 'ACTIVE'
        }
      })

      if (existingAssignment && assignmentData.status === 'ACTIVE') {
        logAction('POST Assignment - Operator already assigned', userId, { 
          vehicleId,
          operator: assignmentData.operator
        })

        return NextResponse.json(
          { 
            success: false, 
            error: `L'opérateur ${assignmentData.operator} est déjà assigné à ce véhicule` 
          },
          { status: 409 }
        )
      }

      // Si c'est une nouvelle assignation active, terminer les assignations actives existantes
      if (assignmentData.status === 'ACTIVE') {
        await prisma.vehicleAssignment.updateMany({
          where: {
            vehicleId,
            status: 'ACTIVE'
          },
          data: {
            status: 'INACTIVE',
            endDate: new Date()
          }
        })
      }

      // Création de la nouvelle assignation
      const newAssignment = await prisma.vehicleAssignment.create({
        data: {
          ...assignmentData,
          startDate: startDate,
          endDate: endDate
        }
      })

      logAction('POST Assignment - Success', userId, { 
        userId, 
        vehicleId,
        assignmentId: newAssignment.id,
        operator: newAssignment.operator
      })

      return NextResponse.json(
        {
          success: true,
          data: {
            id: newAssignment.id,
            vehicleId: newAssignment.vehicleId,
            operator: newAssignment.operator,
            startDate: newAssignment.startDate,
            endDate: newAssignment.endDate,
            status: newAssignment.status,
            duration: newAssignment.endDate ? 
              Math.ceil((newAssignment.endDate.getTime() - newAssignment.startDate.getTime()) / (1000 * 60 * 60 * 24)) : null,
            isActive: newAssignment.status === 'ACTIVE',
            createdAt: newAssignment.createdAt
          },
          message: 'Assignation créée avec succès'
        },
        { status: 201 }
      )

    } catch (dbError) {
      logAction('POST Assignment - Database error', userId, {
        vehicleId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création de l\'assignation' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    const vehicleId = params?.id || 'unknown'
    
    // Gestion des erreurs de validation
    if (error instanceof Error && error.name === 'ZodError') {
      logAction('POST Assignment - Validation error', userId, {
        vehicleId,
        error: error.message
      })

      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.message },
        { status: 400 }
      )
    }

    logAction('POST Assignment - Server error', userId, {
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
    { error: 'Méthode non autorisée. Utilisez /api/vehicles/[id]/assignments/[assignmentId] pour la modification' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Méthode non autorisée. Utilisez /api/vehicles/[id]/assignments/[assignmentId] pour la suppression' },
    { status: 405 }
  )
}