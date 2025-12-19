"use client";

import React from 'react';
import { AlertTriangle, CheckCircle, Clock, Wrench, Calendar, Car } from 'lucide-react';
import MetricCard from './MetricCard';
import StatusGauge, { SimpleStatus } from './StatusGauge';

interface MaintenanceSummary {
  totalReminders: number;
  upcomingReminders: number;
  overdueReminders: number;
  completedReminders: number;
  recentServices: number;
  complianceRate: number;
}

interface Reminder {
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

interface MaintenanceStatusProps {
  summary: MaintenanceSummary;
  upcomingReminders: Reminder[];
  overdueReminders: Reminder[];
  status: {
    healthy: boolean;
    warning: boolean;
    critical: boolean;
  };
  loading?: boolean;
  className?: string;
}

export default function MaintenanceStatus({
  summary,
  upcomingReminders,
  overdueReminders,
  status,
  loading = false,
  className = ''
}: MaintenanceStatusProps) {

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDays = (days?: number) => {
    if (!days) return '';
    if (days === 0) return 'Aujourd\'hui';
    if (days === 1) return 'Demain';
    if (days > 0) return `Dans ${days} jour${days > 1 ? 's' : ''}`;
    if (days === -1) return 'Hier';
    return `Il y a ${Math.abs(days)} jour${Math.abs(days) > 1 ? 's' : ''}`;
  };

  const getComplianceColor = (rate: number) => {
    if (rate >= 90) return 'green';
    if (rate >= 70) return 'yellow';
    return 'red';
  };

  const getUrgencyLevel = (reminder: Reminder) => {
    if (reminder.daysOverdue && reminder.daysOverdue > 0) return 'critical';
    if (reminder.daysUntilDue && reminder.daysUntilDue <= 3) return 'warning';
    return 'normal';
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="h-6 bg-gray-300 rounded w-48 mb-4 animate-pulse"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-16 bg-gray-300 rounded animate-pulse"></div>
                ))}
              </div>
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
          title="Rappels Totaux"
          value={summary.totalReminders}
          icon={Calendar}
          color="blue"
          subtitle="Maintenance préventive"
        />
        
        <MetricCard
          title="À Venir"
          value={summary.upcomingReminders}
          icon={Clock}
          color="yellow"
          subtitle="7 prochains jours"
        />
        
        <MetricCard
          title="En Retard"
          value={summary.overdueReminders}
          icon={AlertTriangle}
          color="red"
          subtitle="Action requise"
        />
        
        <MetricCard
          title="Conformité"
          value={`${summary.complianceRate}%`}
          icon={CheckCircle}
          color={getComplianceColor(summary.complianceRate) as any}
          trend={{
            value: summary.complianceRate,
            isPositive: summary.complianceRate >= 80
          }}
        />
      </div>

      {/* Jauge de statut général */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">État Général de Maintenance</h3>
          {status.healthy && <CheckCircle className="text-green-500" size={24} />}
          {status.warning && <Clock className="text-yellow-500" size={24} />}
          {status.critical && <AlertTriangle className="text-red-500" size={24} />}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <StatusGauge
              title="Taux de Conformité"
              value={summary.complianceRate}
              color={getComplianceColor(summary.complianceRate) as any}
              icon={CheckCircle}
              size="lg"
            />
          </div>
          
          <div className="space-y-3">
            <SimpleStatus
              status="healthy"
              title="Maintenance à jour"
              count={summary.totalReminders - summary.overdueReminders - summary.upcomingReminders}
            />
            <SimpleStatus
              status="warning"
              title="Bientôt due"
              count={summary.upcomingReminders}
            />
            <SimpleStatus
              status="critical"
              title="En retard"
              count={summary.overdueReminders}
            />
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {summary.recentServices}
            </div>
            <div className="text-sm text-gray-600 mb-4">
              Services complétés (30j)
            </div>
            <Wrench className="text-gray-400 mx-auto" size={32} />
          </div>
        </div>
      </div>

      {/* Rappels en retard et à venir */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rappels en retard */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="text-red-500 mr-2" size={20} />
                Rappels en Retard
              </h3>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                {overdueReminders.length}
              </span>
            </div>
          </div>
          
          <div className="p-6">
            {overdueReminders.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="text-green-500 mx-auto mb-3" size={48} />
                <p className="text-gray-600">Aucun rappel en retard !</p>
              </div>
            ) : (
              <div className="space-y-3">
                {overdueReminders.slice(0, 5).map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {reminder.task}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center mt-1">
                        <Car size={14} className="mr-1" />
                        {reminder.vehicleName} ({reminder.vehicleMake})
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-red-600">
                        {formatDays(-(reminder.daysOverdue || 0))}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(reminder.nextDue)}
                      </div>
                    </div>
                  </div>
                ))}
                
                {overdueReminders.length > 5 && (
                  <div className="text-center pt-2">
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      Voir tous les {overdueReminders.length} rappels en retard
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Rappels à venir */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="text-yellow-500 mr-2" size={20} />
                Rappels à Venir
              </h3>
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                {upcomingReminders.length}
              </span>
            </div>
          </div>
          
          <div className="p-6">
            {upcomingReminders.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="text-gray-300 mx-auto mb-3" size={48} />
                <p className="text-gray-600">Aucun rappel programmé</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingReminders.slice(0, 5).map((reminder) => (
                  <div
                    key={reminder.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      getUrgencyColor(getUrgencyLevel(reminder))
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {reminder.task}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center mt-1">
                        <Car size={14} className="mr-1" />
                        {reminder.vehicleName} ({reminder.vehicleMake})
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDays(reminder.daysUntilDue)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(reminder.nextDue)}
                      </div>
                    </div>
                  </div>
                ))}
                
                {upcomingReminders.length > 5 && (
                  <div className="text-center pt-2">
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      Voir tous les {upcomingReminders.length} rappels à venir
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions recommandées */}
      {(status.warning || status.critical) && (
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
            <Wrench className="mr-2" size={20} />
            Actions Recommandées
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {status.critical && (
              <div className="flex items-start">
                <AlertTriangle className="text-red-500 mr-3 mt-1" size={16} />
                <div>
                  <div className="font-medium text-red-900">
                    Traiter les rappels en retard
                  </div>
                  <div className="text-sm text-red-700">
                    {summary.overdueReminders} maintenance{summary.overdueReminders > 1 ? 's' : ''} en attente
                  </div>
                </div>
              </div>
            )}
            
            {status.warning && (
              <div className="flex items-start">
                <Clock className="text-yellow-500 mr-3 mt-1" size={16} />
                <div>
                  <div className="font-medium text-yellow-900">
                    Planifier la maintenance préventive
                  </div>
                  <div className="text-sm text-yellow-700">
                    {summary.upcomingReminders} maintenance{summary.upcomingReminders > 1 ? 's' : ''} à programmer
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-start">
              <CheckCircle className="text-green-500 mr-3 mt-1" size={16} />
              <div>
                <div className="font-medium text-green-900">
                  Améliorer le taux de conformité
                </div>
                <div className="text-sm text-green-700">
                  Objectif: 95% de conformité
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}