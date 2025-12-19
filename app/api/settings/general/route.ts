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

// Schéma de validation Zod pour les paramètres généraux
const generalSettingsSchema = z.object({
  name: z.string().min(1, 'Le nom de l\'entreprise est requis'),
  address: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
  logo: z.string().url('URL du logo invalide').optional().or(z.literal('')),
  fiscalYear: z.string().default('jan-dec'),
  currency: z.string().default('EUR'),
  timezone: z.string().default('UTC'),
  dateFormat: z.string().default('DD/MM/YYYY'),
  numberFormat: z.string().default('1,234.56'),
  fuelUnit: z.string().default('L'),
  distanceUnit: z.string().default('KM'),
  timeFormat: z.string().default('24'),
  industry: z.string().optional(),
  laborTaxExempt: z.boolean().default(false),
  secondaryTax: z.boolean().default(false),
  defaultTax1: z.string().optional(),
  defaultTax2: z.string().optional(),
  defaultTaxType: z.string().default('percentage')
})

interface GeneralSettingsRequest {
  name?: string
  address?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  phone?: string
  email?: string
  website?: string
  logo?: string
  fiscalYear?: string
  currency?: string
  timezone?: string
  dateFormat?: string
  numberFormat?: string
  fuelUnit?: string
  distanceUnit?: string
  timeFormat?: string
  industry?: string
  laborTaxExempt?: boolean
  secondaryTax?: boolean
  defaultTax1?: string
  defaultTax2?: string
  defaultTaxType?: string
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Settings General API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Settings General API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Settings General API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// GET /api/settings/general - Récupérer les paramètres généraux
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET General Settings - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET General Settings - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET General Settings - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('GET General Settings - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    logAction('GET General Settings', userId, { userId })

    // Récupération de l'utilisateur avec sa company
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: {
          include: {
            settings: true
          }
        }
      }
    })

    if (!user) {
      logAction('GET General Settings - User not found', userId, { userId })
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Récupération des paramètres généraux
    let companySettings: any = null
    if (user.companyId) {
      companySettings = await prisma.companySettings.findUnique({
        where: { companyId: user.companyId }
      })
    }

    // Si aucun paramètre n'existe, créer des paramètres par défaut
    if (!companySettings && user.companyId) {
      companySettings = await prisma.companySettings.create({
        data: {
          companyId: user.companyId,
          name: user.company?.name || '',
          country: 'Madagascar',
          city: 'Antananarivo',
          state: 'Analamanga',
          industry: 'Transport & Logistique',
          fiscalYear: 'jan-dec',
          currency: 'EUR',
          timezone: 'UTC',
          dateFormat: 'DD/MM/YYYY',
          numberFormat: '1,234.56',
          fuelUnit: 'L',
          distanceUnit: 'KM',
          timeFormat: '24',
          laborTaxExempt: false,
          secondaryTax: false,
          defaultTaxType: 'percentage'
        }
      })
    }

    logAction('GET General Settings - Success', userId, { 
      userId, 
      companyId: user.companyId,
      hasSettings: !!companySettings 
    })

    return NextResponse.json(
      {
        success: true,
        data: companySettings || null,
        company: user.company
      },
      { status: 200 }
    )

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET General Settings - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// PUT /api/settings/general - Mettre à jour les paramètres généraux
export async function PUT(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('PUT General Settings - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('PUT General Settings - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('PUT General Settings - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('PUT General Settings - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    logAction('PUT General Settings', userId, { userId })

    // Parse et validation du body JSON
    let body: GeneralSettingsRequest
    try {
      body = await request.json()
    } catch (error) {
      logAction('PUT General Settings - Invalid JSON', userId, { error: error instanceof Error ? error.message : 'Unknown error' })
      return NextResponse.json(
        { success: false, error: 'Format JSON invalide' },
        { status: 400 }
      )
    }

    // Validation avec Zod
    const validationResult = generalSettingsSchema.safeParse(body)
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))

      logAction('PUT General Settings - Validation failed', userId, { errors })
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

    // Récupération de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    })

    if (!user) {
      logAction('PUT General Settings - User not found', userId, { userId })
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    if (!user.companyId) {
      logAction('PUT General Settings - User has no company', userId, { userId })
      return NextResponse.json(
        { success: false, error: 'Utilisateur sans entreprise' },
        { status: 400 }
      )
    }

    const companyId = user.companyId

    // Mise à jour des paramètres en transaction
    try {
      const updatedSettings = await prisma.$transaction(async (tx) => {
        // Mise à jour des paramètres de l'entreprise
        const companyId = user.companyId!
        const settings = await tx.companySettings.upsert({
          where: { companyId },
          update: {
            ...updateData,
            updatedAt: new Date()
          },
          create: {
            companyId,
            ...updateData
          }
        })

        // Mise à jour des informations de l'entreprise si nécessaire
        if (user.companyId && (updateData.name || updateData.address || updateData.phone || updateData.website)) {
          await tx.company.update({
            where: { id: user.companyId },
            data: {
              name: updateData.name || user.company?.name,
              address: updateData.address || user.company?.address,
              phone: updateData.phone || user.company?.phone,
              website: updateData.website || user.company?.website,
              updatedAt: new Date()
            }
          })
        }

        // Log de l'action
        console.log(`[Settings General API] ${new Date().toISOString()} - General settings updated - User: ${userId}:`, {
          updatedFields: Object.keys(updateData),
          companyId: user.companyId,
          timestamp: new Date().toISOString()
        })

        return settings
      })

      logAction('PUT General Settings - Success', userId, {
        userId,
        companyId: user.companyId,
        updatedFields: Object.keys(updateData)
      })

      return NextResponse.json(
        {
          success: true,
          data: updatedSettings,
          message: 'Paramètres généraux mis à jour avec succès'
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('PUT General Settings - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour des paramètres' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('PUT General Settings - Server error', userId, {
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