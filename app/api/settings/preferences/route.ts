import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

// Interface pour les données du token JWT décodé
interface TokenPayload {
  userId: string
  email: string
  type: string
  iat: number
  exp?: number
}

// Schéma de validation Zod pour les préférences utilisateur
const userPreferencesSchema = z.object({
  theme: z.string().default('light'),        // 'light', 'dark', 'auto'
  language: z.string().default('fr'),        // 'fr', 'en'
  timezone: z.string().default('UTC'),
  notifications: z.any().default({}),        // Configuration notifications
  dashboard: z.any().default({}),            // Widgets dashboard
  fuelEconomyDisplay: z.string().default('L/100km'),
  itemsPerPage: z.number().int().min(10).max(200).default(50)
})

interface UserPreferencesRequest {
  theme?: string
  language?: string
  timezone?: string
  notifications?: any
  dashboard?: any
  fuelEconomyDisplay?: string
  itemsPerPage?: number
}

// Interface pour les préférences utilisateur réponse
interface UserPreferencesResponse {
  id: string
  userId: string
  theme: string
  language: string
  timezone: string
  notifications: any
  dashboard: any
  fuelEconomyDisplay: string
  itemsPerPage: number
  createdAt: Date
  updatedAt: Date
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Settings Preferences API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Settings Preferences API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Settings Preferences API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction pour préparer la réponse préférences utilisateur
const preparePreferencesResponse = (preferences: any): UserPreferencesResponse => {
  return {
    id: preferences.id,
    userId: preferences.userId,
    theme: preferences.theme,
    language: preferences.language,
    timezone: preferences.timezone,
    notifications: preferences.notifications,
    dashboard: preferences.dashboard,
    fuelEconomyDisplay: preferences.fuelEconomyDisplay,
    itemsPerPage: preferences.itemsPerPage,
    createdAt: preferences.createdAt,
    updatedAt: preferences.updatedAt
  }
}

// GET /api/settings/preferences - Récupérer les préférences utilisateur
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Preferences - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Preferences - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Preferences - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('GET Preferences - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    logAction('GET Preferences', userId, { userId })

    // Récupération des préférences utilisateur
    let userPreferences = await prisma.userPreferences.findUnique({
      where: { userId }
    })

    // Si aucune préférence n'existe, créer des préférences par défaut
    if (!userPreferences) {
      userPreferences = await prisma.userPreferences.create({
        data: {
          userId,
          theme: 'light',
          language: 'fr',
          timezone: 'UTC',
          notifications: {},
          dashboard: {},
          fuelEconomyDisplay: 'L/100km',
          itemsPerPage: 50
        }
      })
    }

    logAction('GET Preferences - Success', userId, { 
      userId, 
      hasPreferences: !!userPreferences 
    })

    return NextResponse.json(
      {
        success: true,
        data: preparePreferencesResponse(userPreferences)
      },
      { status: 200 }
    )

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Preferences - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// PUT /api/settings/preferences - Mettre à jour les préférences utilisateur
export async function PUT(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('PUT Preferences - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('PUT Preferences - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('PUT Preferences - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('PUT Preferences - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    logAction('PUT Preferences', userId, { userId })

    // Parse et validation du body JSON
    let body: UserPreferencesRequest
    try {
      body = await request.json()
    } catch (error) {
      logAction('PUT Preferences - Invalid JSON', userId, { error: error instanceof Error ? error.message : 'Unknown error' })
      return NextResponse.json(
        { success: false, error: 'Format JSON invalide' },
        { status: 400 }
      )
    }

    // Validation avec Zod
    const validationResult = userPreferencesSchema.safeParse(body)
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))

      logAction('PUT Preferences - Validation failed', userId, { errors })
      return NextResponse.json(
        {
          success: false,
          error: 'Données invalides',
          details: errors
        },
        { status: 400 }
      )
    }

    const updateData = validationResult.data

    // Vérification que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      logAction('PUT Preferences - User not found', userId, { userId })
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Mise à jour des préférences en transaction
    try {
      const updatedPreferences = await prisma.$transaction(async (tx) => {
        // Mise à jour ou création des préférences utilisateur
        const preferences = await tx.userPreferences.upsert({
          where: { userId },
          update: {
            ...updateData,
            updatedAt: new Date()
          },
          create: {
            userId,
            ...updateData
          }
        })

        // Log de l'action
        console.log(`[Settings Preferences API] ${new Date().toISOString()} - User preferences updated - User: ${userId}:`, {
          updatedFields: Object.keys(updateData),
          timestamp: new Date().toISOString()
        })

        return preferences
      })

      logAction('PUT Preferences - Success', userId, {
        userId,
        updatedFields: Object.keys(updateData)
      })

      return NextResponse.json(
        {
          success: true,
          data: preparePreferencesResponse(updatedPreferences),
          message: 'Préférences mises à jour avec succès'
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('PUT Preferences - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour des préférences' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('PUT Preferences - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// Gestion des méthodes non autorisées
export async function POST() {
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