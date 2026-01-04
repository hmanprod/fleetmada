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
const DocumentCreateSchema = z.object({
  attachedTo: z.string().optional(),
  attachedId: z.string().optional(),
  labels: z.string().optional(),
  description: z.string().optional(),
  isPublic: z.string().transform(Boolean).default('false'),
  companyId: z.string().optional()
});

const DocumentListQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
  search: z.string().optional(),
  mimeType: z.string().optional(),
  attachedTo: z.string().optional(),
  attachedId: z.string().optional(),
  labels: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'fileName', 'fileSize']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Types TypeScript
type CreateDocumentInput = z.infer<typeof DocumentCreateSchema>;
type DocumentListQuery = z.infer<typeof DocumentListQuerySchema>;

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

// GET /api/documents - Liste paginée avec filtres
export async function GET(request: NextRequest) {
  try {
    const auth = validateAuth(request);
    if (!auth.valid) {
      logAction('GET Documents - Auth failed', 'unknown', { error: auth.error });
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    const userId = auth.userId!;
    const companyId = auth.companyId;

    // Extraction et validation des paramètres de requête
    const { searchParams } = new URL(request.url);
    const queryParams: any = {};

    for (const [key, value] of searchParams.entries()) {
      queryParams[key] = value;
    }

    let query;
    try {
      query = DocumentListQuerySchema.parse(queryParams);
    } catch (zodError) {
      console.error('[Documents API] GET Query Parsing error:', zodError);
      const detail = zodError instanceof z.ZodError ? JSON.stringify(zodError.format()) : (zodError as Error).message;
      return NextResponse.json(
        { success: false, error: `Paramètres de requête invalides: ${detail}` },
        { status: 400 }
      );
    }

    const offset = (query.page - 1) * query.limit;

    logAction('GET Documents', userId, {
      userId,
      page: query.page,
      limit: query.limit,
      filters: {
        search: query.search,
        mimeType: query.mimeType,
        attachedTo: query.attachedTo,
        labels: query.labels
      }
    });

    try {
      // Construction des filtres
      const accessFilters = {
        OR: [
          { userId },
          ...(companyId ? [{ companyId }] : []),
          { isPublic: true }
        ]
      };

      const searchFilters: any = {};
      if (query.search) {
        searchFilters.OR = [
          { fileName: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
          { labels: { has: query.search } }
        ];
      }

      const filters = {
        AND: [
          accessFilters,
          searchFilters,
          query.mimeType ? { mimeType: { contains: query.mimeType } } : {},
          query.attachedTo ? { attachedTo: query.attachedTo } : {},
          query.attachedId ? { attachedId: query.attachedId } : {},
          query.labels ? { labels: { hasSome: query.labels.split(',').map((l: string) => l.trim()) } } : {}
        ].filter(condition => Object.keys(condition).length > 0)
      };

      console.log('[Documents API] Applying filters:', JSON.stringify(filters, null, 2));

      // Construction de l'ordre de tri
      const orderBy: any = {};
      if (['createdAt', 'updatedAt', 'fileName', 'fileSize'].includes(query.sortBy)) {
        orderBy[query.sortBy] = query.sortOrder;
      } else {
        orderBy.createdAt = 'desc';
      }

      // Log total count for debugging
      const debugTotalCount = await prisma.document.count();
      const debugLatestDocs = await prisma.document.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, fileName: true, userId: true, companyId: true, isPublic: true, labels: true }
      });

      console.log(`[Documents API] DEBUG: Total documents in DB: ${debugTotalCount}`);
      console.log(`[Documents API] DEBUG: Latest documents: ${JSON.stringify(debugLatestDocs, null, 2)}`);

      // Récupération des documents avec pagination
      const [documents, totalCount] = await Promise.all([
        prisma.document.findMany({
          where: filters,
          orderBy,
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
        prisma.document.count({ where: filters })
      ]);

      const totalPages = Math.ceil(totalCount / query.limit);

      logAction('GET Documents - Success', userId, {
        userId,
        totalCount,
        page: query.page,
        totalPages
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            data: documents,
            pagination: {
              page: query.page,
              limit: query.limit,
              totalCount,
              totalPages,
              hasNext: query.page < totalPages,
              hasPrev: query.page > 1
            },
            debug: {
              totalInDb: debugTotalCount,
              latestDocs: debugLatestDocs,
              appliedFilters: filters
            }
          }
        },
        { status: 200 }
      );

    } catch (dbError) {
      logAction('GET Documents - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      });

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des documents' },
        { status: 500 }
      );
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown';
    logAction('GET Documents - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

// POST /api/documents - Upload d'un nouveau document
export async function POST(request: NextRequest) {
  try {
    const auth = validateAuth(request);
    if (!auth.valid) {
      logAction('POST Documents - Auth failed', 'unknown', { error: auth.error });
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    const userId = auth.userId!;
    const companyId = auth.companyId;

    // Extraction et validation des données
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Validation du fichier
    const fileValidation = validateFile(file);
    if (!fileValidation.valid) {
      return NextResponse.json(
        { success: false, error: fileValidation.error },
        { status: 400 }
      );
    }

    // Extraction des métadonnées
    const metadata = DocumentCreateSchema.parse({
      attachedTo: formData.get('attachedTo') as string || undefined,
      attachedId: formData.get('attachedId') as string || undefined,
      labels: formData.get('labels') as string || undefined,
      description: formData.get('description') as string || undefined,
      isPublic: formData.get('isPublic') as string || 'false',
      companyId: formData.get('companyId') as string || undefined
    });

    logAction('POST Documents', userId, {
      userId,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      attachedTo: metadata.attachedTo
    });

    try {
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

      logAction('POST Documents - Success', userId, {
        userId,
        documentId: document.id,
        fileName: document.fileName
      });

      return NextResponse.json(
        {
          success: true,
          data: document,
          message: 'Document uploadé avec succès'
        },
        { status: 201 }
      );

    } catch (dbError) {
      logAction('POST Documents - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      });

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création du document' },
        { status: 500 }
      );
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown';

    // Gestion des erreurs de validation
    if (error instanceof Error && error.name === 'ZodError') {
      logAction('POST Documents - Validation error', userId, {
        error: error.message
      });

      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.message },
        { status: 400 }
      );
    }

    logAction('POST Documents - Server error', userId, {
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
    { success: false, error: 'Méthode PUT non supportée. Utilisez /api/documents/[id]' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Méthode DELETE non supportée. Utilisez /api/documents/[id]' },
    { status: 405 }
  );
}