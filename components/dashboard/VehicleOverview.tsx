"use client";

import React from 'react';
import { Car, Activity, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import MetricCard from './MetricCard';
import TrendChart from './TrendChart';
import { SimpleStatus } from './StatusGauge';

interface Vehicle {
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
}

interface VehicleOverviewProps {
  vehicles: Vehicle[];
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
  loading?: boolean;
  className?: string;
}

export default function VehicleOverview({
  vehicles,
  summary,
  loading = false,
  className = ''
}: VehicleOverviewProps) {

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'gray';
      case 'maintenance':
        return 'yellow';
      case 'disposed':
        return 'red';
      default:
        return 'blue';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Actif';
      case 'inactive':
        return 'Inactif';
      case 'maintenance':
        return 'Maintenance';
      case 'disposed':
        return 'Mis au rebut';
      default:
        return status;
    }
  };

  // Préparer les données pour les graphiques
  const statusChartData = [
    { name: 'Actifs', value: summary.statusBreakdown.active, color: '#10b981' },
    { name: 'Maintenance', value: summary.statusBreakdown.maintenance, color: '#f59e0b' },
    { name: 'Inactifs', value: summary.statusBreakdown.inactive, color: '#6b7280' },
    { name: 'Rebut', value: summary.statusBreakdown.disposed, color: '#ef4444' }
  ].filter(item => item.value > 0);

  const typeChartData = summary.typeBreakdown.map(item => ({
    name: item.type,
    value: item.count
  }));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-300 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-20"></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="h-6 bg-gray-300 rounded w-48 mb-4 animate-pulse"></div>
          <div className="h-64 bg-gray-300 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Véhicules"
          value={summary.totalVehicles}
          icon={Car}
          color="blue"
          subtitle={`${summary.typeBreakdown.length} types`}
        />

        <MetricCard
          title="Taux d'Utilisation"
          value={`${summary.utilizationRate}%`}
          icon={TrendingUp}
          color="green"
          trend={{
            value: summary.utilizationRate,
            isPositive: summary.utilizationRate >= 80
          }}
        />

        <MetricCard
          title="En Maintenance"
          value={summary.statusBreakdown.maintenance}
          icon={Activity}
          color="yellow"
          subtitle={`${summary.maintenanceRate}% du parc`}
        />

        <MetricCard
          title="Coûts Récents"
          value={formatCurrency(
            vehicles.reduce((sum, v) => sum + v.recentCosts, 0)
          )}
          icon={DollarSign}
          color="purple"
          subtitle="30 derniers jours"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par statut */}
        <TrendChart
          title="Répartition par Statut"
          data={statusChartData}
          type="pie"
          height={300}
          showLegend={true}
        />

        {/* Répartition par type */}
        <TrendChart
          title="Répartition par Type"
          data={typeChartData}
          type="bar"
          height={300}
          color="#008751"
        />
      </div>

      {/* Liste des véhicules récents */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Véhicules Récents</h3>
          <p className="text-sm text-gray-600">Dernières activités et métriques</p>
        </div>

        <div className="overflow-x-auto">
          <table data-testid="vehicle-overview-table" className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Véhicule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kilométrage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coûts (30j)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alertes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vehicles.slice(0, 10).map((vehicle) => (
                <tr key={vehicle.id} data-testid="vehicle-row" className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Car size={16} className="text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {vehicle.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <SimpleStatus
                      status={vehicle.status.toLowerCase() as any}
                      title={getStatusLabel(vehicle.status)}
                    />
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vehicle.meterReading ?
                      `${vehicle.meterReading.toLocaleString()} km` :
                      'N/A'
                    }
                    {vehicle.lastMeterDate && (
                      <div className="text-xs text-gray-500">
                        {formatDate(vehicle.lastMeterDate)}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-xs">Carburant:</span>
                        <span className="text-xs">{vehicle.metrics.fuelEntries}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs">Service:</span>
                        <span className="text-xs">{vehicle.metrics.serviceEntries}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="font-medium">
                      {formatCurrency(vehicle.recentCosts)}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {vehicle.metrics.issues > 0 && (
                        <div className="flex items-center text-red-600">
                          <AlertTriangle size={14} className="mr-1" />
                          <span className="text-xs">{vehicle.metrics.issues}</span>
                        </div>
                      )}
                      {vehicle.metrics.reminders > 0 && (
                        <div className="flex items-center text-yellow-600">
                          <Activity size={14} className="mr-1" />
                          <span className="text-xs">{vehicle.metrics.reminders}</span>
                        </div>
                      )}
                      {vehicle.metrics.issues === 0 && vehicle.metrics.reminders === 0 && (
                        <span className="text-xs text-gray-400">Aucune</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {vehicles.length === 0 && (
          <div className="p-12 text-center">
            <Car size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun véhicule trouvé
            </h3>
            <p className="text-gray-600">
              Commencez par ajouter des véhicules à votre flotte.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}