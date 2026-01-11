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
      console.log('[Contacts API] Token type invalide:', decoded.type)
      return null
    }

    return decoded
  } catch (error) {
    console.log('[Contacts API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Contacts API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details)
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

// GET /api/contacts/[id] - Détails d'un contact spécifique
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
    const contactId = params.id

    logAction('GET Contact by ID', userId, { contactId })

    try {
      const contact = await prisma.contact.findUnique({
        where: { id: contactId },
        include: {
          group: true
        }
      })

      if (!contact) {
        logAction('GET Contact by ID - Not found', userId, { contactId })
        return NextResponse.json(
          { success: false, error: 'Contact non trouvé' },
          { status: 404 }
        )
      }

      // Récupérer les assignments du contact (véhicules assignés)
      const assignments = await prisma.vehicleAssignment.findMany({
        where: { contactId: contactId },
        include: {
          vehicle: {
            select: {
              id: true,
              name: true,
              vin: true,
              type: true,
              make: true,
              model: true,
              status: true
            }
          }
        },
        orderBy: { startDate: 'desc' }
      })

      // Trouver s'il y a un utilisateur associé à ce contact par email
      const associatedUser = await prisma.user.findUnique({
        where: { email: contact.email },
        select: { id: true }
      })

      logAction('GET Contact by ID - Success', userId, {
        contactId,
        assignmentsCount: assignments.length,
        hasAssociatedUser: !!associatedUser
      })

      return NextResponse.json({
        success: true,
        data: {
          ...contact,
          assignments,
          associatedUserId: associatedUser?.id || null
        }
      })

    } catch (dbError) {
      logAction('GET Contact by ID - Database error', userId, {
        contactId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération du contact' },
        { status: 500 }
      )
    }
  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Contact by ID - Server error', userId, {
      contactId: params.id,
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// PUT /api/contacts/[id] - Modification d'un contact
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
    const contactId = params.id

    const data = await request.json()

    logAction('PUT Contact', userId, { contactId, data })

    // Validation des champs requis
    if (!data.firstName || !data.lastName || !data.email) {
      logAction('PUT Contact - Missing required fields', userId, {
        contactId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email
      })
      return NextResponse.json(
        { success: false, error: 'Prénom, nom et email sont requis' },
        { status: 400 }
      )
    }

    try {
      // Vérifier si le contact existe
      const existingContact = await prisma.contact.findUnique({
        where: { id: contactId }
      })

      if (!existingContact) {
        logAction('PUT Contact - Not found', userId, { contactId })
        return NextResponse.json(
          { success: false, error: 'Contact non trouvé' },
          { status: 404 }
        )
      }

      // Vérifier si l'email existe déjà pour un autre contact
      const emailConflict = await prisma.contact.findFirst({
        where: {
          email: data.email,
          NOT: { id: contactId }
        }
      })

      if (emailConflict) {
        logAction('PUT Contact - Email conflict', userId, {
          contactId,
          email: data.email
        })
        return NextResponse.json(
          { success: false, error: 'Un autre contact avec cet email existe déjà' },
          { status: 409 }
        )
      }

      const updatedContact = await prisma.contact.update({
        where: { id: contactId },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone || null,
          groupId: data.groupId || null,
          status: data.status || 'ACTIVE',
          userType: data.userType || null,
          classifications: data.classifications || [],
          image: data.image || null,
          jobTitle: data.jobTitle || null,
          company: data.company || null,
          middleName: data.middleName || null,
          phoneWork: data.phoneWork || null,
          phoneOther: data.phoneOther || null,
          address: data.address || null,
          address2: data.address2 || null,
          city: data.city || null,
          zip: data.zip || null,
          country: data.country || null,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          employeeNumber: data.employeeNumber || null,
          startDate: data.startDate ? new Date(data.startDate) : null,
          leaveDate: data.leaveDate ? new Date(data.leaveDate) : null,
          licenseNumber: data.licenseNumber || null,
          licenseClass: data.licenseClass || [],
          hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) : null,
          updatedAt: new Date()
        }
      })

      logAction('PUT Contact - Success', userId, {
        contactId,
        updatedEmail: updatedContact.email
      })

      return NextResponse.json({
        success: true,
        data: updatedContact,
        message: 'Contact mis à jour avec succès'
      })

    } catch (dbError) {
      logAction('PUT Contact - Database error', userId, {
        contactId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour du contact' },
        { status: 500 }
      )
    }
  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('PUT Contact - Server error', userId, {
      contactId: params.id,
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// DELETE /api/contacts/[id] - Suppression d'un contact
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
    const contactId = params.id

    logAction('DELETE Contact', userId, { contactId })

    try {
      // Vérifier si le contact existe
      const existingContact = await prisma.contact.findUnique({
        where: { id: contactId }
      })

      if (!existingContact) {
        logAction('DELETE Contact - Not found', userId, { contactId })
        return NextResponse.json(
          { success: false, error: 'Contact non trouvé' },
          { status: 404 }
        )
      }

      // Vérifier les assignments actifs
      const activeAssignments = await prisma.vehicleAssignment.count({
        where: {
          operator: contactId,
          status: 'ACTIVE'
        }
      })

      if (activeAssignments > 0) {
        logAction('DELETE Contact - Has active assignments', userId, {
          contactId,
          activeAssignments
        })
        return NextResponse.json(
          {
            success: false,
            error: `Impossible de supprimer ce contact car il a ${activeAssignments} assignment(s) actif(s)`
          },
          { status: 400 }
        )
      }

      // Suppression du contact (les assignments inactifs seront supprimés en cascade)
      await prisma.contact.delete({
        where: { id: contactId }
      })

      logAction('DELETE Contact - Success', userId, {
        contactId,
        deletedEmail: existingContact.email
      })

      return NextResponse.json({
        success: true,
        message: 'Contact supprimé avec succès'
      })

    } catch (dbError) {
      logAction('DELETE Contact - Database error', userId, {
        contactId,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression du contact' },
        { status: 500 }
      )
    }
  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('DELETE Contact - Server error', userId, {
      contactId: params.id,
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
    { success: false, error: 'Méthode non autorisée - utilisez POST /api/contacts' },
    { status: 405 }
  )
}

export async function PATCH() {
  return NextResponse.json(
    { success: false, error: 'Méthode non autorisée - utilisez PUT /api/contacts/[id]' },
    { status: 405 }
  )
}