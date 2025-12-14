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

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload
    
    // Vérifier que c'est un token de connexion
    if (decoded.type !== 'login') {
      return null
    }
    
    return decoded
  } catch (error) {
    // Token invalide ou expiré
    return null
  }
}

// Fonction de nettoyage des tokens expirés
const cleanExpiredTokens = async (): Promise<void> => {
  try {
    await prisma.blacklistedToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })
  } catch (error) {
    console.warn('[Logout API] Erreur lors du nettoyage des tokens expirés:', error)
  }
}

// Fonction de logging
const logAction = (action: string, details: any) => {
  console.log(`[Logout API] ${new Date().toISOString()} - ${action}:`, details)
}

export async function POST(request: NextRequest) {
  try {
    logAction('Logout attempt', { timestamp: new Date().toISOString() })

    // Extraction du token depuis le header Authorization
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      logAction('Missing authorization header', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    // Vérification du format Bearer token
    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('Invalid authorization header format', { authHeader })
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]

    // Validation du token JWT
    const tokenPayload = validateToken(token)
    if (!tokenPayload) {
      logAction('Invalid token', { 
        tokenType: authHeader.substring(0, 20) + '...',
        reason: 'Token invalide ou expiré'
      })
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const { userId, email } = tokenPayload

    // Vérification que l'utilisateur existe toujours
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true }
    })

    if (!user) {
      logAction('User not found', { userId })
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 401 }
      )
    }

    try {
      // Nettoyage des tokens expirés avant d'ajouter le nouveau
      await cleanExpiredTokens()

      // Vérification si le token est déjà blacklisté
      const existingBlacklistedToken = await prisma.blacklistedToken.findUnique({
        where: { token }
      })

      if (existingBlacklistedToken) {
        logAction('Token already blacklisted', { userId, tokenId: existingBlacklistedToken.id })
        // Si le token est déjà blacklisté, on considère la déconnexion comme réussie
        return NextResponse.json(
          { success: true, message: 'Déconnexion réussie' },
          { status: 200 }
        )
      }

      // Calcul de la date d'expiration du token
      let expiresAt: Date
      if (tokenPayload.exp) {
        expiresAt = new Date(tokenPayload.exp * 1000)
      } else {
        // Fallback: 24h après la création (durée standard d'un token de connexion)
        expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
      }

      // Ajout du token à la blacklist
      const blacklistedToken = await prisma.blacklistedToken.create({
        data: {
          token,
          userId,
          expiresAt
        }
      })

      logAction('Token blacklisted successfully', { 
        userId, 
        tokenId: blacklistedToken.id,
        expiresAt 
      })

      // Réponse de succès
      return NextResponse.json(
        { success: true, message: 'Déconnexion réussie' },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('Database error', { 
        error: dbError instanceof Error ? dbError.message : 'Unknown database error',
        userId 
      })
      
      return NextResponse.json(
        { success: false, error: 'Erreur lors de l\'invalidation du token' },
        { status: 500 }
      )
    }

  } catch (error) {
    logAction('Server error', { 
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
export async function GET() {
  logAction('Invalid method', { method: 'GET' })
  return NextResponse.json(
    { error: 'Méthode non autorisée' },
    { status: 405 }
  )
}

export async function PUT() {
  logAction('Invalid method', { method: 'PUT' })
  return NextResponse.json(
    { error: 'Méthode non autorisée' },
    { status: 405 }
  )
}

export async function DELETE() {
  logAction('Invalid method', { method: 'DELETE' })
  return NextResponse.json(
    { error: 'Méthode non autorisée' },
    { status: 405 }
  )
}