'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ServiceTaskCreatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subtasks: ''
  });

  const handleBack = () => {
    router.push('/dashboard/service/tasks');
  };

  const handleSave = () => {
    console.log('Saving service task:', formData);
    // TODO: Implement save logic
    router.push('/dashboard/service/tasks');
  };

  const handleCancel = () => {
    router.push('/dashboard/service/tasks');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isStep1Valid = formData.name.trim() !== '';

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <span>Service Tasks</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">New Custom Service Task</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={handleCancel} data-testid="cancel-button" className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Cancel</button>
          <button
            onClick={handleSave}
            data-testid="save-button"
            disabled={!isStep1Valid}
            className={`px-4 py-2 font-bold rounded shadow-sm ${isStep1Valid
                ? 'bg-[#008751] hover:bg-[#007043] text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            Save Service Task
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">

        {/* Step 1: Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center gap-3">
            <div className="h-6 w-6 rounded-full bg-[#008751] text-white flex items-center justify-center text-sm font-bold">1</div>
            <h2 className="text-lg font-bold text-gray-900">Details</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                data-testid="task-name"
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
              />
              <p className="mt-1 text-xs text-gray-500">
                A brief title for your unique task.
                <button className="text-[#008751] hover:underline ml-1">
                  See examples
                </button>
                {' '}of FleetMada's comprehensive list of Standard Service Tasks that cover most common repairs and maintenance.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
              ></textarea>
              <p className="mt-1 text-xs text-gray-500">Additional details about the service/maintenance task.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtasks</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={formData.subtasks}
                  onChange={(e) => handleInputChange('subtasks', e.target.value)}
                  placeholder="Select Service Tasks"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Only Service Tasks without Subtasks can be added.</p>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={handleCancel} className="text-gray-500 font-medium hover:text-gray-700 mr-4">Cancel</button>
              <button
                className={`py-2 px-4 rounded font-bold ${isStep1Valid
                    ? 'bg-[#008751] hover:bg-[#007043] text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                disabled={!isStep1Valid}
              >
                Continue
              </button>
            </div>
          </div>
        </div>

        {/* Step 2: Fleetio Recommendations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 flex items-center gap-3">
            <div className="h-6 w-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold">2</div>
            <h2 className="text-lg font-bold text-gray-900">FleetMada Recommendations</h2>
          </div>
          <div className="p-6">
            <div className="text-center py-8 text-gray-500">
              <p>Step 2 content will be available after completing Step 1</p>
            </div>
          </div>
        </div>

        {/* Step 3: Maintenance Categorization */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 flex items-center gap-3">
            <div className="h-6 w-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold">3</div>
            <h2 className="text-lg font-bold text-gray-900">Maintenance Categorization</h2>
          </div>
          <div className="p-6">
            <div className="text-center py-8 text-gray-500">
              <p>Step 3 content will be available after completing Step 1</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-4 text-center text-sm text-gray-600 flex items-center justify-center gap-1">
          Need help getting started with Service Tasks?
          <button className="text-[#008751] font-medium flex items-center gap-1 hover:underline">
            Learn More
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}