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
      console.log('[Dashboard Parts Alerts API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Dashboard Parts Alerts API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Dashboard Parts Alerts API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// GET /api/dashboard/parts/alerts - Alertes stock faible temps réel
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('Alerts - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const authParts = authHeader.split(' ')
    if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
      logAction('Alerts - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = authParts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('Alerts - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    // Extraction des paramètres de requête
    const { searchParams } = new URL(request.url)
    const severity = searchParams.get('severity') // 'critical', 'warning', 'all'
    const category = searchParams.get('category')
    const includeRecommendations = searchParams.get('includeRecommendations') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')

    logAction('Alerts', userId, {
      severity,
      category,
      includeRecommendations,
      limit
    })

    try {
      // Récupérer toutes les pièces avec leurs relations
      const parts = await prisma.part.findMany({
        include: {
          serviceEntries: {
            include: {
              serviceEntry: {
                select: {
                  id: true,
                  date: true,
                  totalCost: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 5 // Dernières utilisations pour contexte
          }
        }
      })

      // Générer les alertes
      const alerts: Array<{
        id: string
        type: 'critical' | 'warning' | 'info'
        severity: string
        title: string
        message: string
        partId: string
        partNumber: string
        description: string
        category: string
        currentStock: number
        minimumStock: number
        priority: number
        recommendations: {
          action: string
          quantity: number
          estimatedCost: number
          urgency: string
          reasoning: string
        }
        context: {
          lastUsage?: string
          usageCount: number
          stockValue: number
        }
        createdAt: string
      }> = []

      parts.forEach(part => {
        const usageCount = part.serviceEntries.length
        const lastUsage = part.serviceEntries.length > 0 ? 
          part.serviceEntries[0].serviceEntry.date : null
        const stockValue = (part.cost || 0) * part.quantity

        // === ALERTE CRITIQUE: RUPTURE DE STOCK ===
        if (part.quantity === 0) {
          const priority = 100 + usageCount // Priorité basée sur l'utilisation
          
          alerts.push({
            id: `alert-critical-${part.id}`,
            type: 'critical',
            severity: 'critical',
            title: 'Rupture de stock',
            message: `La pièce ${part.number} est en rupture de stock`,
            partId: part.id,
            partNumber: part.number,
            description: part.description,
            category: part.category || 'Non classé',
            currentStock: 0,
            minimumStock: part.minimumStock,
            priority,
            recommendations: {
              action: 'Réapprovisionnement urgent',
              quantity: Math.max(part.minimumStock * 3, 10),
              estimatedCost: (part.cost || 0) * Math.max(part.minimumStock * 3, 10),
              urgency: 'CRITICAL',
              reasoning: usageCount > 0 ? 
                `Pièce utilisée ${usageCount} fois - réapprovisionnement immédiat nécessaire` :
                'Pièce critique - stock empty'
            },
            context: {
              lastUsage: lastUsage ? lastUsage.toISOString() : undefined,
              usageCount,
              stockValue
            },
            createdAt: new Date().toISOString()
          })
        }
        
        // === ALERTE ATTENTION: STOCK FAIBLE ===
        else if (part.quantity <= part.minimumStock && part.quantity > 0) {
          const stockRatio = part.quantity / part.minimumStock
          const basePriority = 50 + (usageCount * 2)
          const priority = stockRatio < 0.25 ? basePriority + 30 : 
                          stockRatio < 0.5 ? basePriority + 20 : 
                          basePriority + 10
          
          alerts.push({
            id: `alert-warning-${part.id}`,
            type: 'warning',
            severity: 'warning',
            title: 'Stock faible',
            message: `La pièce ${part.number} a un stock faible (${part.quantity}/${part.minimumStock})`,
            partId: part.id,
            partNumber: part.number,
            description: part.description,
            category: part.category || 'Non classé',
            currentStock: part.quantity,
            minimumStock: part.minimumStock,
            priority,
            recommendations: {
              action: 'Planifier réapprovisionnement',
              quantity: Math.max(part.minimumStock * 2 - part.quantity, 5),
              estimatedCost: (part.cost || 0) * Math.max(part.minimumStock * 2 - part.quantity, 5),
              urgency: priority > 80 ? 'HIGH' : 'MEDIUM',
              reasoning: `Stock à ${(stockRatio * 100).toFixed(0)}% du minimum`
            },
            context: {
              lastUsage: lastUsage ? lastUsage.toISOString() : undefined,
              usageCount,
              stockValue
            },
            createdAt: new Date().toISOString()
          })
        }

        // === ALERTE INFO: PIÈCE DE HAUTE VALEUR INACTIVE ===
        else if (stockValue > 100000 && usageCount === 0) {
          alerts.push({
            id: `alert-info-${part.id}`,
            type: 'info',
            severity: 'info',
            title: 'Valeur élevée non utilisée',
            message: `Pièce de haute valeur (${stockValue.toLocaleString('fr-FR')} Ar) non utilisée`,
            partId: part.id,
            partNumber: part.number,
            description: part.description,
            category: part.category || 'Non classé',
            currentStock: part.quantity,
            minimumStock: part.minimumStock,
            priority: 20,
            recommendations: {
              action: 'Révision des niveaux de stock',
              quantity: Math.max(Math.floor(part.quantity * 0.5), 1),
              estimatedCost: (part.cost || 0) * Math.max(Math.floor(part.quantity * 0.5), 1),
              urgency: 'LOW',
              reasoning: 'Révision recommandée pour optimiser le capital immobilisé'
            },
            context: {
              usageCount,
              stockValue
            },
            createdAt: new Date().toISOString()
          })
        }
      })

      // Filtrer selon les critères
      let filteredAlerts = alerts
      
      if (severity && severity !== 'all') {
        filteredAlerts = alerts.filter(alert => alert.severity === severity)
      }
      
      if (category) {
        filteredAlerts = filteredAlerts.filter(alert => 
          alert.category.toLowerCase().includes(category.toLowerCase())
        )
      }

      // Trier par priorité (plus haute en premier)
      filteredAlerts.sort((a, b) => b.priority - a.priority)

      // Limiter les résultats
      const limitedAlerts = filteredAlerts.slice(0, limit)

      // Calculer les statistiques des alertes
      const alertStats = {
        total: filteredAlerts.length,
        critical: filteredAlerts.filter(a => a.type === 'critical').length,
        warning: filteredAlerts.filter(a => a.type === 'warning').length,
        info: filteredAlerts.filter(a => a.type === 'info').length,
        totalEstimatedCost: filteredAlerts.reduce((sum, alert) => 
          sum + alert.recommendations.estimatedCost, 0
        ),
        categoriesAffected: [...new Set(filteredAlerts.map(a => a.category))].length
      }

      // Grouper par catégorie
      const alertsByCategory = filteredAlerts.reduce((acc, alert) => {
        const category = alert.category
        if (!acc[category]) {
          acc[category] = { critical: 0, warning: 0, info: 0, total: 0 }
        }
        acc[category][alert.type as keyof typeof acc[typeof category]]++
        acc[category].total++
        return acc
      }, {} as Record<string, any>)

      // Recommandations globales si demandées
      let globalRecommendations: Array<{
        category: string
        priority: 'HIGH' | 'MEDIUM' | 'LOW'
        action: string
        description: string
        impact: string
      }> = []

      if (includeRecommendations) {
        if (alertStats.critical > 5) {
          globalRecommendations.push({
            category: 'Réapprovisionnement',
            priority: 'HIGH',
            action: 'Commande groupée urgente',
            description: `${alertStats.critical} pièces en rupture nécessitent un réapprovisionnement immédiat`,
            impact: 'Éviter l\'arrêt des services'
          })
        }
        
        if (alertStats.warning > 10) {
          globalRecommendations.push({
            category: 'Planification',
            priority: 'MEDIUM',
            action: 'Planification réapprovisionnement',
            description: `${alertStats.warning} pièces en stock faible à planifier`,
            impact: 'Maintenir la continuité du service'
          })
        }

        if (alertStats.categoriesAffected > 5) {
          globalRecommendations.push({
            category: 'Optimisation',
            priority: 'LOW',
            action: 'Révision des niveaux minimum',
            description: 'Plusieurs catégories affectées - réviser les seuils',
            impact: 'Améliorer l\'efficacité du stock'
          })
        }
      }

      logAction('Alerts - Success', userId, {
        totalAlerts: alertStats.total,
        critical: alertStats.critical,
        warning: alertStats.warning,
        categories: alertStats.categoriesAffected
      })

      return NextResponse.json({
        success: true,
        data: {
          alerts: limitedAlerts,
          statistics: alertStats,
          alertsByCategory,
          globalRecommendations,
          filters: {
            severity: severity || 'all',
            category: category || null,
            limit
          },
          lastUpdated: new Date().toISOString()
        }
      })

    } catch (dbError) {
      logAction('Alerts - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des alertes' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('Alerts - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}