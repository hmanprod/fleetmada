import React, { useState } from 'react';
import { ArrowLeft, Edit2, Plus, Wrench, Car, ChevronRight, ChevronDown, Search } from 'lucide-react';

interface ServiceProgramDetailProps {
  onBack: () => void;
  onEdit: () => void;
}

const ServiceProgramDetail: React.FC<ServiceProgramDetailProps> = ({ onBack, onEdit }) => {
  const [activeTab, setActiveTab] = useState<'Service Schedules' | 'Vehicles'>('Service Schedules');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
       {/* Header */}
       <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
             <button onClick={onBack} className="hover:text-gray-700 flex items-center gap-1"><ArrowLeft size={16}/> Service Programs</button>
          </div>
          <div className="flex justify-between items-start">
             <div className="flex items-center gap-4">
                 <div className="bg-gray-400 h-16 w-16 rounded flex items-center justify-center text-white text-xl font-bold">BVM</div>
                 <div>
                    <h1 className="text-3xl font-bold text-gray-900">Basic Vehicle Maintenance</h1>
                 </div>
             </div>
             <div className="flex gap-2">
                 <button onClick={onEdit} className="px-4 py-2 border border-gray-300 bg-white rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Edit2 size={16} /> Edit
                </button>
                <div className="relative">
                     <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="px-4 py-2 bg-[#008751] text-white rounded text-sm font-bold hover:bg-[#007043] flex items-center gap-2 shadow-sm"
                     >
                        <Plus size={16} /> Add <ChevronDown size={16} />
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                <Wrench size={16} className="text-gray-400" /> Add Service Schedule
                            </button>
                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                <Car size={16} className="text-gray-400" /> Add Vehicles
                            </button>
                        </div>
                    )}
                </div>
             </div>
          </div>
       </div>

       {/* Stats/Tabs Bar */}
       <div className="bg-white border-b border-gray-200 px-8">
           <div className="flex gap-8">
               <button 
                onClick={() => setActiveTab('Service Schedules')}
                className={`py-4 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'Service Schedules' ? 'border-[#008751] text-[#008751]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
               >
                   Service Schedules <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">3</span>
               </button>
               <button 
                onClick={() => setActiveTab('Vehicles')}
                className={`py-4 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'Vehicles' ? 'border-[#008751] text-[#008751]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
               >
                   Vehicles <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">1</span>
               </button>
           </div>
       </div>

       {/* Content */}
       <div className="flex-1 p-6 max-w-[1600px] w-full mx-auto">
           {/* Filters Bar (reused style) */}
           <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
             <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input type="text" placeholder="Search" className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]" />
             </div>
             <div className="flex-1 text-right text-sm text-gray-500">
                1 - 3 of 3
             </div>
             <div className="flex gap-1">
                 <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} className="rotate-180" /></button>
                 <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} /></button>
             </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
             {activeTab === 'Service Schedules' ? (
                 <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intervals ▲</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Tasks</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        <tr>
                            <td className="px-6 py-4 text-sm text-gray-900">Every 4 month(s) or 5,000 miles</td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                                <div>Engine Oil & Filter Replacement</div>
                                <div>Tire Rotation</div>
                            </td>
                        </tr>
                         <tr>
                            <td className="px-6 py-4 text-sm text-gray-900">Every 30,000 miles</td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                                <div>Engine Air Filter Replacement</div>
                            </td>
                        </tr>
                         <tr>
                            <td className="px-6 py-4 text-sm text-gray-900">Every 100,000 miles</td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                                <div>Engine Coolant Drain & Refill</div>
                                <div>Spark Plugs Replacement</div>
                                <div>Transmission Fluid Drain & Refill</div>
                            </td>
                        </tr>
                    </tbody>
                 </table>
             ) : (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Program ▲</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicles</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedules</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Primary Meter</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Secondary Meter</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                         <tr>
                             <td className="px-6 py-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="bg-gray-300 text-gray-600 font-bold text-xs p-1 rounded w-8 h-8 flex items-center justify-center">BAS</span>
                                  <span className="font-medium text-gray-900">Basic Vehicle Maintenance</span>
                                </div>
                             </td>
                             <td className="px-6 py-4 text-sm text-[#008751] font-medium">1</td>
                             <td className="px-6 py-4 text-sm text-[#008751] font-medium">3</td>
                             <td className="px-6 py-4 text-sm text-gray-900">Miles</td>
                             <td className="px-6 py-4 text-sm text-gray-500">—</td>
                         </tr>
                    </tbody>
                 </table>
             )}
          </div>
       </div>
    </div>
  );
};

export default ServiceProgramDetail;