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

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Dashboard Maintenance API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Dashboard Maintenance API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Dashboard Maintenance API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// GET /api/dashboard/maintenance - État maintenance et rappels
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Maintenance - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Maintenance - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Maintenance - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('GET Maintenance - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    logAction('GET Maintenance', userId, { userId })

    // Récupération des données de maintenance
    try {
      const [
        totalReminders,
        upcomingReminders,
        overdueReminders,
        completedReminders,
        recentServices,
        upcomingReminderDetails,
        overdueReminderDetails
      ] = await Promise.all([
        // Total des rappels actifs
        prisma.serviceReminder.count({
          where: {
            vehicle: { userId },
            status: 'ACTIVE'
          }
        }),
        
        // Rappels à venir (7 prochains jours)
        prisma.serviceReminder.count({
          where: {
            vehicle: { userId },
            status: 'ACTIVE',
            nextDue: {
              gte: new Date(),
              lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
            }
          }
        }),
        
        // Rappels en retard
        prisma.serviceReminder.count({
          where: {
            vehicle: { userId },
            status: 'ACTIVE',
            nextDue: {
              lt: new Date()
            }
          }
        }),
        
        // Rappels terminés (derniers 30 jours)
        prisma.serviceReminder.count({
          where: {
            vehicle: { userId },
            status: { in: ['COMPLETED', 'DISMISSED'] },
            updatedAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 jours
            }
          }
        }),
        
        // Services récents (derniers 30 jours)
        prisma.serviceEntry.count({
          where: {
            userId,
            status: 'COMPLETED',
            date: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 jours
            }
          }
        }),
        
        // Détails des rappels à venir
        prisma.serviceReminder.findMany({
          where: {
            vehicle: { userId },
            status: 'ACTIVE',
            nextDue: {
              gte: new Date(),
              lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
            }
          },
          include: {
            vehicle: {
              select: {
                id: true,
                name: true,
                make: true,
                model: true
              }
            }
          },
          orderBy: {
            nextDue: 'asc'
          },
          take: 5
        }),
        
        // Détails des rappels en retard
        prisma.serviceReminder.findMany({
          where: {
            vehicle: { userId },
            status: 'ACTIVE',
            nextDue: {
              lt: new Date()
            }
          },
          include: {
            vehicle: {
              select: {
                id: true,
                name: true,
                make: true,
                model: true
              }
            }
          },
          orderBy: {
            nextDue: 'asc'
          },
          take: 10
        })
      ])

      // Transformation des données de rappels à venir
      const upcomingDetails = upcomingReminderDetails.map(reminder => ({
        id: reminder.id,
        task: reminder.task,
        vehicleName: reminder.vehicle.name,
        vehicleMake: reminder.vehicle.make,
        vehicleModel: reminder.vehicle.model,
        nextDue: reminder.nextDue,
        daysUntilDue: Math.ceil((reminder.nextDue.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
        compliance: reminder.compliance
      }))

      // Transformation des données de rappels en retard
      const overdueDetails = overdueReminderDetails.map(reminder => ({
        id: reminder.id,
        task: reminder.task,
        vehicleName: reminder.vehicle.name,
        vehicleMake: reminder.vehicle.make,
        vehicleModel: reminder.vehicle.model,
        nextDue: reminder.nextDue,
        daysOverdue: Math.ceil((new Date().getTime() - reminder.nextDue.getTime()) / (1000 * 60 * 60 * 24)),
        compliance: reminder.compliance
      }))

      // Calcul du taux de conformité
      const complianceRate = totalReminders > 0 ? 
        Math.round(((completedReminders) / (totalReminders + completedReminders)) * 100) : 100

      const maintenanceData = {
        summary: {
          totalReminders,
          upcomingReminders,
          overdueReminders,
          completedReminders,
          recentServices,
          complianceRate
        },
        upcomingReminders: upcomingDetails,
        overdueReminders: overdueDetails,
        status: {
          healthy: overdueReminders === 0,
          warning: upcomingReminders > 0 && overdueReminders === 0,
          critical: overdueReminders > 0
        },
        lastUpdated: new Date().toISOString()
      }

      logAction('GET Maintenance - Success', userId, { 
        userId, 
        totalReminders,
        upcomingReminders,
        overdueReminders,
        complianceRate
      })

      return NextResponse.json(
        {
          success: true,
          data: maintenanceData
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('GET Maintenance - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des données de maintenance' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Maintenance - Server error', userId, {
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
export async function POST() {
  return NextResponse.json(
    { error: 'Méthode non autorisée' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Méthode non autorisée' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Méthode non autorisée' },
    { status: 405 }
  )
}