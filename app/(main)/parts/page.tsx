'use client';

import React, { useState } from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, ChevronDown, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Part {
  id: number;
  partNumber: string;
  description: string;
  category: string;
  manufacturer: string;
  unitCost: string;
  measurementUnit: string;
}

const mockParts: Part[] = [];

export default function PartsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState('');

  const handleAddPart = () => {
    router.push('/dashboard/parts/create');
  };

  const handleLearnMore = () => {
    // TODO: Navigate to documentation or help page
    console.log('Navigate to learn more about parts');
  };

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
           <h1 className="text-3xl font-bold text-gray-900">Parts</h1>
           <button 
             onClick={handleLearnMore}
             className="text-gray-500 hover:bg-gray-100 p-1 rounded text-xs bg-gray-50 border border-gray-200 px-2"
           >
             Learn
           </button>
        </div>
        <div className="flex gap-2">
           <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button>
           <button 
             onClick={handleAddPart}
             className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
           >
             <Plus size={20} /> Add Part
           </button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-6">
         <button 
           onClick={() => setActiveTab('all')}
           className={`px-4 py-2 text-sm font-medium border-b-2 ${
             activeTab === 'all' 
               ? 'border-[#008751] text-[#008751]' 
               : 'border-transparent text-gray-500 hover:text-gray-700'
           }`}
         >
           All
         </button>
         <button className="border border-transparent rounded px-2 py-2 text-gray-500 hover:bg-gray-50 ml-2"><MoreHorizontal size={16}/></button>
         <div className="h-6 w-px bg-gray-300 my-auto mx-2"></div>
         <button 
           onClick={() => setActiveTab('archived')}
           className={`px-4 py-2 text-sm font-medium ${
             activeTab === 'archived' 
               ? 'border-b-2 border-[#008751] text-[#008751]' 
               : 'border-transparent text-gray-500 hover:text-gray-700'
           }`}
         >
           Archived
         </button>
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
           onClick={() => setSelectedCategory(selectedCategory === 'engine' ? '' : 'engine')}
           className={`bg-white border px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 ${
             selectedCategory 
               ? 'border-[#008751] bg-[#008751] text-white' 
               : 'border-gray-300 text-gray-700 hover:bg-gray-50'
           }`}
         >
               Part Category <ChevronDown size={14}/>
         </button>
         <button 
           onClick={() => setSelectedManufacturer(selectedManufacturer === 'bosch' ? '' : 'bosch')}
           className={`bg-white border px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 ${
             selectedManufacturer 
               ? 'border-[#008751] bg-[#008751] text-white' 
               : 'border-gray-300 text-gray-700 hover:bg-gray-50'
           }`}
         >
               Part Manufacturer <ChevronDown size={14}/>
         </button>
         <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
           <Filter size={14} /> Filters
         </button>
         <div className="flex gap-1 ml-auto">
             <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white cursor-not-allowed"><ChevronRight size={16} className="rotate-180" /></button>
             <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white cursor-not-allowed"><ChevronRight size={16} /></button>
         </div>
         <button className="bg-white border border-gray-300 px-2 py-1.5 rounded text-gray-700 hover:bg-gray-50">
             <Settings size={16} />
         </button>
         <button 
           onClick={() => console.log('Save view')}
           className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
         >
               Save View <ChevronDown size={14}/>
         </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden h-96 flex flex-col items-center justify-center">
          <div className="h-16 w-16 rounded-full border-2 border-green-500 flex items-center justify-center mb-4">
                <Search size={32} className="text-green-500" />
          </div>
          <p className="text-gray-500 mb-1">No results to show.</p>
          <p className="text-sm text-gray-400 mb-4 max-w-md text-center">
            {searchTerm || selectedCategory || selectedManufacturer
              ? 'No parts found matching your search criteria.'
              : 'Parts are records to manage history of physical inventory across your part locations.'
            }
          </p>
          {!searchTerm && !selectedCategory && !selectedManufacturer && (
            <button 
              onClick={handleLearnMore}
              className="text-[#008751] font-medium hover:underline text-sm mb-4"
            >
              Learn More
            </button>
          )}
          <button 
             onClick={handleAddPart}
             className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
           >
             <Plus size={20} /> Add Part
           </button>
      </div>
    </div>
  );
}