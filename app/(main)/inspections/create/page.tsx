'use client';

import React from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, ChevronDown, Settings, LayoutGrid, List } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function InspectionFormsPage() {
    const router = useRouter();

    const handleStartInspection = () => {
        // Navigate to start inspection
    };

    const handleAddForm = () => {
        // Navigate to create form
    };

    return (
        <div className="p-6 max-w-[1800px] mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Inspection Forms</h1>
                <div className="flex gap-2">
                    <button className="bg-white border border-gray-300 text-gray-700 font-bold py-2 px-4 rounded hover:bg-gray-50">Start Inspection</button>
                    <button
                        onClick={handleAddForm}
                        className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                    >
                        <Plus size={20} /> Add Inspection Form
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-200 mb-6">
                <button className="pb-3 border-b-2 border-[#008751] text-[#008751] font-bold text-sm">Active</button>
                <button className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">Archived</button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input type="text" placeholder="Search" className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]" />
                </div>
                <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    Inspection Form <ChevronDown size={14} />
                </button>
                <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Filter size={14} /> Filters
                </button>

                <div className="flex-1 text-right text-sm text-gray-500">
                    1 - 1 of 1
                </div>
                <div className="flex gap-1 ml-auto">
                    <button className="p-1 border border-gray-300 rounded text-gray-400 bg-gray-50 disabled"><ChevronRight size={16} className="rotate-180" /></button>
                    <button className="p-1 border border-gray-300 rounded text-gray-400 bg-gray-50 disabled"><ChevronRight size={16} /></button>
                </div>
                <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <span className="flex items-center gap-1"><span className="text-gray-400">↑↓</span> Title</span> <ChevronDown size={14} />
                </button>
                <div className="flex bg-white rounded border border-gray-300 overflow-hidden">
                    <button className="p-1.5 text-gray-500 hover:bg-gray-50 border-r border-gray-300"><List size={16} /></button>
                    <button className="p-1.5 text-green-600 bg-green-50"><LayoutGrid size={16} /></button>
                </div>
            </div>

            {/* Grid of Forms */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card: Basic Form */}
                <div
                    className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push('/inspections/forms/basic-form')}
                >
                    <div className="p-4 border-b border-gray-100 mb-2">
                        <h3 className="font-bold text-gray-900 text-lg">Basic Form</h3>
                    </div>
                    <div className="px-4 py-2 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Items</span>
                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">5</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Workflows</span>
                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">1</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Vehicles</span>
                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">4</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Submissions</span>
                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">0</span>
                        </div>
                    </div>
                    <div className="p-4 mt-2">
                        {/* Spacer or additional footer if needed */}
                    </div>
                </div>
            </div>
        </div>
    );
}
