import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateToken, getBaseFilter } from '@/lib/api-utils'

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Service Entries API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// GET /api/service/entries - Liste paginée (historique + work orders)
export async function GET(request: NextRequest) {
  try {
    const tokenPayload = validateToken(request)

    if (!tokenPayload) {
      return NextResponse.json({ success: false, error: 'Token invalide ou expiré' }, { status: 401 })
    }

    const { userId, role } = tokenPayload

    // Extraction des paramètres de requête
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const vehicleId = searchParams.get('vehicleId')
    const isWorkOrder = searchParams.get('isWorkOrder')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    // Base filter: by company if available, otherwise by user
    const baseFilter = getBaseFilter(tokenPayload, 'user')

    // Technicians see assigned entries or company entries
    const isTech = role === 'TECHNICIAN'
    const where: any = isTech ? {
      OR: [
        { assignedToContactId: userId },
        baseFilter
      ]
    } : baseFilter

    if (status) where.status = status
    if (vehicleId) where.vehicleId = vehicleId
    if (isWorkOrder !== null) where.isWorkOrder = isWorkOrder === 'true'
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const [entries, total, statusCounts] = await Promise.all([
      prisma.serviceEntry.findMany({
        where,
        include: {
          vehicle: { select: { id: true, name: true, make: true, model: true } },
          user: { select: { id: true, name: true, email: true } },
          tasks: { include: { serviceTask: { select: { id: true, name: true, description: true } } } },
          parts: { include: { part: { select: { id: true, number: true, description: true } } } },
          assignedToContact: { select: { id: true, firstName: true, lastName: true } }
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit
      }),
      prisma.serviceEntry.count({ where }),
      prisma.serviceEntry.groupBy({
        by: ['status'],
        where: { ...where, isWorkOrder: isWorkOrder === 'true' },
        _count: { _all: true }
      })
    ])

    const counts = statusCounts.reduce((acc: any, curr: any) => {
      acc[curr.status] = curr._count._all
      return acc
    }, { SCHEDULED: 0, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0, ALL: 0 })
    counts.ALL = statusCounts.reduce((a, b) => a + b._count._all, 0)

    return NextResponse.json({
      success: true,
      data: {
        entries,
        statusCounts: counts,
        pagination: {
          page, limit, total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erreur serveur interne' }, { status: 500 })
  }
}

// POST /api/service/entries - Création nouvelle intervention
export async function POST(request: NextRequest) {
  try {
    const tokenPayload = validateToken(request)

    if (!tokenPayload) {
      return NextResponse.json({ success: false, error: 'Token invalide ou expiré' }, { status: 401 })
    }

    const { userId } = tokenPayload

    // Extraction et validation des données
    const body = await request.json()
    const {
      vehicleId, date, status = 'SCHEDULED', totalCost = 0, meter, vendorId, notes,
      priority, assignedToContactId, isWorkOrder = false, tasks = [], parts: serviceParts = [],
      resolvedIssueIds = [], documents = [], issuedBy, scheduledStartDate,
      scheduledStartTime, invoiceNumber, poNumber, discountValue, discountType, taxValue, taxType
    } = body

    if (!vehicleId || !date) {
      return NextResponse.json({ success: false, error: 'Vehicle ID and date are required' }, { status: 400 })
    }

    // Créer l'entrée de service avec les relations
    const serviceEntry = await prisma.serviceEntry.create({
      data: {
        vehicleId,
        userId,
        date: new Date(date),
        status,
        totalCost,
        meter,
        vendorId,
        notes,
        priority,
        assignedToContactId,
        isWorkOrder,
        issuedBy,
        scheduledStartDate: scheduledStartDate ? new Date(scheduledStartDate) : null,
        scheduledStartTime,
        invoiceNumber,
        poNumber,
        discountValue: discountValue ? parseFloat(discountValue) : undefined,
        discountType,
        taxValue: taxValue ? parseFloat(taxValue) : undefined,
        taxType,
        tasks: {
          create: tasks.map((task: any) => (
            typeof task === 'string' ? { serviceTaskId: task } : {
              serviceTaskId: task.serviceTaskId,
              cost: task.cost,
              notes: task.notes
            }
          ))
        },
        parts: {
          create: serviceParts.map((part: any) => ({
            partId: part.partId,
            quantity: part.quantity || 1,
            unitCost: part.unitCost || 0,
            totalCost: (part.quantity || 1) * (part.unitCost || 0),
            notes: part.notes
          }))
        }
      },
      include: {
        vehicle: { select: { id: true, name: true, make: true, model: true } },
        user: { select: { id: true, name: true, email: true } },
        tasks: { include: { serviceTask: { select: { id: true, name: true, description: true } } } },
        parts: { include: { part: { select: { id: true, number: true, description: true } } } },
        assignedToContact: { select: { id: true, firstName: true, lastName: true } }
      }
    })

    // Resolve linked issues
    if (resolvedIssueIds?.length > 0) {
      await prisma.issue.updateMany({
        where: { id: { in: resolvedIssueIds } },
        data: { status: 'RESOLVED' }
      })
    }

    return NextResponse.json({
      success: true,
      data: serviceEntry,
      message: 'Intervention créée avec succès'
    }, { status: 201 })

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erreur serveur interne' }, { status: 500 })
  }
}

// Gestion des autres méthodes
export async function PUT() { return NextResponse.json({ error: 'Méthode non autorisée' }, { status: 405 }) }
export async function DELETE() { return NextResponse.json({ error: 'Méthode non autorisée' }, { status: 405 }) }