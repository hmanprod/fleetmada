'use client';

import React from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, ChevronDown, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Mock data based on empty state in screenshot, but structurally prepared
const mockChargingEntries: any[] = [];

export default function ChargingHistoryPage() {
    const router = useRouter();

    const handleAdd = () => {
        router.push('/fuel/charging/create');
    };

    return (
        <div className="p-6 max-w-[1800px] mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Charging History</h1>
                <div className="flex gap-2">
                    <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button>
                    <button
                        onClick={handleAdd}
                        className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                    >
                        <Plus size={20} /> New Charging Entry
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input type="text" placeholder="Search" className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]" />
                </div>
                <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    Started At <ChevronDown size={14} />
                </button>
                <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    Ended At <ChevronDown size={14} />
                </button>
                <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    Vehicle <ChevronDown size={14} />
                </button>
                <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    Vendor <ChevronDown size={14} />
                </button>
                <button className="bg-green-100 border border-transparent px-3 py-1.5 rounded text-sm font-medium text-green-800 flex items-center gap-2">
                    <span className="bg-green-200 text-green-800 text-xs font-bold px-1.5 rounded-full">2</span> Filters
                </button>
                <button className="text-sm text-[#008751] hover:underline font-medium">Clear all</button>

                <div className="flex-1 text-right text-sm text-gray-500">
                    {/* Pagination controls simplified */}
                </div>
                <div className="flex gap-1 ml-auto">
                    <button className="p-1 border border-gray-300 rounded text-gray-400 bg-gray-50 disabled"><ChevronRight size={16} className="rotate-180" /></button>
                    <button className="p-1 border border-gray-300 rounded text-gray-400 bg-gray-50 disabled"><ChevronRight size={16} /></button>
                </div>
                <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    Group: None <ChevronDown size={14} />
                </button>
                <button className="p-1.5 border border-gray-300 rounded text-gray-600 bg-white"><Settings size={16} /></button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-0 mb-6 border border-gray-200 rounded-lg overflow-hidden bg-white divide-x divide-gray-200">
                <div className="p-4">
                    <div className="text-xs text-gray-500 font-medium mb-1">Total Charging Cost</div>
                    <div className="text-xl font-bold text-gray-900">MGA 0</div>
                </div>
                <div className="p-4">
                    <div className="text-xs text-gray-500 font-medium mb-1">Total Energy</div>
                    <div className="text-xl font-bold text-gray-900">0.00 <span className="text-xs font-normal text-gray-500">kWh</span></div>
                </div>
                <div className="p-4">
                    <div className="text-xs text-gray-500 font-medium mb-1 underline decoration-dotted underline-offset-2">Average Energy Economy</div>
                    <div className="text-xl font-bold text-gray-300">—</div>
                </div>
                <div className="p-4">
                    <div className="text-xs text-gray-500 font-medium mb-1 underline decoration-dotted underline-offset-2">Avg. Cost</div>
                    <div className="text-xl font-bold text-gray-900">MGA 0 <span className="text-xs font-normal text-gray-500">/ kWh</span></div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border-b border-gray-200 mb-4">
                {/* Empty State / Table Header */}
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-white border-b border-gray-200">
                        <tr>
                            <th className="w-8 px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></th>
                            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Vehicle</th>
                            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900 flex items-center gap-1 cursor-pointer">Start Time <ChevronDown size={14} /></th>
                            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">End Time</th>
                            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Duration</th>
                            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Vendor</th>
                            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900 underline decoration-dotted underline-offset-4">Meter Entry</th>
                            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900 underline decoration-dotted underline-offset-4">Usage</th>
                            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Economy</th>
                            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Total Energy</th>
                            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Unit Price</th>
                            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Energy Cost</th>
                            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Cost Per Meter</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {mockChargingEntries.length === 0 ? (
                            <tr>
                                <td colSpan={13} className="px-6 py-24 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-500">
                                        <div className="h-12 w-12 rounded-full border-2 border-green-500 flex items-center justify-center mb-4 text-green-500">
                                            <Search size={24} />
                                        </div>
                                        <p>No results to show.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            mockChargingEntries.map((entry) => (
                                // Implement row rendering when data is available
                                <tr key={entry.id}><td colSpan={13}>Data</td></tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
