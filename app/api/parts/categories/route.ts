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
      console.log('[Parts Categories API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Parts Categories API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Parts Categories API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// GET /api/parts/categories - Répartition par catégories
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('Categories - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const authParts = authHeader.split(' ')
    if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
      logAction('Categories - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = authParts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('Categories - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    // Extraction des paramètres de requête
    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get('includeStats') === 'true'
    const sortBy = searchParams.get('sortBy') || 'partsCount'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    logAction('Categories', userId, {
      includeStats,
      sortBy,
      sortOrder
    })

    try {
      // Récupérer les catégories définies dans le système
      const definedCategories = await prisma.partCategory.findMany()

      // Récupérer toutes les pièces avec leurs utilisations
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

      // Initialiser les données par catégorie avec les catégories définies
      const categoryData = definedCategories.reduce((acc, cat) => {
        acc[cat.name] = {
          id: cat.id,
          name: cat.name,
          description: cat.description,
          parts: [],
          totalParts: 0,
          totalQuantity: 0,
          totalStockValue: 0,
          totalUsageCount: 0,
          totalUsageValue: 0,
          lowStockCount: 0,
          outOfStockCount: 0,
          averageCost: 0,
          mostUsedPart: null,
          highestValuePart: null,
          manufacturers: new Set(),
          lastActivity: null
        }
        return acc
      }, {} as Record<string, any>)

      // Grouper les pièces par catégorie (inclure celles non définies explicitement)
      parts.reduce((acc, part) => {
        const category = part.category || 'Non classé'
        if (!acc[category]) {
          acc[category] = {
            id: category,
            name: category,
            parts: [],
            totalParts: 0,
            totalQuantity: 0,
            totalStockValue: 0,
            totalUsageCount: 0,
            totalUsageValue: 0,
            lowStockCount: 0,
            outOfStockCount: 0,
            averageCost: 0,
            mostUsedPart: null,
            highestValuePart: null,
            manufacturers: new Set(),
            lastActivity: null
          }
        }

        const categoryInfo = acc[category]

        // Ajouter la pièce aux statistiques de catégorie
        categoryInfo.parts.push(part)
        categoryInfo.totalParts++
        categoryInfo.totalQuantity += part.quantity
        categoryInfo.totalStockValue += (part.cost || 0) * part.quantity
        categoryInfo.manufacturers.add(part.manufacturer || 'Inconnu')

        // Statistiques de stock
        if (part.quantity === 0) {
          categoryInfo.outOfStockCount++
        } else if (part.quantity <= part.minimumStock) {
          categoryInfo.lowStockCount++
        }

        // Statistiques d'utilisation
        const usageCount = part.serviceEntries.length
        const usageValue = part.serviceEntries.reduce((sum, sep) => sum + sep.totalCost, 0)

        categoryInfo.totalUsageCount += usageCount
        categoryInfo.totalUsageValue += usageValue

        // Trouver la pièce la plus utilisée
        if (!categoryInfo.mostUsedPart || usageCount > categoryInfo.mostUsedPart.usageCount) {
          categoryInfo.mostUsedPart = {
            partId: part.id,
            partNumber: part.number,
            description: part.description,
            usageCount,
            usageValue
          }
        }

        // Trouver la pièce de plus haute valeur
        const partStockValue = (part.cost || 0) * part.quantity
        if (!categoryInfo.highestValuePart || partStockValue > categoryInfo.highestValuePart.stockValue) {
          categoryInfo.highestValuePart = {
            partId: part.id,
            partNumber: part.number,
            description: part.description,
            stockValue: partStockValue,
            quantity: part.quantity,
            costPerUnit: part.cost || 0
          }
        }

        // Trouver la dernière activité
        const lastUsage = part.serviceEntries.length > 0 ?
          part.serviceEntries.sort((a, b) =>
            new Date(b.serviceEntry.date).getTime() - new Date(a.serviceEntry.date).getTime()
          )[0].serviceEntry.date : null

        if (!categoryInfo.lastActivity ||
          (lastUsage && new Date(lastUsage) > new Date(categoryInfo.lastActivity))) {
          categoryInfo.lastActivity = lastUsage
        }

        return acc
      }, categoryData)

      // Finaliser les calculs pour chaque catégorie
      const categories = Object.values(categoryData).map((category: any) => {
        // Calculer le coût moyen
        category.averageCost = category.totalParts > 0 ?
          category.totalStockValue / category.totalQuantity : 0

        // Calculer le taux d'utilisation
        category.utilizationRate = category.totalQuantity > 0 ?
          (category.totalUsageCount / category.totalQuantity) * 100 : 0

        // Calculer le taux de rotation du stock
        category.stockTurnoverRate = category.totalQuantity > 0 ?
          category.totalUsageCount / category.totalQuantity : 0

        // Convertir les manufacturers en array
        category.manufacturers = Array.from(category.manufacturers)

        // Statut de la catégorie
        const stockHealthScore = ((category.totalParts - category.lowStockCount - category.outOfStockCount) / category.totalParts) * 100
        category.healthScore = isNaN(stockHealthScore) ? 0 : stockHealthScore
        category.status = category.healthScore >= 80 ? 'HEALTHY' :
          category.healthScore >= 60 ? 'WARNING' : 'CRITICAL'

        return category
      })

      // Trier selon les critères
      categories.sort((a, b) => {
        let comparison = 0
        if (sortBy === 'partsCount') {
          comparison = a.totalParts - b.totalParts
        } else if (sortBy === 'stockValue') {
          comparison = a.totalStockValue - b.totalStockValue
        } else if (sortBy === 'usageValue') {
          comparison = a.totalUsageValue - b.totalUsageValue
        } else if (sortBy === 'utilizationRate') {
          comparison = a.utilizationRate - b.utilizationRate
        } else if (sortBy === 'healthScore') {
          comparison = a.healthScore - b.healthScore
        } else if (sortBy === 'name') {
          comparison = a.name.localeCompare(b.name)
        }
        return sortOrder === 'desc' ? -comparison : comparison
      })

      // Calculer les statistiques globales
      const globalStats = {
        totalCategories: categories.length,
        totalParts: categories.reduce((sum, cat) => sum + cat.totalParts, 0),
        totalStockValue: categories.reduce((sum, cat) => sum + cat.totalStockValue, 0),
        totalQuantity: categories.reduce((sum, cat) => sum + cat.totalQuantity, 0),
        totalUsageValue: categories.reduce((sum, cat) => sum + cat.totalUsageValue, 0),
        averagePartsPerCategory: categories.length > 0 ? categories.reduce((sum, cat) => sum + cat.totalParts, 0) / categories.length : 0,
        healthyCategories: categories.filter(cat => cat.status === 'HEALTHY').length,
        warningCategories: categories.filter(cat => cat.status === 'WARNING').length,
        criticalCategories: categories.filter(cat => cat.status === 'CRITICAL').length
      }

      // Top catégories par différents critères
      const topCategories = {
        byPartsCount: [...categories].sort((a, b) => b.totalParts - a.totalParts).slice(0, 5),
        byStockValue: [...categories].sort((a, b) => b.totalStockValue - a.totalStockValue).slice(0, 5),
        byUsageValue: [...categories].sort((a, b) => b.totalUsageValue - a.totalUsageValue).slice(0, 5),
        byHealthScore: [...categories].sort((a, b) => b.healthScore - a.healthScore).slice(0, 5)
      }

      // Distribution des pièces par statut de santé
      const healthDistribution = {
        healthy: categories.filter(cat => cat.status === 'HEALTHY').length,
        warning: categories.filter(cat => cat.status === 'WARNING').length,
        critical: categories.filter(cat => cat.status === 'CRITICAL').length
      }

      // Préparer les données pour les graphiques
      const chartData = {
        categoryDistribution: categories.map(cat => ({
          name: cat.name,
          value: cat.totalParts,
          stockValue: cat.totalStockValue,
          healthScore: cat.healthScore
        })),
        healthDistribution: [
          { name: 'Saine', value: globalStats.healthyCategories, color: '#22c55e' },
          { name: 'Attention', value: globalStats.warningCategories, color: '#f59e0b' },
          { name: 'Critique', value: globalStats.criticalCategories, color: '#ef4444' }
        ]
      }

      logAction('Categories - Success', userId, {
        totalCategories: categories.length,
        totalParts: globalStats.totalParts,
        totalStockValue: globalStats.totalStockValue,
        healthyCategories: globalStats.healthyCategories,
        criticalCategories: globalStats.criticalCategories
      })

      return NextResponse.json({
        success: true,
        data: {
          overview: globalStats,
          categories: includeStats ? categories : categories.map(cat => ({
            id: cat.id || cat.name,
            name: cat.name,
            description: cat.description,
            totalParts: cat.totalParts,
            totalStockValue: cat.totalStockValue,
            status: cat.status,
            healthScore: cat.healthScore
          })),
          detailedCategories: includeStats ? categories : null,
          topCategories,
          healthDistribution,
          chartData,
          insights: {
            mostDiverseCategory: categories.length > 0 ? categories.reduce((prev, current) =>
              prev.manufacturers.length > current.manufacturers.length ? prev : current
            ).name : 'N/A',
            highestValueCategory: categories.length > 0 ? categories.reduce((prev, current) =>
              prev.totalStockValue > current.totalStockValue ? prev : current
            ).name : 'N/A',
            mostActiveCategory: categories.length > 0 ? categories.reduce((prev, current) =>
              prev.totalUsageValue > current.totalUsageValue ? prev : current
            ).name : 'N/A',
            recommendations: [
              ...(globalStats.criticalCategories > 0 ?
                [`${globalStats.criticalCategories} catégories nécessitent une attention immédiate`] : []),
              ...(globalStats.warningCategories > 0 ?
                [`${globalStats.warningCategories} catégories à surveiller`] : []),
              ...(globalStats.healthyCategories / globalStats.totalCategories < 0.5 ?
                [`Moins de 50% des catégories sont en bonne santé`] : [])
            ]
          }
        }
      })

    } catch (dbError) {
      logAction('Categories - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des catégories' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('Categories - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// POST /api/parts/categories - Nouvelle catégorie
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const tokenPayload = validateToken(token)
    if (!tokenPayload) {
      return NextResponse.json({ success: false, error: 'Token invalide' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ success: false, error: 'Le nom est requis' }, { status: 400 })
    }

    const category = await prisma.partCategory.create({
      data: { name, description }
    })

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Catégorie créée avec succès'
    })
  } catch (error) {
    console.error('[Categories API] POST Error:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}