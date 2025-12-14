import React from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, ChevronDown } from 'lucide-react';
import { Part } from '../../types';

interface PartListProps {
  onAdd: () => void;
}

const mockParts: Part[] = [];

const PartList: React.FC<PartListProps> = ({ onAdd }) => {
  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
           <h1 className="text-3xl font-bold text-gray-900">Parts</h1>
           <button className="text-gray-500 hover:bg-gray-100 p-1 rounded text-xs bg-gray-50 border border-gray-200 px-2">Learn</button>
        </div>
        <div className="flex gap-2">
           <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button>
           <button 
             onClick={onAdd}
             className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
           >
             <Plus size={20} /> Add Part
           </button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-6">
         <button className="px-4 py-2 text-sm font-medium border-b-2 border-[#008751] text-[#008751]">All</button>
         <button className="border border-transparent rounded px-2 py-2 text-gray-500 hover:bg-gray-50 ml-2"><MoreHorizontal size={16}/></button>
         <div className="h-6 w-px bg-gray-300 my-auto mx-2"></div>
         <button className="px-4 py-2 text-sm font-medium border-transparent text-gray-500 hover:text-gray-700">Archived</button>
         <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1">
           <Plus size={14} /> Add Tab
         </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
         <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search" className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]" />
         </div>
         <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
               Part Category <ChevronDown size={14}/>
          </button>
          <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
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
         <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
               Save View <ChevronDown size={14}/>
          </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden h-96 flex flex-col items-center justify-center">
          <div className="h-16 w-16 rounded-full border-2 border-green-500 flex items-center justify-center mb-4">
                <Search size={32} className="text-green-500" />
          </div>
          <p className="text-gray-500 mb-1">No results to show.</p>
          <p className="text-sm text-gray-400 mb-4 max-w-md text-center">Parts are records to manage history of physical inventory across your part locations.</p>
          <button className="text-[#008751] font-medium hover:underline text-sm mb-4">Learn More</button>
          <button 
             onClick={onAdd}
             className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
           >
             <Plus size={20} /> Add Part
           </button>
      </div>
    </div>
  );
};

import { Settings } from 'lucide-react';
export default PartList;