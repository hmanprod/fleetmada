import { useAuthToken } from '@/lib/hooks/useAuthToken'

// Fonction utilitaire pour récupérer le token d'authentification
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null

  return localStorage.getItem('authToken') ||
    document.cookie.match(/authToken=([^;]*)/)?.[1] ||
    null
}

// Types pour les Inspections
export interface Inspection {
  id: string
  vehicleId: string
  userId: string
  inspectionTemplateId: string
  title: string
  description?: string
  status: 'DRAFT' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  scheduledDate?: Date
  startedAt?: Date
  completedAt?: Date
  inspectorName?: string
  location?: string
  notes?: string
  complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING_REVIEW'
  overallScore?: number
  createdAt: Date
  updatedAt: Date
  vehicle?: {
    id: string
    name: string
    vin: string
    make: string
    model: string
    year: number
    type: string
  }
  inspectionTemplate?: {
    id: string
    name: string
    category: string
  }
  user?: {
    id: string
    name: string
    email: string
  }
  items?: InspectionItem[]
  results?: InspectionResult[]
  _count?: {
    items: number
    results: number
  }
}

export interface InspectionItem {
  id: string
  inspectionId: string
  templateItemId?: string
  name: string
  description?: string
  category: string
  status: 'PENDING' | 'PASSED' | 'FAILED' | 'NOT_APPLICABLE'
  value?: string
  notes?: string
  sortOrder: number
  isRequired: boolean
  createdAt: Date
  updatedAt: Date
  templateItem?: {
    id: string
    name: string
    description: string
    category: string
    isRequired: boolean
  }
}

export interface InspectionResult {
  id: string
  inspectionId: string
  inspectionItemId: string
  resultValue: string
  isCompliant: boolean
  notes?: string
  imageUrl?: string
  createdAt: Date
  inspectionItem: {
    id: string
    name: string
    category: string
  }
}

export interface InspectionTemplate {
  id: string
  name: string
  description?: string
  category: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  items?: InspectionTemplateItem[]
  _count?: {
    items: number
    inspections: number
  }
}

export interface InspectionTemplateItem {
  id: string
  inspectionTemplateId: string
  name: string
  description?: string
  category: string
  isRequired: boolean
  sortOrder: number
}

export interface InspectionCreateData {
  vehicleId: string
  inspectionTemplateId: string
  title: string
  description?: string
  scheduledDate?: string
  inspectorName?: string
  location?: string
  notes?: string
}

export interface InspectionUpdateData {
  title?: string
  description?: string
  scheduledDate?: string
  inspectorName?: string
  location?: string
  notes?: string
  status?: 'DRAFT' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
}

export interface InspectionResultData {
  inspectionItemId: string
  resultValue: string
  isCompliant: boolean
  notes?: string
  imageUrl?: string
}

export interface InspectionResultsSubmitData {
  results: InspectionResultData[]
}

export interface InspectionTemplateCreateData {
  name: string
  description?: string
  category: string
  isActive?: boolean
  items: {
    name: string
    description?: string
    category: string
    isRequired?: boolean
    sortOrder?: number
  }[]
}

export interface InspectionTemplateUpdateData {
  name?: string
  description?: string
  category?: string
  isActive?: boolean
}

export interface InspectionFilters {
  page?: number
  limit?: number
  search?: string
  status?: 'DRAFT' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  vehicleId?: string
  inspectionTemplateId?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'scheduledDate' | 'status' | 'title'
  sortOrder?: 'asc' | 'desc'
}

export interface InspectionTemplateFilters {
  page?: number
  limit?: number
  search?: string
  category?: string
  isActive?: boolean
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'category'
  sortOrder?: 'asc' | 'desc'
}

