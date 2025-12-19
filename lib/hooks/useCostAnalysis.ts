"use client";

import { useState, useEffect } from 'react';
import { useAuthToken, authenticatedFetch } from './useAuthToken';

export interface CostAnalysis {
  summary: {
    totalCosts: number;
    totalFuelCost: number;
    totalServiceCost: number;
    totalChargingCost: number;
    averageMPG: number;
    period: string;
    entryCount: number;
  };
  breakdown: {
    fuel: {
      total: number;
      count: number;
      percentage: number;
    };
    service: {
      total: number;
      count: number;
      percentage: number;
    };
    charging: {
      total: number;
      count: number;
      percentage: number;
    };
  };
  lastUpdated: string;
}

interface UseCostAnalysisOptions {
  period?: '7d' | '30d' | '90d' | '1y';
  autoRefresh?: boolean;
  refreshInterval?: number; // en minutes
}

export function useCostAnalysis(options: UseCostAnalysisOptions = {}) {
  const {
    period = '30d',
    autoRefresh = true,
    refreshInterval = 5
  } = options;

  const [data, setData] = useState<CostAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const { token } = useAuthToken();

  const fetchData = async (customPeriod?: string) => {
    if (!token) {
      setError('Token d\'authentification manquant');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const currentPeriod = customPeriod || period;
      const response = await authenticatedFetch(
        `/api/dashboard/costs?period=${currentPeriod}`, 
        token
      );
      
      if (response.success) {
        setData(response.data);
        setLastRefresh(new Date());
      } else {
        throw new Error(response.error || 'Erreur lors de la récupération des données de coûts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const refresh = (customPeriod?: string) => {
    fetchData(customPeriod);
  };

  const changePeriod = (newPeriod: '7d' | '30d' | '90d' | '1y') => {
    fetchData(newPeriod);
  };

  // Computed values
  const costPerVehicle = data && data.summary.totalCosts > 0 
    ? data.summary.totalCosts / Math.max(data.breakdown.fuel.count + data.breakdown.service.count + data.breakdown.charging.count, 1)
    : 0;

  const averageCostPerEntry = data && data.summary.entryCount > 0
    ? data.summary.totalCosts / data.summary.entryCount
    : 0;

  const costEfficiency = data ? {
    fuel: data.breakdown.fuel.percentage > 0 ? data.breakdown.fuel.total / data.breakdown.fuel.count : 0,
    service: data.breakdown.service.percentage > 0 ? data.breakdown.service.total / data.breakdown.service.count : 0,
    charging: data.breakdown.charging.percentage > 0 ? data.breakdown.charging.total / data.breakdown.charging.count : 0
  } : null;

  const trend = data ? {
    fuel: data.breakdown.fuel.percentage > 60 ? 'high' : data.breakdown.fuel.percentage > 40 ? 'medium' : 'low',
    service: data.breakdown.service.percentage > 30 ? 'high' : data.breakdown.service.percentage > 15 ? 'medium' : 'low',
    charging: data.breakdown.charging.percentage > 20 ? 'high' : data.breakdown.charging.percentage > 10 ? 'medium' : 'low'
  } : null;

  const alerts = data ? [
    ...(data.breakdown.fuel.percentage > 70 ? [{
      type: 'warning' as const,
      message: 'Les coûts carburant représentent plus de 70% des dépenses totales',
      action: 'Optimiser la consommation'
    }] : []),
    ...(data.breakdown.service.percentage > 40 ? [{
      type: 'warning' as const,
      message: 'Les coûts d\'entretien sont élevés',
      action: 'Vérifier la maintenance préventive'
    }] : []),
    ...(data.summary.averageMPG > 10 ? [{
      type: 'info' as const,
      message: `Consommation élevée: ${data.summary.averageMPG.toFixed(1)}L/100km`,
      action: 'Vérifier l\'efficacité des véhicules'
    }] : [])
  ] : [];

  // Auto-refresh
  useEffect(() => {
    if (!token || !autoRefresh) return;

    fetchData();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [token, autoRefresh, refreshInterval]);

  return {
    data,
    loading,
    error,
    lastRefresh,
    refresh,
    changePeriod,
    
    // Computed values
    costPerVehicle: Math.round(costPerVehicle * 100) / 100,
    averageCostPerEntry: Math.round(averageCostPerEntry * 100) / 100,
    costEfficiency,
    trend,
    alerts,
    
    // State helpers
    isLoading: loading,
    hasData: !!data,
    isStale: (Date.now() - lastRefresh.getTime()) > refreshInterval * 60 * 1000,
    needsAttention: alerts.length > 0
  };
}