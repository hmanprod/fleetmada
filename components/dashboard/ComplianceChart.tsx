"use client";

import React from 'react';
import { TrendingUp, TrendingDown, Calendar, Target } from 'lucide-react';
import TrendChart from './TrendChart';
import { HorizontalGauge } from './StatusGauge';

interface ComplianceData {
  period: string;
  complianceRate: number;
  totalInspections: number;
  passedInspections: number;
  failedInspections: number;
}

interface ComplianceChartProps {
  loading?: boolean;
  data: ComplianceData[];
  currentComplianceRate: number;
  targetComplianceRate?: number;
  period?: 'week' | 'month' | 'quarter' | 'year';
}

export default function ComplianceChart({
  loading = false,
  data,
  currentComplianceRate,
  targetComplianceRate = 85,
  period = 'month'
}: ComplianceChartProps) {
  // Préparer les données pour le graphique
  const chartData = data.map(item => ({
    name: item.period,
    value: item.complianceRate,
    details: {
      total: item.totalInspections,
      passed: item.passedInspections,
      failed: item.failedInspections
    }
  }));

  // Calculer la tendance
  const calculateTrend = () => {
    if (data.length < 2) return { value: 0, isPositive: true };
    
    const current = data[data.length - 1]?.complianceRate || 0;
    const previous = data[data.length - 2]?.complianceRate || 0;
    const difference = current - previous;
    
    return {
      value: Math.round(difference * 10) / 10,
      isPositive: difference >= 0
    };
  };

  const trend = calculateTrend();

  // Statistiques calculées
  const averageCompliance = data.length > 0 
    ? data.reduce((sum, item) => sum + item.complianceRate, 0) / data.length 
    : 0;

  const bestCompliance = data.length > 0 
    ? Math.max(...data.map(item => item.complianceRate)) 
    : 0;

  const worstCompliance = data.length > 0 
    ? Math.min(...data.map(item => item.complianceRate)) 
    : 0;

  // Déterminer la couleur du status
  const getComplianceStatus = () => {
    if (currentComplianceRate >= targetComplianceRate) return 'excellent';
    if (currentComplianceRate >= targetComplianceRate * 0.8) return 'good';
    if (currentComplianceRate >= targetComplianceRate * 0.6) return 'warning';
    return 'critical';
  };

  const status = getComplianceStatus();

  const statusConfig = {
    excellent: {
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      label: 'Excellent',
      description: 'Objectif dépassé'
    },
    good: {
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      label: 'Bon',
      description: 'Objectif atteint'
    },
    warning: {
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      label: 'Attention',
      description: 'Amélioration nécessaire'
    },
    critical: {
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      label: 'Critique',
      description: 'Action immédiate'
    }
  };

  const config = statusConfig[status];

  // Formater la période pour l'affichage
  const formatPeriod = (period: string) => {
    switch (period.toLowerCase()) {
      case 'week': return 'Semaine';
      case 'month': return 'Mois';
      case 'quarter': return 'Trimestre';
      case 'year': return 'Année';
      default: return period;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec métriques clés */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${config.bg} ${config.border} border rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux Actuel</p>
              <p className={`text-2xl font-bold ${config.color}`}>
                {Math.round(currentComplianceRate)}%
              </p>
            </div>
            <Target className={`w-8 h-8 ${config.color}`} />
          </div>
          <div className="mt-2 flex items-center">
            {trend.isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.isPositive ? '+' : ''}{trend.value}% vs période précédente
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Objectif</p>
              <p className="text-2xl font-bold text-gray-900">
                {targetComplianceRate}%
              </p>
            </div>
            <Target className="w-8 h-8 text-gray-400" />
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              {currentComplianceRate >= targetComplianceRate 
                ? 'Objectif atteint' 
                : `${targetComplianceRate - currentComplianceRate}% à atteindre`}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Moyenne</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(averageCompliance)}%
              </p>
            </div>
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Sur {formatPeriod(period).toLowerCase()}s
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Évolution</p>
              <p className="text-2xl font-bold text-gray-900">
                {bestCompliance}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              {worstCompliance}% - {bestCompliance}%
            </p>
          </div>
        </div>
      </div>

      {/* Graphique principal */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Évolution de la Conformité ({formatPeriod(period)})
          </h3>
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.color}`}>
              {config.label}
            </div>
            <span className="text-sm text-gray-500">
              {data.length} période{data.length > 1 ? 's' : ''} analysée{data.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {data.length > 0 ? (
          <TrendChart
            title=""
            data={chartData}
            type="line"
            height={300}
            color="#008751"
            loading={loading}
          />
        ) : (
          <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune donnée disponible</p>
              <p className="text-sm text-gray-400 mt-1">
                Les données de conformité apparaîtront ici
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Jauges de performance détaillées */}
      {data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4">
              Performance vs Objectif
            </h4>
            <HorizontalGauge
              title="Taux de conformité"
              value={currentComplianceRate}
              max={100}
              color={status === 'excellent' ? 'green' : status === 'good' ? 'blue' : status === 'warning' ? 'yellow' : 'red'}
              subtitle={`Objectif: ${targetComplianceRate}%`}
              showValues={true}
            />
            <div className="mt-4 text-center">
              <p className={`text-sm font-medium ${config.color}`}>
                {config.description}
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4">
              Répartition des Inspections
            </h4>
            <div className="space-y-3">
              {data.length > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Conformes</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(data[data.length - 1].passedInspections / data[data.length - 1].totalInspections) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {data[data.length - 1].passedInspections}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Non-conformes</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${(data[data.length - 1].failedInspections / data[data.length - 1].totalInspections) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {data[data.length - 1].failedInspections}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recommandations */}
      {status === 'critical' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <TrendingDown className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-900">
                Action corrective urgente recommandée
              </h4>
              <p className="text-sm text-red-700 mt-1">
                Le taux de conformité est critique. Analysez les échecs d'inspection 
                et améliorez les processus d'inspection.
              </p>
            </div>
          </div>
        </div>
      )}

      {status === 'warning' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <TrendingUp className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-900">
                Amélioration recommandée
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                Surveillez de près les tendances et identifiez les points d'amélioration 
                pour atteindre l'objectif de conformité.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}