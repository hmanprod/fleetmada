'use client'

import { useState, useEffect, useCallback } from 'react'
import { vehiclesAPI, type MeterEntry, type MeterEntriesResponse } from '@/lib/services/vehicles-api'
import type { MeterEntriesQuery, CreateMeterEntryInput, UpdateMeterEntryInput } from '@/lib/validations/vehicle-validations'

interface UseMeterEntriesOptions {
  vehicleId: string
  query?: MeterEntriesQuery
  autoFetch?: boolean
}

interface UseMeterEntriesReturn {
  meterEntries: MeterEntry[]
  pagination: MeterEntriesResponse['pagination'] | null
  stats: MeterEntriesResponse['stats'] | null
  loading: boolean
  error: string | null
  fetchMeterEntries: (query?: MeterEntriesQuery) => Promise<void>
  refresh: () => void
  hasNext: boolean
  hasPrev: boolean
}

// Hook principal pour les entrées de compteur
export const useMeterEntries = (options: UseMeterEntriesOptions): UseMeterEntriesReturn => {
  const { vehicleId, query, autoFetch = true } = options

  const [meterEntries, setMeterEntries] = useState<MeterEntry[]>([])
  const [pagination, setPagination] = useState<MeterEntriesResponse['pagination'] | null>(null)
  const [stats, setStats] = useState<MeterEntriesResponse['stats'] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentQuery, setCurrentQuery] = useState<MeterEntriesQuery | undefined>(query)

  // Fonction pour récupérer les entrées de compteur
  const fetchMeterEntries = useCallback(async (newQuery?: MeterEntriesQuery) => {
    if (!vehicleId) {
      setMeterEntries([])
      setPagination(null)
      setStats(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const queryToUse = newQuery || currentQuery
      const response = await vehiclesAPI.getMeterEntries(vehicleId, queryToUse)
      
      setMeterEntries(response.meterEntries)
      setPagination(response.pagination)
      setStats(response.stats)
      
      if (newQuery) {
        setCurrentQuery(newQuery)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des entrées de compteur'
      setError(errorMessage)
      console.error('Erreur useMeterEntries:', err)
    } finally {
      setLoading(false)
    }
  }, [vehicleId, currentQuery])

  // Fonction pour rafraîchir
  const refresh = useCallback(() => {
    fetchMeterEntries()
  }, [fetchMeterEntries])

  // Effet pour le chargement automatique
  useEffect(() => {
    if (autoFetch && vehicleId) {
      fetchMeterEntries()
    }
  }, [autoFetch, vehicleId, fetchMeterEntries])

  // Effet pour mettre à jour la requête
  useEffect(() => {
    if (query !== currentQuery) {
      setCurrentQuery(query)
      if (autoFetch && vehicleId) {
        fetchMeterEntries(query)
      }
    }
  }, [query, currentQuery, autoFetch, vehicleId, fetchMeterEntries])

  const hasNext = pagination?.hasNext || false
  const hasPrev = pagination?.hasPrev || false

  return {
    meterEntries,
    pagination,
    stats,
    loading,
    error,
    fetchMeterEntries,
    refresh,
    hasNext,
    hasPrev
  }
}

// Hook pour une entrée de compteur spécifique
export const useMeterEntry = (vehicleId: string | null, entryId: string | null, autoFetch: boolean = true) => {
  const [meterEntry, setMeterEntry] = useState<MeterEntry | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMeterEntry = useCallback(async () => {
    if (!vehicleId || !entryId) {
      setMeterEntry(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const entryData = await vehiclesAPI.getMeterEntry(vehicleId, entryId)
      setMeterEntry(entryData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement de l\'entrée de compteur'
      setError(errorMessage)
      console.error('Erreur useMeterEntry:', err)
    } finally {
      setLoading(false)
    }
  }, [vehicleId, entryId])

  useEffect(() => {
    if (autoFetch) {
      fetchMeterEntry()
    }
  }, [autoFetch, fetchMeterEntry])

  return {
    meterEntry,
    loading,
    error,
    refresh: fetchMeterEntry
  }
}

// Hook pour les opérations CRUD des entrées de compteur
export const useMeterEntryOperations = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createMeterEntry = useCallback(async (vehicleId: string, entryData: CreateMeterEntryInput) => {
    setLoading(true)
    setError(null)

    try {
      const newEntry = await vehiclesAPI.createMeterEntry(vehicleId, entryData)
      return newEntry
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de l\'entrée de compteur'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateMeterEntry = useCallback(async (vehicleId: string, entryId: string, updates: UpdateMeterEntryInput) => {
    setLoading(true)
    setError(null)

    try {
      const updatedEntry = await vehiclesAPI.updateMeterEntry(vehicleId, entryId, updates)
      return updatedEntry
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'entrée de compteur'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteMeterEntry = useCallback(async (vehicleId: string, entryId: string) => {
    setLoading(true)
    setError(null)

    try {
      await vehiclesAPI.deleteMeterEntry(vehicleId, entryId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'entrée de compteur'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    createMeterEntry,
    updateMeterEntry,
    deleteMeterEntry
  }
}

// Hook spécialisé pour les lectures de mileage (avec validation de cohérence)
export const useMileageEntries = (vehicleId: string | null, autoFetch: boolean = true) => {
  const { meterEntries, pagination, stats, loading, error, fetchMeterEntries, refresh, hasNext, hasPrev } = 
    useMeterEntries({ 
      vehicleId: vehicleId || '', 
      query: { type: 'MILEAGE', sortBy: 'date', sortOrder: 'desc', page: 1, limit: 50 },
      autoFetch 
    })

  // Filtrer uniquement les entrées de mileage actives
  const activeMileageEntries = meterEntries.filter(entry => !entry.isVoid)

  // Obtenir la dernière lecture
  const latestReading = activeMileageEntries.length > 0 ? activeMileageEntries[0] : null

  // Calculer la progression
  const calculateProgress = useCallback((currentValue: number) => {
    if (!latestReading || currentValue <= latestReading.value) {
      return 0
    }
    return currentValue - latestReading.value
  }, [latestReading])

  // Valider la cohérence d'une nouvelle lecture
  const validateNewReading = useCallback((newValue: number): { isValid: boolean; error?: string } => {
    if (!latestReading) {
      return { isValid: true }
    }

    if (newValue < latestReading.value) {
      return {
        isValid: false,
        error: `La nouvelle lecture (${newValue}) ne peut pas être inférieure à la dernière lecture (${latestReading.value})`
      }
    }

    return { isValid: true }
  }, [latestReading])

  return {
    meterEntries: activeMileageEntries,
    pagination,
    stats,
    loading,
    error,
    fetchMeterEntries,
    refresh,
    hasNext,
    hasPrev,
    latestReading,
    calculateProgress,
    validateNewReading
  }
}

export default useMeterEntries