"use client";

import { useState, useEffect } from 'react';
import { useAuthToken, authenticatedFetch } from './useAuthToken';

export interface FleetOverview {
  totalVehicles: number;
  statusBreakdown: {
    active: number;
    inactive: number;
    maintenance: number;
    disposed: number;
  };
  issues: {
    total: number;
    open: number;
    closed: number;
  };
  maintenance: {
    totalServiceEntries: number;
    upcomingReminders: number;
    overdueReminders: number;
  };
  utilizationRate: number;
  lastUpdated: string;
}

export function useFleetOverview() {
  const [data, setData] = useState<FleetOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const { token } = useAuthToken();

  const fetchData = async () => {
    if (!token) {
      setError('Token d\'authentification manquant');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await authenticatedFetch('/api/dashboard/overview', token);
      
      if (response.success) {
        setData(response.data);
        setLastRefresh(new Date());
      } else {
        throw new Error(response.error || 'Erreur lors de la récupération des données');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    fetchData();
  };

  // Computed values
  const healthScore = data ? Math.round(
    ((data.statusBreakdown.active / Math.max(data.totalVehicles, 1)) * 100) - 
    (data.issues.open * 5) - 
    (data.maintenance.overdueReminders * 10)
  ) : 0;

  const criticalIssues = data ? data.issues.open + data.maintenance.overdueReminders : 0;

  // Auto-refresh toutes les 5 minutes
  useEffect(() => {
    if (!token) return;

    fetchData();

    const interval = setInterval(fetchData, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [token]);

  return {
    data,
    loading,
    error,
    lastRefresh,
    refresh,
    
    // Computed values
    healthScore: Math.max(0, Math.min(100, healthScore)),
    criticalIssues,
    isHealthy: criticalIssues === 0,
    hasIssues: criticalIssues > 0,
    isStale: (Date.now() - lastRefresh.getTime()) > 5 * 60 * 1000,
  };
}