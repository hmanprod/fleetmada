'use client';

import React, { useState } from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WorkOrdersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('completed');
  const [selectedStatus, setSelectedStatus] = useState('');

  const handleAddWorkOrder = () => {
    // TODO: Navigate to work order create page
    console.log('Navigate to create work order');
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    // TODO: Reset all filters
  };

  const statusTabs = [
    { key: 'all', label: 'All', color: null },
    { key: 'open', label: 'Open', color: 'bg-blue-500' },
    { key: 'pending', label: 'Pending', color: 'bg-orange-400' },
    { key: 'completed', label: 'Completed', color: 'bg-green-500' },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
           <h1 className="text-3xl font-bold text-gray-900">Work Orders</h1>
           <button 
             onClick={() => router.push('/dashboard/service/automations')}
             className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm font-medium"
           >
             <Zap size={14} className="text-purple-600 fill-purple-600" /> Automations
           </button>
        </div>
        <div className="flex gap-2">
           <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button>
           <button 
             onClick={handleAddWorkOrder}
             className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
           >
             <Plus size={20} /> Add Work Order
           </button>
        </div>
      </div>

       <div className="flex gap-1 border-b border-gray-200 mb-6">
         {statusTabs.map(tab => (
           <button
             key={tab.key}
             onClick={() => setActiveTab(tab.key)}
             className={`px-4 py-2 text-sm font-medium ${
               activeTab === tab.key 
                 ? 'border-b-2 border-[#008751] text-[#008751]' 
                 : 'border-transparent text-gray-500 hover:text-gray-700'
             } flex items-center gap-1.5`}
           >
             {tab.color && <div className={`w-2 h-2 rounded-full ${tab.color}`}></div>}
             {tab.label}
           </button>
         ))}
         <button 
           onClick={() => console.log('Add new tab')}
           className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1"
         >
           <Plus size={14} /> Add Tab
         </button>
       </div>

       <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
         <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]" 
            />
         </div>
          <button 
            onClick={() => setSelectedStatus(selectedStatus === 'open' ? '' : 'open')}
            className={`bg-white border px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 ${
              selectedStatus === 'open' 
                ? 'border-[#008751] bg-[#008751] text-white' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
             Status <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
          </button>
          <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
             Vehicle <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
          </button>
           <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
             Vehicle Group <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
          </button>
         <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
           <Filter size={14} /> Filters
         </button>
         <div className="flex-1 text-right text-sm text-gray-500">
            1 - 50 of 120
         </div>
          <div className="flex gap-1">
             <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} className="rotate-180" /></button>
             <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} /></button>
          </div>
       </div>

       <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-300 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedStatus 
                ? `No ${activeTab} work orders found matching your filters.` 
                : `No ${activeTab} work orders found.`
              }
            </p>
            {(searchTerm || selectedStatus) && (
              <button 
                onClick={handleClearFilters}
                className="text-[#008751] font-medium hover:underline"
              >
                Clear all filters
              </button>
            )}
       </div>
    </div>
  );
}