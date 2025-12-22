'use client';

import React, { useState } from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, AlertCircle, Clock, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useServiceEntries } from '@/lib/hooks/useServiceEntries';
import { ServiceEntry } from '@/lib/services/service-api';

export default function ServiceHistoryPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    status: '',
    vehicleId: '',
    dateFrom: '',
    dateTo: ''
  });

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
    status: filters.status || undefined,
    vehicleId: filters.vehicleId || undefined,
    startDate: filters.dateFrom || undefined,
    endDate: filters.dateTo || undefined,
    isWorkOrder: false // Historique = pas work orders
  });

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
    // Note: La recherche par texte sera implémentée côté backend
    fetchEntries({});
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    fetchEntries(newFilters);
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
      SCHEDULED: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      IN_PROGRESS: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      COMPLETED: { color: 'bg-green-100 text-green-800', icon: TrendingUp },
      CANCELLED: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.SCHEDULED;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${config.color}`}>
        <IconComponent className="w-3 h-3" />
        {status === 'SCHEDULED' && 'Programmé'}
        {status === 'IN_PROGRESS' && 'En cours'}
        {status === 'COMPLETED' && 'Terminé'}
        {status === 'CANCELLED' && 'Annulé'}
      </span>
    );
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;

    const priorityConfig = {
      LOW: { color: 'bg-gray-100 text-gray-800' },
      MEDIUM: { color: 'bg-blue-100 text-blue-800' },
      HIGH: { color: 'bg-orange-100 text-orange-800' },
      CRITICAL: { color: 'bg-red-100 text-red-800' }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig];
    if (!config) return null;

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${config.color}`}>
        {priority === 'LOW' && 'Faible'}
        {priority === 'MEDIUM' && 'Moyen'}
        {priority === 'HIGH' && 'Élevé'}
        {priority === 'CRITICAL' && 'Critique'}
      </span>
    );
  };

  // Calculs automatiques
  const totalEntries = entries.length;
  const completedEntries = entries.filter(e => e.status === 'COMPLETED').length;
  const inProgressEntries = entries.filter(e => e.status === 'IN_PROGRESS').length;
  const scheduledEntries = entries.filter(e => e.status === 'SCHEDULED').length;
  const totalCost = entries.reduce((sum, entry) => sum + (entry.totalCost || 0), 0);
  const avgCost = totalEntries > 0 ? totalCost / totalEntries : 0;

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 data-testid="page-title" className="text-3xl font-bold text-gray-900">Service History</h1>
          <button className="text-gray-500 hover:bg-gray-100 p-1 rounded text-xs bg-gray-50 border border-gray-200 px-2">Learn</button>
        </div>
        <div className="flex gap-2">
          <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button>
          <button
            onClick={handleAddServiceEntry}
            data-testid="add-entry-button"
            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          >
            <Plus size={20} /> Add Service Entry
          </button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-6">
        <button className="px-4 py-2 text-sm font-medium border-b-2 border-[#008751] text-[#008751]">All</button>
        <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <Plus size={14} /> Add Tab
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            data-testid="search-input"
            className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]"
          />
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            Vehicle <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
          </button>
          <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            Vehicle Group <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
          </button>
          <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            <Filter size={14} /> Filters
          </button>
        </div>
        <div className="flex-1 text-right text-sm text-gray-500">
          {pagination ? `${((pagination.page - 1) * pagination.limit) + 1} - ${Math.min(pagination.page * pagination.limit, pagination.total)} sur ${pagination.total}` : '0 - 0 sur 0'}
        </div>
        <div className="flex gap-1">
          <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} className="rotate-180" /></button>
          <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8 px-6 py-3">
                <input
                  type="checkbox"
                  checked={selectedEntries.length === entries.length && entries.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]"
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priorité</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compteur</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tâches</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fournisseur</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coût Total</th>
            </tr>
          </thead>
          {/* Statistiques */}
          <div className="bg-gray-50 p-4 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{totalEntries}</div>
                <div className="text-sm text-gray-600">Total Entrées</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completedEntries}</div>
                <div className="text-sm text-gray-600">Terminées</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{inProgressEntries}</div>
                <div className="text-sm text-gray-600">En cours</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{scheduledEntries}</div>
                <div className="text-sm text-gray-600">Programmées</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalCost)}</div>
                <div className="text-sm text-gray-600">Coût Total</div>
              </div>
            </div>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 border-b border-red-200 p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          <tbody className="bg-white divide-y divide-gray-200">
            {entries.length === 0 && !loading ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <Calendar className="w-12 h-12 text-gray-400" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune entrée de service</h3>
                      <p className="text-gray-600 mb-4">Commencez par créer votre première entrée de service.</p>
                      <button
                        onClick={handleAddServiceEntry}
                        className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2 mx-auto"
                      >
                        <Plus size={20} /> Créer une entrée
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
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
                    {entry.vendor || '—'}
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
      </div>
    </div>
  );
}