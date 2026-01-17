import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { checkVehicleAccess } from '@/lib/api-utils'

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

// GET /api/service/reminders - Liste rappels actifs
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Service Reminders - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const authParts = authHeader.split(' ')
    if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
      logAction('GET Service Reminders - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = authParts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Service Reminders - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('GET Service Reminders - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    // Extraction des paramètres de requête
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const vehicleId = searchParams.get('vehicleId')
    const contactId = searchParams.get('contactId')
    const overdue = searchParams.get('overdue') === 'true'
    const dueSoon = searchParams.get('dueSoon') === 'true'
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    logAction('GET Service Reminders', userId, {
      page, limit, status, vehicleId, contactId, overdue, dueSoon, search
    })

    // Récupérer l'utilisateur pour son companyId
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true }
    })

    const where: any = {}

    if (contactId) {
      where.vehicle = {
        assignments: {
          some: {
            contactId,
            status: 'ACTIVE'
          }
        }
      }
    } else {
      where.vehicle = {
        OR: [
          { userId },
          ...(currentUser?.companyId ? [{ user: { companyId: currentUser.companyId } }] : [])
        ]
      }
    }

    if (vehicleId) {
      where.vehicleId = vehicleId
    }

    if (status) {
      where.status = status
    } else {
      // Par défaut, ne pas montrer les rappels complétés ou supprimés sauf si demandé spécifiquement
      where.status = { in: ['ACTIVE', 'OVERDUE', 'DISMISSED'] }
    }

    if (search) {
      where.OR = [
        { task: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { vehicle: { name: { contains: search, mode: 'insensitive' } } },
        { vehicle: { make: { contains: search, mode: 'insensitive' } } },
        { vehicle: { model: { contains: search, mode: 'insensitive' } } }
      ]
    }

    if (overdue) {
      const now = new Date()
      where.nextDue = { lt: now }
      where.status = { in: ['ACTIVE', 'OVERDUE'] }
    }

    if (dueSoon) {
      const now = new Date()
      // On récupère tout et on filtre après ou on utilise une approximation?
      // Pour faire propre en Prisma on peut pas facilement comparer avec differentes thresholds par ligne
      // Mais on peut faire une approximation (ex: 30 jours) et affiner après, ou juste filtrer ici avec une valeur par defaut
      const soonThreshold = new Date()
      soonThreshold.setDate(soonThreshold.getDate() + 30) // Prend large

      where.nextDue = {
        gt: now,
        lte: soonThreshold
      }
      where.status = 'ACTIVE'
    }

    const [reminders, total] = await Promise.all([
      prisma.serviceReminder.findMany({
        where,
        orderBy: { nextDue: 'asc' },
        skip,
        take: limit,
        include: {
          vehicle: {
            select: { id: true, name: true, make: true, model: true, meterReading: true }
          }
        }
      }),
      prisma.serviceReminder.count({ where })
    ])

    // Enrichir les rappels avec des informations sur leur statut
    const remindersWithStatus = reminders.map(reminder => {
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

      return {
        ...reminder,
        isOverdue,
        daysUntilDue,
        priority
      }
    })

    logAction('GET Service Reminders - Success', userId, {
      userId, total, page, totalPages: Math.ceil(total / limit)
    })

    return NextResponse.json({
      success: true,
      data: {
        reminders: remindersWithStatus,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    })
  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Service Reminders - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// POST /api/service/reminders - Nouveau rappel
export async function POST(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('POST Service Reminder - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const authParts = authHeader.split(' ')
    if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
      logAction('POST Service Reminder - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = authParts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('POST Service Reminder - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('POST Service Reminder - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    // Extraction et validation des données
    const body = await request.json()
    const {
      vehicleId,
      task,
      serviceTaskId,
      nextDue,
      nextDueMeter,
      intervalMonths,
      intervalMeter,
      type = 'date',
      lastServiceDate,
      lastServiceMeter,
      timeThreshold,
      timeThresholdUnit,
      meterThreshold
    } = body

    logAction('POST Service Reminder', userId, {
      userId, vehicleId, task, serviceTaskId
    })

    // Validation
    if (!vehicleId) {
      return NextResponse.json(
        { success: false, error: 'Vehicle ID requis' },
        { status: 400 }
      )
    }

    if (!task && !serviceTaskId) {
      return NextResponse.json(
        { success: false, error: 'Une tâche (nom ou ID) est requise' },
        { status: 400 }
      )
    }

    if (!nextDue && !nextDueMeter && !intervalMonths && !intervalMeter) {
      return NextResponse.json(
        { success: false, error: 'Une date d\'échéance, un kilométrage ou un intervalle est requis' },
        { status: 400 }
      )
    }

    try {
      // Vérifier que l'utilisateur a accès au véhicule (propriétaire ou même entreprise)
      const vehicle = await checkVehicleAccess(vehicleId, userId)

      if (!vehicle) {
        logAction('POST Service Reminder - Vehicle not found or access denied', userId, {
          vehicleId, userId
        })
        return NextResponse.json(
          { success: false, error: 'Véhicule non trouvé ou accès refusé' },
          { status: 404 }
        )
      }

      // Création du rappel
      const reminderData: any = {
        vehicle: { connect: { id: vehicleId } },
        task,
        serviceTask: serviceTaskId ? { connect: { id: serviceTaskId } } : undefined,
        type,
        status: 'ACTIVE',
        intervalMonths: intervalMonths ? parseInt(intervalMonths) : null,
        intervalMeter: intervalMeter ? parseFloat(intervalMeter) : null,
        lastServiceMeter: lastServiceMeter ? parseFloat(lastServiceMeter) : null,
        timeThreshold: timeThreshold ? parseInt(timeThreshold) : null,
        timeThresholdUnit: timeThresholdUnit || null,
        meterThreshold: meterThreshold ? parseFloat(meterThreshold) : null
      }

      if (lastServiceDate) {
        reminderData.lastServiceDate = new Date(lastServiceDate)
      }

      if (nextDue) {
        reminderData.nextDue = new Date(nextDue)
      } else if (intervalMonths && lastServiceDate) {
        // Calculer la prochaine date si intervalle et dernière date fournis
        const nextDate = new Date(lastServiceDate)
        nextDate.setMonth(nextDate.getMonth() + parseInt(intervalMonths))
        reminderData.nextDue = nextDate
      } else if (intervalMonths) {
        // Par défaut à partir d'aujourd'hui si pas de date de dernier service
        const nextDate = new Date()
        nextDate.setMonth(nextDate.getMonth() + parseInt(intervalMonths))
        reminderData.nextDue = nextDate
      }

      if (nextDueMeter) {
        reminderData.nextDueMeter = parseFloat(nextDueMeter)
      } else if (intervalMeter && lastServiceMeter) {
        reminderData.nextDueMeter = parseFloat(lastServiceMeter) + parseFloat(intervalMeter)
      } else if (intervalMeter && vehicle.meterReading) {
        reminderData.nextDueMeter = (vehicle.meterReading || 0) + parseFloat(intervalMeter)
      }

      const newReminder = await prisma.serviceReminder.create({
        data: reminderData,
        include: {
          vehicle: {
            select: { id: true, name: true, make: true, model: true }
          }
        }
      })

      logAction('POST Service Reminder - Success', userId, {
        userId, reminderId: newReminder.id
      })

      return NextResponse.json(
        {
          success: true,
          data: newReminder,
          message: 'Rappel créé avec succès'
        },
        { status: 201 }
      )

    } catch (dbError) {
      logAction('POST Service Reminder - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création du rappel' },
        { status: 500 }
      )
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('POST Service Reminder - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}