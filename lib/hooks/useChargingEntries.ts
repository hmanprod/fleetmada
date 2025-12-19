import { useState, useEffect, useCallback } from 'react'
import {
  ChargingEntry,
  ChargingEntryFilters,
  PaginatedChargingEntries,
  ChargingStats,
  CreateChargingEntryData,
  UpdateChargingEntryData
} from '@/types/fuel'
import ChargingApiService from '@/lib/services/charging-api'

// Hook pour la gestion des Charging Entries
export const useChargingEntries = (initialFilters: ChargingEntryFilters = {}) => {
  const [entries, setEntries] = useState<ChargingEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  const [filters, setFilters] = useState<ChargingEntryFilters>(initialFilters)

  const fetchEntries = useCallback(async (newFilters?: ChargingEntryFilters) => {
    try {
      setLoading(true)
      setError(null)
      
      const currentFilters = newFilters || filters
      const result: PaginatedChargingEntries = await ChargingApiService.getEntries(currentFilters)
      
      setEntries(result.entries)
      setPagination({
        page: result.page,
        total: result.total,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des entrées de recharge')
    } finally {
      setLoading(false)
    }
  }, [filters])

  const updateFilters = useCallback((newFilters: Partial<ChargingEntryFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 } // Reset to page 1 when filtering
    setFilters(updatedFilters)
    fetchEntries(updatedFilters)
  }, [filters, fetchEntries])

  const changePage = useCallback((page: number) => {
    const updatedFilters = { ...filters, page }
    setFilters(updatedFilters)
    fetchEntries(updatedFilters)
  }, [filters, fetchEntries])

  const refresh = useCallback(() => {
    fetchEntries()
  }, [fetchEntries])

  useEffect(() => {
    fetchEntries()
  }, [])

  return {
    entries,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    changePage,
    refresh
  }
}

// Hook pour une Charging Entry spécifique
export const useChargingEntry = (id: string) => {
  const [entry, setEntry] = useState<ChargingEntry | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEntry = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      
      const entryData = await ChargingApiService.getEntry(id)
      setEntry(entryData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de l\'entrée')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchEntry()
  }, [fetchEntry])

  return { entry, loading, error, refresh: fetchEntry }
}

// Hook pour créer une Charging Entry
export const useCreateChargingEntry = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createEntry = useCallback(async (data: CreateChargingEntryData): Promise<ChargingEntry | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const newEntry = await ChargingApiService.createEntry(data)
      return newEntry
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { createEntry, loading, error }
}

// Hook pour mettre à jour une Charging Entry
export const useUpdateChargingEntry = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateEntry = useCallback(async (id: string, data: UpdateChargingEntryData): Promise<ChargingEntry | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const updatedEntry = await ChargingApiService.updateEntry(id, data)
      return updatedEntry
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { updateEntry, loading, error }
}

// Hook pour supprimer une Charging Entry
export const useDeleteChargingEntry = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteEntry = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      await ChargingApiService.deleteEntry(id)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return { deleteEntry, loading, error }
}

// Hook pour les statistiques Charging
export const useChargingStats = (period: string = '30d', vehicleId?: string) => {
  const [stats, setStats] = useState<ChargingStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const statsData = await ChargingApiService.getStats(period, vehicleId)
      setStats(statsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques')
    } finally {
      setLoading(false)
    }
  }, [period, vehicleId])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, refresh: fetchStats }
}

// Hook pour calculer l'efficacité énergétique
export const useCalculateEfficiency = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    message: string;
    totalEntries: number;
    totalCost: number;
    totalEnergyKwh: number;
    totalDuration: number;
    averageCostPerKwh: number;
    averageEnergyPerSession: number;
    averageDuration: number;
  } | null>(null)

  const calculateEfficiency = useCallback(async (vehicleId: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await ChargingApiService.calculateEfficiency(vehicleId)
      setResult(result)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du calcul de l\'efficacité')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return { calculateEfficiency, loading, error, result }
}

// Hook pour les métriques de coût par kWh
export const useCostPerKwhMetrics = (vehicleId?: string) => {
  const [metrics, setMetrics] = useState<{
    averageCostPerKwh: number;
    minCostPerKwh: number;
    maxCostPerKwh: number;
    totalSessions: number;
    totalEnergyKwh: number;
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const metricsData = await ChargingApiService.getCostPerKwhMetrics(vehicleId)
      setMetrics(metricsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des métriques')
    } finally {
      setLoading(false)
    }
  }, [vehicleId])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  return { metrics, loading, error, refresh: fetchMetrics }
}

// Hook pour l'historique d'un véhicule
export const useVehicleChargingHistory = (vehicleId: string, limit: number = 50) => {
  const [entries, setEntries] = useState<ChargingEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    if (!vehicleId) return

    try {
      setLoading(true)
      setError(null)
      
      const history = await ChargingApiService.getVehicleHistory(vehicleId, limit)
      setEntries(history)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de l\'historique')
    } finally {
      setLoading(false)
    }
  }, [vehicleId, limit])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return { entries, loading, error, refresh: fetchHistory }
}

// Hook pour la recherche
export const useChargingSearch = () => {
  const [results, setResults] = useState<PaginatedChargingEntries | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (query: string, filters: ChargingEntryFilters = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      const searchResults = await ChargingApiService.searchEntries(query, filters)
      setResults(searchResults)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche')
    } finally {
      setLoading(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setResults(null)
    setError(null)
  }, [])

  return { results, loading, error, search, clearResults }
}