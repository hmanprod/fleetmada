import React from 'react';
import { ArrowLeft, Plus, Edit2, GripVertical, CheckCircle2, Gauge, Droplets } from 'lucide-react';

interface InspectionCreateProps {
  onBack: () => void;
}

const InspectionCreate: React.FC<InspectionCreateProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col h-full bg-[#f9fafb]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
             <ArrowLeft size={20} />
           </button>
           <div>
             <h1 className="text-xl font-bold text-gray-900">Basic Form</h1>
             <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                <span>Inspection Items <span className="bg-gray-200 px-1.5 rounded-full text-gray-700">5</span></span>
                <span>Workflows <span className="bg-gray-200 px-1.5 rounded-full text-gray-700">1</span></span>
                <span>Vehicles <span className="bg-gray-200 px-1.5 rounded-full text-gray-700">4</span></span>
             </div>
           </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onBack} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded border border-gray-300">Cancel</button>
          <button onClick={onBack} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-medium rounded shadow-sm">Save Inspection Form</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
         {/* Editor Area */}
         <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="flex justify-between items-center mb-2">
                 <h2 className="text-lg font-bold text-gray-800">Inspection Items</h2>
                 <button className="text-[#008751] text-sm font-medium flex items-center gap-1 hover:underline">
                    <Edit2 size={14} /> Edit
                 </button>
              </div>

              {/* Item Card 1 */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 group hover:border-[#008751] transition-colors cursor-pointer relative">
                 <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 cursor-grab">
                    <GripVertical size={20} />
                 </div>
                 <div className="pl-6 flex items-start justify-between">
                    <div>
                       <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">Odometer Reading <span className="text-red-500">*</span></h3>
                       </div>
                       <div className="text-sm text-gray-500 grid grid-cols-2 gap-x-8 gap-y-1">
                          <span>Require Secondary Meter: <strong>Yes</strong></span>
                          <span>Require Photo Verification: <strong>Yes</strong></span>
                       </div>
                    </div>
                    <div className="flex gap-2">
                         <span className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                            <Gauge size={12} /> Meter Entry
                         </span>
                         <button className="text-gray-400 hover:text-gray-600"><Edit2 size={16} /></button>
                    </div>
                 </div>
              </div>

               {/* Item Card 2 */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 group hover:border-[#008751] transition-colors cursor-pointer relative">
                 <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 cursor-grab">
                    <GripVertical size={20} />
                 </div>
                 <div className="pl-6 flex items-start justify-between">
                    <div>
                       <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">Tires <span className="text-red-500">*</span></h3>
                       </div>
                    </div>
                     <div className="flex gap-2">
                         <span className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                            <CheckCircle2 size={12} /> Pass / Fail
                         </span>
                         <button className="text-gray-400 hover:text-gray-600"><Edit2 size={16} /></button>
                    </div>
                 </div>
              </div>

              {/* Item Card 3 */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 group hover:border-[#008751] transition-colors cursor-pointer relative">
                 <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 cursor-grab">
                    <GripVertical size={20} />
                 </div>
                 <div className="pl-6 flex items-start justify-between">
                    <div>
                       <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">Fuel Level <span className="text-red-500">*</span></h3>
                       </div>
                        <div className="text-sm text-gray-500">
                          <span>Choices: <strong>Full, 3/4, 1/2, 1/4 (Fail), Empty (Fail)</strong></span>
                       </div>
                    </div>
                    <div className="flex gap-2">
                         <span className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                            <Droplets size={12} /> Dropdown
                         </span>
                         <button className="text-gray-400 hover:text-gray-600"><Edit2 size={16} /></button>
                    </div>
                 </div>
              </div>

            </div>
         </div>

         {/* Sidebar Tools */}
         <div className="w-72 bg-white border-l border-gray-200 p-4 overflow-y-auto hidden lg:block">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Add Items</h3>
            <div className="space-y-2">
               {['Pass / Fail', 'Meter Entry', 'Number', 'Dropdown', 'Free Text', 'Photo', 'Signature', 'Date / Time', 'Section'].map((item) => (
                  <button key={item} className="w-full flex items-center gap-3 p-3 bg-white border border-gray-200 rounded hover:border-[#008751] hover:shadow-sm text-sm text-gray-700 font-medium transition-all text-left">
                     <Plus size={16} className="text-[#008751]" /> {item}
                  </button>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default InspectionCreate;