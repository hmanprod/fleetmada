"use client";

import { useState, useEffect } from 'react';
import { useAuthToken, authenticatedFetch } from './useAuthToken';

export interface MaintenanceReminder {
  id: string;
  task: string;
  vehicleName: string;
  vehicleMake: string;
  vehicleModel: string;
  nextDue: string;
  daysUntilDue?: number;
  daysOverdue?: number;
  compliance: number;
}

export interface MaintenanceStatus {
  summary: {
    totalReminders: number;
    upcomingReminders: number;
    overdueReminders: number;
    completedReminders: number;
    recentServices: number;
    complianceRate: number;
  };
  upcomingReminders: MaintenanceReminder[];
  overdueReminders: MaintenanceReminder[];
  status: {
    healthy: boolean;
    warning: boolean;
    critical: boolean;
  };
  lastUpdated: string;
}

export function useMaintenanceStatus() {
  const [data, setData] = useState<MaintenanceStatus | null>(null);
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

      const response = await authenticatedFetch('/api/dashboard/maintenance', token);

      if (response.success) {
        setData(response.data);
        setLastRefresh(new Date());
      } else {
        throw new Error(response.error || 'Erreur lors de la récupération des données de maintenance');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await fetchData();
  };

  // Computed values
  const urgentReminders = data ? [
    ...data.overdueReminders.map(r => ({ ...r, priority: 'critical' as const })),
    ...data.upcomingReminders
      .filter(r => (r.daysUntilDue || 0) <= 3)
      .map(r => ({ ...r, priority: 'warning' as const }))
  ] : [];

  const maintenanceScore = data ? Math.max(0, Math.min(100,
    data.summary.complianceRate -
    (data.summary.overdueReminders * 15) -
    (data.summary.upcomingReminders * 5)
  )) : 0;

  const nextMaintenance = data ? [
    ...data.upcomingReminders
      .sort((a, b) => (a.daysUntilDue || 999) - (b.daysUntilDue || 999))
  ] : [];

  const recommendations = data ? [
    ...(data.summary.overdueReminders > 0 ? [{
      type: 'critical' as const,
      title: 'Traiter les rappels en retard',
      description: `${data.summary.overdueReminders} maintenance${data.summary.overdueReminders > 1 ? 's' : ''} en attente`,
      action: 'Planifier immédiatement'
    }] : []),
    ...(data.summary.upcomingReminders > 5 ? [{
      type: 'warning' as const,
      title: 'Manytenance préventive à planifier',
      description: `${data.summary.upcomingReminders} rappels à venir`,
      action: 'Optimiser la planification'
    }] : []),
    ...(data.summary.complianceRate < 80 ? [{
      type: 'info' as const,
      title: 'Améliorer la conformité',
      description: `Taux actuel: ${data.summary.complianceRate}%`,
      action: 'Réviser les processus'
    }] : [])
  ] : [];

  const isOverdue = (reminder: MaintenanceReminder) => {
    return reminder.daysOverdue && reminder.daysOverdue > 0;
  };

  const isDueSoon = (reminder: MaintenanceReminder) => {
    return reminder.daysUntilDue !== undefined && reminder.daysUntilDue <= 7;
  };

  // Auto-refresh toutes les 2 minutes pour les alertes critiques
  useEffect(() => {
    if (!token) return;

    fetchData();

    const interval = setInterval(fetchData, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(interval);
  }, [token]);

  return {
    data,
    loading,
    error,
    lastRefresh,
    refresh,

    // Computed values
    urgentReminders,
    maintenanceScore,
    nextMaintenance,
    recommendations,
    isOverdue,
    isDueSoon,

    // State helpers
    isLoading: loading,
    hasData: !!data,
    isHealthy: data?.status.healthy || false,
    hasWarnings: data?.status.warning || false,
    hasCritical: data?.status.critical || false,
    needsAttention: urgentReminders.length > 0,
    isStale: (Date.now() - lastRefresh.getTime()) > 2 * 60 * 1000,
  };
}