export interface InspectionsResponse {
  inspections: Inspection[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface InspectionTemplatesResponse {
  templates: InspectionTemplate[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

class InspectionsAPI {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string; message?: string }> {
    const token = getAuthToken()

    // Pour éviter l'erreur dans les tests E2E où le localStorage n'est pas accessible de la même manière
    if (!token && typeof window !== 'undefined') {
      const cookieToken = document.cookie.match(/authToken=([^;]*)/)?.[1];
      if (!cookieToken) {
        console.warn('Token d\'authentification manquant dans makeRequest');
      }
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as any)['Authorization'] = `Bearer ${token}`;
    } else if (typeof window !== 'undefined') {
      const cookieToken = document.cookie.match(/authToken=([^;]*)/)?.[1];
      if (cookieToken) {
        (headers as any)['Authorization'] = `Bearer ${cookieToken}`;
      }
    }

    const config: RequestInit = {
      headers,
      ...options,
    }

    try {
      const response = await fetch(endpoint, config)

      // Vérifier le type de contenu
      const contentType = response.headers.get("content-type");
      let result: any;

      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();
        console.error(`[InspectionsAPI] Réponse non-JSON reçue de ${endpoint}:`, text.slice(0, 200));
        throw new Error(`Le serveur a renvoyé une réponse invalide (non-JSON) de ${endpoint}. Statut: ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(result.error || result.message || `Erreur API (${response.status})`)
      }

      return result
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error(`[InspectionsAPI] Échec de la connexion à ${endpoint}. Le serveur est-il en cours d'exécution?`);
        throw new Error(`Impossible de contacter le serveur (${endpoint}). Veuillez vérifier votre connexion.`);
      }
      console.error('Erreur API Inspections:', error)
      throw error
    }
  }

  // GET /api/inspections - Liste des inspections avec filtres et pagination
  async getInspections(filters: InspectionFilters = {}): Promise<InspectionsResponse> {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })

    const endpoint = `/api/inspections?${params.toString()}`
    const result = await this.makeRequest<InspectionsResponse>(endpoint)

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la récupération des inspections')
    }

