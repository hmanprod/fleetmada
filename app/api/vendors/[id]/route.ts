import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

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
      console.log('[Vendors API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Vendors API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Vendors API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
}

// Fonction utilitaire pour valider le token et récupérer l'utilisateur
const validateAuth = async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization')

  if (!authHeader) {
    return { error: 'Token d\'authentification manquant', status: 401 }
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return { error: 'Format de token invalide', status: 401 }
  }

  const token = parts[1]
  const tokenPayload = validateToken(token)

  if (!tokenPayload) {
    return { error: 'Token invalide ou expiré', status: 401 }
  }

  const userId = tokenPayload.userId
  if (!userId) {
    return { error: 'ID utilisateur manquant', status: 401 }
  }

  return { userId }
}

// GET /api/vendors/[id] - Détails d'un vendor spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await validateAuth(request)
    if (authResult.error) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      )
    }

    const userId = authResult.userId!
    const vendorId = params.id

    logAction('GET Vendor by ID', userId, { vendorId })

    try {
      const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId }
      })

      if (!vendor) {
        logAction('GET Vendor by ID - Not found', userId, { vendorId })
        return NextResponse.json(
          { success: false, error: 'Vendor non trouvé' },
          { status: 404 }
        )
      }

      // Récupérer les transactions du vendor
      const [serviceEntries, fuelEntries, expenseEntries, chargingEntries] = await Promise.all([
        prisma.serviceEntry.findMany({
          where: { vendorId: vendor.id },
          include: {
            vehicle: {
              select: {
                id: true,
                name: true,
                vin: true,
                type: true
              }
            }
          },
          orderBy: { date: 'desc' },
          take: 10
        }),
        prisma.fuelEntry.findMany({
          where: { vendorId: vendor.id },
          include: {
            vehicle: {
              select: {
                id: true,
                name: true,
                vin: true,
                type: true
              }
            }
          },
          orderBy: { date: 'desc' },
          take: 10
        }),
        prisma.expenseEntry.findMany({
          where: { vendorId: vendor.id },
          include: {
            vehicle: {
              select: {
                id: true,
                name: true,
                vin: true,
                type: true
              }
            }
          },
          orderBy: { date: 'desc' },
          take: 10
        }),
        prisma.chargingEntry.findMany({
          where: { vendorId: vendor.id },
          include: {
            vehicle: {
              select: {
                id: true,
                name: true,
                vin: true,
                type: true
              }
            }
          },
          orderBy: { date: 'desc' },
          take: 10
        })
      ])

      // Calculer les statistiques
      const totalServices = serviceEntries.length
      const totalFuelEntries = fuelEntries.length
      const totalExpenses = expenseEntries.length
      const totalChargingEntries = chargingEntries.length

      const totalServiceCost = serviceEntries.reduce((sum, entry) => sum + entry.totalCost, 0)
      const totalFuelCost = fuelEntries.reduce((sum, entry) => sum + entry.cost, 0)
      const totalExpenseAmount = expenseEntries.reduce((sum, entry) => sum + entry.amount, 0)
      const totalChargingCost = chargingEntries.reduce((sum, entry) => sum + entry.cost, 0)

      logAction('GET Vendor by ID - Success', userId, {
        vendorId,
        totalServices,
        totalFuelEntries,
        totalExpenses,
        totalChargingEntries
      })

      return NextResponse.json({
        success: true,
        data: {
          ...vendor,
          transactions: {
            serviceEntries: serviceEntries.slice(0, 5),
            fuelEntries: fuelEntries.slice(0, 5),
            expenseEntries: expenseEntries.slice(0, 5),
            chargingEntries: chargingEntries.slice(0, 5)
          },
          stats: {
            totalServices,
            totalFuelEntries,
            totalExpenses,
            totalChargingEntries,
            totalServiceCost: Math.round(totalServiceCost * 100) / 100,
            totalFuelCost: Math.round(totalFuelCost * 100) / 100,
            totalExpenseAmount: Math.round(totalExpenseAmount * 100) / 100,
            totalChargingCost: Math.round(totalChargingCost * 100) / 100,
            totalValue: Math.round((totalServiceCost + totalFuelCost + totalExpenseAmount + totalChargingCost) * 100) / 100
          }
        }
      })

    } catch (dbError) {
      logAction('GET Vendor by ID - Database error', userId, {
        vendorId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération du vendor' },
        { status: 500 }
      )
    }
  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Vendor by ID - Server error', userId, {
      vendorId: params.id,
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// PUT /api/vendors/[id] - Modification d'un vendor
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await validateAuth(request)
    if (authResult.error) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      )
    }

    const userId = authResult.userId!
    const vendorId = params.id

    const data = await request.json()

    logAction('PUT Vendor', userId, { vendorId, data })

    // Validation du nom requis
    if (!data.name) {
      logAction('PUT Vendor - Missing required fields', userId, {
        vendorId,
        name: data.name
      })
      return NextResponse.json(
        { success: false, error: 'Le nom du vendor est requis' },
        { status: 400 }
      )
    }

    try {
      // Vérifier si le vendor existe
      const existingVendor = await prisma.vendor.findUnique({
        where: { id: vendorId }
      })

      if (!existingVendor) {
        logAction('PUT Vendor - Not found', userId, { vendorId })
        return NextResponse.json(
          { success: false, error: 'Vendor non trouvé' },
          { status: 404 }
        )
      }

      // Vérifier si le nom existe déjà pour un autre vendor
      const nameConflict = await prisma.vendor.findFirst({
        where: {
          name: data.name,
          NOT: { id: vendorId }
        }
      })

      if (nameConflict) {
        logAction('PUT Vendor - Name conflict', userId, {
          vendorId,
          name: data.name
        })
        return NextResponse.json(
          { success: false, error: 'Un autre vendor avec ce nom existe déjà' },
          { status: 409 }
        )
      }

      const updatedVendor = await prisma.vendor.update({
        where: { id: vendorId },
        data: {
          name: data.name,
          phone: data.phone || null,
          website: data.website || null,
          address: data.address || null,
          contactName: data.contactName || null,
          contactEmail: data.contactEmail || null,
          contactPhone: data.contactPhone || null,
          labels: data.labels || [],
          classification: data.classification || [],
          updatedAt: new Date()
        }
      })

      logAction('PUT Vendor - Success', userId, {
        vendorId,
        updatedName: updatedVendor.name
      })

      return NextResponse.json({
        success: true,
        data: updatedVendor,
        message: 'Vendor mis à jour avec succès'
      })

    } catch (dbError) {
      logAction('PUT Vendor - Database error', userId, {
        vendorId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour du vendor' },
        { status: 500 }
      )
    }
  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('PUT Vendor - Server error', userId, {
      vendorId: params.id,
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// DELETE /api/vendors/[id] - Suppression d'un vendor
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await validateAuth(request)
    if (authResult.error) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      )
    }

    const userId = authResult.userId!
    const vendorId = params.id

    logAction('DELETE Vendor', userId, { vendorId })

    try {
      // Vérifier si le vendor existe
      const existingVendor = await prisma.vendor.findUnique({
        where: { id: vendorId }
      })

      if (!existingVendor) {
        logAction('DELETE Vendor - Not found', userId, { vendorId })
        return NextResponse.json(
          { success: false, error: 'Vendor non trouvé' },
          { status: 404 }
        )
      }

      // Vérifier les références dans les tables de transaction
      const [serviceCount, fuelCount, expenseCount] = await Promise.all([
        prisma.serviceEntry.count({
          where: { vendorId: existingVendor.id }
        }),
        prisma.fuelEntry.count({
          where: { vendorId: existingVendor.id }
        }),
        prisma.expenseEntry.count({
          where: { vendorId: existingVendor.id }
        })
      ])

      const totalReferences = serviceCount + fuelCount + expenseCount

      if (totalReferences > 0) {
        logAction('DELETE Vendor - Has references', userId, {
          vendorId,
          serviceCount,
          fuelCount,
          expenseCount
        })
        return NextResponse.json(
          {
            success: false,
            error: `Impossible de supprimer ce vendor car il est référencé dans ${totalReferences} transaction(s)`
          },
          { status: 400 }
        )
      }

      // Suppression du vendor
      await prisma.vendor.delete({
        where: { id: vendorId }
      })

      logAction('DELETE Vendor - Success', userId, {
        vendorId,
        deletedName: existingVendor.name
      })

      return NextResponse.json({
        success: true,
        message: 'Vendor supprimé avec succès'
      })

    } catch (dbError) {
      logAction('DELETE Vendor - Database error', userId, {
        vendorId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression du vendor' },
        { status: 500 }
      )
    }
  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('DELETE Vendor - Server error', userId, {
      vendorId: params.id,
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
    { success: false, error: 'Méthode non autorisée - utilisez POST /api/vendors' },
    { status: 405 }
  )
}

export async function PATCH() {
  return NextResponse.json(
    { success: false, error: 'Méthode non autorisée - utilisez PUT /api/vendors/[id]' },
    { status: 405 }
  )
}