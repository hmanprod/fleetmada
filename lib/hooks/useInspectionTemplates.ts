"use client"

import { useState, useEffect, useCallback } from 'react'
import inspectionsAPI, {
  InspectionTemplate,
  InspectionTemplateItem,
  InspectionTemplateFilters,
  InspectionTemplatesResponse,
  InspectionTemplateCreateData,
  InspectionTemplateUpdateData
} from '@/lib/services/inspections-api'

interface UseInspectionTemplatesReturn {
  templates: InspectionTemplate[]
  loading: boolean
  error: string | null
  pagination: InspectionTemplatesResponse['pagination'] | null
  // Filtres et pagination
  filters: InspectionTemplateFilters
  setFilters: (filters: InspectionTemplateFilters) => void
  fetchTemplates: (filters?: InspectionTemplateFilters) => Promise<void>
  // Actions CRUD
  createTemplate: (data: InspectionTemplateCreateData) => Promise<InspectionTemplate>
  updateTemplate: (id: string, data: InspectionTemplateUpdateData) => Promise<InspectionTemplate>
  deleteTemplate: (id: string) => Promise<void>
  // Actions spécifiques templates
  duplicateTemplate: (id: string, newName: string) => Promise<InspectionTemplate>
  toggleTemplateStatus: (id: string, isActive: boolean) => Promise<InspectionTemplate>
  getTemplate: (id: string) => Promise<InspectionTemplate>
  getTemplateItems: (id: string) => Promise<InspectionTemplateItem[]>
  // Utilitaires
  clearError: () => void
  refetch: () => Promise<void>
  // Statistiques calculées
  getStatistics: () => {
    total: number
    byCategory: Record<string, number>
    activeCount: number
    mostUsedTemplate: string | null
  }
}

export function useInspectionTemplates(initialFilters: InspectionTemplateFilters = {}): UseInspectionTemplatesReturn {
  const [templates, setTemplates] = useState<InspectionTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<InspectionTemplatesResponse['pagination'] | null>(null)
  const [filters, setFilters] = useState<InspectionTemplateFilters>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialFilters
  })

  const fetchTemplates = useCallback(async (newFilters: InspectionTemplateFilters = {}) => {
    try {
      setLoading(true)
      setError(null)

      const currentFilters = { ...filters, ...newFilters }
      setFilters(currentFilters)

      const response = await inspectionsAPI.getInspectionTemplates(currentFilters)
      setTemplates(response.templates)
      setPagination(response.pagination)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des modèles d\'inspection'
      setError(errorMessage)
      console.error('Erreur useInspectionTemplates:', err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  const createTemplate = useCallback(async (data: InspectionTemplateCreateData): Promise<InspectionTemplate> => {
    try {
      setLoading(true)
      setError(null)
      const newTemplate = await inspectionsAPI.createInspectionTemplate(data)

      // Rafraîchir la liste après création
      await fetchTemplates()

      return newTemplate
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du modèle d\'inspection'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchTemplates])

  const updateTemplate = useCallback(async (id: string, data: InspectionTemplateUpdateData): Promise<InspectionTemplate> => {
    try {
      setLoading(true)
      setError(null)
      const updatedTemplate = await inspectionsAPI.updateInspectionTemplate(id, data)

      // Mettre à jour le template dans la liste locale
      setTemplates(prev => prev.map(template =>
        template.id === id ? { ...template, ...updatedTemplate } : template
      ))

      return updatedTemplate
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la modification du modèle d\'inspection'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteTemplate = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      await inspectionsAPI.deleteInspectionTemplate(id)

      // Supprimer le template de la liste locale
      setTemplates(prev => prev.filter(template => template.id !== id))

      // Mettre à jour la pagination
      if (pagination) {
        setPagination(prev => prev ? {
          ...prev,
          totalCount: prev.totalCount - 1
        } : null)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du modèle d\'inspection'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [pagination])

  const duplicateTemplate = useCallback(async (id: string, newName: string): Promise<InspectionTemplate> => {
    try {
      setLoading(true)
      setError(null)
      const duplicatedTemplate = await inspectionsAPI.duplicateInspectionTemplate(id, newName)

      // Rafraîchir la liste après duplication
      await fetchTemplates()

      return duplicatedTemplate
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la duplication du modèle'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchTemplates])

  const toggleTemplateStatus = useCallback(async (id: string, isActive: boolean): Promise<InspectionTemplate> => {
    try {
      setLoading(true)
      setError(null)
      const updatedTemplate = await inspectionsAPI.updateInspectionTemplate(id, { isActive })

      // Mettre à jour le template dans la liste locale
      setTemplates(prev => prev.map(template =>
        template.id === id ? { ...template, ...updatedTemplate } : template
      ))

      return updatedTemplate
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du statut'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getTemplate = useCallback(async (id: string): Promise<InspectionTemplate> => {
    try {
      setLoading(true)
      setError(null)
      return await inspectionsAPI.getInspectionTemplate(id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération du modèle'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getTemplateItems = useCallback(async (id: string): Promise<InspectionTemplateItem[]> => {
    try {
      setLoading(true)
      setError(null)
      return await inspectionsAPI.getInspectionTemplateItems(id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des éléments'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const refetch = useCallback(async () => {
    await fetchTemplates()
  }, [fetchTemplates])

  // Statistiques calculées
  const getStatistics = useCallback(() => {
    const total = templates.length

    const byCategory = templates.reduce((acc, template) => {
      acc[template.category] = (acc[template.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const activeCount = templates.filter(t => t.isActive).length

    // Template le plus utilisé (basé sur _count.inspections)
    const mostUsedTemplate = templates.length > 0
      ? templates.reduce((most, current) => {
        const mostCount = (most as any)._count?.inspections || 0
        const currentCount = (current as any)._count?.inspections || 0
        return currentCount > mostCount ? current : most
      }).name
      : null

    return {
      total,
      byCategory,
      activeCount,
      mostUsedTemplate
    }
  }, [templates])

  return {
    templates,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    toggleTemplateStatus,
    getTemplate,
    getTemplateItems,
    clearError,
    refetch,
    getStatistics
  }
}

export default useInspectionTemplates