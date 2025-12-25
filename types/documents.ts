// Types pour le système de gestion des documents
export interface Document {
  id: string;
  fileName: string;
  fileSize: number;
  filePath: string;
  mimeType: string;
  userId: string;
  companyId?: string;
  attachedTo?: string;
  attachedId?: string;
  version: number;
  isPublic: boolean;
  labels: string[];
  description?: string;
  checksum?: string;
  autoDelete: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  user: User;
  company?: Company;
}

export interface User {
  id: string;
  name: string;
  email: string;
  companyId?: string;
}

export interface Company {
  id: string;
  name: string;
}

// Métadonnées pour l'upload
export interface DocumentMetadata {
  fileName: string;
  mimeType: string;
  attachedTo?: string;
  attachedId?: string;
  labels?: string[];
  description?: string;
  isPublic?: boolean;
  companyId?: string;
}

// Résultat de validation de fichier
export interface FileValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

// Progression d'upload
export interface UploadProgress {
  fileName: string;
  progress: number; // 0-100
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  documentId?: string;
}

// Résultat d'upload
export interface UploadResult {
  success: boolean;
  document?: Document;
  fileName: string;
  error?: string;
  progress?: UploadProgress;
}

// Filtres pour la liste des documents
export interface DocumentFilters {
  page?: number;
  limit?: number;
  search?: string;
  mimeType?: string;
  attachedTo?: string;
  attachedId?: string;
  labels?: string[];
  sortBy?: 'createdAt' | 'updatedAt' | 'fileName' | 'fileSize';
  sortOrder?: 'asc' | 'desc';
}

// Réponse paginée
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Réponse API standard
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Statistiques d'utilisation des documents
export interface DocumentStats {
  totalDocuments: number;
  totalSize: number; // en bytes
  byType: Record<string, number>;
  byOwner: Record<string, number>;
  recentUploads: number;
  storageUsed: number; // en bytes
  storageLimit?: number; // en bytes
}

// Configuration d'upload
export interface UploadConfig {
  maxFileSize: number; // en bytes
  allowedMimeTypes: string[];
  maxFilesPerUpload: number;
  enableVirusScan: boolean;
  enablePreview: boolean;
  generateThumbnails: boolean;
}

// Types pour le versioning
export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  checksum: string;
  changes?: string;
  createdBy: string;
  createdAt: Date;
}

// Permissions de document
export interface DocumentPermission {
  documentId: string;
  userId: string;
  permission: 'read' | 'write' | 'admin';
  grantedBy: string;
  grantedAt: Date;
}

// Partage de document
export interface DocumentShare {
  documentId: string;
  sharedWith: string; // email ou userId
  permission: 'read' | 'write';
  expiresAt?: Date;
  password?: string;
  createdBy: string;
  createdAt: Date;
}

// Recherche dans les documents
export interface DocumentSearchResult {
  documents: Document[];
  totalCount: number;
  searchQuery: string;
  facets: {
    byType: Record<string, number>;
    byOwner: Record<string, number>;
    byDateRange: Record<string, number>;
  };
}

// Types d'entités où peuvent être attachés les documents
export type AttachmentEntityType = 
  | 'vehicle'
  | 'service'
  | 'issue'
  | 'part'
  | 'fuel'
  | 'contact'
  | 'reminder'
  | 'user'
  | 'company';

// Mappage des types MIME vers les types de fichiers
export const MIME_TYPE_CATEGORIES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  PDF: ['application/pdf'],
  DOCUMENT: [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ],
  TEXT: ['text/plain', 'text/csv', 'text/html', 'text/xml'],
  ARCHIVE: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  VIDEO: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv']
};

export type MimeTypeCategory = keyof typeof MIME_TYPE_CATEGORIES;

// Utilitaires
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getMimeTypeCategory = (mimeType: string): MimeTypeCategory | null => {
  if (MIME_TYPE_CATEGORIES.IMAGE.includes(mimeType as any)) return 'IMAGE';
  if (MIME_TYPE_CATEGORIES.PDF.includes(mimeType as any)) return 'PDF';
  if (MIME_TYPE_CATEGORIES.DOCUMENT.includes(mimeType as any)) return 'DOCUMENT';
  if (MIME_TYPE_CATEGORIES.TEXT.includes(mimeType as any)) return 'TEXT';
  if (MIME_TYPE_CATEGORIES.ARCHIVE.includes(mimeType as any)) return 'ARCHIVE';
  if (MIME_TYPE_CATEGORIES.AUDIO.includes(mimeType as any)) return 'AUDIO';
  if (MIME_TYPE_CATEGORIES.VIDEO.includes(mimeType as any)) return 'VIDEO';
  return null;
};

export const isImageFile = (mimeType: string): boolean => {
  return MIME_TYPE_CATEGORIES.IMAGE.includes(mimeType as any);
};

export const isPdfFile = (mimeType: string): boolean => {
  return MIME_TYPE_CATEGORIES.PDF.includes(mimeType as any);
};

export const isDocumentFile = (mimeType: string): boolean => {
  return MIME_TYPE_CATEGORIES.DOCUMENT.includes(mimeType as any);
};