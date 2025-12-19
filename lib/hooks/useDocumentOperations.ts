import { useState, useCallback } from 'react';
import { Document, DocumentMetadata, ApiResponse } from '@/types/documents';
import { useAuthToken } from './useAuthToken';

interface UseDocumentOperationsReturn {
  loading: boolean;
  error: string | null;
  updateDocument: (id: string, updates: Partial<DocumentMetadata>) => Promise<Document | null>;
  deleteDocument: (id: string) => Promise<boolean>;
  downloadDocument: (id: string, action?: 'download' | 'preview') => Promise<void>;
  shareDocument: (id: string, email: string, permission: 'read' | 'write') => Promise<boolean>;
  clearError: () => void;
}

export const useDocumentOperations = (): UseDocumentOperationsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = useAuthToken();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateDocument = useCallback(async (
    id: string, 
    updates: Partial<DocumentMetadata>
  ): Promise<Document | null> => {
    if (!token) {
      setError('Token d\'authentification manquant');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      const result: ApiResponse<Document> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors de la mise à jour du document');
      }

      return result.data || null;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur lors de la mise à jour du document:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const deleteDocument = useCallback(async (id: string): Promise<boolean> => {
    if (!token) {
      setError('Token d\'authentification manquant');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result: ApiResponse<null> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors de la suppression du document');
      }

      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur lors de la suppression du document:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const downloadDocument = useCallback(async (
    id: string, 
    action: 'download' | 'preview' = 'download'
  ): Promise<void> => {
    if (!token) {
      setError('Token d\'authentification manquant');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (action === 'preview') {
        // Demande un lien de prévisualisation
        const response = await fetch(`/api/documents/${id}/download`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ action: 'preview' })
        });

        const result: ApiResponse<{ previewUrl: string; expiresAt: string; document: any }> = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Erreur lors de la génération du lien de prévisualisation');
        }

        if (result.data?.previewUrl) {
          // Ouvrir le lien de prévisualisation dans un nouvel onglet
          window.open(result.data.previewUrl, '_blank');
        }

      } else {
        // Téléchargement normal
        const response = await fetch(`/api/documents/${id}/download`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors du téléchargement du document');
        }

        // Créer un blob et déclencher le téléchargement
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Essayer d'extraire le nom de fichier des headers
        const contentDisposition = response.headers.get('content-disposition');
        let filename = 'document';
        if (contentDisposition) {
          const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }
        
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur lors du téléchargement du document:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const shareDocument = useCallback(async (
    id: string, 
    email: string, 
    permission: 'read' | 'write'
  ): Promise<boolean> => {
    if (!token) {
      setError('Token d\'authentification manquant');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/documents/${id}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          permission
        })
      });

      const result: ApiResponse<null> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors du partage du document');
      }

      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur lors du partage du document:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    loading,
    error,
    updateDocument,
    deleteDocument,
    downloadDocument,
    shareDocument,
    clearError
  };
};

export default useDocumentOperations;