import {
  ChargingEntry,
  ChargingEntryFilters,
  PaginatedChargingEntries,
  ChargingStats,
  CreateChargingEntryData,
  UpdateChargingEntryData
} from '@/types/fuel'

// Configuration de base
const API_BASE = '/api/charging/entries'

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
  console.error('Charging API Error:', error)

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

// Service Charging Entries
export class ChargingApiService {
  /**
   * Récupérer la liste paginée des entrées de recharge
   */
  static async getEntries(filters: ChargingEntryFilters = {}): Promise<PaginatedChargingEntries> {
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
   * Créer une nouvelle entrée de recharge
   */
  static async createEntry(data: CreateChargingEntryData): Promise<ChargingEntry> {
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
   * Récupérer une entrée de recharge par ID
   */
  static async getEntry(id: string): Promise<ChargingEntry> {
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
   * Mettre à jour une entrée de recharge
   */
  static async updateEntry(id: string, data: UpdateChargingEntryData): Promise<ChargingEntry> {
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
   * Supprimer une entrée de recharge
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
   * Récupérer les statistiques de recharge
   */
  static async getStats(period: string = '30d', vehicleId?: string): Promise<ChargingStats> {
    try {
      const params = new URLSearchParams({ period })
      if (vehicleId) {
        params.append('vehicleId', vehicleId)
      }

      const response = await fetch(`/api/charging/entries/stats?${params.toString()}`, {
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
   * Calculer l'efficacité énergétique pour un véhicule
   */
  static async calculateEfficiency(vehicleId: string): Promise<{
    message: string;
    totalEntries: number;
    totalCost: number;
    totalEnergyKwh: number;
    totalDuration: number;
    averageCostPerKwh: number;
    averageEnergyPerSession: number;
    averageDuration: number;
  }> {
    try {
      const response = await fetch(`/api/charging/entries/stats`, {
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
   * Récupérer l'historique de recharge d'un véhicule
   */
  static async getVehicleHistory(vehicleId: string, limit: number = 50): Promise<ChargingEntry[]> {
    try {
      const filters: ChargingEntryFilters = {
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
  static async searchEntries(query: string, filters: ChargingEntryFilters = {}): Promise<PaginatedChargingEntries> {
    return this.getEntries({
      ...filters,
      search: query
    })
  }

  /**
   * Calculer les métriques de coût par kWh
   */
  static async getCostPerKwhMetrics(vehicleId?: string): Promise<{
    averageCostPerKwh: number;
    minCostPerKwh: number;
    maxCostPerKwh: number;
    totalSessions: number;
    totalEnergyKwh: number;
  }> {
    try {
      const filters: ChargingEntryFilters = {}
      if (vehicleId) {
        filters.vehicleId = vehicleId
      }

      const entries = await this.getEntries(filters)

      if (entries.entries.length === 0) {
        return {
          averageCostPerKwh: 0,
          minCostPerKwh: 0,
          maxCostPerKwh: 0,
          totalSessions: 0,
          totalEnergyKwh: 0
        }
      }

      // Calculer le coût par kWh pour chaque entrée
      const costPerKwhValues = entries.entries.map(entry => {
        return entry.energyKwh > 0 ? entry.cost / entry.energyKwh : 0
      }).filter(value => value > 0)

      const totalEnergyKwh = entries.entries.reduce((sum, entry) => sum + entry.energyKwh, 0)

      return {
        averageCostPerKwh: costPerKwhValues.length > 0 ? costPerKwhValues.reduce((a, b) => a + b, 0) / costPerKwhValues.length : 0,
        minCostPerKwh: costPerKwhValues.length > 0 ? Math.min(...costPerKwhValues) : 0,
        maxCostPerKwh: costPerKwhValues.length > 0 ? Math.max(...costPerKwhValues) : 0,
        totalSessions: entries.entries.length,
        totalEnergyKwh
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * Exporter les données de recharge
   */
  static async exportData(filters: ChargingEntryFilters = {}): Promise<Blob> {
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

export default ChargingApiService