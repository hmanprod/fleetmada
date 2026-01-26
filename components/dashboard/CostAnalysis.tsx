"use client";

import React, { useState } from 'react';
import { DollarSign, Fuel, Wrench, Battery, TrendingUp, TrendingDown } from 'lucide-react';
import MetricCard from './MetricCard';
import TrendChart from './TrendChart';

interface CostSummary {
  totalCosts: number;
  totalFuelCost: number;
  totalServiceCost: number;
  totalChargingCost: number;
  averageMPG: number;
  period: string;
  entryCount: number;
}

interface CostBreakdown {
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
}

interface CostAnalysisProps {
  summary: CostSummary;
  breakdown: CostBreakdown;
  history: Array<{ name: string; costs: number }>;
  loading?: boolean;
  className?: string;
}

export default function CostAnalysis({
  summary,
  breakdown,
  history,
  loading = false,
  className = ''
}: CostAnalysisProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatVolume = (volume: number) => {
    return `${volume.toFixed(1)} L`;
  };

  const formatMPG = (mpg: number) => {
    return `${mpg.toFixed(1)} L/100km`;
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '7d':
        return '7 derniers jours';
      case '30d':
        return '30 derniers jours';
      case '90d':
        return '90 derniers jours';
      case '1y':
        return '12 derniers mois';
      default:
        return period;
    }
  };

  // Préparer les données pour les graphiques
  const breakdownChartData = [
    {
      name: 'Carburant',
      value: breakdown.fuel.total,
      percentage: breakdown.fuel.percentage,
      color: '#ef4444'
    },
    {
      name: 'Entretien',
      value: breakdown.service.total,
      percentage: breakdown.service.percentage,
      color: '#008751'
    },
    {
      name: 'Recharge',
      value: breakdown.charging.total,
      percentage: breakdown.charging.percentage,
      color: '#3b82f6'
    }
  ].filter(item => item.value > 0);

  // Données de l'API pour les tendances
  const trendData = history.map(item => ({
    name: item.name,
    value: item.costs
  }));

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-300 rounded w-20 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-16"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="h-6 bg-gray-300 rounded w-48 mb-4 animate-pulse"></div>
              <div className="h-64 bg-gray-300 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Coûts Totaux"
          value={formatCurrency(summary.totalCosts)}
          icon={DollarSign}
          color="blue"
          subtitle={getPeriodLabel(summary.period)}
          trend={{
            value: 5.2,
            label: 'vs mois dernier',
            isPositive: false
          }}
        />

        <MetricCard
          title="Coûts Carburant"
          value={formatCurrency(summary.totalFuelCost)}
          icon={Fuel}
          color="red"
          subtitle={`${breakdown.fuel.percentage}% du total`}
          trend={{
            value: breakdown.fuel.percentage,
            isPositive: false
          }}
        />

        <MetricCard
          title="Coûts Entretien"
          value={formatCurrency(summary.totalServiceCost)}
          icon={Wrench}
          color="green"
          subtitle={`${breakdown.service.percentage}% du total`}
        />

        <MetricCard
          title="Consommation Moy."
          value={formatMPG(summary.averageMPG)}
          icon={Battery}
          color="purple"
          subtitle={`${summary.entryCount} entrées`}
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des coûts */}
        <TrendChart
          title="Répartition des Coûts"
          data={breakdownChartData}
          type="pie"
          height={350}
          showLegend={true}
        />

        {/* Évolution des coûts */}
        <TrendChart
          title="Évolution des Coûts"
          data={trendData}
          type="area"
          height={350}
          color="#008751"
        />
      </div>

      {/* Détail des coûts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Carburant */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
              <h3 className="text-lg font-semibold text-gray-900">Carburant</h3>
            </div>
            <Fuel className="text-red-500" size={24} />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total</span>
              <span className="font-semibold">{formatCurrency(breakdown.fuel.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Transactions</span>
              <span className="text-sm text-gray-900">{breakdown.fuel.count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Part du budget</span>
              <span className="text-sm text-gray-900">{breakdown.fuel.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${breakdown.fuel.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Entretien */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <h3 className="text-lg font-semibold text-gray-900">Entretien</h3>
            </div>
            <Wrench className="text-green-500" size={24} />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total</span>
              <span className="font-semibold">{formatCurrency(breakdown.service.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Interventions</span>
              <span className="text-sm text-gray-900">{breakdown.service.count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Part du budget</span>
              <span className="text-sm text-gray-900">{breakdown.service.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${breakdown.service.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Recharge électrique */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <h3 className="text-lg font-semibold text-gray-900">Recharge</h3>
            </div>
            <Battery className="text-blue-500" size={24} />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total</span>
              <span className="font-semibold">{formatCurrency(breakdown.charging.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Sessions</span>
              <span className="text-sm text-gray-900">{breakdown.charging.count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Part du budget</span>
              <span className="text-sm text-gray-900">{breakdown.charging.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${breakdown.charging.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights et recommandations */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <TrendingUp className="mr-2" size={20} />
          Analyse des Coûts
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center text-blue-800">
              <TrendingUp size={16} className="mr-2 text-green-600" />
              <span>Le carburant représente {breakdown.fuel.percentage}% des coûts totaux</span>
            </div>
            <div className="flex items-center text-blue-800">
              <TrendingDown size={16} className="mr-2 text-red-600" />
              <span>L'entretien coûte en moyenne {formatCurrency(breakdown.service.total / Math.max(breakdown.service.count, 1))} par intervention</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-blue-800">
              <Battery size={16} className="mr-2 text-blue-600" />
              <span>{breakdown.charging.count} sessions de recharge électrique</span>
            </div>
            <div className="flex items-center text-blue-800">
              <Fuel size={16} className="mr-2 text-red-600" />
              <span>Consommation moyenne: {formatMPG(summary.averageMPG)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}