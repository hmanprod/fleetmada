"use client";

import React, { useState } from 'react';
import { Search, ExternalLink, ChevronLeft, ChevronRight, Settings } from 'lucide-react';

interface ServiceReminder {
    id: string;
    serviceTask: string | null | undefined;
    status: string;
    nextDue?: string;
    dueMeter?: number;
    incompleteWorkOrder?: string;
    serviceProgram?: string;
    lastCompleted?: string;
    compliance?: string;
    watchers?: string[];
}

interface VehicleServiceRemindersProps {
    vehicleId: string;
    data: ServiceReminder[];
}

export function VehicleServiceReminders({ vehicleId, data }: VehicleServiceRemindersProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [taskFilter, setTaskFilter] = useState<string>('Service Task');

    const filteredData = data.filter(item => {
        const matchesSearch = (item.serviceTask || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            'Due Soon': 'bg-yellow-100 text-yellow-800',
            'Overdue': 'bg-red-100 text-red-800',
            'Snoozed': 'bg-gray-100 text-gray-800',
            'On Track': 'bg-green-100 text-green-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getComplianceBadge = (compliance?: string) => {
        if (!compliance) return null;
        const colors: Record<string, string> = {
            'In Compliance': 'bg-green-100 text-green-800',
            'Out of Compliance': 'bg-red-100 text-red-800',
        };
        return colors[compliance] || 'bg-gray-100 text-gray-800';
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
                <select
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md"
                    value={taskFilter}
                    onChange={(e) => setTaskFilter(e.target.value)}
                >
                    <option>Service Task</option>
                    <option>Oil Change</option>
                    <option>Tire Rotation</option>
                    <option>Brake Inspection</option>
                </select>
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
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Task</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Due ▲</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Incomplete Work Order</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Program</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Completed</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compliance</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Watchers</th>
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
                                    <td className="px-4 py-3 text-sm text-[#008751] font-medium underline cursor-pointer">
                                        {item.serviceTask || '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {item.nextDue ? new Date(item.nextDue).toLocaleDateString() : '—'}
                                        {item.dueMeter && <span className="block text-xs text-gray-500">{item.dueMeter.toLocaleString()} mi</span>}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-[#008751]">
                                        {item.incompleteWorkOrder || '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{item.serviceProgram || '—'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {item.lastCompleted ? new Date(item.lastCompleted).toLocaleDateString() : '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        {item.compliance && (
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getComplianceBadge(item.compliance)}`}>
                                                {item.compliance}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{item.watchers?.length || 0}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
