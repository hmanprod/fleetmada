'use client'

import { useState, useEffect, useCallback } from 'react'
import { vehiclesAPI, type VehicleAssignment, type VehicleAssignmentsResponse } from '@/lib/services/vehicles-api'
import type { CreateVehicleAssignmentInput, UpdateVehicleAssignmentInput } from '@/lib/validations/vehicle-validations'

interface UseVehicleAssignmentsOptions {
  vehicleId: string
  autoFetch?: boolean
}

interface UseVehicleAssignmentsReturn {
  assignments: VehicleAssignment[]
  stats: VehicleAssignmentsResponse['stats'] | null
  recentActivity: VehicleAssignmentsResponse['recentActivity'] | null
  loading: boolean
  error: string | null
  fetchAssignments: () => Promise<void>
  refresh: () => void
  currentOperator: string | null
  activeAssignment: VehicleAssignment | null
}

// Hook principal pour les assignations
export const useVehicleAssignments = (options: UseVehicleAssignmentsOptions): UseVehicleAssignmentsReturn => {
  const { vehicleId, autoFetch = true } = options

  const [assignments, setAssignments] = useState<VehicleAssignment[]>([])
  const [stats, setStats] = useState<VehicleAssignmentsResponse['stats'] | null>(null)
  const [recentActivity, setRecentActivity] = useState<VehicleAssignmentsResponse['recentActivity'] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fonction pour récupérer les assignations
  const fetchAssignments = useCallback(async () => {
    if (!vehicleId) {
      setAssignments([])
      setStats(null)
      setRecentActivity(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await vehiclesAPI.getVehicleAssignments(vehicleId)
      
      setAssignments(response.assignments)
      setStats(response.stats)
      setRecentActivity(response.recentActivity)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des assignations'
      setError(errorMessage)
      console.error('Erreur useVehicleAssignments:', err)
    } finally {
      setLoading(false)
    }
  }, [vehicleId])

  // Fonction pour rafraîchir
  const refresh = useCallback(() => {
    fetchAssignments()
  }, [fetchAssignments])

  // Effet pour le chargement automatique
  useEffect(() => {
    if (autoFetch && vehicleId) {
      fetchAssignments()
    }
  }, [autoFetch, vehicleId, fetchAssignments])

  // Assigner et assignation active
  const currentOperator = stats?.currentOperator || null
  const activeAssignment = assignments.find(assignment => assignment.isActive) || null

  return {
    assignments,
    stats,
    recentActivity,
    loading,
    error,
    fetchAssignments,
    refresh,
    currentOperator,
    activeAssignment
  }
}

// Hook pour les opérations CRUD des assignations
export const useVehicleAssignmentOperations = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createAssignment = useCallback(async (vehicleId: string, assignmentData: CreateVehicleAssignmentInput) => {
    setLoading(true)
    setError(null)

    try {
      const newAssignment = await vehiclesAPI.createVehicleAssignment(vehicleId, assignmentData)
      return newAssignment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de l\'assignation'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Terminer une assignation (marquer comme inactive)
  const endAssignment = useCallback(async (vehicleId: string, assignmentId: string) => {
    setLoading(true)
    setError(null)

    try {
      // TODO: Implémenter l'API de mise à jour des assignations
      throw new Error('API de mise à jour des assignations non implémentée')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la fin de l\'assignation'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    createAssignment,
    endAssignment
  }
}

// Hook spécialisé pour la gestion des assignations actives
export const useActiveAssignment = (vehicleId: string | null) => {
  const { assignments, stats, loading, error, refresh, currentOperator, activeAssignment } = 
    useVehicleAssignments({ vehicleId: vehicleId || '', autoFetch: !!vehicleId })

  // Vérifier si un opérateur est disponible pour une nouvelle assignation
  const isOperatorAvailable = useCallback((operator: string): boolean => {
    return !assignments.some(assignment => 
      assignment.operator === operator && assignment.isActive
    )
  }, [assignments])

  // Vérifier les chevauchements de dates
  const checkDateOverlap = useCallback((startDate: string, endDate?: string): boolean => {
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : new Date('2099-12-31') // Date très lointaine si pas de fin

    return assignments.some(assignment => {
      if (!assignment.isActive) return false

      const assignmentStart = new Date(assignment.startDate)
      const assignmentEnd = assignment.endDate ? new Date(assignment.endDate) : new Date('2099-12-31')

      // Vérifier le chevauchement
      return (start < assignmentEnd) && (end > assignmentStart)
    })
  }, [assignments])

  // Obtenir les opérateurs fréquemment assignés
  const getFrequentOperators = useCallback((limit: number = 5): string[] => {
    const operatorCounts = assignments.reduce((acc, assignment) => {
      acc[assignment.operator] = (acc[assignment.operator] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(operatorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([operator]) => operator)
  }, [assignments])

  return {
    assignments,
    stats,
    loading,
    error,
    refresh,
    currentOperator,
    activeAssignment,
    isOperatorAvailable,
    checkDateOverlap,
    getFrequentOperators
  }
}

export default useVehicleAssignments