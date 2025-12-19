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

// GET /api/vendors - Liste paginée avec filtres
export async function GET(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('GET Vendors - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('GET Vendors - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('GET Vendors - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('GET Vendors - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const classification = searchParams.get('classification');
    const label = searchParams.get('label');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    logAction('GET Vendors', userId, {
      page, limit, classification, label, search
    })

    // Construction du where
    const where: any = {};

    if (classification) {
      where.classification = {
        has: classification
      };
    }

    if (label) {
      where.labels = {
        has: label
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
        { contactEmail: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ];
    }

    try {
      const [vendors, total] = await Promise.all([
        prisma.vendor.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.vendor.count({ where })
      ]);

      logAction('GET Vendors - Success', userId, {
        total, page, totalPages: Math.ceil(total / limit)
      })

      return NextResponse.json({
        success: true,
        data: {
          vendors,
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
      logAction('GET Vendors - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des vendors' },
        { status: 500 }
      )
    }
  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('GET Vendors - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

// POST /api/vendors - Création nouveau vendor
export async function POST(request: NextRequest) {
  try {
    // Extraction et validation du token JWT
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      logAction('POST Vendor - Missing authorization header', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logAction('POST Vendor - Invalid authorization header format', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Format de token invalide' },
        { status: 401 }
      )
    }

    const token = parts[1]
    const tokenPayload = validateToken(token)

    if (!tokenPayload) {
      logAction('POST Vendor - Invalid token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const userId = tokenPayload.userId

    if (!userId) {
      logAction('POST Vendor - Missing user ID in token', 'unknown', {})
      return NextResponse.json(
        { success: false, error: 'ID utilisateur manquant' },
        { status: 401 }
      )
    }

    const data = await request.json()

    // Validation des champs requis
    if (!data.name) {
      logAction('POST Vendor - Missing required fields', userId, {
        name: data.name
      })
      return NextResponse.json(
        { success: false, error: 'Le nom du vendor est requis' },
        { status: 400 }
      )
    }

    logAction('POST Vendor', userId, {
      name: data.name
    })

    try {
      // Vérifier si le nom existe déjà
      const existingVendor = await prisma.vendor.findUnique({
        where: { name: data.name }
      })

      if (existingVendor) {
        logAction('POST Vendor - Name already exists', userId, {
          name: data.name
        })
        return NextResponse.json(
          { success: false, error: 'Un vendor avec ce nom existe déjà' },
          { status: 409 }
        )
      }

      const vendor = await prisma.vendor.create({
        data: {
          name: data.name,
          phone: data.phone || null,
          website: data.website || null,
          address: data.address || null,
          contactName: data.contactName || null,
          contactEmail: data.contactEmail || null,
          contactPhone: data.contactPhone || null,
          labels: data.labels || [],
          classification: data.classification || []
        }
      })

      logAction('POST Vendor - Success', userId, {
        vendorId: vendor.id, name: vendor.name
      })

      return NextResponse.json(
        {
          success: true,
          data: vendor,
          message: 'Vendor créé avec succès'
        },
        { status: 201 }
      )
    } catch (dbError) {
      logAction('POST Vendor - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      })

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création du vendor' },
        { status: 500 }
      )
    }
  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown'
    logAction('POST Vendor - Server error', userId, {
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
    { success: false, error: 'Méthode non autorisée - utilisez PUT /api/vendors/[id]' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Méthode non autorisée - utilisez DELETE /api/vendors/[id]' },
    { status: 405 }
  )
}

export async function PATCH() {
  return NextResponse.json(
    { success: false, error: 'Méthode non autorisée' },
    { status: 405 }
  )
}