/**
 * Service API pour le module Service FleetMada
 * Centralise toutes les interactions avec les APIs backend
 */

import { authAPI } from '../../lib/auth-api'

const API_BASE_URL = '/api'

// Interface pour les réponses paginées
export interface PaginatedResponse<T> {
  success: boolean
  data: {
    parts?: T[]
    tasks?: T[]
    programs?: T[]
    reminders?: T[]
    entries?: T[]
    statusCounts?: Record<string, number>
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
}

// Interface pour les réponses simples
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface ServiceEntryComment {
  id: string
  serviceEntryId: string
  author: string
  content: string
  createdAt: string
}

export interface ServiceEntryPhoto {
  id: string
  serviceEntryId: string
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  createdAt: string
}

export interface ServiceEntryCommentData {
  author: string
  content: string
}

export interface ServiceEntryCommentUpdateData {
  content: string
}

// Interface pour les entrées de service
export interface ServiceEntry {
  id: string
  vehicleId: string
  userId: string
  date: string
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  totalCost: number
  meter?: number
  vendor?: string | { id: string; name: string }
  vendorName?: string
  notes?: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  assignedTo?: string
  issuedBy?: string
  scheduledStartDate?: string
  scheduledStartTime?: string
  invoiceNumber?: string
  poNumber?: string
  discountType?: '%' | '€'
  discountValue?: number
  taxType?: '%' | '€'
  taxValue?: number
  watchers: number
  isWorkOrder: boolean
  reasonForRepairCode?: string
  createdAt: string
  updatedAt: string;
  vehicle?: {
    id: string;
    name: string;
    make: string;
    model: string;
    licensePlate?: string;
  };
  assignedToContact?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  user?: {
    id: string
    name: string
    email: string
  }
  tasks?: Array<{
    id: string
    serviceTask: {
      id: string
      name: string
      description: string
    }
    cost?: number
    notes?: string
  }>
  parts?: Array<{
    id: string
    part: {
      id: string
      number: string
      description: string
    }
    quantity: number
    unitCost: number
    totalCost: number
    notes?: string
  }>
}

// Interface pour les tâches de service
export interface ServiceTask {
  id: string
  name: string
  description?: string
  entryCount: number
  reminderCount: number
  programCount: number
  woCount: number
  categoryCode?: string
  systemCode?: string
  assemblyCode?: string
  reasonForRepairCode?: string
  createdAt: string
  updatedAt: string
  _count?: {
    taskEntries: number
    programs: number
  }
}

// Interface pour les pièces détachées
export interface Part {
  id: string
  number: string
  description: string
  category?: string
  manufacturer?: string
  cost?: number
  quantity: number
  minimumStock: number
  createdAt: string
  updatedAt: string
  lowStockAlert?: boolean
  stockStatus?: 'OUT_OF_STOCK' | 'LOW_STOCK' | 'IN_STOCK'
}

// Interface pour les programmes de service
export interface ServiceProgram {
  id: string
  name: string
  description?: string
  frequency: string
  nextDue?: string
  active: boolean
  createdAt: string
  updatedAt: string
  vehicles?: Array<{
    id: string
    vehicle: {
      id: string
      name: string
      make: string
      model: string
    }
    lastService?: string
    nextService?: string
    lastMeter?: number
    nextMeter?: number
  }>
  tasks?: Array<{
    id: string
    serviceTask: {
      id: string
      name: string
      description: string
    }
    estimatedCost?: number
    estimatedTime?: number
    instructions?: string
  }>
  _count?: {
    vehicles: number
    tasks: number
  }
  vehicleCount?: number
  taskCount?: number
  nextDueCount?: number
}

// Interface pour les rappels de service
export interface ServiceReminder {
  id: string
  vehicleId: string
  task: string
  status: 'ACTIVE' | 'DISMISSED' | 'COMPLETED' | 'OVERDUE'
  nextDue: string
  nextDueKm?: number
  compliance: number
  type: string
  createdAt: string
  updatedAt: string
  vehicle?: {
    id: string
    name: string
    make: string
    model: string
  }
  isOverdue?: boolean
  daysUntilDue?: number
  priority?: 'NORMAL' | 'SOON' | 'OVERDUE'
}

// Interface pour les paramètres de requête
export interface ServiceEntriesQuery {
  page?: number
  limit?: number
  status?: string
  vehicleId?: string
  isWorkOrder?: boolean
  startDate?: string
  endDate?: string
  search?: string
}

export interface ServiceTasksQuery {
  page?: number
  limit?: number
  search?: string
  category?: string
  system?: string
}

export interface PartsQuery {
  page?: number
  limit?: number
  search?: string
  category?: string
  lowStock?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ServiceProgramsQuery {
  page?: number
  limit?: number
  search?: string
  active?: boolean
}

export interface ServiceRemindersQuery {
  page?: number
  limit?: number
  status?: string
  vehicleId?: string
  overdue?: boolean
}

// Interface pour les données de création
export interface CreateServiceEntryData {
  vehicleId: string
  date: string
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  totalCost?: number
  meter?: number
  vendor?: string
  notes?: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  assignedTo?: string
  assignedToContactId?: string
  issuedBy?: string
  scheduledStartDate?: string
  scheduledStartTime?: string
  invoiceNumber?: string
  poNumber?: string
  discountType?: '%' | '€'
  discountValue?: number
  taxType?: '%' | '€'
  taxValue?: number
  vendorId?: string
  isWorkOrder?: boolean
  reasonForRepairCode?: string
  tasks?: string[] | Array<{ serviceTaskId: string; cost?: number; notes?: string }>
  parts?: Array<{
    partId: string
    quantity?: number
    unitCost?: number
    notes?: string
  }>
  resolvedIssueIds?: string[]
  documents?: string[]
}

export interface CreateServiceTaskData {
  name: string
  description?: string
  categoryCode?: string
  systemCode?: string
  assemblyCode?: string
  reasonForRepairCode?: string
}

export interface CreatePartData {
  number: string
  description: string
  category?: string
  manufacturer?: string
  cost?: number
  quantity?: number
  minimumStock?: number
}

export interface CreateServiceProgramData {
  name: string
  description?: string
  frequency: string
  nextDue?: string
  active?: boolean
  tasks?: string[]
}

export interface CreateServiceReminderData {
  vehicleId: string
  task: string
  nextDue?: string
  nextDueKm?: number
  type?: string
}

class ServiceAPI {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    }

