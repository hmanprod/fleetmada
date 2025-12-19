import { useAuthToken } from '@/lib/hooks/useAuthToken'

const API_BASE = '/api/vehicle-renewals'

export interface VehicleRenewal {
  id: string
  vehicleId: string
  type: 'REGISTRATION' | 'INSURANCE' | 'INSPECTION' | 'EMISSION_TEST' | 'OTHER'
  status: 'DUE' | 'COMPLETED' | 'OVERDUE' | 'DISMISSED'
  dueDate: Date
  completedDate?: Date
  cost?: number
  provider?: string
  notes?: string
  documentId?: string
  createdAt: Date
  updatedAt: Date
  vehicle: {
    id: string
    name: string
    make: string
    model: string
  }
  isOverdue?: boolean
  daysUntilDue?: number
  priority?: 'NORMAL' | 'SOON' | 'OVERDUE'
}

export interface CreateVehicleRenewalData {
  vehicleId: string
  type: 'REGISTRATION' | 'INSURANCE' | 'INSPECTION' | 'EMISSION_TEST' | 'OTHER'
  dueDate: string
  cost?: number
  provider?: string
  notes?: string
}

export interface VehicleRenewalsListResponse {
  success: boolean
  data: {
    renewals: VehicleRenewal[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
}

export interface VehicleRenewalResponse {
  success: boolean
  data: VehicleRenewal
  message?: string
}

class VehicleRenewalsApiService {
  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        throw new Error('Token d\'authentification manquant')
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }))
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`)
      }

      return response.json()
    }
    
    throw new Error('Cette fonction doit être appelée côté client')
  }

  /**
   * Récupérer la liste des renouvellements de véhicules
   */
  async getVehicleRenewals(params: {
    page?: number
    limit?: number
    status?: string
    vehicleId?: string
    type?: string
    overdue?: boolean
  } = {}): Promise<VehicleRenewalsListResponse> {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.set('page', params.page.toString())
    if (params.limit) queryParams.set('limit', params.limit.toString())
    if (params.status) queryParams.set('status', params.status)
    if (params.vehicleId) queryParams.set('vehicleId', params.vehicleId)
    if (params.type) queryParams.set('type', params.type)
    if (params.overdue) queryParams.set('overdue', 'true')

    const url = `${API_BASE}?${queryParams.toString()}`
    return this.makeRequest<VehicleRenewalsListResponse>(url)
  }

  /**
   * Créer un nouveau renouvellement de véhicule
   */
  async createVehicleRenewal(data: CreateVehicleRenewalData): Promise<VehicleRenewalResponse> {
    return this.makeRequest<VehicleRenewalResponse>(API_BASE, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  /**
   * Mettre à jour un renouvellement de véhicule
   */
  async updateVehicleRenewal(id: string, data: Partial<CreateVehicleRenewalData>): Promise<VehicleRenewalResponse> {
    return this.makeRequest<VehicleRenewalResponse>(`${API_BASE}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  /**
   * Supprimer un renouvellement de véhicule
   */
  async deleteVehicleRenewal(id: string): Promise<{ success: boolean; message: string }> {
    const response = await this.makeRequest<{ success: boolean; message: string }>(`${API_BASE}/${id}`, {
      method: 'DELETE'
    })
    return response
  }

  /**
   * Marquer un renouvellement comme complété
   */
  async completeVehicleRenewal(id: string, data: {
    completedDate?: string
    cost?: number
    provider?: string
    notes?: string
  } = {}): Promise<VehicleRenewalResponse> {
    return this.makeRequest<VehicleRenewalResponse>(`${API_BASE}/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  /**
   * Rejeter un renouvellement
   */
  async dismissVehicleRenewal(id: string): Promise<VehicleRenewalResponse> {
    return this.makeRequest<VehicleRenewalResponse>(`${API_BASE}/${id}/dismiss`, {
      method: 'PATCH'
    })
  }

  /**
   * Réactiver un renouvellement rejeté
   */
  async reactivateVehicleRenewal(id: string): Promise<VehicleRenewalResponse> {
    return this.makeRequest<VehicleRenewalResponse>(`${API_BASE}/${id}/reactivate`, {
      method: 'PATCH'
    })
  }
}

export const vehicleRenewalsApi = new VehicleRenewalsApiService()
export default vehicleRenewalsApi