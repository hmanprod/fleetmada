'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, Image as ImageIcon, Users, Building2 } from 'lucide-react';
import { Contact, ContactFilters } from '@/lib/services/contacts-api';
import { useContacts } from '@/lib/hooks/useContacts';
import { useGroups } from '@/lib/hooks/useGroups';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast, ToastContainer } from '@/components/NotificationToast';
import { FiltersSidebar } from '../inspections/components/filters/FiltersSidebar';
import { FilterCriterion } from '../inspections/components/filters/FilterCard';
import { CONTACT_FILTER_FIELDS } from './components/filters/contact-filter-definitions';

const handleAdd = (router: any) => {
  router.push('/contacts/create');
};

const handleSelect = (contact: Contact, router: any) => {
  router.push(`/contacts/${contact.id}`);
};

export default function ContactsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast, toasts, removeToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  // Advanced Filters State
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeCriteria, setActiveCriteria] = useState<FilterCriterion[]>([]);

  const { groups } = useGroups();

  // Initialize filters from URL or defaults
  const [filters, setFilters] = useState<ContactFilters>({
    page: 1,
    limit: 20,
    status: (searchParams.get('status') as any) || undefined,
    group: searchParams.get('group') || undefined,
    classification: (searchParams.get('classification') as any) || undefined,
    search: searchParams.get('search') || undefined
  });

  const { contacts, loading, error, pagination, fetchContacts, refetch } = useContacts(filters);

  // Populate dynamic options for filter fields
  const populatedFilterFields = useMemo(() => {
    return CONTACT_FILTER_FIELDS.map(field => {
      if (field.id === 'group') {
        return {
          ...field,
          options: groups.map(g => ({ value: g.id, label: g.name }))
        };
      }
      return field;
    });
  }, [groups]);

  // Handle toast notifications from URL params
  useEffect(() => {
    if (searchParams.get('created') === 'true') {
      toast.success('Contact créé', 'Le nouveau contact a été ajouté avec succès.');
    } else if (searchParams.get('deleted') === 'true') {
      toast.success('Contact supprimé', 'Le contact a été supprimé avec succès.');
    }
  }, [searchParams, toast]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleFilterChange({ search: searchQuery || undefined });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // filter change handled by effect
  };

  const handleFilterChange = (newFilters: Partial<ContactFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };

    // Clean up undefined values
    Object.keys(updatedFilters).forEach(key => {
      // @ts-ignore
      if (updatedFilters[key] === undefined) {
        // @ts-ignore
        delete updatedFilters[key];
      }
    });

    setFilters(updatedFilters);
    fetchContacts(updatedFilters);

    // Update URL
    const params = new URLSearchParams();
    const relevantKeys: (keyof ContactFilters)[] = ['status', 'search', 'group', 'classification'];
    relevantKeys.forEach(key => {
      const val = updatedFilters[key];
      if (val) {
        params.set(key, String(val));
      }
    });
    router.replace(`/contacts?${params.toString()}`);
  };

  const handleApplyFilters = (criteria: FilterCriterion[]) => {
    setActiveCriteria(criteria);
    setIsFiltersOpen(false);

    // Start with clean state but keep search if not overridden by filter
    const newFilters: Partial<ContactFilters> = {
      search: searchQuery || undefined,
      status: undefined,
      group: undefined,
      classification: undefined
    };

    criteria.forEach(c => {
      const value = Array.isArray(c.value) ? c.value[0] : c.value;

      // Map filter fields to API filter keys
      if (c.field === 'group') {
        newFilters.group = value;
      } else if (c.field === 'status') {
        // @ts-ignore
        newFilters.status = value;
      } else if (c.field === 'classification') {
        // @ts-ignore
        newFilters.classification = value;
      }
      // Add other mapping logic if needed
    });

    // If a tab is active (e.g. "Technician"), ensure it's respected unless overridden
    if (activeTab !== 'All' && !newFilters.classification) {
      // @ts-ignore
      newFilters.classification = activeTab === 'Operator' ? 'Operator' :
        activeTab === 'Technician' ? 'Technician' :
          activeTab === 'Manager' ? 'Manager' :
            activeTab === 'Employee' ? 'Employee' : undefined;
    }

    handleFilterChange(newFilters);
  };

  const clearFilters = () => {
    setActiveCriteria([]);
    setSearchQuery('');
    setActiveTab('All');
    handleFilterChange({
      status: undefined,
      group: undefined,
      classification: undefined,
      search: undefined
    });
  };

  const currentStatus = filters.status || '';
  const currentGroup = filters.group || '';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'ARCHIVED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'INACTIVE':
        return 'Inactive';
      case 'ARCHIVED':
        return 'Archived';
      default:
        return status;
    }
  };

  if (loading && contacts.length === 0) {
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
        availableFields={populatedFilterFields as any}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900" data-testid="contacts-title">Contacts</h1>
          <button className="text-gray-500 hover:bg-gray-100 p-1 rounded text-xs bg-gray-50 border border-gray-200 px-2">Learn</button>
        </div>
        <div className="flex gap-2">
          <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button>
          <button
            onClick={() => handleAdd(router)}
            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
            data-testid="add-contact-button"
          >
            <Plus size={20} /> Add Contact
          </button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {[
          { id: 'All', label: 'All', value: undefined },
          { id: 'Operator', label: 'Operator', value: 'Operator' },
          { id: 'Technician', label: 'Technician', value: 'Technician' },
          { id: 'Manager', label: 'Manager', value: 'Manager' },
          { id: 'Employee', label: 'Employee', value: 'Employee' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              handleFilterChange({ classification: tab.value as any });
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id || (tab.id === 'All' && !filters.classification) || filters.classification === tab.value
              ? 'border-[#008751] text-[#008751]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-4 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-[#008751] focus:border-[#008751] text-sm"
              data-testid="search-input"
            />
          </div>

          <select
            value={currentStatus}
            onChange={(e) => handleFilterChange({ status: (e.target.value as any) || undefined })}
            className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 outline-none"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <select
            value={currentGroup}
            onChange={(e) => handleFilterChange({ group: e.target.value || undefined })}
            className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 outline-none"
          >
            <option value="">All Groups</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>

          <button
            onClick={() => setIsFiltersOpen(true)}
            className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter size={14} /> Filters
            {activeCriteria.length > 0 && (
              <span className="bg-[#008751] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {activeCriteria.length}
              </span>
            )}
          </button>

          {(filters.status || filters.group || filters.classification || filters.search || activeCriteria.length > 0) && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-4"
            >
              Clear
            </button>
          )}
        </div>

        {loading && contacts.length > 0 && (
          <div className="text-sm text-[#008751] animate-pulse">Loading updated results...</div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <span className="text-red-700">{error}</span>
            <button
              onClick={refetch}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classification</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignments</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {contact.image ? (
                          <img className="h-10 w-10 rounded-full object-cover" src={contact.image} alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <Users size={20} className="text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {contact.firstName} {contact.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{contact.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contact.group?.name || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {contact.classifications.slice(0, 2).map((classification, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {classification}
                        </span>
                      ))}
                      {contact.classifications.length > 2 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          +{contact.classifications.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                      {getStatusLabel(contact.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contact.status === 'ACTIVE' ? '0' : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleSelect(contact, router)}
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

        {contacts.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first contact'}
            </p>
            <button
              onClick={() => handleAdd(router)}
              className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2 mx-auto"
            >
              <Plus size={20} /> Add Contact
            </button>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => fetchContacts({ ...filters, page: pagination.page - 1 })}
                disabled={!pagination.hasPrev}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => fetchContacts({ ...filters, page: pagination.page + 1 })}
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
                    onClick={() => fetchContacts({ ...filters, page: pagination.page - 1 })}
                    disabled={!pagination.hasPrev}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchContacts({ ...filters, page: pagination.page + 1 })}
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