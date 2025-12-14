import React from 'react';
import { ArrowLeft, Plus, ChevronDown } from 'lucide-react';

interface ChargingEntryCreateProps {
  onCancel: () => void;
  onSave: () => void;
}

const ChargingEntryCreate: React.FC<ChargingEntryCreateProps> = ({ onCancel, onSave }) => {
  return (
    <div className="bg-gray-50 min-h-screen">
       <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
         <div className="flex items-center gap-4">
             <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
                 <ArrowLeft size={18} /> Charging History
             </button>
             <h1 className="text-2xl font-bold text-gray-900">New Charging Entry</h1>
         </div>
         <div className="flex gap-3">
             <button onClick={onCancel} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Cancel</button>
             <button onClick={onSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Charging Entry</button>
         </div>
       </div>

       <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
          {/* Vehicle Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
             <h2 className="text-lg font-bold text-gray-900 mb-6">Vehicle Details</h2>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle <span className="text-red-500">*</span></label>
                <select className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]">
                    <option>Please select</option>
                </select>
            </div>
          </div>

          {/* Charging Event */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
             <h2 className="text-lg font-bold text-gray-900 mb-6">Charging Event</h2>
             <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                    <select className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]">
                        <option>Please select</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Charging Started <span className="text-red-500">*</span></label>
                        <input type="date" defaultValue="2025-12-14" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
                         <input type="time" defaultValue="15:49" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Charging Ended</label>
                        <input type="date" defaultValue="2025-12-14" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
                         <input type="time" defaultValue="15:49" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Charging Duration</label>
                         <div className="relative">
                             <input type="number" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                             <span className="absolute right-3 top-3 text-gray-500 text-sm">min</span>
                         </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Energy <span className="text-red-500">*</span></label>
                        <div className="relative">
                             <input type="number" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                             <div className="absolute right-3 top-2 flex flex-col items-center">
                                 <ChevronDown size={12} className="rotate-180 text-gray-400"/>
                                 <ChevronDown size={12} className="text-gray-400"/>
                             </div>
                             <span className="absolute right-8 top-3 text-gray-500 text-sm">kWh</span>
                         </div>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Energy Price</label>
                         <div className="relative">
                             <input type="text" defaultValue="0.00" className="w-full pl-12 p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                             <span className="absolute left-3 top-3 text-gray-500 text-sm">MGA</span>
                             <span className="absolute right-3 top-3 text-gray-500 text-sm">/ kWh</span>
                         </div>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Energy Cost</label>
                         <div className="relative">
                             <input type="text" defaultValue="0.00" className="w-full pl-12 p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                             <span className="absolute left-3 top-3 text-gray-500 text-sm">MGA</span>
                         </div>
                    </div>
                </div>

                <button className="text-[#008751] font-medium flex items-center gap-1 hover:underline">
                    <Plus size={16} /> Add fees or discounts
                </button>
             </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[100px]">
             <h2 className="text-lg font-bold text-gray-900">Additional Details</h2>
          </div>

       </div>
    </div>
  );
};

export default ChargingEntryCreate;