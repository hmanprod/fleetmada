'use client';

import React, { useState } from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ServiceTask {
  id: number;
  name: string;
  entryCount: number;
  reminderCount: number;
  programCount: number;
  woCount: number;
  categoryCode: string;
  systemCode: string;
  assemblyCode: string;
}

const mockTasks: ServiceTask[] = [
  { id: 1, name: 'ABS Control Module Replacement', entryCount: 0, reminderCount: 0, programCount: 0, woCount: 0, categoryCode: 'Chassis', systemCode: 'Brakes', assemblyCode: 'ABS, Anti-Lock System' },
  { id: 2, name: 'A/C Accumulator Replacement', entryCount: 0, reminderCount: 0, programCount: 0, woCount: 0, categoryCode: 'Cab, Climate Control', systemCode: 'Air Conditioning', assemblyCode: 'Air Conditioning Assembly' },
  { id: 3, name: 'Accelerator Pedal Inspect', entryCount: 0, reminderCount: 0, programCount: 0, woCount: 0, categoryCode: 'Engine', systemCode: 'Fuel System', assemblyCode: 'Throttle Controls' },
  { id: 4, name: 'Accessories/Upfitting (Miscellaneous)', entryCount: 0, reminderCount: 0, programCount: 0, woCount: 0, categoryCode: 'Accessories', systemCode: '', assemblyCode: '' },
  { id: 5, name: 'A/C Compressor Replacement', entryCount: 0, reminderCount: 0, programCount: 0, woCount: 0, categoryCode: 'Cab, Climate Control', systemCode: 'Air Conditioning', assemblyCode: 'Air Conditioning Assembly' },
  { id: 6, name: 'A/C Condenser Replacement', entryCount: 0, reminderCount: 0, programCount: 0, woCount: 0, categoryCode: 'Cab, Climate Control', systemCode: 'Air Conditioning', assemblyCode: 'Air Conditioning Assembly' },
  { id: 7, name: 'A/C Evaporator Core Replacement', entryCount: 0, reminderCount: 0, programCount: 0, woCount: 0, categoryCode: 'Cab, Climate Control', systemCode: 'Air Conditioning', assemblyCode: 'Air Conditioning Assembly' },
  { id: 8, name: 'A/C Expansion Valve Replacement', entryCount: 0, reminderCount: 0, programCount: 0, woCount: 0, categoryCode: 'Cab, Climate Control', systemCode: 'Air Conditioning', assemblyCode: 'Air Conditioning Assembly' },
  { id: 9, name: 'A/C Receiver Dryer Assembly Replacement', entryCount: 0, reminderCount: 0, programCount: 0, woCount: 0, categoryCode: 'Cab, Climate Control', systemCode: 'Air Conditioning', assemblyCode: 'Air Conditioning Assembly' },
  { id: 10, name: 'A/C System Evacuate & Recharge', entryCount: 0, reminderCount: 0, programCount: 0, woCount: 0, categoryCode: 'Cab, Climate Control', systemCode: 'Air Conditioning', assemblyCode: 'Air Conditioning Assembly' },
  { id: 11, name: 'Admin/Misc Charges', entryCount: 0, reminderCount: 0, programCount: 0, woCount: 0, categoryCode: 'Bulk Product Transfer', systemCode: 'Total Vehicle Assembly', assemblyCode: 'Total Vehicle Assembly' },
  { id: 12, name: 'Air Bag - Assembly, Drivers Door', entryCount: 0, reminderCount: 0, programCount: 0, woCount: 0, categoryCode: 'Cab, Climate Control', systemCode: 'Cab & Sheet Metal', assemblyCode: 'Occupant Safety Devices' },
];

export default function ServiceTasksPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);

  const handleAddServiceTask = () => {
    router.push('/dashboard/service/tasks/create');
  };

  const handleTaskClick = (taskId: number) => {
    // TODO: Navigate to task detail page
    console.log('Navigate to task:', taskId);
  };

  const handleSelectTask = (taskId: number) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === mockTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(mockTasks.map(task => task.id));
    }
  };

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-3xl font-bold text-gray-900">Service Tasks</h1>
         <div className="flex gap-2">
           <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button>
           <button 
             onClick={handleAddServiceTask}
             className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
           >
             <Plus size={20} /> Add Service Task
           </button>
       </div>
      </div>
      
      <div className="flex gap-4 mb-6 text-sm font-medium border-b border-gray-200">
         <button 
           onClick={() => setActiveTab('active')}
           className={`pb-3 border-b-2 ${activeTab === 'active' ? 'border-[#008751] text-[#008751]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
         >
           Active
         </button>
         <button 
           onClick={() => setActiveTab('archived')}
           className={`pb-3 border-b-2 ${activeTab === 'archived' ? 'border-[#008751] text-[#008751]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
         >
           Archived
         </button>
      </div>

       <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
         <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]" 
            />
         </div>
          <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
             Service Task Type <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
          </button>
           <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
             Default Category Code <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
          </button>
           <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
             Default System Code <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
          </button>
         <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
           <Filter size={14} /> Filters
         </button>
         <div className="flex-1 text-right text-sm text-gray-500">
            1 - 50 of 400
         </div>
          <div className="flex gap-1">
             <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} className="rotate-180" /></button>
             <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} /></button>
          </div>
       </div>
      
       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
         <table className="min-w-full divide-y divide-gray-200 text-sm">
           <thead className="bg-gray-50">
             <tr>
                <th className="w-8 px-4 py-3">
                  <input 
                    type="checkbox" 
                    checked={selectedTasks.length === mockTasks.length && mockTasks.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]" 
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Service Entries</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Service Reminders</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Service Programs</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Work Orders</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Default Reason For Repair Code</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Default Category Code</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Default System Code</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Default Assembly Code</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-gray-200">
              {mockTasks.map(task => (
                 <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input 
                        type="checkbox" 
                        checked={selectedTasks.includes(task.id)}
                        onChange={() => handleSelectTask(task.id)}
                        className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]" 
                      />
                    </td>
                    <td 
                      className="px-4 py-3 font-medium text-gray-900 underline decoration-dotted underline-offset-4 cursor-pointer"
                      onClick={() => handleTaskClick(task.id)}
                    >
                      {task.name} <span className="ml-1 inline-block bg-gray-100 text-gray-600 text-[10px] px-1 rounded">S</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">—</td>
                    <td className="px-4 py-3 text-[#008751]">{task.entryCount}</td>
                    <td className="px-4 py-3 text-[#008751]">{task.reminderCount}</td>
                    <td className="px-4 py-3 text-[#008751]">{task.programCount}</td>
                    <td className="px-4 py-3 text-[#008751]">{task.woCount}</td>
                    <td className="px-4 py-3 text-gray-500">—</td>
                    <td className="px-4 py-3 text-gray-900">{task.categoryCode}</td>
                    <td className="px-4 py-3 text-gray-900">{task.systemCode}</td>
                    <td className="px-4 py-3 text-gray-900">{task.assemblyCode}</td>
                 </tr>
              ))}
           </tbody>
         </table>
       </div>
    </div>
  );
}