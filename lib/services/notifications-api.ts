import { useAuthToken } from '@/lib/hooks/useAuthToken'

const API_BASE = '/api/notifications'

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'REMINDER_DUE' | 'REMINDER_OVERDUE' | 'ASSIGNMENT' | 'COMMENT' | 'SYSTEM'
  read: boolean
  link?: string
  createdAt: Date
}

export interface CreateNotificationData {
  title: string
  message: string
  type: 'REMINDER_DUE' | 'REMINDER_OVERDUE' | 'ASSIGNMENT' | 'COMMENT' | 'SYSTEM'
  link?: string
}

export interface NotificationsListResponse {
  success: boolean
  data: {
    notifications: Notification[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
    unreadCount: number
  }
}

export interface NotificationResponse {
  success: boolean
  data: Notification
  message?: string
}

class NotificationsApiService {
  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        throw new Error('Token d\'authentification manquant')
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }))
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`)
      }

      return response.json()
    }
    
    throw new Error('Cette fonction doit être appelée côté client')
  }

  /**
   * Récupérer la liste des notifications
   */
  async getNotifications(params: {
    page?: number
    limit?: number
    unreadOnly?: boolean
    type?: string
  } = {}): Promise<NotificationsListResponse> {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.set('page', params.page.toString())
    if (params.limit) queryParams.set('limit', params.limit.toString())
    if (params.unreadOnly) queryParams.set('unreadOnly', 'true')
    if (params.type) queryParams.set('type', params.type)

    const url = `${API_BASE}?${queryParams.toString()}`
    return this.makeRequest<NotificationsListResponse>(url)
  }

  /**
   * Créer une nouvelle notification
   */
  async createNotification(data: CreateNotificationData): Promise<NotificationResponse> {
    return this.makeRequest<NotificationResponse>(API_BASE, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(id: string): Promise<NotificationResponse> {
    return this.makeRequest<NotificationResponse>(`${API_BASE}/${id}/read`, {
      method: 'PATCH'
    })
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(): Promise<{ success: boolean; message: string; updatedCount: number }> {
    return this.makeRequest<{ success: boolean; message: string; updatedCount: number }>(`${API_BASE}/mark-all-read`, {
      method: 'PATCH'
    })
  }

  /**
   * Supprimer une notification
   */
  async deleteNotification(id: string): Promise<{ success: boolean; message: string }> {
    const response = await this.makeRequest<{ success: boolean; message: string }>(`${API_BASE}/${id}`, {
      method: 'DELETE'
    })
    return response
  }

  /**
   * Obtenir le nombre de notifications non lues
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await this.getNotifications({ limit: 1 })
      return response.data.unreadCount || 0
    } catch (error) {
      console.error('Erreur lors du comptage des notifications non lues:', error)
      return 0
    }
  }
}

export const notificationsApi = new NotificationsApiService()
export default notificationsApi