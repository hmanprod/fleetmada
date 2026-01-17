"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import issuesAPI, { Issue, IssueFilters, IssuesResponse } from '@/lib/services/issues-api'

interface UseIssuesReturn {
  issues: Issue[]
  loading: boolean
  error: string | null
  pagination: IssuesResponse['pagination'] | null
  filters: IssueFilters
  setFilters: (filters: IssueFilters) => void
  fetchIssues: (filters?: IssueFilters) => Promise<void>
  createIssue: (data: any) => Promise<Issue>
  updateIssue: (id: string, data: any) => Promise<Issue>
  deleteIssue: (id: string) => Promise<void>
  updateIssueStatus: (id: string, status: any) => Promise<Issue>
  assignIssue: (id: string, assignedTo: string[]) => Promise<Issue>
  clearError: () => void
  refetch: () => Promise<void>
}

export function useIssues(initialFilters: IssueFilters = {}): UseIssuesReturn {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<IssuesResponse['pagination'] | null>(null)
  const [filters, setFilters] = useState<IssueFilters>({
    page: 1,
    limit: 20,
    ...initialFilters
  })
  const lastFiltersRef = useRef<IssueFilters>(filters)

  const fetchIssues = useCallback(async (newFilters: IssueFilters = {}) => {
    try {
      setLoading(true)
      setError(null)

      const updatedFilters = { ...lastFiltersRef.current, ...newFilters }

      // Only update state if filters actually changed to avoid unnecessary re-renders
      if (JSON.stringify(updatedFilters) !== JSON.stringify(lastFiltersRef.current)) {
        setFilters(updatedFilters)
        lastFiltersRef.current = updatedFilters
      }

      const response = await issuesAPI.getIssues(updatedFilters)
      setIssues(response.issues)
      setPagination(response.pagination)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des problèmes'
      setError(errorMessage)
      console.error('Erreur useIssues:', err)
    } finally {
      setLoading(false)
    }
  }, []) // Stable fetchIssues

  const createIssue = useCallback(async (data: any): Promise<Issue> => {
    try {
      setError(null)
      const newIssue = await issuesAPI.createIssue(data)

      // Rafraîchir la liste après création
      await fetchIssues()

      return newIssue
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du problème'
      setError(errorMessage)
      throw err
    }
  }, [fetchIssues])

  const updateIssue = useCallback(async (id: string, data: any): Promise<Issue> => {
    try {
      setError(null)
      const updatedIssue = await issuesAPI.updateIssue(id, data)

      // Mettre à jour l'issue dans la liste locale
      setIssues(prev => prev.map(issue =>
        issue.id === id ? { ...issue, ...updatedIssue } : issue
      ))

      return updatedIssue
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la modification du problème'
      setError(errorMessage)
      throw err
    }
  }, [])

  const deleteIssue = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null)
      await issuesAPI.deleteIssue(id)

      // Supprimer l'issue de la liste locale
      setIssues(prev => prev.filter(issue => issue.id !== id))

      // Mettre à jour la pagination
      if (pagination) {
        setPagination(prev => prev ? {
          ...prev,
          totalCount: prev.totalCount - 1
        } : null)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du problème'
      setError(errorMessage)
      throw err
    }
  }, [pagination])

  const updateIssueStatus = useCallback(async (id: string, status: any): Promise<Issue> => {
    try {
      setError(null)
      const updatedIssue = await issuesAPI.updateIssueStatus(id, { status })

      // Mettre à jour l'issue dans la liste locale
      setIssues(prev => prev.map(issue =>
        issue.id === id ? { ...issue, ...updatedIssue } : issue
      ))

      return updatedIssue
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la modification du statut'
      setError(errorMessage)
      throw err
    }
  }, [])

  const assignIssue = useCallback(async (id: string, assignedTo: string[]): Promise<Issue> => {
    try {
      setError(null)
      const updatedIssue = await issuesAPI.assignIssue(id, { assignedTo })

      // Mettre à jour l'issue dans la liste locale
      setIssues(prev => prev.map(issue =>
        issue.id === id ? { ...issue, ...updatedIssue } : issue
      ))

      return updatedIssue
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'assignation du problème'
      setError(errorMessage)
      throw err
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const refetch = useCallback(async () => {
    await fetchIssues()
  }, [fetchIssues])

  // Charger les données initiales
  useEffect(() => {
    fetchIssues()
  }, []) // Seulemente au montage

  // Sync internal filters with initialFilters prop if changed externally
  useEffect(() => {
    setFilters(prev => ({ ...prev, ...initialFilters }));
  }, [initialFilters.status, initialFilters.assignedTo, initialFilters.vehicleId, initialFilters.priority, initialFilters.groupId, initialFilters.labels]);

  // Fetch whenever filters change
  useEffect(() => {
    fetchIssues();
  }, [filters, fetchIssues]);

  return {
    issues,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    fetchIssues,
    createIssue,
    updateIssue,
    deleteIssue,
    updateIssueStatus,
    assignIssue,
    clearError,
    refetch
  }
}

export default useIssues