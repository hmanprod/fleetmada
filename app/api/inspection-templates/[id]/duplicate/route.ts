import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import jwt from 'jsonwebtoken'

// Interface pour les données du token JWT décodé
interface TokenPayload {
  userId: string
  email: string
  type: string
  iat: number
  exp?: number
}

// Schéma de validation
const DuplicateTemplateSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(255, 'Nom trop long')
})

// Types TypeScript
type DuplicateTemplateInput = z.infer<typeof DuplicateTemplateSchema>

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Template Duplicate API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Template Duplicate API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Template Duplicate API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// POST /api/inspection-templates/[id]/duplicate - Dupliquer un modèle d'inspection
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('DUPLICATE - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('DUPLICATE - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('DUPLICATE - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const templateId = params.id

    if (!userId) {
      logAction('DUPLICATE - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    if (!templateId) {
      logAction('DUPLICATE - Missing template ID', userId, {})
      return NextResponse.json(
        { success: false, error: 'ID du modèle manquant' },
        { status: 400 }
      )
    }

    // Extraction et validation des données
    const body = await request.json()
    const duplicateData = DuplicateTemplateSchema.parse(body)

    logAction('DUPLICATE', userId, { 
      templateId,
      newName: duplicateData.name
    })

    try {
      // Vérifier que le template original existe
      const originalTemplate = await prisma.inspectionTemplate.findUnique({
        where: {
          id: templateId
        },
        include: {
          items: {
            orderBy: {
              sortOrder: 'asc'
            }
          }
        }
      })

      if (!originalTemplate) {
        logAction('DUPLICATE - Template not found', userId, { templateId })
        return NextResponse.json(
          { success: false, error: 'Modèle d\'inspection non trouvé' },
          { status: 404 }
        )
      }

      // Vérifier qu'un template avec le nouveau nom n'existe pas déjà
      const existingTemplate = await prisma.inspectionTemplate.findFirst({
        where: {
          name: duplicateData.name,
          isActive: true
        }
      })

      if (existingTemplate) {
        logAction('DUPLICATE - Template name already exists', userId, {
          name: duplicateData.name
        })

        return NextResponse.json(
          { success: false, error: 'Un modèle d\'inspection avec ce nom existe déjà' },
          { status: 409 }
        )
      }

      // Dupliquer le template en transaction
      const duplicatedTemplate = await prisma.$transaction(async (tx) => {
        // Créer le nouveau template
        const newTemplate = await tx.inspectionTemplate.create({
          data: {
            name: duplicateData.name,
            description: originalTemplate.description,
            category: originalTemplate.category,
            isActive: originalTemplate.isActive
          }
        })

        // Créer les éléments du template dupliqués
        const templateItems = await Promise.all(
          originalTemplate.items.map((originalItem, index) =>
            tx.inspectionTemplateItem.create({
              data: {
                inspectionTemplateId: newTemplate.id,
                name: originalItem.name,
                description: originalItem.description,
                category: originalItem.category,
                isRequired: originalItem.isRequired,
                sortOrder: index
              }
            })
          )
        )

        return {
          ...newTemplate,
          items: templateItems
        }
      })

      logAction('DUPLICATE - Success', userId, { 
        originalTemplateId: templateId,
        newTemplateId: duplicatedTemplate.id,
        itemsCount: duplicatedTemplate.items.length
      })

      return NextResponse.json(
        {
          success: true,
          data: duplicatedTemplate,
          message: 'Modèle d\'inspection dupliqué avec succès'
        },
        { status: 201 }
      )

    } catch (dbError) {
      logAction('DUPLICATE - Database error', userId, {
        templateId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la duplication du modèle' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    
    // Gestion des erreurs de validation
    if (error instanceof Error && error.name === 'ZodError') {
      logAction('DUPLICATE - Validation error', userId, {
        error: error.message
      })

      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.message },
        { status: 400 }
      )
    }

    logAction('DUPLICATE - Server error', userId, {
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
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Méthode GET non supportée. Utilisez POST pour dupliquer le modèle' },
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
