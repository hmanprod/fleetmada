import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

// Interfaces
interface TokenPayload {
  userId: string
  email: string
  type: string
  iat: number
  exp?: number
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Reports Favorite API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Reports Favorite API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Reports Favorite API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// POST /api/reports/[id]/favorite - Basculer l'état favori d'un rapport
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('POST Favorite - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('POST Favorite - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('POST Favorite - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('POST Favorite - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    // Extraction des paramètres
    const reportId = params.id

    if (!reportId) {
      return NextResponse.json(
        { success: false, error: 'ID du rapport manquant' },
        { status: 400 }
      )
    }

    logAction('POST Favorite', userId, { userId, reportId })

    try {
      // Récupération du rapport
      const report = await prisma.report.findFirst({
        where: {
          id: reportId,
          OR: [
            { ownerId: userId },
            {
              shares: {
                some: {
                  sharedWith: userId,
                  permission: { in: ['view', 'edit'] }
                }
              }
            }
          ]
        }
      })

      if (!report) {
        logAction('POST Favorite - Report not found', userId, { reportId })
        return NextResponse.json(
          { success: false, error: 'Rapport non trouvé ou accès non autorisé' },
          { status: 404 }
        )
      }

      // Basculement de l'état favori
      const updatedReport = await prisma.report.update({
        where: {
          id: reportId,
          ownerId: userId // Seuls les propriétaires peuvent changer les favoris
        },
        data: {
          isFavorite: !report.isFavorite
        }
      })

      const response = {
        success: true,
        data: {
          reportId: updatedReport.id,
          isFavorite: updatedReport.isFavorite,
          message: updatedReport.isFavorite ? 'Ajouté aux favoris' : 'Retiré des favoris'
        }
      }

      logAction('POST Favorite - Success', userId, { 
        userId, 
        reportId,
        isFavorite: updatedReport.isFavorite
      })

      return NextResponse.json(response, { status: 200 })

    } catch (dbError) {
      logAction('POST Favorite - Database error', userId, {
        reportId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour des favoris' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('POST Favorite - Server error', userId, {
      reportId: params.id,
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
    { error: 'Méthode non autorisée - Utilisez POST pour gérer les favoris' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Méthode non autorisée - Utilisez POST pour gérer les favoris' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Méthode non autorisée - Utilisez POST pour gérer les favoris' },
    { status: 405 }
  )
}