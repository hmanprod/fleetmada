/**
 * Hook personnalisé pour gérer les pièces détachées
 */

import { useState, useEffect, useCallback } from 'react'
import { partsAPI, Part, PartsQuery, CreatePartData, UpdatePartData, StockAdjustmentData } from '@/lib/services/parts-api'

export interface UsePartsOptions extends PartsQuery {
  enabled?: boolean
}

export interface UsePartsReturn {
  parts: Part[]
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
  fetchParts: (query?: PartsQuery) => Promise<void>
  createPart: (data: CreatePartData) => Promise<Part | null>
  updatePart: (id: string, data: UpdatePartData) => Promise<Part | null>
  deletePart: (id: string) => Promise<boolean>
  adjustStock: (id: string, data: StockAdjustmentData) => Promise<Part | null>
  refresh: () => void
  // Statistiques
  lowStockParts: Part[]
  totalValue: number
  // Actions avancées
  searchParts: (query: string) => Promise<Part[]>
  getStats: () => Promise<any>
  getLowStock: () => Promise<Part[]>
  getManufacturers: () => Promise<any[]>
  getCategories: () => Promise<any[]>
}

export function useParts(options: UsePartsOptions = {}): UsePartsReturn {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    lowStock,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    enabled = true
  } = options

  const [parts, setParts] = useState<Part[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<UsePartsReturn['pagination']>(null)

  const fetchParts = useCallback(async (query: PartsQuery = {}) => {
    if (!enabled) return

    setLoading(true)
    setError(null)

    try {
      const response = await partsAPI.getParts({
        page,
        limit,
        search,
        category,
        lowStock,
        sortBy,
        sortOrder,
        ...query
      })

      setParts(response.data.parts || [])
      setPagination(response.data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des pièces')
    } finally {
      setLoading(false)
    }
  }, [enabled, page, limit, search, category, lowStock, sortBy, sortOrder])

  const createPart = useCallback(async (data: CreatePartData): Promise<Part | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await partsAPI.createPart(data)
      const newPart = response.data

      // Ajouter la nouvelle pièce à la liste
      setParts(prev => [newPart, ...prev])

      // Mettre à jour la pagination
      if (pagination) {
        setPagination(prev => prev ? {
          ...prev,
          total: prev.total + 1,
          totalPages: Math.ceil((prev.total + 1) / prev.limit)
        } : null)
      }

      return newPart
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de la pièce'
      setError(errorMessage)
      // Propager l'erreur pour que l'appelant puisse la gérer
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [pagination])

  const updatePart = useCallback(async (id: string, data: Partial<CreatePartData>): Promise<Part | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await partsAPI.updatePart(id, data)
      const updatedPart = response.data

      // Mettre à jour la pièce dans la liste
      setParts(prev => prev.map(part => part.id === id ? updatedPart : part))

      return updatedPart
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la pièce')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const deletePart = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      await partsAPI.deletePart(id)

      // Supprimer la pièce de la liste
      setParts(prev => prev.filter(part => part.id !== id))

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
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de la pièce')
      return false
    } finally {
      setLoading(false)
    }
  }, [pagination])

  const adjustStock = useCallback(async (id: string, data: StockAdjustmentData): Promise<Part | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await partsAPI.adjustStock(id, data)
      // La réponse de adjustStock contient { part, stockMovement, adjustment } dans data
      const updatedPart = (response.data as any).part || response.data

      // Mettre à jour la pièce dans la liste
      setParts(prev => prev.map(part => part.id === id ? updatedPart : part))

      return updatedPart
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajustement du stock')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(() => {
    fetchParts()
  }, [fetchParts])

  // Fonctions utilitaires
  const searchParts = useCallback(async (query: string): Promise<Part[]> => {
    try {
      const response = await partsAPI.searchParts(query)
      return response.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche')
      return []
    }
  }, [])

  const getStats = useCallback(async () => {
    try {
      const response = await partsAPI.getStats()
      return response.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des statistiques')
      return null
    }
  }, [])

  const getLowStock = useCallback(async (): Promise<Part[]> => {
    try {
      const response = await partsAPI.getLowStock()
      return response.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des pièces en stock faible')
      return []
    }
  }, [])

  const getManufacturers = useCallback(async (): Promise<any[]> => {
    try {
      const response = await partsAPI.getManufacturers()
      return response.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des fabricants')
      return []
    }
  }, [])

  const getCategories = useCallback(async (): Promise<any[]> => {
    try {
      const response = await partsAPI.getCategories()
      // Handle the complex response structure or direct array
      if (response.success && response.data) {
        return Array.isArray(response.data)
          ? response.data
          : (response.data as any).categories || []
      }
      return []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des catégories')
      return []
    }
  }, [])

  // Calculs dérivés
  const lowStockParts = parts.filter(part => part.lowStockAlert)
  const totalValue = parts.reduce((sum, part) => sum + (part.cost || 0) * (part.quantity || 0), 0)

  useEffect(() => {
    fetchParts()
  }, [fetchParts])

  return {
    parts,
    loading,
    error,
    pagination,
    fetchParts,
    createPart,
    updatePart,
    deletePart,
    adjustStock,
    refresh,
    lowStockParts,
    totalValue,
    searchParts,
    getStats,
    getLowStock,
    getManufacturers,
    getCategories
  }
}