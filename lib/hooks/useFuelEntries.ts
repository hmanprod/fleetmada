import { useState, useEffect, useCallback } from 'react'
import {
  FuelEntry,
  FuelEntryFilters,
  PaginatedFuelEntries,
  FuelStats,
  CreateFuelEntryData,
  UpdateFuelEntryData
} from '@/types/fuel'
import FuelApiService from '@/lib/services/fuel-api'

// Hook pour la gestion des Fuel Entries
export const useFuelEntries = (initialFilters: FuelEntryFilters = {}) => {
  const [entries, setEntries] = useState<FuelEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  const [filters, setFilters] = useState<FuelEntryFilters>(initialFilters)

  const fetchEntries = useCallback(async (newFilters?: FuelEntryFilters) => {
    try {
      setLoading(true)
      setError(null)
      
      const currentFilters = newFilters || filters
      const result: PaginatedFuelEntries = await FuelApiService.getEntries(currentFilters)
      
      setEntries(result.entries)
      setPagination({
        page: result.page,
        total: result.total,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des entrées carburant')
    } finally {
      setLoading(false)
    }
  }, [filters])

  const updateFilters = useCallback((newFilters: Partial<FuelEntryFilters>) => {
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

// Hook pour une Fuel Entry spécifique
export const useFuelEntry = (id: string) => {
  const [entry, setEntry] = useState<FuelEntry | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEntry = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      
      const entryData = await FuelApiService.getEntry(id)
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

// Hook pour créer une Fuel Entry
export const useCreateFuelEntry = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createEntry = useCallback(async (data: CreateFuelEntryData): Promise<FuelEntry | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const newEntry = await FuelApiService.createEntry(data)
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

// Hook pour mettre à jour une Fuel Entry
export const useUpdateFuelEntry = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateEntry = useCallback(async (id: string, data: UpdateFuelEntryData): Promise<FuelEntry | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const updatedEntry = await FuelApiService.updateEntry(id, data)
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

// Hook pour supprimer une Fuel Entry
export const useDeleteFuelEntry = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteEntry = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      await FuelApiService.deleteEntry(id)
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

// Hook pour les statistiques Fuel
export const useFuelStats = (period: string = '30d', vehicleId?: string) => {
  const [stats, setStats] = useState<FuelStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const statsData = await FuelApiService.getStats(period, vehicleId)
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

// Hook pour recalculer le MPG
export const useRecalculateMpg = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    message: string;
    averageMpg: number;
    entriesCount: number;
  } | null>(null)

  const recalculateMpg = useCallback(async (vehicleId: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await FuelApiService.recalculateMpg(vehicleId)
      setResult(result)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du recalcul du MPG')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return { recalculateMpg, loading, error, result }
}

// Hook pour l'historique d'un véhicule
export const useVehicleFuelHistory = (vehicleId: string, limit: number = 50) => {
  const [entries, setEntries] = useState<FuelEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    if (!vehicleId) return

    try {
      setLoading(true)
      setError(null)
      
      const history = await FuelApiService.getVehicleHistory(vehicleId, limit)
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
export const useFuelSearch = () => {
  const [results, setResults] = useState<PaginatedFuelEntries | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (query: string, filters: FuelEntryFilters = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      const searchResults = await FuelApiService.searchEntries(query, filters)
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