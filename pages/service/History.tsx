import React from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, FileText, Download } from 'lucide-react';
import { ServiceEntry } from '../../types';

interface ServiceHistoryProps {
  onAdd: () => void;
}

const mockHistory: ServiceEntry[] = [
  { id: 1, vehicle: 'MV110TRNS', date: '12/19/2025', status: 'Scheduled', tasks: ['Engine Air Filter Replacement', 'Diesel Exhaust Fluid Pump Filter Replacement'], totalCost: 1589, meter: 200, vendor: 'MGA' },
  { id: 2, vehicle: 'MV107TRNS', date: '12/17/2025', status: 'Scheduled', tasks: ['Engine Air Filter Replacement', 'Diesel Exhaust Fluid Pump Filter Replacement'], totalCost: 1579, meter: 192, vendor: 'MGA' },
  { id: 3, vehicle: 'BSA116TRNS', date: '12/15/2025', status: 'Scheduled', tasks: ['Engine Air Filter Replacement', 'Diesel Exhaust Fluid Pump Filter Replacement'], totalCost: 1576, meter: 176, vendor: 'MGA' },
  { id: 4, vehicle: 'BSA115TRNS', date: '12/14/2025', status: 'Scheduled', tasks: ['Engine Air Filter Replacement', 'Diesel Exhaust Fluid Pump Filter Replacement'], totalCost: 1586, meter: 160, vendor: 'MGA' },
  { id: 5, vehicle: 'MV110TRNS', date: '12/13/2025', status: 'Scheduled', tasks: ['Tire Rotation', 'Engine Oil & Filter Replacement'], totalCost: 2929, meter: 176, vendor: 'MGA' },
  { id: 6, vehicle: 'MV111TRNS', date: '12/11/2025', status: 'Scheduled', tasks: ['Engine Air Filter Replacement', 'Diesel Exhaust Fluid Pump Filter Replacement'], totalCost: 1602, meter: 148, vendor: 'MGA' },
  { id: 7, vehicle: 'BSA114TRNS', date: '12/11/2025', status: 'Scheduled', tasks: ['Engine Air Filter Replacement', 'Diesel Exhaust Fluid Pump Filter Replacement'], totalCost: 1593, meter: 148, vendor: 'MGA' },
  { id: 8, vehicle: 'RP101', date: '12/09/2025', status: 'Scheduled', tasks: ['Brake Inspection', 'Spark Plugs Replacement'], totalCost: 6061, meter: 50075, vendor: 'MGA' },
];

const ServiceHistory: React.FC<ServiceHistoryProps> = ({ onAdd }) => {
  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
           <h1 className="text-3xl font-bold text-gray-900">Service History</h1>
           <button className="text-gray-500 hover:bg-gray-100 p-1 rounded text-xs bg-gray-50 border border-gray-200 px-2">Learn</button>
        </div>
        <div className="flex gap-2">
           <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button>
           <button 
             onClick={onAdd}
             className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
           >
             <Plus size={20} /> Add Service Entry
           </button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-6">
         <button className="px-4 py-2 text-sm font-medium border-b-2 border-[#008751] text-[#008751]">All</button>
         <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1">
           <Plus size={14} /> Add Tab
         </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
         <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search" className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]" />
         </div>
         <div className="flex gap-2">
             <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
               Vehicle <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
             </button>
             <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
               Vehicle Group <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
             </button>
             <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
               <Filter size={14} /> Filters
             </button>
         </div>
         <div className="flex-1 text-right text-sm text-gray-500">
            1 - 50 of 120
         </div>
          <div className="flex gap-1">
             <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} className="rotate-180" /></button>
             <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} /></button>
         </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8 px-6 py-3">
                 <input type="checkbox" className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]" />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summary</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Repair Priority</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meter</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Tasks</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockHistory.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-6 py-4">
                   <input type="checkbox" className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="flex items-center gap-2">
                      <img src={`https://source.unsplash.com/random/50x50/?truck&sig=${entry.id}`} className="w-8 h-8 rounded object-cover" alt="" />
                      <div>
                        <div className="text-sm font-bold text-[#008751] hover:underline">{entry.vehicle}</div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Sample</span>
                      </div>
                   </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                   {entry.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                   —
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <span className="flex items-center gap-1.5 text-sm text-green-700 font-medium">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div> {entry.status}
                   </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                   {entry.meter} mi
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                   <ul className="list-none space-y-1">
                      {entry.tasks.map((task, i) => (
                          <li key={i} className="underline decoration-dotted underline-offset-2">{task}</li>
                      ))}
                      {entry.tasks.length > 2 && <li className="text-gray-500 text-xs">+1 more</li>}
                   </ul>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                   {entry.vendor}
                </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                   {entry.totalCost.toLocaleString('en-US', { style: 'currency', currency: 'MGA', maximumFractionDigits: 0 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServiceHistory;