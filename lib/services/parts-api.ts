/**
 * Service API pour la gestion des pièces détachées
 */

export interface Part {
  id: string
  number: string
  description: string
  category?: string
  manufacturer?: string
  manufacturerPartNumber?: string
  upc?: string
  cost?: number
  quantity?: number
  minimumStock?: number
  measurementUnit?: string
  createdAt: string
  updatedAt: string
  lowStockAlert?: boolean
  stockStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
}

export interface CreatePartData {
  number: string
  description: string
  category?: string
  manufacturer?: string
  manufacturerPartNumber?: string
  upc?: string
  cost?: number
  quantity?: number
  minimumStock?: number
  measurementUnit?: string
}

export interface UpdatePartData extends Partial<CreatePartData> { }

export interface PartsQuery {
  page?: number
  limit?: number
  search?: string
  category?: string
  lowStock?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PartsResponse {
  parts: Part[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface StockAdjustmentData {
  quantity: number
  reason?: string
  type?: 'add' | 'remove' | 'set'
}

export interface ReorderData {
  supplierId?: string
  quantity: number
  priority?: 'low' | 'medium' | 'high'
  notes?: string
}

export interface PartStats {
  totalParts: number
  lowStockParts: number
  outOfStockParts: number
  totalValue: number
  topCategories: { category: string; count: number }[]
}

export interface UsageAnalytics {
  period: string
  partsUsed: { partId: string; partName: string; quantity: number; cost: number }[]
  totalCost: number
  averageUsage: number
}

export interface Category {
  id: string
  name: string
  description?: string
  parentId?: string
  createdAt: string
}

export interface PartWithDetails extends Part {
  stockHistory?: StockMovement[]
  suppliers?: { id: string; name: string; price: number }[]
  compatibleVehicles?: { id: string; model: string; year: number }[]
}

export interface StockMovement {
  id: string
  partId: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  previousQuantity: number
  newQuantity: number
  reason?: string
  userId: string
  createdAt: string
}

export interface Manufacturer {
  id: string
  name: string
  description?: string
  website?: string
  createdAt: string
}

export interface PartLocation {
  id: string
  partId: string
  placeId: string
  placeName?: string
  aisle?: string
  row?: string
  bin?: string
  quantity: number
  createdAt: string
  updatedAt: string
}

class PartsAPI {
  private baseURL = '/api/parts'

  private async getAuthHeaders(): Promise<Record<string, string>> {
    // Récupérer le token depuis localStorage ou cookie
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken') ||
        document.cookie.split('; ').find(row => row.startsWith('authToken='))?.split('=')[1]
      return Promise.resolve({
        'Authorization': `Bearer ${token || ''}`,
        'Content-Type': 'application/json'
      })
    }
    return Promise.resolve({ 'Content-Type': 'application/json' })
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = await this.getAuthHeaders()

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      } as Record<string, string>
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Récupération des pièces avec filtres
  async getParts(query: PartsQuery = {}): Promise<{ success: boolean; data: PartsResponse }> {
    const params = new URLSearchParams()

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value))
      }
    })

    const endpoint = params.toString() ? `?${params.toString()}` : ''
    return this.request<{ success: boolean; data: PartsResponse }>(endpoint)
  }

  // Récupération d'une pièce par ID
  async getPart(id: string): Promise<{ success: boolean; data: PartWithDetails }> {
    return this.request<{ success: boolean; data: PartWithDetails }>(`/${id}`)
  }

  // Création d'une nouvelle pièce
  async createPart(data: CreatePartData): Promise<{ success: boolean; data: Part; message: string }> {
    return this.request<{ success: boolean; data: Part; message: string }>('', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Mise à jour d'une pièce
  async updatePart(id: string, data: UpdatePartData): Promise<{ success: boolean; data: Part; message: string }> {
    return this.request<{ success: boolean; data: Part; message: string }>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // Suppression d'une pièce
  async deletePart(id: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/${id}`, {
      method: 'DELETE'
    })
  }

  // Ajustement du stock
  async adjustStock(id: string, data: StockAdjustmentData): Promise<{ success: boolean; data: Part; message: string }> {
    return this.request<{ success: boolean; data: Part; message: string }>(`/${id}/adjust-stock`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Historique du stock
  async getStockHistory(id: string): Promise<{ success: boolean; data: StockMovement[] }> {
    return this.request<{ success: boolean; data: StockMovement[] }>(`/${id}/stock-history`)
  }

  // Commande de réapprovisionnement
  async reorder(id: string, data: ReorderData): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/${id}/reorder`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Récupération des pièces avec stock faible
  async getLowStock(): Promise<{ success: boolean; data: Part[] }> {
    return this.request<{ success: boolean; data: Part[] }>('/low-stock')
  }

  // Statistiques des pièces
  async getStats(): Promise<{ success: boolean; data: PartStats }> {
    return this.request<{ success: boolean; data: PartStats }>('/stats')
  }

  // Analytics d'utilisation
  async getUsageAnalytics(period: string = '30d'): Promise<{ success: boolean; data: UsageAnalytics }> {
    return this.request<{ success: boolean; data: UsageAnalytics }>(`/usage-analytics?period=${period}`)
  }

  // Gestion des catégories
  async getCategories(): Promise<{ success: boolean; data: Category[] }> {
    return this.request<{ success: boolean; data: Category[] }>('/categories')
  }

  async createCategory(data: { name: string; description?: string; parentId?: string }): Promise<{ success: boolean; data: Category; message: string }> {
    return this.request<{ success: boolean; data: Category; message: string }>('/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateCategory(id: string, data: { name?: string; description?: string }): Promise<{ success: boolean; data: Category; message: string }> {
    return this.request<{ success: boolean; data: Category; message: string }>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/categories/${id}`, {
      method: 'DELETE'
    })
  }

  // Recherche de pièces
  async searchParts(query: string, limit: number = 10): Promise<{ success: boolean; data: Part[] }> {
    const params = new URLSearchParams({ search: query, limit: limit.toString() })
    return this.request<{ success: boolean; data: Part[] }>(`?${params.toString()}`)
  }

  // Import de pièces (CSV/Excel)
  async importParts(file: File): Promise<{ success: boolean; data: { imported: number; errors: string[] }; message: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const headers = await this.getAuthHeaders()
    delete (headers as any)['Content-Type'] // Let browser set multipart boundary

    return this.request<{ success: boolean; data: { imported: number; errors: string[] }; message: string }>('/import', {
      method: 'POST',
      headers: headers as Record<string, string>,
      body: formData
    })
  }

  // Gestion des fabricants
  async getManufacturers(): Promise<{ success: boolean; data: Manufacturer[] }> {
    return this.request<{ success: boolean; data: Manufacturer[] }>('/manufacturers')
  }

  async createManufacturer(data: { name: string; description?: string; website?: string }): Promise<{ success: boolean; data: Manufacturer; message: string }> {
    return this.request<{ success: boolean; data: Manufacturer; message: string }>('/manufacturers', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateManufacturer(id: string, data: { name?: string; description?: string; website?: string }): Promise<{ success: boolean; data: Manufacturer; message: string }> {
    return this.request<{ success: boolean; data: Manufacturer; message: string }>(`/manufacturers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteManufacturer(id: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/manufacturers/${id}`, {
      method: 'DELETE'
    })
  }

  // Gestion des emplacements (liés aux Places)
  async getPartLocations(partId: string): Promise<{ success: boolean; data: PartLocation[] }> {
    return this.request<{ success: boolean; data: PartLocation[] }>(`/${partId}/locations`)
  }

  async addPartLocation(partId: string, data: { placeId: string; aisle?: string; row?: string; bin?: string; quantity: number }): Promise<{ success: boolean; data: PartLocation; message: string }> {
    return this.request<{ success: boolean; data: PartLocation; message: string }>(`/${partId}/locations`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updatePartLocation(partId: string, locationId: string, data: { aisle?: string; row?: string; bin?: string; quantity?: number }): Promise<{ success: boolean; data: PartLocation; message: string }> {
    return this.request<{ success: boolean; data: PartLocation; message: string }>(`/${partId}/locations/${locationId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deletePartLocation(partId: string, locationId: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/${partId}/locations/${locationId}`, {
      method: 'DELETE'
    })
  }

  // Export de pièces
  async exportParts(format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/export?format=${format}`, {
      headers: await this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`)
    }

    return response.blob()
  }

  // Recherche par code-barres/QR
  async searchByBarcode(barcode: string): Promise<{ success: boolean; data: Part | null }> {
    return this.request<{ success: boolean; data: Part | null }>(`/search?barcode=${encodeURIComponent(barcode)}`)
  }
}

// Instance singleton
export const partsAPI = new PartsAPI()
export default partsAPI