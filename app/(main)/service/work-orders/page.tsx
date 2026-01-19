'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ChevronRight, Plus, Search, Filter, Wrench, AlertTriangle, CheckCircle2, Clock, XCircle, FileText, Download } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useServiceWorkOrders } from '@/lib/hooks/useServiceWorkOrders';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { useContacts } from '@/lib/hooks/useContacts';
import { serviceAPI } from '@/lib/services/service-api';
import { useToast, ToastContainer } from '@/components/NotificationToast';
import { FiltersSidebar } from '../../inspections/components/filters/FiltersSidebar';
import { FilterCriterion } from '../../inspections/components/filters/FilterCard';
import { WORK_ORDER_FILTER_FIELDS } from './components/filters/work-order-filter-definitions';
import { VehicleSelect } from '@/app/(main)/vehicles/components/VehicleSelect';
import { ContactSelect } from '@/app/(main)/contacts/components/ContactSelect';

export default function WorkOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast, toasts, removeToast } = useToast();

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeCriteria, setActiveCriteria] = useState<FilterCriterion[]>([]);

  // Hooks for data
  const { vehicles, error: vehiclesError } = useVehicles({ query: { limit: '500', page: '1', sortBy: 'name', sortOrder: 'asc' } as any });
  const { contacts } = useContacts({ limit: 1000 });

  // Current filters from URL
  const currentStatus = searchParams.get('status') || undefined;
  const currentPage = parseInt(searchParams.get('page') || '1');
  const currentLimit = 20;

  const {
    workOrders,
    loading,
    error,
    pagination,
    fetchWorkOrders,
    exportWorkOrders,
    statusCounts,
    refresh
  } = useServiceWorkOrders({
    page: currentPage,
    limit: currentLimit,
    status: currentStatus as any,
    search: searchParams.get('search') || undefined,
    priority: searchParams.get('priority') as any,
    assignedTo: searchParams.get('assignedTo') || undefined,
    vehicleId: searchParams.get('vehicleId') || undefined,
  });

  // Populate dynamic options for filter fields
  const populatedFilterFields = useMemo(() => {
    return WORK_ORDER_FILTER_FIELDS.map(field => {
      if (field.id === 'assignedTo') {
        return {
          ...field,
          options: contacts.map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }))
        };
      }
      if (field.id === 'vehicleId') {
        return {
          ...field,
          options: vehicles.map(v => ({ value: v.id, label: `${v.name} (${v.make} ${v.model})` }))
        };
      }
      return field;
    });
  }, [contacts, vehicles]);

  const handleAddWorkOrder = () => {
    router.push('/service/work-orders/create');
  };

  const handleWorkOrderClick = (id: string) => {
    router.push(`/service/work-orders/${id}`);
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === workOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(workOrders.map(order => order.id));
    }
  };

  const handleSelectOrder = (id: string) => {
    setSelectedOrders(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const updateURL = (newFilters: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    // Reset to page 1 on filter change if not page param
    if (!newFilters.page) params.set('page', '1');
    router.replace(`/service/work-orders?${params.toString()}`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    updateURL({ search: query || undefined });
  };

  const handleStatusChange = (status: string | undefined) => {
    updateURL({ status });
  };

  const handleApplyFilters = (criteria: FilterCriterion[]) => {
    setActiveCriteria(criteria);
    setIsFiltersOpen(false);

    const newFilters: Record<string, string | undefined> = {};
    criteria.forEach(c => {
      const value = Array.isArray(c.value) ? c.value[0] : c.value;
      newFilters[c.field] = value;
    });

    updateURL(newFilters);
  };

  const clearFilters = () => {
    setActiveCriteria([]);
    setSearchQuery('');
    router.replace('/service/work-orders');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getPriorityIndicator = (priority?: string) => {
    switch (priority) {
      case 'CRITICAL': return <div className="w-1.5 h-1.5 rounded-full bg-red-600" title="Critique" />;
      case 'HIGH': return <div className="w-1.5 h-1.5 rounded-full bg-orange-600" title="Élevé" />;
      case 'MEDIUM': return <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" title="Moyen" />;
      case 'LOW': return <div className="w-1.5 h-1.5 rounded-full bg-blue-400" title="Faible" />;
      default: return <div className="w-1.5 h-1.5 rounded-full bg-gray-300" title="Inconnue" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      SCHEDULED: { color: 'bg-blue-100 text-blue-800', label: 'PROGRAMMÉ' },
      IN_PROGRESS: { color: 'bg-yellow-100 text-yellow-800', label: 'EN COURS' },
      COMPLETED: { color: 'bg-green-100 text-green-800', label: 'TERMINÉ' },
      CANCELLED: { color: 'bg-gray-100 text-gray-800', label: 'ANNULÉ' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'bg-gray-100 text-gray-800', label: status };
    return (
      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <FiltersSidebar
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        onApply={handleApplyFilters}
        initialFilters={activeCriteria}
        availableFields={populatedFilterFields as any}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* ZONE 1: HEADER */}
      <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Ordres de travail</h1>
        <div className="flex items-center gap-3">
          {/* <button
            onClick={() => exportWorkOrders()}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
            title="Exporter"
          >
            <Download size={20} />
          </button> */}
          <button
            onClick={handleAddWorkOrder}
            className="flex items-center gap-2 bg-[#008751] hover:bg-[#007043] text-white px-4 py-2 rounded-md font-bold transition-colors"
          >
            <Plus size={20} /> Nouvel Ordre
          </button>
        </div>
      </div>

      {/* ZONE 2: NAVIGATION TABS */}
      <div className="flex px-6 bg-white border-b border-gray-200">
        <button
          onClick={() => handleStatusChange(undefined)}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${!currentStatus ? 'border-[#008751] text-[#008751]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <span>Tous</span>
          {statusCounts?.ALL !== undefined && (
            <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${!currentStatus ? 'bg-[#008751] text-white' : 'bg-gray-100 text-gray-500'}`}>
              {statusCounts.ALL}
            </span>
          )}
        </button>
        <button
          onClick={() => handleStatusChange('SCHEDULED')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${currentStatus === 'SCHEDULED' ? 'border-[#008751] text-[#008751]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <span>Programmé</span>
          {statusCounts?.SCHEDULED !== undefined && (
            <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${currentStatus === 'SCHEDULED' ? 'bg-[#008751] text-white' : 'bg-gray-100 text-gray-500'}`}>
              {statusCounts.SCHEDULED}
            </span>
          )}
        </button>
        <button
          onClick={() => handleStatusChange('IN_PROGRESS')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${currentStatus === 'IN_PROGRESS' ? 'border-[#008751] text-[#008751]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <span>En cours</span>
          {statusCounts?.IN_PROGRESS !== undefined && (
            <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${currentStatus === 'IN_PROGRESS' ? 'bg-[#008751] text-white' : 'bg-gray-100 text-gray-500'}`}>
              {statusCounts.IN_PROGRESS}
            </span>
          )}
        </button>
        <button
          onClick={() => handleStatusChange('COMPLETED')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${currentStatus === 'COMPLETED' ? 'border-[#008751] text-[#008751]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <span>Terminé</span>
          {statusCounts?.COMPLETED !== undefined && (
            <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${currentStatus === 'COMPLETED' ? 'bg-[#008751] text-white' : 'bg-gray-100 text-gray-500'}`}>
              {statusCounts.COMPLETED}
            </span>
          )}
        </button>
        <button
          onClick={() => handleStatusChange('CANCELLED')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${currentStatus === 'CANCELLED' ? 'border-[#008751] text-[#008751]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <span>Annulé</span>
          {statusCounts?.CANCELLED !== undefined && (
            <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${currentStatus === 'CANCELLED' ? 'bg-[#008751] text-white' : 'bg-gray-100 text-gray-500'}`}>
              {statusCounts.CANCELLED}
            </span>
          )}
        </button>
      </div>

      {/* ZONE 3: FILTERS BAR */}
      <div className="flex items-center gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher des ordres de travail..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-[#008751] focus:border-[#008751] outline-none"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="w-[200px]">
          <ContactSelect
            contacts={contacts}
            selectedContactId={searchParams.get('assignedTo') || undefined}
            onSelect={(id) => updateURL({ assignedTo: id })}
            loading={loading && contacts.length === 0}
            placeholder="Assigné à"
            className="!py-0"
          />
        </div>

        <div className="w-[200px]">
          <VehicleSelect
            vehicles={vehicles as any[]}
            selectedVehicleId={searchParams.get('vehicleId') || undefined}
            onSelect={(id) => updateURL({ vehicleId: id })}
            loading={loading && vehicles.length === 0}
            error={vehiclesError}
            className="!py-0"
          />
        </div>

        <button
          onClick={() => setIsFiltersOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shrink-0"
        >
          <Filter size={16} />
          Filtres
          {activeCriteria.length > 0 && (
            <span className="flex items-center justify-center w-5 h-5 ml-1 text-xs text-white bg-[#008751] rounded-full">
              {activeCriteria.length}
            </span>
          )}
        </button>

        {(searchQuery || activeCriteria.length > 0 || searchParams.get('assignedTo') || searchParams.get('vehicleId')) && (
          <button
            onClick={clearFilters}
            className="text-sm font-medium text-[#008751] hover:underline"
          >
            Vider les filtres
          </button>
        )}
      </div>

      {/* ZONE 4: DATA TABLE */}
      <div className="flex-1 overflow-auto bg-white">
        {loading && workOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-[#008751] rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Chargement des ordres de travail...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 px-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Erreur lors du chargement</h3>
              <p className="text-gray-500 max-w-md mt-1">{error}</p>
            </div>
            <button
              onClick={() => refresh()}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : workOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
              <FileText size={40} />
            </div>
            <div className="text-center px-6">
              <h3 className="text-xl font-bold text-gray-900">Aucun ordre de travail</h3>
              <p className="text-gray-500 mt-2 max-w-md">Nous n'avons trouvé aucun ordre de travail correspondant à vos critères.</p>
            </div>
            {(searchQuery || activeCriteria.length > 0 || currentStatus) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-[#008751] font-bold hover:underline"
              >
                Effacer tous les filtres
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200 shadow-sm">
              <tr>
                <th className="w-12 px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === workOrders.length && workOrders.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]"
                  />
                </th>
                <th className="w-4 px-2 py-4"></th>
                <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Réf.</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Véhicule</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tâches</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Coût</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="w-10 px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {workOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => handleWorkOrderClick(order.id)}
                  className="group hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleSelectOrder(order.id)}
                      className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]"
                    />
                  </td>
                  <td className="px-2 py-4">
                    {getPriorityIndicator(order.priority)}
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-medium text-gray-900">#{order.id.slice(-6).toUpperCase()}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center text-gray-500 font-bold shrink-0">
                        {order.vehicle?.name ? order.vehicle.name.charAt(0).toUpperCase() : 'V'}
                      </div>
                      <div className="flex flex-col overflow-hidden max-w-[180px]">
                        <span className="text-sm font-bold text-[#008751] group-hover:underline truncate">
                          {order.vehicle?.name || 'Inconnu'}
                        </span>
                        <span className="text-xs text-gray-500 truncate">
                          {order.vehicle?.make} {order.vehicle?.model}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col truncate max-w-[200px]">
                      {order.tasks && order.tasks.length > 0 ? (
                        <>
                          <span className="text-sm text-gray-900 truncate">
                            {order.tasks[0].serviceTask?.name || 'Tâche'}
                          </span>
                          {order.tasks.length > 1 && (
                            <span className="text-[10px] text-gray-400 font-medium">
                              +{order.tasks.length - 1} autres tâches
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(order.totalCost || 0)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-900">{formatDate(order.date)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ChevronRight className="inline-block text-gray-300 group-hover:text-gray-600 transition-colors" size={20} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Affichage de <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> à <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> sur <span className="font-medium">{pagination.total}</span> résultats
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={!pagination.hasPrev}
              onClick={() => updateURL({ page: (pagination.page - 1).toString() })}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <button
              disabled={!pagination.hasNext}
              onClick={() => updateURL({ page: (pagination.page + 1).toString() })}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}