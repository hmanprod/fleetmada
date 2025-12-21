'use client';

import React, { useState } from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, ChevronDown, Settings, Lightbulb, Zap, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useIssues from '@/lib/hooks/useIssues';
import type { IssueFilters } from '@/lib/services/issues-api';

export default function IssuesPage() {
  const router = useRouter();

  // Initialiser les filtres depuis l'URL si nécessaire (dans une vraie app)
  // Pour l'instant on garde l'état local mais on mettra à jour l'URL
  const [filters, setFilters] = useState<IssueFilters>({
    page: 1,
    limit: 20,
    status: 'OPEN'
  });
  const [searchQuery, setSearchQuery] = useState('');

  const {
    issues,
    loading,
    error,
    pagination,
    fetchIssues,
    clearError
  } = useIssues(filters);

  const handleAdd = () => {
    router.push('/issues/create');
  };

  const handleRowClick = (id: string) => {
    router.push(`/issues/${id}`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const newFilters = { ...filters, search: query || undefined };
    setFilters(newFilters);
    fetchIssues(newFilters);

    // Mettre à jour l'URL
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (query) params.set('search', query);

    router.replace(`/issues?${params.toString()}`);
  };

  const handleFilterChange = (newFilters: Partial<IssueFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchIssues(updatedFilters);

    // Mettre à jour l'URL pour refléter les filtres (utile pour les tests et le partage)
    const params = new URLSearchParams();
    if (updatedFilters.status) params.set('status', updatedFilters.status);
    if (updatedFilters.search) params.set('search', updatedFilters.search);
    if (updatedFilters.priority) params.set('priority', updatedFilters.priority);

    // Utiliser replace pour ne pas empiler l'historique à chaque frappe
    router.replace(`/issues?${params.toString()}`);
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-600 bg-red-50';
      case 'HIGH': return 'text-orange-600 bg-orange-50';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
      case 'LOW': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-yellow-400 text-yellow-900 border-yellow-500';
      case 'CLOSED': return 'bg-gray-500 text-white border-gray-600';
      case 'RESOLVED': return 'bg-green-600 text-white border-green-700';
      case 'IN_PROGRESS': return 'bg-blue-500 text-white border-blue-600';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const getPriorityIconColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-600';
      case 'HIGH': return 'text-orange-600';
      case 'MEDIUM': return 'text-orange-400';
      case 'LOW': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  // Handle loading state
  if (loading && issues.length === 0) {
    return (
      <div className="p-6 max-w-[1800px] mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008751] mx-auto"></div>
            <p className="mt-2 text-gray-500">Chargement des problèmes...</p>
          </div>
        </div>
      </div>
    );
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
            data-testid="add-issue-button"
            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          >
            <Plus size={20} /> Add Issue
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 mb-6 font-medium text-sm">
        <button className={`pb-3 border-b-2 ${filters.status === undefined ? 'border-[#008751] text-[#008751] font-bold' : 'border-transparent hover:text-gray-700 text-gray-500'} flex items-center gap-1`} onClick={() => handleFilterChange({ status: undefined })}>All <MoreHorizontal size={14} /></button>
        <button className={`pb-3 border-b-2 ${filters.status === 'OPEN' ? 'border-[#008751] text-[#008751] font-bold' : 'border-transparent hover:text-gray-700 text-gray-500'}`} data-testid="status-tab-OPEN" onClick={() => handleFilterChange({ status: 'OPEN' })}>Open</button>
        <button className="pb-3 border-b-2 border-transparent hover:text-gray-700 text-gray-500">Overdue</button>
        <button className={`pb-3 border-b-2 ${filters.status === 'RESOLVED' ? 'border-[#008751] text-[#008751] font-bold' : 'border-transparent hover:text-gray-700 text-gray-500'}`} data-testid="status-tab-RESOLVED" onClick={() => handleFilterChange({ status: 'RESOLVED' })}>Resolved</button>
        <button className={`pb-3 border-b-2 ${filters.status === 'CLOSED' ? 'border-[#008751] text-[#008751] font-bold' : 'border-transparent hover:text-gray-700 text-gray-500'}`} onClick={() => handleFilterChange({ status: 'CLOSED' })}>Closed</button>
        <button className="pb-3 border-b-2 border-transparent hover:text-green-700 text-[#008751] flex items-center gap-1"><Plus size={14} /> Add Tab</button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="text-red-600" size={20} />
          <span className="text-red-700">{error}</span>
          <button
            onClick={clearError}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search"
            data-testid="search-input"
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-[#008751] focus:border-[#008751] text-sm"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
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
          {pagination ? `${pagination.page * pagination.limit - pagination.limit + 1} - ${Math.min(pagination.page * pagination.limit, pagination.totalCount)} of ${pagination.totalCount}` : '0'}
        </div>
        <div className="flex gap-1 ml-auto">
          <button
            className="p-1 border border-gray-300 rounded text-gray-400 bg-gray-50 disabled"
            disabled={!pagination?.hasPrev}
          >
            <ChevronRight className="rotate-180" size={16} />
          </button>
          <button
            className="p-1 border border-gray-300 rounded text-gray-400 bg-gray-50 disabled"
            disabled={!pagination?.hasNext}
          >
            <ChevronRight size={16} />
          </button>
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
                      <span className="text-[#008751] font-bold hover:underline cursor-pointer">
                        {issue.vehicle ? `${issue.vehicle.make} ${issue.vehicle.model}` : 'N/A'}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-1 rounded w-fit">
                        {issue.vehicle?.vin || 'No VIN'}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">Vehicle</td>
                <td className="px-4 py-3 font-medium text-gray-900">#{issue.id.slice(-6)} <span className="text-xs bg-gray-100 px-1 rounded text-gray-500 font-normal">FleetMada</span></td>
                <td className="px-4 py-3 text-gray-900 font-medium">
                  {issue.summary}
                  {issue.labels.length > 0 && (
                    <span className="ml-2 text-[#008751] text-xs hover:underline cursor-pointer">{issue.labels[0]}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${getStatusColor(issue.status)}`}>{issue.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-400">FleetMada</td>
                <td className="px-4 py-3 text-gray-900 underline decoration-dotted underline-offset-4">{formatDate(issue.reportedDate)}</td>
                <td className="px-4 py-3 text-gray-400">{issue.assignedTo || '—'}</td>
                <td className="px-4 py-3">
                  {issue.labels.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {issue.labels.map((label, index) => (
                        <span key={index} className="text-xs bg-blue-100 text-blue-800 px-1 rounded">{label}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500 hover:text-[#008751] hover:underline">
                  {issue.watchers > 0 ? `${issue.watchers} watcher${issue.watchers > 1 ? 's' : ''}` : '—'}
                </td>
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