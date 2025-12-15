'use client';

import React, { useState } from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WorkOrder {
  id: number;
  number: string;
  vehicle: string;
  vehicleImage: string;
  status: string;
  repairPriority: string;
  serviceTasks: string[];
  scheduledDate: string;
  assignedTo: string;
  watchers: number;
  operator: string;
  total: number;
}

const mockWorkOrders: WorkOrder[] = [
  { id: 42, number: '#42', vehicle: 'MV110TRNS', vehicleImage: 'truck', status: 'Open', repairPriority: 'Scheduled', serviceTasks: ['Engine Oil & Filter Replacement', 'Tire Rotation'], scheduledDate: '12/19/25', assignedTo: '—', watchers: 0, operator: '—', total: 1336 },
  { id: 43, number: '#43', vehicle: 'MV107TRNS', vehicleImage: 'truck', status: 'Open', repairPriority: 'Scheduled', serviceTasks: ['Engine Air Filter Replacement'], scheduledDate: '12/17/25', assignedTo: '—', watchers: 0, operator: '—', total: 1579 },
];

export default function WorkOrdersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const handleAddWorkOrder = () => {
    router.push('/service/work-orders/create');
  };

  const handleWorkOrderClick = (id: number) => {
    router.push(`/service/work-orders/${id}`);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Work Orders</h1>
        </div>
        <div className="flex gap-2">
          <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button>
          <button
            onClick={handleAddWorkOrder}
            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          >
            <Plus size={20} /> Add Work Order
          </button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'all' ? 'border-[#008751] text-[#008751]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('open')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'open' ? 'border-[#008751] text-[#008751]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Open
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'pending' ? 'border-[#008751] text-[#008751]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Pending
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'completed' ? 'border-[#008751] text-[#008751]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Completed
        </button>
        <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <Plus size={14} /> Add Tab
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
        <div className="flex gap-2">
          <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            Vehicle <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
          </button>
          <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            <Filter size={14} /> Filters
          </button>
        </div>
        <div className="flex-1 text-right text-sm text-gray-500">
          1 - 2 of 2
        </div>
        <div className="flex gap-1">
          <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} className="rotate-180" /></button>
          <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white"><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Repair Priority Class</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Tasks</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled Start Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Watchers</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operator</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockWorkOrders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleWorkOrderClick(order.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <img src={`https://source.unsplash.com/random/50x50/?${order.vehicleImage}&sig=${order.id}`} className="w-8 h-8 rounded object-cover" alt="" />
                    <div>
                      <div className="text-sm font-bold text-[#008751] hover:underline">{order.vehicle}</div>
                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Sample</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#008751] hover:underline">
                  {order.number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-900 font-medium">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div> {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 text-sm text-green-700 font-medium">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div> {order.repairPriority}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <ul className="list-none space-y-1">
                    {order.serviceTasks.slice(0, 2).map((task, i) => (
                      <li key={i} className="underline decoration-dotted underline-offset-2">{task}</li>
                    ))}
                    {order.serviceTasks.length > 2 && <li className="text-gray-500 text-xs">+{order.serviceTasks.length - 2} more</li>}
                  </ul>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.scheduledDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.assignedTo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.watchers}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.operator}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  {order.total.toLocaleString('en-US', { style: 'currency', currency: 'MGA', maximumFractionDigits: 0 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}