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

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Template Items API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Template Items API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Template Items API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// GET /api/inspection-templates/[id]/items - Liste des éléments d'un modèle d'inspection
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Items - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Items - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Items - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const templateId = params.id

    if (!userId) {
      logAction('GET Items - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    if (!templateId) {
      logAction('GET Items - Missing template ID', userId, {})
      return NextResponse.json(
        { success: false, error: 'ID du modèle manquant' },
        { status: 400 }
      )
    }

    logAction('GET Items', userId, { templateId })

    try {
      // Vérifier que le template existe
      const template = await prisma.inspectionTemplate.findUnique({
        where: {
          id: templateId
        },
        select: {
          id: true,
          name: true
        }
      })

      if (!template) {
        logAction('GET Items - Template not found', userId, { templateId })
        return NextResponse.json(
          { success: false, error: 'Modèle d\'inspection non trouvé' },
          { status: 404 }
        )
      }

      // Récupérer les éléments du template
      const items = await prisma.inspectionTemplateItem.findMany({
        where: {
          inspectionTemplateId: templateId
        },
        orderBy: {
          sortOrder: 'asc'
        }
      })

      logAction('GET Items - Success', userId, { 
        templateId,
        itemsCount: items.length
      })

      return NextResponse.json(
        {
          success: true,
          data: items
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('GET Items - Database error', userId, {
        templateId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des éléments du modèle' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Items - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// Gestion des autres méthodes
export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Méthode POST non supportée' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Méthode PUT non supportée' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Méthode DELETE non supportée' },
    { status: 405 }
  )
}
