import React from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, ChevronDown, MapPin } from 'lucide-react';
import { Place } from '../../types';

interface PlaceListProps {
  onAdd: () => void;
}

const PlaceList: React.FC<PlaceListProps> = ({ onAdd }) => {
  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
           <h1 className="text-3xl font-bold text-gray-900">Places</h1>
           <button className="text-gray-500 hover:bg-gray-100 p-1 rounded text-xs bg-gray-50 border border-gray-200 px-2">Learn</button>
        </div>
        <div className="flex gap-2">
           <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button>
           <button 
             onClick={onAdd}
             className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
           >
             <Plus size={20} /> Add Place
           </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
         <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search" className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]" />
         </div>
         <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
               Location Entry Type <ChevronDown size={14}/>
          </button>
          <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
               Location Entry Date <ChevronDown size={14}/>
          </button>
          <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
               Place Geofence Radius <ChevronDown size={14}/>
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
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden min-h-[400px]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Name ▲</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider underline decoration-dotted">Address</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td colSpan={3} className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center justify-center">
                            <div className="h-16 w-16 rounded-full border-2 border-green-500 flex items-center justify-center mb-4">
                                <Search size={32} className="text-green-500" />
                            </div>
                            <p className="text-gray-500 mb-1">No results to show.</p>
                            <p className="text-sm text-gray-400 mb-4 max-w-md text-center">Places are specific locations that are important for your fleet.</p>
                            <button className="text-[#008751] font-medium hover:underline text-sm mb-4">Learn More</button>
                            <button 
                                onClick={onAdd}
                                className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                            >
                                <Plus size={20} /> Add Place
                            </button>
                        </div>
                    </td>
                </tr>
            </tbody>
          </table>
      </div>
    </div>
  );
};

import { Settings } from 'lucide-react';
export default PlaceList;