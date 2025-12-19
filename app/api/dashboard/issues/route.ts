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
  console.log(`[Dashboard Issues API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Dashboard Issues API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Dashboard Issues API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// GET /api/dashboard/issues - Métriques et statistiques des issues pour le dashboard
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Dashboard Issues - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Dashboard Issues - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Dashboard Issues - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('GET Dashboard Issues - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    logAction('GET Dashboard Issues', userId, {})

    try {
      // Date de début du mois actuel
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      // Date d'il y a 7 jours pour les problèmes récents
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)

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
          where: { userId }
        }),

        // Problèmes ouverts
        prisma.issue.count({
          where: { 
            userId,
            status: 'OPEN'
          }
        }),

        // Problèmes en cours
        prisma.issue.count({
          where: { 
            userId,
            status: 'IN_PROGRESS'
          }
        }),

        // Problèmes résolus
        prisma.issue.count({
          where: { 
            userId,
            status: 'RESOLVED'
          }
        }),

        // Problèmes fermés
        prisma.issue.count({
          where: { 
            userId,
            status: 'CLOSED'
          }
        }),

        // Problèmes critiques
        prisma.issue.count({
          where: { 
            userId,
            priority: 'CRITICAL',
            status: { in: ['OPEN', 'IN_PROGRESS'] }
          }
        }),

        // Problèmes ce mois
        prisma.issue.count({
          where: { 
            userId,
            createdAt: { gte: startOfMonth }
          }
        })
      ])

      // Récupération des problèmes récents et critiques
      const [recentIssues, criticalIssuesList] = await Promise.all([
        // Problèmes récents (7 derniers jours)
        prisma.issue.findMany({
          where: { 
            userId,
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
            userId,
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
          userId,
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
          userId,
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

      logAction('GET Dashboard Issues - Success', userId, { 
        totalIssues,
        criticalIssues,
        complianceRate,
        avgResolutionTime
      })

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
      logAction('GET Dashboard Issues - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des métriques des problèmes' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Dashboard Issues - Server error', userId, {
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
    { success: false, error: 'Méthode POST non supportée. Utilisez GET' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Méthode PUT non supportée. Utilisez GET' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Méthode DELETE non supportée. Utilisez GET' },
    { status: 405 }
  )
}