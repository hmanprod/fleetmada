import { useState, useEffect } from 'react'
import { remindersApi, ServiceReminder } from '@/lib/services/reminders-api'

export interface UseServiceRemindersOptions {
  page?: number
  limit?: number
  status?: string
  vehicleId?: string
  overdue?: boolean
}

export interface UseServiceRemindersReturn {
  reminders: ServiceReminder[]
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
  createReminder: (data: {
    vehicleId: string
    task?: string
    serviceTaskId?: string
    nextDue?: string
    nextDueMeter?: number
    intervalMonths?: number
    intervalMeter?: number
    type?: string
    lastServiceDate?: string
    lastServiceMeter?: number
    title?: string
    description?: string
    watchers?: string[]
    escalationDays?: number
  }) => Promise<ServiceReminder>
  updateReminder: (id: string, data: {
    task?: string
    serviceTaskId?: string
    nextDue?: string
    nextDueMeter?: number
    intervalMonths?: number
    intervalMeter?: number
    type?: string
    snoozedUntil?: string
    watchers?: string[]
    escalationDays?: number
    title?: string
    description?: string
  }) => Promise<ServiceReminder>
  deleteReminder: (id: string) => Promise<void>
  dismissReminder: (id: string) => Promise<ServiceReminder>
  snoozeReminder: (id: string, data: { snoozeUntil?: string; days?: number }) => Promise<ServiceReminder>
}

export function useServiceReminders(options: UseServiceRemindersOptions = {}): UseServiceRemindersReturn {
  const [reminders, setReminders] = useState<ServiceReminder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<UseServiceRemindersReturn['pagination']>(null)

  const fetchReminders = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await remindersApi.getServiceReminders(options)

      if (response) {
        setReminders(response.reminders)
        setPagination(response.pagination)
      } else {
        setError('Erreur lors du chargement des rappels')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const refresh = async () => {
    await fetchReminders()
  }

  const createReminder = async (data: {
    vehicleId: string
    task?: string
    serviceTaskId?: string
    nextDue?: string
    nextDueMeter?: number
    intervalMonths?: number
    intervalMeter?: number
    type?: string
    lastServiceDate?: string
    lastServiceMeter?: number
    title?: string
    description?: string
    watchers?: string[]
    escalationDays?: number
  }): Promise<ServiceReminder> => {
    try {
      const reminder = await remindersApi.createServiceReminder(data)

      if (reminder) {
        // Rafraîchir la liste après création
        await fetchReminders()
        return reminder
      } else {
        throw new Error('Erreur lors de la création du rappel')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du rappel'
      setError(errorMessage)
      throw err
    }
  }

  const updateReminder = async (id: string, data: {
    task?: string
    serviceTaskId?: string
    nextDue?: string
    nextDueMeter?: number
    intervalMonths?: number
    intervalMeter?: number
    type?: string
    snoozedUntil?: string
    watchers?: string[]
    escalationDays?: number
    title?: string
    description?: string
  }): Promise<ServiceReminder> => {
    try {
      const reminder = await remindersApi.updateServiceReminder(id, data)

      if (reminder) {
        // Mettre à jour la liste locale
        setReminders(prev => prev.map(item =>
          item.id === id ? reminder : item
        ))
        return reminder
      } else {
        throw new Error('Erreur lors de la mise à jour du rappel')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du rappel'
      setError(errorMessage)
      throw err
    }
  }

  const deleteReminder = async (id: string): Promise<void> => {
    try {
      const success = await remindersApi.deleteServiceReminder(id)

      if (success) {
        // Retirer de la liste locale
        setReminders(prev => prev.filter(reminder => reminder.id !== id))
      } else {
        throw new Error('Erreur lors de la suppression du rappel')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du rappel'
      setError(errorMessage)
      throw err
    }
  }

  const dismissReminder = async (id: string): Promise<ServiceReminder> => {
    try {
      const reminder = await remindersApi.dismissServiceReminder(id)

      if (reminder) {
        setReminders(prev => prev.map(item =>
          item.id === id ? reminder : item
        ))
        return reminder
      } else {
        throw new Error('Erreur lors du rejet du rappel')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du rejet du rappel'
      setError(errorMessage)
      throw err
    }
  }

  const snoozeReminder = async (id: string, data: { snoozeUntil?: string; days?: number }): Promise<ServiceReminder> => {
    try {
      const reminder = await remindersApi.snoozeServiceReminder(id, data)

      if (reminder) {
        setReminders(prev => prev.map(item =>
          item.id === id ? reminder : item
        ))
        return reminder
      } else {
        throw new Error('Erreur lors du report du rappel')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du report du rappel'
      setError(errorMessage)
      throw err
    }
  }

  // Charger les rappels au montage du composant et quand les options changent
  useEffect(() => {
    fetchReminders()
  }, [options.page, options.limit, options.status, options.vehicleId, options.overdue])

  return {
    reminders,
    loading,
    error,
    pagination,
    refresh,
    createReminder,
    updateReminder,
    deleteReminder,
    dismissReminder,
    snoozeReminder
  }
}