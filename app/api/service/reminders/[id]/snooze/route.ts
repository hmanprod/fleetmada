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

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as TokenPayload

    if (decoded.type !== 'login') {
      console.log('[Service Reminders API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Service Reminders API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Service Reminders API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// POST /api/service/reminders/[id]/snooze - Reporter un rappel
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('SNOOZE Service Reminder - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const authParts = authHeader.split(' ')
    if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
      logAction('SNOOZE Service Reminder - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = authParts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('SNOOZE Service Reminder - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const reminderId = params.id

    // Extraction et validation des données
    const body = await request.json()
    const { snoozeUntil, days } = body

    logAction('SNOOZE Service Reminder', userId, { reminderId, snoozeUntil, days })

    try {
      // Vérifier que le rappel existe et appartient à l'utilisateur
      const existingReminder = await prisma.serviceReminder.findFirst({
        where: {
          id: reminderId,
          vehicle: {
            userId
          }
        }
      })

      if (!existingReminder) {
        logAction('SNOOZE Service Reminder - Not found', userId, { reminderId })
        return NextResponse.json(
          { success: false, error: 'Rappel non trouvé' },
          { status: 404 }
        )
      }

      // Calculer la date de report
      let snoozeDate: Date
      if (snoozeUntil) {
        snoozeDate = new Date(snoozeUntil)
      } else if (days) {
        snoozeDate = new Date()
        snoozeDate.setDate(snoozeDate.getDate() + parseInt(days))
      } else {
        // Par défaut : reporter de 7 jours
        snoozeDate = new Date()
        snoozeDate.setDate(snoozeDate.getDate() + 7)
      }

      // Reporter le rappel
      const updatedReminder = await prisma.serviceReminder.update({
        where: { id: reminderId },
        data: { 
          snoozedUntil: snoozeDate,
          status: 'DISMISSED' // Marquer comme reporté
        },
        include: {
          vehicle: {
            select: { id: true, name: true, make: true, model: true }
          }
        }
      })

      logAction('SNOOZE Service Reminder - Success', userId, { 
        reminderId, 
        snoozeUntil: snoozeDate.toISOString() 
      })

      return NextResponse.json({
        success: true,
        data: updatedReminder,
        message: 'Rappel reporté avec succès'
      })

    } catch (dbError) {
      logAction('SNOOZE Service Reminder - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors du report du rappel' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('SNOOZE Service Reminder - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}