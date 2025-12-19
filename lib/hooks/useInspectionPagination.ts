"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';

interface PaginationOptions {
  pageSize?: number;
  maxPages?: number;
  enableInfiniteScroll?: boolean;
  enableVirtualScrolling?: boolean;
  debounceMs?: number;
}

interface PaginationResult<T> {
  // Données paginées
  paginatedData: T[];
  
  // État de pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  
  // Navigation
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  
  // Filtres et recherche
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: Record<string, any>;
  setFilters: (filters: Record<string, any>) => void;
  clearFilters: () => void;
  
  // Performance
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  
  // Actions
  refresh: () => void;
  loadMore: () => void;
  resetPagination: () => void;
  
  // Métadonnées
  metadata: {
    searchTime?: number;
    loadTime?: number;
    cacheHit?: boolean;
  };
}

interface UseInspectionPaginationProps<T> {
  // Données sources
  data: T[];
  // Fonction de chargement
  fetchData: (params: {
    page: number;
    pageSize: number;
    search?: string;
    filters?: Record<string, any>;
  }) => Promise<{
    data: T[];
    total: number;
    metadata?: any;
  }>;
  // Options de configuration
  options?: PaginationOptions;
  // Dépendances pour rechargement automatique
  dependencies?: any[];
}

export function useInspectionPagination<T>({
  data: initialData,
  fetchData,
  options = {},
  dependencies = []
}: UseInspectionPaginationProps<T>): PaginationResult<T> & {
  // Données non filtrées
  allData: T[];
  // Données filtrées
  filteredData: T[];
  // Statistiques
  stats: {
    total: number;
    filtered: number;
    pages: number;
  };
} {
  const {
    pageSize = 20,
    maxPages = 100,
    enableInfiniteScroll = false,
    enableVirtualScrolling = false,
    debounceMs = 300
  } = options;

  // État principal
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQueryState] = useState('');
  const [filters, setFiltersState] = useState<Record<string, any>>({});
  const [allData, setAllData] = useState<T[]>(initialData || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any>({});
  const [totalItems, setTotalItems] = useState(initialData?.length || 0);

  // Fonction de chargement des données
  const loadData = useCallback(async (
    page: number, 
    search?: string, 
    currentFilters?: Record<string, any>,
    append: boolean = false
  ) => {
    try {
      if (page === 1 && !append) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      setError(null);
      
      const loadStartTime = Date.now();
      const result = await fetchData({
        page,
        pageSize,
        search,
        filters: currentFilters
      });
      
      const loadTime = Date.now() - loadStartTime;
      
      setMetadata(prev => ({
        ...prev,
        loadTime,
        searchTime: search ? Date.now() : undefined,
        cacheHit: false // À implémenter avec un système de cache
      }));
      
      if (append) {
        setAllData(prev => [...prev, ...result.data]);
      } else {
        setAllData(result.data);
      }
      
      setTotalItems(result.total);
      
      // Mettre à jour la page actuelle si nécessaire
      if (page !== currentPage) {
        setCurrentPage(page);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [fetchData, pageSize, currentPage]);

  // Charger les données au changement des dépendances
  useEffect(() => {
    loadData(currentPage, searchQuery, filters);
  }, dependencies);

  // Calculer les données filtrées d'abord
  const filteredData = useMemo(() => {
    if (!searchQuery && Object.keys(filters).length === 0) {
      return allData;
    }

    return allData.filter((item: any) => {
      // Recherche textuelle
      if (searchQuery) {
        const searchableFields = ['title', 'vehicleName', 'inspectorName', 'location'];
        const matchesSearch = searchableFields.some(field => 
          item[field]?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (!matchesSearch) return false;
      }

      // Filtres
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return item[key] === value;
      });
    });
  }, [allData, searchQuery, filters]);

  // Calculer les métadonnées de pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // Charger plus de données (infinite scroll)
  const loadMore = useCallback(() => {
    if (!enableInfiniteScroll || isLoadingMore) return;
    
    const nextPage = currentPage + 1;
    if (nextPage <= totalPages) {
      loadData(nextPage, searchQuery, filters, true);
    }
  }, [currentPage, totalPages, enableInfiniteScroll, isLoadingMore, searchQuery, filters, loadData]);

  // Observer pour infinite scroll
  useEffect(() => {
    if (!enableInfiniteScroll) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = document.getElementById('infinite-scroll-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => observer.disconnect();
  }, [enableInfiniteScroll, hasNextPage, isLoadingMore, loadMore]);

  // Calculer les données paginées
  const paginatedData = useMemo(() => {
    if (enableVirtualScrolling) {
      // Pour la virtualisation, on retourne toutes les données filtrées
      return filteredData;
    }

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize, enableVirtualScrolling]);

  // Actions de navigation
  const goToPage = useCallback((page: number) => {
    const clampedPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(clampedPage);
    loadData(clampedPage, searchQuery, filters);
  }, [totalPages, searchQuery, filters, loadData]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      goToPage(currentPage + 1);
    }
  }, [hasNextPage, currentPage, goToPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      goToPage(currentPage - 1);
    }
  }, [hasPreviousPage, currentPage, goToPage]);

  const goToFirstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const goToLastPage = useCallback(() => {
    goToPage(totalPages);
  }, [totalPages, goToPage]);

  // Gestion de la recherche (avec debounce simple)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
    
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadData(1, query, filters);
    }, debounceMs);
    
    setDebounceTimer(timer);
  }, [debounceMs, filters, loadData]);

  // Gestion des filtres
  const setFilters = useCallback((newFilters: Record<string, any>) => {
    setFiltersState(newFilters);
    setCurrentPage(1);
    loadData(1, searchQuery, newFilters);
  }, [searchQuery, loadData]);

  const clearFilters = useCallback(() => {
    setFiltersState({});
    setSearchQueryState('');
    setCurrentPage(1);
    loadData(1, '', {});
  }, [loadData]);

  // Rechargement
  const refresh = useCallback(() => {
    loadData(currentPage, searchQuery, filters);
  }, [currentPage, searchQuery, filters, loadData]);

  // Reset
  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setSearchQueryState('');
    setFiltersState({});
    setAllData(initialData || []);
    setTotalItems(initialData?.length || 0);
    setError(null);
    setMetadata({});
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
  }, [initialData, debounceTimer]);

  // Statistiques
  const stats = {
    total: allData.length,
    filtered: filteredData.length,
    pages: totalPages
  };

  return {
    // Données paginées
    paginatedData,
    allData,
    filteredData,
    
    // État de pagination
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    hasNextPage,
    hasPreviousPage,
    
    // Navigation
    goToPage,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,
    
    // Filtres et recherche
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    clearFilters,
    
    // Performance
    isLoading,
    isLoadingMore,
    error,
    metadata,
    
    // Actions
    refresh,
    loadMore,
    resetPagination,
    
    // Statistiques
    stats
  };
}

// Hook spécialisé pour les inspections
export function useInspectionPaginationSimple(
  fetchData: UseInspectionPaginationProps<any>['fetchData'],
  options?: PaginationOptions
) {
  return useInspectionPagination({
    data: [],
    fetchData,
    options,
    dependencies: []
  });
}