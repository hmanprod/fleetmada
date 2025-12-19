import { useState, useEffect, useCallback } from 'react';
import { Document, ApiResponse } from '@/types/documents';
import { useAuthToken } from './useAuthToken';

interface UseDocumentReturn {
  document: Document | null;
  loading: boolean;
  error: string | null;
  fetchDocument: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useDocument = (documentId?: string): UseDocumentReturn => {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = useAuthToken();

  const fetchDocument = useCallback(async (id: string) => {
    if (!token) {
      setError('Token d\'authentification manquant');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result: ApiResponse<Document> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors de la récupération du document');
      }

      if (result.data) {
        setDocument(result.data);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur lors de la récupération du document:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Chargement automatique si documentId est fourni
  useEffect(() => {
    if (documentId) {
      fetchDocument(documentId);
    }
  }, [documentId, fetchDocument]);

  return {
    document,
    loading,
    error,
    fetchDocument,
    clearError
  };
};

export default useDocument;