    return result.data!
  }

  // POST /api/inspections - Créer une nouvelle inspection
  async createInspection(inspectionData: InspectionCreateData): Promise<Inspection> {
    const endpoint = '/api/inspections'
    const result = await this.makeRequest<Inspection>(endpoint, {
      method: 'POST',
      body: JSON.stringify(inspectionData),
    })

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la création de l\'inspection')
    }

    return result.data!
  }

  // GET /api/inspections/[id] - Détails d'une inspection
  async getInspection(id: string): Promise<Inspection> {
    const endpoint = `/api/inspections/${id}`
    const result = await this.makeRequest<Inspection>(endpoint)

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la récupération de l\'inspection')
    }

    return result.data!
  }

  // PUT /api/inspections/[id] - Modifier une inspection
  async updateInspection(id: string, updateData: InspectionUpdateData): Promise<Inspection> {
    const endpoint = `/api/inspections/${id}`
    const result = await this.makeRequest<Inspection>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    })

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la modification de l\'inspection')
    }

    return result.data!
  }

  // DELETE /api/inspections/[id] - Supprimer une inspection
  async deleteInspection(id: string): Promise<void> {
    const endpoint = `/api/inspections/${id}`
    const result = await this.makeRequest(endpoint, {
      method: 'DELETE',
    })

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la suppression de l\'inspection')
    }
  }

  // POST /api/inspections/[id] - Marquer une inspection comme terminée
  async completeInspection(id: string): Promise<Inspection> {
    const endpoint = `/api/inspections/${id}`
    const result = await this.makeRequest<Inspection>(endpoint, {
      method: 'POST',
    })

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la complétion de l\'inspection')
    }

    return result.data!
  }

  // GET /api/inspections/[id]/results - Liste des résultats d'une inspection
  async getInspectionResults(inspectionId: string): Promise<InspectionResult[]> {
    const endpoint = `/api/inspections/${inspectionId}/results`
    const result = await this.makeRequest<InspectionResult[]>(endpoint)

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la récupération des résultats')
    }

    return result.data!
  }

  // POST /api/inspections/[id]/results - Soumettre les résultats d'une inspection
  async submitInspectionResults(inspectionId: string, resultsData: InspectionResultsSubmitData): Promise<InspectionResult[]> {
    const endpoint = `/api/inspections/${inspectionId}/results`
    const result = await this.makeRequest<InspectionResult[]>(endpoint, {
      method: 'POST',
      body: JSON.stringify(resultsData),
    })

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la soumission des résultats')
    }

    return result.data!
  }

  // GET /api/inspection-templates - Liste des modèles d'inspection avec filtres et pagination
  async getInspectionTemplates(filters: InspectionTemplateFilters = {}): Promise<InspectionTemplatesResponse> {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })

    const endpoint = `/api/inspection-templates?${params.toString()}`
    const result = await this.makeRequest<InspectionTemplatesResponse>(endpoint)

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la récupération des modèles d\'inspection')
    }

    return result.data!
  }

  // POST /api/inspection-templates - Créer un nouveau modèle d'inspection
  async createInspectionTemplate(templateData: InspectionTemplateCreateData): Promise<InspectionTemplate> {
    const endpoint = '/api/inspection-templates'
    const result = await this.makeRequest<InspectionTemplate>(endpoint, {
      method: 'POST',
      body: JSON.stringify(templateData),
    })

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la création du modèle d\'inspection')
    }

    return result.data!
  }

  // GET /api/inspection-templates/[id] - Détails d'un modèle d'inspection
  async getInspectionTemplate(id: string): Promise<InspectionTemplate> {
    const endpoint = `/api/inspection-templates/${id}`
    const result = await this.makeRequest<InspectionTemplate>(endpoint)

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la récupération du modèle d\'inspection')
    }

    return result.data!
  }

  // PUT /api/inspection-templates/[id] - Modifier un modèle d'inspection
  async updateInspectionTemplate(id: string, updateData: InspectionTemplateUpdateData): Promise<InspectionTemplate> {
    const endpoint = `/api/inspection-templates/${id}`
    const result = await this.makeRequest<InspectionTemplate>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    })

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la modification du modèle d\'inspection')
    }

    return result.data!
  }

  // DELETE /api/inspection-templates/[id] - Supprimer un modèle d'inspection
  async deleteInspectionTemplate(id: string): Promise<void> {
    const endpoint = `/api/inspection-templates/${id}`
    const result = await this.makeRequest(endpoint, {
      method: 'DELETE',
    })

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la suppression du modèle d\'inspection')
    }
  }

  // POST /api/inspections/[id]/start - Démarrer une inspection
  async startInspection(id: string): Promise<Inspection> {
    const endpoint = `/api/inspections/${id}/start`
    const result = await this.makeRequest<Inspection>(endpoint, {
      method: 'POST',
    })

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors du démarrage de l\'inspection')
    }

    return result.data!
  }

  // POST /api/inspections/[id]/cancel - Annuler une inspection
  async cancelInspection(id: string): Promise<Inspection> {
    const endpoint = `/api/inspections/${id}/cancel`
    const result = await this.makeRequest<Inspection>(endpoint, {
      method: 'POST',
    })

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de l\'annulation de l\'inspection')
    }

    return result.data!
  }

  // GET /api/inspections/[id]/items - Liste des éléments d'une inspection
  async getInspectionItems(inspectionId: string): Promise<InspectionItem[]> {
    const endpoint = `/api/inspections/${inspectionId}/items`
    const result = await this.makeRequest<InspectionItem[]>(endpoint)

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la récupération des éléments d\'inspection')
    }

    return result.data!
  }

  // POST /api/inspection-templates/[id]/duplicate - Dupliquer un modèle d'inspection
  async duplicateInspectionTemplate(id: string, newName: string): Promise<InspectionTemplate> {
    const endpoint = `/api/inspection-templates/${id}/duplicate`
    const result = await this.makeRequest<InspectionTemplate>(endpoint, {
      method: 'POST',
      body: JSON.stringify({ name: newName }),
    })

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la duplication du modèle')
    }

    return result.data!
  }

  // GET /api/inspection-templates/[id]/items - Liste des éléments d'un modèle d'inspection
  async getInspectionTemplateItems(templateId: string): Promise<InspectionTemplateItem[]> {
    const endpoint = `/api/inspection-templates/${templateId}/items`
    const result = await this.makeRequest<InspectionTemplateItem[]>(endpoint)

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la récupération des éléments du modèle')
    }

    return result.data!
  }
}

// Instance singleton de l'API Inspections
export const inspectionsAPI = new InspectionsAPI()
export default inspectionsAPI