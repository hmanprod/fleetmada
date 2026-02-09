'use client';

import React from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, ChevronDown, Loader2, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFuelEntries } from '@/lib/hooks/useFuelEntries';
import { FuelEntryFilters } from '@/types/fuel';

export default function FuelHistoryPage() {
  const router = useRouter();
  const [filters, setFilters] = React.useState<FuelEntryFilters>({});
  const [searchQuery, setSearchQuery] = React.useState('');

  const { entries, loading, error, pagination, updateFilters, changePage, refresh } = useFuelEntries(filters);

  const handleAdd = () => {
    router.push('/fuel/history/create');
  };

  const handleSelect = (entry: any) => {
    router.push(`/fuel/history/${entry.id}`);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    updateFilters({ ...filters, search: value });
  };

  const handleRefresh = () => {
    refresh();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MGA'
    }).format(amount);
  };

  const formatVolume = (volume: number) => {
    return `${volume.toFixed(2)} L`;
  };

  // Calculer les totaux
  const totalCost = entries.reduce((sum, entry) => sum + entry.cost, 0);
  const totalVolume = entries.reduce((sum, entry) => sum + entry.volume, 0);

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      {/* ZONE 1: HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 data-testid="page-title" className="text-3xl font-bold text-gray-900">Historique de Carburant</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAdd}
            data-testid="add-fuel-entry-button"
            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2 transition-colors"
          >
            <Plus size={20} /> Nouvelle Entrée
          </button>
        </div>
      </div>

      {/* ZONE 2: NAVIGATION TABS */}
      <div className="flex gap-6 border-b border-gray-200 mb-6 font-medium text-sm">
        <button className="pb-3 border-[#008751] text-[#008751] font-bold border-b-2">Tous</button>
      </div>

      {/* ZONE 3: FILTERS BAR */}
      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751] outline-none"
          />
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          data-testid="refresh-button"
          className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 flex items-center gap-2 disabled:opacity-50 hover:bg-gray-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} data-testid="refresh-spinner" /> Actualiser
        </button>
        <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          Véhicule <ChevronDown size={14} />
        </button>
        <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          <Filter size={14} /> Filtres
        </button>
        <div className="flex-1 text-right text-sm text-gray-500">
          {loading ? (
            <div className="flex items-center justify-end gap-2">
              <Loader2 size={14} className="animate-spin" /> Chargement...
            </div>
          ) : (
            `${pagination.total > 0 ? (pagination.page - 1) * 10 + 1 : 0} - ${Math.min(pagination.page * 10, pagination.total)} sur ${pagination.total}`
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => changePage(pagination.page - 1)}
            disabled={!pagination.hasPrev || loading}
            className="p-1 border border-gray-300 rounded text-gray-600 bg-white disabled:opacity-50 hover:bg-gray-50"
          >
            <ChevronRight size={16} className="rotate-180" />
          </button>
          <button
            onClick={() => changePage(pagination.page + 1)}
            disabled={!pagination.hasNext || loading}
            className="p-1 border border-gray-300 rounded text-gray-600 bg-white disabled:opacity-50 hover:bg-gray-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ZONE 4: DASHBOARD STATISTIQUES */}
      <div className="bg-white p-4 border border-gray-200 rounded-lg mb-6 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-500 font-medium">Coût Total</div>
            <div className="text-xl font-bold text-gray-900">{formatCurrency(totalCost)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 font-medium">Volume Total</div>
            <div className="text-xl font-bold text-gray-900">{totalVolume.toFixed(2)} <span className="text-xs font-normal text-gray-500">L</span></div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 font-medium">Économie moy. (Dist.)</div>
            <div className="text-xl font-bold text-gray-900">{entries.length > 0 ? (entries.reduce((sum, entry) => sum + (entry.mpg || 0), 0) / (entries.filter(e => e.mpg).length || 1)).toFixed(2) : '0'} <span className="text-xs font-normal text-gray-500">mpg</span></div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 font-medium">Économie moy. (Heures)</div>
            <div className="text-xl font-bold text-gray-900">{entries.length > 0 ? (entries.reduce((sum, entry) => sum + (entry.usage || 0), 0) / (entries.filter(e => e.usage).length || 1)).toFixed(2) : '0'} <span className="text-xs font-normal text-gray-500">g/hr</span></div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 font-medium">Coût moyen</div>
            <div className="text-xl font-bold text-gray-900">{totalVolume > 0 ? formatCurrency(totalCost / totalVolume) : formatCurrency(0)} <span className="text-xs font-normal text-gray-500">/ L</span></div>
          </div>
        </div>
      </div>

      {/* ZONE 5: TABLEAU DE DONNÉES */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8 px-6 py-3"><input type="checkbox" className="rounded border-gray-300" /></th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Véhicule</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Date ▼</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Fournisseur</th>
              <th scope="col" className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Odomètre</th>
              <th scope="col" className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Usage</th>
              <th scope="col" className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Volume</th>
              <th scope="col" className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th scope="col" className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Économie</th>
              <th scope="col" className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Coût / L</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
	            {error && (
	              <tr>
	                <td colSpan={10} className="px-6 py-4 text-center text-red-600">
	                  Erreur : {error}
	                </td>
	              </tr>
	            )}
            {loading && entries.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin text-[#008751]" />
                    <span className="text-gray-600">Chargement des entrées...</span>
                  </div>
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-gray-50 rounded-full">
                      <Search size={24} className="text-gray-400" />
                    </div>
                    <span>Aucune entrée de carburant trouvée</span>
                  </div>
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleSelect(entry)}>
                  <td className="px-6 py-4"><input type="checkbox" className="rounded border-gray-300" onClick={(e) => e.stopPropagation()} /></td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <img src={`https://source.unsplash.com/random/50x50/?truck&sig=${entry.id}`} className="w-6 h-6 rounded object-cover" alt="" />
                      <div>
                        <div className="text-sm font-bold text-[#008751] hover:underline">{entry.vehicle?.name || entry.vehicleId}</div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{entry.vehicle?.type || 'Vehicle'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 underline decoration-dotted underline-offset-4">
                    {formatDate(entry.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[#008751] hover:underline">
                    {entry.vendor || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 underline decoration-dotted underline-offset-4">
                    {entry.odometer ? `${entry.odometer} km` : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div>{entry.usage ? `${entry.usage} hours` : '—'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div>{formatVolume(entry.volume)}</div>
                    <div className="text-xs text-gray-500">L</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-bold">
                    {formatCurrency(entry.cost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div>{entry.mpg ? entry.mpg.toFixed(2) : '—'}</div>
                    <div className="text-xs text-gray-500">mpg (US)</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div>{entry.volume > 0 ? formatCurrency(entry.cost / entry.volume) : formatCurrency(0)}</div>
                    <div className="text-xs text-gray-500">per L</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div >
  );
}
