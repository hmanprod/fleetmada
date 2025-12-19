// Hooks React pour la gestion des vendors
'use client';

import { useState, useEffect } from 'react';
import { vendorsAPI, type Vendor, type VendorFilters, type CreateVendorRequest, type UpdateVendorRequest } from '@/lib/services/vendors-api';

export interface UseVendorsReturn {
  vendors: Vendor[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  fetchVendors: (filters?: VendorFilters) => Promise<void>;
  refetch: () => Promise<void>;
}

// Hook pour récupérer la liste des vendors avec filtres et pagination
export function useVendors(initialFilters: VendorFilters = {}) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseVendorsReturn['pagination']>(null);
  const [currentFilters, setCurrentFilters] = useState<VendorFilters>(initialFilters);

  const fetchVendors = async (filters: VendorFilters = currentFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await vendorsAPI.getVendors(filters);
      
      setVendors(response.data.vendors);
      setPagination(response.data.pagination);
      setCurrentFilters(filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des vendors');
      console.error('Error fetching vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchVendors();
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  return {
    vendors,
    loading,
    error,
    pagination,
    fetchVendors,
    refetch,
  };
}

// Hook pour récupérer un vendor spécifique
export function useVendor(vendorId: string) {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVendor = async () => {
    if (!vendorId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await vendorsAPI.getVendor(vendorId);
      setVendor(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du vendor');
      console.error('Error fetching vendor:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendor();
  }, [vendorId]);

  return { vendor, loading, error, refetch: fetchVendor };
}

// Hook pour créer un vendor
export function useCreateVendor() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createVendor = async (data: CreateVendorRequest): Promise<Vendor | null> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const response = await vendorsAPI.createVendor(data);
      setSuccess(true);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du vendor';
      setError(errorMessage);
      console.error('Error creating vendor:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
  };

  return { createVendor, loading, error, success, reset };
}

// Hook pour mettre à jour un vendor
export function useUpdateVendor(vendorId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateVendor = async (data: UpdateVendorRequest): Promise<Vendor | null> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const response = await vendorsAPI.updateVendor(vendorId, data);
      setSuccess(true);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du vendor';
      setError(errorMessage);
      console.error('Error updating vendor:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
  };

  return { updateVendor, loading, error, success, reset };
}

// Hook pour supprimer un vendor
export function useDeleteVendor() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const deleteVendor = async (vendorId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      await vendorsAPI.deleteVendor(vendorId);
      setSuccess(true);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du vendor';
      setError(errorMessage);
      console.error('Error deleting vendor:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
  };

  return { deleteVendor, loading, error, success, reset };
}

// Hook pour la recherche de vendors
export function useVendorSearch() {
  const [results, setResults] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchVendors = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await vendorsAPI.searchVendors(query);
      setResults(response.data.vendors);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la recherche';
      setError(errorMessage);
      console.error('Error searching vendors:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return { results, loading, error, searchVendors, clearResults };
}

// Hook pour les transactions d'un vendor
export function useVendorTransactions(vendorId: string) {
  const [transactions, setTransactions] = useState<{
    serviceEntries: any[];
    fuelEntries: any[];
    expenseEntries: any[];
    totalCosts: {
      services: number;
      fuel: number;
      expenses: number;
      total: number;
    };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!vendorId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await vendorsAPI.getVendorTransactions(vendorId);
      setTransactions(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des transactions');
      console.error('Error fetching vendor transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [vendorId]);

  return { transactions, loading, error, refetch: fetchTransactions };
}

// Hook pour les statistiques des vendors
export function useVendorStats() {
  const [stats, setStats] = useState<{
    totalVendors: number;
    vendorsByClassification: Record<string, number>;
    topVendorsByCost: Array<{
      vendorId: string;
      vendorName: string;
      totalCost: number;
      transactionCount: number;
    }>;
    recentActivity: Array<{
      vendorId: string;
      vendorName: string;
      lastTransaction: string;
      amount: number;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await vendorsAPI.getVendorStats();
      setStats(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
      console.error('Error fetching vendor stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
}