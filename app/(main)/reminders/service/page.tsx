'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, Zap, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useServiceReminders } from '@/lib/hooks/useServiceReminders';
import { FiltersSidebar } from '../../inspections/components/filters/FiltersSidebar';
import { FilterCriterion } from '../../inspections/components/filters/FilterCard';
import { SERVICE_REMINDER_FILTER_FIELDS } from './components/filters/service-reminder-filter-definitions';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { useToast, ToastContainer } from '@/components/NotificationToast';

export default function ServiceRemindersPage() {
  const router = useRouter();
  const { toast, toasts, removeToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedReminders, setSelectedReminders] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  // Advanced Filters State
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeCriteria, setActiveCriteria] = useState<FilterCriterion[]>([]);
  const { vehicles } = useVehicles();

  // Configuration des filtres basée sur l'onglet actif et les filtres avancés
  const options = useMemo(() => {
    const baseOptions: any = {
      search: searchTerm || undefined,
      page: page,
      limit: 20,
    };

    // Filtres d'onglets
    switch (activeTab) {
      case 'overdue':
        baseOptions.overdue = true;
        break;
      case 'snoozed':
        baseOptions.status = 'DISMISSED';
        break;
      case 'due-soon':
        baseOptions.dueSoon = true;
        break;
    }

    // Appliquer les critères de filtres avancés
    activeCriteria.forEach(c => {
      const value = Array.isArray(c.value) ? c.value[0] : c.value;
      if (c.field === 'task') {
        baseOptions.search = value;
      } else {
        baseOptions[c.field] = value;
      }
    });

    return baseOptions;
  }, [activeTab, searchTerm, activeCriteria]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, activeTab, activeCriteria]);

  const { reminders, loading, error, pagination, refresh } = useServiceReminders(options);

  // Populate dynamic options for filter fields
  const populatedFilterFields = useMemo(() => {
    return SERVICE_REMINDER_FILTER_FIELDS.map(field => {
      if (field.id === 'vehicleId') {
        return {
          ...field,
          options: vehicles.map(v => ({ value: v.id, label: `${v.make} ${v.model} (${v.name})` }))
        };
      }
      return field;
    });
  }, [vehicles]);

  const handleAddServiceReminder = () => {
    router.push('/reminders/service/create');
  };

  const handleLearnMore = () => {
    console.log('Navigate to learn more about service reminders');
  };

  const handleEnableForecasting = () => {
    console.log('Enable forecasting');
  };

  const handleReminderClick = (reminderId: string) => {
    router.push(`/reminders/service/${reminderId}`);
  };

  const handleSelectReminder = (reminderId: string) => {
    setSelectedReminders(prev =>
      prev.includes(reminderId)
        ? prev.filter(id => id !== reminderId)
        : [...prev, reminderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedReminders.length === reminders.length) {
      setSelectedReminders([]);
    } else {
      setSelectedReminders(reminders.map(reminder => reminder.id));
    }
  };

  const handleApplyFilters = (criteria: FilterCriterion[]) => {
    setActiveCriteria(criteria);
    setIsFiltersOpen(false);
  };

  const clearFilters = () => {
    setActiveCriteria([]);
    setSearchTerm('');
    setActiveTab('all');
  };

  const getStatusColor = (status: string, isOverdue?: boolean) => {
    if (isOverdue) return 'text-red-600';
    switch (status) {
      case 'ACTIVE': return 'text-green-600';
      case 'DISMISSED': return 'text-gray-500';
      case 'COMPLETED': return 'text-blue-600';
      case 'OVERDUE': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getStatusDot = (status: string, isOverdue?: boolean) => {
    if (isOverdue) return 'bg-red-500';
    switch (status) {
      case 'ACTIVE': return 'bg-green-500';
      case 'DISMISSED': return 'bg-gray-400';
      case 'COMPLETED': return 'bg-blue-500';
      case 'OVERDUE': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const formatNextDue = (reminder: any) => {
    if (!reminder.nextDue) return '—';

    const dueDate = new Date(reminder.nextDue);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `${Math.abs(diffDays)} jours de retard`;
    } else if (diffDays === 0) {
      return 'Aujourd\'hui';
    } else if (diffDays === 1) {
      return 'Demain';
    } else {
      return `Dans ${diffDays} jours`;
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto relative">
      <FiltersSidebar
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        onApply={handleApplyFilters}
        initialFilters={activeCriteria}
        availableFields={populatedFilterFields as any}
      />
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900" data-testid="page-title">Service Reminders</h1>
          {/* <button
            onClick={handleLearnMore}
            className="text-gray-500 hover:bg-gray-100 p-1 rounded text-xs bg-gray-50 border border-gray-200 px-2"
          >
            Learn
          </button>
          <button
            onClick={handleEnableForecasting}
            className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm font-medium"
          >
            <Zap size={14} className="text-[#008751] fill-[#008751]" /> Enable Forecasting
          </button> */}
        </div>
        <div className="flex gap-2">
          {/* <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button> */}
          <button
            onClick={handleAddServiceReminder}
            data-testid="add-service-reminder"
            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          >
            <Plus size={20} /> Add Service Reminder
          </button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('all')}
          data-testid="tab-all"
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'all'
            ? 'border-[#008751] text-[#008751]'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('due-soon')}
          data-testid="tab-due-soon"
          className={`px-4 py-2 text-sm font-medium border-transparent text-gray-500 hover:text-gray-700 flex items-center gap-1.5 ${activeTab === 'due-soon' ? 'border-b-2 border-[#008751] text-[#008751]' : ''
            }`}
        >
          <div className="w-2 h-2 rounded-full bg-orange-400"></div> Due Soon
        </button>
        <button
          onClick={() => setActiveTab('overdue')}
          data-testid="tab-overdue"
          className={`px-4 py-2 text-sm font-medium border-transparent text-gray-500 hover:text-gray-700 flex items-center gap-1.5 ${activeTab === 'overdue' ? 'border-b-2 border-[#008751] text-[#008751]' : ''
            }`}
        >
          <div className="w-2 h-2 rounded-full bg-red-500"></div> Overdue
        </button>
        <button
          onClick={() => setActiveTab('snoozed')}
          data-testid="tab-snoozed"
          className={`px-4 py-2 text-sm font-medium border-transparent text-gray-500 hover:text-gray-700 flex items-center gap-1.5 ${activeTab === 'snoozed' ? 'border-b-2 border-[#008751] text-[#008751]' : ''
            }`}
        >
          <div className="w-2 h-2 rounded-full bg-gray-400"></div> Snoozed
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          Erreur: {error}
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search"
            data-testid="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]"
          />
        </div>

        <button
          onClick={() => setIsFiltersOpen(true)}
          className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <Filter size={14} /> Filters
          {activeCriteria.length > 0 && (
            <span className="bg-[#008751] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
              {activeCriteria.length}
            </span>
          )}
        </button>

        {(searchTerm || activeCriteria.length > 0 || activeTab !== 'all') && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <X size={14} /> Clear all
          </button>
        )}

        <div className="flex-1 text-right text-sm text-gray-500" data-testid="pagination-info">
          {pagination && reminders.length > 0 ? `${(pagination.page - 1) * pagination.limit + 1} - ${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total}` : '0 results'}
        </div>
        <div className="flex gap-1">
          <button
            className="p-1 border border-gray-300 rounded text-gray-400 bg-white hover:bg-gray-50 disabled:opacity-50"
            disabled={!pagination?.hasPrev}
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
          >
            <ChevronRight size={16} className="rotate-180" />
          </button>
          <button
            className="p-1 border border-gray-300 rounded text-gray-400 bg-white hover:bg-gray-50 disabled:opacity-50"
            disabled={!pagination?.hasNext}
            onClick={() => setPage(prev => prev + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="bg-white mb-6 p-4 rounded-lg border border-gray-200 grid grid-cols-4 gap-4 text-center divide-x divide-gray-200">
        <div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Overdue Vehicles</div>
          <div className="text-2xl font-bold text-red-600">{reminders.filter(r => r.isOverdue).length}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Due Soon Vehicles</div>
          <div className="text-2xl font-bold text-orange-500">{reminders.filter(r => r.priority === 'SOON' && !r.isOverdue).length}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Snoozed Vehicles</div>
          <div className="text-2xl font-bold text-gray-900">{reminders.filter(r => r.status === 'DISMISSED').length}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Average Compliance</div>
          <div className="text-2xl font-bold text-[#008751]">
            {reminders.length > 0 ? Math.round(reminders.reduce((sum, r) => sum + r.compliance, 0) / reminders.length) : 0}%
            <span className="text-xs text-gray-500 font-normal"> on-time</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008751]"></div>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200" data-testid="reminders-table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-8 px-6 py-3">
                    <input
                      type="checkbox"
                      data-testid="select-all-checkbox"
                      checked={selectedReminders.length === reminders.length && reminders.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]"
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Task</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Due</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incomplete Work Order</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Completed</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compliance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reminders.map((reminder) => (
                  <tr
                    key={reminder.id}
                    data-testid="reminder-row"
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleReminderClick(reminder.id)}
                  >
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        data-testid="reminder-checkbox"
                        checked={selectedReminders.includes(reminder.id)}
                        onChange={() => handleSelectReminder(reminder.id)}
                        className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <img src={`https://source.unsplash.com/random/50x50/?truck&sig=${reminder.id}`} className="w-6 h-6 rounded object-cover" alt="" />
                        <div>
                          <div className="text-sm font-bold text-[#008751] hover:underline">{reminder.vehicle?.name || 'N/A'}</div>
                          <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                            {reminder.vehicle?.make} {reminder.vehicle?.model}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {reminder.title || reminder.task || 'Service non spécifié'}
                      {reminder.description && (
                        <div className="text-xs text-gray-500 font-normal">{reminder.description}</div>
                      )}
                      {reminder.intervalMonths && (
                        <div className="text-xs text-gray-500 font-normal">Tous les {reminder.intervalMonths} mois</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`flex items-center gap-1.5 text-sm font-medium ${getStatusColor(reminder.status, reminder.isOverdue)}`}>
                        <div className={`w-2 h-2 rounded-full ${getStatusDot(reminder.status, reminder.isOverdue)}`}></div>
                        {reminder.status === 'OVERDUE' ? 'Overdue' :
                          reminder.status === 'ACTIVE' ? 'Active' :
                            reminder.status === 'DISMISSED' ? 'Snoozed' :
                              reminder.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className={`font-medium ${reminder.isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                        {formatNextDue(reminder)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(reminder.nextDue)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      —
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#008751]">
                      {formatDate(reminder.lastServiceDate)}
                      {reminder.lastServiceMeter && (
                        <div className="text-xs text-gray-500">{reminder.lastServiceMeter.toLocaleString()} mi</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reminder.compliance}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {reminders.length === 0 && (
              <div className="text-center py-12 text-gray-500 bg-white">
                <Filter className="mx-auto mb-4 opacity-20" size={48} />
                <p className="text-lg font-medium">Aucun rappel de service trouvé</p>
                <p className="text-sm">Essayez de modifier vos filtres ou effectuez une nouvelle recherche.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-[#008751] font-medium hover:underline"
                >
                  Effacer tous les filtres
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}