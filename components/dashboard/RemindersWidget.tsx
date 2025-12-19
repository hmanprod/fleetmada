import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle, TrendingUp, Calendar, Truck } from 'lucide-react';
import { useServiceReminders } from '@/lib/hooks/useServiceReminders';
import { useVehicleRenewals } from '@/lib/hooks/useVehicleRenewals';
import { useRouter } from 'next/navigation';

interface RemindersWidgetProps {
  className?: string;
  compact?: boolean;
}

export default function RemindersWidget({ className = '', compact = false }: RemindersWidgetProps) {
  const router = useRouter();
  const { reminders: serviceReminders, loading: serviceLoading } = useServiceReminders({ limit: 100 });
  const { renewals: vehicleRenewals, loading: renewalsLoading } = useVehicleRenewals({ limit: 100 });
  
  const [metrics, setMetrics] = useState({
    total: 0,
    overdue: 0,
    dueSoon: 0,
    completed: 0,
    snoozed: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!serviceLoading && !renewalsLoading) {
      const allReminders = [...serviceReminders, ...vehicleRenewals];
      
      const overdue = allReminders.filter(r => r.isOverdue).length;
      const dueSoon = allReminders.filter(r => 
        r.daysUntilDue != null && r.daysUntilDue > 0 && r.daysUntilDue <= 7
      ).length;
      const completed = allReminders.filter(r => r.status === 'COMPLETED').length;
      const snoozed = allReminders.filter(r => r.status === 'DISMISSED').length;
      
      setMetrics({
        total: allReminders.length,
        overdue,
        dueSoon,
        completed,
        snoozed
      });
      
      setLoading(false);
    }
  }, [serviceReminders, vehicleRenewals, serviceLoading, renewalsLoading]);

  const getUrgencyColor = () => {
    if (metrics.overdue > 0) return 'text-red-600 bg-red-50 border-red-200';
    if (metrics.dueSoon > 0) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getUrgencyIcon = () => {
    if (metrics.overdue > 0) return <AlertTriangle className="h-5 w-5" />;
    if (metrics.dueSoon > 0) return <Clock className="h-5 w-5" />;
    return <CheckCircle className="h-5 w-5" />;
  };

  const handleViewAll = () => {
    router.push('/reminders/service');
  };

  const handleCreateReminder = () => {
    router.push('/reminders/service/create');
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getUrgencyColor()}`}>
              {getUrgencyIcon()}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {metrics.overdue > 0 ? `${metrics.overdue} en retard` : 
                 metrics.dueSoon > 0 ? `${metrics.dueSoon} échéances proches` : 
                 'Tous à jour'}
              </div>
              <div className="text-xs text-gray-500">
                {metrics.total} rappels au total
              </div>
            </div>
          </div>
          <button 
            onClick={handleViewAll}
            className="text-[#008751] hover:text-[#007043] text-sm font-medium"
          >
            Voir tout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#008751]" />
            <h3 className="text-lg font-semibold text-gray-900">Rappels & Échéances</h3>
          </div>
          <button
            onClick={handleCreateReminder}
            className="bg-[#008751] hover:bg-[#007043] text-white text-sm font-medium px-3 py-1.5 rounded flex items-center gap-1"
          >
            <Calendar className="h-4 w-4" />
            Nouveau
          </button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* En retard */}
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${
              metrics.overdue > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'
            }`}>
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{metrics.overdue}</div>
            <div className="text-sm text-gray-500">En retard</div>
          </div>

          {/* Échéance proche */}
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${
              metrics.dueSoon > 0 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'
            }`}>
              <Clock className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{metrics.dueSoon}</div>
            <div className="text-sm text-gray-500">Échéance proche</div>
          </div>

          {/* Complétés */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 bg-green-100 text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{metrics.completed}</div>
            <div className="text-sm text-gray-500">Complétés</div>
          </div>

          {/* Total */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 bg-blue-100 text-blue-600">
              <Truck className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{metrics.total}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
        </div>

        {/* Indicateur d'urgence */}
        {metrics.overdue > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">
                Action requise : {metrics.overdue} rappel{metrics.overdue > 1 ? 's' : ''} en retard
              </span>
            </div>
          </div>
        )}

        {metrics.dueSoon > 0 && metrics.overdue === 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-orange-800">
              <Clock className="h-5 w-5" />
              <span className="font-medium">
                Attention : {metrics.dueSoon} échéance{metrics.dueSoon > 1 ? 's' : ''} dans la semaine
              </span>
            </div>
          </div>
        )}

        {metrics.overdue === 0 && metrics.dueSoon === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">
                Excellent ! Tous les rappels sont à jour
              </span>
            </div>
          </div>
        )}

        {/* Actions rapides */}
        <div className="flex gap-3">
          <button
            onClick={handleViewAll}
            className="flex-1 bg-[#008751] hover:bg-[#007043] text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Gérer les rappels
          </button>
          <button
            onClick={() => router.push('/reminders/vehicle-renewals')}
            className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2"
          >
            <Truck className="h-4 w-4" />
            Renouvellements
          </button>
        </div>
      </div>

      {/* Graphique simple de tendances */}
      {metrics.total > 0 && (
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Répartition des statuts</span>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="flex h-2 rounded-full overflow-hidden">
              {metrics.overdue > 0 && (
                <div 
                  className="bg-red-500" 
                  style={{ width: `${(metrics.overdue / metrics.total) * 100}%` }}
                  title={`En retard: ${metrics.overdue}`}
                ></div>
              )}
              {metrics.dueSoon > 0 && (
                <div 
                  className="bg-orange-500" 
                  style={{ width: `${(metrics.dueSoon / metrics.total) * 100}%` }}
                  title={`Échéance proche: ${metrics.dueSoon}`}
                ></div>
              )}
              {metrics.completed > 0 && (
                <div 
                  className="bg-green-500" 
                  style={{ width: `${(metrics.completed / metrics.total) * 100}%` }}
                  title={`Complétés: ${metrics.completed}`}
                ></div>
              )}
              {metrics.snoozed > 0 && (
                <div 
                  className="bg-gray-400" 
                  style={{ width: `${(metrics.snoozed / metrics.total) * 100}%` }}
                  title={`Reportés: ${metrics.snoozed}`}
                ></div>
              )}
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Rouge: Retard</span>
            <span>Orange: Proche</span>
            <span>Vert: Complété</span>
            <span>Gris: Reporté</span>
          </div>
        </div>
      )}
    </div>
  );
}