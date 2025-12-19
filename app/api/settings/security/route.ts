import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
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

// Schéma de validation Zod pour les paramètres de sécurité
const securitySettingsSchema = z.object({
  twoFactorEnabled: z.boolean().default(false),
  sessionTimeout: z.number().int().min(5).max(480).default(30), // 5 minutes à 8 heures
  ipWhitelist: z.array(z.string()).default([]),
  googleConnected: z.boolean().default(false),
  marketingEmails: z.boolean().default(true)
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
  confirmPassword: z.string().min(1, 'Confirmation du mot de passe requise')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
})

interface SecuritySettingsRequest {
  twoFactorEnabled?: boolean
  sessionTimeout?: number
  ipWhitelist?: string[]
  googleConnected?: boolean
  marketingEmails?: boolean
}

interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Interface pour les paramètres de sécurité réponse
interface SecuritySettingsResponse {
  id: string
  userId: string
  twoFactorEnabled: boolean
  twoFactorSecret?: string | null
  loginAttempts: number
  lastLogin?: Date | null
  passwordChanged: Date
  sessionTimeout: number
  ipWhitelist: string[]
  googleConnected: boolean
  marketingEmails: boolean
  createdAt: Date
  updatedAt: Date
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Settings Security API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Settings Security API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Settings Security API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction pour préparer la réponse paramètres de sécurité
const prepareSecuritySettingsResponse = (settings: any): SecuritySettingsResponse => {
  return {
    id: settings.id,
    userId: settings.userId,
    twoFactorEnabled: settings.twoFactorEnabled,
    twoFactorSecret: settings.twoFactorSecret,
    loginAttempts: settings.loginAttempts,
    lastLogin: settings.lastLogin,
    passwordChanged: settings.passwordChanged,
    sessionTimeout: settings.sessionTimeout,
    ipWhitelist: settings.ipWhitelist,
    googleConnected: settings.googleConnected,
    marketingEmails: settings.marketingEmails,
    createdAt: settings.createdAt,
    updatedAt: settings.updatedAt
  }
}

// GET /api/settings/security - Récupérer les paramètres de sécurité
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Security Settings - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Security Settings - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Security Settings - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('GET Security Settings - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    logAction('GET Security Settings', userId, { userId })

    // Récupération des paramètres de sécurité utilisateur
    let securitySettings = await prisma.securitySettings.findUnique({
      where: { userId }
    })

    // Si aucun paramètre n'existe, créer des paramètres par défaut
    if (!securitySettings) {
      securitySettings = await prisma.securitySettings.create({
        data: {
          userId,
          twoFactorEnabled: false,
          loginAttempts: 0,
          sessionTimeout: 30,
          ipWhitelist: [],
          googleConnected: false,
          marketingEmails: true,
          passwordChanged: new Date()
        }
      })
    }

    logAction('GET Security Settings - Success', userId, { 
      userId, 
      hasSettings: !!securitySettings,
      twoFactorEnabled: securitySettings.twoFactorEnabled
    })

    return NextResponse.json(
      {
        success: true,
        data: prepareSecuritySettingsResponse(securitySettings)
      },
      { status: 200 }
    )

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Security Settings - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// PUT /api/settings/security - Mettre à jour les paramètres de sécurité
export async function PUT(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('PUT Security Settings - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('PUT Security Settings - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('PUT Security Settings - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('PUT Security Settings - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    logAction('PUT Security Settings', userId, { userId })

    // Parse et validation du body JSON
    let body: SecuritySettingsRequest
    try {
      body = await request.json()
    } catch (error) {
      logAction('PUT Security Settings - Invalid JSON', userId, { error: error instanceof Error ? error.message : 'Unknown error' })
      return NextResponse.json(
        { success: false, error: 'Format JSON invalide' },
        { status: 400 }
      )
    }

    // Validation avec Zod
    const validationResult = securitySettingsSchema.safeParse(body)
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))

      logAction('PUT Security Settings - Validation failed', userId, { errors })
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
      logAction('PUT Security Settings - User not found', userId, { userId })
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Mise à jour des paramètres de sécurité en transaction
    try {
      const updatedSettings = await prisma.$transaction(async (tx) => {
        // Mise à jour ou création des paramètres de sécurité
        const settings = await tx.securitySettings.upsert({
          where: { userId },
          update: {
            ...updateData,
            updatedAt: new Date()
          },
          create: {
            userId,
            ...updateData,
            loginAttempts: 0,
            passwordChanged: new Date()
          }
        })

        // Log de l'action
        console.log(`[Settings Security API] ${new Date().toISOString()} - Security settings updated - User: ${userId}:`, {
          updatedFields: Object.keys(updateData),
          timestamp: new Date().toISOString()
        })

        return settings
      })

      logAction('PUT Security Settings - Success', userId, {
        userId,
        updatedFields: Object.keys(updateData)
      })

      return NextResponse.json(
        {
          success: true,
          data: prepareSecuritySettingsResponse(updatedSettings),
          message: 'Paramètres de sécurité mis à jour avec succès'
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('PUT Security Settings - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour des paramètres de sécurité' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('PUT Security Settings - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// POST /api/settings/security/password - Changer le mot de passe
export async function POST(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('POST Change Password - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('POST Change Password - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('POST Change Password - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('POST Change Password - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    logAction('POST Change Password', userId, { userId })

    // Parse et validation du body JSON
    let body: ChangePasswordRequest
    try {
      body = await request.json()
    } catch (error) {
      logAction('POST Change Password - Invalid JSON', userId, { error: error instanceof Error ? error.message : 'Unknown error' })
      return NextResponse.json(
        { success: false, error: 'Format JSON invalide' },
        { status: 400 }
      )
    }

    // Validation avec Zod
    const validationResult = changePasswordSchema.safeParse(body)
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))

      logAction('POST Change Password - Validation failed', userId, { errors })
      return NextResponse.json(
        {
          success: false,
          error: 'Données invalides',
          details: errors
        },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = validationResult.data

    // Récupération de l'utilisateur avec son mot de passe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      logAction('POST Change Password - User not found', userId, { userId })
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Vérification du mot de passe actuel
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      logAction('POST Change Password - Invalid current password', userId, { userId })
      return NextResponse.json(
        { success: false, error: 'Mot de passe actuel incorrect' },
        { status: 400 }
      )
    }

    // Hachage du nouveau mot de passe
    const saltRounds = 12
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

    // Mise à jour en transaction
    try {
      await prisma.$transaction(async (tx) => {
        // Mise à jour du mot de passe utilisateur
        await tx.user.update({
          where: { id: userId },
          data: {
            password: hashedNewPassword,
            updatedAt: new Date()
          }
        })

        // Mise à jour des paramètres de sécurité
        await tx.securitySettings.upsert({
          where: { userId },
          update: {
            passwordChanged: new Date(),
            loginAttempts: 0,
            updatedAt: new Date()
          },
          create: {
            userId,
            passwordChanged: new Date(),
            loginAttempts: 0,
            sessionTimeout: 30,
            ipWhitelist: [],
            googleConnected: false,
            marketingEmails: true
          }
        })

        // Log de l'action
        console.log(`[Settings Security API] ${new Date().toISOString()} - Password changed - User: ${userId}:`, {
          timestamp: new Date().toISOString()
        })
      })

      logAction('POST Change Password - Success', userId, { userId })

      return NextResponse.json(
        {
          success: true,
          message: 'Mot de passe modifié avec succès'
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('POST Change Password - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la modification du mot de passe' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('POST Change Password - Server error', userId, {
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
export async function DELETE() {
  return NextResponse.json(
    { error: 'Méthode non autorisée' },
    { status: 405 }
  )
}