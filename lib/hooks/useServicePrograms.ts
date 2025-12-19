/**
 * Hook personnalisé pour gérer les programmes de service
 */

import { useState, useEffect, useCallback } from 'react'
import { serviceAPI, ServiceProgram, ServiceProgramsQuery, CreateServiceProgramData } from '@/lib/services/service-api'

export interface UseServiceProgramsOptions extends ServiceProgramsQuery {
  enabled?: boolean
}

export interface UseServiceProgramsReturn {
  programs: ServiceProgram[]
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
  fetchPrograms: (query?: ServiceProgramsQuery) => Promise<void>
  createProgram: (data: CreateServiceProgramData) => Promise<ServiceProgram | null>
  updateProgram: (id: string, data: Partial<CreateServiceProgramData>) => Promise<ServiceProgram | null>
  deleteProgram: (id: string) => Promise<boolean>
  addVehicleToProgram: (programId: string, vehicleId: string) => Promise<boolean>
  getProgramVehicles: (programId: string) => Promise<any[]>
  refresh: () => void
  // Calculs automatiques
  totalPrograms: number
  activePrograms: number
  upcomingDuePrograms: number
  totalVehiclesInPrograms: number
}

export function useServicePrograms(options: UseServiceProgramsOptions = {}): UseServiceProgramsReturn {
  const {
    page = 1,
    limit = 10,
    search,
    active,
    enabled = true,
    ...otherOptions
  } = options

  const [programs, setPrograms] = useState<ServiceProgram[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<UseServiceProgramsReturn['pagination']>(null)

  const fetchPrograms = useCallback(async (query: ServiceProgramsQuery = {}) => {
    if (!enabled) return

    setLoading(true)
    setError(null)

    try {
      const response = await serviceAPI.getServicePrograms({
        page,
        limit,
        search,
        active,
        ...query
      })

      setPrograms(response.data.programs || [])
      setPagination(response.data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des programmes de service')
    } finally {
      setLoading(false)
    }
  }, [enabled, page, limit, search, active])

  const createProgram = useCallback(async (data: CreateServiceProgramData): Promise<ServiceProgram | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await serviceAPI.createServiceProgram(data)
      const newProgram = response.data

      // Ajouter le nouveau programme à la liste
      setPrograms(prev => [newProgram, ...prev])
      
      // Mettre à jour la pagination
      if (pagination) {
        setPagination(prev => prev ? {
          ...prev,
          total: prev.total + 1,
          totalPages: Math.ceil((prev.total + 1) / prev.limit)
        } : null)
      }

      return newProgram
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du programme')
      return null
    } finally {
      setLoading(false)
    }
  }, [pagination])

  const updateProgram = useCallback(async (id: string, data: Partial<CreateServiceProgramData>): Promise<ServiceProgram | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await serviceAPI.updateServiceProgram(id, data)
      const updatedProgram = response.data

      // Mettre à jour le programme dans la liste
      setPrograms(prev => prev.map(program => program.id === id ? updatedProgram : program))

      return updatedProgram
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du programme')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteProgram = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      await serviceAPI.deleteServiceProgram(id)

      // Supprimer le programme de la liste
      setPrograms(prev => prev.filter(program => program.id !== id))
      
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
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du programme')
      return false
    } finally {
      setLoading(false)
    }
  }, [pagination])

  const addVehicleToProgram = useCallback(async (programId: string, vehicleId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      await serviceAPI.addVehicleToProgram(programId, vehicleId)
      
      // Rafraîchir les programmes pour obtenir les données mises à jour
      await fetchPrograms()
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout du véhicule au programme')
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchPrograms])

  const getProgramVehicles = useCallback(async (programId: string): Promise<any[]> => {
    try {
      const response = await serviceAPI.getServiceProgramVehicles(programId)
      return response.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des véhicules du programme')
      return []
    }
  }, [])

  const refresh = useCallback(() => {
    fetchPrograms()
  }, [fetchPrograms])

  // Calculs automatiques
  const totalPrograms = programs.length
  const activePrograms = programs.filter(p => p.active).length
  const upcomingDuePrograms = programs.filter(p => p.nextDue && new Date(p.nextDue) > new Date()).length
  const totalVehiclesInPrograms = programs.reduce((sum, p) => sum + (p.vehicleCount || 0), 0)

  useEffect(() => {
    fetchPrograms()
  }, [fetchPrograms])

  return {
    programs,
    loading,
    error,
    pagination,
    fetchPrograms,
    createProgram,
    updateProgram,
    deleteProgram,
    addVehicleToProgram,
    getProgramVehicles,
    refresh,
    // Calculs automatiques
    totalPrograms,
    activePrograms,
    upcomingDuePrograms,
    totalVehiclesInPrograms
  }
}