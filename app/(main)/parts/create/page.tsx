'use client';

import React, { useState } from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PartCreatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    partNumber: '',
    description: '',
    category: '',
    manufacturer: '',
    manufacturerPartNumber: '',
    upc: '',
    unitCost: 'Ar',
    measurementUnit: ''
  });

  const handleBack = () => {
    router.push('/parts');
  };

  const handleSave = () => {
    console.log('Saving part:', formData);
    // TODO: Implement save logic
    router.push('/parts');
  };

  const handleSaveAndAddAnother = () => {
    console.log('Save and add another:', formData);
    // TODO: Implement save and reset logic
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <ArrowLeft size={18} /> Parts
          </button>
          <h1 className="text-2xl font-bold text-gray-900">New Part</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={handleBack} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Part</button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
        {/* Details Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Details</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Part Number <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.partNumber}
                onChange={(e) => handleInputChange('partNumber', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
              />
              <p className="mt-1 text-xs text-gray-500">Internal part identifier. Must be unique per part.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
              ></textarea>
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
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
              >
                <option value="">Please select</option>
                <option value="engine">Engine Parts</option>
                <option value="transmission">Transmission</option>
                <option value="brakes">Brakes</option>
                <option value="electrical">Electrical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
              <select
                value={formData.manufacturer}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
              >
                <option value="">Please select</option>
                <option value="bosch">Bosch</option>
                <option value="continental">Continental</option>
                <option value="delphi">Delphi</option>
                <option value="denso">Denso</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer Part #</label>
                <input
                  type="text"
                  value={formData.manufacturerPartNumber}
                  onChange={(e) => handleInputChange('manufacturerPartNumber', e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                />
                <p className="mt-1 text-xs text-gray-500">Manufacturer specific part number that can differentiate the part from an internal part number.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UPC</label>
                <input
                  type="text"
                  value={formData.upc}
                  onChange={(e) => handleInputChange('upc', e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.unitCost}
                    onChange={(e) => handleInputChange('unitCost', e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                  />
                  <div className="absolute right-3 top-2 flex flex-col items-center">
                    <ChevronDown size={12} className="rotate-180 text-gray-400" />
                    <ChevronDown size={12} className="text-gray-400" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Measurement Unit</label>
                <select
                  value={formData.measurementUnit}
                  onChange={(e) => handleInputChange('measurementUnit', e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
                >
                  <option value="">Please select</option>
                  <option value="pieces">Pieces</option>
                  <option value="liters">Liters</option>
                  <option value="kilograms">Kilograms</option>
                  <option value="meters">Meters</option>
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
            <select className="w-full p-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-500" disabled>
              <option>Please select</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 pb-12">
          <button onClick={handleBack} className="text-[#008751] font-medium hover:underline mr-auto ml-2">Cancel</button>
          <button onClick={handleSaveAndAddAnother} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded border border-gray-300 bg-white">Save & Add Another</button>
          <button onClick={handleSave} className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm">Save Part</button>
        </div>

      </div>
    </div>
  );
}