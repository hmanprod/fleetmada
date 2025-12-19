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
      console.log('[Parts Usage Analytics API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Parts Usage Analytics API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Parts Usage Analytics API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// GET /api/parts/usage-analytics - Analyse de l'utilisation des pièces
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('Usage Analytics - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const authParts = authHeader.split(' ')
    if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
      logAction('Usage Analytics - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = authParts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('Usage Analytics - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    // Extraction des paramètres de requête
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '6months' // '1month', '3months', '6months', '1year', 'all'
    const category = searchParams.get('category')
    const groupBy = searchParams.get('groupBy') || 'month' // 'month', 'quarter', 'year', 'category'
    const sortBy = searchParams.get('sortBy') || 'usageCount'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const limit = parseInt(searchParams.get('limit') || '20')

    // Calculer la date de début selon la période
    const now = new Date()
    let startDate: Date
    switch (period) {
      case '1month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        break
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
        break
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
        break
      case '1year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      case 'all':
      default:
        startDate = new Date(0) // Tous les temps
        break
    }

    logAction('Usage Analytics', userId, {
      period,
      category,
      groupBy,
      sortBy,
      sortOrder,
      limit,
      startDate: startDate.toISOString()
    })

    try {
      // Récupérer les pièces avec leurs utilisations
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
                      name: true,
                      type: true
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

      // Calculer les métriques d'utilisation pour chaque pièce
      const usageData = filteredParts.map(part => {
        const usageCount = part.serviceEntries.length
        const totalQuantityUsed = part.serviceEntries.reduce((sum, sep) => sum + sep.quantity, 0)
        const totalValueUsed = part.serviceEntries.reduce((sum, sep) => sum + sep.totalCost, 0)
        
        // Calculer la fréquence d'utilisation (utilisations par mois)
        const monthsDiff = period === 'all' ? 
          Math.max(1, (now.getTime() - new Date(part.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)) :
          period === '1year' ? 12 :
          period === '6months' ? 6 :
          period === '3months' ? 3 :
          1
        const frequencyPerMonth = usageCount / monthsDiff

        // Calculer le taux de rotation du stock
        const stockTurnoverRate = part.quantity > 0 ? totalQuantityUsed / part.quantity : 0

        // Trouver la dernière utilisation
        const lastUsage = part.serviceEntries.length > 0 ? 
          part.serviceEntries.sort((a, b) => 
            new Date(b.serviceEntry.date).getTime() - new Date(a.serviceEntry.date).getTime()
          )[0].serviceEntry.date : null

        // Calculer les tendances mensuelles
        const monthlyUsage = part.serviceEntries.reduce((acc, sep) => {
          const monthKey = new Date(sep.serviceEntry.date).toISOString().slice(0, 7) // YYYY-MM
          if (!acc[monthKey]) {
            acc[monthKey] = { quantity: 0, value: 0, count: 0 }
          }
          acc[monthKey].quantity += sep.quantity
          acc[monthKey].value += sep.totalCost
          acc[monthKey].count += 1
          return acc
        }, {} as Record<string, any>)

        return {
          partId: part.id,
          partNumber: part.number,
          description: part.description,
          category: part.category,
          manufacturer: part.manufacturer,
          currentStock: part.quantity,
          costPerUnit: part.cost || 0,
          usageCount,
          totalQuantityUsed,
          totalValueUsed,
          frequencyPerMonth,
          stockTurnoverRate,
          lastUsage,
          monthlyUsage,
          utilizationRate: part.quantity > 0 ? (totalQuantityUsed / part.quantity) * 100 : 0,
          // Classification ABC basée sur la valeur d'utilisation
          abcClass: totalValueUsed > 100000 ? 'A' : totalValueUsed > 20000 ? 'B' : 'C'
        }
      })

      // Trier selon les critères
      usageData.sort((a, b) => {
        let comparison = 0
        if (sortBy === 'usageCount') {
          comparison = a.usageCount - b.usageCount
        } else if (sortBy === 'totalValueUsed') {
          comparison = a.totalValueUsed - b.totalValueUsed
        } else if (sortBy === 'totalQuantityUsed') {
          comparison = a.totalQuantityUsed - b.totalQuantityUsed
        } else if (sortBy === 'frequencyPerMonth') {
          comparison = a.frequencyPerMonth - b.frequencyPerMonth
        } else if (sortBy === 'utilizationRate') {
          comparison = a.utilizationRate - b.utilizationRate
        } else if (sortBy === 'stockTurnoverRate') {
          comparison = a.stockTurnoverRate - b.stockTurnoverRate
        }
        return sortOrder === 'desc' ? -comparison : comparison
      })

      // Regrouper les données selon le groupBy demandé
      const groupedData = {}
      if (groupBy === 'category') {
        usageData.forEach(part => {
          const category = part.category || 'Non classé'
          if (!groupedData[category]) {
            groupedData[category] = {
              category,
              partsCount: 0,
              totalUsage: 0,
              totalValue: 0,
              averageFrequency: 0
            }
          }
          groupedData[category].partsCount++
          groupedData[category].totalUsage += part.usageCount
          groupedData[category].totalValue += part.totalValueUsed
          groupedData[category].averageFrequency += part.frequencyPerMonth
        })
        
        // Calculer les moyennes
        Object.values(groupedData).forEach((group: any) => {
          group.averageFrequency = group.averageFrequency / group.partsCount
        })
      }

      // Calculer les statistiques globales
      const totalUsageCount = usageData.reduce((sum, part) => sum + part.usageCount, 0)
      const totalQuantityUsed = usageData.reduce((sum, part) => sum + part.totalQuantityUsed, 0)
      const totalValueUsed = usageData.reduce((sum, part) => sum + part.totalValueUsed, 0)
      const averageFrequency = usageData.length > 0 ? totalUsageCount / usageData.length : 0

      // Classification ABC globale
      const totalValueForABC = usageData.reduce((sum, part) => sum + part.totalValueUsed, 0)
      const aClassParts = usageData.filter(p => p.totalValueUsed > totalValueForABC * 0.7)
      const bClassParts = usageData.filter(p => p.totalValueUsed > totalValueForABC * 0.2 && p.totalValueUsed <= totalValueForABC * 0.7)
      const cClassParts = usageData.filter(p => p.totalValueUsed <= totalValueForABC * 0.2)

      // Tendances mensuelles globales
      const globalMonthlyTrends = usageData.reduce((acc, part) => {
        Object.entries(part.monthlyUsage).forEach(([month, data]: [string, any]) => {
          if (!acc[month]) {
            acc[month] = { quantity: 0, value: 0, count: 0 }
          }
          acc[month].quantity += data.quantity
          acc[month].value += data.value
          acc[month].count += data.count
        })
        return acc
      }, {} as Record<string, any>)

      logAction('Usage Analytics - Success', userId, {
        period,
        totalParts: filteredParts.length,
        totalUsageCount,
        totalValueUsed,
        aClassCount: aClassParts.length,
        bClassCount: bClassParts.length,
        cClassCount: cClassParts.length
      })

      return NextResponse.json({
        success: true,
        data: {
          overview: {
            period,
            startDate: startDate.toISOString(),
            endDate: now.toISOString(),
            totalParts: filteredParts.length,
            totalUsageCount,
            totalQuantityUsed,
            totalValueUsed,
            averageFrequency: averageFrequency.toFixed(2)
          },
          topUsedParts: usageData.slice(0, limit),
          abcAnalysis: {
            aClass: {
              count: aClassParts.length,
              percentage: (aClassParts.length / usageData.length * 100).toFixed(1),
              value: aClassParts.reduce((sum, p) => sum + p.totalValueUsed, 0)
            },
            bClass: {
              count: bClassParts.length,
              percentage: (bClassParts.length / usageData.length * 100).toFixed(1),
              value: bClassParts.reduce((sum, p) => sum + p.totalValueUsed, 0)
            },
            cClass: {
              count: cClassParts.length,
              percentage: (cClassParts.length / usageData.length * 100).toFixed(1),
              value: cClassParts.reduce((sum, p) => sum + p.totalValueUsed, 0)
            }
          },
          trends: {
            monthly: Object.entries(globalMonthlyTrends)
              .map(([month, data]) => ({ month, ...data }))
              .sort((a, b) => a.month.localeCompare(b.month))
          },
          groupedData: Object.values(groupedData),
          insights: {
            mostUsed: usageData.length > 0 ? usageData[0].partNumber : null,
            highestValue: usageData.sort((a, b) => b.totalValueUsed - a.totalValueUsed)[0]?.partNumber || null,
            recommendations: [
              ...(aClassParts.length > 0 ? [`${aClassParts.length} pièces de classe A nécessitent un suivi régulier`] : []),
              ...(cClassParts.length > usageData.length * 0.5 ? [`${cClassParts.length} pièces de classe C à évaluer pour élimination`] : []),
              ...(totalValueUsed > 0 ? [`Valeur totale utilisée: ${totalValueUsed.toLocaleString('fr-FR')} Ar`] : [])
            ]
          }
        }
      })

    } catch (dbError) {
      logAction('Usage Analytics - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors du calcul de l\'analyse d\'utilisation' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('Usage Analytics - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}