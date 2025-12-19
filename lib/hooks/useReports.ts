import { useState, useEffect } from 'react'
import { useAuthToken } from './useAuthToken'
import { 
  Report, 
  ReportsListResponse, 
  ReportResponse, 
  GenerateReportResponse,
  ReportConfig 
} from '@/types/reports'

interface UseReportsOptions {
  page?: number
  limit?: number
  category?: string
  favorites?: boolean
  saved?: boolean
  shared?: boolean
  search?: string
}

interface UseReportsReturn {
  reports: Report[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
    totalPages: number
  } | null
  refetch: () => void
}

interface UseGenerateReportReturn {
  generateReport: (template: string, config: ReportConfig, save?: boolean, title?: string, description?: string) => Promise<GenerateReportResponse | null>
  loading: boolean
  error: string | null
}

interface UseFavoriteReportReturn {
  toggleFavorite: (reportId: string) => Promise<boolean>
  loading: boolean
  error: string | null
}

interface UseShareReportReturn {
  shareReport: (reportId: string, sharedWith: string, permission: 'view' | 'edit') => Promise<boolean>
  loading: boolean
  error: string | null
}

interface UseExportReportReturn {
  exportReport: (reportId: string, format: 'pdf' | 'excel' | 'csv') => Promise<Blob | null>
  loading: boolean
  error: string | null
}

// Hook pour récupérer la liste des rapports
export function useReports(options: UseReportsOptions = {}): UseReportsReturn {
  const { token } = useAuthToken()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<UseReportsReturn['pagination']>(null)

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!token) {
        throw new Error('Token d\'authentification manquant')
      }

      const params = new URLSearchParams()
      if (options.page) params.append('page', options.page.toString())
      if (options.limit) params.append('limit', options.limit.toString())
      if (options.category) params.append('category', options.category)
      if (options.favorites) params.append('favorites', 'true')
      if (options.saved) params.append('saved', 'true')
      if (options.shared) params.append('shared', 'true')
      if (options.search) params.append('search', options.search)

      const response = await fetch(`/api/reports?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la récupération des rapports')
      }

      const data: ReportsListResponse = await response.json()
      
      if (data.success) {
        setReports(data.data.reports)
        setPagination(data.data.pagination)
      } else {
        throw new Error('Réponse API invalide')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchReports()
    }
  }, [token, options.page, options.limit, options.category, options.favorites, options.saved, options.shared, options.search])

  return {
    reports,
    loading,
    error,
    pagination,
    refetch: fetchReports
  }
}

// Hook pour générer un rapport
export function useGenerateReport(): UseGenerateReportReturn {
  const { token } = useAuthToken()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateReport = async (
    template: string, 
    config: ReportConfig, 
    save = false, 
    title?: string, 
    description?: string
  ): Promise<GenerateReportResponse | null> => {
    try {
      setLoading(true)
      setError(null)

      if (!token) {
        throw new Error('Token d\'authentification manquant')
      }

      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          template,
          config,
          save,
          title,
          description
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la génération du rapport')
      }

      const data: GenerateReportResponse = await response.json()
      return data.success ? data : null

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    generateReport,
    loading,
    error
  }
}

// Hook pour gérer les favoris
export function useFavoriteReport(): UseFavoriteReportReturn {
  const { token } = useAuthToken()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleFavorite = async (reportId: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      if (!token) {
        throw new Error('Token d\'authentification manquant')
      }

      const response = await fetch(`/api/reports/${reportId}/favorite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la gestion des favoris')
      }

      const data = await response.json()
      return data.success

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    toggleFavorite,
    loading,
    error
  }
}

// Hook pour partager un rapport
export function useShareReport(): UseShareReportReturn {
  const { token } = useAuthToken()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const shareReport = async (
    reportId: string, 
    sharedWith: string, 
    permission: 'view' | 'edit'
  ): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      if (!token) {
        throw new Error('Token d\'authentification manquant')
      }

      const response = await fetch(`/api/reports/${reportId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sharedWith,
          permission
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors du partage du rapport')
      }

      const data = await response.json()
      return data.success

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    shareReport,
    loading,
    error
  }
}

// Hook pour exporter un rapport
export function useExportReport(): UseExportReportReturn {
  const { token } = useAuthToken()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exportReport = async (reportId: string, format: 'pdf' | 'excel' | 'csv'): Promise<Blob | null> => {
    try {
      setLoading(true)
      setError(null)

      if (!token) {
        throw new Error('Token d\'authentification manquant')
      }

      const response = await fetch(`/api/reports/${reportId}/export/${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de l\'export du rapport')
      }

      return await response.blob()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    exportReport,
    loading,
    error
  }
}

// Hook pour récupérer un rapport spécifique
export function useReport(reportId: string): UseReportsReturn & { report: Report | null } {
  const { token } = useAuthToken()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<UseReportsReturn['pagination']>(null)

  const fetchReport = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!token) {
        throw new Error('Token d\'authentification manquant')
      }

      const response = await fetch(`/api/reports/${reportId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la récupération du rapport')
      }

      const data: ReportResponse = await response.json()
      
      if (data.success) {
        setReport(data.data)
      } else {
        throw new Error('Réponse API invalide')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (reportId && token) {
      fetchReport()
    }
  }, [reportId, token])

  return {
    reports: report ? [report] : [],
    loading,
    error,
    pagination,
    report,
    refetch: fetchReport
  }
}

// Hook pour récupérer les templates disponibles
export function useReportTemplates() {
  const { token } = useAuthToken()
  const [templates, setTemplates] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!token) {
        throw new Error('Token d\'authentification manquant')
      }

      const response = await fetch('/api/reports/generate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la récupération des templates')
      }

      const data = await response.json()
      
      if (data.success) {
        setTemplates(data.data.templates)
      } else {
        throw new Error('Réponse API invalide')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchTemplates()
    }
  }, [token])

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates
  }
}