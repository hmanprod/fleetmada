'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { vendorsAPI, type Vendor, type VendorListResponse, type VendorFilters } from '@/lib/services/vendors-api'

interface UseVendorsOptions {
  filters?: VendorFilters
  autoFetch?: boolean
}

interface UseVendorsReturn {
  vendors: Vendor[]
  pagination: VendorListResponse['data']['pagination'] | null
  loading: boolean
  error: string | null
  fetchVendors: (newFilters?: VendorFilters) => Promise<void>
  refresh: () => void
  hasNext: boolean
  hasPrev: boolean
}

export const useVendors = (options: UseVendorsOptions = {}): UseVendorsReturn => {
  const { filters, autoFetch = true } = options

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [pagination, setPagination] = useState<VendorListResponse['data']['pagination'] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use ref to store current filters to avoid re-creating fetchVendors when filters change
  const currentFiltersRef = useRef<VendorFilters | undefined>(filters)

  // Update ref when props change, but don't trigger fetch automatically here if we want to control it
  useEffect(() => {
    if (filters) {
      currentFiltersRef.current = filters
    }
  }, [filters])

  const fetchVendors = useCallback(async (newFilters?: VendorFilters) => {
    setLoading(true)
    setError(null)

    try {
      // If new filters are provided, update the ref and use them
      // Otherwise use the current ref value
      if (newFilters) {
        currentFiltersRef.current = { ...currentFiltersRef.current, ...newFilters }
      }

      const filtersToUse = currentFiltersRef.current
      const response = await vendorsAPI.getVendors(filtersToUse)

      setVendors(response.data.vendors)
      setPagination(response.data.pagination)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des vendeurs'
      setError(errorMessage)
      console.error('Erreur useVendors:', err)
    } finally {
      setLoading(false)
    }
  }, []) // Empty dependency array = stable function

  const refresh = useCallback(() => {
    fetchVendors()
  }, [fetchVendors])

  useEffect(() => {
    if (autoFetch) {
      fetchVendors()
    }
    // We only want to run this once on mount if autoFetch is true, 
    // or if fetchVendors changes (which it won't anymore).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch])

  const hasNext = pagination?.hasNext || false
  const hasPrev = pagination?.hasPrev || false

  return {
    vendors,
    pagination,
    loading,
    error,
    fetchVendors,
    refresh,
    hasNext,
    hasPrev
  }
}

export const useVendorSearch = () => {
  const [results, setResults] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchVendors = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await vendorsAPI.searchVendors(query)
      setResults(response.data.vendors)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la recherche'
      setError(errorMessage)
      console.error('Erreur useVendorSearch :', err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  return { results, searchVendors, loading, error }
}

export default useVendors