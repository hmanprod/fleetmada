'use client';

import React, { useState } from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, ChevronDown, Settings, AlertCircle, Calendar, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useInspections from '@/lib/hooks/useInspections';
import type { InspectionFilters } from '@/lib/services/inspections-api';

export default function InspectionsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    inspections,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    fetchInspections,
    clearError,
    getStatistics
  } = useInspections();

  const handleAdd = () => {
    router.push('/inspections/create');
  };

  const handleRowClick = (id: string) => {
    router.push(`/inspections/${id}`);
  };

  const handleViewDetails = (id: string) => {
    router.push(`/inspections/${id}`);
  };

  const handleEditInspection = (id: string) => {
    router.push(`/inspections/${id}/edit`);
  };

  const handleViewHistory = () => {
    router.push('/inspections/history');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const newFilters = { ...filters, search: query || undefined, page: 1 };
    setFilters(newFilters);
    fetchInspections(newFilters);
    
    // Mettre à jour l'URL
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (query) params.set('search', query);
    
    router.replace(`/inspections?${params.toString()}`);
  };

  const handleFilterChange = (newFilters: Partial<InspectionFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    fetchInspections(updatedFilters);
  };

  // Statistiques pour le tableau de bord
  const statistics = getStatistics();


  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-500 text-white border-gray-600';
      case 'SCHEDULED': return 'bg-blue-500 text-white border-blue-600';
      case 'IN_PROGRESS': return 'bg-yellow-500 text-white border-yellow-600';
      case 'COMPLETED': return 'bg-green-600 text-white border-green-700';
      case 'CANCELLED': return 'bg-red-500 text-white border-red-600';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'COMPLIANT': return 'text-green-600 bg-green-50';
      case 'NON_COMPLIANT': return 'text-red-600 bg-red-50';
      case 'PENDING_REVIEW': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Handle loading state
  if (loading && inspections.length === 0) {
    return (
      <div className="p-6 max-w-[1800px] mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008751] mx-auto"></div>
            <p className="mt-2 text-gray-500">Chargement des inspections...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Inspections</h1>
          <button 
            onClick={handleViewHistory}
            className="text-gray-500 hover:bg-gray-100 p-1 rounded text-xs bg-gray-50 border border-gray-200 px-2"
          >
            View History
          </button>
        </div>
        <div className="flex gap-2">
          <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button>
          <button 
            onClick={handleAdd}
            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          >
            <Plus size={20} /> Add Inspection
          </button>
        </div>
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
            placeholder="Search inspections..."
            className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <button 
          className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          onClick={() => handleFilterChange({ status: undefined })}
        >
          <Filter size={14} /> Status: All
        </button>
        <button 
          className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          onClick={() => handleFilterChange({ status: 'SCHEDULED' })}
        >
          <Calendar size={14} /> Scheduled
        </button>
        <button 
          className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          onClick={() => handleFilterChange({ status: 'COMPLETED' })}
        >
          <Clock size={14} /> Completed
        </button>

        <div className="flex-1 text-right text-sm text-gray-500">
          {pagination ? `${pagination.page * pagination.limit - pagination.limit + 1} - ${Math.min(pagination.page * pagination.limit, pagination.totalCount)} of ${pagination.totalCount}` : '0'}
        </div>
        <div className="flex gap-1 ml-auto">
          <button 
            className="p-1 border border-gray-300 rounded text-gray-400 bg-gray-50 disabled"
            disabled={!pagination?.hasPrev}
            onClick={() => handleFilterChange({ page: (pagination?.page || 1) - 1 })}
          >
            <ChevronRight className="rotate-180" size={16} />
          </button>
          <button 
            className="p-1 border border-gray-300 rounded text-gray-400 bg-gray-50 disabled"
            disabled={!pagination?.hasNext}
            onClick={() => handleFilterChange({ page: (pagination?.page || 1) + 1 })}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-white border-b border-gray-200">
            <tr>
              <th className="w-8 px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Vehicle</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Template</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900 cursor-pointer flex items-center gap-1">Title ▲</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Status</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Compliance</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Scheduled Date</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Inspector</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Score</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inspections.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No inspections found</h3>
                  <p className="text-gray-500 mb-4">Get started by creating your first inspection.</p>
                  <button 
                    onClick={handleAdd}
                    className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2 mx-auto"
                  >
                    <Plus size={20} /> Create Inspection
                  </button>
                </td>
              </tr>
            ) : (
              inspections.map(inspection => (
                <tr key={inspection.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(inspection.id)}>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}><input type="checkbox" className="rounded border-gray-300" /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img src={`https://source.unsplash.com/random/50x50/?truck&sig=${inspection.id}`} className="w-6 h-6 rounded object-cover" alt="" />
                      <div className="flex flex-col">
                        {inspection.vehicle ? (
                          <>
                            <button 
                              onClick={() => router.push(`/vehicles/list/${inspection.vehicleId}`)}
                              className="text-[#008751] font-bold hover:underline cursor-pointer text-left"
                            >
                              {inspection.vehicle.make} {inspection.vehicle.model}
                            </button>
                            <span className="text-xs bg-gray-100 text-gray-600 px-1 rounded w-fit">
                              {inspection.vehicle.vin}
                            </span>
                            <span className="text-xs text-gray-500">
                              {inspection.vehicle.type}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{inspection.inspectionTemplate?.name || 'N/A'}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {inspection.title}
                    {inspection.description && (
                      <div className="text-xs text-gray-500 mt-1">{inspection.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${getStatusColor(inspection.status)}`}>{inspection.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${getComplianceColor(inspection.complianceStatus)}`}>{inspection.complianceStatus}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {inspection.scheduledDate ? formatDate(inspection.scheduledDate) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{inspection.inspectorName || '—'}</td>
                  <td className="px-4 py-3 text-gray-900">
                    {inspection.overallScore ? `${inspection.overallScore}%` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-gray-400 flex gap-2">
                      <div onClick={e => e.stopPropagation()}><Settings size={14} className="hover:text-gray-600" /></div>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}