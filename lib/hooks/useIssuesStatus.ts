"use client"

import { useState, useEffect, useCallback } from 'react'

interface IssuesSummary {
  totalIssues: number;
  openIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  closedIssues: number;
  criticalIssues: number;
  averageResolutionTime: number; // en heures
  issuesThisMonth: number;
  complianceRate: number; // % d'issues résolues dans les temps
}

interface Issue {
  id: string;
  summary: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  vehicle?: {
    name: string;
    make: string;
    model: string;
  };
  assignedTo?: {
    name: string;
  };
  reportedDate: string;
  updatedAt: string;
}

interface IssuesStatusData {
  summary: IssuesSummary;
  recentIssues: Issue[];
  criticalIssues: Issue[];
  status: {
    healthy: boolean;
    warning: boolean;
    critical: boolean;
  };
}

interface UseIssuesStatusReturn {
  data: IssuesStatusData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useIssuesStatus(): UseIssuesStatusReturn {
  const [data, setData] = useState<IssuesStatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchIssuesStatus = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('authToken') || 
                   document.cookie.match(/authToken=([^;]*)/)?.[1] || null

      if (!token) {
        throw new Error('Token d\'authentification manquant')
      }

      const response = await fetch('/api/dashboard/issues', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Erreur lors de la récupération des métriques des problèmes')
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la récupération des métriques des problèmes')
      }

      setData(result.data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des métriques des problèmes'
      setError(errorMessage)
      console.error('Erreur useIssuesStatus:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    await fetchIssuesStatus()
  }, [fetchIssuesStatus])

  // Charger les données au montage
  useEffect(() => {
    fetchIssuesStatus()
  }, [fetchIssuesStatus])

  return {
    data,
    loading,
    error,
    refresh
  }
}

export default useIssuesStatus