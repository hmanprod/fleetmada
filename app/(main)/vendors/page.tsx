'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, Store, Phone, Globe, MapPin, X, Eye, Edit, Archive } from 'lucide-react';
import { Vendor } from '@/types';
import { useVendors } from '@/lib/hooks/useVendors';
import { vendorsAPI } from '@/lib/services/vendors-api';
import { FiltersSidebar } from '../inspections/components/filters/FiltersSidebar';
import { type FilterCriterion } from '../inspections/components/filters/FilterCard';
import { VENDOR_FILTER_FIELDS } from './components/filters/vendor-filter-definitions';

const handleAdd = (router: any) => {
  router.push('/vendors/create');
};

const handleSelect = (vendor: Vendor, router: any) => {
  router.push(`/vendors/${vendor.id}`);
};

export default function VendorsPage() {
  const router = useRouter();

  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassification, setSelectedClassification] = useState<string>('');
  const [selectedLabel, setSelectedLabel] = useState<string>('');

  // Advanced Filters State
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeCriteria, setActiveCriteria] = useState<FilterCriterion[]>([]);

  // Use the main hook for data fetching
  const { vendors, loading, error, pagination, fetchVendors, refresh } = useVendors({
    autoFetch: false // We will trigger fetch manually via effects
  });

  // Create a combined filters object for effect dependency and applying
  const activeFilters = {
    search: searchQuery,
    classification: selectedClassification,
    label: selectedLabel
  };

  // Effect to handle data fetching when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchVendors({
        page: 1,
        limit: 20,
        search: searchQuery || undefined,
        classification: selectedClassification || undefined,
        label: selectedLabel || undefined
      });
    }, 300); // Debounce for search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedClassification, selectedLabel, fetchVendors]);

  // Handle Search Input
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleApplyFilters = (criteria: FilterCriterion[]) => {
    setActiveCriteria(criteria);
    setIsFiltersOpen(false);

    // Reset base filters to handle them from criteria
    let newSearch = searchQuery;
    let newClass = selectedClassification;
    let newLabel = selectedLabel;

    // Optional: Reset direct selects if applying from sidebar, 
    // or strictly map criteria to state. 
    // For consistency with Issues page, we map criteria to our filter state.
    // If a field is NOT in criteria, we might want to keep it or clear it.
    // "Issues" page maps everything. Let's try to map what we find.

    // First, simplistic approach: update state if found in criteria. 
    // If we want the sidebar to be the source of truth when used, we might need to reset others.
    // But currently we have mixed mode (inline + sidebar).

    criteria.forEach(c => {
      const value = Array.isArray(c.value) ? c.value[0] : c.value;

      if (c.field === 'classification') {
        newClass = value as string;
      } else if (c.field === 'label') {
        // label in our definition is multiselect but API takes string (singular) or we just take first for now
        // API definition says label?: string. 
        newLabel = Array.isArray(c.value) ? c.value[0] : value as string;
      } else if (c.field === 'search') {
        newSearch = value as string;
      }
    });

    // We update the state, which triggers the effect to fetch.
    setSearchQuery(newSearch);
    setSelectedClassification(newClass);
    setSelectedLabel(newLabel);
  };

  // Logic for counting active filters for the badge
  const activeFilterCount = [
    selectedClassification,
    selectedLabel,
    // Add criteria count if they aren't just reflecting the selects
    // But since we map criteria to selects, just counting selects is safer/simpler for now
    // or count unique active criteria.
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedClassification('');
    setSelectedLabel('');
    setActiveCriteria([]);
  };

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
      case 'charging':
        return 'bg-indigo-100 text-indigo-800';
      case 'tools':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = ['All', 'Charging', 'Fuel', 'Service', 'Tools'];
  const handleTabClick = (tab: string) => {
    if (tab === 'All') {
      setSelectedClassification('');
    } else {
      setSelectedClassification(tab);
    }
  };

  // Determine active tab based on selectedClassification
  const activeTab = selectedClassification
    ? (tabs.includes(selectedClassification) ? selectedClassification : '')
    : 'All';

  if (loading && vendors.length === 0 && !searchQuery && !selectedClassification && !selectedLabel) {
    return (
      <div className="p-6 max-w-[1800px] mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008751]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1800px] mx-auto relative">
      <FiltersSidebar
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        onApply={handleApplyFilters}
        initialFilters={activeCriteria}
        availableFields={VENDOR_FILTER_FIELDS}
      />

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900" data-testid="vendors-title">Vendors</h1>
          <button className="text-[#008751] font-medium text-sm flex items-center gap-1"><Store size={16} /> Find Shops <span className="bg-orange-100 text-orange-800 text-[10px] px-1 rounded">New</span></button>
        </div>
        <div className="flex gap-2">
          {/* <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button> */}
          <button
            onClick={() => handleAdd(router)}
            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
            data-testid="add-vendor-button"
          >
            <Plus size={20} /> Add Vendor
          </button>
        </div>
      </div>

      <div className="flex gap-6 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`pb-3 border-b-2 font-medium text-sm transition-colors ${activeTab === tab
              ? 'border-[#008751] text-[#008751]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            {tab}
          </button>
        ))}
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
              data-testid="search-input"
            />
          </div>

          <select
            value={selectedClassification}
            onChange={(e) => setSelectedClassification(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008751] focus:border-transparent max-w-[200px]"
          >
            <option value="">All Classifications</option>
            <option value="Fuel">Fuel</option>
            <option value="Service">Service</option>
            <option value="Parts">Parts</option>
            <option value="Insurance">Insurance</option>
            <option value="Registration">Registration</option>
            <option value="Charging">Charging</option>
            <option value="Tools">Tools</option>
          </select>

          <select
            value={selectedLabel}
            onChange={(e) => setSelectedLabel(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008751] focus:border-transparent max-w-[200px]"
          >
            <option value="">All Labels</option>
            <option value="Sample">Sample</option>
            <option value="Preferred">Preferred</option>
            <option value="Emergency">Emergency</option>
          </select>

          <button
            onClick={() => setIsFiltersOpen(true)}
            className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter size={16} /> Filters
            {activeFilterCount > 0 && (
              <span className="bg-[#008751] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {(searchQuery || selectedClassification || selectedLabel) && (
            <button
              onClick={clearFilters}
              className="ml-2 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>

        {loading && (
          <div className="text-sm text-gray-500">Updating results...</div>
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
              {error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-red-600">
                    <p>Error loading vendors: {error}</p>
                    <button onClick={refresh} className="mt-2 underline hover:text-red-800">Try Again</button>
                  </td>
                </tr>
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Store size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
                    <p className="text-gray-500 mb-4">
                      {searchQuery || selectedClassification || selectedLabel ? 'Try adjusting your search criteria' : 'Get started by adding your first vendor'}
                    </p>
                    <button
                      onClick={() => handleAdd(router)}
                      className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2 mx-auto"
                    >
                      <Plus size={20} /> Add Vendor
                    </button>
                  </td>
                </tr>
              ) : (
                vendors.map((vendor) => (
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
                      <div className="flex items-center justify-end gap-2 relative group hover:z-30">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(vendor, router);
                          }}
                          className="text-[#008751] hover:text-[#007043] block group-hover:hidden"
                        >
                          <ChevronRight size={16} />
                        </button>

                        <div className="hidden group-hover:block relative">
                          <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
                            <MoreHorizontal size={16} />
                          </button>
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50 text-left">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelect(vendor, router);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Eye size={14} /> View Details
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/vendors/${vendor.id}/edit`);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Edit size={14} /> Edit
                            </button>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (window.confirm('Are you sure you want to archive this vendor?')) {
                                  try {
                                    await vendorsAPI.deleteVendor(vendor.id);
                                    refresh();
                                  } catch (err) {
                                    console.error('Failed to archive vendor', err);
                                    alert('Failed to archive vendor');
                                  }
                                }
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Archive size={14} /> Archive
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => fetchVendors({ page: pagination.page - 1, limit: pagination.limit, ...activeFilters })}
                disabled={!pagination.hasPrev}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => fetchVendors({ page: pagination.page + 1, limit: pagination.limit, ...activeFilters })}
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
                    onClick={() => fetchVendors({ page: pagination.page - 1, limit: pagination.limit, ...activeFilters })}
                    disabled={!pagination.hasPrev}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchVendors({ page: pagination.page + 1, limit: pagination.limit, ...activeFilters })}
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