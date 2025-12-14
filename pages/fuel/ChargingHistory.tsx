import React from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, ChevronDown, Zap } from 'lucide-react';

interface ChargingHistoryProps {
  onAdd: () => void;
}

const ChargingHistory: React.FC<ChargingHistoryProps> = ({ onAdd }) => {
  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Charging History</h1>
        <div className="flex gap-2">
           <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button>
           <button 
             onClick={onAdd}
             className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
           >
             <Plus size={20} /> New Charging Entry
           </button>
        </div>
      </div>

      <div className="flex items-center gap-8 mb-6 border-b border-gray-200 pb-4">
          <div>
              <div className="text-xs text-gray-500 font-medium">Total Charging Cost</div>
              <div className="text-xl font-bold text-gray-900">MGA 0</div>
          </div>
          <div>
              <div className="text-xs text-gray-500 font-medium">Total Energy</div>
              <div className="text-xl font-bold text-gray-900">0.00 <span className="text-xs font-normal text-gray-500">kWh</span></div>
          </div>
          <div>
              <div className="text-xs text-gray-500 font-medium">Average Energy Economy</div>
              <div className="text-xl font-bold text-gray-900">—</div>
          </div>
          <div>
              <div className="text-xs text-gray-500 font-medium">Avg. Cost</div>
              <div className="text-xl font-bold text-gray-900">MGA 0 <span className="text-xs font-normal text-gray-500">/ kWh</span></div>
          </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
         <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search" className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]" />
         </div>
         <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
               Started At <ChevronDown size={14}/>
          </button>
          <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
               Ended At <ChevronDown size={14}/>
          </button>
         <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
               Vehicle <ChevronDown size={14}/>
          </button>
          <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
               Vendor <ChevronDown size={14}/>
          </button>
         <button className="bg-green-100 border border-transparent px-3 py-1.5 rounded text-sm font-medium text-green-800 flex items-center gap-2">
           <span className="bg-green-700 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">2</span> Filters
         </button>
         <button className="text-[#008751] text-sm font-medium hover:underline">Clear all</button>
         <div className="flex gap-1 ml-auto">
             <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} className="rotate-180" /></button>
             <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} /></button>
         </div>
         <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
               Group: None <ChevronDown size={14}/>
          </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-white">
            <tr>
              <th className="w-8 px-6 py-3"><input type="checkbox" className="rounded border-gray-300" /></th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-900 uppercase tracking-wider">Vehicle</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-900 uppercase tracking-wider">Start Time ▼</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-900 uppercase tracking-wider">End Time</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-900 uppercase tracking-wider">Duration</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-900 uppercase tracking-wider">Vendor</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-900 uppercase tracking-wider underline decoration-dotted">Meter Entry</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-900 uppercase tracking-wider underline decoration-dotted">Usage</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-900 uppercase tracking-wider">Economy</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-900 uppercase tracking-wider">Total Energy</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-900 uppercase tracking-wider">Unit Price</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-900 uppercase tracking-wider">Energy Cost</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-900 uppercase tracking-wider">Cost Per Meter</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
             {/* Empty State Mock */}
             <tr>
                 <td colSpan={13} className="px-6 py-24 text-center">
                     <div className="flex flex-col items-center justify-center">
                         <div className="h-16 w-16 rounded-full border-2 border-green-500 flex items-center justify-center mb-4">
                             <Search size={32} className="text-green-500" />
                         </div>
                         <p className="text-gray-500">No results to show.</p>
                     </div>
                 </td>
             </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChargingHistory;