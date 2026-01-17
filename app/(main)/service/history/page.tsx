'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, AlertCircle, Clock, DollarSign, TrendingUp, Calendar, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useServiceEntries } from '@/lib/hooks/useServiceEntries';
import { ServiceEntry, ServiceEntriesQuery } from '@/lib/services/service-api';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { useContacts } from '@/lib/hooks/useContacts';
import { useToast, ToastContainer } from '@/components/NotificationToast';
import { FiltersSidebar } from '../../inspections/components/filters/FiltersSidebar';
import { FilterCriterion } from '../../inspections/components/filters/FilterCard';
import { SERVICE_ENTRY_FILTER_FIELDS } from './components/filters/service-entry-filter-definitions';

export default function ServiceHistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast, toasts, removeToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ServiceEntriesQuery>({
    status: searchParams.get('status') as any || undefined,
    vehicleId: searchParams.get('vehicleId') || undefined,
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
  });

  // Advanced Filters State
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeCriteria, setActiveCriteria] = useState<FilterCriterion[]>([]);

  // Fetch vehicles for filter dropdown
  const { vehicles } = useVehicles();

  // Fetch contacts/vendors for filter dropdown
  const { contacts } = useContacts({ limit: 1000 });

  // Hook pour les entrées de service
  const {
    entries,
    loading,
    error,
    pagination,
    fetchEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    completeEntry,
    refresh
  } = useServiceEntries({
    page,
    limit: 20,
    status: filters.status || undefined,
    vehicleId: filters.vehicleId || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    isWorkOrder: false // Historique = pas work orders
  });

  // Populate dynamic options for filter fields
  const populatedFilterFields = useMemo(() => {
    return SERVICE_ENTRY_FILTER_FIELDS.map(field => {
      if (field.id === 'vehicleId') {
        return {
          ...field,
          options: vehicles.map(v => ({ value: v.id, label: `${v.make} ${v.model} (${v.name})` }))
        };
      }
      if (field.id === 'vendorId') {
        return {
          ...field,
          options: contacts.map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }))
        };
      }
      return field;
    });
  }, [vehicles, contacts]);

  const handleAddServiceEntry = () => {
    router.push('/service/history/create');
  };

  const handleEntryClick = (entryId: string) => {
    router.push(`/service/history/${entryId}`);
  };

  const handleSelectEntry = (entryId: string) => {
    setSelectedEntries(prev =>
      prev.includes(entryId)
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEntries.length === entries.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(entries.map(entry => entry.id));
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // La recherche se fait localement pour l'instant
    // En production, on pourrait ajouter un paramètre search à l'API
  };

  const handleFilterChange = (newFilters: Partial<ServiceEntriesQuery>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setPage(1); // Reset to first page when filters change
    fetchEntries(updatedFilters);

    // Mettre à jour l'URL pour refléter les filtres
    const params = new URLSearchParams();
    if (updatedFilters.status) params.set('status', updatedFilters.status);
    if (updatedFilters.vehicleId) params.set('vehicleId', updatedFilters.vehicleId);
    if (updatedFilters.startDate) params.set('startDate', updatedFilters.startDate);
    if (updatedFilters.endDate) params.set('endDate', updatedFilters.endDate);

    router.replace(`/service/history?${params.toString()}`);
  };

  const handleApplyFilters = (criteria: FilterCriterion[]) => {
    setActiveCriteria(criteria);
    setIsFiltersOpen(false);

    // On part d'un état "clean" pour les filtres avancés mais on garde le status actuel
    const newFilters: Partial<ServiceEntriesQuery> = {
      status: filters.status,
      vehicleId: undefined,
      startDate: undefined,
      endDate: undefined
    };

    criteria.forEach(c => {
      const value = Array.isArray(c.value) ? c.value[0] : c.value;

      if (c.field === 'date') {
        // Si c'est un filter range (between)
        if (c.operator === 'between' && typeof c.value === 'object') {
          newFilters.startDate = c.value.from;
          newFilters.endDate = c.value.to;
        } else {
          newFilters.startDate = value;
          newFilters.endDate = value;
        }
      } else {
        // @ts-ignore
        newFilters[c.field] = value;
      }
    });

    handleFilterChange(newFilters);
  };

  const clearFilters = () => {
    setActiveCriteria([]);
    setSearchTerm('');
    handleFilterChange({
      status: undefined,
      vehicleId: undefined,
      startDate: undefined,
      endDate: undefined
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (pagination && newPage > pagination.totalPages)) return;
    setPage(newPage);
    fetchEntries({ ...filters, page: newPage });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      SCHEDULED: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Programmé' },
      IN_PROGRESS: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'En cours' },
      COMPLETED: { color: 'bg-green-100 text-green-800', icon: TrendingUp, label: 'Terminé' },
      CANCELLED: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Annulé' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.SCHEDULED;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${config.color}`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;

    const priorityConfig = {
      LOW: { color: 'bg-gray-100 text-gray-800', label: 'Faible' },
      MEDIUM: { color: 'bg-blue-100 text-blue-800', label: 'Moyen' },
      HIGH: { color: 'bg-orange-100 text-orange-800', label: 'Élevé' },
      CRITICAL: { color: 'bg-red-100 text-red-800', label: 'Critique' }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig];
    if (!config) return null;

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Filter entries by search term (client-side)
  const filteredEntries = useMemo(() => {
    if (!searchTerm) return entries;
    const term = searchTerm.toLowerCase();
    return entries.filter(entry => {
      const vendorName = typeof entry.vendor === 'string' ? entry.vendor : entry.vendor?.name;
      return (
        entry.vehicle?.name?.toLowerCase().includes(term) ||
        entry.vehicle?.make?.toLowerCase().includes(term) ||
        entry.vehicle?.model?.toLowerCase().includes(term) ||
        vendorName?.toLowerCase().includes(term) ||
        entry.notes?.toLowerCase().includes(term)
      );
    });
  }, [entries, searchTerm]);

  // Calculs automatiques
  const totalEntries = pagination?.total || entries.length;
  const completedEntries = entries.filter(e => e.status === 'COMPLETED').length;
  const inProgressEntries = entries.filter(e => e.status === 'IN_PROGRESS').length;
  const scheduledEntries = entries.filter(e => e.status === 'SCHEDULED').length;
  const totalCost = entries.reduce((sum, entry) => sum + (entry.totalCost || 0), 0);

  // Check if any filters are active
  const hasActiveFilters = filters.status || filters.vehicleId || filters.startDate || filters.endDate || activeCriteria.length > 0;

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
          <h1 data-testid="page-title" className="text-3xl font-bold text-gray-900">Historique de Service</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAddServiceEntry}
            data-testid="add-entry-button"
            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          >
            <Plus size={20} /> Nouvelle Entrée
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 mb-6 font-medium text-sm">
        <button
          className={`pb-3 border-b-2 ${!filters.status ? 'border-[#008751] text-[#008751] font-bold' : 'border-transparent hover:text-gray-700 text-gray-500'}`}
          onClick={() => handleFilterChange({ status: undefined })}
        >
          Tous
        </button>
        <button
          className={`pb-3 border-b-2 ${filters.status === 'SCHEDULED' ? 'border-[#008751] text-[#008751] font-bold' : 'border-transparent hover:text-gray-700 text-gray-500'}`}
          onClick={() => handleFilterChange({ status: 'SCHEDULED' })}
        >
          Programmées
        </button>
        <button
          className={`pb-3 border-b-2 ${filters.status === 'IN_PROGRESS' ? 'border-[#008751] text-[#008751] font-bold' : 'border-transparent hover:text-gray-700 text-gray-500'}`}
          onClick={() => handleFilterChange({ status: 'IN_PROGRESS' })}
        >
          En cours
        </button>
        <button
          className={`pb-3 border-b-2 ${filters.status === 'COMPLETED' ? 'border-[#008751] text-[#008751] font-bold' : 'border-transparent hover:text-gray-700 text-gray-500'}`}
          onClick={() => handleFilterChange({ status: 'COMPLETED' })}
        >
          Terminées
        </button>
        <button
          className={`pb-3 border-b-2 ${filters.status === 'CANCELLED' ? 'border-[#008751] text-[#008751] font-bold' : 'border-transparent hover:text-gray-700 text-gray-500'}`}
          onClick={() => handleFilterChange({ status: 'CANCELLED' })}
        >
          Annulées
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center" data-testid="service-history-filters">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            data-testid="search-input"
            className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]"
          />
        </div>

        <select
          className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 outline-none"
          value={filters.vehicleId || ''}
          onChange={(e) => handleFilterChange({ vehicleId: e.target.value || undefined })}
        >
          <option value="">Véhicule: Tous</option>
          {vehicles.map(v => (
            <option key={v.id} value={v.id}>{v.name} - {v.make} {v.model}</option>
          ))}
        </select>

        <button
          onClick={() => setIsFiltersOpen(true)}
          data-testid="filter-filters-button"
          className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <Filter size={14} /> Filtres
          {activeCriteria.length > 0 && (
            <span className="bg-[#008751] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
              {activeCriteria.length}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-4"
          >
            Effacer
          </button>
        )}

        <div className="flex-1 text-right text-sm text-gray-500">
          {pagination ? `${((pagination.page - 1) * pagination.limit) + 1} - ${Math.min(pagination.page * pagination.limit, pagination.total)} sur ${pagination.total}` : '0 - 0 sur 0'}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={!pagination?.hasPrev}
            className={`p-1 border border-gray-300 rounded bg-white ${pagination?.hasPrev ? 'text-gray-600 hover:bg-gray-50' : 'text-gray-300 cursor-not-allowed'}`}
          >
            <ChevronRight size={16} className="rotate-180" />
          </button>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={!pagination?.hasNext}
            className={`p-1 border border-gray-300 rounded bg-white ${pagination?.hasNext ? 'text-gray-600 hover:bg-gray-50' : 'text-gray-300 cursor-not-allowed'}`}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div data-testid="history-stats-row" className="bg-white p-4 border border-gray-200 rounded-lg mb-6 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center" data-testid="stat-total-entries">
            <div className="text-2xl font-bold text-gray-900">{totalEntries}</div>
            <div className="text-sm text-gray-600">Total Entrées</div>
          </div>
          <div className="text-center" data-testid="stat-completed-entries">
            <div className="text-2xl font-bold text-green-600">{completedEntries}</div>
            <div className="text-sm text-gray-600">Terminées</div>
          </div>
          <div className="text-center" data-testid="stat-in-progress-entries">
            <div className="text-2xl font-bold text-yellow-600">{inProgressEntries}</div>
            <div className="text-sm text-gray-600">En cours</div>
          </div>
          <div className="text-center" data-testid="stat-scheduled-entries">
            <div className="text-2xl font-bold text-blue-600">{scheduledEntries}</div>
            <div className="text-sm text-gray-600">Programmées</div>
          </div>
          <div className="text-center" data-testid="stat-total-cost">
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalCost)}</div>
            <div className="text-sm text-gray-600">Coût Total</div>
          </div>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 mb-4 rounded-lg flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8 px-6 py-3">
                <input
                  type="checkbox"
                  checked={selectedEntries.length === filteredEntries.length && filteredEntries.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]"
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Véhicule</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priorité</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compteur</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tâches</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fournisseur</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coût Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">

            {filteredEntries.length === 0 && !loading ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <Calendar className="w-12 h-12 text-gray-400" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune entrée de service</h3>
                      <p className="text-gray-600 mb-4">
                        {hasActiveFilters
                          ? "Aucun résultat ne correspond à vos critères de recherche."
                          : "Commencez par créer votre première entrée de service."}
                      </p>
                      {hasActiveFilters ? (
                        <button
                          onClick={clearFilters}
                          className="text-[#008751] hover:text-[#007043] font-medium underline underline-offset-4"
                        >
                          Effacer tous les filtres
                        </button>
                      ) : (
                        <button
                          onClick={handleAddServiceEntry}
                          className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2 mx-auto"
                        >
                          <Plus size={20} /> Créer une entrée
                        </button>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry) => (
                <tr
                  key={entry.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleEntryClick(entry.id)}
                >
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedEntries.includes(entry.id)}
                      onChange={() => handleSelectEntry(entry.id)}
                      className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {(entry.vehicle?.name || 'V').substring(0, 1)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#008751] hover:underline">
                          {entry.vehicle?.name || `Véhicule ${entry.vehicleId}`}
                        </div>
                        <span className="text-xs text-gray-500">
                          {entry.vehicle?.make} {entry.vehicle?.model}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(entry.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(entry.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPriorityBadge(entry.priority)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.meter ? `${entry.meter.toLocaleString()} km` : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs">
                      {entry.tasks && entry.tasks.length > 0 ? (
                        <ul className="list-none space-y-1">
                          {entry.tasks.slice(0, 2).map((taskEntry, i) => (
                            <li key={i} className="text-xs truncate">
                              {taskEntry.serviceTask?.name || 'Tâche inconnue'}
                            </li>
                          ))}
                          {entry.tasks.length > 2 && (
                            <li className="text-gray-500 text-xs">+{entry.tasks.length - 2} autres</li>
                          )}
                        </ul>
                      ) : (
                        <span className="text-gray-500 text-xs">Aucune tâche</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof entry.vendor === 'string' ? entry.vendor : entry.vendor?.name || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {formatCurrency(entry.totalCost || 0)}
                  </td>
                </tr>
              ))
            )}

            {/* Indicateur de chargement */}
            {loading && (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#008751]"></div>
                    <span className="text-gray-600">Chargement des entrées...</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div >
    </div >
  );
}