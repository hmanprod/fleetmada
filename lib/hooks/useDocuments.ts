import { useState, useEffect, useCallback } from 'react';
import { Document, DocumentFilters, PaginatedResponse, ApiResponse } from '@/types/documents';
import { useAuthToken } from './useAuthToken';

interface UseDocumentsReturn {
  documents: Document[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  fetchDocuments: (filters?: DocumentFilters) => Promise<void>;
  refreshDocuments: () => void;
  clearError: () => void;
}

export const useDocuments = (initialFilters: DocumentFilters = {}): UseDocumentsReturn => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginatedResponse<Document>['pagination'] | null>(null);
  const [filters, setFilters] = useState<DocumentFilters>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialFilters
  });

  const { token } = useAuthToken();

  const buildQueryString = useCallback((filtersToUse: DocumentFilters): string => {
    const params = new URLSearchParams();

    Object.entries(filtersToUse).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.append(key, value.join(','));
          }
        } else {
          params.append(key, value.toString());
        }
      }
    });

    // Ajouter support pour attachedId si fourni
    if (filtersToUse.attachedId) {
      params.append('attachedId', filtersToUse.attachedId);
    }

    return params.toString();
  }, []);

  const fetchDocuments = useCallback(async (filtersToUse?: DocumentFilters) => {
    const currentFilters = filtersToUse || filters;

    if (!token) {
      setError('Token d\'authentification manquant');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const queryString = buildQueryString(currentFilters);
      const response = await fetch(`/api/documents?${queryString}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result: ApiResponse<PaginatedResponse<Document>> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors de la récupération des documents');
      }

      if (result.data) {
        setDocuments(result.data.data);
        setPagination(result.data.pagination);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur lors de la récupération des documents:', err);
    } finally {
      setLoading(false);
    }
  }, [token, filters, buildQueryString]);

  const refreshDocuments = useCallback(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Chargement initial
  useEffect(() => {
    if (token) {
      fetchDocuments();
    }
  }, [token, fetchDocuments]);

  // Mise à jour des filtres
  useEffect(() => {
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      setFilters(prev => {
        const hasChanged = Object.entries(initialFilters).some(([key, value]) =>
          prev[key as keyof DocumentFilters] !== value
        );
        return hasChanged ? { ...prev, ...initialFilters } : prev;
      });
    }
  }, [initialFilters]);

  return {
    documents,
    loading,
    error,
    pagination,
    fetchDocuments,
    refreshDocuments,
    clearError
  };
};

export default useDocuments;