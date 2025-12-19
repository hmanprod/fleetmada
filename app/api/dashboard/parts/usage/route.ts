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
      console.log('[Dashboard Parts Usage API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Dashboard Parts Usage API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Dashboard Parts Usage API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// GET /api/dashboard/parts/usage - Utilisation récente des pièces
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('Usage - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const authParts = authHeader.split(' ')
    if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
      logAction('Usage - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = authParts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('Usage - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    // Extraction des paramètres de requête
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30days' // '7days', '30days', '90days'
    const category = searchParams.get('category')
    const sortBy = searchParams.get('sortBy') || 'recent'
    const limit = parseInt(searchParams.get('limit') || '15')

    // Calculer la période
    const now = new Date()
    let startDate: Date
    switch (period) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    logAction('Usage', userId, {
      period,
      category,
      sortBy,
      limit,
      startDate: startDate.toISOString()
    })

    try {
      // Récupérer les pièces avec leurs utilisations récentes
      const parts = await prisma.part.findMany({
        include: {
          serviceEntries: {
            include: {
              serviceEntry: {
                select: {
                  id: true,
                  date: true,
                  totalCost: true,
                  vendor: true,
                  vehicle: {
                    select: {
                      id: true,
                      name: true,
                      vin: true
                    }
                  }
                }
              }
            },
            where: {
              serviceEntry: {
                date: {
                  gte: startDate
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      })

      // Filtrer par catégorie si spécifiée
      let filteredParts = parts
      if (category) {
        filteredParts = parts.filter(part => 
          part.category?.toLowerCase().includes(category.toLowerCase())
        )
      }

      // Transformer les données pour l'affichage
      const recentUsage = filteredParts.map(part => {
        const recentEntries = part.serviceEntries
        const totalUsed = recentEntries.reduce((sum, sep) => sum + sep.quantity, 0)
        const totalCost = recentEntries.reduce((sum, sep) => sum + sep.totalCost, 0)
        const usageCount = recentEntries.length
        
        // Calculer la valeur restante en stock
        const stockValue = (part.cost || 0) * part.quantity
        const remainingStock = part.quantity
        const stockStatus = remainingStock === 0 ? 'OUT_OF_STOCK' : 
                           remainingStock <= part.minimumStock ? 'LOW_STOCK' : 'ADEQUATE'

        // Formatter les utilisations récentes
        const recentActivity = recentEntries.slice(0, 3).map(sep => ({
          date: sep.serviceEntry.date,
          quantity: sep.quantity,
          cost: sep.totalCost,
          vehicle: sep.serviceEntry.vehicle?.name || 'Véhicule inconnu',
          vendor: sep.serviceEntry.vendor || 'Non spécifié'
        }))

        return {
          partId: part.id,
          partNumber: part.number,
          description: part.description,
          category: part.category,
          manufacturer: part.manufacturer,
          currentStock: remainingStock,
          minimumStock: part.minimumStock,
          costPerUnit: part.cost || 0,
          stockValue,
          stockStatus,
          usageCount,
          totalUsed,
          totalCost,
          averageUsage: usageCount > 0 ? totalUsed / usageCount : 0,
          usageTrend: usageCount > 0 ? 
            (totalUsed / Math.max(1, (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))) : 0,
          recentActivity,
          lastUsage: recentEntries.length > 0 ? recentEntries[0].serviceEntry.date : null,
          nextReorderDate: remainingStock <= part.minimumStock ? 
            new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() : null
        }
      }).filter(part => part.usageCount > 0) // Ne garder que les pièces utilisées

      // Trier selon les critères
      recentUsage.sort((a, b) => {
        if (sortBy === 'recent') {
          return new Date(b.lastUsage || 0).getTime() - new Date(a.lastUsage || 0).getTime()
        } else if (sortBy === 'usageCount') {
          return b.usageCount - a.usageCount
        } else if (sortBy === 'totalCost') {
          return b.totalCost - a.totalCost
        } else if (sortBy === 'totalUsed') {
          return b.totalUsed - a.totalUsed
        }
        return 0
      })

      // Limiter les résultats
      const limitedUsage = recentUsage.slice(0, limit)

      // Calculer les statistiques globales de la période
      const globalStats = {
        period,
        totalPartsUsed: recentUsage.length,
        totalQuantityUsed: recentUsage.reduce((sum, part) => sum + part.totalUsed, 0),
        totalCost: recentUsage.reduce((sum, part) => sum + part.totalCost, 0),
        averageUsagePerPart: recentUsage.length > 0 ? 
          recentUsage.reduce((sum, part) => sum + part.usageCount, 0) / recentUsage.length : 0,
        mostActivePart: recentUsage.length > 0 ? 
          recentUsage.reduce((prev, current) => 
            prev.usageCount > current.usageCount ? prev : current
          ) : null
      }

      // Répartition par catégorie
      const categoryUsage = recentUsage.reduce((acc, part) => {
        const category = part.category || 'Non classé'
        if (!acc[category]) {
          acc[category] = {
            category,
            partsCount: 0,
            totalUsed: 0,
            totalCost: 0,
            usageCount: 0
          }
        }
        acc[category].partsCount++
        acc[category].totalUsed += part.totalUsed
        acc[category].totalCost += part.totalCost
        acc[category].usageCount += part.usageCount
        return acc
      }, {} as Record<string, any>)

      // Tendances d'utilisation (comparaison avec période précédente)
      const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()))
      const previousPeriodParts = await prisma.part.findMany({
        include: {
          serviceEntries: {
            where: {
              serviceEntry: {
                date: {
                  gte: previousStartDate,
                  lt: startDate
                }
              }
            }
          }
        }
      })

      const previousUsage = previousPeriodParts.map(part => {
        const entries = part.serviceEntries
        return {
          partId: part.id,
          usageCount: entries.length,
          totalUsed: entries.reduce((sum, sep) => sum + sep.quantity, 0),
          totalCost: entries.reduce((sum, sep) => sum + sep.totalCost, 0)
        }
      })

      // Calculer les tendances
      const trends = recentUsage.map(current => {
        const previous = previousUsage.find(p => p.partId === current.partId)
        if (!previous) {
          return {
            partId: current.partId,
            partNumber: current.partNumber,
            change: 'NEW',
            usageChange: 0,
            costChange: 0
          }
        }
        
        const usageChange = previous.usageCount > 0 ? 
          ((current.usageCount - previous.usageCount) / previous.usageCount) * 100 : 0
        const costChange = previous.totalCost > 0 ? 
          ((current.totalCost - previous.totalCost) / previous.totalCost) * 100 : 0
        
        return {
          partId: current.partId,
          partNumber: current.partNumber,
          change: usageChange > 10 ? 'INCREASE' : usageChange < -10 ? 'DECREASE' : 'STABLE',
          usageChange: Math.round(usageChange),
          costChange: Math.round(costChange)
        }
      })

      // Alertes basées sur l'utilisation
      const alerts: Array<{type: string, title: string, message: string, count: number, parts: string[]}> = []
      
      const overusedParts = recentUsage.filter(part => 
        part.usageCount > 5 && part.currentStock <= part.minimumStock
      )
      if (overusedParts.length > 0) {
        alerts.push({
          type: 'warning',
          title: 'Surconsommation détectée',
          message: `${overusedParts.length} pièce(s) utilisées fréquemment avec stock faible`,
          count: overusedParts.length,
          parts: overusedParts.slice(0, 5).map(p => p.partNumber)
        })
      }

      const highCostUsage = recentUsage.filter(part => part.totalCost > 50000)
      if (highCostUsage.length > 0) {
        alerts.push({
          type: 'info',
          title: 'Coûts élevés',
          message: `${highCostUsage.length} pièce(s) avec coûts d'utilisation élevés`,
          count: highCostUsage.length,
          parts: highCostUsage.slice(0, 5).map(p => p.partNumber)
        })
      }

      // Préparer les données pour les graphiques
      const chartData = {
        categoryDistribution: Object.values(categoryUsage).map((cat: any) => ({
          name: cat.category,
          usage: cat.usageCount,
          cost: cat.totalCost
        })),
        usageTrends: trends.slice(0, 10).map(trend => ({
          part: trend.partNumber,
          change: trend.change,
          percentage: trend.usageChange
        }))
      }

      logAction('Usage - Success', userId, {
        period,
        totalPartsUsed: globalStats.totalPartsUsed,
        totalCost: globalStats.totalCost,
        alerts: alerts.length
      })

      return NextResponse.json({
        success: true,
        data: {
          recentUsage: limitedUsage,
          globalStats,
          categoryUsage: Object.values(categoryUsage),
          trends,
          alerts,
          chartData,
          filters: {
            period,
            category: category || null,
            sortBy,
            limit
          },
          periodInfo: {
            startDate: startDate.toISOString(),
            endDate: now.toISOString(),
            days: Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
          }
        }
      })

    } catch (dbError) {
      logAction('Usage - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération de l\'utilisation' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('Usage - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}