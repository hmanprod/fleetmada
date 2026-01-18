/**
 * Hook personnalisé pour gérer les Demandes d’entretien de service
 */

import { useState, useEffect, useCallback } from 'react'
import { serviceAPI, ServiceEntry, ServiceEntriesQuery, CreateServiceEntryData } from '@/lib/services/service-api'

export interface WorkOrderFilters extends ServiceEntriesQuery {
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  assignedTo?: string
  vendorId?: string
  costMin?: number
  costMax?: number
  dateRange?: {
    from: string
    to: string
  }
}

export interface UseServiceWorkOrdersOptions extends WorkOrderFilters {
  enabled?: boolean
}

export interface WorkOrderStats {
  totalCost: number
  avgCost: number
  completedCount: number
  inProgressCount: number
  scheduledCount: number
  overdueCount: number
  avgCompletionTime: number // en jours
  costByPriority: Record<string, number>
  costByVendor: Record<string, number>
}

export interface UseServiceWorkOrdersReturn {
  workOrders: ServiceEntry[]
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
  fetchWorkOrders: (query?: WorkOrderFilters) => Promise<void>
  createWorkOrder: (data: CreateServiceEntryData) => Promise<ServiceEntry | null>
  updateWorkOrder: (id: string, data: Partial<CreateServiceEntryData>) => Promise<ServiceEntry | null>
  deleteWorkOrder: (id: string) => Promise<boolean>
  approveWorkOrder: (id: string) => Promise<ServiceEntry | null>
  assignWorkOrder: (id: string, assignedTo: string) => Promise<ServiceEntry | null>
  completeWorkOrder: (id: string, completionData: {
    actualCost?: number
    completionNotes?: string
    completionDate?: string
  }) => Promise<ServiceEntry | null>
  cancelWorkOrder: (id: string, reason?: string) => Promise<ServiceEntry | null>
  refresh: () => void
  statusCounts: Record<string, number> | null
  // Statistiques
  stats: WorkOrderStats
  // Actions en lot
  approveMultiple: (ids: string[]) => Promise<boolean>
  assignMultiple: (ids: string[], assignedTo: string) => Promise<boolean>
  exportWorkOrders: (filters?: WorkOrderFilters) => Promise<Blob | null>
}

