"use client";

import React, { useState } from 'react';
import { Search, ExternalLink, ChevronLeft, ChevronRight, Settings } from 'lucide-react';

interface MeterEntry {
    id: string;
    date: string;
    value: number;
    unit?: string;
    type: string;
    void?: boolean;
    autoVoidReason?: string;
    voidStatus?: string;
    source?: string;
    sourceId?: string;
}

interface VehicleMeterHistoryProps {
    vehicleId: string;
    data: MeterEntry[];
}

export function VehicleMeterHistory({ vehicleId, data }: VehicleMeterHistoryProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState<string>('Meter Date');
    const [typeFilter, setTypeFilter] = useState<string>('Meter Type');
    const [voidFilter, setVoidFilter] = useState<string>('Void Status');

    const filteredData = data.filter(item => {
        const matchesSearch = item.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.type.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const formatRelativeTime = (date: string) => {
        const now = new Date();
        const d = new Date(date);
        const diffTime = Math.abs(now.getTime() - d.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

        if (diffDays === 0) {
            return `${diffHours} hrs ago`;
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return `${Math.floor(diffDays / 7)} weeks ago`;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Toolbar */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3 flex-wrap">
                <select
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                >
                    <option>Meter Date</option>
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                </select>
                <select
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                >
                    <option>Meter Type</option>
                    <option>Primary</option>
                    <option>Secondary</option>
                </select>
                <select
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md"
                    value={voidFilter}
                    onChange={(e) => setVoidFilter(e.target.value)}
                >
                    <option>Void Status</option>
                    <option>Valid</option>
                    <option>Auto-Voided</option>
                    <option>Manually Voided</option>
                </select>
                <button className="text-sm text-[#008751] hover:underline flex items-center gap-1">
                    More Actions <ExternalLink className="w-3 h-3" />
                </button>
                <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
                    <span>{filteredData.length > 0 ? `1 - ${Math.min(18, filteredData.length)} of ${filteredData.length}` : '0 results'}</span>
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
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-8">
                                <input type="checkbox" className="rounded border-gray-300" />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meter Date ▼</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meter Value</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meter Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Void</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Auto-Void Reason</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Void Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-12 text-center">
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
                                    <td className="px-4 py-3">
                                        <input type="checkbox" className="rounded border-gray-300" />
                                    </td>
                                    <td className="px-4 py-3 text-sm text-[#008751] font-medium underline cursor-pointer">
                                        {new Date(item.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-sm font-medium ${item.void ? 'text-orange-600' : 'text-gray-900'}`}>
                                            {item.value?.toLocaleString()} {item.unit || 'hr'}
                                        </span>
                                        <span className="block text-xs text-gray-500">{formatRelativeTime(item.date)}</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{item.type || 'Primary'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {item.void ? '✓' : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {item.autoVoidReason || '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        {item.voidStatus && (
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${item.voidStatus === 'Auto-Voided' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {item.voidStatus}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-[#008751]">
                                        {item.source === 'Manual' ? 'Manual' : item.source}
                                        {item.sourceId && ` #${item.sourceId}`}
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
