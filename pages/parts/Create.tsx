import React from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';

interface PartCreateProps {
  onCancel: () => void;
  onSave: () => void;
}

const PartCreate: React.FC<PartCreateProps> = ({ onCancel, onSave }) => {
  return (
    <div className="bg-gray-50 min-h-screen">
       <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
         <div className="flex items-center gap-4">
             <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
                 <ArrowLeft size={18} /> Parts
             </button>
             <h1 className="text-2xl font-bold text-gray-900">New Part</h1>
         </div>
         <div className="flex gap-3">
             <button onClick={onCancel} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Cancel</button>
             <button onClick={onSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Part</button>
         </div>
       </div>

       <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
          {/* Details Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
             <h2 className="text-lg font-bold text-gray-900 mb-6">Details</h2>
             
             <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Part Number <span className="text-red-500">*</span></label>
                    <input type="text" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                    <p className="mt-1 text-xs text-gray-500">Internal part identifier. Must be unique per part.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea rows={3} className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"></textarea>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                        <div className="flex items-center gap-2">
                            <button className="bg-[#008751] text-white px-3 py-1.5 rounded text-sm font-medium">Pick File</button>
                            <button className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded text-sm border border-gray-300 border-dashed">Or drop file here</button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 italic">No file selected</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Document</label>
                        <div className="flex items-center gap-2">
                            <button className="bg-[#008751] text-white px-3 py-1.5 rounded text-sm font-medium">Pick File</button>
                            <button className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded text-sm border border-gray-300 border-dashed">Or drop file here</button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 italic">No file selected</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]">
                        <option>Please select</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                    <select className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]">
                        <option>Please select</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer Part #</label>
                        <input type="text" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                        <p className="mt-1 text-xs text-gray-500">Manufacturer specific part number that can differentiate the part from an internal part number.</p>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">UPC</label>
                         <input type="text" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost</label>
                        <div className="relative">
                             <input type="text" defaultValue="Ar" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                             <div className="absolute right-3 top-2 flex flex-col items-center">
                                 <ChevronDown size={12} className="rotate-180 text-gray-400"/>
                                 <ChevronDown size={12} className="text-gray-400"/>
                             </div>
                         </div>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Measurement Unit</label>
                         <select className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]">
                            <option>Please select</option>
                        </select>
                    </div>
                </div>
             </div>
          </div>

          {/* Locations */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
             <h2 className="text-lg font-bold text-gray-900 mb-6">Locations</h2>
             
             <div>
                 <p className="text-sm text-gray-600 mb-2">You do not have access to any Part Locations</p>
                 <select className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]" disabled>
                    <option>Please select</option>
                </select>
             </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 pb-12">
             <button onClick={onCancel} className="text-[#008751] font-medium hover:underline mr-auto ml-2">Cancel</button>
             <button className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded border border-gray-300 bg-white">Save & Add Another</button>
             <button onClick={onSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Part</button>
         </div>

       </div>
    </div>
  );
};

export default PartCreate;