export function useServiceWorkOrders(options: UseServiceWorkOrdersOptions = {}): UseServiceWorkOrdersReturn {
  const {
    page = 1,
    limit = 10,
    status,
    vehicleId,
    startDate,
    endDate,
    priority,
    assignedTo,
    vendorId,
    costMin,
    costMax,
    dateRange,
    search,
    enabled = true,
    ...otherOptions
  } = options

  const [workOrders, setWorkOrders] = useState<ServiceEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<UseServiceWorkOrdersReturn['pagination']>(null)
  const [statusCounts, setStatusCounts] = useState<Record<string, number> | null>(null)

  const fetchWorkOrders = useCallback(async (query: WorkOrderFilters = {}) => {
    if (!enabled) return

    setLoading(true)
    setError(null)

    try {
      const response = await serviceAPI.getServiceEntries({
        page,
        limit,
        status,
        vehicleId,
        isWorkOrder: true,
        startDate,
        endDate,
        search,
        ...query
      })

      setWorkOrders(response.data.entries || [])
      setPagination(response.data.pagination)
      setStatusCounts(response.data.statusCounts || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des Demandes d’entretien')
    } finally {
      setLoading(false)
    }
  }, [enabled, page, limit, status, vehicleId, startDate, endDate, search])

  const createWorkOrder = useCallback(async (data: CreateServiceEntryData): Promise<ServiceEntry | null> => {
    setLoading(true)
    setError(null)

    try {
      const workOrderData = { ...data, isWorkOrder: true }
      const response = await serviceAPI.createServiceEntry(workOrderData)
      const newWorkOrder = response.data

      // Ajouter le nouvel ordre de travail à la liste
      setWorkOrders(prev => [newWorkOrder, ...prev])

      // Mettre à jour la pagination
      if (pagination) {
        setPagination(prev => prev ? {
          ...prev,
          total: prev.total + 1,
          totalPages: Math.ceil((prev.total + 1) / prev.limit)
        } : null)
      }

      return newWorkOrder
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de l\'ordre de travail')
      return null
    } finally {
      setLoading(false)
    }
  }, [pagination])

  const updateWorkOrder = useCallback(async (id: string, data: Partial<CreateServiceEntryData>): Promise<ServiceEntry | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await serviceAPI.updateServiceEntry(id, data)
      const updatedWorkOrder = response.data

      // Mettre à jour l'ordre de travail dans la liste
      setWorkOrders(prev => prev.map(wo => wo.id === id ? updatedWorkOrder : wo))

      return updatedWorkOrder
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'ordre de travail')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteWorkOrder = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      await serviceAPI.deleteServiceEntry(id)

      // Supprimer l'ordre de travail de la liste
      setWorkOrders(prev => prev.filter(wo => wo.id !== id))

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
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'ordre de travail')
      return false
    } finally {
      setLoading(false)
    }
  }, [pagination])

  const approveWorkOrder = useCallback(async (id: string): Promise<ServiceEntry | null> => {
    try {
      const response = await serviceAPI.updateServiceEntry(id, {
        status: 'SCHEDULED',
        notes: `Approuvé le ${new Date().toLocaleDateString('fr-FR')}`
      } as any)
      const approvedWorkOrder = response.data

      setWorkOrders(prev => prev.map(wo => wo.id === id ? approvedWorkOrder : wo))
      return approvedWorkOrder
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'approbation de l\'ordre de travail')
      return null
    }
  }, [])

  const assignWorkOrder = useCallback(async (id: string, assignedTo: string): Promise<ServiceEntry | null> => {
    try {
      const response = await serviceAPI.updateServiceEntry(id, { assignedTo })
      const assignedWorkOrder = response.data

      setWorkOrders(prev => prev.map(wo => wo.id === id ? assignedWorkOrder : wo))
      return assignedWorkOrder
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'assignation de l\'ordre de travail')
      return null
    }
  }, [])

  const completeWorkOrder = useCallback(async (id: string, completionData: {
    actualCost?: number
    completionNotes?: string
    completionDate?: string
  }): Promise<ServiceEntry | null> => {
    try {
      const response = await serviceAPI.updateServiceEntry(id, {
        status: 'COMPLETED',
        totalCost: completionData.actualCost,
        notes: completionData.completionNotes
      } as any)
      const completedWorkOrder = response.data

      setWorkOrders(prev => prev.map(wo => wo.id === id ? completedWorkOrder : wo))
      return completedWorkOrder
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la completion de l\'ordre de travail')
      return null
    }
  }, [])

  const cancelWorkOrder = useCallback(async (id: string, reason?: string): Promise<ServiceEntry | null> => {
    try {
      const response = await serviceAPI.updateServiceEntry(id, {
        status: 'CANCELLED',
        notes: reason ? `Annulé: ${reason}` : 'Annulé'
      } as any)
      const cancelledWorkOrder = response.data

      setWorkOrders(prev => prev.map(wo => wo.id === id ? cancelledWorkOrder : wo))
      return cancelledWorkOrder
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'annulation de l\'ordre de travail')
      return null
    }
  }, [])

  const approveMultiple = useCallback(async (ids: string[]): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const promises = ids.map(id => approveWorkOrder(id))
      const results = await Promise.all(promises)
      return results.every(result => result !== null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'approbation multiple')
      return false
    } finally {
      setLoading(false)
    }
  }, [approveWorkOrder])

  const assignMultiple = useCallback(async (ids: string[], assignedTo: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const promises = ids.map(id => assignWorkOrder(id, assignedTo))
      const results = await Promise.all(promises)
      return results.every(result => result !== null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'assignation multiple')
      return false
    } finally {
      setLoading(false)
    }
  }, [assignWorkOrder])

  const exportWorkOrders = useCallback(async (filters?: WorkOrderFilters): Promise<Blob | null> => {
    try {
      // Implémenter l'export CSV/Excel des Demandes d’entretien
      const queryParams = new URLSearchParams()
      Object.entries(filters || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })

      const response = await fetch(`/api/service/work-orders/export?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (!response.ok) throw new Error('Erreur lors de l\'export')

      return await response.blob()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'export')
      return null
    }
  }, [])

  const refresh = useCallback(() => {
    fetchWorkOrders()
  }, [fetchWorkOrders])

  // Calcul des statistiques
  const stats: WorkOrderStats = {
    totalCost: workOrders.reduce((sum, wo) => sum + (wo.totalCost || 0), 0),
    avgCost: workOrders.length > 0
      ? workOrders.reduce((sum, wo) => sum + (wo.totalCost || 0), 0) / workOrders.length
      : 0,
    completedCount: workOrders.filter(wo => wo.status === 'COMPLETED').length,
    inProgressCount: workOrders.filter(wo => wo.status === 'IN_PROGRESS').length,
    scheduledCount: workOrders.filter(wo => wo.status === 'SCHEDULED').length,
    overdueCount: workOrders.filter(wo =>
      wo.status !== 'COMPLETED' &&
      wo.status !== 'CANCELLED' &&
      wo.date &&
      new Date(wo.date) < new Date()
    ).length,
    avgCompletionTime: 0, // À calculer avec les données de completion
    costByPriority: workOrders.reduce((acc, wo) => {
      const priority = wo.priority || 'MEDIUM'
      acc[priority] = (acc[priority] || 0) + (wo.totalCost || 0)
      return acc
    }, {} as Record<string, number>),
    costByVendor: workOrders.reduce((acc, wo) => {
      const vendor = typeof wo.vendor === 'object' && wo.vendor !== null ? wo.vendor.name : (wo.vendor || 'Non défini')
      acc[vendor] = (acc[vendor] || 0) + (wo.totalCost || 0)
      return acc
    }, {} as Record<string, number>)
  }

  useEffect(() => {
    fetchWorkOrders()
  }, [fetchWorkOrders])

  return {
    workOrders,
    loading,
    error,
    pagination,
    fetchWorkOrders,
    createWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    approveWorkOrder,
    assignWorkOrder,
    completeWorkOrder,
    cancelWorkOrder,
    refresh,
    statusCounts,
    stats,
    approveMultiple,
    assignMultiple,
    exportWorkOrders
  }
}