import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

// Schéma de validation Zod pour la connexion
const loginSchema = z.object({
  email: z.string().email('Format d\'email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis')
})

interface LoginRequest {
  email: string
  password: string
}

// Génération du token JWT de connexion
const generateLoginToken = (userId: string, email: string, role: string, companyId?: string | null): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key'
  return jwt.sign(
    {
      userId,
      email,
      role,
      companyId,
      type: 'login',
      iat: Math.floor(Date.now() / 1000)
    },
    secret,
    { expiresIn: '24h' }
  )
}

// Fonction de logging
const logAction = (action: string, details: any) => {
  console.log(`[Login API] ${new Date().toISOString()} - ${action}:`, details)
}

export async function POST(request: NextRequest) {
  try {
    logAction('Login attempt', { timestamp: new Date().toISOString() })

    // Parse et validation du body JSON
    let body: LoginRequest
    try {
      body = await request.json()
    } catch (error) {
      logAction('Invalid JSON', { error: error instanceof Error ? error.message : 'Unknown error' })
      return NextResponse.json(
        { success: false, error: 'Format JSON invalide' },
        { status: 400 }
      )
    }

    // Validation avec Zod
    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))

      logAction('Validation failed', { errors })
      return NextResponse.json(
        {
          success: false,
          error: 'Données invalides',
          details: errors
        },
        { status: 400 }
      )
    }

    const { email, password } = validationResult.data

    // Recherche de l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    // Vérification si l'utilisateur existe
    if (!user) {
      logAction('User not found', { email })
      return NextResponse.json(
        { success: false, error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Vérification du mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      logAction('Invalid password', { email })
      return NextResponse.json(
        { success: false, error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Génération du token JWT
    const token = generateLoginToken(user.id, user.email, user.role, user.companyId)

    // Préparation de la réponse utilisateur (sans mot de passe)
    const nameParts = (user.name || '').split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    const userResponse = {
      id: user.id,
      firstName,
      lastName,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      companyId: user.companyId,
      createdAt: user.createdAt
    }

    logAction('Login successful', {
      userId: user.id,
      email: user.email
    })

    // Réponse de succès
    return NextResponse.json(
      {
        success: true,
        user: userResponse,
        token: token,
        expiresIn: '24h'
      },
      { status: 200 }
    )

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
  return NextResponse.json(
    { error: 'Méthode non autorisée' },
    { status: 405 }
  )
}

export async function PUT() {
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