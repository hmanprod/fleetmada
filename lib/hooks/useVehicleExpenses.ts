'use client'

import { useState, useEffect, useCallback } from 'react'
import { vehiclesAPI, type ExpenseEntry, type VehicleExpensesResponse } from '@/lib/services/vehicles-api'
import type { CreateExpenseEntryInput, UpdateExpenseEntryInput } from '@/lib/validations/vehicle-validations'

interface UseVehicleExpensesOptions {
  vehicleId: string
  query?: any // Pour les filtres (type, status, dates, etc.)
  autoFetch?: boolean
}

interface UseVehicleExpensesReturn {
  expenses: ExpenseEntry[]
  pagination: VehicleExpensesResponse['pagination'] | null
  stats: VehicleExpensesResponse['stats'] | null
  typeBreakdown: VehicleExpensesResponse['typeBreakdown'] | null
  loading: boolean
  error: string | null
  fetchExpenses: (query?: any) => Promise<void>
  refresh: () => void
  hasNext: boolean
  hasPrev: boolean
}

// Hook principal pour les dépenses
export const useVehicleExpenses = (options: UseVehicleExpensesOptions): UseVehicleExpensesReturn => {
  const { vehicleId, query, autoFetch = true } = options

  const [expenses, setExpenses] = useState<ExpenseEntry[]>([])
  const [pagination, setPagination] = useState<VehicleExpensesResponse['pagination'] | null>(null)
  const [stats, setStats] = useState<VehicleExpensesResponse['stats'] | null>(null)
  const [typeBreakdown, setTypeBreakdown] = useState<VehicleExpensesResponse['typeBreakdown'] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentQuery, setCurrentQuery] = useState<any>(query)

  // Fonction pour récupérer les dépenses
  const fetchExpenses = useCallback(async (newQuery?: any) => {
    if (!vehicleId) {
      setExpenses([])
      setPagination(null)
      setStats(null)
      setTypeBreakdown(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const queryToUse = newQuery || currentQuery
      const response = await vehiclesAPI.getVehicleExpenses(vehicleId, queryToUse)
      
      setExpenses(response.expenses)
      setPagination(response.pagination)
      setStats(response.stats)
      setTypeBreakdown(response.typeBreakdown)
      
      if (newQuery) {
        setCurrentQuery(newQuery)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des dépenses'
      setError(errorMessage)
      console.error('Erreur useVehicleExpenses:', err)
    } finally {
      setLoading(false)
    }
  }, [vehicleId, currentQuery])

  // Fonction pour rafraîchir
  const refresh = useCallback(() => {
    fetchExpenses()
  }, [fetchExpenses])

  // Effet pour le chargement automatique
  useEffect(() => {
    if (autoFetch && vehicleId) {
      fetchExpenses()
    }
  }, [autoFetch, vehicleId, fetchExpenses])

  // Effet pour mettre à jour la requête
  useEffect(() => {
    if (JSON.stringify(query) !== JSON.stringify(currentQuery)) {
      setCurrentQuery(query)
      if (autoFetch && vehicleId) {
        fetchExpenses(query)
      }
    }
  }, [query, currentQuery, autoFetch, vehicleId, fetchExpenses])

  const hasNext = pagination?.hasNext || false
  const hasPrev = pagination?.hasPrev || false

  return {
    expenses,
    pagination,
    stats,
    typeBreakdown,
    loading,
    error,
    fetchExpenses,
    refresh,
    hasNext,
    hasPrev
  }
}

// Hook pour une dépense spécifique
export const useVehicleExpense = (vehicleId: string | null, expenseId: string | null, autoFetch: boolean = true) => {
  const [expense, setExpense] = useState<ExpenseEntry | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchExpense = useCallback(async () => {
    if (!vehicleId || !expenseId) {
      setExpense(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const expenseData = await vehiclesAPI.getVehicleExpense(vehicleId, expenseId)
      setExpense(expenseData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement de la dépense'
      setError(errorMessage)
      console.error('Erreur useVehicleExpense:', err)
    } finally {
      setLoading(false)
    }
  }, [vehicleId, expenseId])

  useEffect(() => {
    if (autoFetch) {
      fetchExpense()
    }
  }, [autoFetch, fetchExpense])

  return {
    expense,
    loading,
    error,
    refresh: fetchExpense
  }
}

// Hook pour les opérations CRUD des dépenses
export const useVehicleExpenseOperations = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createExpense = useCallback(async (vehicleId: string, expenseData: CreateExpenseEntryInput) => {
    setLoading(true)
    setError(null)

    try {
      const newExpense = await vehiclesAPI.createVehicleExpense(vehicleId, expenseData)
      return newExpense
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de la dépense'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateExpense = useCallback(async (vehicleId: string, expenseId: string, updates: UpdateExpenseEntryInput) => {
    setLoading(true)
    setError(null)

    try {
      const updatedExpense = await vehiclesAPI.updateVehicleExpense(vehicleId, expenseId, updates)
      return updatedExpense
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la dépense'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteExpense = useCallback(async (vehicleId: string, expenseId: string) => {
    setLoading(true)
    setError(null)

    try {
      await vehiclesAPI.deleteVehicleExpense(vehicleId, expenseId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de la dépense'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    createExpense,
    updateExpense,
    deleteExpense
  }
}

// Hook spécialisé pour l'analyse des coûts
export const useCostAnalysis = (vehicleId: string | null, autoFetch: boolean = true) => {
  const { expenses, stats, typeBreakdown, loading, error, fetchExpenses, refresh } = 
    useVehicleExpenses({ vehicleId: vehicleId || '', autoFetch })

  // Calculer les coûts par période
  const calculateCostsByPeriod = useCallback((days: number) => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const periodExpenses = expenses.filter(expense => 
      new Date(expense.date) >= cutoffDate
    )

    return periodExpenses.reduce((total, expense) => total + expense.amount, 0)
  }, [expenses])

  // Obtenir les dépenses récentes
  const getRecentExpenses = useCallback((limit: number = 5): ExpenseEntry[] => {
    return [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit)
  }, [expenses])

  // Calculer le coût moyen par jour
  const getAverageDailyCost = useCallback((): number => {
    if (expenses.length === 0) return 0

    const dates = expenses.map(expense => new Date(expense.date))
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
    const daysDiff = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) || 1

    const totalCost = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    return totalCost / daysDiff
  }, [expenses])

  // Identifier les tendances de coûts
  const getCostTrends = useCallback(() => {
    if (expenses.length < 2) return { trend: 'stable', change: 0 }

    const sortedExpenses = [...expenses].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    const midpoint = Math.floor(sortedExpenses.length / 2)
    const firstHalf = sortedExpenses.slice(0, midpoint)
    const secondHalf = sortedExpenses.slice(midpoint)

    const firstHalfAvg = firstHalf.reduce((sum, e) => sum + e.amount, 0) / firstHalf.length
    const secondHalfAvg = secondHalf.reduce((sum, e) => sum + e.amount, 0) / secondHalf.length

    const change = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100
    const trend = change > 10 ? 'increasing' : change < -10 ? 'decreasing' : 'stable'

    return { trend, change: Math.round(change * 100) / 100 }
  }, [expenses])

  return {
    expenses,
    stats,
    typeBreakdown,
    loading,
    error,
    fetchExpenses,
    refresh,
    calculateCostsByPeriod,
    getRecentExpenses,
    getAverageDailyCost,
    getCostTrends
  }
}

export default useVehicleExpenses