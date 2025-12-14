import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

// Schéma de validation Zod
const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Format d\'email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  avatar: z.string().url('URL d\'avatar invalide').optional().or(z.literal(''))
})

interface RegisterRequest {
  name: string
  email: string
  password: string
  avatar?: string
}

// Génération du token JWT de confirmation
const generateConfirmationToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key'
  return jwt.sign(
    { userId, type: 'confirmation' },
    secret,
    { expiresIn: '24h' }
  )
}

// Fonction de logging
const logAction = (action: string, details: any) => {
  console.log(`[Register API] ${new Date().toISOString()} - ${action}:`, details)
}

export async function POST(request: NextRequest) {
  try {
    logAction('Registration attempt', { timestamp: new Date().toISOString() })

    // Parse et validation du body JSON
    let body: RegisterRequest
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
    const validationResult = registerSchema.safeParse(body)
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

    const { name, email, password, avatar } = validationResult.data

    // Vérification si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      logAction('Email already exists', { email })
      return NextResponse.json(
        { success: false, error: 'Cet email est déjà utilisé' },
        { status: 409 }
      )
    }

    // Hachage du mot de passe
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Création de l'utilisateur dans une transaction
    try {
      const newUser = await prisma.$transaction(async (tx) => {
        // Créer l'utilisateur
        const user = await tx.user.create({
          data: {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            avatar: avatar?.trim() || null
          }
        })

        return user
      })

      // Générer le token de confirmation
      const confirmationToken = generateConfirmationToken(newUser.id)

      // Préparer la réponse (sans mot de passe)
      const userResponse = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        createdAt: newUser.createdAt
      }

      logAction('User created successfully', { 
        userId: newUser.id, 
        email: newUser.email 
      })

      // Réponse de succès
      return NextResponse.json(
        {
          success: true,
          message: 'Inscription réussie. Veuillez vérifier votre email pour confirmer votre compte.',
          user: userResponse,
          confirmationToken: confirmationToken // En développement seulement
        },
        { status: 201 }
      )

    } catch (dbError) {
      logAction('Database error', { 
        error: dbError instanceof Error ? dbError.message : 'Unknown database error' 
      })
      
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création du compte' },
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