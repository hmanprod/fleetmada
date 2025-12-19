import { useAuthToken } from '@/lib/hooks/useAuthToken'

const API_BASE = '/api'

export interface ServiceReminder {
  id: string
  vehicleId: string
  vehicle?: {
    id: string
    name: string
    make: string
    model: string
  }
  serviceTaskId?: string
  task?: string
  title?: string
  description?: string
  status: 'ACTIVE' | 'DISMISSED' | 'COMPLETED' | 'OVERDUE'
  nextDue?: string
  nextDueMeter?: number
  lastServiceDate?: string
  lastServiceMeter?: number
  intervalMonths?: number
  intervalMeter?: number
  snoozedUntil?: string
  compliance: number
  type: 'date' | 'meter' | 'both'
  watchers: string[]
  escalationDays?: number
  isOverdue?: boolean
  daysUntilDue?: number
  priority?: 'NORMAL' | 'SOON' | 'OVERDUE'
  createdAt: string
  updatedAt: string
}

export interface VehicleRenewal {
  id: string
  vehicleId: string
  vehicle?: {
    id: string
    name: string
    make: string
    model: string
  }
  type: 'REGISTRATION' | 'INSURANCE' | 'INSPECTION' | 'EMISSION_TEST' | 'OTHER'
  status: 'DUE' | 'COMPLETED' | 'OVERDUE' | 'DISMISSED'
  dueDate: string
  nextDueDate?: string
  completedDate?: string
  cost?: number
  provider?: string
  notes?: string
  documentId?: string
  title?: string
  description?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  isActive: boolean
  watchers: string[]
  isOverdue?: boolean
  daysUntilDue?: number
  statusPriority?: 'NORMAL' | 'SOON' | 'OVERDUE'
  createdAt: string
  updatedAt: string
}

export interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ServiceRemindersResponse {
  reminders: ServiceReminder[]
  pagination: PaginationData
}

export interface VehicleRenewalsResponse {
  renewals: VehicleRenewal[]
  pagination: PaginationData
}

class RemindersApiService {
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const token = localStorage.getItem('authToken') || ''
      
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Request failed')
      }

      return result
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Service Reminders
  async getServiceReminders(params: {
    page?: number
    limit?: number
    status?: string
    vehicleId?: string
    overdue?: boolean
  } = {}): Promise<ServiceRemindersResponse | null> {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.status) queryParams.append('status', params.status)
    if (params.vehicleId) queryParams.append('vehicleId', params.vehicleId)
    if (params.overdue) queryParams.append('overdue', 'true')

    const result = await this.makeRequest<ServiceRemindersResponse>(
      `/service/reminders?${queryParams.toString()}`,
      { method: 'GET' }
    )

    return result.success ? result.data || null : null
  }

  async getServiceReminder(id: string): Promise<ServiceReminder | null> {
    const result = await this.makeRequest<ServiceReminder>(
      `/service/reminders/${id}`,
      { method: 'GET' }
    )

    return result.success ? result.data || null : null
  }

  async createServiceReminder(data: {
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
  }): Promise<ServiceReminder | null> {
    const result = await this.makeRequest<ServiceReminder>(
      '/service/reminders',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    )

    return result.success ? result.data || null : null
  }

  async updateServiceReminder(id: string, data: {
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
  }): Promise<ServiceReminder | null> {
    const result = await this.makeRequest<ServiceReminder>(
      `/service/reminders/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    )

    return result.success ? result.data || null : null
  }

  async deleteServiceReminder(id: string): Promise<boolean> {
    const result = await this.makeRequest<{}>(
      `/service/reminders/${id}`,
      { method: 'DELETE' }
    )

    return result.success
  }

  async dismissServiceReminder(id: string): Promise<ServiceReminder | null> {
    const result = await this.makeRequest<ServiceReminder>(
      `/service/reminders/${id}/dismiss`,
      { method: 'POST' }
    )

    return result.success ? result.data || null : null
  }

  async snoozeServiceReminder(id: string, data: {
    snoozeUntil?: string
    days?: number
  }): Promise<ServiceReminder | null> {
    const result = await this.makeRequest<ServiceReminder>(
      `/service/reminders/${id}/snooze`,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    )

    return result.success ? result.data || null : null
  }

  // Vehicle Renewals
  async getVehicleRenewals(params: {
    page?: number
    limit?: number
    status?: string
    type?: string
    vehicleId?: string
    overdue?: boolean
    dueSoon?: boolean
  } = {}): Promise<VehicleRenewalsResponse | null> {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.status) queryParams.append('status', params.status)
    if (params.type) queryParams.append('type', params.type)
    if (params.vehicleId) queryParams.append('vehicleId', params.vehicleId)
    if (params.overdue) queryParams.append('overdue', 'true')
    if (params.dueSoon) queryParams.append('dueSoon', 'true')

    const result = await this.makeRequest<VehicleRenewalsResponse>(
      `/vehicle-renewals?${queryParams.toString()}`,
      { method: 'GET' }
    )

    return result.success ? result.data || null : null
  }

  async getVehicleRenewal(id: string): Promise<VehicleRenewal | null> {
    const result = await this.makeRequest<VehicleRenewal>(
      `/vehicle-renewals/${id}`,
      { method: 'GET' }
    )

    return result.success ? result.data || null : null
  }

  async createVehicleRenewal(data: {
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
  }): Promise<VehicleRenewal | null> {
    const result = await this.makeRequest<VehicleRenewal>(
      '/vehicle-renewals',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    )

    return result.success ? result.data || null : null
  }

  async updateVehicleRenewal(id: string, data: {
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
  }): Promise<VehicleRenewal | null> {
    const result = await this.makeRequest<VehicleRenewal>(
      `/vehicle-renewals/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    )

    return result.success ? result.data || null : null
  }

  async deleteVehicleRenewal(id: string): Promise<boolean> {
    const result = await this.makeRequest<{}>(
      `/vehicle-renewals/${id}`,
      { method: 'DELETE' }
    )

    return result.success
  }

  async completeVehicleRenewal(id: string, data: {
    completedDate?: string
    cost?: number
    provider?: string
    notes?: string
    documentId?: string
  }): Promise<VehicleRenewal | null> {
    const result = await this.makeRequest<VehicleRenewal>(
      `/vehicle-renewals/${id}/complete`,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    )

    return result.success ? result.data || null : null
  }

  // Combined methods for dashboard
  async getAllRemindersCount(userId: string): Promise<{
    serviceReminders: number
    vehicleRenewals: number
    overdue: number
    dueSoon: number
  } | null> {
    try {
      const [serviceResult, renewalResult] = await Promise.all([
        this.getServiceReminders({ limit: 1000 }),
        this.getVehicleRenewals({ limit: 1000 })
      ])

      if (!serviceResult || !renewalResult) return null

      const serviceReminders = serviceResult.reminders
      const vehicleRenewals = renewalResult.renewals

      const overdue = [
        ...serviceReminders.filter(r => r.isOverdue),
        ...vehicleRenewals.filter(r => r.isOverdue)
      ].length

      const dueSoon = [
        ...serviceReminders.filter(r => r.daysUntilDue != null && r.daysUntilDue <= 7),
        ...vehicleRenewals.filter(r => r.daysUntilDue != null && r.daysUntilDue <= 7)
      ].length

      return {
        serviceReminders: serviceReminders.length,
        vehicleRenewals: vehicleRenewals.length,
        overdue,
        dueSoon
      }
    } catch (error) {
      console.error('Error getting reminders count:', error)
      return null
    }
  }
}

export const remindersApi = new RemindersApiService()
export default remindersApi