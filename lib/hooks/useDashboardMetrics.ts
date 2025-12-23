"use client";

import { useState, useEffect } from 'react';
import { useAuthToken, authenticatedFetch } from './useAuthToken';

// Types pour les données dashboard
export interface DashboardOverview {
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

export interface DashboardCosts {
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

export interface DashboardMaintenance {
  summary: {
    totalReminders: number;
    upcomingReminders: number;
    overdueReminders: number;
    completedReminders: number;
    recentServices: number;
    complianceRate: number;
  };
  upcomingReminders: Array<{
    id: string;
    task: string;
    vehicleName: string;
    vehicleMake: string;
    vehicleModel: string;
    nextDue: string;
    daysUntilDue: number;
    compliance: number;
  }>;
  overdueReminders: Array<{
    id: string;
    task: string;
    vehicleName: string;
    vehicleMake: string;
    vehicleModel: string;
    nextDue: string;
    daysOverdue: number;
    compliance: number;
  }>;
  status: {
    healthy: boolean;
    warning: boolean;
    critical: boolean;
  };
  lastUpdated: string;
}

export interface DashboardFuel {
  summary: {
    fuel: {
      totalVolume: number;
      totalCost: number;
      totalUsage: number;
      averageMPG: number;
      averageCost: number;
      entriesCount: number;
    };
    charging: {
      totalEnergyKwh: number;
      totalCost: number;
      totalDuration: number;
      averageCost: number;
      averageEnergyPerSession: number;
      sessionsCount: number;
    };
    period: string;
  };
  lastUpdated: string;
}

export interface DashboardVehicles {
  summary: {
    totalVehicles: number;
    statusBreakdown: {
      active: number;
      inactive: number;
      maintenance: number;
      disposed: number;
    };
    typeBreakdown: Array<{
      type: string;
      count: number;
    }>;
    utilizationRate: number;
    maintenanceRate: number;
  };
  vehiclesWithMetrics: Array<{
    id: string;
    name: string;
    make: string;
    model: string;
    year: number;
    type: string;
    status: string;
    meterReading?: number;
    lastMeterReading?: number;
    lastMeterDate?: string;
    metrics: {
      fuelEntries: number;
      serviceEntries: number;
      issues: number;
      chargingEntries: number;
      reminders: number;
    };
    recentCosts: number;
    lastUpdated: string;
  }>;
  lastUpdated: string;
}

// Hook principal pour toutes les métriques dashboard
export function useDashboardMetrics() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [costs, setCosts] = useState<DashboardCosts | null>(null);
  const [maintenance, setMaintenance] = useState<DashboardMaintenance | null>(null);
  const [fuel, setFuel] = useState<DashboardFuel | null>(null);
  const [vehicles, setVehicles] = useState<DashboardVehicles | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const { token } = useAuthToken();

  const fetchOverview = async () => {
    if (!token) return;

    try {
      const response = await authenticatedFetch('/api/dashboard/overview', token);
      if (response.success) {
        setOverview(response.data);
      } else {
        throw new Error(response.error || 'Erreur lors de la récupération des données overview');
      }
    } catch (err) {
      throw new Error(`Overview: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  };

  const fetchCosts = async (period: string = '30d') => {
    if (!token) return;

    try {
      const response = await authenticatedFetch(`/api/dashboard/costs?period=${period}`, token);
      if (response.success) {
        setCosts(response.data);
      } else {
        throw new Error(response.error || 'Erreur lors de la récupération des données costs');
      }
    } catch (err) {
      throw new Error(`Costs: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  };

  const fetchMaintenance = async () => {
    if (!token) return;

    try {
      const response = await authenticatedFetch('/api/dashboard/maintenance', token);
      if (response.success) {
        setMaintenance(response.data);
      } else {
        throw new Error(response.error || 'Erreur lors de la récupération des données maintenance');
      }
    } catch (err) {
      throw new Error(`Maintenance: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  };

  const fetchFuel = async (period: string = '30d') => {
    if (!token) return;

    try {
      const response = await authenticatedFetch(`/api/dashboard/fuel?period=${period}`, token);
      if (response.success) {
        setFuel(response.data);
      } else {
        throw new Error(response.error || 'Erreur lors de la récupération des données fuel');
      }
    } catch (err) {
      throw new Error(`Fuel: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  };

  const fetchVehicles = async (limit: number = 10) => {
    if (!token) return;

    try {
      const response = await authenticatedFetch(`/api/dashboard/vehicles?limit=${limit}`, token);
      if (response.success) {
        setVehicles(response.data);
      } else {
        throw new Error(response.error || 'Erreur lors de la récupération des données vehicles');
      }
    } catch (err) {
      throw new Error(`Vehicles: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  };

  // Fonction pour rafraîchir toutes les données
  const refreshAll = async () => {
    if (!token) {
      setError('Token d\'authentification manquant');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await Promise.allSettled([
        fetchOverview(),
        fetchCosts(),
        fetchMaintenance(),
        fetchFuel(),
        fetchVehicles()
      ]);

      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du rafraîchissement');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour rafraîchir une section spécifique
  const refreshSection = async (section: 'overview' | 'costs' | 'maintenance' | 'fuel' | 'vehicles') => {
    if (!token) return;

    try {
      switch (section) {
        case 'overview':
          await fetchOverview();
          break;
        case 'costs':
          await fetchCosts();
          break;
        case 'maintenance':
          await fetchMaintenance();
          break;
        case 'fuel':
          await fetchFuel();
          break;
        case 'vehicles':
          await fetchVehicles();
          break;
      }
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : `Erreur lors du rafraîchissement de ${section}`);
    }
  };

  // Chargement initial et auto-refresh
  useEffect(() => {
    if (token) {
      refreshAll();
    }
  }, [token]);

  // Auto-refresh toutes les 5 minutes
  useEffect(() => {
    if (!token || loading) return;

    const interval = setInterval(() => {
      refreshAll();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [token, loading]);

  return {
    // Données
    overview,
    costs,
    maintenance,
    fuel,
    vehicles,

    // États
    loading,
    error,
    lastRefresh,

    // Actions
    refreshAll,
    refreshSection,
    fetchCosts,
    fetchFuel,
    fetchVehicles,

    // Computed values
    hasData: !!(overview && costs && maintenance && fuel && vehicles),
    isStale: (Date.now() - lastRefresh.getTime()) > 5 * 60 * 1000, // 5 minutes
  };
}