    // Ajouter le token d'authentification
    const token = authAPI.getToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur de connexion' }))
      throw new Error(error.message || `Erreur HTTP: ${response.status}`)
    }

    return response.json()
  }

  // === Service Entries ===
  async getServiceEntries(query: ServiceEntriesQuery = {}): Promise<PaginatedResponse<ServiceEntry>> {
    const params = new URLSearchParams()
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })

    return this.makeRequest(`/service/entries?${params}`)
  }

  async createServiceEntry(data: CreateServiceEntryData): Promise<ApiResponse<ServiceEntry>> {
    return this.makeRequest('/service/entries', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getServiceEntry(id: string): Promise<ApiResponse<ServiceEntry>> {
    return this.makeRequest(`/service/entries/${id}`)
  }

  async updateServiceEntry(id: string, data: Partial<CreateServiceEntryData>): Promise<ApiResponse<ServiceEntry>> {
    return this.makeRequest(`/service/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteServiceEntry(id: string): Promise<ApiResponse<{ id: string }>> {
    return this.makeRequest(`/service/entries/${id}`, {
      method: 'DELETE'
    })
  }

  async completeServiceEntry(id: string): Promise<ApiResponse<ServiceEntry>> {
    return this.makeRequest(`/service/entries/${id}/complete`, {
      method: 'POST'
    })
  }

  // === Service Entry Comments ===
  async getServiceEntryComments(serviceEntryId: string): Promise<ServiceEntryComment[]> {
    const result = await this.makeRequest<ServiceEntryComment[]>(`/service/entries/${serviceEntryId}/comments`)
    return result
  }

  async addServiceEntryComment(serviceEntryId: string, data: ServiceEntryCommentData): Promise<ServiceEntryComment> {
    const result = await this.makeRequest<ServiceEntryComment>(`/service/entries/${serviceEntryId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
    return result
  }

  async updateServiceEntryComment(serviceEntryId: string, commentId: string, data: ServiceEntryCommentUpdateData): Promise<ServiceEntryComment> {
    const result = await this.makeRequest<ServiceEntryComment>(`/service/entries/${serviceEntryId}/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
    return result
  }

  async deleteServiceEntryComment(serviceEntryId: string, commentId: string): Promise<void> {
    await this.makeRequest(`/service/entries/${serviceEntryId}/comments/${commentId}`, {
      method: 'DELETE'
    })
  }

  // === Service Entry Photos ===
  async getServiceEntryPhotos(serviceEntryId: string): Promise<ServiceEntryPhoto[]> {
    const result = await this.makeRequest<ServiceEntryPhoto[]>(`/service/entries/${serviceEntryId}/photos`)
    return result
  }

  async uploadServiceEntryPhotos(serviceEntryId: string, files: File[]): Promise<ServiceEntryPhoto[]> {
    const token = authAPI.getToken()
    if (!token) throw new Error('Authentication token missing')

    const formData = new FormData()
    files.forEach(file => formData.append('photos', file))

    const response = await fetch(`${API_BASE_URL}/service/entries/${serviceEntryId}/photos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error uploading photos' }))
      throw new Error(error.message || `HTTP Error: ${response.status}`)
    }

    const result = await response.json()
    return result.data
  }

  async deleteServiceEntryPhoto(serviceEntryId: string, photoId: string): Promise<void> {
    await this.makeRequest(`/service/entries/${serviceEntryId}/photos/${photoId}`, {
      method: 'DELETE'
    })
  }

  // === Service Tasks ===
  async getServiceTasks(query: ServiceTasksQuery = {}): Promise<PaginatedResponse<ServiceTask>> {
    const params = new URLSearchParams()
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })

    return this.makeRequest(`/service/tasks?${params}`)
  }

  async createServiceTask(data: CreateServiceTaskData): Promise<ApiResponse<ServiceTask>> {
    return this.makeRequest('/service/tasks', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getServiceTask(id: string): Promise<ApiResponse<ServiceTask>> {
    return this.makeRequest(`/service/tasks/${id}`)
  }

  async updateServiceTask(id: string, data: Partial<CreateServiceTaskData>): Promise<ApiResponse<ServiceTask>> {
    return this.makeRequest(`/service/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteServiceTask(id: string): Promise<ApiResponse<{ id: string }>> {
    return this.makeRequest(`/service/tasks/${id}`, {
      method: 'DELETE'
    })
  }

  // === Parts ===
  async getParts(query: PartsQuery = {}): Promise<PaginatedResponse<Part>> {
    const params = new URLSearchParams()
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })

    return this.makeRequest(`/parts?${params}`)
  }

  async createPart(data: CreatePartData): Promise<ApiResponse<Part>> {
    return this.makeRequest('/parts', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getPart(id: string): Promise<ApiResponse<Part>> {
    return this.makeRequest(`/parts/${id}`)
  }

  async updatePart(id: string, data: Partial<CreatePartData>): Promise<ApiResponse<Part>> {
    return this.makeRequest(`/parts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deletePart(id: string): Promise<ApiResponse<{ id: string }>> {
    return this.makeRequest(`/parts/${id}`, {
      method: 'DELETE'
    })
  }

  async adjustPartStock(id: string, adjustment: { quantity: number; reason?: string }): Promise<ApiResponse<Part>> {
    return this.makeRequest(`/parts/${id}/adjust-stock`, {
      method: 'POST',
      body: JSON.stringify(adjustment)
    })
  }

  // === Service Programs ===
  async getServicePrograms(query: ServiceProgramsQuery = {}): Promise<PaginatedResponse<ServiceProgram>> {
    const params = new URLSearchParams()
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })

    return this.makeRequest(`/service/programs?${params}`)
  }

  async createServiceProgram(data: CreateServiceProgramData): Promise<ApiResponse<ServiceProgram>> {
    return this.makeRequest('/service/programs', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getServiceProgram(id: string): Promise<ApiResponse<ServiceProgram>> {
    return this.makeRequest(`/service/programs/${id}`)
  }

  async updateServiceProgram(id: string, data: Partial<CreateServiceProgramData>): Promise<ApiResponse<ServiceProgram>> {
    return this.makeRequest(`/service/programs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteServiceProgram(id: string): Promise<ApiResponse<{ id: string }>> {
    return this.makeRequest(`/service/programs/${id}`, {
      method: 'DELETE'
    })
  }

  async getServiceProgramVehicles(id: string): Promise<ApiResponse<any[]>> {
    return this.makeRequest(`/service/programs/${id}/vehicles`)
  }

  async addVehicleToProgram(programId: string, vehicleId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/service/programs/${programId}/vehicles`, {
      method: 'POST',
      body: JSON.stringify({ vehicleId })
    })
  }

  // === Service Reminders ===
  async getServiceReminders(query: ServiceRemindersQuery = {}): Promise<PaginatedResponse<ServiceReminder>> {
    const params = new URLSearchParams()
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })

    return this.makeRequest(`/service/reminders?${params}`)
  }

  async createServiceReminder(data: CreateServiceReminderData): Promise<ApiResponse<ServiceReminder>> {
    return this.makeRequest('/service/reminders', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateServiceReminder(id: string, data: Partial<CreateServiceReminderData>): Promise<ApiResponse<ServiceReminder>> {
    return this.makeRequest(`/service/reminders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteServiceReminder(id: string): Promise<ApiResponse<{ id: string }>> {
    return this.makeRequest(`/service/reminders/${id}`, {
      method: 'DELETE'
    })
  }

  async dismissServiceReminder(id: string): Promise<ApiResponse<ServiceReminder>> {
    return this.makeRequest(`/service/reminders/${id}/dismiss`, {
      method: 'POST'
    })
  }
}

export const serviceAPI = new ServiceAPI()