'use client';

import React, { useState } from 'react';
import { ArrowLeft, Upload, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VehicleCreatePage() {
  const router = useRouter();
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [vin, setVin] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [mileage, setMileage] = useState('');

  const handleCancel = () => {
    router.push('/dashboard/vehicles');
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Save vehicle:', { make, model, year, vin, licensePlate, mileage });
    router.push('/dashboard/vehicles');
  };
  
  return (
    <div className="bg-gray-50 min-h-screen">
       <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
         <div className="flex items-center gap-4">
             <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
                 <ArrowLeft size={18} /> Vehicles
             </button>
             <h1 className="text-2xl font-bold text-gray-900">New Vehicle</h1>
         </div>
         <div className="flex gap-3">
             <button onClick={handleCancel} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Cancel</button>
             <button onClick={handleSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Vehicle</button>
         </div>
       </div>

       <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
             <h2 className="text-lg font-bold text-gray-900 mb-6">Basic Information</h2>
             
             <div className="grid grid-cols-2 gap-6">
                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Make <span className="text-red-500">*</span></label>
                     <input 
                       type="text" 
                       value={make} 
                       onChange={e => setMake(e.target.value)}
                       placeholder="e.g. Ford, Toyota, Chevrolet"
                       className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" 
                     />
                 </div>

                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Model <span className="text-red-500">*</span></label>
                     <input 
                       type="text" 
                       value={model} 
                       onChange={e => setModel(e.target.value)}
                       placeholder="e.g. F-150, Camry, Silverado"
                       className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" 
                     />
                 </div>

                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Year <span className="text-red-500">*</span></label>
                     <input 
                       type="number" 
                       value={year} 
                       onChange={e => setYear(e.target.value)}
                       placeholder="e.g. 2020"
                       className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" 
                     />
                 </div>

                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">VIN <span className="text-red-500">*</span></label>
                     <input 
                       type="text" 
                       value={vin} 
                       onChange={e => setVin(e.target.value)}
                       placeholder="17-character Vehicle Identification Number"
                       className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" 
                     />
                 </div>

                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
                     <input 
                       type="text" 
                       value={licensePlate} 
                       onChange={e => setLicensePlate(e.target.value)}
                       placeholder="License plate number"
                       className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" 
                     />
                 </div>

                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Current Mileage</label>
                     <input 
                       type="number" 
                       value={mileage} 
                       onChange={e => setMileage(e.target.value)}
                       placeholder="Current odometer reading"
                       className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" 
                     />
                 </div>
             </div>
          </div>

          {/* Vehicle Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
             <h2 className="text-lg font-bold text-gray-900 mb-6">Vehicle Details</h2>
             
             <div className="grid grid-cols-2 gap-6">
                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                     <select className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]">
                         <option>Please select</option>
                         <option>Car</option>
                         <option>Truck</option>
                         <option>Van</option>
                         <option>Motorcycle</option>
                         <option>Trailer</option>
                     </select>
                 </div>

                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                     <select className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]">
                         <option>Please select</option>
                         <option>Gasoline</option>
                         <option>Diesel</option>
                         <option>Electric</option>
                         <option>Hybrid</option>
                         <option>CNG</option>
                     </select>
                 </div>

                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
                     <select className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]">
                         <option>Please select</option>
                         <option>Automatic</option>
                         <option>Manual</option>
                         <option>CVT</option>
                     </select>
                 </div>

                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Drive Type</label>
                     <select className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]">
                         <option>Please select</option>
                         <option>2WD</option>
                         <option>4WD</option>
                         <option>AWD</option>
                     </select>
                 </div>
             </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
             <h2 className="text-lg font-bold text-gray-900 mb-6">Location</h2>
             
             <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Location</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input 
                          type="text" 
                          placeholder="Address or location name"
                          className="w-full pl-10 p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" 
                        />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input type="text" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                        <input type="text" className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" />
                     </div>
                 </div>
             </div>
          </div>

          {/* Photos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
             <h2 className="text-lg font-bold text-gray-900 mb-6">Vehicle Photos</h2>
             
             <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                 <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                 <div className="space-y-2">
                     <p className="text-sm text-gray-600">
                         <span className="font-medium text-[#008751] hover:text-[#007043] cursor-pointer">Click to upload</span> or drag and drop
                     </p>
                     <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 10MB each</p>
                 </div>
             </div>
          </div>

          {/* Custom Fields */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
             <h2 className="text-lg font-bold text-gray-900 mb-6">Additional Information</h2>
             
             <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea 
                      rows={4} 
                      placeholder="Any additional notes about this vehicle..."
                      className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                    ></textarea>
                 </div>
             </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 pb-12">
             <button onClick={handleCancel} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded border border-gray-300 bg-white">Cancel</button>
             <button onClick={handleSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Vehicle</button>
         </div>
       </div>
    </div>
  );
}