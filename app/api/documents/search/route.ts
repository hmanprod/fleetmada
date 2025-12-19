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

// Schéma de validation pour la recherche
const DocumentSearchSchema = z.object({
  search: z.string().min(1, 'Terme de recherche requis'),
  limit: z.string().transform(Number).default('50'),
  mimeTypes: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sizeMin: z.string().transform(Number).optional(),
  sizeMax: z.string().transform(Number).optional(),
  ownerIds: z.string().optional(),
  labels: z.string().optional(),
  attachedTo: z.string().optional()
});

// Types TypeScript
type DocumentSearchInput = z.infer<typeof DocumentSearchSchema>;

// Fonction de logging
const logAction = (action: string, userId: string, details: any) => {
  console.log(`[Documents Search API] ${new Date().toISOString()} - ${action} - User: ${userId}:`, details);
};

// Fonction de validation du token JWT
const validateToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    const decoded = jwt.verify(token, secret) as TokenPayload;

    if (decoded.type !== 'login') {
      console.log('[Documents Search API] Token type invalide:', decoded.type);
      return null;
    }

    return decoded;
  } catch (error) {
    console.log('[Documents Search API] Token validation failed:', error instanceof Error ? error.message : 'Unknown error');
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

// GET /api/documents/search - Recherche avancée de documents
export async function GET(request: NextRequest) {
  try {
    const auth = validateAuth(request);
    if (!auth.valid) {
      logAction('Search Documents - Auth failed', 'unknown', { error: auth.error });
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    const userId = auth.userId!;
    const companyId = auth.companyId;

    // Extraction et validation des paramètres de recherche
    const { searchParams } = new URL(request.url);
    const queryParams: any = {};
    
    for (const [key, value] of searchParams.entries()) {
      queryParams[key] = value;
    }

    const searchInput = DocumentSearchSchema.parse(queryParams);

    logAction('Search Documents', userId, { 
      userId, 
      searchTerm: searchInput.search,
      filters: {
        mimeTypes: searchInput.mimeTypes,
        dateRange: { from: searchInput.dateFrom, to: searchInput.dateTo },
        sizeRange: { min: searchInput.sizeMin, max: searchInput.sizeMax },
        ownerIds: searchInput.ownerIds,
        labels: searchInput.labels,
        attachedTo: searchInput.attachedTo
      }
    });

    try {
      // Construction des filtres de recherche
      const filters: any = {
        OR: [
          { userId },
          { companyId },
          { isPublic: true }
        ]
      };

      // Recherche textuelle dans le nom, description et labels
      const searchTerms = searchInput.search.toLowerCase().split(' ').filter(term => term.length > 0);
      
      if (searchTerms.length > 0) {
        filters.AND = searchTerms.map(term => ({
          OR: [
            { fileName: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
            { labels: { has: term } }
          ]
        }));
      }

      // Filtre par types MIME
      if (searchInput.mimeTypes) {
        const mimeTypes = searchInput.mimeTypes.split(',').map(type => type.trim());
        filters.mimeType = { in: mimeTypes };
      }

      // Filtre par date
      if (searchInput.dateFrom || searchInput.dateTo) {
        filters.createdAt = {};
        if (searchInput.dateFrom) {
          filters.createdAt.gte = new Date(searchInput.dateFrom);
        }
        if (searchInput.dateTo) {
          filters.createdAt.lte = new Date(searchInput.dateTo);
        }
      }

      // Filtre par taille
      if (searchInput.sizeMin || searchInput.sizeMax) {
        filters.fileSize = {};
        if (searchInput.sizeMin !== undefined) {
          filters.fileSize.gte = searchInput.sizeMin;
        }
        if (searchInput.sizeMax !== undefined) {
          filters.fileSize.lte = searchInput.sizeMax;
        }
      }

      // Filtre par propriétaire
      if (searchInput.ownerIds) {
        const ownerIds = searchInput.ownerIds.split(',').map(id => id.trim());
        filters.userId = { in: ownerIds };
      }

      // Filtre par étiquettes
      if (searchInput.labels) {
        const labels = searchInput.labels.split(',').map(label => label.trim());
        filters.labels = { hasSome: labels };
      }

      // Filtre par entité attachée
      if (searchInput.attachedTo) {
        filters.attachedTo = searchInput.attachedTo;
      }

      // Recherche avec pagination
      const [documents, totalCount] = await Promise.all([
        prisma.document.findMany({
          where: filters,
          orderBy: { createdAt: 'desc' },
          take: searchInput.limit,
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

      // Génération des facettes pour l'interface utilisateur
      const [typeFacets, ownerFacets, dateFacets] = await Promise.all([
        // Facette par type MIME
        prisma.document.groupBy({
          by: ['mimeType'],
          where: filters,
          _count: { mimeType: true },
          orderBy: { _count: { mimeType: 'desc' } }
        }),
        
        // Facette par propriétaire
        prisma.document.groupBy({
          by: ['userId'],
          where: filters,
          _count: { userId: true },
          orderBy: { _count: { userId: 'desc' } }
        }).then(async (ownerGroups) => {
          // Récupération des détails des utilisateurs
          const userIds = ownerGroups.map(group => group.userId);
          const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, email: true }
          });
          
          return ownerGroups.map(group => ({
            userId: group.userId,
            user: users.find(u => u.id === group.userId),
            count: group._count.userId
          }));
        }),
        
        // Facette par période
        prisma.document.groupBy({
          by: ['createdAt'],
          where: filters,
          _count: { createdAt: true }
        }).then((dateGroups) => {
          // Regroupement par mois/année
          const dateRanges: Record<string, number> = {};
          
          dateGroups.forEach(group => {
            const date = new Date(group.createdAt);
            const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            dateRanges[period] = (dateRanges[period] || 0) + group._count.createdAt;
          });
          
          return Object.entries(dateRanges).map(([period, count]) => ({
            period,
            count
          }));
        })
      ]);

      const facets = {
        byType: typeFacets.reduce((acc, facet) => {
          acc[facet.mimeType] = facet._count.mimeType;
          return acc;
        }, {} as Record<string, number>),
        byOwner: Array.isArray(ownerFacets) ? ownerFacets.reduce((acc, facet) => {
          const ownerName = facet.user ? facet.user.name : 'Utilisateur inconnu';
          acc[ownerName] = facet.count;
          return acc;
        }, {} as Record<string, number>) : {},
        byDateRange: Array.isArray(dateFacets) ? dateFacets.reduce((acc, facet) => {
          acc[facet.period] = facet.count;
          return acc;
        }, {} as Record<string, number>) : {}
      };

      logAction('Search Documents - Success', userId, { 
        userId, 
        searchTerm: searchInput.search,
        resultsCount: documents.length,
        totalCount
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            documents,
            totalCount,
            searchQuery: searchInput.search,
            facets
          }
        },
        { status: 200 }
      );

    } catch (dbError) {
      logAction('Search Documents - Database error', userId, {
        error: dbError instanceof Error ? dbError.message : 'Unknown database error',
        searchTerm: searchInput.search
      });

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la recherche de documents' },
        { status: 500 }
      );
    }

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown';
    
    // Gestion des erreurs de validation
    if (error instanceof Error && error.name === 'ZodError') {
      logAction('Search Documents - Validation error', userId, {
        error: error.message
      });

      return NextResponse.json(
        { success: false, error: 'Paramètres de recherche invalides', details: error.message },
        { status: 400 }
      );
    }

    logAction('Search Documents - Server error', userId, {
      error: error instanceof Error ? error.message : 'Unknown server error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

// POST /api/documents/search - Recherche avec corps de requête (pour les requêtes complexes)
export async function POST(request: NextRequest) {
  try {
    const auth = validateAuth(request);
    if (!auth.valid) {
      logAction('Search Documents (POST) - Auth failed', 'unknown', { error: auth.error });
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    const userId = auth.userId!;
    const body = await request.json();

    // Pour l'instant, redirige vers GET avec les mêmes paramètres
    const url = new URL(request.url);
    Object.entries(body).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });

    return GET(new NextRequest(url.toString(), {
      headers: request.headers
    }));

  } catch (error) {
    const userId = request.headers.get('x-user-id') || 'unknown';
    logAction('Search Documents (POST) - Server error', userId, {
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