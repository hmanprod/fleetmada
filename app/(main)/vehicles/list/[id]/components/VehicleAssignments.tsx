"use client";

import React, { useState } from 'react';
import { Search, ExternalLink, ChevronLeft, ChevronRight, Settings } from 'lucide-react';

interface Assignment {
    id: string;
    contact?: string;
    operator?: string;
    startDate: string;
    endDate?: string;
    duration?: string;
    startMeter?: number;
    endMeter?: number;
    status: string;
}

interface VehicleAssignmentsProps {
    vehicleId: string;
    data: Assignment[];
}

export function VehicleAssignments({ vehicleId, data }: VehicleAssignmentsProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = data.filter(item => {
        const contact = item.contact || item.operator || '';
        return contact.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const calculateDuration = (start: string, end?: string) => {
        const startDate = new Date(start);
        const endDate = end ? new Date(end) : new Date();
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} days`;
    };

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
                <button className="text-sm text-[#008751] hover:underline flex items-center gap-1">
                    More Actions <ExternalLink className="w-3 h-3" />
                </button>
                <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
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
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start ▼</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">End</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Meter</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Meter</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center">
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
                                        {item.contact || item.operator || 'Unassigned'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {new Date(item.startDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {item.endDate ? new Date(item.endDate).toLocaleDateString() : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {item.duration || calculateDuration(item.startDate, item.endDate)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {item.startMeter?.toLocaleString() || '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {item.endMeter?.toLocaleString() || '—'}
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
