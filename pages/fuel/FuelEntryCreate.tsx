import React from 'react';
import { ArrowLeft, Upload } from 'lucide-react';

interface FuelEntryCreateProps {
  onCancel: () => void;
  onSave: () => void;
}

const FuelEntryCreate: React.FC<FuelEntryCreateProps> = ({ onCancel, onSave }) => {
  return (
    <div className="bg-gray-50 min-h-screen">
       <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
         <div className="flex items-center gap-4">
             <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
                 <ArrowLeft size={18} /> Fuel History
             </button>
             <h1 className="text-2xl font-bold text-gray-900">New Fuel Entry</h1>
         </div>
         <div className="flex gap-3">
             <button onClick={onCancel} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Cancel</button>
             <button onClick={onSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Fuel Entry</button>
         </div>
       </div>

       <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
          {/* Details Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
             <h2 className="text-lg font-bold text-gray-900 mb-6">Details</h2>
             
             <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle <span className="text-red-500">*</span></label>
                    <select className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]">
                        <option>Please select</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Entry Date <span className="text-red-500">*</span></label>
                        <input type="date" defaultValue="2025-12-14" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
                         <input type="time" defaultValue="15:46" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                    <select className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]">
                        <option>Please select</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                    <input type="text" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                    <p className="mt-1 text-xs text-gray-500">e.g. invoice number, transaction ID, etc.</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Flags</label>
                    <p className="text-xs text-gray-500 mb-3">Enable the options below to flag transactions for personal use, to ensure accurate metrics for partial fill-ups, or to reset usage after a missed entry. <a href="#" className="text-[#008751]">Learn More</a></p>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]" />
                            <span className="text-sm text-gray-700">Personal</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]" />
                            <span className="text-sm text-gray-700">Partial fuel-up</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]" />
                            <span className="text-sm text-gray-700">Reset usage</span>
                        </label>
                    </div>
                </div>
             </div>
          </div>

          {/* Photos & Documents */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                 <h2 className="text-lg font-bold text-gray-900 mb-4">Photos</h2>
                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="bg-gray-100 p-3 rounded-full mb-3">
                         <Upload size={24} className="text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">Drag and drop files to upload</p>
                    <p className="text-xs text-gray-500 mt-1">or click to pick files</p>
                 </div>
             </div>

             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                 <h2 className="text-lg font-bold text-gray-900 mb-4">Documents</h2>
                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="bg-gray-100 p-3 rounded-full mb-3">
                         <Upload size={24} className="text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">Drag and drop files to upload</p>
                    <p className="text-xs text-gray-500 mt-1">or click to pick files</p>
                 </div>
             </div>
          </div>

          {/* Comments */}
           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
             <h2 className="text-lg font-bold text-gray-900 mb-4">Comments</h2>
             <div className="flex gap-4">
                 <div className="h-10 w-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">HR</div>
                 <textarea className="flex-1 border border-gray-300 rounded-md p-3 focus:ring-[#008751] focus:border-[#008751]" placeholder="Add an optional comment" rows={3}></textarea>
             </div>
           </div>

          <div className="flex justify-end gap-3 pt-4 pb-12">
             <button className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded border border-gray-300 bg-white">Save & Add Another</button>
             <button onClick={onSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Fuel Entry</button>
         </div>

       </div>
    </div>
  );
};

export default FuelEntryCreate;