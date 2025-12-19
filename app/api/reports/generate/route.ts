import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { ReportGeneratorService } from '@/lib/services/report-generator'
import { ReportConfig } from '@/types/reports'

// Interfaces
interface TokenPayload {
  userId: string
  email: string
  type: string
  iat: number
  exp?: number
}

interface GenerateReportRequest {
  template: string
  config: ReportConfig
  save?: boolean
  title?: string
  description?: string
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Reports Generate API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Reports Generate API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Reports Generate API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// POST /api/reports/generate - Générer un rapport
export async function POST(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('POST Generate - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('POST Generate - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('POST Generate - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('POST Generate - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    // Extraction et validation du body
    const body: GenerateReportRequest = await request.json()
    
    if (!body.template || !body.config) {
      return NextResponse.json(
        { success: false, error: 'Template et configuration requis' },
        { status: 400 }
      )
    }

    // Validation de la configuration
    if (!body.config.dateRange?.start || !body.config.dateRange?.end) {
      return NextResponse.json(
        { success: false, error: 'Période de dates requise dans la configuration' },
        { status: 400 }
      )
    }

    logAction('POST Generate', userId, { 
      userId, 
      template: body.template,
      save: body.save,
      title: body.title
    })

    try {
      // Génération du rapport
      const reportData = await ReportGeneratorService.generateReport(
        body.template,
        body.config,
        userId
      )

      // Si save=true, sauvegarder le rapport généré
      let savedReport: any = null
      if (body.save && body.title) {
        savedReport = await prisma.report.create({
          data: {
            title: body.title,
            description: body.description || `Rapport ${body.template} généré`,
            type: 'STANDARD',
            category: getCategoryForTemplate(body.template),
            template: body.template,
            config: body.config as any,
            data: reportData as any,
            isPublic: false,
            isFavorite: false,
            isSaved: true,
            ownerId: userId,
            companyId: null
          }
        })
      }

      const response = {
        success: true,
        data: {
          reportData,
          savedReport: savedReport ? {
            id: savedReport.id,
            title: savedReport.title,
            description: savedReport.description,
            template: savedReport.template,
            createdAt: savedReport.createdAt
          } : null,
          generatedAt: new Date().toISOString()
        }
      }

      logAction('POST Generate - Success', userId, { 
        userId, 
        template: body.template,
        saved: !!savedReport,
        totalRecords: reportData.metadata.totalRecords
      })

      return NextResponse.json(response, { status: 200 })

    } catch (generationError) {
      logAction('POST Generate - Generation error', userId, {
        template: body.template,
        error: generationError instanceof Error ? generationError.message : 'Unknown generation error'
      })

      return NextResponse.json(
        { 
          success: false, 
          error: `Erreur lors de la génération du rapport: ${generationError instanceof Error ? generationError.message : 'Erreur inconnue'}` 
        },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('POST Generate - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// GET /api/reports/generate - Obtenir les templates disponibles
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Templates - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Templates - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Templates - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('GET Templates - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    logAction('GET Templates', userId, { userId })

    try {
      // Import dynamique des templates
      const { REPORT_TEMPLATES } = await import('@/types/reports')
      
      // Regroupement des templates par catégorie
      const templatesByCategory = REPORT_TEMPLATES.reduce((acc: any, template) => {
        if (!acc[template.category]) {
          acc[template.category] = []
        }
        acc[template.category].push({
          id: template.id,
          name: template.name,
          description: template.description,
          template: template.template,
          config: template.config
        })
        return acc
      }, {})

      // Statistiques des templates
      const stats = {
        total: REPORT_TEMPLATES.length,
        byCategory: Object.keys(templatesByCategory).map(category => ({
          category,
          count: templatesByCategory[category].length
        }))
      }

      const response = {
        success: true,
        data: {
          templates: templatesByCategory,
          stats,
          categories: Object.keys(templatesByCategory)
        }
      }

      logAction('GET Templates - Success', userId, { 
        userId, 
        total: REPORT_TEMPLATES.length,
        categories: Object.keys(templatesByCategory).length
      })

      return NextResponse.json(response, { status: 200 })

    } catch (dbError) {
      logAction('GET Templates - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des templates' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Templates - Server error', userId, {
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

export async function DELETE() {
  return NextResponse.json(
    { error: 'Méthode non autorisée' },
    { status: 405 }
  )
}

// Méthode utilitaire pour déterminer la catégorie d'un template
function getCategoryForTemplate(template: string): string {
  const categoryMap: Record<string, string> = {
    'vehicle-cost-comparison': 'Vehicles',
    'vehicle-cost-meter-trend': 'Vehicles',
    'vehicle-expense-summary': 'Vehicles',
    'vehicle-expenses-vehicle': 'Vehicles',
    'vehicle-group-changes': 'Vehicles',
    'vehicle-status-changes': 'Vehicles',
    'vehicle-utilization-summary': 'Vehicles',
    'vehicle-meter-history': 'Vehicles',
    'vehicle-list': 'Vehicles',
    'vehicle-profitability': 'Vehicles',
    'vehicle-summary': 'Vehicles',
    'vehicle-fuel-economy': 'Vehicles',
    'vehicle-replacement-analysis': 'Vehicles',
    'vehicle-costs-vs-budget': 'Vehicles',
    'service-maintenance-categorization': 'Service',
    'service-entries-summary': 'Service',
    'service-history-by-vehicle': 'Service',
    'service-reminder-compliance': 'Service',
    'service-cost-summary': 'Service',
    'service-provider-performance': 'Service',
    'service-labor-vs-parts': 'Service',
    'service-work-order-summary': 'Service',
    'fuel-entries-by-vehicle': 'Fuel',
    'fuel-summary': 'Fuel',
    'fuel-summary-by-location': 'Fuel',
    'issues-faults-summary': 'Issues',
    'issues-list': 'Issues',
    'inspection-failures': 'Inspections',
    'inspection-schedules': 'Inspections',
    'inspection-submissions': 'Inspections',
    'inspection-summary': 'Inspections',
    'contact-renewal-reminders': 'Contacts',
    'contacts-list': 'Contacts',
    'parts-by-vehicle': 'Parts'
  }

  return categoryMap[template] || 'Custom'
}