import { useState, useEffect, useCallback, useRef } from 'react';
import { Photo, PhotoUploadData, PhotosApiResponse, PhotoFilters, UploadPhotoResult } from '@/types/photos';
import { useAuthToken } from './useAuthToken';

interface UseVehiclePhotosReturn {
  photos: Photo[];
  loading: boolean;
  error: string | null;
  uploading: boolean;
  uploadProgress: number;
  viewMode: 'grid' | 'list';
  filters: PhotoFilters;
  addPhoto: (data: PhotoUploadData) => Promise<Photo | null>;
  deletePhoto: (photoId: string) => Promise<boolean>;
  updatePhoto: (photoId: string, data: Partial<Photo>) => Promise<Photo | null>;
  refreshPhotos: () => Promise<void>;
  setViewMode: (mode: 'grid' | 'list') => void;
  setFilters: (filters: PhotoFilters) => void;
  clearError: () => void;
  totalCount: number;
}

export function useVehiclePhotos(vehicleId: string): UseVehiclePhotosReturn {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<PhotoFilters>({
    entityType: 'vehicle',
    entityId: vehicleId,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    limit: 50
  });
  const [totalCount, setTotalCount] = useState(0);
  const { token: authToken } = useAuthToken();

  const fetchPhotos = useCallback(async (currentFilters = filters) => {
    if (!vehicleId) return;

    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      queryParams.append('entityType', 'vehicle');
      queryParams.append('entityId', vehicleId);
      
      // Ajouter attachedId pour compatibilité
      if (currentFilters.attachedId || vehicleId) {
        queryParams.append('attachedId', currentFilters.attachedId || vehicleId);
      }
      
      if (currentFilters.locationType) {
        queryParams.append('locationType', currentFilters.locationType);
      }
      if (currentFilters.search) {
        queryParams.append('search', currentFilters.search);
      }
      if (currentFilters.tags && currentFilters.tags.length > 0) {
        queryParams.append('tags', currentFilters.tags.join(','));
      }
      if (currentFilters.sortBy) {
        queryParams.append('sortBy', currentFilters.sortBy);
      }
      if (currentFilters.sortOrder) {
        queryParams.append('sortOrder', currentFilters.sortOrder);
      }
      if (currentFilters.limit) {
        queryParams.append('limit', currentFilters.limit.toString());
      }

      const response = await fetch(`/api/vehicles/${vehicleId}/photos?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result: PhotosApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors de la récupération des photos');
      }

      setPhotos(result.data || []);
      setTotalCount(result.data?.length || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des photos';
      setError(errorMessage);
      console.error('Erreur lors de la récupération des photos:', err);
    } finally {
      setLoading(false);
    }
  }, [vehicleId, authToken, filters]);

  const addPhoto = useCallback(async (data: PhotoUploadData): Promise<Photo | null> => {
    try {
      setError(null);
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('entityType', data.entityType);
      formData.append('entityId', data.entityId);
      
      if (data.locationType) {
        formData.append('locationType', data.locationType);
      }
      if (data.description) {
        formData.append('description', data.description);
      }
      if (data.tags && data.tags.length > 0) {
        formData.append('tags', data.tags.join(','));
      }
      if (data.isPublic !== undefined) {
        formData.append('isPublic', data.isPublic.toString());
      }

      // Simulation de progression d'upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(`/api/vehicles/${vehicleId}/photos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result: PhotosApiResponse & { data?: Photo } = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors de l\'upload de la photo');
      }

      const newPhoto = result.data;
      if (newPhoto) {
        setPhotos(prev => [newPhoto, ...prev]);
        setTotalCount(prev => prev + 1);
      }

      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);

      return newPhoto || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload de la photo';
      setError(errorMessage);
      setUploading(false);
      setUploadProgress(0);
      console.error('Erreur lors de l\'upload de la photo:', err);
      return null;
    }
  }, [vehicleId, authToken]);

  const deletePhoto = useCallback(async (photoId: string): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await fetch(`/api/vehicles/${vehicleId}/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result: PhotosApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors de la suppression de la photo');
      }

      setPhotos(prev => prev.filter(photo => photo.id !== photoId));
      setTotalCount(prev => prev - 1);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de la photo';
      setError(errorMessage);
      console.error('Erreur lors de la suppression de la photo:', err);
      return false;
    }
  }, [vehicleId, authToken]);

  const updatePhoto = useCallback(async (photoId: string, data: Partial<Photo>): Promise<Photo | null> => {
    try {
      setError(null);
      
      const response = await fetch(`/api/vehicles/${vehicleId}/photos/${photoId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: PhotosApiResponse & { data?: Photo } = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors de la modification de la photo');
      }

      const updatedPhoto = result.data;
      if (updatedPhoto) {
        setPhotos(prev => prev.map(photo =>
          photo.id === photoId ? updatedPhoto : photo
        ));
      }

      return updatedPhoto || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la modification de la photo';
      setError(errorMessage);
      console.error('Erreur lors de la modification de la photo:', err);
      return null;
    }
  }, [vehicleId, authToken]);

  const refreshPhotos = useCallback(async () => {
    await fetchPhotos();
  }, [fetchPhotos]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Charger les photos au montage et quand vehicleId ou filters changent
  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  return {
    photos,
    loading,
    error,
    uploading,
    uploadProgress,
    viewMode,
    filters,
    addPhoto,
    deletePhoto,
    updatePhoto,
    refreshPhotos,
    setViewMode,
    setFilters,
    clearError,
    totalCount,
  };
}