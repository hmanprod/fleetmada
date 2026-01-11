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

// GET /api/contacts - Liste paginée avec filtres
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Contacts - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Contacts - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Contacts - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('GET Contacts - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const group = searchParams.get('group');
    const classification = searchParams.get('classification');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    logAction('GET Contacts', userId, {
      page, limit, status, group, classification, search
    })

    // Construction du where
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (group) {
      where.groupId = group;
    }

    if (classification) {
      where.classifications = {
        has: classification
      };
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    try {
      const [contacts, total] = await Promise.all([
        prisma.contact.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            group: true
          }
        }),
        prisma.contact.count({ where })
      ]);

      logAction('GET Contacts - Success', userId, {
        total, page, totalPages: Math.ceil(total / limit)
      })

      return NextResponse.json({
        success: true,
        data: {
          contacts,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
          }
        }
      });
    } catch (dbError) {
      logAction('GET Contacts - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des contacts' },
        { status: 500 }
      )
    }
  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Contacts - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// POST /api/contacts - Création nouveau contact
export async function POST(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('POST Contact - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('POST Contact - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('POST Contact - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('POST Contact - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    const data = await request.json()

    // Validation des champs requis
    if (!data.firstName || !data.lastName || !data.email) {
      logAction('POST Contact - Missing required fields', userId, {
        firstName: data.firstName, lastName: data.lastName, email: data.email
      })
      return NextResponse.json(
        { success: false, error: 'Prénom, nom et email sont requis' },
        { status: 400 }
      )
    }

    logAction('POST Contact', userId, {
      firstName: data.firstName, lastName: data.lastName, email: data.email
    })

    try {
      // Vérifier si l'email existe déjà
      const existingContact = await prisma.contact.findUnique({
        where: { email: data.email }
      })

      if (existingContact) {
        logAction('POST Contact - Email already exists', userId, {
          email: data.email
        })
        return NextResponse.json(
          { success: false, error: 'Un contact avec cet email existe déjà' },
          { status: 409 }
        )
      }

      const contact = await prisma.contact.create({
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
        }
      })

      logAction('POST Contact - Success', userId, {
        contactId: contact.id, email: contact.email
      })

      return NextResponse.json(
        {
          success: true,
          data: contact,
          message: 'Contact créé avec succès'
        },
        { status: 201 }
      )
    } catch (dbError) {
      logAction('POST Contact - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création du contact' },
        { status: 500 }
      )
    }
  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('POST Contact - Server error', userId, {
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
    { success: false, error: 'Méthode non autorisée - utilisez PUT /api/contacts/[id]' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Méthode non autorisée - utilisez DELETE /api/contacts/[id]' },
    { status: 405 }
  )
}

export async function PATCH() {
  return NextResponse.json(
    { success: false, error: 'Méthode non autorisée' },
    { status: 405 }
  )
}