import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

// Schéma de validation Zod
const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  firstName: z.string().min(1, 'Le prénom est requis').optional(),
  lastName: z.string().min(1, 'Le nom est requis').optional(),
  companyName: z.string().optional(),
  email: z.string().email('Format d\'email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  avatar: z.string().url('URL d\'avatar invalide').optional().or(z.literal(''))
}).refine(data => data.name || (data.firstName && data.lastName), {
  message: "Le nom complet ou le prénom+nom sont requis",
  path: ["name"]
});

interface RegisterRequest {
  name?: string
  firstName?: string
  lastName?: string
  companyName?: string
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

// Génération du token JWT de connexion (auto-login)
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

    const { name, firstName, lastName, companyName, email, password, avatar } = validationResult.data

    // Combiner prénom et nom si nécessaire
    const fullName = name || `${firstName} ${lastName}`;

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
        // Créer l'utilisateur (et l'entreprise si fournie)
        const user = await tx.user.create({
          data: {
            name: fullName.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            avatar: avatar?.trim() || null,
            ...(companyName && {
              company: {
                create: {
                  name: companyName.trim()
                }
              }
            })
          },
          include: {
            company: true
          }
        })

        return user
      })

      // Générer le token de confirmation
      const confirmationToken = generateConfirmationToken(newUser.id)

      // Générer le token d'authentification (auto-login)
      const authToken = generateLoginToken(newUser.id, newUser.email, newUser.role, newUser.companyId)

      // Préparer la réponse (sans mot de passe)
      const nameParts = (newUser.name || '').split(' ')
      const firstNameRes = nameParts[0] || ''
      const lastNameRes = nameParts.slice(1).join(' ') || ''

      const userResponse = {
        id: newUser.id,
        firstName: firstNameRes,
        lastName: lastNameRes,
        email: newUser.email,
        avatar: newUser.avatar,
        role: newUser.role,
        // companyId omitted to force onboarding flow
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
          message: 'Inscription réussie.',
          user: userResponse,
          token: authToken, // Token pour auto-login
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