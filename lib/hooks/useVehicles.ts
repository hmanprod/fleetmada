'use client'

import { useState, useEffect, useCallback } from 'react'
import { vehiclesAPI, type Vehicle, type VehiclesResponse } from '@/lib/services/vehicles-api'
import type { VehicleListQuery } from '@/lib/validations/vehicle-validations'

interface UseVehiclesOptions {
  query?: VehicleListQuery
  autoFetch?: boolean
}

interface UseVehiclesReturn {
  vehicles: Vehicle[]
  pagination: VehiclesResponse['pagination'] | null
  loading: boolean
  error: string | null
  fetchVehicles: (query?: VehicleListQuery) => Promise<void>
  refresh: () => void
  hasNext: boolean
  hasPrev: boolean
}

export const useVehicles = (options: UseVehiclesOptions = {}): UseVehiclesReturn => {
  const { query, autoFetch = true } = options

  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [pagination, setPagination] = useState<VehiclesResponse['pagination'] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentQuery, setCurrentQuery] = useState<VehicleListQuery | undefined>(query)

  // Fonction pour récupérer les véhicules
  const fetchVehicles = useCallback(async (newQuery?: VehicleListQuery) => {
    setLoading(true)
    setError(null)

    try {
      const queryToUse = newQuery || currentQuery
      const response = await vehiclesAPI.getVehicles(queryToUse)
      
      setVehicles(response.vehicles)
      setPagination(response.pagination)
      
      if (newQuery) {
        setCurrentQuery(newQuery)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des véhicules'
      setError(errorMessage)
      console.error('Erreur useVehicles:', err)
    } finally {
      setLoading(false)
    }
  }, [currentQuery])

  // Fonction pour rafraîchir
  const refresh = useCallback(() => {
    fetchVehicles()
  }, [fetchVehicles])

  // Effet pour le chargement automatique
  useEffect(() => {
    if (autoFetch) {
      fetchVehicles()
    }
  }, [autoFetch, fetchVehicles])

  // Effet pour mettre à jour la requête
  useEffect(() => {
    if (query !== currentQuery) {
      setCurrentQuery(query)
      if (autoFetch) {
        fetchVehicles(query)
      }
    }
  }, [query, currentQuery, autoFetch, fetchVehicles])

  const hasNext = pagination?.hasNext || false
  const hasPrev = pagination?.hasPrev || false

  return {
    vehicles,
    pagination,
    loading,
    error,
    fetchVehicles,
    refresh,
    hasNext,
    hasPrev
  }
}

// Hook spécialisé pour un véhicule spécifique
export const useVehicle = (vehicleId: string | null, autoFetch: boolean = true) => {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchVehicle = useCallback(async () => {
    if (!vehicleId) {
      setVehicle(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const vehicleData = await vehiclesAPI.getVehicle(vehicleId)
      setVehicle(vehicleData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement du véhicule'
      setError(errorMessage)
      console.error('Erreur useVehicle:', err)
    } finally {
      setLoading(false)
    }
  }, [vehicleId])

  useEffect(() => {
    if (autoFetch) {
      fetchVehicle()
    }
  }, [autoFetch, fetchVehicle])

  return {
    vehicle,
    loading,
    error,
    refresh: fetchVehicle
  }
}

// Hook pour les opérations CRUD
export const useVehicleOperations = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createVehicle = useCallback(async (vehicleData: any) => {
    setLoading(true)
    setError(null)

    try {
      const newVehicle = await vehiclesAPI.createVehicle(vehicleData)
      return newVehicle
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du véhicule'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateVehicle = useCallback(async (id: string, updates: any) => {
    setLoading(true)
    setError(null)

    try {
      const updatedVehicle = await vehiclesAPI.updateVehicle(id, updates)
      return updatedVehicle
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du véhicule'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteVehicle = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      await vehiclesAPI.deleteVehicle(id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du véhicule'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    createVehicle,
    updateVehicle,
    deleteVehicle
  }
}

export default useVehicles