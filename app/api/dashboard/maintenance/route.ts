import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateToken, getBaseFilter } from '@/lib/api-utils'

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Dashboard Maintenance API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// GET /api/dashboard/maintenance - État maintenance et rappels
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const tokenPayload = validateToken(request)

    if (!tokenPayload) {
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const { userId, role, companyId, email } = tokenPayload

    // Base filter: by company if available, otherwise by user
    const baseFilter = getBaseFilter(tokenPayload, 'vehicle.user')

    // Role-specific filters
    const isTech = role === 'TECHNICIAN'
    const isDriver = role === 'DRIVER'

    // For maintenance, techs see everything assigned to them or in company if they manage it
    // Drivers see only for their assigned vehicles
    const maintenanceFilter = isDriver ? { vehicle: { assignments: { some: { contact: { email: tokenPayload.email } } } } } : baseFilter
    const serviceFilter = isTech ? { assignedToContactId: userId } : (companyId ? { user: { companyId } } : { userId })

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
            ...maintenanceFilter,
            status: 'ACTIVE'
          }
        }),

        // Rappels à venir (7 prochains jours)
        prisma.serviceReminder.count({
          where: {
            ...maintenanceFilter,
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
            ...maintenanceFilter,
            status: 'ACTIVE',
            nextDue: {
              lt: new Date()
            }
          }
        }),

        // Rappels terminés (derniers 30 jours)
        prisma.serviceReminder.count({
          where: {
            ...maintenanceFilter as any,
            status: { in: ['COMPLETED', 'DISMISSED'] },
            updatedAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 jours
            }
          }
        }),

        // Services récents (derniers 30 jours)
        prisma.serviceEntry.count({
          where: {
            ...serviceFilter as any,
            status: 'COMPLETED',
            date: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 jours
            }
          }
        }),

        // Détails des rappels à venir
        prisma.serviceReminder.findMany({
          where: {
            ...maintenanceFilter,
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
            ...maintenanceFilter,
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
      const upcomingDetails = (upcomingReminderDetails as any[])
        .filter(reminder => reminder.nextDue !== null)
        .map(reminder => ({
          id: reminder.id,
          task: reminder.task,
          vehicleName: reminder.vehicle?.name,
          vehicleMake: reminder.vehicle?.make,
          vehicleModel: reminder.vehicle?.model,
          nextDue: reminder.nextDue,
          daysUntilDue: Math.ceil((new Date(reminder.nextDue!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
          compliance: reminder.compliance
        }))

      // Transformation des données de rappels en retard
      const overdueDetails = (overdueReminderDetails as any[])
        .filter(reminder => reminder.nextDue !== null)
        .map(reminder => ({
          id: reminder.id,
          task: reminder.task,
          vehicleName: reminder.vehicle?.name,
          vehicleMake: reminder.vehicle?.make,
          vehicleModel: reminder.vehicle?.model,
          nextDue: reminder.nextDue,
          daysOverdue: Math.ceil((new Date().getTime() - new Date(reminder.nextDue!).getTime()) / (1000 * 60 * 60 * 24)),
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