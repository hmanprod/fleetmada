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

// Schéma de validation Zod pour les informations d'entreprise
const companyInfoSchema = z.object({
  name: z.string()
    .min(2, 'Le nom de l\'entreprise doit contenir au moins 2 caractères')
    .max(100, 'Le nom de l\'entreprise ne peut pas dépasser 100 caractères')
    .optional(),
  address: z.string()
    .max(500, 'L\'adresse ne peut pas dépasser 500 caractères')
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .max(20, 'Le numéro de téléphone ne peut pas dépasser 20 caractères')
    .optional()
    .or(z.literal('')),
  website: z.string()
    .url('URL du site web invalide')
    .max(200, 'L\'URL ne peut pas dépasser 200 caractères')
    .optional()
    .or(z.literal('')),
  description: z.string()
    .max(1000, 'La description ne peut pas dépasser 1000 caractères')
    .optional()
    .or(z.literal('')),
  taxId: z.string()
    .max(50, 'Le numéro fiscal ne peut pas dépasser 50 caractères')
    .optional()
    .or(z.literal('')),
  employees: z.number()
    .int('Le nombre d\'employés doit être un nombre entier')
    .min(1, 'Le nombre d\'employés doit être au moins 1')
    .max(100000, 'Le nombre d\'employés ne peut pas dépasser 100000')
    .optional(),
  fleetSize: z.union([z.number(), z.string()])
    .optional()
})

interface CompanyInfoRequest {
  name: string
  address?: string
  phone?: string
  website?: string
  description?: string
  taxId?: string
  employees?: number
  fleetSize?: number | string
  industry?: string
  objectives?: string[]
}


