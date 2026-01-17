'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useVehicleRenewals } from '@/lib/hooks/useVehicleRenewals';
import { FiltersSidebar } from '../../inspections/components/filters/FiltersSidebar';
import { FilterCriterion } from '../../inspections/components/filters/FilterCard';
import { VEHICLE_RENEWAL_FILTER_FIELDS } from './components/filters/vehicle-renewal-filter-definitions';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { useToast, ToastContainer } from '@/components/NotificationToast';

export default function VehicleRenewalsPage() {
  const router = useRouter();
  const { toast, toasts, removeToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRenewals, setSelectedRenewals] = useState<string[]>([]);
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
      case 'due-soon':
        baseOptions.dueSoon = true;
        break;
    }

    // Appliquer les critères de filtres avancés
    activeCriteria.forEach(c => {
      const value = Array.isArray(c.value) ? c.value[0] : c.value;
      if (c.field === 'title') {
        baseOptions.search = value;
      } else {
        baseOptions[c.field] = value;
      }
    });

    return baseOptions;
  }, [activeTab, searchTerm, activeCriteria, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, activeTab, activeCriteria]);

  const { renewals, loading, error, pagination } = useVehicleRenewals(options);

  // Populate dynamic options for filter fields
  const populatedFilterFields = useMemo(() => {
    return VEHICLE_RENEWAL_FILTER_FIELDS.map(field => {
      if (field.id === 'vehicleId') {
        return {
          ...field,
          options: vehicles.map(v => ({ value: v.id, label: `${v.make} ${v.model} (${v.name})` }))
        };
      }
      return field;
    });
  }, [vehicles]);

  const getStatusColor = (status: string, isOverdue?: boolean) => {
    if (isOverdue) return 'text-red-600';
    switch (status) {
      case 'DUE': return 'text-orange-500';
      case 'COMPLETED': return 'text-green-600';
      case 'OVERDUE': return 'text-red-600';
      case 'DISMISSED': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusDot = (status: string, isOverdue?: boolean) => {
    if (isOverdue) return 'bg-red-500';
    switch (status) {
      case 'DUE': return 'bg-orange-500';
      case 'COMPLETED': return 'bg-green-500';
      case 'OVERDUE': return 'bg-red-500';
      case 'DISMISSED': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const formatDueDate = (renewal: any) => {
    if (!renewal.dueDate) return '—';

    const dueDate = new Date(renewal.dueDate);
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

  const getTypeLabel = (type: string) => {
    const typeLabels: { [key: string]: string } = {
      'REGISTRATION': 'Immatriculation',
      'INSURANCE': 'Assurance',
      'INSPECTION': 'Contrôle technique',
      'EMISSION_TEST': 'Test d\'émission',
      'OTHER': 'Autre'
    };
    return typeLabels[type] || type;
  };

  const handleAddVehicleRenewal = () => {
    router.push('/reminders/vehicle-renewals/create');
  };

  const handleApplyFilters = (criteria: FilterCriterion[]) => {
    setActiveCriteria(criteria);
    setIsFiltersOpen(false);
  };

  const clearFilters = () => {
    setActiveCriteria([]);
    setSearchTerm('');
    setActiveTab('all');
    setPage(1);
  };

  const handleRenewalClick = (renewalId: string) => {
    router.push(`/reminders/vehicle-renewals/${renewalId}`);
  };

  const handleSelectRenewal = (renewalId: string) => {
    setSelectedRenewals(prev =>
      prev.includes(renewalId)
        ? prev.filter(id => id !== renewalId)
        : [...prev, renewalId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRenewals.length === renewals.length) {
      setSelectedRenewals([]);
    } else {
      setSelectedRenewals(renewals.map(renewal => renewal.id));
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
          <h1 className="text-3xl font-bold text-gray-900" data-testid="page-title">Vehicle Renewal Reminders</h1>
        </div>
        <div className="flex gap-2">
          {/* <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button> */}
          <button
            onClick={handleAddVehicleRenewal}
            data-testid="add-vehicle-renewal"
            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          >
            <Plus size={20} /> Add Vehicle Renewal Reminder
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
          {pagination && renewals.length > 0 ? `${(pagination.page - 1) * pagination.limit + 1} - ${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total}` : '0 results'}
        </div>
        <div className="flex gap-1">
          <button
            className="p-1 border border-gray-300 rounded text-gray-400 bg-white hover:bg-gray-50 disabled:opacity-50"
            disabled={!pagination?.hasPrev}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            <ChevronRight size={16} className="rotate-180" />
          </button>
          <button
            className="p-1 border border-gray-300 rounded text-gray-400 bg-white hover:bg-gray-50 disabled:opacity-50"
            disabled={!pagination?.hasNext}
            onClick={() => setPage(p => p + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008751]"></div>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200" data-testid="renewals-table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-8 px-6 py-3">
                    <input
                      type="checkbox"
                      data-testid="select-all-checkbox"
                      checked={selectedRenewals.length === renewals.length && renewals.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]"
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renewal Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Watchers</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {renewals.map((renewal) => (
                  <tr
                    key={renewal.id}
                    data-testid="renewal-row"
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleRenewalClick(renewal.id)}
                  >
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        data-testid="renewal-checkbox"
                        checked={selectedRenewals.includes(renewal.id)}
                        onChange={() => handleSelectRenewal(renewal.id)}
                        className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {renewal.vehicle?.image ? (
                          <img src={renewal.vehicle.image} className="w-6 h-6 rounded object-cover" alt="" />
                        ) : (
                          <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-[10px] text-gray-500">
                            {renewal.vehicle?.name?.substring(0, 1) || 'V'}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-bold text-[#008751] hover:underline">{renewal.vehicle?.name || 'N/A'}</div>
                          <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                            {renewal.vehicle?.make} {renewal.vehicle?.model}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {renewal.title || getTypeLabel(renewal.type)}
                      {renewal.description && (
                        <div className="text-xs text-gray-500 font-normal">{renewal.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`flex items-center gap-1.5 text-sm font-medium ${getStatusColor(renewal.status, renewal.isOverdue)}`}>
                        <div className={`w-2 h-2 rounded-full ${getStatusDot(renewal.status, renewal.isOverdue)}`}></div>
                        {renewal.status === 'OVERDUE' ? 'Overdue' :
                          renewal.status === 'DUE' ? 'Due Soon' :
                            renewal.status === 'COMPLETED' ? 'Completed' :
                              renewal.status === 'DISMISSED' ? 'Dismissed' :
                                renewal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className={`font-medium ${renewal.isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                        {formatDueDate(renewal)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(renewal.dueDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {renewal.watchers?.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white">
                            {renewal.watchers.length}
                          </div>
                          <span className="text-xs text-gray-500">watchers</span>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {renewals.length === 0 && (
              <div className="text-center py-12 text-gray-500 bg-white">
                <Filter className="mx-auto mb-4 opacity-20" size={48} />
                <p className="text-lg font-medium">Aucun renouvellement trouvé</p>
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