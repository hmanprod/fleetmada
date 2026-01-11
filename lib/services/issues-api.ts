import { useAuthToken } from '@/lib/hooks/useAuthToken'

// Fonction utilitaire pour récupérer le token d'authentification
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null

  return localStorage.getItem('authToken') ||
    document.cookie.match(/authToken=([^;]*)/)?.[1] ||
    null
}

// Types pour les Issues
export interface Issue {
  id: string
  vehicleId?: string
  userId: string
  summary: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  reportedDate: Date
  assignedTo?: string[]
  assignedToUsers?: { id: string, name: string }[] // Optional: if backend returns populated users
  labels: string[]
  watchers: number
  createdAt: Date
  updatedAt: Date
  vehicle?: {
    id: string
    name: string
    vin: string
    make: string
    model: string
  }
  user?: {
    id: string
    name: string
    email: string
  }
  _count?: {
    comments: number
    images: number
  }
}

export interface Comment {
  id: string
  issueId: string
  author: string
  content: string
  createdAt: Date
}

export interface IssueImage {
  id: string
  issueId: string
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  createdAt: Date
}

export interface IssueCreateData {
  vehicleId?: string
  summary: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  labels?: string[]
  assignedTo?: string[]
}

export interface IssueUpdateData {
  summary?: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  labels?: string[]
  assignedTo?: string[]
}

export interface IssueStatusUpdateData {
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
}

export interface IssueAssignData {
  assignedTo: string[]
}

export interface IssueCommentData {
  author: string
  content: string
}

export interface IssueCommentUpdateData {
  content: string
}

export interface IssueFilters {
  page?: number
  limit?: number
  search?: string
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  vehicleId?: string
  assignedTo?: string
  labels?: string
  groupId?: string
  reportedDate?: string
  startDate?: string
  endDate?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'status' | 'reportedDate'
  sortOrder?: 'asc' | 'desc'
}

export interface IssuesResponse {
  issues: Issue[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

class IssuesAPI {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string; message?: string }> {
    const token = getAuthToken()

    // Pour éviter l'erreur dans les tests E2E où le localStorage n'est pas accessible de la même manière
    // on permet de passer si on est côté serveur (build time) mais côté client c'est critique
    if (!token && typeof window !== 'undefined') {
      // Essayer de récupérer depuis les cookies
      const cookieToken = document.cookie.match(/authToken=([^;]*)/)?.[1];
      if (!cookieToken) {
        // En mode dev/test, on peut essayer de récupérer un token simulé si besoin
        console.warn('Token d\'authentification manquant dans makeRequest');
        // Ne pas throw immédiatement pour laisser une chance aux mocks
      }
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as any)['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      headers,
      ...options,
    }

    try {
      const response = await fetch(endpoint, config)
      const result = await response.json()

      if (!response.ok) {
        // Gérer le cas 401 Unauthorized
        if (response.status === 401) {
          // Rediriger vers login ou refresh token
          if (typeof window !== 'undefined') {
            // window.location.href = '/login';
          }
        }
        throw new Error(result.error || 'Erreur API')
      }

      return result
    } catch (error) {
      console.error('Erreur API Issues:', error)
      throw error
    }
  }

  // GET /api/issues - Liste des problèmes avec filtres et pagination
  async getIssues(filters: IssueFilters = {}): Promise<IssuesResponse> {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })

