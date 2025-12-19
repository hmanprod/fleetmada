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

// POST /api/service/reminders/[id]/dismiss - Marquer comme traité
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('DISMISS Service Reminder - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const authParts = authHeader.split(' ')
    if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
      logAction('DISMISS Service Reminder - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = authParts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('DISMISS Service Reminder - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const reminderId = params.id

    logAction('DISMISS Service Reminder', userId, { reminderId })

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
        logAction('DISMISS Service Reminder - Not found', userId, { reminderId })
        return NextResponse.json(
          { success: false, error: 'Rappel non trouvé' },
          { status: 404 }
        )
      }

      // Marquer le rappel comme traité
      const updatedReminder = await prisma.serviceReminder.update({
        where: { id: reminderId },
        data: { 
          status: 'DISMISSED',
          snoozedUntil: null // Supprimer tout snooze actif
        },
        include: {
          vehicle: {
            select: { id: true, name: true, make: true, model: true }
          }
        }
      })

      logAction('DISMISS Service Reminder - Success', userId, { reminderId })

      return NextResponse.json({
        success: true,
        data: updatedReminder,
        message: 'Rappel marqué comme traité'
      })

    } catch (dbError) {
      logAction('DISMISS Service Reminder - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors du traitement du rappel' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('DISMISS Service Reminder - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}