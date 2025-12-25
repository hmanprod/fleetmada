import { useState, useEffect, useCallback } from 'react';
import { Comment, CreateCommentData, UpdateCommentData, CommentsApiResponse, CommentFilters } from '@/types/comments';
import { useAuthToken } from './useAuthToken';

interface UseVehicleCommentsReturn {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  addComment: (data: CreateCommentData) => Promise<Comment | null>;
  updateComment: (commentId: string, data: UpdateCommentData) => Promise<Comment | null>;
  deleteComment: (commentId: string) => Promise<boolean>;
  refreshComments: () => Promise<void>;
  clearError: () => void;
  totalCount: number;
}

export function useVehicleComments(vehicleId: string): UseVehicleCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const { token: authToken } = useAuthToken();

  const fetchComments = useCallback(async () => {
    if (!vehicleId || !authToken) {
      console.log('useVehicleComments: Impossible de récupérer les commentaires - vehicleId ou authToken manquant');
      setError('Authentification requise');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('useVehicleComments: Récupération des commentaires pour vehicleId:', vehicleId);
      
      const response = await fetch(`/api/vehicles/${vehicleId}/comments`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result: CommentsApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors de la récupération des commentaires');
      }

      setComments(result.data || []);
      setTotalCount(result.data?.length || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des commentaires';
      setError(errorMessage);
      console.error('Erreur lors de la récupération des commentaires:', err);
    } finally {
      setLoading(false);
    }
  }, [vehicleId, authToken]);

  const addComment = useCallback(async (data: CreateCommentData): Promise<Comment | null> => {
    if (!authToken) {
      console.log('useVehicleComments: Impossible d\'ajouter un commentaire - authToken manquant');
      setError('Authentification requise');
      return null;
    }

    try {
      setError(null);
      
      const formData = new FormData();
      formData.append('message', data.message);
      formData.append('entityType', data.entityType);
      formData.append('entityId', data.entityId);
      
      if (data.parentId) {
        formData.append('parentId', data.parentId);
      }

      // Ajouter les fichiers attachés s'il y en a
      if (data.attachments) {
        data.attachments.forEach((file, index) => {
          formData.append(`attachment_${index}`, file);
        });
      }

      const response = await fetch(`/api/vehicles/${vehicleId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });

      const result: CommentsApiResponse & { data?: Comment } = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors de l\'ajout du commentaire');
      }

      const newComment = result.data;
      if (newComment) {
        setComments(prev => [newComment, ...prev]);
        setTotalCount(prev => prev + 1);
      }

      return newComment || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout du commentaire';
      setError(errorMessage);
      console.error('Erreur lors de l\'ajout du commentaire:', err);
      return null;
    }
  }, [vehicleId, authToken]);

  const updateComment = useCallback(async (commentId: string, data: UpdateCommentData): Promise<Comment | null> => {
    if (!authToken) {
      console.log('useVehicleComments: Impossible de modifier le commentaire - authToken manquant');
      setError('Authentification requise');
      return null;
    }

    try {
      setError(null);
      
      const response = await fetch(`/api/vehicles/${vehicleId}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: CommentsApiResponse & { data?: Comment } = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors de la modification du commentaire');
      }

      const updatedComment = result.data;
      if (updatedComment) {
        setComments(prev => prev.map(comment =>
          comment.id === commentId ? updatedComment : comment
        ));
      }

      return updatedComment || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la modification du commentaire';
      setError(errorMessage);
      console.error('Erreur lors de la modification du commentaire:', err);
      return null;
    }
  }, [vehicleId, authToken]);

  const deleteComment = useCallback(async (commentId: string): Promise<boolean> => {
    if (!authToken) {
      console.log('useVehicleComments: Impossible de supprimer le commentaire - authToken manquant');
      setError('Authentification requise');
      return false;
    }

    try {
      setError(null);
      
      const response = await fetch(`/api/vehicles/${vehicleId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result: CommentsApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors de la suppression du commentaire');
      }

      setComments(prev => prev.filter(comment => comment.id !== commentId));
      setTotalCount(prev => prev - 1);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du commentaire';
      setError(errorMessage);
      console.error('Erreur lors de la suppression du commentaire:', err);
      return false;
    }
  }, [vehicleId, authToken]);

  const refreshComments = useCallback(async () => {
    await fetchComments();
  }, [fetchComments]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Charger les commentaires au montage et quand vehicleId change
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    loading,
    error,
    addComment,
    updateComment,
    deleteComment,
    refreshComments,
    clearError,
    totalCount,
  };
}