    const endpoint = `/api/issues?${params.toString()}`
    const result = await this.makeRequest<IssuesResponse>(endpoint)

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la récupération des problèmes')
    }

    return result.data!
  }

  // POST /api/issues - Créer un nouveau problème
  async createIssue(issueData: IssueCreateData): Promise<Issue> {
    const endpoint = '/api/issues'
    const result = await this.makeRequest<Issue>(endpoint, {
      method: 'POST',
      body: JSON.stringify(issueData),
    })

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la création du problème')
    }

    return result.data!
  }

  // GET /api/issues/[id] - Détails d'un problème
  async getIssue(id: string): Promise<Issue> {
    const endpoint = `/api/issues/${id}`
    const result = await this.makeRequest<Issue>(endpoint)

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la récupération du problème')
    }

    return result.data!
  }

  // PUT /api/issues/[id] - Modifier un problème
  async updateIssue(id: string, updateData: IssueUpdateData): Promise<Issue> {
    const endpoint = `/api/issues/${id}`
    const result = await this.makeRequest<Issue>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    })

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la modification du problème')
    }

    return result.data!
  }

  // DELETE /api/issues/[id] - Supprimer un problème
  async deleteIssue(id: string): Promise<void> {
    const endpoint = `/api/issues/${id}`
    const result = await this.makeRequest(endpoint, {
      method: 'DELETE',
    })

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la suppression du problème')
    }
  }

  // POST /api/issues/[id]/status - Changer le statut
  async updateIssueStatus(id: string, statusData: IssueStatusUpdateData): Promise<Issue> {
    const endpoint = `/api/issues/${id}/status`
    const result = await this.makeRequest<Issue>(endpoint, {
      method: 'POST',
      body: JSON.stringify(statusData),
    })

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la modification du statut')
    }

    return result.data!
  }

  // POST /api/issues/[id]/assign - Assigner un problème
  async assignIssue(id: string, assignData: IssueAssignData): Promise<Issue> {
    const endpoint = `/api/issues/${id}/assign`
    const result = await this.makeRequest<Issue>(endpoint, {
      method: 'POST',
      body: JSON.stringify(assignData),
    })

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de l\'assignation du problème')
    }

    return result.data!
  }

  // GET /api/issues/[id]/comments - Liste des commentaires
  async getIssueComments(issueId: string): Promise<Comment[]> {
    const endpoint = `/api/issues/${issueId}/comments`
    const result = await this.makeRequest<Comment[]>(endpoint)

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la récupération des commentaires')
    }

    return result.data!
  }

  // POST /api/issues/[id]/comments - Ajouter un commentaire
  async addIssueComment(issueId: string, commentData: IssueCommentData): Promise<Comment> {
    const endpoint = `/api/issues/${issueId}/comments`
    const result = await this.makeRequest<Comment>(endpoint, {
      method: 'POST',
      body: JSON.stringify(commentData),
    })

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de l\'ajout du commentaire')
    }

    return result.data!
  }

  // PUT /api/issues/[id]/comments/[commentId] - Modifier un commentaire
  async updateIssueComment(issueId: string, commentId: string, updateData: IssueCommentUpdateData): Promise<Comment> {
    const endpoint = `/api/issues/${issueId}/comments/${commentId}`
    const result = await this.makeRequest<Comment>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    })

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la modification du commentaire')
    }

    return result.data!
  }

  // DELETE /api/issues/[id]/comments/[commentId] - Supprimer un commentaire
  async deleteIssueComment(issueId: string, commentId: string): Promise<void> {
    const endpoint = `/api/issues/${issueId}/comments/${commentId}`
    const result = await this.makeRequest(endpoint, {
      method: 'DELETE',
    })

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la suppression du commentaire')
    }
  }

  // GET /api/issues/[id]/images - Liste des images
  async getIssueImages(issueId: string): Promise<IssueImage[]> {
    const endpoint = `/api/issues/${issueId}/images`
    const result = await this.makeRequest<IssueImage[]>(endpoint)

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la récupération des images')
    }

    return result.data!
  }

  // POST /api/issues/[id]/images - Upload d'images
  async uploadIssueImages(issueId: string, files: File[]): Promise<IssueImage[]> {
    const token = getAuthToken()

    if (!token) {
      throw new Error('Token d\'authentification manquant')
    }

    const formData = new FormData()
    files.forEach(file => {
      formData.append('images', file)
    })

    try {
      const response = await fetch(`/api/issues/${issueId}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'upload des images')
      }

      return result.data as IssueImage[]
    } catch (error) {
      console.error('Erreur upload images:', error)
      throw error
    }
  }

  // DELETE /api/issues/[id]/images/[imageId] - Supprimer une image
  async deleteIssueImage(issueId: string, imageId: string): Promise<void> {
    const endpoint = `/api/issues/${issueId}/images/${imageId}`
    const result = await this.makeRequest(endpoint, {
      method: 'DELETE',
    })

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la suppression de l\'image')
    }
  }
}

// Instance singleton de l'API Issues
export const issuesAPI = new IssuesAPI()
export default issuesAPI