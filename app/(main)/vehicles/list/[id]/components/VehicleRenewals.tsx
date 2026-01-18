"use client";

import React, { useState } from 'react';
import { Search, ExternalLink, ChevronLeft, ChevronRight, Settings } from 'lucide-react';

interface Renewal {
    id: string;
    date: string;
    future?: boolean;
    type: string | null | undefined;
    notes: string | null | undefined;
    vendor?: string;
    source: string;
    amount: number | null | undefined;
}

interface VehicleRenewalsProps {
    vehicleId: string;
    data: Renewal[];
}

export function VehicleRenewals({ vehicleId, data }: VehicleRenewalsProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'Passé/Futur' | 'Passé' | 'Futur'>('Passé/Futur');

    const filteredData = data.filter(item => {
        const matchesSearch = (item.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Toolbar */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008751]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-[#008751] text-white"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                >
                    <option value="Passé/Futur">Passé/Futur</option>
                    <option value="Passé">Passé</option>
                    <option value="Futur">Futur</option>
                </select>
                <button className="text-sm text-[#008751] hover:underline flex items-center gap-1">
                    Plus d'actions <ExternalLink className="w-3 h-3" />
                </button>
                <button className="text-sm text-[#008751] hover:underline">Effacer tout</button>
                <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
                    <span>{filteredData.length > 0 ? `1 - ${filteredData.length} sur ${filteredData.length}` : '0 résultat'}</span>
                    <button className="p-1 hover:bg-gray-100 rounded"><ChevronLeft className="w-4 h-4" /></button>
                    <button className="p-1 hover:bg-gray-100 rounded"><ChevronRight className="w-4 h-4" /></button>
                    <button className="p-1 hover:bg-gray-100 rounded"><Settings className="w-4 h-4" /></button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date ▼</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Futur</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fournisseur</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center">
                                    <div className="text-gray-400">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 mx-auto mb-3 flex items-center justify-center">
                                            <Search className="w-6 h-6" />
                                        </div>
                                        <p>Aucun résultat à afficher.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-[#008751] font-medium underline cursor-pointer">
                                        {new Date(item.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">—</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{item.type || '—'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{item.notes || '—'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">—</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{item.source}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{(item.amount ?? 0).toLocaleString()} Ar</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
