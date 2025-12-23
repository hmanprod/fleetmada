import { useState, useCallback } from 'react';
import { Document, DocumentMetadata, UploadProgress, UploadResult, ApiResponse } from '@/types/documents';
import { useAuthToken } from './useAuthToken';

interface UseUploadDocumentsReturn {
  uploading: boolean;
  uploadProgress: UploadProgress[];
  error: string | null;
  uploadDocuments: (files: File[], metadata?: Partial<DocumentMetadata>) => Promise<UploadResult[]>;
  uploadSingleDocument: (file: File, metadata?: Partial<DocumentMetadata>) => Promise<UploadResult>;
  clearError: () => void;
  clearProgress: () => void;
}

export const useUploadDocuments = (): UseUploadDocumentsReturn => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { token } = useAuthToken();

  const updateProgress = useCallback((fileName: string, progress: UploadProgress) => {
    setUploadProgress(prev => {
      const existing = prev.find(p => p.fileName === fileName);
      if (existing) {
        return prev.map(p => p.fileName === fileName ? progress : p);
      } else {
        return [...prev, progress];
      }
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearProgress = useCallback(() => {
    setUploadProgress([]);
  }, []);

  const uploadSingleDocument = useCallback(async (
    file: File,
    metadata: Partial<DocumentMetadata> = {}
  ): Promise<UploadResult> => {
    if (!token) {
      throw new Error('Token d\'authentification manquant');
    }

    setUploading(true);
    setError(null);

    try {
      // Initialiser le progrès
      updateProgress(file.name, {
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      });

      // Créer FormData
      const formData = new FormData();
      formData.append('file', file);

      // Ajouter les métadonnées
      Object.entries(metadata).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Mettre à jour le progrès à 25%
      updateProgress(file.name, {
        fileName: file.name,
        progress: 25,
        status: 'uploading'
      });

      // Envoyer la requête
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      // Mettre à jour le progrès à 75%
      updateProgress(file.name, {
        fileName: file.name,
        progress: 75,
        status: 'processing'
      });

      const result: ApiResponse<Document> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors de l\'upload du document');
      }

      // Succès - mettre à jour le progrès à 100%
      updateProgress(file.name, {
        fileName: file.name,
        progress: 100,
        status: 'completed',
        documentId: result.data?.id
      });

      return {
        success: true,
        document: result.data!,
        fileName: file.name
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';

      updateProgress(file.name, {
        fileName: file.name,
        progress: 0,
        status: 'error',
        error: errorMessage
      });

      setError(errorMessage);
      console.error('Erreur lors de l\'upload du document:', err);

      return {
        success: false,
        fileName: file.name,
        error: errorMessage
      };
    } finally {
      setUploading(false);
    }
  }, [token, updateProgress]);

  const uploadDocuments = useCallback(async (
    files: File[],
    metadata: Partial<DocumentMetadata> = {}
  ): Promise<UploadResult[]> => {
    if (files.length === 0) {
      return [];
    }

    setUploading(true);
    setError(null);

    try {
      // Créer FormData pour l'upload multiple
      const formData = new FormData();

      // Ajouter tous les fichiers
      files.forEach((file, index) => {
        formData.append('files', file);
      });

      // Ajouter les métadonnées
      Object.entries(metadata).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Initialiser le progrès pour tous les fichiers
      const initialProgress: UploadProgress[] = files.map(file => ({
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      }));
      setUploadProgress(initialProgress);

      // Envoyer la requête
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'upload des documents');
      }

      // Traiter les résultats
      const results: UploadResult[] = [];

      // Succès
      if (result.data?.successful) {
        result.data.successful.forEach((item: any) => {
          results.push({
            success: true,
            document: item.document,
            fileName: item.fileName
          });

          updateProgress(item.fileName, {
            fileName: item.fileName,
            progress: 100,
            status: 'completed',
            documentId: item.document.id
          });
        });
      }

      // Erreurs
      if (result.data?.failed) {
        result.data.failed.forEach((item: any) => {
          results.push({
            success: false,
            fileName: item.fileName,
            error: item.error
          });

          updateProgress(item.fileName, {
            fileName: item.fileName,
            progress: 0,
            status: 'error',
            error: item.error
          });
        });
      }

      // Si il y a des erreurs globales
      if (!result.success) {
        setError(result.error);
      }

      return results;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur lors de l\'upload des documents:', err);

      // Marquer tous les fichiers comme en erreur
      const errorResults: UploadResult[] = files.map(file => ({
        success: false,
        fileName: file.name,
        error: errorMessage
      }));

      const errorProgress: UploadProgress[] = files.map(file => ({
        fileName: file.name,
        progress: 0,
        status: 'error',
        error: errorMessage
      }));
      setUploadProgress(errorProgress);

      return errorResults;
    } finally {
      setUploading(false);
    }
  }, [token, updateProgress]);

  return {
    uploading,
    uploadProgress,
    error,
    uploadDocuments,
    uploadSingleDocument,
    clearError,
    clearProgress
  };
};

export default useUploadDocuments;