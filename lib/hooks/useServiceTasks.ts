/**
 * Hook personnalisé pour gérer les tâches de service
 */

import { useState, useEffect, useCallback } from 'react'
import { serviceAPI, ServiceTask, ServiceTasksQuery, CreateServiceTaskData } from '@/lib/services/service-api'

export interface UseServiceTasksOptions extends ServiceTasksQuery {
  enabled?: boolean
}

export interface UseServiceTasksReturn {
  tasks: ServiceTask[]
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
  fetchTasks: (query?: ServiceTasksQuery) => Promise<void>
  createTask: (data: CreateServiceTaskData) => Promise<ServiceTask | null>
  updateTask: (id: string, data: Partial<CreateServiceTaskData>) => Promise<ServiceTask | null>
  deleteTask: (id: string) => Promise<boolean>
  getTask: (id: string) => Promise<ServiceTask | null>
  refresh: () => void
  // Calculs automatiques et statistiques
  totalTasks: number
  tasksByCategory: Record<string, number>
  tasksBySystem: Record<string, number>
  mostUsedTasks: ServiceTask[]
  avgTaskUsage: number
  tasksWithReminders: number
  tasksInPrograms: number
}

export function useServiceTasks(options: UseServiceTasksOptions = {}): UseServiceTasksReturn {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    system,
    enabled = true,
    ...otherOptions
  } = options

  const [tasks, setTasks] = useState<ServiceTask[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<UseServiceTasksReturn['pagination']>(null)

  const fetchTasks = useCallback(async (query: ServiceTasksQuery = {}) => {
    if (!enabled) return

    setLoading(true)
    setError(null)

    try {
      const response = await serviceAPI.getServiceTasks({
        page,
        limit,
        search,
        category,
        system,
        ...query
      })

      setTasks(response.data.tasks || [])
      setPagination(response.data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des tâches de service')
    } finally {
      setLoading(false)
    }
  }, [enabled, page, limit, search, category, system])

  const createTask = useCallback(async (data: CreateServiceTaskData): Promise<ServiceTask | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await serviceAPI.createServiceTask(data)
      const newTask = response.data

      // Ajouter la nouvelle tâche à la liste
      setTasks(prev => [newTask, ...prev])
      
      // Mettre à jour la pagination
      if (pagination) {
        setPagination(prev => prev ? {
          ...prev,
          total: prev.total + 1,
          totalPages: Math.ceil((prev.total + 1) / prev.limit)
        } : null)
      }

      return newTask
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de la tâche')
      return null
    } finally {
      setLoading(false)
    }
  }, [pagination])

  const updateTask = useCallback(async (id: string, data: Partial<CreateServiceTaskData>): Promise<ServiceTask | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await serviceAPI.updateServiceTask(id, data)
      const updatedTask = response.data

      // Mettre à jour la tâche dans la liste
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task))

      return updatedTask
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la tâche')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      await serviceAPI.deleteServiceTask(id)

      // Supprimer la tâche de la liste
      setTasks(prev => prev.filter(task => task.id !== id))
      
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
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de la tâche')
      return false
    } finally {
      setLoading(false)
    }
  }, [pagination])

  const getTask = useCallback(async (id: string): Promise<ServiceTask | null> => {
    try {
      const response = await serviceAPI.getServiceTask(id)
      return response.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération de la tâche')
      return null
    }
  }, [])

  const refresh = useCallback(() => {
    fetchTasks()
  }, [fetchTasks])

  // Calculs automatiques et statistiques
  const totalTasks = tasks.length

  const tasksByCategory = tasks.reduce((acc, task) => {
    const cat = task.categoryCode || 'Non catégorisé'
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const tasksBySystem = tasks.reduce((acc, task) => {
    const sys = task.systemCode || 'Non défini'
    acc[sys] = (acc[sys] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const mostUsedTasks = tasks
    .sort((a, b) => b.entryCount - a.entryCount)
    .slice(0, 5)

  const avgTaskUsage = tasks.length > 0 
    ? tasks.reduce((sum, task) => sum + task.entryCount, 0) / tasks.length 
    : 0

  const tasksWithReminders = tasks.filter(task => task.reminderCount > 0).length

  const tasksInPrograms = tasks.filter(task => task.programCount > 0).length

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return {
    tasks,
    loading,
    error,
    pagination,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    getTask,
    refresh,
    // Calculs automatiques et statistiques
    totalTasks,
    tasksByCategory,
    tasksBySystem,
    mostUsedTasks,
    avgTaskUsage,
    tasksWithReminders,
    tasksInPrograms
  }
}