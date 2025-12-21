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
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Fuel History</h1>
          <button className="text-gray-500 hover:bg-gray-100 p-1 rounded text-xs bg-gray-50 border border-gray-200 px-2">Learn</button>
        </div>
        <div className="flex gap-2">
          <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button>
          <button
            onClick={handleAdd}
            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          >
            <Plus size={20} /> Add Fuel Entry
          </button>
        </div>
      </div>

      <div className="flex items-center gap-8 mb-6 border-b border-gray-200 pb-4">
        <div>
          <div className="text-xs text-gray-500 font-medium">Total Fuel Cost</div>
          <div className="text-xl font-bold text-gray-900">{formatCurrency(totalCost)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 font-medium">Total Volume</div>
          <div className="text-xl font-bold text-gray-900">{totalVolume.toFixed(2)} <span className="text-xs font-normal text-gray-500">L</span></div>
        </div>
        <div>
          <div className="text-xs text-gray-500 font-medium">Avg. Fuel Economy (Distance)</div>
          <div className="text-xl font-bold text-gray-900">{entries.length > 0 ? (entries.reduce((sum, entry) => sum + (entry.mpg || 0), 0) / entries.filter(e => e.mpg).length).toFixed(2) : '0'} <span className="text-xs font-normal text-gray-500">mpg (US)</span></div>
        </div>
        <div>
          <div className="text-xs text-gray-500 font-medium">Avg. Fuel Economy (Hours)</div>
          <div className="text-xl font-bold text-gray-900">{entries.length > 0 ? (entries.reduce((sum, entry) => sum + (entry.usage || 0), 0) / entries.filter(e => e.usage).length).toFixed(2) : '0'} <span className="text-xs font-normal text-gray-500">g/hr (US)</span></div>
        </div>
        <div>
          <div className="text-xs text-gray-500 font-medium">Avg. Cost</div>
          <div className="text-xl font-bold text-gray-900">{totalVolume > 0 ? formatCurrency(totalCost / totalVolume) : formatCurrency(0)} <span className="text-xs font-normal text-gray-500">/ L</span></div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]"
          />
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          data-testid="refresh-button"
          className="bg-green-100 border border-transparent px-3 py-1.5 rounded text-sm font-medium text-green-800 flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} data-testid="refresh-spinner" /> Refresh
        </button>
        <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          Vehicle <ChevronDown size={14} />
        </button>
        <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          Vendor <ChevronDown size={14} />
        </button>
        <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          <Filter size={14} /> Filters
        </button>
        <div className="flex-1 text-right text-sm text-gray-500">
          {loading ? (
            <div className="flex items-center justify-end gap-2">
              <Loader2 size={14} className="animate-spin" /> Loading...
            </div>
          ) : (
            `${pagination.total > 0 ? (pagination.page - 1) * 10 + 1 : 0} - ${Math.min(pagination.page * 10, pagination.total)} of ${pagination.total}`
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => changePage(pagination.page - 1)}
            disabled={!pagination.hasPrev || loading}
            className="p-1 border border-gray-300 rounded text-gray-400 bg-white disabled:opacity-50"
          >
            <ChevronRight size={16} className="rotate-180" />
          </button>
          <button
            onClick={() => changePage(pagination.page + 1)}
            disabled={!pagination.hasNext || loading}
            className="p-1 border border-gray-300 rounded text-gray-400 bg-white disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8 px-6 py-3"><input type="checkbox" className="rounded border-gray-300" /></th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Date ▼</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
              <th scope="col" className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Odometer</th>
              <th scope="col" className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Usage</th>
              <th scope="col" className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Volume</th>
              <th scope="col" className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th scope="col" className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Fuel Economy</th>
              <th scope="col" className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Cost per L</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {error && (
              <tr>
                <td colSpan={10} className="px-6 py-4 text-center text-red-600">
                  Error: {error}
                </td>
              </tr>
            )}
            {loading && entries.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Loading fuel entries...
                  </div>
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-4 text-center text-gray-500">
                  No fuel entries found
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
    </div>
  );
}