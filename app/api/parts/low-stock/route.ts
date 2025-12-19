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
      console.log('[Parts Low Stock API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Parts Low Stock API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Parts Low Stock API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// GET /api/parts/low-stock - Liste des pièces en stock faible
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('Low Stock - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const authParts = authHeader.split(' ')
    if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
      logAction('Low Stock - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = authParts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('Low Stock - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    // Extraction des paramètres de requête
    const { searchParams } = new URL(request.url)
    const severity = searchParams.get('severity') // 'critical', 'low', 'all'
    const category = searchParams.get('category')
    const sortBy = searchParams.get('sortBy') || 'priority'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const limit = parseInt(searchParams.get('limit') || '50')

    logAction('Low Stock', userId, {
      severity,
      category,
      sortBy,
      sortOrder,
      limit
    })

    try {
      // Récupérer toutes les pièces
      const parts = await prisma.part.findMany({
        include: {
          serviceEntries: {
            include: {
              serviceEntry: {
                select: {
                  id: true,
                  date: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 5 // Dernières utilisations
          }
        }
      })

      // Filtrer les pièces en stock faible
      let lowStockParts = parts.filter(part => {
        if (severity === 'critical') {
          return part.quantity === 0
        } else if (severity === 'low') {
          return part.quantity > 0 && part.quantity <= part.minimumStock
        } else {
          // 'all' ou pas de filtre
          return part.quantity <= part.minimumStock
        }
      })

      // Filtrer par catégorie si spécifiée
      if (category) {
        lowStockParts = lowStockParts.filter(part => 
          part.category?.toLowerCase().includes(category.toLowerCase())
        )
      }

      // Enrichir avec des données d'analyse
      const enrichedParts = lowStockParts.map(part => {
        const usageCount = part.serviceEntries.length
        const lastUsage = part.serviceEntries.length > 0 ? part.serviceEntries[0].serviceEntry.date : null
        
        // Calculer la priorité basée sur plusieurs facteurs
        let priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
        let priorityScore = 0
        
        // Niveau de stock (40% du score)
        if (part.quantity === 0) {
          priorityScore += 40
          priority = 'CRITICAL'
        } else if (part.quantity <= part.minimumStock * 0.25) {
          priorityScore += 35
          priority = 'HIGH'
        } else if (part.quantity <= part.minimumStock * 0.5) {
          priorityScore += 25
          priority = 'MEDIUM'
        } else {
          priorityScore += 15
          priority = 'LOW'
        }
        
        // Fréquence d'utilisation (30% du score)
        if (usageCount > 20) {
          priorityScore += 30
        } else if (usageCount > 10) {
          priorityScore += 25
        } else if (usageCount > 5) {
          priorityScore += 20
        } else if (usageCount > 0) {
          priorityScore += 10
        }
        
        // Valeur en stock (20% du score)
        const stockValue = (part.cost || 0) * part.quantity
        if (stockValue > 50000) {
          priorityScore += 20
        } else if (stockValue > 10000) {
          priorityScore += 15
        } else if (stockValue > 1000) {
          priorityScore += 10
        }
        
        // Temps depuis dernière utilisation (10% du score)
        if (lastUsage) {
          const daysSinceLastUse = Math.floor((Date.now() - new Date(lastUsage).getTime()) / (1000 * 60 * 60 * 24))
          if (daysSinceLastUse <= 30) {
            priorityScore += 10
          } else if (daysSinceLastUse <= 90) {
            priorityScore += 8
          } else if (daysSinceLastUse <= 180) {
            priorityScore += 5
          }
        }

        return {
          ...part,
          priority,
          priorityScore,
          usageCount,
          lastUsage,
          stockValue,
          stockStatus: part.quantity === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
          daysSinceLastUse: lastUsage ? 
            Math.floor((Date.now() - new Date(lastUsage).getTime()) / (1000 * 60 * 60 * 24)) : null,
          recommendations: {
            reorderQuantity: Math.max(part.minimumStock * 2 - part.quantity, 10),
            estimatedCost: (part.cost || 0) * Math.max(part.minimumStock * 2 - part.quantity, 10),
            urgency: priority
          }
        }
      })

      // Trier selon les paramètres
      enrichedParts.sort((a, b) => {
        let comparison = 0
        
        if (sortBy === 'priority') {
          comparison = a.priorityScore - b.priorityScore
        } else if (sortBy === 'quantity') {
          comparison = a.quantity - b.quantity
        } else if (sortBy === 'stockValue') {
          comparison = a.stockValue - b.stockValue
        } else if (sortBy === 'lastUsage') {
          comparison = new Date(a.lastUsage || 0).getTime() - new Date(b.lastUsage || 0).getTime()
        } else if (sortBy === 'number') {
          comparison = a.number.localeCompare(b.number)
        }
        
        return sortOrder === 'desc' ? -comparison : comparison
      })

      // Limiter les résultats
      const limitedParts = enrichedParts.slice(0, limit)

      // Calculer les statistiques globales
      const totalLowStock = lowStockParts.length
      const criticalCount = lowStockParts.filter(p => p.quantity === 0).length
      const lowStockCount = lowStockParts.filter(p => p.quantity > 0 && p.quantity <= p.minimumStock).length
      const totalAtRiskValue = lowStockParts.reduce((sum, p) => sum + ((p.cost || 0) * p.quantity), 0)

      // Regroupement par priorité
      const priorityStats = {
        critical: enrichedParts.filter(p => p.priority === 'CRITICAL').length,
        high: enrichedParts.filter(p => p.priority === 'HIGH').length,
        medium: enrichedParts.filter(p => p.priority === 'MEDIUM').length,
        low: enrichedParts.filter(p => p.priority === 'LOW').length
      }

      // Regroupement par catégorie
      const categoryStats = enrichedParts.reduce((acc, part) => {
        const category = part.category || 'Non classé'
        if (!acc[category]) {
          acc[category] = { count: 0, critical: 0, totalValue: 0 }
        }
        acc[category].count++
        if (part.quantity === 0) acc[category].critical++
        acc[category].totalValue += part.stockValue
        return acc
      }, {} as Record<string, any>)

      logAction('Low Stock - Success', userId, {
        totalLowStock,
        criticalCount,
        lowStockCount,
        priorityStats
      })

      return NextResponse.json({
        success: true,
        data: {
          parts: limitedParts,
          summary: {
            total: totalLowStock,
            critical: criticalCount,
            lowStock: lowStockCount,
            totalAtRiskValue,
            priorityStats,
            categoryStats
          },
          filters: {
            severity: severity || 'all',
            category: category || null,
            sortBy,
            sortOrder,
            limit
          }
        }
      })

    } catch (dbError) {
      logAction('Low Stock - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des pièces en stock faible' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('Low Stock - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}