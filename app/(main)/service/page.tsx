'use client';

import React, { useState } from 'react';
import { Search, Plus, Filter, ChevronRight, X, Calendar, Wrench, AlertCircle, TrendingUp, Clock, DollarSign, Users, Activity, Settings, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useServiceEntries } from '@/lib/hooks/useServiceEntries';
import { useServicePrograms } from '@/lib/hooks/useServicePrograms';
import { useServiceReminders } from '@/lib/hooks/useServiceReminders';

export default function ServicePage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('30'); // jours

  // Hooks pour récupérer les données
  const {
    entries: recentEntries,
    loading: entriesLoading,
    error: entriesError
  } = useServiceEntries({
    limit: 5,
    status: 'COMPLETED'
  });

  const {
    programs: activePrograms,
    totalPrograms,
    activePrograms: activeProgramsCount,
    upcomingDuePrograms,
    loading: programsLoading
  } = useServicePrograms({
    active: true
  });

  const {
    reminders: upcomingReminders,
    loading: remindersLoading
  } = useServiceReminders({
    limit: 5,
    overdue: true
  });

  const handleAdd = () => {
    router.push('/service/programs/create');
  };

  const handleSelectProgram = (programId: string) => {
    router.push(`/service/programs/${programId}`);
  };

  const handleViewHistory = () => {
    router.push('/service/history');
  };

  const handleViewWorkOrders = () => {
    router.push('/service/work-orders');
  };

  const handleViewTasks = () => {
    router.push('/service/tasks');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Calculs de statistiques
  const totalCost = recentEntries.reduce((sum, entry) => sum + (entry.totalCost || 0), 0);
  const avgCost = recentEntries.length > 0 ? totalCost / recentEntries.length : 0;

  const stats = [
    {
      title: 'Programmes Actifs',
      value: activeProgramsCount,
      change: '+12%',
      changeType: 'increase',
      icon: Settings,
      color: 'bg-blue-500'
    },
    {
      title: 'Entrées Récentes',
      value: recentEntries.length,
      change: '+8%',
      changeType: 'increase',
      icon: FileText,
      color: 'bg-green-500'
    },
    {
      title: 'Coût Total',
      value: formatCurrency(totalCost),
      change: '+5%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'bg-purple-500'
    },
    {
      title: 'Rappels Urgents',
      value: upcomingReminders.filter(r => r.isOverdue).length,
      change: '-2%',
      changeType: 'decrease',
      icon: AlertCircle,
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 data-testid="service-dashboard-title" className="text-3xl font-bold text-gray-900">Dashboard Maintenance</h1>
          <button className="text-[#008751] font-medium flex items-center gap-1 text-sm hover:underline">
            Vue d'ensemble du service <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleViewTasks}
            className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded flex items-center gap-2"
          >
            <Wrench size={20} /> Tâches
          </button>
          <button
            onClick={handleAdd}
            data-testid="add-service-program-button"
            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          >
            <Plus size={20} /> Nouveau Programme
          </button>
        </div>
      </div>

      {/* Statistiques principales */}
      <div data-testid="service-stats-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} data-testid={`stat-card-${stat.title.toLowerCase().replace(/\s+/g, '-')}`} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">vs mois dernier</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleViewHistory}
            data-testid="quick-action-history"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >

            <div className="p-2 bg-blue-100 rounded">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Historique Maintenance</p>
              <p className="text-sm text-gray-600">Voir l'historique des interventions</p>
            </div>
          </button>

          <button
            onClick={handleViewWorkOrders}
            data-testid="quick-action-work-orders"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-green-100 rounded">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Demandes d’entretien</p>
              <p className="text-sm text-gray-600">Gérer les work orders</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/service/programs')}
            data-testid="quick-action-programs"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-purple-100 rounded">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Programmes</p>
              <p className="text-sm text-gray-600">Configurer les programmes</p>
            </div>
          </button>
        </div>
      </div>

      {/* Activité récente et alertes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Activité récente */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Activité Récente</h2>
            <button
              onClick={handleViewHistory}
              className="text-[#008751] hover:underline text-sm font-medium"
            >
              Voir tout
            </button>
          </div>

          {entriesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#008751]"></div>
            </div>
          ) : entriesError ? (
            <div className="flex items-center gap-2 text-red-600 py-4">
              <AlertCircle className="w-5 h-5" />
              <span>Erreur lors du chargement</span>
            </div>
          ) : recentEntries.length > 0 ? (
            <div data-testid="recent-activity-list" className="space-y-3">
              {recentEntries.slice(0, 5).map((entry) => (
                <div key={entry.id} data-testid={`activity-item-${entry.id}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">

                  <div className="p-2 bg-green-100 rounded">
                    <Activity className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {entry.vehicle?.name || `Véhicule ${entry.vehicleId}`}
                    </p>
                    <p className="text-xs text-gray-600">
                      {formatDate(entry.date)} • {formatCurrency(entry.totalCost || 0)}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                    Terminé
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>Aucune activité récente</p>
            </div>
          )}
        </div>

        {/* Rappels et alertes */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Rappels & Alertes</h2>
            <button className="text-[#008751] hover:underline text-sm font-medium">
              Gérer
            </button>
          </div>

          {remindersLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#008751]"></div>
            </div>
          ) : upcomingReminders.length > 0 ? (
            <div className="space-y-3">
              {upcomingReminders.slice(0, 5).map((reminder) => (
                <div key={reminder.id} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="p-2 bg-yellow-100 rounded">
                    <Clock className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {reminder.vehicle?.name || `Véhicule ${reminder.vehicleId}`}
                    </p>
                    <p className="text-xs text-gray-600">
                      {reminder.task}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${reminder.isOverdue
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {reminder.isOverdue ? 'En retard' : 'Bientôt dû'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>Aucun rappel en attente</p>
            </div>
          )}
        </div>
      </div>

      {/* Programmes récents */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Programmes de Service</h2>
            <button
              onClick={() => router.push('/service/programs')}
              className="text-[#008751] hover:underline text-sm font-medium"
            >
              Voir tout
            </button>
          </div>
        </div>

        {programsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008751]"></div>
          </div>
        ) : activePrograms.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {activePrograms.slice(0, 5).map((program) => (
              <div
                key={program.id}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleSelectProgram(program.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#008751] rounded">
                      <Settings className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{program.name}</p>
                      <p className="text-sm text-gray-600">
                        {program.vehicleCount || 0} véhicules • {program.taskCount || 0} tâches
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                      Actif
                    </span>
                    {program.nextDue && (
                      <span className="text-sm text-gray-500">
                        {formatDate(program.nextDue)}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">Aucun programme de service actif</p>
            <button
              onClick={handleAdd}
              className="bg-[#008751] hover:bg-[#007043] text-white font-medium py-2 px-4 rounded"
            >
              Créer un programme
            </button>
          </div>
        )}
      </div>
    </div>
  );
}