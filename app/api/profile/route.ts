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

// Schéma de validation Zod pour la mise à jour du profil
const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'Le prénom doit contenir au moins 1 caractère').optional(),
  lastName: z.string().optional(),
  avatar: z.string().url('URL d\'avatar invalide').optional().or(z.literal('')),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').optional(),
  currentPassword: z.string().min(1, 'Le mot de passe actuel est requis pour changer le mot de passe').optional()
}).refine((data) => {
  // Si password est fourni, currentPassword doit aussi être fourni
  if (data.password && !data.currentPassword) {
    return false
  }
  return true
}, {
  message: 'Le mot de passe actuel est requis pour changer le mot de passe',
  path: ['currentPassword']
})

interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  avatar?: string
  password?: string
  currentPassword?: string
}

// Interface pour l'utilisateur réponse (sans mot de passe)
interface UserResponse {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string | null
  role: string
  companyId?: string | null
  createdAt: Date
  updatedAt: Date
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Profile API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction pour préparer la réponse utilisateur (sans mot de passe)
const prepareUserResponse = (user: any): UserResponse => {
  const nameParts = (user.name || '').split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return {
    id: user.id,
    firstName,
    lastName,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    companyId: user.companyId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }
}

// Fonction de validation du token JWT (utilisée dans les routes API)
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    // Vérifier que c'est un token de connexion
    if (decoded.type !== 'login') {
      console.log('[Profile API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Profile API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// GET /api/profile - Lire le profil utilisateur
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Profile - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Profile - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Profile - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('GET Profile - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    logAction('GET Profile', userId, { userId })

    // Récupération de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      logAction('GET Profile - User not found', userId, { userId })
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Préparation de la réponse
    const userResponse = prepareUserResponse(user)

    logAction('GET Profile - Success', userId, { userId, email: user.email })

    return NextResponse.json(
      {
        success: true,
        user: userResponse
      },
      { status: 200 }
    )

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Profile - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// PUT /api/profile - Mettre à jour le profil
export async function PUT(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('PUT Profile - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('PUT Profile - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('PUT Profile - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('PUT Profile - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    logAction('PUT Profile', userId, { userId })

    // Parse et validation du body JSON
    let body: UpdateProfileRequest
    try {
      body = await request.json()
    } catch (error) {
      logAction('PUT Profile - Invalid JSON', userId, { error: error instanceof Error ? error.message : 'Unknown error' })
      return NextResponse.json(
        { success: false, error: 'Format JSON invalide' },
        { status: 400 }
      )
    }

    // Validation avec Zod
    const validationResult = updateProfileSchema.safeParse(body)
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))

      logAction('PUT Profile - Validation failed', userId, { errors })
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

    // Récupération de l'utilisateur actuel pour vérification
    const currentUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!currentUser) {
      logAction('PUT Profile - User not found', userId, { userId })
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Préparation des données de mise à jour
    const dataToUpdate: any = {}

    // Champs optionnels
    if (updateData.firstName !== undefined || updateData.lastName !== undefined) {
      const currentNameParts = (currentUser.name || '').split(' ');
      const newFirstName = updateData.firstName !== undefined ? updateData.firstName.trim() : currentNameParts[0] || '';
      const newLastName = updateData.lastName !== undefined ? updateData.lastName.trim() : currentNameParts.slice(1).join(' ') || '';
      dataToUpdate.name = `${newFirstName} ${newLastName}`.trim();
    }

    if (updateData.avatar !== undefined) dataToUpdate.avatar = updateData.avatar?.trim() || null

    // Gestion du changement de mot de passe
    if (updateData.password && updateData.currentPassword) {
      // Vérification du mot de passe actuel
      const isCurrentPasswordValid = await bcrypt.compare(updateData.currentPassword, currentUser.password)
      if (!isCurrentPasswordValid) {
        logAction('PUT Profile - Invalid current password', userId, { userId })
        return NextResponse.json(
          { success: false, error: 'Mot de passe actuel incorrect' },
          { status: 400 }
        )
      }

      // Hachage du nouveau mot de passe
      const saltRounds = 12
      const hashedNewPassword = await bcrypt.hash(updateData.password, saltRounds)
      dataToUpdate.password = hashedNewPassword
    }

    // Vérification de l'unicité de l'email si modifié (pas dans cette version)
    // Cette logique pourrait être ajoutée ici si on permet la modification de l'email

    // Mise à jour dans une transaction
    try {
      const updatedUser = await prisma.$transaction(async (tx) => {
        // Vérifier que des données sont à mettre à jour
        if (Object.keys(dataToUpdate).length === 0) {
          throw new Error('Aucune donnée à mettre à jour')
        }

        // Mise à jour de l'utilisateur
        const user = await tx.user.update({
          where: { id: userId },
          data: {
            ...dataToUpdate,
            updatedAt: new Date()
          }
        })

        // Log de l'action de profil
        console.log(`[Profile API] ${new Date().toISOString()} - Profile updated - User: ${userId}:`, {
          updatedFields: Object.keys(dataToUpdate),
          timestamp: new Date().toISOString()
        })

        return user
      })

      // Préparation de la réponse
      const userResponse = prepareUserResponse(updatedUser)

      logAction('PUT Profile - Success', userId, {
        userId,
        updatedFields: Object.keys(dataToUpdate)
      })

      return NextResponse.json(
        {
          success: true,
          user: userResponse,
          message: 'Profil mis à jour avec succès'
        },
        { status: 200 }
      )

    } catch (dbError) {
      // Gestion des erreurs Prisma spécifiques
      if (dbError instanceof Error) {
        if (dbError.message.includes('Aucune donnée à mettre à jour')) {
          logAction('PUT Profile - No data to update', userId, { userId })
          return NextResponse.json(
            { success: false, error: 'Aucune donnée à mettre à jour' },
            { status: 400 }
          )
        }

        if (dbError.message.includes('Unique constraint')) {
          logAction('PUT Profile - Unique constraint violation', userId, { error: dbError.message })
          return NextResponse.json(
            { success: false, error: 'Cette valeur existe déjà' },
            { status: 409 }
          )
        }
      }

      logAction('PUT Profile - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour du profil' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('PUT Profile - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// DELETE /api/profile - Supprimer le compte
export async function DELETE(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('DELETE Profile - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('DELETE Profile - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('DELETE Profile - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('DELETE Profile - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    logAction('DELETE Profile', userId, { userId })

    // Récupération de l'utilisateur pour vérification
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      logAction('DELETE Profile - User not found', userId, { userId })
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Suppression en transaction ( Cascade dans Prisma supprimera les données liées )
    try {
      await prisma.$transaction(async (tx) => {
        // Supprimer tous les tokens blacklistés de l'utilisateur
        await tx.blacklistedToken.deleteMany({
          where: { userId }
        })

        // Supprimer l'utilisateur ( Cascade supprimera les autres données liées )
        await tx.user.delete({
          where: { id: userId }
        })

        // Log de l'action de suppression
        console.log(`[Profile API] ${new Date().toISOString()} - Account deleted - User: ${userId}:`, {
          email: user.email,
          deletedAt: new Date().toISOString()
        })
      })

      logAction('DELETE Profile - Success', userId, { userId, email: user.email })

      return NextResponse.json(
        {
          success: true,
          message: 'Compte supprimé avec succès'
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('DELETE Profile - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression du compte' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('DELETE Profile - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// Gestion des méthodes non autorisées pour POST
export async function POST() {
  return NextResponse.json(
    { error: 'Méthode non autorisée' },
    { status: 405 }
  )
}