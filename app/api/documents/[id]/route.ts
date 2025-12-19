import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Interface pour les données du token JWT décodé
interface TokenPayload {
  userId: string;
  email: string;
  companyId?: string;
  type: string;
  iat: number;
  exp?: number;
}

// Schémas de validation
const DocumentUpdateSchema = z.object({
  attachedTo: z.string().optional(),
  attachedId: z.string().optional(),
  labels: z.string().optional(),
  description: z.string().optional(),
  isPublic: z.string().transform(Boolean).optional()
});

// Types TypeScript
type UpdateDocumentInput = z.infer<typeof DocumentUpdateSchema>;

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Documents API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details);
};

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    const decoded = jwt.verify(token, secret) as TokenPayload;

    if (decoded.type !== 'login') {
      console.log('[Documents API] Token type invalide:', decoded.type);
      return null;
    }

    return decoded;
  } catch (error) {
    console.log('[Documents API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error');
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

// Fonction de vérification des permissions sur le document
const checkDocumentAccess = async (documentId: string, userId: string, companyId?: string) => {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      user: {
        select: { id: true, companyId: true }
      }
    }
  });

  if (!document) {
    return { hasAccess: false, error: 'Document non trouvé', document: null };
  }

  // Vérification des permissions
  const isOwner = document.userId === userId;
  const isCompanyMember = document.companyId && document.companyId === companyId;
  const isPublic = document.isPublic;

  if (!isOwner && !isCompanyMember && !isPublic) {
    return { hasAccess: false, error: 'Accès refusé à ce document', document: null };
  }

  return { hasAccess: true, document };
};

// GET /api/documents/[id] - Récupération d'un document spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = validateAuth(request);
    if (!auth.valid) {
      logAction('GET Document - Auth failed', 'unknown', { error: auth.error });
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    const userId = auth.userId!;
    const companyId = auth.companyId;

    logAction('GET Document', userId, { 
      userId, 
      documentId: params.id
    });

    try {
      // Vérification des permissions et récupération du document
      const accessCheck = await checkDocumentAccess(params.id, userId, companyId);
      if (!accessCheck.hasAccess) {
        return NextResponse.json(
          { success: false, error: accessCheck.error },
          { status: 403 }
        );
      }

      const document = accessCheck.document!;

      return NextResponse.json(
        {
          success: true,
          data: document
        },
        { status: 200 }
      );

    } catch (dbError) {
      logAction('GET Document - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error',
        documentId: params.id
      });

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération du document' },
        { status: 500 }
      );
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown';
    logAction('GET Document - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined,
      documentId: params.id
    });

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

// PUT /api/documents/[id] - Mise à jour d'un document
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = validateAuth(request);
    if (!auth.valid) {
      logAction('PUT Document - Auth failed', 'unknown', { error: auth.error });
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    const userId = auth.userId!;
    const companyId = auth.companyId;

    logAction('PUT Document', userId, { 
      userId, 
      documentId: params.id
    });

    try {
      // Vérification des permissions
      const accessCheck = await checkDocumentAccess(params.id, userId, companyId);
      if (!accessCheck.hasAccess) {
        return NextResponse.json(
          { success: false, error: accessCheck.error },
          { status: 403 }
        );
      }

      const document = accessCheck.document!;

      // Seul le propriétaire peut modifier les métadonnées
      if (document.userId !== userId) {
        return NextResponse.json(
          { success: false, error: 'Seul le propriétaire peut modifier ce document' },
          { status: 403 }
        );
      }

      // Extraction et validation des données
      const body = await request.json();
      const updateData = DocumentUpdateSchema.parse(body);

      // Préparation des données de mise à jour
      const dataToUpdate: any = {};

      if (updateData.attachedTo !== undefined) {
        dataToUpdate.attachedTo = updateData.attachedTo;
      }

      if (updateData.attachedId !== undefined) {
        dataToUpdate.attachedId = updateData.attachedId;
      }

      if (updateData.labels !== undefined) {
        dataToUpdate.labels = updateData.labels.split(',').map(label => label.trim());
      }

      if (updateData.description !== undefined) {
        dataToUpdate.description = updateData.description;
      }

      if (updateData.isPublic !== undefined) {
        dataToUpdate.isPublic = updateData.isPublic;
      }

      // Mise à jour du document
      const updatedDocument = await prisma.document.update({
        where: { id: params.id },
        data: dataToUpdate,
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          company: {
            select: { id: true, name: true }
          }
        }
      });

      logAction('PUT Document - Success', userId, { 
        userId, 
        documentId: updatedDocument.id,
        updatedFields: Object.keys(dataToUpdate)
      });

      return NextResponse.json(
        {
          success: true,
          data: updatedDocument,
          message: 'Document mis à jour avec succès'
        },
        { status: 200 }
      );

    } catch (dbError) {
      logAction('PUT Document - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error',
        documentId: params.id
      });

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour du document' },
        { status: 500 }
      );
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown';
    
    // Gestion des erreurs de validation
    if (error instanceof Error && error.name === 'ZodError') {
      logAction('PUT Document - Validation error', userId, {
        error: error.message,
        documentId: params.id
      });

      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.message },
        { status: 400 }
      );
    }

    logAction('PUT Document - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined,
      documentId: params.id
    });

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/[id] - Suppression d'un document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = validateAuth(request);
    if (!auth.valid) {
      logAction('DELETE Document - Auth failed', 'unknown', { error: auth.error });
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    const userId = auth.userId!;
    const companyId = auth.companyId;

    logAction('DELETE Document', userId, { 
      userId, 
      documentId: params.id
    });

    try {
      // Vérification des permissions
      const accessCheck = await checkDocumentAccess(params.id, userId, companyId);
      if (!accessCheck.hasAccess) {
        return NextResponse.json(
          { success: false, error: accessCheck.error },
          { status: 403 }
        );
      }

      const document = accessCheck.document!;

      // Seul le propriétaire peut supprimer le document
      if (document.userId !== userId) {
        return NextResponse.json(
          { success: false, error: 'Seul le propriétaire peut supprimer ce document' },
          { status: 403 }
        );
      }

      // Suppression du document
      await prisma.document.delete({
        where: { id: params.id }
      });

      logAction('DELETE Document - Success', userId, { 
        userId, 
        documentId: params.id,
        fileName: document.fileName
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Document supprimé avec succès'
        },
        { status: 200 }
      );

    } catch (dbError) {
      logAction('DELETE Document - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error',
        documentId: params.id
      });

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression du document' },
        { status: 500 }
      );
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown';
    logAction('DELETE Document - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined,
      documentId: params.id
    });

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

// Gestion des autres méthodes
export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Méthode POST non supportée. Utilisez /api/documents' },
    { status: 405 }
  );
}