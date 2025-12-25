"use client";

import React, { useState } from 'react';
import { Search, ExternalLink, ChevronLeft, ChevronRight, Settings } from 'lucide-react';

interface Issue {
    id: string;
    priority: string;
    issue: string;
    summary: string;
    status: string;
    source?: string;
    reportedDate: string;
    assigned?: string;
    labels?: string[];
    watchers?: string[];
}

interface VehicleIssuesProps {
    vehicleId: string;
    data: Issue[];
}

export function VehicleIssues({ vehicleId, data }: VehicleIssuesProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('Issue Status');

    const filteredData = data.filter(item => {
        const matchesSearch = item.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.summary.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getPriorityBadge = (priority: string) => {
        const colors: Record<string, string> = {
            'High': 'bg-red-100 text-red-800',
            'Medium': 'bg-yellow-100 text-yellow-800',
            'Low': 'bg-green-100 text-green-800',
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            'Open': 'bg-red-100 text-red-800',
            'In Progress': 'bg-yellow-100 text-yellow-800',
            'Resolved': 'bg-green-100 text-green-800',
            'Closed': 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
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
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option>Issue Status</option>
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                    <option>Closed</option>
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
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Summary</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reported Date ▼</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Labels</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Watchers</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-4 py-12 text-center">
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
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityBadge(item.priority)}`}>
                                            {item.priority}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-[#008751] font-medium underline cursor-pointer">
                                        {item.issue}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{item.summary}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{item.source || '—'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {new Date(item.reportedDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{item.assigned || '—'}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            {item.labels?.map((label, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                                    {label}
                                                </span>
                                            ))}
                                        </div>
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
