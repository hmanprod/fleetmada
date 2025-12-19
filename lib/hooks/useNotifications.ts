import { useState, useEffect } from 'react'

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'REMINDER_DUE' | 'REMINDER_OVERDUE' | 'ASSIGNMENT' | 'COMMENT' | 'SYSTEM'
  read: boolean
  link?: string
  createdAt: string
}

export interface UseNotificationsOptions {
  page?: number
  limit?: number
  unreadOnly?: boolean
  type?: string
}

export interface UseNotificationsReturn {
  notifications: Notification[]
  loading: boolean
  error: string | null
  unreadCount: number
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  } | null
  refresh: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  createNotification: (data: {
    title: string
    message: string
    type: string
    link?: string
  }) => Promise<Notification>
}

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<UseNotificationsReturn['pagination']>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const queryParams = new URLSearchParams()
      if (options.page) queryParams.append('page', options.page.toString())
      if (options.limit) queryParams.append('limit', options.limit.toString())
      if (options.unreadOnly) queryParams.append('unreadOnly', 'true')
      if (options.type) queryParams.append('type', options.type)

      const token = localStorage.getItem('authToken') || ''
      
      const response = await fetch(`/api/notifications?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        setNotifications(result.data.notifications)
        setPagination(result.data.pagination)
        setUnreadCount(result.data.unreadCount)
      } else {
        setError('Erreur lors du chargement des notifications')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const refresh = async () => {
    await fetchNotifications()
  }

  const markAsRead = async (id: string): Promise<void> => {
    try {
      const token = localStorage.getItem('authToken') || ''
      
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        // Mettre à jour la liste locale
        setNotifications(prev => prev.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        ))
        setUnreadCount(prev => Math.max(0, prev - 1))
      } else {
        throw new Error('Erreur lors du marquage de la notification')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du marquage de la notification'
      setError(errorMessage)
      throw err
    }
  }

  const markAllAsRead = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('authToken') || ''
      
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        // Marquer toutes les notifications comme lues
        setNotifications(prev => prev.map(notification => ({ ...notification, read: true })))
        setUnreadCount(0)
      } else {
        throw new Error('Erreur lors du marquage de toutes les notifications')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du marquage de toutes les notifications'
      setError(errorMessage)
      throw err
    }
  }

  const createNotification = async (data: {
    title: string
    message: string
    type: string
    link?: string
  }): Promise<Notification> => {
    try {
      const token = localStorage.getItem('authToken') || ''
      
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        // Ajouter la nouvelle notification au début de la liste
        setNotifications(prev => [result.data, ...prev])
        setUnreadCount(prev => prev + 1)
        return result.data
      } else {
        throw new Error('Erreur lors de la création de la notification')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de la notification'
      setError(errorMessage)
      throw err
    }
  }

  // Charger les notifications au montage du composant et quand les options changent
  useEffect(() => {
    fetchNotifications()
  }, [options.page, options.limit, options.unreadOnly, options.type])

  return {
    notifications,
    loading,
    error,
    unreadCount,
    pagination,
    refresh,
    markAsRead,
    markAllAsRead,
    createNotification
  }
}