'use client';

import React, { useState } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FuelEntryCreatePage() {
  const router = useRouter();
  const [vehicle, setVehicle] = useState('');
  const [date, setDate] = useState('');
  const [vendor, setVendor] = useState('');
  const [volume, setVolume] = useState('');
  const [cost, setCost] = useState('');

  const handleCancel = () => {
    router.push('/dashboard/fuel');
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Save fuel entry:', { vehicle, date, vendor, volume, cost });
    router.push('/dashboard/fuel');
  };
  
  return (
    <div className="bg-gray-50 min-h-screen">
       <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
         <div className="flex items-center gap-4">
             <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
                 <ArrowLeft size={18} /> Fuel Entries
             </button>
             <h1 className="text-2xl font-bold text-gray-900">New Fuel Entry</h1>
         </div>
         <div className="flex gap-3">
             <button onClick={handleCancel} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Cancel</button>
             <button onClick={handleSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Entry</button>
         </div>
       </div>

       <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
             <h2 className="text-lg font-bold text-gray-900 mb-6">Basic Information</h2>
             
             <div className="grid grid-cols-2 gap-6">
                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle <span className="text-red-500">*</span></label>
                     <select 
                       value={vehicle} 
                       onChange={e => setVehicle(e.target.value)}
                       className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" 
                     >
                         <option>Please select</option>
                         <option value="MV112TRNS">MV112TRNS</option>
                         <option value="AM101">AM101</option>
                         <option value="AG103">AG103</option>
                     </select>
                 </div>

                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
                     <input 
                       type="datetime-local" 
                       value={date} 
                       onChange={e => setDate(e.target.value)}
                       className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" 
                     />
                 </div>

                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                     <select 
                       value={vendor} 
                       onChange={e => setVendor(e.target.value)}
                       className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" 
                     >
                         <option>Please select</option>
                         <option value="Chevron">Chevron</option>
                         <option value="Shell">Shell</option>
                         <option value="BP">BP</option>
                     </select>
                 </div>

                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Volume (gallons) <span className="text-red-500">*</span></label>
                     <input 
                       type="number" 
                       step="0.001"
                       value={volume} 
                       onChange={e => setVolume(e.target.value)}
                       className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" 
                     />
                 </div>

                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost</label>
                     <div className="relative">
                         <span className="absolute left-3 top-2.5 text-gray-500">MGA</span>
                         <input 
                           type="number" 
                           value={cost} 
                           onChange={e => setCost(e.target.value)}
                           className="w-full pl-8 p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" 
                         />
                     </div>
                 </div>
             </div>
          </div>

          {/* Meter Reading */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
             <h2 className="text-lg font-bold text-gray-900 mb-6">Meter Reading</h2>
             
             <div className="grid grid-cols-2 gap-6">
                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Odometer (miles)</label>
                     <input 
                       type="number" 
                       className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" 
                     />
                 </div>

                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Engine Hours</label>
                     <input 
                       type="number" 
                       step="0.1"
                       className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" 
                     />
                 </div>
             </div>
          </div>

          {/* Receipt Upload */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
             <h2 className="text-lg font-bold text-gray-900 mb-6">Receipt</h2>
             
             <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                 <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                 <div className="space-y-2">
                     <p className="text-sm text-gray-600">
                         <span className="font-medium text-[#008751] hover:text-[#007043] cursor-pointer">Click to upload</span> or drag and drop
                     </p>
                     <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                 </div>
             </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
             <h2 className="text-lg font-bold text-gray-900 mb-6">Notes</h2>
             <textarea 
               rows={4} 
               placeholder="Add any additional notes..."
               className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
             ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 pb-12">
             <button onClick={handleCancel} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded border border-gray-300 bg-white">Cancel</button>
             <button onClick={handleSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Entry</button>
         </div>
       </div>
    </div>
  );
}