// Types pour le système de photos
export interface Photo {
  id: string;
  fileName: string;
  filePath: string;
  thumbnailPath?: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  userId: string;
  userName: string;
  entityType: 'vehicle' | 'service' | 'issue' | 'part' | 'expense';
  entityId: string;
  locationType?: 'interior' | 'exterior' | 'engine' | 'dashboard' | 'other';
  description?: string;
  tags?: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PhotoUploadData {
  file: File;
  entityType: 'vehicle' | 'service' | 'issue' | 'part' | 'expense';
  entityId: string;
  locationType?: 'interior' | 'exterior' | 'engine' | 'dashboard' | 'other';
  description?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface PhotoFilters {
  entityType?: 'vehicle' | 'service' | 'issue' | 'part' | 'expense';
  entityId?: string;
  attachedId?: string;
  userId?: string;
  locationType?: 'interior' | 'exterior' | 'engine' | 'dashboard' | 'other';
  search?: string;
  tags?: string[];
  sortBy?: 'createdAt' | 'updatedAt' | 'fileName';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PhotosApiResponse {
  success: boolean;
  data?: Photo[];
  error?: string;
  message?: string;
}

export interface UploadPhotoResult {
  success: boolean;
  photo?: Photo;
  error?: string;
}

// Utilitaires pour les photos
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isImageFile = (mimeType: string): boolean => {
  return ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'].includes(mimeType);
};

export const getLocationTypeLabel = (locationType?: string): string => {
  const labels = {
    'interior': 'Intérieur',
    'exterior': 'Extérieur',
    'engine': 'Moteur',
    'dashboard': 'Tableau de bord',
    'other': 'Autre'
  };
  return labels[locationType as keyof typeof labels] || 'Non spécifié';
};