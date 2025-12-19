import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { ExportService } from '@/lib/services/export-service'

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
  console.log(`[Reports Export API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Reports Export API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Reports Export API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// GET /api/reports/[id]/export/[format] - Exporter un rapport
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; format: string } }
) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Export - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Export - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Export - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('GET Export - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    // Extraction des paramètres
    const reportId = params.id
    const format = params.format as 'pdf' | 'excel' | 'csv'

    if (!reportId) {
      return NextResponse.json(
        { success: false, error: 'ID du rapport manquant' },
        { status: 400 }
      )
    }

    if (!['pdf', 'excel', 'csv'].includes(format)) {
      return NextResponse.json(
        { success: false, error: 'Format d\'export invalide (pdf, excel, csv)' },
        { status: 400 }
      )
    }

    logAction('GET Export', userId, { 
      userId, 
      reportId, 
      format 
    })

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
        },
        include: {
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
        logAction('GET Export - Report not found', userId, { reportId })
        return NextResponse.json(
          { success: false, error: 'Rapport non trouvé ou accès non autorisé' },
          { status: 404 }
        )
      }

      // Vérifier les permissions
      if (report.ownerId !== userId) {
        const share = await prisma.reportShare.findFirst({
          where: {
            reportId: reportId,
            sharedWith: userId,
            permission: 'view'
          }
        })

        if (!share) {
          return NextResponse.json(
            { success: false, error: 'Accès non autorisé pour l\'export' },
            { status: 403 }
          )
        }
      }

      // Vérifier que le rapport a des données à exporter
      if (!report.data) {
        return NextResponse.json(
          { success: false, error: 'Ce rapport ne contient pas de données à exporter' },
          { status: 400 }
        )
      }

      // Validation des données
      const reportData = report.data as any
      if (!ExportService.validateDataForExport(reportData)) {
        return NextResponse.json(
          { success: false, error: 'Données du rapport invalides pour l\'export' },
          { status: 400 }
        )
      }

      // Formatage des données
      const formattedData = ExportService.formatDataForExport(reportData)

      // Génération du fichier exporté
      let fileContent: Buffer | string
      let mimeType: string
      let fileName: string

      try {
        switch (format) {
          case 'pdf':
            fileContent = await ExportService.exportToPDF(formattedData, report.title)
            mimeType = ExportService.getMimeType('pdf')
            break

          case 'excel':
            fileContent = await ExportService.exportToExcel(formattedData, report.title)
            mimeType = ExportService.getMimeType('excel')
            break

          case 'csv':
            fileContent = await ExportService.exportToCSV(formattedData, report.title)
            mimeType = ExportService.getMimeType('csv')
            break

          default:
            throw new Error('Format non supporté')
        }

        // Génération du nom de fichier
        fileName = ExportService.generateFileName(report.title, format)

        logAction('GET Export - Success', userId, { 
          userId, 
          reportId,
          format,
          fileName,
          fileSize: typeof fileContent === 'string' ? fileContent.length : fileContent.length
        })

        // Réponse avec le fichier
        return new Response(fileContent as any, {
          status: 200,
          headers: {
            'Content-Type': mimeType,
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Content-Length': typeof fileContent === 'string' ? fileContent.length.toString() : fileContent.length.toString()
          }
        })

      } catch (exportError) {
        logAction('GET Export - Export generation error', userId, {
          reportId,
          format,
          error: exportError instanceof Error ? exportError.message : 'Unknown export error'
        })

        return NextResponse.json(
          { 
            success: false, 
            error: `Erreur lors de la génération du fichier ${format.toUpperCase()}: ${exportError instanceof Error ? exportError.message : 'Erreur inconnue'}` 
          },
          { status: 500 }
        )
      }

    } catch (dbError) {
      logAction('GET Export - Database error', userId, {
        reportId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération du rapport' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Export - Server error', userId, {
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
export async function POST() {
  return NextResponse.json(
    { error: 'Méthode non autorisée - Utilisez GET pour l\'export' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Méthode non autorisée - Utilisez GET pour l\'export' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Méthode non autorisée - Utilisez GET pour l\'export' },
    { status: 405 }
  )
}