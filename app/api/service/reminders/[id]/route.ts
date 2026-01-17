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

// GET /api/service/reminders/[id] - Détails d'un rappel
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Service Reminder Detail - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const authParts = authHeader.split(' ')
    if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
      logAction('GET Service Reminder Detail - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = authParts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Service Reminder Detail - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const reminderId = params.id

    logAction('GET Service Reminder Detail', userId, { reminderId })

    // Récupérer l'utilisateur pour son companyId
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true }
    })

    // Vérifier que le rappel existe et que l'utilisateur a accès au véhicule associé
    const reminder = await prisma.serviceReminder.findFirst({
      where: {
        id: reminderId,
        vehicle: {
          OR: [
            { userId },
            ...(currentUser?.companyId ? [{ user: { companyId: currentUser.companyId } }] : [])
          ]
        }
      },
      include: {
        vehicle: {
          select: { id: true, name: true, make: true, model: true, vin: true, meterReading: true }
        },
        serviceTask: {
          select: { id: true, name: true, description: true }
        }
      }
    })

    if (!reminder) {
      logAction('GET Service Reminder Detail - Not found', userId, { reminderId })
      return NextResponse.json(
        { success: false, error: 'Rappel non trouvé' },
        { status: 404 }
      )
    }

    // Enrichir avec les informations de statut
    const now = new Date()
    let isOverdue = false
    let daysUntilDue: number | null = null

    if (reminder.nextDue) {
      isOverdue = reminder.nextDue < now
      daysUntilDue = Math.ceil((reminder.nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    }

    // Logique de priorité
    let priority = 'NORMAL'
    if (isOverdue) {
      priority = 'OVERDUE'
    } else {
      // Vérifier le seuil temporel
      const timeThresh = (reminder as any).timeThreshold || 7
      const isSoonDate = daysUntilDue !== null && daysUntilDue <= ((reminder as any).timeThresholdUnit === 'week(s)' ? timeThresh * 7 : timeThresh)

      // Vérifier le seuil kilométrique
      let isSoonMeter = false
      if (reminder.nextDueMeter && (reminder as any).meterThreshold && reminder.vehicle?.meterReading) {
        isSoonMeter = (reminder.nextDueMeter - reminder.vehicle.meterReading) <= (reminder as any).meterThreshold
      }

      if (isSoonDate || isSoonMeter) {
        priority = 'SOON'
      }
    }

    const enrichedReminder = {
      ...(reminder as any),
      isOverdue,
      daysUntilDue,
      priority
    }

    logAction('GET Service Reminder Detail - Success', userId, { reminderId })

    return NextResponse.json({
      success: true,
      data: enrichedReminder
    })

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Service Reminder Detail - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// PUT /api/service/reminders/[id] - Modifier un rappel
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('PUT Service Reminder - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const authParts = authHeader.split(' ')
    if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
      logAction('PUT Service Reminder - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = authParts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('PUT Service Reminder - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const reminderId = params.id

    // Extraction et validation des données
    const body = await request.json()
    const {
      task,
      serviceTaskId,
      nextDue,
      nextDueMeter,
      intervalMonths,
      intervalMeter,
      type,
      snoozedUntil,
      watchers,
      escalationDays,
      title,
      description,
      timeThreshold,
      timeThresholdUnit,
      meterThreshold
    } = body

    logAction('PUT Service Reminder', userId, { reminderId, task })

    try {
      // Récupérer l'utilisateur pour son companyId
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true }
      })

      // Vérifier que le rappel existe et appartient à l'utilisateur ou à son entreprise
      const existingReminder = await prisma.serviceReminder.findFirst({
        where: {
          id: reminderId,
          vehicle: {
            OR: [
              { userId },
              ...(currentUser?.companyId ? [{ user: { companyId: currentUser.companyId } }] : [])
            ]
          }
        }
      })

      if (!existingReminder) {
        logAction('PUT Service Reminder - Not found', userId, { reminderId })
        return NextResponse.json(
          { success: false, error: 'Rappel non trouvé' },
          { status: 404 }
        )
      }

      // Préparer les données de mise à jour
      const updateData: any = {}

      if (task !== undefined) updateData.task = task
      if (serviceTaskId !== undefined) {
        if (serviceTaskId) {
          updateData.serviceTask = { connect: { id: serviceTaskId } }
        } else {
          updateData.serviceTask = { disconnect: true }
        }
      }
      if (type !== undefined) updateData.type = type
      if (intervalMonths !== undefined) updateData.intervalMonths = parseInt(intervalMonths) || null
      if (intervalMeter !== undefined) updateData.intervalMeter = parseFloat(intervalMeter) || null
      if (snoozedUntil !== undefined) updateData.snoozedUntil = snoozedUntil ? new Date(snoozedUntil) : null
      if (watchers !== undefined) updateData.watchers = watchers
      if (escalationDays !== undefined) updateData.escalationDays = parseInt(escalationDays) || null
      if (title !== undefined) updateData.title = title
      if (description !== undefined) updateData.description = description
      if (timeThreshold !== undefined) updateData.timeThreshold = parseInt(timeThreshold) || null
      if (timeThresholdUnit !== undefined) updateData.timeThresholdUnit = timeThresholdUnit || null
      if (meterThreshold !== undefined) updateData.meterThreshold = parseFloat(meterThreshold) || null

      if (nextDue !== undefined) {
        updateData.nextDue = nextDue ? new Date(nextDue) : null
      }

      if (nextDueMeter !== undefined) {
        updateData.nextDueMeter = nextDueMeter ? parseFloat(nextDueMeter) : null
      }

      // Mettre à jour le rappel
      const updatedReminder = await prisma.serviceReminder.update({
        where: { id: reminderId },
        data: updateData,
        include: {
          vehicle: {
            select: { id: true, name: true, make: true, model: true }
          },
          serviceTask: {
            select: { id: true, name: true, description: true }
          }
        }
      })

      logAction('PUT Service Reminder - Success', userId, { reminderId })

      return NextResponse.json({
        success: true,
        data: updatedReminder,
        message: 'Rappel modifié avec succès'
      })

    } catch (dbError) {
      logAction('PUT Service Reminder - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la modification du rappel' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('PUT Service Reminder - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// DELETE /api/service/reminders/[id] - Supprimer un rappel
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('DELETE Service Reminder - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const authParts = authHeader.split(' ')
    if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
      logAction('DELETE Service Reminder - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = authParts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('DELETE Service Reminder - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId
    const reminderId = params.id

    logAction('DELETE Service Reminder', userId, { reminderId })

    try {
      // Récupérer l'utilisateur pour son companyId
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true }
      })

      // Vérifier que le rappel existe et appartient à l'utilisateur ou à son entreprise
      const existingReminder = await prisma.serviceReminder.findFirst({
        where: {
          id: reminderId,
          vehicle: {
            OR: [
              { userId },
              ...(currentUser?.companyId ? [{ user: { companyId: currentUser.companyId } }] : [])
            ]
          }
        }
      })

      if (!existingReminder) {
        logAction('DELETE Service Reminder - Not found', userId, { reminderId })
        return NextResponse.json(
          { success: false, error: 'Rappel non trouvé' },
          { status: 404 }
        )
      }

      // Supprimer le rappel
      await prisma.serviceReminder.delete({
        where: { id: reminderId }
      })

      logAction('DELETE Service Reminder - Success', userId, { reminderId })

      return NextResponse.json({
        success: true,
        message: 'Rappel supprimé avec succès'
      })

    } catch (dbError) {
      logAction('DELETE Service Reminder - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression du rappel' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('DELETE Service Reminder - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}