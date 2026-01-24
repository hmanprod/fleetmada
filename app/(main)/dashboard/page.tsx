"use client";

import React, { useState } from 'react';
import { RefreshCw, Settings, Bell, AlertTriangle, TrendingUp, Calendar, Bug } from 'lucide-react';

// Import des composants dashboard
import MetricCard from '@/components/dashboard/MetricCard';
import TrendChart from '@/components/dashboard/TrendChart';
import VehicleOverview from '@/components/dashboard/VehicleOverview';
import CostAnalysis from '@/components/dashboard/CostAnalysis';
import MaintenanceStatus from '@/components/dashboard/MaintenanceStatus';
import IssuesStatus from '@/components/dashboard/IssuesStatus';
import AlertWidget, { AlertSummary } from '@/components/dashboard/AlertWidget';

// Import des hooks
import { useDashboardMetrics } from '@/lib/hooks/useDashboardMetrics';
import { useFleetOverview } from '@/lib/hooks/useFleetOverview';
import { useCostAnalysis } from '@/lib/hooks/useCostAnalysis';
import { useMaintenanceStatus } from '@/lib/hooks/useMaintenanceStatus';
import { useIssuesStatus } from '@/lib/hooks/useIssuesStatus';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'costs' | 'maintenance' | 'vehicles' | 'issues'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Hooks pour récupérer les données
  const fleetOverview = useFleetOverview();
  const costAnalysis = useCostAnalysis({ period: '30d' });
  const maintenanceStatus = useMaintenanceStatus();
  const dashboardMetrics = useDashboardMetrics();
  const issuesStatus = useIssuesStatus();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fleetOverview.refresh(),
        costAnalysis.refresh(),
        maintenanceStatus.refresh(),
        dashboardMetrics.refreshAll(),
        issuesStatus.refresh()
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // Alertes système basées sur les données
  const systemAlerts = [
    ...(fleetOverview.hasIssues ? [{
      id: 'fleet-issues',
      type: 'warning' as const,
      title: 'Problèmes de flotte détectés',
      message: `${fleetOverview.criticalIssues} problème${fleetOverview.criticalIssues > 1 ? 's' : ''} nécessitent votre attention`,
      timestamp: new Date().toISOString(),
      dismissible: true
    }] : []),
    ...(maintenanceStatus.hasCritical ? [{
      id: 'maintenance-critical',
      type: 'error' as const,
      title: 'Maintenance critique',
      message: 'Des maintenances sont en retard et nécessitent une attention immédiate',
      timestamp: new Date().toISOString(),
      dismissible: true
    }] : []),
    ...(costAnalysis.needsAttention ? [{
      id: 'cost-optimization',
      type: 'info' as const,
      title: 'Optimisation des coûts',
      message: 'Des opportunités d\'optimisation des coûts ont été détectées',
      timestamp: new Date().toISOString(),
      dismissible: true
    }] : [])
  ];

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
    { id: 'costs', label: 'Analyse des coûts', icon: TrendingUp },
    { id: 'maintenance', label: 'Maintenance', icon: Calendar },
    { id: 'vehicles', label: 'Véhicules', icon: TrendingUp },
    { id: 'issues', label: 'Problèmes', icon: Bug }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 data-testid="dashboard-title" className="text-3xl font-bold text-gray-900">Dashboard FleetMada</h1>
              <p className="text-gray-600 mt-1">
                Vue d'ensemble de votre flotte en temps réel
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Indicateur de statut */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${fleetOverview.isHealthy ? 'bg-green-500' :
                  fleetOverview.hasIssues ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                <span className="text-sm text-gray-600">
                  {fleetOverview.isHealthy ? 'Système opérationnel' : 'Attention requise'}
                </span>
              </div>

              {/* Notifications */}
              {/* <button data-testid="notification-button" className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell className="w-6 h-6" />
                {systemAlerts.length > 0 && (
                  <span data-testid="notification-badge" className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {systemAlerts.length}
                  </span>
                )}
              </button> */}

              {/* Settings */}
              {/* <button className="p-2 text-gray-600 hover:text-gray-900">
                <Settings className="w-6 h-6" />
              </button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding pour nouveaux utilisateurs */}
      {fleetOverview.data?.totalVehicles === 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-blue-900">
                  Bienvenue sur FleetMada !
                </h3>
                <div className="mt-2 text-blue-700">
                  <p>
                    Commencez par ajouter des véhicules à votre flotte pour voir vos métriques dashboard.
                  </p>
                </div>
                <div className="mt-4">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Ajouter mon premier véhicule
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation par onglets */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  data-testid={`dashboard-${tab.id}-tab`}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                    ? 'border-[#008751] text-[#008751]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Vue d'ensemble */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Métriques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                data-testid="metric-card-total-vehicles"
                title="Total Véhicules"
                value={fleetOverview.data?.totalVehicles || 0}
                icon={TrendingUp}
                color="blue"
                loading={fleetOverview.loading}
                trend={{
                  value: fleetOverview.healthScore,
                  label: 'Score santé',
                  isPositive: fleetOverview.healthScore >= 80
                }}
              />

              <MetricCard
                data-testid="metric-card-total-costs"
                title="Coûts (30j)"
                value={`${(costAnalysis.data?.summary.totalCosts || 0).toLocaleString()}€`}
                icon={TrendingUp}
                color="purple"
                loading={costAnalysis.loading}
                subtitle="Carburant + Entretien"
              />

              <MetricCard
                data-testid="metric-card-maintenance"
                title="Maintenance"
                value={maintenanceStatus.data?.summary.overdueReminders || 0}
                icon={Calendar}
                color={maintenanceStatus.hasCritical ? 'red' : 'yellow'}
                loading={maintenanceStatus.loading}
                subtitle="En retard"
              />

              <MetricCard
                title="Taux d'Utilisation"
                value={`${fleetOverview.data?.utilizationRate || 0}%`}
                icon={TrendingUp}
                color="green"
                loading={fleetOverview.loading}
                trend={{
                  value: fleetOverview.data?.utilizationRate || 0,
                  isPositive: (fleetOverview.data?.utilizationRate || 0) >= 80
                }}
              />
            </div>

            {/* Alertes et graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Alertes */}
              <div className="lg:col-span-1">
                <AlertSummary data-testid="alert-summary" alerts={systemAlerts} />
              </div>

              {/* Graphique des coûts */}
              <div className="lg:col-span-2">
                {costAnalysis.data ? (
                  <TrendChart
                    title="Évolution des Coûts (30 derniers jours)"
                    data={[
                      { name: 'Carburant', value: costAnalysis.data.breakdown.fuel.total },
                      { name: 'Entretien', value: costAnalysis.data.breakdown.service.total },
                      { name: 'Recharge', value: costAnalysis.data.breakdown.charging.total }
                    ]}
                    type="bar"
                    height={300}
                    color="#008751"
                  />
                ) : (
                  <TrendChart
                    title="Évolution des Coûts (30 derniers jours)"
                    data={[]}
                    type="bar"
                    height={300}
                    loading={costAnalysis.loading}
                  />
                )}
              </div>
            </div>

            {/* Vue d'ensemble véhicules */}
            {dashboardMetrics.vehicles && (
              <VehicleOverview
                vehicles={dashboardMetrics.vehicles.vehiclesWithMetrics}
                summary={dashboardMetrics.vehicles.summary}
                loading={dashboardMetrics.loading}
              />
            )}
          </div>
        )}

        {/* Analyse des coûts */}
        {activeTab === 'costs' && costAnalysis.data && (
          <CostAnalysis
            summary={costAnalysis.data.summary}
            breakdown={costAnalysis.data.breakdown}
            loading={costAnalysis.loading}
          />
        )}

        {/* Status maintenance */}
        {activeTab === 'maintenance' && maintenanceStatus.data && (
          <MaintenanceStatus
            summary={maintenanceStatus.data.summary}
            upcomingReminders={maintenanceStatus.data.upcomingReminders}
            overdueReminders={maintenanceStatus.data.overdueReminders}
            status={maintenanceStatus.data.status}
            loading={maintenanceStatus.loading}
          />
        )}

        {/* Vue d'ensemble véhicules */}
        {activeTab === 'vehicles' && dashboardMetrics.vehicles && (
          <VehicleOverview
            vehicles={dashboardMetrics.vehicles.vehiclesWithMetrics}
            summary={dashboardMetrics.vehicles.summary}
            loading={dashboardMetrics.loading}
          />
        )}

        {/* Status problèmes */}
        {activeTab === 'issues' && issuesStatus.data && (
          <IssuesStatus
            summary={issuesStatus.data.summary}
            recentIssues={issuesStatus.data.recentIssues}
            criticalIssues={issuesStatus.data.criticalIssues}
            status={issuesStatus.data.status}
            loading={issuesStatus.loading}
          />
        )}
      </div>

      {/* Loading overlay */}
      {(fleetOverview.loading || costAnalysis.loading || maintenanceStatus.loading || dashboardMetrics.loading || issuesStatus.loading) && (
        <div data-testid="loading-overlay" className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
            <RefreshCw className="w-6 h-6 animate-spin text-[#008751]" />
            <span className="text-gray-900">Chargement des données...</span>
          </div>
        </div>
      )}

      {/* Error display */}
      {(fleetOverview.error || costAnalysis.error || maintenanceStatus.error || dashboardMetrics.error || issuesStatus.error) && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm">
          <div className="flex">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erreur de chargement</h3>
              <p className="mt-1 text-sm text-red-700">
                {fleetOverview.error || costAnalysis.error || maintenanceStatus.error || dashboardMetrics.error || issuesStatus.error}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}