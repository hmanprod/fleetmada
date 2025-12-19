/**
 * Hook pour gérer les détails d'une pièce spécifique
 */

import { useState, useEffect, useCallback } from 'react'
import { partsAPI, PartWithDetails, StockMovement, ReorderData } from '@/lib/services/parts-api'

export interface UsePartDetailsOptions {
  enabled?: boolean
  includeHistory?: boolean
  includeSuppliers?: boolean
  includeVehicles?: boolean
}

export interface UsePartDetailsReturn {
  part: PartWithDetails | null
  loading: boolean
  error: string | null
  stockHistory: StockMovement[]
  // Actions
  refresh: () => Promise<void>
  updatePart: (data: any) => Promise<PartWithDetails | null>
  adjustStock: (data: { quantity: number; reason?: string; type?: 'add' | 'remove' | 'set' }) => Promise<PartWithDetails | null>
  reorder: (data: ReorderData) => Promise<boolean>
  getStockHistory: () => Promise<StockMovement[]>
  // Statuts
  isLowStock: boolean
  isOutOfStock: boolean
  stockPercentage: number
}

export function usePartDetails(partId: string, options: UsePartDetailsOptions = {}): UsePartDetailsReturn {
  const {
    enabled = true,
    includeHistory = true,
    includeSuppliers = false,
    includeVehicles = false
  } = options

  const [part, setPart] = useState<PartWithDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stockHistory, setStockHistory] = useState<StockMovement[]>([])

  const fetchPartDetails = useCallback(async () => {
    if (!enabled || !partId) return

    setLoading(true)
    setError(null)

    try {
      // Récupérer les détails de la pièce
      const response = await partsAPI.getPart(partId)
      setPart(response.data)

      // Récupérer l'historique du stock si demandé
      if (includeHistory) {
        const historyResponse = await partsAPI.getStockHistory(partId)
        setStockHistory(historyResponse.data)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des détails de la pièce')
    } finally {
      setLoading(false)
    }
  }, [enabled, partId, includeHistory, includeSuppliers, includeVehicles])

  const refresh = useCallback(async () => {
    await fetchPartDetails()
  }, [fetchPartDetails])

  const updatePart = useCallback(async (data: any): Promise<PartWithDetails | null> => {
    if (!partId) return null

    setLoading(true)
    setError(null)

    try {
      const response = await partsAPI.updatePart(partId, data)
      const updatedPart = response.data
      
      setPart(updatedPart)
      return updatedPart
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la pièce')
      return null
    } finally {
      setLoading(false)
    }
  }, [partId])

  const adjustStock = useCallback(async (data: { quantity: number; reason?: string; type?: 'add' | 'remove' | 'set' }): Promise<PartWithDetails | null> => {
    if (!partId) return null

    setLoading(true)
    setError(null)

    try {
      const response = await partsAPI.adjustStock(partId, data)
      const updatedPart = response.data
      
      setPart(updatedPart)
      
      // Actualiser l'historique du stock
      if (includeHistory) {
        const historyResponse = await partsAPI.getStockHistory(partId)
        setStockHistory(historyResponse.data)
      }
      
      return updatedPart
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajustement du stock')
      return null
    } finally {
      setLoading(false)
    }
  }, [partId, includeHistory])

  const reorder = useCallback(async (data: ReorderData): Promise<boolean> => {
    if (!partId) return false

    setLoading(true)
    setError(null)

    try {
      await partsAPI.reorder(partId, data)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la commande de réapprovisionnement')
      return false
    } finally {
      setLoading(false)
    }
  }, [partId])

  const getStockHistory = useCallback(async (): Promise<StockMovement[]> => {
    if (!partId) return []

    try {
      const response = await partsAPI.getStockHistory(partId)
      const history = response.data
      setStockHistory(history)
      return history
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération de l\'historique')
      return []
    }
  }, [partId])

  // Calculs dérivés
  const isLowStock = part?.quantity !== undefined && part?.minimumStock !== undefined && part.quantity <= part.minimumStock
  const isOutOfStock = part?.quantity === 0
  const stockPercentage = part?.quantity !== undefined && part?.minimumStock !== undefined 
    ? Math.min(100, Math.round((part.quantity / Math.max(part.minimumStock, 1)) * 100))
    : 0

  useEffect(() => {
    fetchPartDetails()
  }, [fetchPartDetails])

  return {
    part,
    loading,
    error,
    stockHistory,
    refresh,
    updatePart,
    adjustStock,
    reorder,
    getStockHistory,
    isLowStock,
    isOutOfStock,
    stockPercentage
  }
}