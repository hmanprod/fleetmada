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

// Schémas de validation
const InspectionResultsSubmitSchema = z.object({
  results: z.array(z.object({
    inspectionItemId: z.string().min(1, 'ID de l\'élément requis'),
    resultValue: z.string().min(1, 'Valeur de résultat requise'),
    isCompliant: z.boolean(),
    notes: z.string().optional(),
    imageUrl: z.string().url().optional()
  })).min(1, 'Au moins un résultat requis')
})

// Types TypeScript
type SubmitResultsInput = z.infer<typeof InspectionResultsSubmitSchema>

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Inspection Results API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Inspection Results API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Inspection Results API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// GET /api/inspections/[id]/results - Liste des résultats d'une inspection
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Results - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Results - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Results - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const inspectionId = params.id

    if (!userId) {
      logAction('GET Results - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    if (!inspectionId) {
      logAction('GET Results - Missing inspection ID', userId, {})
      return NextResponse.json(
        { success: false, error: 'ID de l\'inspection manquant' },
        { status: 400 }
      )
    }

    logAction('GET Results', userId, { inspectionId })

    try {
      // Vérifier que l'inspection existe et appartient à l'utilisateur
      const inspection = await prisma.inspection.findFirst({
        where: {
          id: inspectionId,
          userId
        }
      })

      if (!inspection) {
        logAction('GET Results - Inspection not found', userId, { inspectionId })
        return NextResponse.json(
          { success: false, error: 'Inspection non trouvée' },
          { status: 404 }
        )
      }

      // Récupérer les résultats avec les éléments d'inspection
      const results = await prisma.inspectionResult.findMany({
        where: {
          inspectionId
        },
        include: {
          inspectionItem: {
            select: {
              id: true,
              name: true,
              category: true,
              isRequired: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      logAction('GET Results - Success', userId, { 
        inspectionId,
        resultsCount: results.length
      })

      return NextResponse.json(
        {
          success: true,
          data: results
        },
        { status: 200 }
      )

    } catch (dbError) {
      logAction('GET Results - Database error', userId, {
        inspectionId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des résultats' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Results - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// POST /api/inspections/[id]/results - Soumettre les résultats d'une inspection
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('POST Results - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('POST Results - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('POST Results - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const inspectionId = params.id

    if (!userId) {
      logAction('POST Results - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    if (!inspectionId) {
      logAction('POST Results - Missing inspection ID', userId, {})
      return NextResponse.json(
        { success: false, error: 'ID de l\'inspection manquant' },
        { status: 400 }
      )
    }

    // Extraction et validation des données
    const body = await request.json()
    const resultsData = InspectionResultsSubmitSchema.parse(body)

    logAction('POST Results', userId, { 
      inspectionId,
      resultsCount: resultsData.results.length
    })

    try {
      // Vérifier que l'inspection existe et appartient à l'utilisateur
      const inspection = await prisma.inspection.findFirst({
        where: {
          id: inspectionId,
          userId
        }
      })

      if (!inspection) {
        logAction('POST Results - Inspection not found', userId, { inspectionId })
        return NextResponse.json(
          { success: false, error: 'Inspection non trouvée' },
          { status: 404 }
        )
      }

      // Vérifier que l'inspection est en cours ou planifiée
      if (inspection.status === 'COMPLETED' || inspection.status === 'CANCELLED') {
        logAction('POST Results - Cannot submit results for completed/cancelled inspection', userId, { 
          inspectionId,
          status: inspection.status
        })
        return NextResponse.json(
          { success: false, error: 'Impossible de soumettre des résultats pour une inspection complétée ou annulée' },
          { status: 400 }
        )
      }

      // Soumettre les résultats en transaction
      const submittedResults = await prisma.$transaction(async (tx) => {
        // Supprimer les résultats existants pour cette inspection
        await tx.inspectionResult.deleteMany({
          where: { inspectionId }
        })

        // Créer les nouveaux résultats
        const results = await Promise.all(
          resultsData.results.map(resultData => 
            tx.inspectionResult.create({
              data: {
                inspectionId,
                inspectionItemId: resultData.inspectionItemId,
                resultValue: resultData.resultValue,
                isCompliant: resultData.isCompliant,
                notes: resultData.notes,
                imageUrl: resultData.imageUrl
              },
              include: {
                inspectionItem: {
                  select: {
                    id: true,
                    name: true,
                    category: true,
                    isRequired: true
                  }
                }
              }
            })
          )
        )

        // Calculer le score global et le statut de conformité
        const compliantResults = results.filter(r => r.isCompliant).length
        const totalResults = results.length
        const overallScore = totalResults > 0 ? (compliantResults / totalResults) * 100 : 0
        
        // Déterminer le statut de conformité (seuil de 80%)
        const complianceStatus = overallScore >= 80 ? 'COMPLIANT' : 'NON_COMPLIANT'

        // Mettre à jour l'inspection avec les résultats
        await tx.inspection.update({
          where: { id: inspectionId },
          data: {
            overallScore,
            complianceStatus,
            status: 'COMPLETED',
            completedAt: new Date(),
            updatedAt: new Date()
          }
        })

        return results
      })

      logAction('POST Results - Success', userId, { 
        inspectionId,
        resultsCount: submittedResults.length,
        overallScore: submittedResults.length > 0 ? 
          Math.round((submittedResults.filter(r => r.isCompliant).length / submittedResults.length) * 100) : 0
      })

      return NextResponse.json(
        {
          success: true,
          data: submittedResults,
          message: 'Résultats soumis avec succès'
        },
        { status: 201 }
      )

    } catch (dbError) {
      logAction('POST Results - Database error', userId, {
        inspectionId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la soumission des résultats' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    
    // Gestion des erreurs de validation
    if (error instanceof Error && error.name === 'ZodError') {
      logAction('POST Results - Validation error', userId, {
        error: error.message
      })

      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.message },
        { status: 400 }
      )
    }

    logAction('POST Results - Server error', userId, {
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