// Interface pour la réponse des informations d'entreprise
interface CompanyInfoResponse {
  id: string
  name: string
  address?: string | null
  phone?: string | null
  website?: string | null
  description?: string | null
  taxId?: string | null
  employees?: number | null
  fleetSize?: number | null
  createdAt: Date
  updatedAt: Date
  usersCount?: number
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Onboarding Company API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction pour préparer la réponse des informations d'entreprise
const prepareCompanyResponse = (company: any): CompanyInfoResponse => {
  return {
    id: company.id,
    name: company.name || '',
    address: company.address || null,
    phone: company.phone || null,
    website: company.website || null,
    description: company.description || null,
    taxId: company.taxId || null,
    employees: company.employees || null,
    fleetSize: company.fleetSize || null,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
    usersCount: company.users ? company.users.length : undefined
  }
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    // Vérifier que c'est un token de connexion
    if (decoded.type !== 'login') {
      console.log('[Onboarding Company API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Onboarding Company API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction pour valider le format du téléphone
const validatePhoneFormat = (phone: string): boolean => {
  if (!phone) return true
  // Expression régulière simple pour validation du téléphone
  const phoneRegex = /^[+]?[\d\s\-\(\)]{8,20}$/
  return phoneRegex.test(phone.trim())
}

// Fonction pour valider l'URL du site web
const validateWebsiteUrl = (website: string): boolean => {
  if (!website) return true
  try {
    const url = new URL(website.startsWith('http') ? website : `https://${website}`)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

// GET /api/onboarding/company - Récupérer les informations d'entreprise
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Company Info - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Company Info - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Company Info - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('GET Company Info - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    logAction('GET Company Info', userId, { userId })

    // Récupération de l'utilisateur avec ses informations d'entreprise
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: {
          include: {
            users: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      logAction('GET Company Info - User not found', userId, { userId })
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Si l'utilisateur n'a pas encore d'entreprise associée
    if (!user.company) {
      logAction('GET Company Info - No company found for user', userId, { userId })
      return NextResponse.json(
        {
          success: true,
          company: null,
          message: 'Aucune entreprise associée à cet utilisateur. Utilisez PUT pour créer une entreprise.'
        },
        { status: 200 }
      )
    }

    // Préparation de la réponse
    const companyResponse = prepareCompanyResponse(user.company)

    logAction('GET Company Info - Success', userId, {
      userId,
      companyId: user.company.id
    })

    return NextResponse.json(
      {
        success: true,
        company: companyResponse
      },
      { status: 200 }
    )

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Company Info - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// PUT /api/onboarding/company - Créer ou mettre à jour les informations d'entreprise
export async function PUT(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('PUT Company Info - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('PUT Company Info - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('PUT Company Info - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('PUT Company Info - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    logAction('PUT Company Info', userId, { userId })

    // Parse et validation du body JSON
    let body: CompanyInfoRequest
    try {
      body = await request.json()
    } catch (error) {
      logAction('PUT Company Info - Invalid JSON', userId, { error: error instanceof Error ? error.message : 'Unknown error' })
      return NextResponse.json(
        { success: false, error: 'Format JSON invalide' },
        { status: 400 }
      )
    }

    // Validation avec Zod
    const validationResult = companyInfoSchema.safeParse(body)
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))

      logAction('PUT Company Info - Validation failed', userId, { errors })
      return NextResponse.json(
        {
          success: false,
          error: 'Données invalides',
          details: errors
        },
        { status: 400 }
      )
    }

    const companyData = validationResult.data

    // Validation supplémentaire des formats
    if (companyData.phone && !validatePhoneFormat(companyData.phone)) {
      logAction('PUT Company Info - Invalid phone format', userId, { phone: companyData.phone })
      return NextResponse.json(
        { success: false, error: 'Format de numéro de téléphone invalide' },
        { status: 400 }
      )
    }

    if (companyData.website && !validateWebsiteUrl(companyData.website)) {
      logAction('PUT Company Info - Invalid website URL', userId, { website: companyData.website })
      return NextResponse.json(
        { success: false, error: 'URL du site web invalide' },
        { status: 400 }
      )
    }

    // Récupération de l'utilisateur actuel
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    })

    if (!currentUser) {
      logAction('PUT Company Info - User not found', userId, { userId })
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Préparation des données de l'entreprise
    const dataToUpdate: any = {
      name: companyData.name?.trim(),
      address: companyData.address?.trim() || null,
      phone: companyData.phone?.trim() || null,
      website: companyData.website?.trim() || null,
      description: companyData.description?.trim() || null,
      taxId: companyData.taxId?.trim() || null,
      employees: companyData.employees,
      // Gerer fleetSize qui peut être string ou number
      fleetSize: typeof companyData.fleetSize === 'string' ? undefined : companyData.fleetSize,
      updatedAt: new Date()
    }

    // Gestion de 'name' qui est maintenant optionnel
    if (companyData.name) {
      dataToUpdate.name = companyData.name.trim()
    }

    // Mise à jour dans une transaction
    try {
      const result = await prisma.$transaction(async (tx) => {
        let company: any

        if (currentUser.company) {
          // Mise à jour de l'entreprise existante
          company = await tx.company.update({
            where: { id: currentUser.company.id },
            data: dataToUpdate,
            include: {
              users: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          })

          logAction('PUT Company Info - Company updated', userId, {
            companyId: company.id,
            updatedFields: Object.keys(dataToUpdate)
          })
        } else {
          // Si le nom est manquant pour la création, utiliser un nom par défaut unique
          if (!dataToUpdate.name) {
            dataToUpdate.name = `Flotte de ${currentUser.name || 'Nouveau'} (${userId.slice(-4)})`
          }

          // Création d'une nouvelle entreprise
          company = await tx.company.create({
            data: {
              ...dataToUpdate,
              users: {
                connect: {
                  id: userId
                }
              }
            },
            include: {
              users: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          })

          logAction('PUT Company Info - Company created', userId, {
            companyId: company.id
          })
        }

        return company
      })

      // Préparation de la réponse
      const companyResponse = prepareCompanyResponse(result)

      const action = currentUser.company ? 'mise à jour' : 'création'
      logAction('PUT Company Info - Success', userId, {
        userId,
        companyId: result.id,
        action
      })

      return NextResponse.json(
        {
          success: true,
          company: companyResponse,
          message: `Entreprise ${action}ée avec succès`
        },
        { status: 200 }
      )

    } catch (dbError) {
      // Gestion des erreurs Prisma spécifiques
      if (dbError instanceof Error) {
        if (dbError.message.includes('Unique constraint')) {
          logAction('PUT Company Info - Company name already exists', userId, {
            error: dbError.message
          })
          return NextResponse.json(
            { success: false, error: 'Une entreprise avec ce nom existe déjà' },
            { status: 409 }
          )
        }
      }

      logAction('PUT Company Info - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour des informations d\'entreprise' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('PUT Company Info - Server error', userId, {
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