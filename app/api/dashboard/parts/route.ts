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
      console.log('[Dashboard Parts API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Dashboard Parts API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Dashboard Parts API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// GET /api/dashboard/parts - Métriques dashboard pour les pièces
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('Dashboard Parts - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const authParts = authHeader.split(' ')
    if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
      logAction('Dashboard Parts - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = authParts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('Dashboard Parts - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    logAction('Dashboard Parts', userId, {})

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
                  totalCost: true,
                  vehicle: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      // === MÉTRIQUES PRINCIPALES ===
      const totalParts = parts.length
      const totalStockValue = parts.reduce((sum, part) => sum + ((part.cost || 0) * part.quantity), 0)
      const totalQuantity = parts.reduce((sum, part) => sum + part.quantity, 0)

      // === STATUT DU STOCK ===
      const stockStatus = {
        inStock: parts.filter(p => p.quantity > p.minimumStock).length,
        lowStock: parts.filter(p => p.quantity > 0 && p.quantity <= p.minimumStock).length,
        outOfStock: parts.filter(p => p.quantity === 0).length
      }

      const stockHealth = totalParts > 0 ? 
        ((stockStatus.inStock / totalParts) * 100).toFixed(1) : '0'

      // === VALEUR TOTALE PAR CATÉGORIE ===
      const categoryValues = parts.reduce((acc, part) => {
        const category = part.category || 'Non classé'
        const value = (part.cost || 0) * part.quantity
        if (!acc[category]) {
          acc[category] = 0
        }
        acc[category] += value
        return acc
      }, {} as Record<string, number>)

      const topCategories = Object.entries(categoryValues)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)

      // === UTILISATION RÉCENTE (30 DERNIERS JOURS) ===
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const recentUsage = parts.map(part => {
        const recentEntries = part.serviceEntries.filter(sep => 
          new Date(sep.serviceEntry.date) >= thirtyDaysAgo
        )
        const totalUsed = recentEntries.reduce((sum, sep) => sum + sep.quantity, 0)
        const totalCost = recentEntries.reduce((sum, sep) => sum + sep.totalCost, 0)
        
        return {
          partId: part.id,
          partNumber: part.number,
          description: part.description,
          usedQuantity: totalUsed,
          usedValue: totalCost,
          currentStock: part.quantity
        }
      }).filter(part => part.usedQuantity > 0)
        .sort((a, b) => b.usedQuantity - a.usedQuantity)
        .slice(0, 10)

      // === PIÈCES EN ALERTE (STOCK FAIBLE) ===
      const criticalParts = parts
        .filter(part => part.quantity === 0 || part.quantity <= part.minimumStock)
        .map(part => ({
          partId: part.id,
          partNumber: part.number,
          description: part.description,
          category: part.category,
          currentStock: part.quantity,
          minimumStock: part.minimumStock,
          urgency: part.quantity === 0 ? 'critical' : 'warning',
          reorderQuantity: Math.max(part.minimumStock * 2 - part.quantity, 1),
          estimatedCost: (part.cost || 0) * Math.max(part.minimumStock * 2 - part.quantity, 1)
        }))
        .sort((a, b) => {
          if (a.urgency === 'critical' && b.urgency === 'warning') return -1
          if (a.urgency === 'warning' && b.urgency === 'critical') return 1
          return a.currentStock - b.currentStock
        })
        .slice(0, 10)

      // === TENDANCES MENSUELLES (6 MOIS) ===
      const monthlyTrends: Array<{month: string, monthName: string, usage: number, value: number}> = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthKey = date.toISOString().slice(0, 7) // YYYY-MM
        
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        
        const monthUsage = parts.reduce((sum, part) => {
          const monthEntries = part.serviceEntries.filter(sep => {
            const entryDate = new Date(sep.serviceEntry.date)
            return entryDate >= monthStart && entryDate <= monthEnd
          })
          return sum + monthEntries.reduce((s, sep) => s + sep.quantity, 0)
        }, 0)
        
        const monthValue = parts.reduce((sum, part) => {
          const monthEntries = part.serviceEntries.filter(sep => {
            const entryDate = new Date(sep.serviceEntry.date)
            return entryDate >= monthStart && entryDate <= monthEnd
          })
          return sum + monthEntries.reduce((s, sep) => s + sep.totalCost, 0)
        }, 0)

        monthlyTrends.push({
          month: monthKey,
          monthName: new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(date),
          usage: monthUsage,
          value: monthValue
        })
      }

      // === ALERTES ET RECOMMANDATIONS ===
      const alerts: Array<{type: string, title: string, message: string, count: number, action: string}> = []
      
      if (stockStatus.outOfStock > 0) {
        alerts.push({
          type: 'critical',
          title: 'Ruptures de stock',
          message: `${stockStatus.outOfStock} pièce(s) en rupture de stock`,
          count: stockStatus.outOfStock,
          action: 'Réapprovisionnement urgent'
        })
      }
      
      if (stockStatus.lowStock > 0) {
        alerts.push({
          type: 'warning',
          title: 'Stock faible',
          message: `${stockStatus.lowStock} pièce(s) en stock faible`,
          count: stockStatus.lowStock,
          action: 'Planifier réapprovisionnement'
        })
      }

      const highValueParts = parts.filter(p => (p.cost || 0) * p.quantity > 50000)
      if (highValueParts.length > 0) {
        alerts.push({
          type: 'info',
          title: 'Valeur élevée',
          message: `${highValueParts.length} pièce(s) de haute valeur en stock`,
          count: highValueParts.length,
          action: 'Révision des niveaux de stock'
        })
      }

      // === MÉTRIQUES DE PERFORMANCE ===
      const averageStockTurnover = parts.length > 0 ? 
        parts.reduce((sum, part) => {
          const turnover = part.quantity > 0 ? part.serviceEntries.length / part.quantity : 0
          return sum + turnover
        }, 0) / parts.length : 0

      const partsWithUsage = parts.filter(p => p.serviceEntries.length > 0).length
      const utilizationRate = totalParts > 0 ? (partsWithUsage / totalParts * 100).toFixed(1) : '0'

      // === DONNÉES POUR GRAPHIQUES ===
      const chartData = {
        stockStatus: [
          { name: 'Stock suffisant', value: stockStatus.inStock, color: '#22c55e' },
          { name: 'Stock faible', value: stockStatus.lowStock, color: '#f59e0b' },
          { name: 'Rupture', value: stockStatus.outOfStock, color: '#ef4444' }
        ],
        categoryValues: topCategories.map(cat => ({
          name: cat.name,
          value: cat.value
        })),
        monthlyTrends: monthlyTrends.map(trend => ({
          month: trend.monthName,
          usage: trend.usage,
          value: trend.value
        }))
      }

      logAction('Dashboard Parts - Success', userId, {
        totalParts,
        totalStockValue,
        stockHealth,
        outOfStock: stockStatus.outOfStock,
        lowStock: stockStatus.lowStock,
        alerts: alerts.length
      })

      return NextResponse.json({
        success: true,
        data: {
          overview: {
            totalParts,
            totalStockValue,
            totalQuantity,
            stockHealth: parseFloat(stockHealth as string),
            averageStockTurnover: parseFloat(averageStockTurnover.toFixed(2)),
            utilizationRate: parseFloat(utilizationRate as string)
          },
          stockStatus,
          criticalParts,
          recentUsage,
          topCategories,
          monthlyTrends,
          alerts,
          chartData,
          lastUpdated: new Date().toISOString()
        }
      })

    } catch (dbError) {
      logAction('Dashboard Parts - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des métriques dashboard' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('Dashboard Parts - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}