'use client';

import React from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, ChevronDown } from 'lucide-react';
import { FuelEntry } from '@/types';

const mockFuelEntries: FuelEntry[] = [
  { id: 1, vehicle: 'MV112TRNS', date: 'Sun, Dec 14, 2025 7:47am', vendor: '', volume: 139.252, cost: 763, mpg: 5, usage: 100 },
  { id: 2, vehicle: 'AM101', date: 'Sun, Dec 14, 2025 7:32am', vendor: 'Chevron', volume: 5.604, cost: 21, mpg: 4, usage: 28 },
  { id: 3, vehicle: 'AG103', date: 'Sun, Dec 14, 2025 7:30am', vendor: 'Chevron', volume: 11.805, cost: 32, mpg: 3, usage: 78 },
  { id: 4, vehicle: 'HC101', date: 'Sun, Dec 14, 2025 6:28am', vendor: '', volume: 13.095, cost: 42, mpg: 3, usage: 780 },
  { id: 5, vehicle: 'BSA115TRNS', date: 'Sun, Dec 14, 2025 6:14am', vendor: 'Shell', volume: 139.504, cost: 751, mpg: 5, usage: 129 },
  { id: 6, vehicle: 'RP101', date: 'Sun, Dec 14, 2025 6:11am', vendor: 'Shell', volume: 23.357, cost: 76, mpg: 6, usage: 825 },
];

const handleAdd = () => {
  // TODO: Implement add fuel entry functionality
  console.log('Add fuel entry');
};

const handleSelect = (entry: FuelEntry) => {
  // TODO: Implement select fuel entry functionality
  console.log('Select fuel entry:', entry);
};

export default function FuelPage() {
  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
           <h1 className="text-3xl font-bold text-gray-900">Fuel History</h1>
           <button className="text-gray-500 hover:bg-gray-100 p-1 rounded text-xs bg-gray-50 border border-gray-200 px-2">Learn</button>
        </div>
        <div className="flex gap-2">
           <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button>
           <button 
             onClick={handleAdd}
             className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
           >
             <Plus size={20} /> Add Fuel Entry
           </button>
        </div>
      </div>

      <div className="flex items-center gap-8 mb-6 border-b border-gray-200 pb-4">
          <div>
              <div className="text-xs text-gray-500 font-medium">Total Fuel Cost</div>
              <div className="text-xl font-bold text-gray-900">MGA 2,124</div>
          </div>
          <div>
              <div className="text-xs text-gray-500 font-medium">Total Volume</div>
              <div className="text-xl font-bold text-gray-900">8,827.08 <span className="text-xs font-normal text-gray-500">gallons</span></div>
          </div>
          <div>
              <div className="text-xs text-gray-500 font-medium">Avg. Fuel Economy (Distance)</div>
              <div className="text-xl font-bold text-gray-900">8.70 <span className="text-xs font-normal text-gray-500">mpg (US)</span></div>
          </div>
          <div>
              <div className="text-xs text-gray-500 font-medium">Avg. Fuel Economy (Hours)</div>
              <div className="text-xl font-bold text-gray-900">6.15 <span className="text-xs font-normal text-gray-500">g/hr (US)</span></div>
          </div>
          <div>
              <div className="text-xs text-gray-500 font-medium">Avg. Cost</div>
              <div className="text-xl font-bold text-gray-900">MGA 0 <span className="text-xs font-normal text-gray-500">/ gallon</span></div>
          </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
         <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search" className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]" />
         </div>
         <button className="bg-green-100 border border-transparent px-3 py-1.5 rounded text-sm font-medium text-green-800 flex items-center gap-2">
               Date <ChevronDown size={14}/>
          </button>
          <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
               Vehicle <ChevronDown size={14}/>
          </button>
          <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
               Vehicle Group <ChevronDown size={14}/>
          </button>
          <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
               Vendor <ChevronDown size={14}/>
          </button>
         <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
           <Filter size={14} /> 1 Filters
         </button>
         <div className="flex-1 text-right text-sm text-gray-500">
            1 - 50 of 103
         </div>
          <div className="flex gap-1">
             <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} className="rotate-180" /></button>
             <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} /></button>
         </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8 px-6 py-3"><input type="checkbox" className="rounded border-gray-300" /></th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Date ▼</th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
              <th scope="col" className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Meter Entry</th>
              <th scope="col" className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Usage</th>
              <th scope="col" className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Volume</th>
              <th scope="col" className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th scope="col" className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Fuel Economy</th>
              <th scope="col" className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Cost per Meter</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockFuelEntries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleSelect(entry)}>
                <td className="px-6 py-4"><input type="checkbox" className="rounded border-gray-300" onClick={(e) => e.stopPropagation()} /></td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="flex items-center gap-2">
                      <img src={`https://source.unsplash.com/random/50x50/?truck&sig=${entry.id}`} className="w-6 h-6 rounded object-cover" alt="" />
                      <div>
                        <div className="text-sm font-bold text-[#008751] hover:underline">{entry.vehicle}</div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Sample</span>
                      </div>
                   </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 underline decoration-dotted underline-offset-4">
                   {entry.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[#008751] hover:underline">
                   {entry.vendor || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 underline decoration-dotted underline-offset-4">
                   160 mi
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                   <div>{entry.usage} hours</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                   <div>{entry.volume}</div>
                   <div className="text-xs text-gray-500">gallons</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right font-bold">
                   MGA {entry.cost}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                   <div>{entry.mpg}</div>
                   <div className="text-xs text-gray-500">mpg (US)</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                   <div>0.72</div>
                   <div className="text-xs text-gray-500">mpg (US)</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}