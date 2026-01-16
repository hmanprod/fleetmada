// Types pour le système de commentaires
export interface Comment {
  id: string;
  message: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  entityType: 'vehicle' | 'service' | 'issue' | 'part' | 'expense';
  entityId: string;
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
  parentId?: string; // Pour les réponses/replies
  attachments?: CommentAttachment[];
}

export interface CommentAttachment {
  id: string;
  commentId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
}

// Données pour créer un commentaire
export interface CreateCommentData {
  message: string;
  entityType: 'vehicle' | 'service' | 'issue' | 'part' | 'expense';
  entityId: string;
  parentId?: string;
  attachments?: File[];
}

// Données pour mettre à jour un commentaire
export interface UpdateCommentData {
  message: string;
}

// Réponse API pour les commentaires
export interface CommentsApiResponse {
  success: boolean;
  data?: Comment[];
  error?: string;
  message?: string;
}

// Filtres pour la recherche de commentaires
export interface CommentFilters {
  entityType?: 'vehicle' | 'service' | 'issue' | 'part' | 'expense';
  entityId?: string;
  userId?: string;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}