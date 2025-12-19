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
const UploadMultipleSchema = z.object({
  attachedTo: z.string().optional(),
  attachedId: z.string().optional(),
  labels: z.string().optional(),
  description: z.string().optional(),
  isPublic: z.string().transform(Boolean).default('false'),
  companyId: z.string().optional()
});

const UploadProgressSchema = z.object({
  fileName: z.string(),
  progress: z.number().min(0).max(100),
  status: z.enum(['uploading', 'processing', 'completed', 'error']),
  error: z.string().optional()
});

// Types TypeScript
type UploadMultipleInput = z.infer<typeof UploadMultipleSchema>;
type UploadProgress = z.infer<typeof UploadProgressSchema>;

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Documents Upload API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details);
};

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    const decoded = jwt.verify(token, secret) as TokenPayload;

    if (decoded.type !== 'login') {
      console.log('[Documents Upload API] Token type invalide:', decoded.type);
      return null;
    }

    return decoded;
  } catch (error) {
    console.log('[Documents Upload API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error');
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

// Fonction de validation du fichier
const validateFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return { valid: false, error: 'Fichier trop volumineux (max 50MB)' };
  }

  // Types MIME autorisés
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv',
    'application/zip', 'application/x-rar-compressed'
  ];

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Type de fichier non autorisé' };
  }

  return { valid: true };
};

// Fonction de traitement d'un fichier
const processFile = async (file: File, metadata: UploadMultipleInput, userId: string, companyId?: string) => {
  try {
    // Validation du fichier
    const fileValidation = validateFile(file);
    if (!fileValidation.valid) {
      return {
        success: false,
        fileName: file.name,
        error: fileValidation.error
      };
    }

    // Génération du nom de fichier unique
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${timestamp}_${sanitizedFileName}`;
    
    // Chemin de stockage
    const filePath = `/uploads/documents/${uniqueFileName}`;

    // Sauvegarde du fichier (ici on simule le stockage)
    // Dans une implémentation réelle, vous utiliseriez un service de stockage comme AWS S3
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Génération du checksum pour l'intégrité
    const checksum = crypto.createHash('sha256').update(buffer).digest('hex');

    // Création du document en base
    const document = await prisma.document.create({
      data: {
        fileName: file.name,
        fileSize: file.size,
        filePath,
        mimeType: file.type,
        userId,
        companyId: metadata.companyId || companyId || null,
        attachedTo: metadata.attachedTo || null,
        attachedId: metadata.attachedId || null,
        labels: metadata.labels ? metadata.labels.split(',').map(label => label.trim()) : [],
        description: metadata.description || null,
        checksum,
        isPublic: metadata.isPublic,
        version: 1
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        company: {
          select: { id: true, name: true }
        }
      }
    });

    return {
      success: true,
      document,
      fileName: file.name
    };

  } catch (error) {
    return {
      success: false,
      fileName: file.name,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
};

// POST /api/documents/upload - Upload multiple de documents
export async function POST(request: NextRequest) {
  try {
    const auth = validateAuth(request);
    if (!auth.valid) {
      logAction('POST Upload Multiple - Auth failed', 'unknown', { error: auth.error });
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    const userId = auth.userId!;
    const companyId = auth.companyId;

    logAction('POST Upload Multiple', userId, { userId });

    try {
      // Extraction et validation des données
      const formData = await request.formData();
      const files = formData.getAll('files') as File[];

      if (!files || files.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Aucun fichier fourni' },
          { status: 400 }
        );
      }

      // Limitation du nombre de fichiers (max 10)
      if (files.length > 10) {
        return NextResponse.json(
          { success: false, error: 'Trop de fichiers (maximum 10)' },
          { status: 400 }
        );
      }

      // Extraction des métadonnées
      const metadata = UploadMultipleSchema.parse({
        attachedTo: formData.get('attachedTo') as string,
        attachedId: formData.get('attachedId') as string,
        labels: formData.get('labels') as string,
        description: formData.get('description') as string,
        isPublic: formData.get('isPublic') as string || 'false',
        companyId: formData.get('companyId') as string
      });

      logAction('POST Upload Multiple - Processing', userId, { 
        userId, 
        fileCount: files.length,
        metadata: {
          attachedTo: metadata.attachedTo,
          isPublic: metadata.isPublic
        }
      });

      // Traitement des fichiers en parallèle
      const uploadPromises = files.map(file => processFile(file, metadata, userId, companyId));
      const results = await Promise.all(uploadPromises);

      // Séparation des succès et erreurs
      const successful = results.filter(result => result.success);
      const failed = results.filter(result => !result.success);

      logAction('POST Upload Multiple - Results', userId, { 
        userId, 
        totalFiles: files.length,
        successful: successful.length,
        failed: failed.length
      });

      // Préparation de la réponse
      const responseData = {
        success: true,
        message: `${successful.length} fichier(s) uploadé(s) avec succès${failed.length > 0 ? `, ${failed.length} erreur(s)` : ''}`,
        data: {
          successful: successful.map(result => ({
            document: (result as any).document,
            fileName: result.fileName
          })),
          failed: failed.map(result => ({
            fileName: result.fileName,
            error: result.error
          })),
          summary: {
            total: files.length,
            successful: successful.length,
            failed: failed.length
          }
        }
      };

      const statusCode = failed.length === 0 ? 201 : 207; // 207 = Multi-Status pour les uploads partiels

      return NextResponse.json(responseData, { status: statusCode });

    } catch (dbError) {
      logAction('POST Upload Multiple - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      });

      return NextResponse.json(
        { success: false, error: 'Erreur lors de l\'upload des documents' },
        { status: 500 }
      );
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown';
    
    // Gestion des erreurs de validation
    if (error instanceof Error && error.name === 'ZodError') {
      logAction('POST Upload Multiple - Validation error', userId, {
        error: error.message
      });

      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.message },
        { status: 400 }
      );
    }

    logAction('POST Upload Multiple - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

// GET /api/documents/upload - Statut d'upload (pour les uploads en cours)
export async function GET(request: NextRequest) {
  try {
    const auth = validateAuth(request);
    if (!auth.valid) {
      logAction('GET Upload Status - Auth failed', 'unknown', { error: auth.error });
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    const userId = auth.userId!;
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    // Dans une implémentation réelle, vous stockerez le statut des uploads
    // en session ou en cache pour permettre le suivi en temps réel
    const uploadStatus = {
      sessionId: sessionId || 'default',
      uploads: [],
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(
      {
        success: true,
        data: uploadStatus
      },
      { status: 200 }
    );

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown';
    logAction('GET Upload Status - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error'
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