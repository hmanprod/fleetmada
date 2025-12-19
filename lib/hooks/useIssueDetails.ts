"use client"

import { useState, useEffect, useCallback } from 'react'
import issuesAPI, { Issue, IssueUpdateData, IssueStatusUpdateData, IssueAssignData } from '@/lib/services/issues-api'

interface UseIssueDetailsReturn {
  issue: Issue | null
  loading: boolean
  error: string | null
  fetchIssue: (id: string) => Promise<void>
  updateIssue: (id: string, data: IssueUpdateData) => Promise<Issue>
  deleteIssue: (id: string) => Promise<void>
  updateIssueStatus: (id: string, status: IssueStatusUpdateData['status']) => Promise<Issue>
  assignIssue: (id: string, assignedTo: string) => Promise<Issue>
  clearError: () => void
  refetch: () => Promise<void>
}

export function useIssueDetails(issueId: string | null): UseIssueDetailsReturn {
  const [issue, setIssue] = useState<Issue | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchIssue = useCallback(async (id: string) => {
    if (!id) {
      setIssue(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const issueData = await issuesAPI.getIssue(id)
      setIssue(issueData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération du problème'
      setError(errorMessage)
      setIssue(null)
      console.error('Erreur useIssueDetails:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateIssue = useCallback(async (id: string, data: IssueUpdateData): Promise<Issue> => {
    try {
      setError(null)
      const updatedIssue = await issuesAPI.updateIssue(id, data)
      setIssue(updatedIssue)
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
      setIssue(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du problème'
      setError(errorMessage)
      throw err
    }
  }, [])

  const updateIssueStatus = useCallback(async (id: string, status: IssueStatusUpdateData['status']): Promise<Issue> => {
    try {
      setError(null)
      const updatedIssue = await issuesAPI.updateIssueStatus(id, { status })
      setIssue(updatedIssue)
      return updatedIssue
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la modification du statut'
      setError(errorMessage)
      throw err
    }
  }, [])

  const assignIssue = useCallback(async (id: string, assignedTo: string): Promise<Issue> => {
    try {
      setError(null)
      const updatedIssue = await issuesAPI.assignIssue(id, { assignedTo })
      setIssue(updatedIssue)
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
    if (issueId) {
      await fetchIssue(issueId)
    }
  }, [issueId, fetchIssue])

  // Charger les données quand issueId change
  useEffect(() => {
    if (issueId) {
      fetchIssue(issueId)
    } else {
      setIssue(null)
      setError(null)
    }
  }, [issueId, fetchIssue])

  return {
    issue,
    loading,
    error,
    fetchIssue,
    updateIssue,
    deleteIssue,
    updateIssueStatus,
    assignIssue,
    clearError,
    refetch
  }
}

export default useIssueDetails