'use client';

import React from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, ChevronDown, X, Settings, Lightbulb } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function InspectionHistoryPage() {
    const router = useRouter();

    const handleStartInspection = () => {
        // Navigate to start inspection flow
        console.log('Start inspection');
    };

    return (
        <div className="p-6 max-w-[1800px] mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-gray-900">Inspection History</h1>
                    <button className="text-gray-500 hover:bg-gray-100 p-1 rounded text-xs bg-gray-50 border border-gray-200 px-2 flex items-center gap-1">
                        <Lightbulb size={12} /> Learn
                    </button>
                </div>

                <div className="flex gap-2">
                    <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button>
                    <button
                        onClick={handleStartInspection}
                        className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                    >
                        <Plus size={20} /> Start Inspection
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-200 mb-6">
                <button className="pb-3 border-b-2 border-[#008751] text-[#008751] font-bold text-sm">All</button>
                <button className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">Submissions with Failed Items</button>
            </div>

            {/* Banner */}
            <div className="relative bg-[#1a3d34] rounded-lg shadow-sm mb-6 overflow-hidden min-h-[160px] flex items-center">
                <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[url('https://source.unsplash.com/random/800x400/?truck,logistics')] bg-cover bg-center opacity-60 mix-blend-overlay"></div>
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-transparent to-[#1a3d34]"></div>

                <button className="absolute top-4 right-4 text-white/50 hover:text-white"><X size={20} /></button>

                <div className="relative z-10 p-8 max-w-2xl text-white">
                    <h2 className="text-xl font-bold mb-2">Inspections for Transportation</h2>
                    <ul className="space-y-1 text-sm text-gray-200 list-disc pl-5">
                        <li>Create and customize pre-built inspection forms</li>
                        <li>Complete and submit inspections anywhere w/ the Fleetio Go mobile app</li>
                        <li>Triage and start resolving issues as soon as they're reported</li>
                    </ul>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input type="text" placeholder="Search" className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]" />
                </div>
                <button className="bg-green-100 border border-transparent px-3 py-1.5 rounded text-sm font-medium text-green-800 flex items-center gap-2">
                    Inspection Submitted <ChevronDown size={14} />
                </button>
                <button className="bg-green-100 border border-transparent px-3 py-1.5 rounded text-sm font-medium text-green-800 flex items-center gap-2">
                    <span className="bg-green-200 text-green-800 text-xs font-bold px-1.5 rounded-full">1</span> Filters
                </button>

                <div className="flex-1 text-right text-sm text-gray-500">
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

            {/* Table / Empty State */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-white border-b border-gray-200">
                        <tr>
                            <th className="w-8 px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></th>
                            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Vehicle</th>
                            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Vehicle Group</th>
                            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900 flex items-center gap-1 cursor-pointer">Submitted <ChevronDown size={14} /></th>
                            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Duration</th>
                            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Inspection Form</th>
                            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">User</th>
                            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Location Exception</th>
                            <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Failed Items</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                            <td colSpan={9} className="px-6 py-24 text-center">
                                <div className="flex flex-col items-center justify-center text-gray-500">
                                    <div className="h-12 w-12 rounded-full border-2 border-green-500 flex items-center justify-center mb-4 text-green-500">
                                        <Search size={24} />
                                    </div>
                                    <p className="mb-1">No results to show.</p>
                                    <p className="text-xs max-w-md mx-auto mb-6">Inspection Submissions create a digital papertrail for important asset inspection workflows. <a href="#" className="text-[#008751] hover:underline">Learn More</a></p>

                                    <button
                                        onClick={handleStartInspection}
                                        className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                                    >
                                        <Plus size={20} /> Start Inspection
                                    </button>

                                    <div className="mt-8 flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                                        <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded">
                                            <span className="text-xs font-bold">FA</span>
                                        </div>
                                        <div className="text-left text-xs">
                                            <div className="font-bold text-gray-900">Want to dig in deeper before you build?</div>
                                            <div className="text-gray-500">Visit <a href="#" className="text-blue-600 hover:underline">Fleetio Academy</a></div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
