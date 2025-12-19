/**
 * Hook personnalisé pour gérer les entrées de service
 */

import { useState, useEffect, useCallback } from 'react'
import { serviceAPI, ServiceEntry, ServiceEntriesQuery, CreateServiceEntryData } from '@/lib/services/service-api'

export interface UseServiceEntriesOptions extends ServiceEntriesQuery {
  enabled?: boolean
}

export interface UseServiceEntriesReturn {
  entries: ServiceEntry[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  } | null
  fetchEntries: (query?: ServiceEntriesQuery) => Promise<void>
  createEntry: (data: CreateServiceEntryData) => Promise<ServiceEntry | null>
  updateEntry: (id: string, data: Partial<CreateServiceEntryData>) => Promise<ServiceEntry | null>
  deleteEntry: (id: string) => Promise<boolean>
  completeEntry: (id: string) => Promise<ServiceEntry | null>
  refresh: () => void
}

export function useServiceEntries(options: UseServiceEntriesOptions = {}): UseServiceEntriesReturn {
  const {
    page = 1,
    limit = 10,
    status,
    vehicleId,
    isWorkOrder,
    startDate,
    endDate,
    enabled = true,
    ...otherOptions
  } = options

  const [entries, setEntries] = useState<ServiceEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<UseServiceEntriesReturn['pagination']>(null)

  const fetchEntries = useCallback(async (query: ServiceEntriesQuery = {}) => {
    if (!enabled) return

    setLoading(true)
    setError(null)

    try {
      const response = await serviceAPI.getServiceEntries({
        page,
        limit,
        status,
        vehicleId,
        isWorkOrder,
        startDate,
        endDate,
        ...query
      })

      setEntries(response.data.entries || [])
      setPagination(response.data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des entrées de service')
    } finally {
      setLoading(false)
    }
  }, [enabled, page, limit, status, vehicleId, isWorkOrder, startDate, endDate])

  const createEntry = useCallback(async (data: CreateServiceEntryData): Promise<ServiceEntry | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await serviceAPI.createServiceEntry(data)
      const newEntry = response.data

      // Ajouter la nouvelle entrée à la liste
      setEntries(prev => [newEntry, ...prev])
      
      // Mettre à jour la pagination
      if (pagination) {
        setPagination(prev => prev ? {
          ...prev,
          total: prev.total + 1,
          totalPages: Math.ceil((prev.total + 1) / prev.limit)
        } : null)
      }

      return newEntry
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de l\'entrée')
      return null
    } finally {
      setLoading(false)
    }
  }, [pagination])

  const updateEntry = useCallback(async (id: string, data: Partial<CreateServiceEntryData>): Promise<ServiceEntry | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await serviceAPI.updateServiceEntry(id, data)
      const updatedEntry = response.data

      // Mettre à jour l'entrée dans la liste
      setEntries(prev => prev.map(entry => entry.id === id ? updatedEntry : entry))

      return updatedEntry
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'entrée')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteEntry = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      await serviceAPI.deleteServiceEntry(id)

      // Supprimer l'entrée de la liste
      setEntries(prev => prev.filter(entry => entry.id !== id))
      
      // Mettre à jour la pagination
      if (pagination) {
        setPagination(prev => prev ? {
          ...prev,
          total: Math.max(0, prev.total - 1),
          totalPages: Math.ceil(Math.max(0, prev.total - 1) / prev.limit)
        } : null)
      }

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'entrée')
      return false
    } finally {
      setLoading(false)
    }
  }, [pagination])

  const completeEntry = useCallback(async (id: string): Promise<ServiceEntry | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await serviceAPI.completeServiceEntry(id)
      const completedEntry = response.data

      // Mettre à jour l'entrée dans la liste
      setEntries(prev => prev.map(entry => entry.id === id ? completedEntry : entry))

      return completedEntry
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la completion de l\'entrée')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(() => {
    fetchEntries()
  }, [fetchEntries])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  return {
    entries,
    loading,
    error,
    pagination,
    fetchEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    completeEntry,
    refresh
  }
}