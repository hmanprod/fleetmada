import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateToken, getBaseFilter } from '@/lib/api-utils'

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Dashboard Issues API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// GET /api/dashboard/issues - Métriques et statistiques des issues pour le dashboard
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

    logAction('GET Dashboard Issues', userId, {})

    try {
      // Date de début du mois actuel
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      // Date d'il y a 7 jours pour les problèmes récents
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)

      // Base filter: by company if available, otherwise by user
      const baseFilter = getBaseFilter(tokenPayload, 'user')

      // Role-specific filters
      const isTech = role === 'TECHNICIAN'
      const isDriver = role === 'DRIVER'

      const issueFilter: any = isTech ? { assignedTo: { has: userId } } :
        isDriver ? { vehicle: { assignments: { some: { contact: { email }, status: 'ACTIVE' } } } } :
          baseFilter

      // Récupération des métriques principales
      const [
        totalIssues,
        openIssues,
        inProgressIssues,
        resolvedIssues,
        closedIssues,
        criticalIssues,
        issuesThisMonth
      ] = await Promise.all([
        // Total des problèmes
        prisma.issue.count({
          where: issueFilter
        }),

        // Problèmes ouverts
        prisma.issue.count({
          where: {
            ...issueFilter,
            status: 'OPEN'
          }
        }),

        // Problèmes en cours
        prisma.issue.count({
          where: {
            ...issueFilter,
            status: 'IN_PROGRESS'
          }
        }),

        // Problèmes résolus
        prisma.issue.count({
          where: {
            ...issueFilter,
            status: 'RESOLVED'
          }
        }),

        // Problèmes fermés
        prisma.issue.count({
          where: {
            ...issueFilter,
            status: 'CLOSED'
          }
        }),

        // Problèmes critiques
        prisma.issue.count({
          where: {
            ...issueFilter,
            priority: 'CRITICAL',
            status: { in: ['OPEN', 'IN_PROGRESS'] }
          }
        }),

        // Problèmes ce mois
        prisma.issue.count({
          where: {
            ...issueFilter,
            createdAt: { gte: startOfMonth }
          }
        })
      ])

      // Récupération des problèmes récents et critiques
      const [recentIssues, criticalIssuesList] = await Promise.all([
        // Problèmes récents (7 derniers jours)
        prisma.issue.findMany({
          where: {
            ...issueFilter,
            createdAt: { gte: weekAgo }
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            vehicle: {
              select: {
                name: true,
                make: true,
                model: true
              }
            }
          }
        }),

        // Problèmes critiques avec détails
        prisma.issue.findMany({
          where: {
            ...issueFilter,
            priority: 'CRITICAL',
            status: { in: ['OPEN', 'IN_PROGRESS'] }
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            vehicle: {
              select: {
                name: true,
                make: true,
                model: true
              }
            }
          }
        })
      ])

      // Calculer le temps moyen de résolution en heures
      const resolvedIssuesForTime = await prisma.issue.findMany({
        where: {
          ...issueFilter,
          status: { in: ['RESOLVED', 'CLOSED'] }
        },
        select: {
          createdAt: true,
          updatedAt: true
        },
        take: 100 // Limiter pour les performances
      })

      let avgResolutionTime = 0
      if (resolvedIssuesForTime.length > 0) {
        const totalHours = resolvedIssuesForTime.reduce((sum, issue) => {
          const created = new Date(issue.createdAt)
          const updated = new Date(issue.updatedAt)
          const hours = (updated.getTime() - created.getTime()) / (1000 * 60 * 60)
          return sum + hours
        }, 0)
        avgResolutionTime = Math.round(totalHours / resolvedIssuesForTime.length)
      }

      // Calcul du taux de conformité (résolution dans les délais)
      const issuesWithSLA = await prisma.issue.count({
        where: {
          ...issueFilter,
          status: { in: ['RESOLVED', 'CLOSED'] }
        }
      })

      const complianceRate = issuesWithSLA > 0 ? Math.round((resolvedIssues / issuesWithSLA) * 100) : 100

      const summary = {
        totalIssues,
        openIssues,
        inProgressIssues,
        resolvedIssues,
        closedIssues,
        criticalIssues,
        averageResolutionTime: avgResolutionTime,
        complianceRate,
        issuesThisMonth
      }

      const statusData = {
        healthy: criticalIssues === 0 && complianceRate >= 80,
        warning: criticalIssues > 0 || complianceRate < 80,
        critical: criticalIssues > 5
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            summary,
            recentIssues,
            criticalIssues: criticalIssuesList,
            status: statusData
          }
        },
        { status: 200 }
      )

    } catch (dbError) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des métriques des problèmes' },
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
  return NextResponse.json({ success: false, error: 'Méthode non autorisée' }, { status: 405 })
}
export async function PUT() {
  return NextResponse.json({ success: false, error: 'Méthode non autorisée' }, { status: 405 })
}
export async function DELETE() {
  return NextResponse.json({ success: false, error: 'Méthode non autorisée' }, { status: 405 })
}