'use client';

import React from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, ChevronDown, Settings, Loader2, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useChargingEntries } from '@/lib/hooks/useChargingEntries';
import { ChargingEntryFilters } from '@/types/fuel';

export default function ChargingHistoryPage() {
    const router = useRouter();
    const [filters, setFilters] = React.useState<ChargingEntryFilters>({});
    const [searchQuery, setSearchQuery] = React.useState('');

    const { entries, loading, error, pagination, updateFilters, changePage, refresh } = useChargingEntries(filters);

    const handleAdd = () => {
        router.push('/fuel/charging/create');
    };

    const handleSelect = (entry: any) => {
        router.push(`/fuel/charging/${entry.id}`);
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

    const formatEnergy = (energy: number) => {
        return `${energy.toFixed(2)} kWh`;
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    // Calculer les totaux
    const totalCost = entries.reduce((sum, entry) => sum + entry.cost, 0);
    const totalEnergy = entries.reduce((sum, entry) => sum + entry.energyKwh, 0);
    const totalDuration = entries.reduce((sum, entry) => sum + (entry.durationMin || 0), 0);
    const averageCostPerKwh = totalEnergy > 0 ? totalCost / totalEnergy : 0;

    return (
        <div className="p-6 max-w-[1800px] mx-auto">
            {/* ZONE 1: HEADER */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h1 data-testid="page-title" className="text-3xl font-bold text-gray-900">Recharges Électriques</h1>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleRefresh}
                        data-testid="refresh-button"
                        className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 flex items-center gap-2 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} data-testid="refresh-spinner" /> Actualiser
                    </button>

                    <button
                        onClick={handleAdd}
                        data-testid="add-charging-entry-button"
                        className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2 transition-colors"
                    >
                        <Plus size={20} /> Nouvelle Recharge
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
                <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    Véhicule <ChevronDown size={14} />
                </button>
                <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    Lieu <ChevronDown size={14} />
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-sm text-gray-500 font-medium mb-1">Coût Total</div>
                        <div className="text-xl font-bold text-gray-900">{formatCurrency(totalCost)}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm text-gray-500 font-medium mb-1">Énergie Totale</div>
                        <div className="text-xl font-bold text-gray-900">{totalEnergy.toFixed(2)} <span className="text-xs font-normal text-gray-500">kWh</span></div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm text-gray-500 font-medium mb-1">Durée Totale</div>
                        <div className="text-xl font-bold text-gray-900">{formatDuration(totalDuration)}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm text-gray-500 font-medium mb-1">Coût Moyen</div>
                        <div className="text-xl font-bold text-gray-900">{formatCurrency(averageCostPerKwh)} <span className="text-xs font-normal text-gray-500">/ kWh</span></div>
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
                            <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Lieu</th>
                            <th scope="col" className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Durée</th>
                            <th scope="col" className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Énergie</th>
                            <th scope="col" className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Coût Total</th>
                            <th scope="col" className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Coût / kWh</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {error && (
                            <tr>
                                <td colSpan={8} className="px-6 py-4 text-center text-red-600">
                                    Error: {error}
                                </td>
                            </tr>
                        )}
                        {loading && entries.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 size={16} className="animate-spin text-[#008751]" />
                                        <span className="text-gray-600">Chargement des entrées de recharge...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : entries.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                    <Search size={24} className="mx-auto mb-2 text-gray-400" />
                                    <span>Aucune entrée de recharge trouvée</span>
                                </td>
                            </tr>
                        ) : (
                            entries.map((entry) => (
                                <tr key={entry.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleSelect(entry)}>
                                    <td className="px-6 py-4"><input type="checkbox" className="rounded border-gray-300" onClick={(e) => e.stopPropagation()} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <img src={`https://source.unsplash.com/random/50x50/?electric-car&sig=${entry.id}`} className="w-6 h-6 rounded object-cover" alt="" />
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
                                        {entry.location || '—'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div>{entry.durationMin ? formatDuration(entry.durationMin) : '—'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div>{formatEnergy(entry.energyKwh)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold">
                                        {formatCurrency(entry.cost)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div>{formatCurrency(entry.energyKwh > 0 ? entry.cost / entry.energyKwh : 0)}</div>
                                        <div className="text-xs text-gray-500">per kWh</div>
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
