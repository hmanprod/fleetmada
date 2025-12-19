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

interface ShareRequest {
  sharedWith: string
  permission: 'view' | 'edit'
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Reports Share API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Reports Share API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Reports Share API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// POST /api/reports/[id]/share - Partager un rapport
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('POST Share - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('POST Share - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('POST Share - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('POST Share - Missing user ID in token', 'unknown', {})
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

    // Extraction et validation du body
    const body: ShareRequest = await request.json()
    
    if (!body.sharedWith || !body.permission) {
      return NextResponse.json(
        { success: false, error: 'Destinataire et permission requis' },
        { status: 400 }
      )
    }

    if (!['view', 'edit'].includes(body.permission)) {
      return NextResponse.json(
        { success: false, error: 'Permission invalide (view ou edit)' },
        { status: 400 }
      )
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.sharedWith)) {
      return NextResponse.json(
        { success: false, error: 'Email invalide' },
        { status: 400 }
      )
    }

    logAction('POST Share', userId, { 
      userId, 
      reportId, 
      sharedWith: body.sharedWith, 
      permission: body.permission 
    })

    try {
      // Récupération du rapport
      const report = await prisma.report.findFirst({
        where: {
          id: reportId,
          ownerId: userId // Seul le propriétaire peut partager
        }
      })

      if (!report) {
        logAction('POST Share - Report not found or not owned', userId, { reportId })
        return NextResponse.json(
          { success: false, error: 'Rapport non trouvé ou vous n\'êtes pas autorisé à le partager' },
          { status: 404 }
        )
      }

      // Vérifier si le partage existe déjà
      const existingShare = await prisma.reportShare.findFirst({
        where: {
          reportId: reportId,
          sharedWith: body.sharedWith
        }
      })

      let shareRecord

      if (existingShare) {
        // Mise à jour du partage existant
        shareRecord = await prisma.reportShare.update({
          where: {
            id: existingShare.id
          },
          data: {
            permission: body.permission
          }
        })
      } else {
        // Création d'un nouveau partage
        shareRecord = await prisma.reportShare.create({
          data: {
            reportId: reportId,
            sharedWith: body.sharedWith,
            permission: body.permission
          }
        })
      }

      const response = {
        success: true,
        data: {
          shareId: shareRecord.id,
          reportId: shareRecord.reportId,
          sharedWith: shareRecord.sharedWith,
          permission: shareRecord.permission,
          createdAt: shareRecord.createdAt,
          message: existingShare ? 'Partage mis à jour' : 'Rapport partagé avec succès'
        }
      }

      logAction('POST Share - Success', userId, { 
        userId, 
        reportId,
        sharedWith: body.sharedWith,
        permission: body.permission,
        isUpdate: !!existingShare
      })

      return NextResponse.json(response, { status: existingShare ? 200 : 201 })

    } catch (dbError) {
      logAction('POST Share - Database error', userId, {
        reportId,
        sharedWith: body.sharedWith,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors du partage du rapport' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('POST Share - Server error', userId, {
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

// GET /api/reports/[id]/share - Récupérer les partages d'un rapport
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Share - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Share - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Share - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('GET Share - Missing user ID in token', 'unknown', {})
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

    logAction('GET Share', userId, { userId, reportId })

    try {
      // Récupération du rapport et de ses partages
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
        },
        include: {
          shares: {
            select: {
              id: true,
              sharedWith: true,
              permission: true,
              createdAt: true
            }
          },
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      if (!report) {
        logAction('GET Share - Report not found', userId, { reportId })
        return NextResponse.json(
          { success: false, error: 'Rapport non trouvé ou accès non autorisé' },
          { status: 404 }
        )
      }

      const response = {
        success: true,
        data: {
          report: {
            id: report.id,
            title: report.title,
            description: report.description,
            owner: report.owner,
            isOwner: report.ownerId === userId
          },
          shares: report.shares,
          totalShares: report.shares.length
        }
      }

      logAction('GET Share - Success', userId, { 
        userId, 
        reportId,
        sharesCount: report.shares.length
      })

      return NextResponse.json(response, { status: 200 })

    } catch (dbError) {
      logAction('GET Share - Database error', userId, {
        reportId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des partages' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Share - Server error', userId, {
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

// DELETE /api/reports/[id]/share - Supprimer un partage
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('DELETE Share - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('DELETE Share - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('DELETE Share - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('DELETE Share - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    // Extraction des paramètres
    const reportId = params.id
    const { searchParams } = new URL(request.url)
    const sharedWith = searchParams.get('sharedWith')

    if (!reportId || !sharedWith) {
      return NextResponse.json(
        { success: false, error: 'ID du rapport et email du destinataire requis' },
        { status: 400 }
      )
    }

    logAction('DELETE Share', userId, { userId, reportId, sharedWith })

    try {
      // Vérifier que le rapport appartient à l'utilisateur
      const report = await prisma.report.findFirst({
        where: {
          id: reportId,
          ownerId: userId
        }
      })

      if (!report) {
        return NextResponse.json(
          { success: false, error: 'Rapport non trouvé ou vous n\'êtes pas autorisé' },
          { status: 404 }
        )
      }

      // Supprimer le partage
      const deletedShare = await prisma.reportShare.deleteMany({
        where: {
          reportId: reportId,
          sharedWith: sharedWith
        }
      })

      const response = {
        success: true,
        data: {
          message: 'Partage supprimé avec succès',
          deletedCount: deletedShare.count
        }
      }

      logAction('DELETE Share - Success', userId, { 
        userId, 
        reportId,
        sharedWith,
        deletedCount: deletedShare.count
      })

      return NextResponse.json(response, { status: 200 })

    } catch (dbError) {
      logAction('DELETE Share - Database error', userId, {
        reportId,
        sharedWith,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression du partage' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('DELETE Share - Server error', userId, {
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
export async function PUT() {
  return NextResponse.json(
    { error: 'Méthode non autorisée' },
    { status: 405 }
  )
}