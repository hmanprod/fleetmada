'use client';

import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ServiceProgramCreatePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [primaryMeter, setPrimaryMeter] = useState('Miles');
  const [secondaryMeter, setSecondaryMeter] = useState(false);
  const [template, setTemplate] = useState('');

  const handleBack = () => {
    router.push('/dashboard/service/programs');
  };

  const handleSave = () => {
    console.log('Saving service program:', {
      name,
      primaryMeter,
      secondaryMeter,
      template
    });
    // TODO: Implement save logic
    router.push('/dashboard/service/programs');
  };

  const handleCancel = () => {
    router.push('/dashboard/service/programs');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
       <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
         <div>
             <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
               Service Programs <span className="text-gray-300">/</span> New
             </div>
             <h1 className="text-2xl font-bold text-gray-900">New Service Program</h1>
         </div>
         <div className="flex gap-3">
             <button onClick={handleCancel} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Cancel</button>
             <button onClick={handleSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Service Program</button>
         </div>
       </div>

       <div className="max-w-3xl mx-auto py-8 px-4">
           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-6">
               <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" 
                  />
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                   <select 
                     value={template}
                     onChange={(e) => setTemplate(e.target.value)}
                     className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
                   >
                       <option value="">Please select</option>
                       <option value="basic">Basic Vehicle Maintenance</option>
                       <option value="heavy">Heavy Duty Service</option>
                       <option value="custom">Custom Template</option>
                   </select>
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                  <div className="flex items-center gap-2">
                     <button className="bg-[#008751] hover:bg-[#007043] text-white text-sm font-medium px-4 py-2 rounded">Pick File</button>
                     <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded border border-gray-300 border-dashed">Or drop file here</button>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 italic">No file selected</p>
               </div>

               <div>
                   <label className="block text-sm font-bold text-gray-900 mb-1 flex items-center gap-1">
                     Primary Meter <span className="text-red-500">*</span> <Lock size={12} className="text-gray-400"/>
                   </label>
                   <p className="text-sm text-gray-500 mb-2">Select how you measure utilization for this service program.</p>
                   <div className="space-y-2">
                       <label className="flex items-center gap-2">
                           <input 
                              type="radio" 
                              name="primaryMeter" 
                              checked={primaryMeter === 'Miles'} 
                              onChange={() => setPrimaryMeter('Miles')}
                              className="text-[#008751] focus:ring-[#008751]" 
                            />
                           <span className="text-sm text-gray-900">Miles</span>
                       </label>
                       <label className="flex items-center gap-2">
                           <input 
                              type="radio" 
                              name="primaryMeter" 
                              checked={primaryMeter === 'Kilometers'} 
                              onChange={() => setPrimaryMeter('Kilometers')}
                              className="text-[#008751] focus:ring-[#008751]" 
                            />
                           <span className="text-sm text-gray-900">Kilometers</span>
                       </label>
                       <label className="flex items-center gap-2">
                           <input 
                              type="radio" 
                              name="primaryMeter" 
                              checked={primaryMeter === 'Hours'} 
                              onChange={() => setPrimaryMeter('Hours')}
                              className="text-[#008751] focus:ring-[#008751]" 
                            />
                           <span className="text-sm text-gray-900">Hours</span>
                       </label>
                   </div>
               </div>

               <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-start gap-3">
                         <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input 
                              type="checkbox" 
                              name="secondaryMeter" 
                              id="secondaryMeter"
                              checked={secondaryMeter}
                              onChange={(e) => setSecondaryMeter(e.target.checked)}
                              className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300"
                            />
                            <label 
                              htmlFor="secondaryMeter" 
                              className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                            ></label>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-900 mb-1">Secondary Meter</label>
                             <p className="text-sm text-gray-500">
                               Turn on to utilize an additional meter on the service program. This is useful for tracking service for vehicle engine hours or attached vehicle equipment (concrete mixer, welder, trailer, etc.)
                             </p>
                        </div>
                    </div>
               </div>
           </div>

           <div className="mt-6 flex justify-between">
               <button onClick={handleCancel} className="text-[#008751] font-medium hover:underline">Cancel</button>
               <button onClick={handleSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Service Program</button>
           </div>
       </div>
    </div>
  );
}