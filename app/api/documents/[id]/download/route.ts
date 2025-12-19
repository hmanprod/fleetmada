import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

// Interface pour les données du token JWT décodé
interface TokenPayload {
  userId: string;
  email: string;
  companyId?: string;
  type: string;
  iat: number;
  exp?: number;
}

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Documents Download API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details);
};

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    const decoded = jwt.verify(token, secret) as TokenPayload;

    if (decoded.type !== 'login') {
      console.log('[Documents Download API] Token type invalide:', decoded.type);
      return null;
    }

    return decoded;
  } catch (error) {
    console.log('[Documents Download API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error');
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

// GET /api/documents/[id]/download - Téléchargement sécurisé d'un document
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = validateAuth(request);
    if (!auth.valid) {
      logAction('Download Document - Auth failed', 'unknown', { error: auth.error });
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    const userId = auth.userId!;
    const companyId = auth.companyId;

    logAction('Download Document', userId, { 
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

      // Dans une implémentation réelle, vous chargeriez le fichier depuis votre service de stockage
      // (AWS S3, Google Cloud Storage, etc.)
      // Ici, nous simulons un fichier avec des données factices

      const fileBuffer = Buffer.from(`Contenu du fichier: ${document.fileName}\nTaille: ${document.fileSize} bytes\nType: ${document.mimeType}\nChecksum: ${document.checksum || 'N/A'}`);

      // Configuration des headers pour le téléchargement
      const downloadHeaders = new Headers();
      downloadHeaders.set('Content-Type', document.mimeType);
      downloadHeaders.set('Content-Length', document.fileSize.toString());
      downloadHeaders.set('Content-Disposition', `attachment; filename="${encodeURIComponent(document.fileName)}"`);
      
      // Ajout d'en-têtes de sécurité
      downloadHeaders.set('X-Content-Type-Options', 'nosniff');
      downloadHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      downloadHeaders.set('Pragma', 'no-cache');
      downloadHeaders.set('Expires', '0');

      logAction('Download Document - Success', userId, { 
        userId, 
        documentId: document.id,
        fileName: document.fileName,
        fileSize: document.fileSize,
        mimeType: document.mimeType
      });

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: downloadHeaders
      });

    } catch (fileError) {
      logAction('Download Document - File error', userId, {
        error: fileError instanceof Error ? fileError.message : 'Unknown file error',
        documentId: params.id
      });

      return NextResponse.json(
        { success: false, error: 'Erreur lors du chargement du fichier' },
        { status: 500 }
      );
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown';
    logAction('Download Document - Server error', userId, {
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

// POST /api/documents/[id]/download - Pour les téléchargements avec paramètres (preview, etc.)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = validateAuth(request);
    if (!auth.valid) {
      logAction('Download Document (POST) - Auth failed', 'unknown', { error: auth.error });
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    const userId = auth.userId!;
    const companyId = auth.companyId;

    // Extraction des paramètres optionnels
    const body = await request.json().catch(() => ({}));
    const { action = 'download', format = 'original' } = body;

    logAction('Download Document (POST)', userId, { 
      userId, 
      documentId: params.id,
      action,
      format
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

      if (action === 'preview') {
        // Génération d'un lien de prévisualisation (par exemple pour les images/PDF)
        return NextResponse.json(
          {
            success: true,
            data: {
              previewUrl: `/api/documents/${params.id}/download?format=${format}`,
              expiresAt: new Date(Date.now() + 3600000), // Expire dans 1 heure
              document: {
                id: document.id,
                fileName: document.fileName,
                mimeType: document.mimeType,
                fileSize: document.fileSize
              }
            }
          },
          { status: 200 }
        );
      }

      // Action par défaut : téléchargement normal
      return NextResponse.redirect(`/api/documents/${params.id}/download`);

    } catch (dbError) {
      logAction('Download Document (POST) - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error',
        documentId: params.id
      });

      return NextResponse.json(
        { success: false, error: 'Erreur lors du traitement de la demande' },
        { status: 500 }
      );
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown';
    logAction('Download Document (POST) - Server error', userId, {
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
export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Méthode PUT non supportée' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Méthode DELETE non supportée' },
    { status: 405 }
  );
}