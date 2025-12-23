"use client"

import { useState, useEffect, useCallback } from 'react'
import inspectionsAPI, {
  Inspection,
  InspectionFilters,
  InspectionsResponse,
  InspectionCreateData,
  InspectionUpdateData,
  InspectionResultsSubmitData
} from '@/lib/services/inspections-api'

interface UseInspectionsReturn {
  inspections: Inspection[]
  loading: boolean
  error: string | null
  pagination: InspectionsResponse['pagination'] | null
  // Filtres avancés et pagination
  filters: InspectionFilters
  setFilters: (filters: InspectionFilters) => void
  fetchInspections: (filters?: InspectionFilters) => Promise<void>
  fetchInspectionById: (id: string) => Promise<Inspection>
  // Actions CRUD
  createInspection: (data: InspectionCreateData) => Promise<Inspection>
  updateInspection: (id: string, data: InspectionUpdateData) => Promise<Inspection>
  deleteInspection: (id: string) => Promise<void>
  // Actions spécifiques inspections
  startInspection: (id: string) => Promise<Inspection>
  completeInspection: (id: string) => Promise<Inspection>
  cancelInspection: (id: string) => Promise<Inspection>
  submitInspectionResults: (id: string, results: InspectionResultsSubmitData) => Promise<any>
  // Utilitaires
  clearError: () => void
  refetch: () => Promise<void>
  // Statistiques calculées
  getStatistics: () => {
    total: number
    byStatus: Record<string, number>
    upcomingCount: number
    overdueCount: number
    complianceRate: number
  }
}

export function useInspections(initialFilters: InspectionFilters = {}): UseInspectionsReturn {
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<InspectionsResponse['pagination'] | null>(null)
  const [filters, setFilters] = useState<InspectionFilters>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialFilters
  })

  const fetchInspections = useCallback(async (newFilters: InspectionFilters = {}) => {
    try {
      setLoading(true)
      setError(null)

      const currentFilters = { ...filters, ...newFilters }
      setFilters(currentFilters)

      const response = await inspectionsAPI.getInspections(currentFilters)
      setInspections(response.inspections)
      setPagination(response.pagination)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des inspections'
      setError(errorMessage)
      console.error('Erreur useInspections:', err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  const fetchInspectionById = useCallback(async (id: string): Promise<Inspection> => {
    try {
      setLoading(true)
      setError(null)
      const inspection = await inspectionsAPI.getInspection(id)

      // Update the local inspections list if it's already there
      setInspections(prev => {
        const index = prev.findIndex(i => i.id === id)
        if (index !== -1) {
          const newList = [...prev]
          newList[index] = inspection
          return newList
        }
        return [...prev, inspection]
      })

      return inspection
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération de l\'inspection'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createInspection = useCallback(async (data: InspectionCreateData): Promise<Inspection> => {
    try {
      setError(null)
      const newInspection = await inspectionsAPI.createInspection(data)

      // Rafraîchir la liste après création
      await fetchInspections()

      return newInspection
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de l\'inspection'
      setError(errorMessage)
      throw err
    }
  }, [fetchInspections])

  const updateInspection = useCallback(async (id: string, data: InspectionUpdateData): Promise<Inspection> => {
    try {
      setError(null)
      const updatedInspection = await inspectionsAPI.updateInspection(id, data)

      // Mettre à jour l'inspection dans la liste locale
      setInspections(prev => prev.map(inspection =>
        inspection.id === id ? { ...inspection, ...updatedInspection } : inspection
      ))

      return updatedInspection
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la modification de l\'inspection'
      setError(errorMessage)
      throw err
    }
  }, [])

  const deleteInspection = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null)
      await inspectionsAPI.deleteInspection(id)

      // Supprimer l'inspection de la liste locale
      setInspections(prev => prev.filter(inspection => inspection.id !== id))

      // Mettre à jour la pagination
      if (pagination) {
        setPagination(prev => prev ? {
          ...prev,
          totalCount: prev.totalCount - 1
        } : null)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'inspection'
      setError(errorMessage)
      throw err
    }
  }, [pagination])

  const startInspection = useCallback(async (id: string): Promise<Inspection> => {
    try {
      setError(null)
      const startedInspection = await inspectionsAPI.startInspection(id)

      // Mettre à jour l'inspection dans la liste locale
      setInspections(prev => prev.map(inspection =>
        inspection.id === id ? { ...inspection, ...startedInspection } : inspection
      ))

      return startedInspection
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du démarrage de l\'inspection'
      setError(errorMessage)
      throw err
    }
  }, [])

  const completeInspection = useCallback(async (id: string): Promise<Inspection> => {
    try {
      setError(null)
      const completedInspection = await inspectionsAPI.completeInspection(id)

      // Mettre à jour l'inspection dans la liste locale
      setInspections(prev => prev.map(inspection =>
        inspection.id === id ? { ...inspection, ...completedInspection } : inspection
      ))

      return completedInspection
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la complétion de l\'inspection'
      setError(errorMessage)
      throw err
    }
  }, [])

  const cancelInspection = useCallback(async (id: string): Promise<Inspection> => {
    try {
      setError(null)
      const cancelledInspection = await inspectionsAPI.cancelInspection(id)

      // Mettre à jour l'inspection dans la liste locale
      setInspections(prev => prev.map(inspection =>
        inspection.id === id ? { ...inspection, ...cancelledInspection } : inspection
      ))

      return cancelledInspection
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'annulation de l\'inspection'
      setError(errorMessage)
      throw err
    }
  }, [])

  const submitInspectionResults = useCallback(async (id: string, results: InspectionResultsSubmitData): Promise<any> => {
    try {
      setError(null)
      const response = await inspectionsAPI.submitInspectionResults(id, results)

      // Rafraîchir l'inspection pour voir les nouveaux résultats
      await fetchInspections()

      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la soumission des résultats'
      setError(errorMessage)
      throw err
    }
  }, [fetchInspections])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const refetch = useCallback(async () => {
    await fetchInspections()
  }, [fetchInspections])

  // Statistiques calculées
  const getStatistics = useCallback(() => {
    const now = new Date()
    const total = inspections.length

    const byStatus = inspections.reduce((acc, inspection) => {
      acc[inspection.status] = (acc[inspection.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const upcomingCount = inspections.filter(inspection => {
      if (!inspection.scheduledDate) return false
      const scheduledDate = new Date(inspection.scheduledDate)
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      return scheduledDate > now && scheduledDate <= oneWeekFromNow
    }).length

    const overdueCount = inspections.filter(inspection => {
      if (!inspection.scheduledDate) return false
      const scheduledDate = new Date(inspection.scheduledDate)
      return scheduledDate < now && inspection.status === 'SCHEDULED'
    }).length

    const completedInspections = inspections.filter(i => i.status === 'COMPLETED')
    const complianceRate = completedInspections.length > 0
      ? (completedInspections.filter(i => i.complianceStatus === 'COMPLIANT').length / completedInspections.length) * 100
      : 0

    return {
      total,
      byStatus,
      upcomingCount,
      overdueCount,
      complianceRate: Math.round(complianceRate)
    }
  }, [inspections])

  // Charger les données initiales - Supprimé pour éviter les conflits avec les appels spécifiques aux pages
  // useEffect(() => {
  //   fetchInspections()
  // }, [])

  return {
    inspections,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    fetchInspections,
    fetchInspectionById,
    createInspection,
    updateInspection,
    deleteInspection,
    startInspection,
    completeInspection,
    cancelInspection,
    submitInspectionResults,
    clearError,
    refetch,
    getStatistics
  }
}

export default useInspections