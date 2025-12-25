"use client";

import React, { useState } from 'react';
import { Search, ExternalLink, ChevronLeft, ChevronRight, Settings } from 'lucide-react';

interface Renewal {
    id: string;
    date: string;
    future?: boolean;
    type: string;
    notes: string;
    vendor?: string;
    source: string;
    amount: number;
}

interface VehicleRenewalsProps {
    vehicleId: string;
    data: Renewal[];
}

export function VehicleRenewals({ vehicleId, data }: VehicleRenewalsProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'Past/Future' | 'Past' | 'Future'>('Past/Future');

    const filteredData = data.filter(item => {
        const matchesSearch = item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.notes.toLowerCase().includes(searchTerm.toLowerCase());
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
                        placeholder="Search"
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
                    <option value="Past/Future">Past/Future</option>
                    <option value="Past">Past</option>
                    <option value="Future">Future</option>
                </select>
                <button className="text-sm text-[#008751] hover:underline flex items-center gap-1">
                    More Actions <ExternalLink className="w-3 h-3" />
                </button>
                <button className="text-sm text-[#008751] hover:underline">Clear all</button>
                <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
                    <span>{filteredData.length > 0 ? `1 - ${filteredData.length} of ${filteredData.length}` : '0 results'}</span>
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
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Future</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
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
                                        <p>No results to show.</p>
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
                                    <td className="px-4 py-3 text-sm text-gray-900">{item.type}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{item.notes}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">—</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{item.source}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">MGA {item.amount.toLocaleString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
