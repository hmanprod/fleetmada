import { useState, useCallback, useMemo } from 'react';
import { Document, DocumentSearchResult, ApiResponse } from '@/types/documents';
import { useAuthToken } from './useAuthToken';

interface UseDocumentSearchReturn {
  searchResults: Document[];
  totalCount: number;
  facets: {
    byType: Record<string, number>;
    byOwner: Record<string, number>;
    byDateRange: Record<string, number>;
  };
  loading: boolean;
  error: string | null;
  searchDocuments: (query: string, options?: SearchOptions) => Promise<void>;
  clearResults: () => void;
  clearError: () => void;
  hasSearched: boolean;
}

interface SearchOptions {
  mimeTypes?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  sizeRange?: {
    min: number; // en bytes
    max: number; // en bytes
  };
  ownerIds?: string[];
  labels?: string[];
  limit?: number;
}

export const useDocumentSearch = (): UseDocumentSearchReturn => {
  const [searchResults, setSearchResults] = useState<Document[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [facets, setFacets] = useState<UseDocumentSearchReturn['facets']>({
    byType: {},
    byOwner: {},
    byDateRange: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const { token } = useAuthToken();

  const buildSearchQuery = useCallback((query: string, options: SearchOptions = {}): string => {
    const params = new URLSearchParams();
    params.append('search', query);
    params.append('limit', (options.limit || 50).toString());

    if (options.mimeTypes && options.mimeTypes.length > 0) {
      params.append('mimeTypes', options.mimeTypes.join(','));
    }

    if (options.dateRange) {
      params.append('dateFrom', options.dateRange.from.toISOString());
      params.append('dateTo', options.dateRange.to.toISOString());
    }

    if (options.sizeRange) {
      params.append('sizeMin', options.sizeRange.min.toString());
      params.append('sizeMax', options.sizeRange.max.toString());
    }

    if (options.ownerIds && options.ownerIds.length > 0) {
      params.append('ownerIds', options.ownerIds.join(','));
    }

    if (options.labels && options.labels.length > 0) {
      params.append('labels', options.labels.join(','));
    }

    return params.toString();
  }, []);

  const searchDocuments = useCallback(async (
    query: string,
    options: SearchOptions = {}
  ): Promise<void> => {
    if (!token) {
      setError('Token d\'authentification manquant');
      return;
    }

    if (!query.trim()) {
      setError('Requête de recherche vide');
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const queryString = buildSearchQuery(query, options);
      const response = await fetch(`/api/documents/search?${queryString}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result: ApiResponse<DocumentSearchResult> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors de la recherche de documents');
      }

      if (result.data) {
        setSearchResults(result.data.documents);
        setTotalCount(result.data.totalCount);
        setFacets(result.data.facets);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur lors de la recherche de documents:', err);

      // Réinitialiser les résultats en cas d'erreur
      setSearchResults([]);
      setTotalCount(0);
      setFacets({
        byType: {},
        byOwner: {},
        byDateRange: {}
      });
    } finally {
      setLoading(false);
    }
  }, [token, buildSearchQuery]);

  const clearResults = useCallback(() => {
    setSearchResults([]);
    setTotalCount(0);
    setFacets({
      byType: {},
      byOwner: {},
      byDateRange: {}
    });
    setHasSearched(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Résultats formatés pour l'affichage
  const formattedResults = useMemo(() => {
    return searchResults.map(doc => ({
      ...doc,
      fileSizeFormatted: formatFileSize(doc.fileSize),
      createdAtFormatted: new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(doc.createdAt)),
      mimeTypeCategory: getMimeTypeCategory(doc.mimeType)
    }));
  }, [searchResults]);

  return {
    searchResults: formattedResults,
    totalCount,
    facets,
    loading,
    error,
    searchDocuments,
    clearResults,
    clearError,
    hasSearched
  };
};

// Utilitaires pour le formatage (importés depuis types/documents)
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getMimeTypeCategory = (mimeType: string): string | null => {
  const categories = {
    'image/jpeg': 'Image',
    'image/png': 'Image',
    'image/gif': 'Image',
    'image/webp': 'Image',
    'image/svg+xml': 'Image',
    'application/pdf': 'PDF',
    'application/msword': 'Document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Document',
    'application/vnd.ms-excel': 'Document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Document',
    'application/vnd.ms-powerpoint': 'Document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'Document',
    'text/plain': 'Texte',
    'text/csv': 'Texte',
    'text/html': 'Texte',
    'text/xml': 'Texte',
    'application/zip': 'Archive',
    'application/x-rar-compressed': 'Archive',
    'application/x-7z-compressed': 'Archive',
    'audio/mpeg': 'Audio',
    'audio/wav': 'Audio',
    'audio/ogg': 'Audio',
    'video/mp4': 'Vidéo',
    'video/avi': 'Vidéo',
    'video/mov': 'Vidéo',
    'video/wmv': 'Vidéo'
  };

  return categories[mimeType as keyof typeof categories] || 'Autre';
};

export default useDocumentSearch;