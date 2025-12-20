import {
  FuelEntry,
  FuelEntryFilters,
  PaginatedFuelEntries,
  FuelStats,
  CreateFuelEntryData,
  UpdateFuelEntryData
} from '@/types/fuel'

// Configuration de base
const API_BASE = '/api/fuel/entries'

// Fonction token d'authentification
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken')
  }
  return null
}

// Fonction utilitaire pour les headers d'authentification
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken()
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  }
}

// Gestion des erreurs API
const handleApiError = (error: any): never => {
  console.error('Fuel API Error:', error)

  if (error.response?.status === 401) {
    throw new Error('Token d\'authentification invalide')
  }

  if (error.response?.status === 403) {
    throw new Error('Accès refusé')
  }

  if (error.response?.status === 404) {
    throw new Error('Ressource non trouvée')
  }

  const message = error.response?.data?.error || error.message || 'Erreur inconnue'
  throw new Error(message)
}

// Service Fuel Entries
export class FuelApiService {
  /**
   * Récupérer la liste paginée des entrées carburant
   */
  static async getEntries(filters: FuelEntryFilters = {}): Promise<PaginatedFuelEntries> {
    try {
      const params = new URLSearchParams()

      // Ajouter les filtres à la query string
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })

      const response = await fetch(`${API_BASE}?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw { response }
      }

      return await response.json()
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * Créer une nouvelle entrée carburant
   */
  static async createEntry(data: CreateFuelEntryData): Promise<FuelEntry> {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw { response }
      }

      return await response.json()
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * Récupérer une entrée carburant par ID
   */
  static async getEntry(id: string): Promise<FuelEntry> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw { response }
      }

      return await response.json()
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * Mettre à jour une entrée carburant
   */
  static async updateEntry(id: string, data: UpdateFuelEntryData): Promise<FuelEntry> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw { response }
      }

      return await response.json()
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * Supprimer une entrée carburant
   */
  static async deleteEntry(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw { response }
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * Récupérer les statistiques carburant
   */
  static async getStats(period: string = '30d', vehicleId?: string): Promise<FuelStats> {
    try {
      const params = new URLSearchParams({ period })
      if (vehicleId) {
        params.append('vehicleId', vehicleId)
      }

      const response = await fetch(`/api/fuel/entries/stats?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw { response }
      }

      return await response.json()
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * Recalculer le MPG pour un véhicule
   */
  static async recalculateMpg(vehicleId: string): Promise<{ message: string; averageMpg: number; entriesCount: number }> {
    try {
      const response = await fetch(`/api/fuel/entries/stats`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ vehicleId })
      })

      if (!response.ok) {
        throw { response }
      }

      return await response.json()
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * Récupérer l'historique carburant d'un véhicule
   */
  static async getVehicleHistory(vehicleId: string, limit: number = 50): Promise<FuelEntry[]> {
    try {
      const filters: FuelEntryFilters = {
        vehicleId,
        limit,
        sortBy: 'date',
        sortOrder: 'desc'
      }

      const result = await this.getEntries(filters)
      return result.entries
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * Rechercher des entrées par texte
   */
  static async searchEntries(query: string, filters: FuelEntryFilters = {}): Promise<PaginatedFuelEntries> {
    return this.getEntries({
      ...filters,
      search: query
    })
  }

  /**
   * Exporter les données carburant
   */
  static async exportData(filters: FuelEntryFilters = {}): Promise<Blob> {
    try {
      const params = new URLSearchParams()

      // Ajouter les filtres à la query string
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
      params.append('export', 'true')

      const response = await fetch(`${API_BASE}?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw { response }
      }

      return await response.blob()
    } catch (error) {
      return handleApiError(error)
    }
  }
}

export default FuelApiService