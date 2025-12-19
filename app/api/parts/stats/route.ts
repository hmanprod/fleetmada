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
      console.log('[Parts Stats API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Parts Stats API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Parts Stats API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// GET /api/parts/stats - Statistiques générales des pièces
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('Stats - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const authParts = authHeader.split(' ')
    if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
      logAction('Stats - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = authParts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('Stats - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    logAction('Stats', userId, {})

    try {
      // Récupérer toutes les pièces
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
            }
          }
        }
      })

      // Calculer les statistiques de base
      const totalParts = parts.length
      const totalStockValue = parts.reduce((sum, part) => sum + ((part.cost || 0) * part.quantity), 0)
      const totalQuantity = parts.reduce((sum, part) => sum + part.quantity, 0)
      
      // Statistiques par niveau de stock
      const stockStats = {
        outOfStock: parts.filter(p => p.quantity === 0).length,
        lowStock: parts.filter(p => p.quantity > 0 && p.quantity <= p.minimumStock).length,
        adequateStock: parts.filter(p => p.quantity > p.minimumStock).length,
        overStocked: parts.filter(p => p.quantity > p.minimumStock * 3).length
      }

      // Statistiques par catégorie
      const categoryStats = parts.reduce((acc, part) => {
        const category = part.category || 'Non classé'
        if (!acc[category]) {
          acc[category] = {
            count: 0,
            totalValue: 0,
            totalQuantity: 0,
            lowStockCount: 0
          }
        }
        acc[category].count++
        acc[category].totalValue += (part.cost || 0) * part.quantity
        acc[category].totalQuantity += part.quantity
        if (part.quantity <= part.minimumStock) {
          acc[category].lowStockCount++
        }
        return acc
      }, {} as Record<string, any>)

      // Top 10 des pièces les plus utilisées (par nombre d'interventions)
      const usageStats = parts.map(part => {
        const usageCount = part.serviceEntries.length
        const totalUsedQuantity = part.serviceEntries.reduce((sum, sep) => sum + sep.quantity, 0)
        const totalUsedValue = part.serviceEntries.reduce((sum, sep) => sum + sep.totalCost, 0)
        
        return {
          partId: part.id,
          partNumber: part.number,
          description: part.description,
          category: part.category,
          usageCount,
          totalUsedQuantity,
          totalUsedValue,
          currentStock: part.quantity,
          costPerUnit: part.cost || 0
        }
      }).sort((a, b) => b.usageCount - a.usageCount).slice(0, 10)

      // Top 10 des pièces les plus chères en stock
      const highValueParts = parts
        .map(part => ({
          partId: part.id,
          partNumber: part.number,
          description: part.description,
          category: part.category,
          stockValue: (part.cost || 0) * part.quantity,
          quantity: part.quantity,
          costPerUnit: part.cost || 0
        }))
        .filter(part => part.stockValue > 0)
        .sort((a, b) => b.stockValue - a.stockValue)
        .slice(0, 10)

      // Statistiques temporelles (consommation sur les 6 derniers mois)
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

      const monthlyUsage = parts.flatMap(part => 
        part.serviceEntries
          .filter(sep => new Date(sep.serviceEntry.date) >= sixMonthsAgo)
          .map(sep => ({
            ...sep,
            month: new Date(sep.serviceEntry.date).toISOString().slice(0, 7) // YYYY-MM
          }))
      ).reduce((acc, movement) => {
        const month = movement.month
        if (!acc[month]) {
          acc[month] = { parts: 0, value: 0 }
        }
        acc[month].parts += movement.quantity
        acc[month].value += movement.totalCost
        return acc
      }, {} as Record<string, any>)

      // Alertes critiques
      const alerts = {
        critical: parts.filter(p => p.quantity === 0).length,
        lowStock: parts.filter(p => p.quantity > 0 && p.quantity <= p.minimumStock).length,
        highValue: parts.filter(p => (p.cost || 0) * p.quantity > 100000).length // > 100k en valeur
      }

      // Calculer les ratios et indicateurs
      const ratios = {
        stockTurnover: totalQuantity > 0 ? (usageStats.reduce((sum, p) => sum + p.totalUsedQuantity, 0) / totalQuantity) : 0,
        averageCostPerUnit: totalQuantity > 0 ? (totalStockValue / totalQuantity) : 0,
        lowStockPercentage: totalParts > 0 ? ((stockStats.lowStock + stockStats.outOfStock) / totalParts) * 100 : 0
      }

      logAction('Stats - Success', userId, {
        totalParts,
        totalStockValue,
        stockStats,
        categoryCount: Object.keys(categoryStats).length
      })

      return NextResponse.json({
        success: true,
        data: {
          overview: {
            totalParts,
            totalStockValue,
            totalQuantity,
            ...stockStats,
            ...alerts,
            ...ratios
          },
          categories: categoryStats,
          topUsedParts: usageStats,
          highValueParts,
          monthlyUsage,
          trends: {
            last6Months: Object.entries(monthlyUsage).map(([month, data]) => ({
              month,
              ...data
            }))
          },
          insights: {
            totalParts,
            criticalAlerts: alerts.critical,
            lowStockItems: alerts.lowStock,
            recommendations: [
              ...(alerts.critical > 0 ? [`${alerts.critical} pièces en rupture de stock - Action urgente requise`] : []),
              ...(alerts.lowStock > 0 ? [`${alerts.lowStock} pièces en stock faible - Planifier réapprovisionnement`] : []),
              ...(ratios.lowStockPercentage > 30 ? [`${ratios.lowStockPercentage.toFixed(1)}% des pièces en stock faible`] : [])
            ]
          }
        }
      })

    } catch (dbError) {
      logAction('Stats - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors du calcul des statistiques' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('Stats - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}