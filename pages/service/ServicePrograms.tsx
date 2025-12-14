import React from 'react';
import { Search, Plus, Filter, ChevronRight, X } from 'lucide-react';
import { ServiceProgram } from '../../types';

interface ServiceProgramsProps {
  onAdd: () => void;
  onSelect: (program: ServiceProgram) => void;
}

const mockPrograms: ServiceProgram[] = [
  { id: 1, name: 'Basic Vehicle Maintenance', vehicleCount: 1, scheduleCount: 3, primaryMeter: 'Miles' },
];

const ServicePrograms: React.FC<ServiceProgramsProps> = ({ onAdd, onSelect }) => {
  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-6">
         <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Service Programs</h1>
            <button className="text-[#008751] font-medium flex items-center gap-1 text-sm hover:underline">
              Learn More <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </button>
         </div>
         <button 
          onClick={onAdd}
          className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
         >
           <Plus size={20} /> Add Service Program
         </button>
      </div>

      {/* Banner */}
      <div className="relative bg-[#0f4c3a] rounded-lg overflow-hidden mb-6 h-48 flex items-center">
         <div className="absolute inset-0 z-0 opacity-40">
            {/* Placeholder for the truck image banner */}
            <div className="w-full h-full bg-gradient-to-r from-[#0f4c3a] to-[#1b9a59]" style={{backgroundImage: 'url(https://source.unsplash.com/random/1200x400/?truck,fleet)', backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
         </div>
         <div className="relative z-10 p-8 text-white max-w-2xl">
             <h2 className="text-xl font-bold mb-2">Preventative Maintenance for Transportation</h2>
             <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Keep PMs on schedule w/ proactive maintenance alerts</li>
                <li>Identify issues before they become major breakdowns</li>
                <li>Prevent costly vehicle downtime</li>
             </ul>
         </div>
         <button className="absolute top-4 right-4 text-white hover:bg-white/10 rounded-full p-1">
            <X size={20} />
         </button>
      </div>

       <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
         <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search" className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]" />
         </div>
          <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
               Vehicle <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
          </button>
           <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
               Vehicle Group <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
          </button>
           <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
               OEM Service Program <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
          </button>
         <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
           <Filter size={14} /> Filters
         </button>
         <div className="flex-1 text-right text-sm text-gray-500">
            1 - 1 of 1
         </div>
          <div className="flex gap-1">
             <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} className="rotate-180" /></button>
             <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} /></button>
         </div>
         <button className="p-1.5 border border-gray-300 rounded bg-white text-gray-600 hover:bg-gray-50"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
           <thead className="bg-white">
              <tr>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-50">Service Program ▲</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-50">Vehicles</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-50">Schedules</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-50">Primary Meter</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-50">Secondary Meter</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-gray-200">
              {mockPrograms.map(prog => (
                 <tr key={prog.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onSelect(prog)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center gap-2">
                          <span className="bg-gray-300 text-gray-600 font-bold text-xs p-1 rounded w-8 h-8 flex items-center justify-center">BAS</span>
                          <span className="text-sm font-medium text-gray-900">{prog.name}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#008751] font-medium">{prog.vehicleCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#008751] font-medium">{prog.scheduleCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{prog.primaryMeter}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">—</td>
                 </tr>
              ))}
           </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServicePrograms;