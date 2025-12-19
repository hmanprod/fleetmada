import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

// Interface pour les données du token JWT décodé
interface TokenPayload {
  userId: string;
  email: string;
  companyId?: string;
  type: string;
  iat: number;
  exp?: number;
}

// Schéma de validation pour les attachments
const AttachmentQuerySchema = z.object({
  attachedTo: z.enum(['vehicle', 'service', 'issue', 'part', 'fuel', 'contact']),
  attachedId: z.string().min(1, 'ID de l\'entité requis'),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20')
});

// Types TypeScript
type AttachmentQuery = z.infer<typeof AttachmentQuerySchema>;

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Documents Attachment API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details);
};

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    const decoded = jwt.verify(token, secret) as TokenPayload;

    if (decoded.type !== 'login') {
      console.log('[Documents Attachment API] Token type invalide:', decoded.type);
      return null;
    }

    return decoded;
  } catch (error) {
    console.log('[Documents Attachment API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
};

// Fonction de validation d'authentification
const validateAuth = (request: NextRequest): { valid: boolean; userId?: string; companyId?: string; error?: string } => {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return { valid: false, error: 'Token d\'authentification manquant' };
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return { valid: false, error: 'Format de token invalide' };
  }

  const token = parts[1];
  const tokenPayload = validateToken(token);

  if (!tokenPayload) {
    return { valid: false, error: 'Token invalide ou expiré' };
  }

  if (!tokenPayload.userId) {
    return { valid: false, error: 'ID utilisateur manquant' };
  }

  return {
    valid: true,
    userId: tokenPayload.userId,
    companyId: tokenPayload.companyId
  };
};

// Fonction de vérification des permissions sur l'entité
const checkEntityAccess = async (entityType: string, entityId: string, userId: string, companyId?: string) => {
  try {
    switch (entityType) {
      case 'vehicle':
        const vehicle = await prisma.vehicle.findFirst({
          where: { id: entityId, userId }
        });
        return { hasAccess: !!vehicle, entity: vehicle };
        
      case 'service':
        const service = await prisma.serviceEntry.findFirst({
          where: { id: entityId, userId }
        });
        return { hasAccess: !!service, entity: service };
        
      case 'issue':
        const issue = await prisma.issue.findFirst({
          where: { id: entityId, userId }
        });
        return { hasAccess: !!issue, entity: issue };
        
      case 'fuel':
        const fuel = await prisma.fuelEntry.findFirst({
          where: { id: entityId, userId }
        });
        return { hasAccess: !!fuel, entity: fuel };
        
      // Les entités globales (part, contact) sont accessibles à tous les utilisateurs authentifiés
      case 'part':
        const part = await prisma.part.findUnique({
          where: { id: entityId }
        });
        return { hasAccess: !!part, entity: part };
        
      case 'contact':
        const contact = await prisma.contact.findUnique({
          where: { id: entityId }
        });
        return { hasAccess: !!contact, entity: contact };
        
      default:
        return { hasAccess: false, entity: null, error: 'Type d\'entité non supporté' };
    }
  } catch (error) {
    return { hasAccess: false, entity: null, error: 'Erreur lors de la vérification des permissions' };
  }
};

// GET /api/documents/by-attachment - Documents attachés à une entité
export async function GET(request: NextRequest) {
  try {
    const auth = validateAuth(request);
    if (!auth.valid) {
      logAction('Get Attached Documents - Auth failed', 'unknown', { error: auth.error });
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    const userId = auth.userId!;
    const companyId = auth.companyId;

    // Extraction et validation des paramètres
    const { searchParams } = new URL(request.url);
    const queryParams: any = {};
    
    for (const [key, value] of searchParams.entries()) {
      queryParams[key] = value;
    }

    const query = AttachmentQuerySchema.parse(queryParams);
    const offset = (query.page - 1) * query.limit;

    logAction('Get Attached Documents', userId, { 
      userId, 
      entityType: query.attachedTo,
      entityId: query.attachedId,
      page: query.page,
      limit: query.limit
    });

    try {
      // Vérification des permissions sur l'entité
      const accessCheck = await checkEntityAccess(query.attachedTo, query.attachedId, userId, companyId);
      if (!accessCheck.hasAccess) {
        return NextResponse.json(
          { success: false, error: accessCheck.error || 'Accès refusé à cette entité' },
          { status: 403 }
        );
      }

      // Construction des filtres pour les documents
      const documentFilters: any = {
        attachedTo: query.attachedTo,
        attachedId: query.attachedId,
        OR: [
          { userId },
          { companyId },
          { isPublic: true }
        ]
      };

      // Récupération des documents attachés
      const [documents, totalCount] = await Promise.all([
        prisma.document.findMany({
          where: documentFilters,
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: query.limit,
          include: {
            user: {
              select: { id: true, name: true, email: true }
            },
            company: {
              select: { id: true, name: true }
            }
          }
        }),
        prisma.document.count({
          where: documentFilters
        })
      ]);

      const totalPages = Math.ceil(totalCount / query.limit);

      logAction('Get Attached Documents - Success', userId, { 
        userId, 
        entityType: query.attachedTo,
        entityId: query.attachedId,
        documentsCount: documents.length,
        totalCount
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            documents,
            entity: {
              type: query.attachedTo,
              id: query.attachedId,
              name: accessCheck.entity ? `Entité ${query.attachedTo}` : 'Entité inconnue'
            },
            pagination: {
              page: query.page,
              limit: query.limit,
              totalCount,
              totalPages,
              hasNext: query.page < totalPages,
              hasPrev: query.page > 1
            }
          }
        },
        { status: 200 }
      );

    } catch (dbError) {
      logAction('Get Attached Documents - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error',
        entityType: query.attachedTo,
        entityId: query.attachedId
      });

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des documents' },
        { status: 500 }
      );
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown';
    
    // Gestion des erreurs de validation
    if (error instanceof Error && error.name === 'ZodError') {
      logAction('Get Attached Documents - Validation error', userId, {
        error: error.message
      });

      return NextResponse.json(
        { success: false, error: 'Paramètres invalides', details: error.message },
        { status: 400 }
      );
    }

    logAction('Get Attached Documents - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

// POST /api/documents/by-attachment - Attacher des documents à une entité
export async function POST(request: NextRequest) {
  try {
    const auth = validateAuth(request);
    if (!auth.valid) {
      logAction('Attach Documents - Auth failed', 'unknown', { error: auth.error });
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    const userId = auth.userId!;
    const companyId = auth.companyId;

    // Extraction et validation des données
    const body = await request.json();
    const { documentIds, attachedTo, attachedId } = body;

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Liste des IDs de documents requise' },
        { status: 400 }
      );
    }

    if (!attachedTo || !attachedId) {
      return NextResponse.json(
        { success: false, error: 'Type et ID de l\'entité requis' },
        { status: 400 }
      );
    }

    logAction('Attach Documents', userId, { 
      userId, 
      documentIds,
      entityType: attachedTo,
      entityId: attachedId
    });

    try {
      // Vérification des permissions sur l'entité
      const accessCheck = await checkEntityAccess(attachedTo, attachedId, userId, companyId);
      if (!accessCheck.hasAccess) {
        return NextResponse.json(
          { success: false, error: accessCheck.error || 'Accès refusé à cette entité' },
          { status: 403 }
        );
      }

      // Mise à jour des documents pour les attacher à l'entité
      const updatedDocuments = await prisma.document.updateMany({
        where: {
          id: { in: documentIds },
          OR: [
            { userId },
            { companyId },
            { isPublic: true }
          ]
        },
        data: {
          attachedTo,
          attachedId
        }
      });

      logAction('Attach Documents - Success', userId, { 
        userId, 
        entityType: attachedTo,
        entityId: attachedId,
        updatedCount: updatedDocuments.count
      });

      return NextResponse.json(
        {
          success: true,
          message: `${updatedDocuments.count} document(s) attaché(s) avec succès`,
          data: {
            updatedCount: updatedDocuments.count,
            entity: {
              type: attachedTo,
              id: attachedId
            }
          }
        },
        { status: 200 }
      );

    } catch (dbError) {
      logAction('Attach Documents - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error',
        entityType: attachedTo,
        entityId: attachedId
      });

      return NextResponse.json(
        { success: false, error: 'Erreur lors de l\'attachement des documents' },
        { status: 500 }
      );
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown';
    logAction('Attach Documents - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/by-attachment - Détacher des documents d'une entité
export async function DELETE(request: NextRequest) {
  try {
    const auth = validateAuth(request);
    if (!auth.valid) {
      logAction('Detach Documents - Auth failed', 'unknown', { error: auth.error });
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    const userId = auth.userId!;
    const companyId = auth.companyId;

    // Extraction et validation des données
    const { searchParams } = new URL(request.url);
    const documentIds = searchParams.get('documentIds')?.split(',') || [];
    const attachedTo = searchParams.get('attachedTo');
    const attachedId = searchParams.get('attachedId');

    if (documentIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Liste des IDs de documents requise' },
        { status: 400 }
      );
    }

    if (!attachedTo || !attachedId) {
      return NextResponse.json(
        { success: false, error: 'Type et ID de l\'entité requis' },
        { status: 400 }
      );
    }

    logAction('Detach Documents', userId, { 
      userId, 
      documentIds,
      entityType: attachedTo,
      entityId: attachedId
    });

    try {
      // Vérification des permissions sur l'entité
      const accessCheck = await checkEntityAccess(attachedTo, attachedId, userId, companyId);
      if (!accessCheck.hasAccess) {
        return NextResponse.json(
          { success: false, error: accessCheck.error || 'Accès refusé à cette entité' },
          { status: 403 }
        );
      }

      // Mise à jour des documents pour détacher de l'entité
      const updatedDocuments = await prisma.document.updateMany({
        where: {
          id: { in: documentIds },
          attachedTo,
          attachedId,
          OR: [
            { userId },
            { companyId },
            { isPublic: true }
          ]
        },
        data: {
          attachedTo: null,
          attachedId: null
        }
      });

      logAction('Detach Documents - Success', userId, { 
        userId, 
        entityType: attachedTo,
        entityId: attachedId,
        updatedCount: updatedDocuments.count
      });

      return NextResponse.json(
        {
          success: true,
          message: `${updatedDocuments.count} document(s) détaché(s) avec succès`,
          data: {
            updatedCount: updatedDocuments.count,
            entity: {
              type: attachedTo,
              id: attachedId
            }
          }
        },
        { status: 200 }
      );

    } catch (dbError) {
      logAction('Detach Documents - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error',
        entityType: attachedTo,
        entityId: attachedId
      });

      return NextResponse.json(
        { success: false, error: 'Erreur lors du détachement des documents' },
        { status: 500 }
      );
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown';
    logAction('Detach Documents - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

// Gestion des autres méthodes
export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Méthode PUT non supportée. Utilisez POST pour attacher ou DELETE pour détacher' },
    { status: 405 }
  );
}