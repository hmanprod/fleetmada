import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateToken, getBaseFilter } from '@/lib/api-utils'

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Dashboard Overview API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// GET /api/dashboard/overview - Vue d'ensemble générale (véhicules, statuts, totaux)
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

    // Base filters: by company if available, otherwise by user
    const userFilter = getBaseFilter(tokenPayload)
    const vehicleFilter = getBaseFilter(tokenPayload, 'user')

    // Role-specific behavior
    const isTech = role === 'TECHNICIAN'
    const isDriver = role === 'DRIVER'

    // Advanced filters for metrics
    const issueFilter: any = isTech ? { assignedTo: { has: userId } } :
      isDriver ? { vehicle: { assignments: { some: { contact: { email }, status: 'ACTIVE' } } } } :
        userFilter

    const serviceFilter: any = isTech ? { assignedToContactId: userId } : userFilter
    const inspectionFilter: any = isDriver ? { userId } : userFilter

    logAction('GET Overview', userId, { role })

    // Récupération des métriques d'ensemble
    try {
      const [
        totalVehicles,
        vehiclesByStatus,
        totalIssues,
        openIssues,
        totalServiceEntries,
        upcomingReminders,
        overdueReminders,
        totalInspections,
        inspectionsByStatus,
        inspectionsByCompliance
      ] = await Promise.all([
        // Total des véhicules
        prisma.vehicle.count({
          where: vehicleFilter as any
        }),

        // Véhicules par statut
        prisma.vehicle.groupBy({
          by: ['status'],
          where: vehicleFilter as any,
          _count: { id: true }
        }),

        // Total des problèmes
        prisma.issue.count({
          where: issueFilter
        }),

        // Problèmes ouverts
        prisma.issue.count({
          where: {
            ...issueFilter,
            status: { in: ['OPEN', 'IN_PROGRESS'] }
          }
        }),

        // Total des entrées de service
        prisma.serviceEntry.count({
          where: serviceFilter
        }),

        // Rappels à venir (7 prochains jours)
        prisma.serviceReminder.count({
          where: {
            vehicle: vehicleFilter as any,
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
            vehicle: vehicleFilter as any,
            status: 'ACTIVE',
            nextDue: {
              lt: new Date()
            }
          }
        }),

        // Total des inspections
        prisma.inspection.count({
          where: inspectionFilter
        }),

        // Inspections par statut
        prisma.inspection.groupBy({
          by: ['status'],
          where: inspectionFilter,
          _count: { id: true }
        }),

        // Inspections par conformité
        prisma.inspection.groupBy({
          by: ['complianceStatus'],
          where: inspectionFilter,
          _count: { id: true }
        })
      ])

      // Transformation des données de statut des véhicules
      const statusBreakdown = vehiclesByStatus.reduce((acc, item) => {
        acc[item.status.toLowerCase()] = item._count.id
        return acc
      }, {} as Record<string, number>)

      // Transformation des données de statut des inspections
      const inspectionsStatusBreakdown = inspectionsByStatus.reduce((acc, item) => {
        acc[item.status.toLowerCase()] = item._count.id
        return acc
      }, {} as Record<string, number>)

      // Transformation des données de conformité des inspections
      const inspectionsComplianceBreakdown = inspectionsByCompliance.reduce((acc, item) => {
        acc[item.complianceStatus.toLowerCase().replace('_', '-')] = item._count.id
        return acc
      }, {} as Record<string, number>)

      // Calculs supplémentaires
      const utilizationRate = totalVehicles > 0 ?
        Math.round(((totalVehicles - (statusBreakdown.inactive || 0)) / totalVehicles) * 100) : 0

      const overview = {
        totalVehicles,
        statusBreakdown: {
          active: statusBreakdown.active || 0,
          inactive: statusBreakdown.inactive || 0,
          maintenance: statusBreakdown.maintenance || 0,
          disposed: statusBreakdown.disposed || 0
        },
        issues: {
          total: totalIssues,
          open: openIssues,
          closed: totalIssues - openIssues
        },
        inspections: {
          total: totalInspections,
          statusBreakdown: {
            draft: inspectionsStatusBreakdown.draft || 0,
            scheduled: inspectionsStatusBreakdown.scheduled || 0,
            inProgress: inspectionsStatusBreakdown['in-progress'] || 0,
            completed: inspectionsStatusBreakdown.completed || 0,
            cancelled: inspectionsStatusBreakdown.cancelled || 0
          },
          complianceBreakdown: {
            compliant: inspectionsComplianceBreakdown.compliant || 0,
            'non-compliant': inspectionsComplianceBreakdown['non-compliant'] || 0,
            'pending-review': inspectionsComplianceBreakdown['pending-review'] || 0
          }
        },
        maintenance: {
          totalServiceEntries,
          upcomingReminders,
          overdueReminders
        },
        utilizationRate,
        lastUpdated: new Date().toISOString()
      }

      return NextResponse.json(
        {
          success: true,
          data: overview
        },
        { status: 200 }
      )

    } catch (dbError) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des données' },
        { status: 500 }
      )
    }

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// Gestion des autres méthodes
export async function POST() {
  return NextResponse.json({ error: 'Méthode non autorisée' }, { status: 405 })
}
export async function PUT() {
  return NextResponse.json({ error: 'Méthode non autorisée' }, { status: 405 })
}
export async function DELETE() {
  return NextResponse.json({ error: 'Méthode non autorisée' }, { status: 405 })
}