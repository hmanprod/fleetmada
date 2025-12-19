"use client";

import React from 'react';
import { CheckCircle, Clock, AlertTriangle, XCircle, ClipboardCheck } from 'lucide-react';
import MetricCard from './MetricCard';
import StatusGauge from './StatusGauge';

interface InspectionStatusProps {
  loading?: boolean;
  totalInspections: number;
  completedInspections: number;
  scheduledInspections: number;
  overdueInspections: number;
  cancelledInspections: number;
  complianceRate: number;
  averageCompletionTime?: number;
  trend?: {
    inspections: number;
    compliance: number;
  };
}

const statusConfig = {
  completed: {
    color: 'green',
    icon: CheckCircle,
    label: 'Terminées',
    description: 'Inspections complétées avec succès'
  },
  scheduled: {
    color: 'blue', 
    icon: Clock,
    label: 'Planifiées',
    description: 'Inspections à venir'
  },
  overdue: {
    color: 'red',
    icon: AlertTriangle,
    label: 'En retard',
    description: 'Inspections en retard'
  },
  cancelled: {
    color: 'gray',
    icon: XCircle,
    label: 'Annulées',
    description: 'Inspections annulées'
  },
  inProgress: {
    color: 'yellow',
    icon: ClipboardCheck,
    label: 'En cours',
    description: 'Inspections en cours'
  }
};

export default function InspectionStatus({
  loading = false,
  totalInspections,
  completedInspections,
  scheduledInspections,
  overdueInspections,
  cancelledInspections,
  complianceRate,
  averageCompletionTime = 0,
  trend
}: InspectionStatusProps) {
  const inProgressInspections = Math.max(0, totalInspections - completedInspections - scheduledInspections - overdueInspections - cancelledInspections);

  const getComplianceColor = () => {
    if (complianceRate >= 90) return 'green';
    if (complianceRate >= 75) return 'yellow';
    return 'red';
  };

  const getComplianceStatus = () => {
    if (complianceRate >= 90) return 'excellent';
    if (complianceRate >= 75) return 'good';
    if (complianceRate >= 60) return 'warning';
    return 'critical';
  };

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Inspections"
          value={totalInspections}
          icon={ClipboardCheck}
          color="blue"
          loading={loading}
          trend={trend ? {
            value: trend.inspections,
            label: "vs mois dernier",
            isPositive: trend.inspections > 0
          } : undefined}
        />

        <MetricCard
          title="Terminées"
          value={completedInspections}
          icon={CheckCircle}
          color="green"
          loading={loading}
          subtitle={`${totalInspections > 0 ? Math.round((completedInspections / totalInspections) * 100) : 0}% du total`}
        />

        <MetricCard
          title="Planifiées"
          value={scheduledInspections}
          icon={Clock}
          color="blue"
          loading={loading}
          subtitle="À venir"
        />

        <MetricCard
          title="En retard"
          value={overdueInspections}
          icon={AlertTriangle}
          color={overdueInspections > 0 ? 'red' : 'gray'}
          loading={loading}
          subtitle="Nécessitent attention"
        />

        <MetricCard
          title="Annulées"
          value={cancelledInspections}
          icon={XCircle}
          color="gray"
          loading={loading}
          subtitle="Planification révisée"
        />
      </div>

      {/* Indicateurs de performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Taux de conformité */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Taux de Conformité</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              getComplianceStatus() === 'excellent' ? 'bg-green-100 text-green-800' :
              getComplianceStatus() === 'good' ? 'bg-blue-100 text-blue-800' :
              getComplianceStatus() === 'warning' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {getComplianceStatus() === 'excellent' ? 'Excellent' :
               getComplianceStatus() === 'good' ? 'Bon' :
               getComplianceStatus() === 'warning' ? 'Attention' : 'Critique'}
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <StatusGauge
              title="Conformité"
              value={complianceRate}
              color={getComplianceColor()}
              size="lg"
              showPercentage={true}
              subtitle={`${completedInspections} inspections évaluées`}
            />
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              {complianceRate >= 90 ? 'Excellent niveau de conformité' :
               complianceRate >= 75 ? 'Bon niveau avec améliorations possibles' :
               complianceRate >= 60 ? 'Conformité moyenne, attention requise' :
               'Niveau critique, action immédiate nécessaire'}
            </p>
          </div>
        </div>

        {/* Temps moyen de complétion */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Temps moyen de complétion</span>
              <span className="text-lg font-semibold text-gray-900">
                {averageCompletionTime > 0 ? `${Math.round(averageCompletionTime)} min` : 'N/A'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">En cours</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="font-medium">{inProgressInspections}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tendance conformité</span>
              <div className="flex items-center gap-1">
                {trend && (
                  <>
                    {trend.compliance > 0 ? (
                      <span className="text-green-600 text-sm font-medium">
                        +{trend.compliance}%
                      </span>
                    ) : trend.compliance < 0 ? (
                      <span className="text-red-600 text-sm font-medium">
                        {trend.compliance}%
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm font-medium">
                        =
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alertes et recommandations */}
      {overdueInspections > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-red-900">
                Action requise
              </h4>
              <p className="text-sm text-red-700 mt-1">
                {overdueInspections} inspection{overdueInspections > 1 ? 's' : ''} en retard 
                nécessitent une attention immédiate.
              </p>
            </div>
          </div>
        </div>
      )}

      {complianceRate < 75 && completedInspections > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-yellow-900">
                Amélioration recommandée
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                Le taux de conformité de {complianceRate}% peut être amélioré. 
                Vérifiez les standards d'inspection.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}