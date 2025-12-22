import { useState, useEffect } from 'react'
import { remindersApi, VehicleRenewal } from '@/lib/services/reminders-api'

export interface UseVehicleRenewalsOptions {
  page?: number
  limit?: number
  status?: string
  type?: string
  vehicleId?: string
  overdue?: boolean
  dueSoon?: boolean
}

export interface UseVehicleRenewalsReturn {
  renewals: VehicleRenewal[]
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
  refresh: () => Promise<void>
  createRenewal: (data: {
    vehicleId: string
    type: string
    title?: string
    description?: string
    dueDate: string
    nextDueDate?: string
    priority?: string
    cost?: number
    provider?: string
    notes?: string
    watchers?: string[]
  }) => Promise<VehicleRenewal>
  updateRenewal: (id: string, data: {
    type?: string
    title?: string
    description?: string
    dueDate?: string
    nextDueDate?: string
    priority?: string
    cost?: number
    provider?: string
    notes?: string
    watchers?: string[]
    isActive?: boolean
  }) => Promise<VehicleRenewal>
  deleteRenewal: (id: string) => Promise<void>
  completeRenewal: (id: string, data: {
    completedDate?: string
    cost?: number
    provider?: string
    notes?: string
    documentId?: string
  }) => Promise<VehicleRenewal>
}

export function useVehicleRenewals(options: UseVehicleRenewalsOptions = {}): UseVehicleRenewalsReturn {
  const [renewals, setRenewals] = useState<VehicleRenewal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<UseVehicleRenewalsReturn['pagination']>(null)

  const fetchRenewals = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await remindersApi.getVehicleRenewals(options)

      if (response) {
        setRenewals(response.renewals)
        setPagination(response.pagination)
      } else {
        setError('Erreur lors du chargement des renouvellements')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const refresh = async () => {
    await fetchRenewals()
  }

  const createRenewal = async (data: {
    vehicleId: string
    type: string
    title?: string
    description?: string
    dueDate: string
    nextDueDate?: string
    priority?: string
    cost?: number
    provider?: string
    notes?: string
    watchers?: string[]
  }): Promise<VehicleRenewal> => {
    try {
      const renewal = await remindersApi.createVehicleRenewal(data)

      if (renewal) {
        // Rafraîchir la liste après création
        await fetchRenewals()
        return renewal
      } else {
        throw new Error('Erreur lors de la création du renouvellement')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du renouvellement'
      setError(errorMessage)
      throw err
    }
  }

  const updateRenewal = async (id: string, data: {
    type?: string
    title?: string
    description?: string
    dueDate?: string
    nextDueDate?: string
    priority?: string
    cost?: number
    provider?: string
    notes?: string
    watchers?: string[]
    isActive?: boolean
  }): Promise<VehicleRenewal> => {
    try {
      const renewal = await remindersApi.updateVehicleRenewal(id, data)

      if (renewal) {
        // Mettre à jour la liste locale
        setRenewals(prev => prev.map(item =>
          item.id === id ? renewal : item
        ))
        return renewal
      } else {
        throw new Error('Erreur lors de la mise à jour du renouvellement')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du renouvellement'
      setError(errorMessage)
      throw err
    }
  }

  const deleteRenewal = async (id: string): Promise<void> => {
    try {
      const success = await remindersApi.deleteVehicleRenewal(id)

      if (success) {
        // Retirer de la liste locale
        setRenewals(prev => prev.filter(renewal => renewal.id !== id))
      } else {
        throw new Error('Erreur lors de la suppression du renouvellement')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du renouvellement'
      setError(errorMessage)
      throw err
    }
  }

  const completeRenewal = async (id: string, data: {
    completedDate?: string
    cost?: number
    provider?: string
    notes?: string
    documentId?: string
  }): Promise<VehicleRenewal> => {
    try {
      const renewal = await remindersApi.completeVehicleRenewal(id, data)

      if (renewal) {
        setRenewals(prev => prev.map(item =>
          item.id === id ? renewal : item
        ))
        return renewal
      } else {
        throw new Error('Erreur lors de la complétion du renouvellement')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la complétion du renouvellement'
      setError(errorMessage)
      throw err
    }
  }

  // Charger les renouvellements au montage du composant et quand les options changent
  useEffect(() => {
    fetchRenewals()
  }, [options.page, options.limit, options.status, options.type, options.vehicleId, options.overdue, options.dueSoon])

  return {
    renewals,
    loading,
    error,
    pagination,
    refresh,
    createRenewal,
    updateRenewal,
    deleteRenewal,
    completeRenewal
  }
}