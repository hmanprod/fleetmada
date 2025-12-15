'use client';

import React from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, ChevronDown, Settings, Lightbulb, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function IssuesPage() {
  const router = useRouter();

  const handleAdd = () => {
    router.push('/issues/create');
  };

  const handleRowClick = (id: number) => {
    router.push(`/issues/${id}`);
  };

  const issues = [
    { id: 1, priority: 'Critical', vehicle: 'AC101', type: 'Vehicle', issueNo: '#1', summary: 'Dead battery', status: 'Open', reported: '08/22/2025', assigned: '', watchers: '1 watcher', labels: [] },
    { id: 2, priority: 'Critical', vehicle: 'AM101', type: 'Vehicle', issueNo: '#2', summary: 'Oil leak', status: 'Open', reported: '11/16/2025', assigned: '', watchers: '1 watcher', labels: [] },
    { id: 3, priority: 'High', vehicle: 'AP101', type: 'Vehicle', issueNo: '#3', summary: 'Flat tire', status: 'Open', reported: '08/16/2025', assigned: '', watchers: '1 watcher', labels: [] },
    { id: 4, priority: 'Medium', vehicle: 'AS101', type: 'Vehicle', issueNo: '#4', summary: 'Brake light', status: 'Open', reported: '11/28/2025', assigned: '', watchers: '1 watcher', labels: [] },
    { id: 5, priority: 'Medium', vehicle: 'AT101', type: 'Vehicle', issueNo: '#5', summary: 'Brake pads worn', status: 'Closed', reported: '07/20/2025', assigned: '', watchers: '1 watcher', labels: [] },
    { id: 6, priority: 'Low', vehicle: 'AV101', type: 'Vehicle', issueNo: '#6', summary: 'Bad Engine Air Filter', status: 'Resolved', reported: '06/01/2025', assigned: '', watchers: '1 watcher', labels: [] },
    { id: 7, priority: 'Medium', vehicle: 'BF101', type: 'Vehicle', issueNo: '#7', summary: 'Need Transfluid', status: 'Resolved', reported: '05/13/2025', assigned: '', watchers: '', labels: [] },
    { id: 8, priority: 'High', vehicle: 'BS102', type: 'Vehicle', issueNo: '#8', summary: '[Recall] Dtna is recalling certain model year 2011 business class m2...', status: 'Open', reported: '12/13/2025', assigned: '', watchers: '', labels: ['Recall #11V289000'] },
    { id: 9, priority: 'High', vehicle: 'BS101', type: 'Vehicle', issueNo: '#9', summary: '[Recall] Dtna is recalling certain model year 2011 business class m2...', status: 'Resolved', reported: '12/03/2025', assigned: '', watchers: '', labels: ['Recall #11V289000'] },
  ];

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'Critical': return 'text-red-600 bg-red-50';
      case 'High': return 'text-orange-600 bg-orange-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Open': return 'bg-yellow-400 text-yellow-900 border-yellow-500';
      case 'Closed': return 'bg-gray-500 text-white border-gray-600';
      case 'Resolved': return 'bg-green-600 text-white border-green-700';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const getPriorityIconColor = (p: string) => {
    switch (p) {
      case 'Critical': return 'text-red-600';
      case 'High': return 'text-orange-600';
      case 'Medium': return 'text-orange-400';
      case 'Low': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  }

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Issues</h1>
          <button className="text-gray-500 hover:bg-gray-100 p-1 rounded text-xs bg-gray-50 border border-gray-200 px-2 flex items-center gap-1">
            <Lightbulb size={12} /> Learn
          </button>
        </div>

        <div className="flex gap-2">
          <button className="text-[#008751] hover:bg-green-50 font-medium py-2 px-3 rounded flex items-center gap-1 text-sm bg-transparent">
            <Zap size={16} /> Automations <ChevronDown size={14} />
          </button>
          <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button>
          <button
            onClick={handleAdd}
            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          >
            <Plus size={20} /> Add Issue
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 mb-6 font-medium text-sm">
        <button className="pb-3 border-b-2 border-transparent hover:text-gray-700 text-gray-500 flex items-center gap-1">All <MoreHorizontal size={14} /></button>
        <button className="pb-3 border-b-2 border-[#008751] text-[#008751] font-bold">Open</button>
        <button className="pb-3 border-b-2 border-transparent hover:text-gray-700 text-gray-500">Overdue</button>
        <button className="pb-3 border-b-2 border-transparent hover:text-gray-700 text-gray-500">Resolved</button>
        <button className="pb-3 border-b-2 border-transparent hover:text-gray-700 text-gray-500">Closed</button>
        <button className="pb-3 border-b-2 border-transparent hover:text-green-700 text-[#008751] flex items-center gap-1"><Plus size={14} /> Add Tab</button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search" className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]" />
        </div>
        <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          Issue Assigned To <ChevronDown size={14} />
        </button>
        <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          Labels <ChevronDown size={14} />
        </button>
        <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          <Filter size={14} /> Filters
        </button>

        <div className="flex-1 text-right text-sm text-gray-500">
          1 - 9 of 9
        </div>
        <div className="flex gap-1 ml-auto">
          <button className="p-1 border border-gray-300 rounded text-gray-400 bg-gray-50 disabled"><ChevronRight size={16} className="rotate-180" /></button>
          <button className="p-1 border border-gray-300 rounded text-gray-400 bg-gray-50 disabled"><ChevronRight size={16} /></button>
        </div>
        <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          Group: None <ChevronDown size={14} />
        </button>
        <button className="p-1.5 border border-gray-300 rounded text-gray-600 bg-white"><Settings size={16} /></button>
        <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          Save View <ChevronDown size={14} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-white border-b border-gray-200">
            <tr>
              <th className="w-8 px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Priority</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Name</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Type</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900 cursor-pointer flex items-center gap-1">Issue ▲</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Summary</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Issue Status</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Source</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Reported Date</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Assigned</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Labels</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Watchers</th>
              <th className="px-4"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {issues.map(issue => (
              <tr key={issue.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(issue.id)}>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}><input type="checkbox" className="rounded border-gray-300" /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 font-medium">
                    <div className={`${getPriorityIconColor(issue.priority)}`}><ChevronRight className="-rotate-90" size={14} strokeWidth={3} /></div>
                    <span className="text-gray-700">{issue.priority}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <img src={`https://source.unsplash.com/random/50x50/?truck&sig=${issue.id}`} className="w-6 h-6 rounded object-cover" alt="" />
                    <div className="flex flex-col">
                      <span className="text-[#008751] font-bold hover:underline cursor-pointer">{issue.vehicle}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-1 rounded w-fit">Sample</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{issue.type}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{issue.issueNo} <span className="text-xs bg-gray-100 px-1 rounded text-gray-500 font-normal">Sample</span></td>
                <td className="px-4 py-3 text-gray-900 font-medium">
                  {issue.summary}
                  {issue.labels.length > 0 && <span className="ml-2 text-[#008751] text-xs hover:underline cursor-pointer">{issue.labels[0]}</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${getStatusColor(issue.status)}`}>{issue.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-400">—</td>
                <td className="px-4 py-3 text-gray-900 underline decoration-dotted underline-offset-4">{issue.reported}</td>
                <td className="px-4 py-3 text-gray-400">—</td>
                <td className="px-4 py-3 text-gray-400">—</td>
                <td className="px-4 py-3 text-gray-500 hover:text-[#008751] hover:underline">{issue.watchers}</td>
                <td className="px-4 py-3 text-right">
                  <span className="text-gray-400 flex gap-2">
                    <div onClick={e => e.stopPropagation()}><Settings size={14} className="hover:text-gray-600" /></div>
                    <div onClick={e => e.stopPropagation()}><Settings size={14} className="hover:text-gray-600" /></div>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}