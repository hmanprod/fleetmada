'use client';

import React, { useState } from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ServiceReminder {
  id: number;
  vehicle: string;
  task: string;
  status: string;
  nextDue: string;
  compliance: number;
}

const mockReminders: ServiceReminder[] = [
  { id: 1, vehicle: 'AP101', task: 'Tire Rotation', status: 'Overdue', nextDue: '4 months ago', compliance: 100 },
  { id: 2, vehicle: 'AP101', task: 'Engine Oil & Filter Replacement', status: 'Overdue', nextDue: '3 months ago', compliance: 67 },
  { id: 3, vehicle: 'RP101', task: 'Engine Oil & Filter Replacement', status: 'Overdue', nextDue: '5 months ago', compliance: 100 },
  { id: 4, vehicle: 'BSA111TRNS', task: 'Diesel Emissions Fluid Fill', status: 'Overdue', nextDue: '1 month ago', compliance: 50 },
  { id: 5, vehicle: 'RP101', task: 'Tire Rotation', status: 'Overdue', nextDue: '4 months ago', compliance: 100 },
  { id: 6, vehicle: 'BSA113TRNS', task: 'Diesel Emissions Fluid Fill', status: 'Overdue', nextDue: '3 weeks ago', compliance: 50 },
  { id: 7, vehicle: 'BS102', task: 'Diesel Emissions Fluid Fill', status: 'Overdue', nextDue: '2 weeks ago', compliance: 50 },
];

export default function ServiceRemindersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedReminders, setSelectedReminders] = useState<number[]>([]);

  const handleAddServiceReminder = () => {
    router.push('/reminders/service/create'); // Navigate to create page
  };

  const handleLearnMore = () => {
    // TODO: Navigate to documentation or help page
    console.log('Navigate to learn more about service reminders');
  };

  const handleEnableForecasting = () => {
    // TODO: Enable forecasting feature
    console.log('Enable forecasting');
  };

  const handleReminderClick = (reminderId: number) => {
    router.push(`/reminders/service/${reminderId}`); // Navigate to detail page
  };

  const handleSelectReminder = (reminderId: number) => {
    setSelectedReminders(prev =>
      prev.includes(reminderId)
        ? prev.filter(id => id !== reminderId)
        : [...prev, reminderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedReminders.length === mockReminders.length) {
      setSelectedReminders([]);
    } else {
      setSelectedReminders(mockReminders.map(reminder => reminder.id));
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Service Reminders</h1>
          <button
            onClick={handleLearnMore}
            className="text-gray-500 hover:bg-gray-100 p-1 rounded text-xs bg-gray-50 border border-gray-200 px-2"
          >
            Learn
          </button>
          <button
            onClick={handleEnableForecasting}
            className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm font-medium"
          >
            <Zap size={14} className="text-[#008751] fill-[#008751]" /> Enable Forecasting
          </button>
        </div>
        <div className="flex gap-2">
          <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button>
          <button
            onClick={handleAddServiceReminder}
            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          >
            <Plus size={20} /> Add Service Reminder
          </button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'all'
              ? 'border-[#008751] text-[#008751]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('due-soon')}
          className={`px-4 py-2 text-sm font-medium border-transparent text-gray-500 hover:text-gray-700 flex items-center gap-1.5 ${activeTab === 'due-soon' ? 'border-b-2 border-[#008751] text-[#008751]' : ''
            }`}
        >
          <div className="w-2 h-2 rounded-full bg-orange-400"></div> Due Soon <span className="bg-gray-100 text-gray-600 rounded-full px-2 text-xs ml-1">6</span>
        </button>
        <button
          onClick={() => setActiveTab('overdue')}
          className={`px-4 py-2 text-sm font-medium border-transparent text-gray-500 hover:text-gray-700 flex items-center gap-1.5 ${activeTab === 'overdue' ? 'border-b-2 border-[#008751] text-[#008751]' : ''
            }`}
        >
          <div className="w-2 h-2 rounded-full bg-red-500"></div> Overdue <span className="bg-gray-100 text-gray-600 rounded-full px-2 text-xs ml-1">10</span>
        </button>
        <button
          onClick={() => setActiveTab('snoozed')}
          className={`px-4 py-2 text-sm font-medium border-transparent text-gray-500 hover:text-gray-700 flex items-center gap-1.5 ${activeTab === 'snoozed' ? 'border-b-2 border-[#008751] text-[#008751]' : ''
            }`}
        >
          <div className="w-2 h-2 rounded-full bg-gray-400"></div> Snoozed
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
          Vehicle <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
        </button>
        <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          Service Task <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
        </button>
        <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          Vehicle Group <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
        </button>
        <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          Watcher <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
        </button>
        <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          <Filter size={14} /> Filters
        </button>
        <div className="flex-1 text-right text-sm text-gray-500">
          1 - 50 of 161
        </div>
        <div className="flex gap-1">
          <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} className="rotate-180" /></button>
          <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="bg-white mb-6 p-4 rounded-lg border border-gray-200 grid grid-cols-4 gap-4 text-center divide-x divide-gray-200">
        <div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Overdue Vehicles</div>
          <div className="text-2xl font-bold text-red-600">7</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Due Soon Vehicles</div>
          <div className="text-2xl font-bold text-orange-500">6</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Snoozed Vehicles</div>
          <div className="text-2xl font-bold text-gray-900">0</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Average Compliance</div>
          <div className="text-2xl font-bold text-[#008751]">98% <span className="text-xs text-gray-500 font-normal">on-time</span></div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8 px-6 py-3">
                <input
                  type="checkbox"
                  checked={selectedReminders.length === mockReminders.length && mockReminders.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]"
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Task</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Due</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incomplete Work Order</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Completed</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compliance</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockReminders.map((reminder) => (
              <tr
                key={reminder.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleReminderClick(reminder.id)}
              >
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedReminders.includes(reminder.id)}
                    onChange={() => handleSelectReminder(reminder.id)}
                    className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <img src={`https://source.unsplash.com/random/50x50/?truck&sig=${reminder.id}`} className="w-6 h-6 rounded object-cover" alt="" />
                    <div>
                      <div className="text-sm font-bold text-[#008751] hover:underline">{reminder.vehicle}</div>
                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Sample</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                  {reminder.task}
                  <div className="text-xs text-gray-500 font-normal">Every 5 month(s) or 7,500 miles</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="flex items-center gap-1.5 text-sm text-red-600 font-medium">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div> {reminder.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium underline decoration-dotted underline-offset-4">
                  {reminder.nextDue}
                  <div className="text-xs text-red-600 font-normal">12,219 miles overdue</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  —
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#008751]">
                  03/15/2025
                  <div className="text-xs text-gray-500">36,550 mi</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {reminder.compliance}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}