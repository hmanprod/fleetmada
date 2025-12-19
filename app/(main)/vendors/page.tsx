'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, Store, Phone, Globe, MapPin } from 'lucide-react';
import { Vendor } from '@/types';
import { useVendors, useVendorSearch } from '@/lib/hooks/useVendors';

const handleAdd = () => {
  // TODO: Implement add vendor functionality
  console.log('Add vendor');
};

const handleSelect = (vendor: Vendor) => {
  // TODO: Implement select vendor functionality
  console.log('Select vendor:', vendor);
};

export default function VendorsPage() {
  const { vendors, loading, error, pagination, fetchVendors, refetch } = useVendors();
  const { results: searchResults, searchVendors, loading: searchLoading } = useVendorSearch();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassification, setSelectedClassification] = useState<string>('');
  const [selectedLabel, setSelectedLabel] = useState<string>('');

  // Gestion de la recherche
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchVendors(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchVendors]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      fetchVendors({ search: query, limit: 20 });
    } else {
      refetch();
    }
  };

  const handleFilter = () => {
    const filters: any = {};
    if (selectedClassification) filters.classification = selectedClassification;
    if (selectedLabel) filters.label = selectedLabel;
    if (searchQuery) filters.search = searchQuery;
    
    fetchVendors(filters);
  };

  const displayVendors = searchQuery.trim() ? searchResults : vendors;

  const getClassificationColor = (classification: string) => {
    switch (classification.toLowerCase()) {
      case 'fuel':
        return 'bg-blue-100 text-blue-800';
      case 'service':
        return 'bg-green-100 text-green-800';
      case 'parts':
        return 'bg-purple-100 text-purple-800';
      case 'insurance':
        return 'bg-orange-100 text-orange-800';
      case 'registration':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && vendors.length === 0) {
    return (
      <div className="p-6 max-w-[1800px] mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008751]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-[1800px] mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">
            <strong>Erreur:</strong> {error}
          </div>
          <button 
            onClick={refetch}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
           <h1 className="text-3xl font-bold text-gray-900">Vendors</h1>
           <button className="text-[#008751] font-medium text-sm flex items-center gap-1"><Store size={16}/> Find Shops <span className="bg-orange-100 text-orange-800 text-[10px] px-1 rounded">New</span></button>
        </div>
        <div className="flex gap-2">
           <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button>
           <button 
             onClick={handleAdd}
             className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
           >
             <Plus size={20} /> Add Vendor
           </button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-6">
         <button className="px-4 py-2 text-sm font-medium border-b-2 border-[#008751] text-[#008751]">All</button>
         <button className="px-4 py-2 text-sm font-medium border-transparent text-gray-500 hover:text-gray-700">Charging</button>
         <button className="px-4 py-2 text-sm font-medium border-transparent text-gray-500 hover:text-gray-700">Fuel</button>
         <button className="px-4 py-2 text-sm font-medium border-transparent text-gray-500 hover:text-gray-700">Service</button>
         <button className="px-4 py-2 text-sm font-medium border-transparent text-gray-500 hover:text-gray-700">Tools</button>
      </div>

      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008751] focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedClassification}
            onChange={(e) => setSelectedClassification(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008751] focus:border-transparent"
          >
            <option value="">All Classifications</option>
            <option value="Fuel">Fuel</option>
            <option value="Service">Service</option>
            <option value="Parts">Parts</option>
            <option value="Insurance">Insurance</option>
            <option value="Registration">Registration</option>
          </select>

          <select
            value={selectedLabel}
            onChange={(e) => setSelectedLabel(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008751] focus:border-transparent"
          >
            <option value="">All Labels</option>
            <option value="Sample">Sample</option>
            <option value="Preferred">Preferred</option>
            <option value="Emergency">Emergency</option>
          </select>

          <button 
            onClick={handleFilter}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <Filter size={16} /> Filter
          </button>
        </div>

        {searchLoading && (
          <div className="text-sm text-gray-500">Searching...</div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classification</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Labels</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayVendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-[#008751] flex items-center justify-center">
                          <Store size={20} className="text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {vendor.name}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          {vendor.phone && (
                            <div className="flex items-center gap-1">
                              <Phone size={12} />
                              {vendor.phone}
                            </div>
                          )}
                          {vendor.website && (
                            <div className="flex items-center gap-1">
                              <Globe size={12} />
                              <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="hover:text-[#008751]">
                                Website
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {vendor.contactName || '—'}
                    </div>
                    {vendor.contactEmail && (
                      <div className="text-sm text-gray-500">
                        {vendor.contactEmail}
                      </div>
                    )}
                    {vendor.contactPhone && (
                      <div className="text-sm text-gray-500">
                        {vendor.contactPhone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {vendor.classification.slice(0, 2).map((cls, index) => (
                        <span key={index} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getClassificationColor(cls)}`}>
                          {cls}
                        </span>
                      ))}
                      {vendor.classification.length > 2 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          +{vendor.classification.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {vendor.address ? (
                      <div className="flex items-center gap-1 text-sm text-gray-900">
                        <MapPin size={12} className="text-gray-400" />
                        <span className="truncate max-w-xs">{vendor.address}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {vendor.labels.slice(0, 2).map((label, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {label}
                        </span>
                      ))}
                      {vendor.labels.length > 2 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          +{vendor.labels.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleSelect(vendor)}
                      className="text-[#008751] hover:text-[#007043]"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {displayVendors.length === 0 && !loading && (
          <div className="text-center py-12">
            <Store size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first vendor'}
            </p>
            <button 
              onClick={handleAdd}
              className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2 mx-auto"
            >
              <Plus size={20} /> Add Vendor
            </button>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => fetchVendors({ page: pagination.page - 1, limit: pagination.limit })}
                disabled={!pagination.hasPrev}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => fetchVendors({ page: pagination.page + 1, limit: pagination.limit })}
                disabled={!pagination.hasNext}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => fetchVendors({ page: pagination.page - 1, limit: pagination.limit })}
                    disabled={!pagination.hasPrev}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchVendors({ page: pagination.page + 1, limit: pagination.limit })}
                    disabled={!pagination.hasNext}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}