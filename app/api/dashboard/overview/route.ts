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
  console.log(`[Dashboard Overview API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Dashboard Overview API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Dashboard Overview API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// GET /api/dashboard/overview - Vue d'ensemble générale (véhicules, statuts, totaux)
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Overview - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Overview - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Overview - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('GET Overview - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    logAction('GET Overview', userId, { userId })

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
          where: { userId }
        }),
        
        // Véhicules par statut
        prisma.vehicle.groupBy({
          by: ['status'],
          where: { userId },
          _count: { id: true }
        }),
        
        // Total des problèmes
        prisma.issue.count({
          where: { userId }
        }),
        
        // Problèmes ouverts
        prisma.issue.count({
          where: { 
            userId,
            status: { in: ['OPEN', 'IN_PROGRESS'] }
          }
        }),
        
        // Total des entrées de service
        prisma.serviceEntry.count({
          where: { userId }
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
        
        // Total des inspections
        prisma.inspection.count({
          where: { userId }
        }),
        
        // Inspections par statut
        prisma.inspection.groupBy({
          by: ['status'],
          where: { userId },
          _count: { id: true }
        }),
        
        // Inspections par conformité
        prisma.inspection.groupBy({
          by: ['complianceStatus'],
          where: { userId },
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

      logAction('GET Overview - Success', userId, { 
        userId, 
        totalVehicles,
        openIssues,
        totalInspections,
        utilizationRate 
      })

      return NextResponse.json(
        {
          success: true,
          data: overview
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('GET Overview - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des données' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Overview - Server error', userId, {
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