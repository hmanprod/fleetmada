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
  };

  const handleFilterChange = (newFilters: Partial<ContactFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };

    Object.keys(updatedFilters).forEach(key => {
      // @ts-ignore
      if (updatedFilters[key] === undefined) {
        // @ts-ignore
        delete updatedFilters[key];
      }
    });

    setFilters(updatedFilters);
    fetchContacts(updatedFilters);

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

    const newFilters: Partial<ContactFilters> = {
      search: searchQuery || undefined,
      status: undefined,
      group: undefined,
      classification: undefined
    };

    criteria.forEach(c => {
      const value = Array.isArray(c.value) ? c.value[0] : c.value;

      if (c.field === 'group') {
        newFilters.group = value;
      } else if (c.field === 'status') {
        // @ts-ignore
        newFilters.status = value;
      } else if (c.field === 'classification') {
        // @ts-ignore
        newFilters.classification = value;
      }
    });

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
      case 'ACTIVE': return 'Actif';
      case 'INACTIVE': return 'Inactif';
      case 'ARCHIVED': return 'Archivé';
      default: return status;
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

      {/* ZONE 1: HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900" data-testid="contacts-title">Contacts</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleAdd(router)}
            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2 transition-colors"
            data-testid="add-contact-button"
          >
            <Plus size={20} /> Nouveau contact
          </button>
        </div>
      </div>

      {/* ZONE 2: NAVIGATION TABS */}
      <div className="flex gap-6 border-b border-gray-200 mb-6 font-medium text-sm text-gray-500">
        {[
          { id: 'All', label: 'Tous', value: undefined },
          { id: 'Operator', label: 'Opérateurs', value: 'Operator' },
          { id: 'Technician', label: 'Techniciens', value: 'Technician' },
          { id: 'Manager', label: 'Gestionnaires', value: 'Manager' },
          { id: 'Employee', label: 'Employés', value: 'Employee' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              handleFilterChange({ classification: tab.value as any });
            }}
            className={`pb-3 border-b-2 transition-colors ${activeTab === tab.id || (tab.id === 'All' && !filters.classification) || filters.classification === tab.value
              ? 'border-[#008751] text-[#008751] font-bold'
              : 'border-transparent hover:text-gray-700 font-medium'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>


      {/* ZONE 3: FILTERS BAR */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher des contacts..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751] outline-none"
              data-testid="search-input"
            />
          </div>

          <select
            value={currentStatus}
            onChange={(e) => handleFilterChange({ status: (e.target.value as any) || undefined })}
            className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 outline-none min-w-[150px]"
          >
            <option value="">Tous les statuts</option>
            <option value="ACTIVE">Actif</option>
            <option value="INACTIVE">Inactif</option>
            <option value="ARCHIVED">Archivé</option>
          </select>

          <button
            onClick={() => setIsFiltersOpen(true)}
            className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <Filter size={14} /> Filtres
            {activeCriteria.length > 0 && (
              <span className="bg-[#008751] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {activeCriteria.length}
              </span>
            )}
          </button>

          {(filters.status || filters.group || filters.classification || filters.search || activeCriteria.length > 0) && (
            <button
              onClick={clearFilters}
              className="text-sm font-medium text-[#008751] hover:underline"
            >
              Effacer
            </button>
          )}

          <div className="flex-1 text-right text-sm text-gray-500">
            {pagination ? `${(filters.page! - 1) * filters.limit! + 1} - ${Math.min(filters.page! * filters.limit!, pagination.total)} sur ${pagination.total}` : '0'}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => fetchContacts({ ...filters, page: (filters.page || 1) - 1 })}
              disabled={!pagination?.hasPrev}
              className="p-1 border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight size={16} className="rotate-180" />
            </button>
            <button
              onClick={() => fetchContacts({ ...filters, page: (filters.page || 1) + 1 })}
              disabled={!pagination?.hasNext}
              className="p-1 border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ZONE 4: DASHBOARD STATISTIQUES */}
      <div className="bg-white p-4 border border-gray-200 rounded-lg mb-6 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-500 font-medium mb-1">Total Contacts</div>
            <div className="text-2xl font-bold text-gray-900">{pagination?.total || 0}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 font-medium mb-1">Actifs</div>
            <div className="text-2xl font-bold text-green-600">{contacts.filter(c => c.status === 'ACTIVE').length}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 font-medium mb-1">Techniciens</div>
            <div className="text-2xl font-bold text-blue-600">{contacts.filter(c => c.classifications.includes('Technician')).length}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 font-medium mb-1">Employés</div>
            <div className="text-2xl font-bold text-purple-600">{contacts.filter(c => c.classifications.includes('Employee')).length}</div>
          </div>
        </div>
      </div>

      {/* ZONE 5: TABLEAU DE DONNÉES */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Groupe</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Classification</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Assignations</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider"></th>
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
          <div className="text-center py-12 text-gray-500 bg-white">
            Pas de contacts trouvés.
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 text-sm text-gray-700">
            <div>
              Affichage de <span className="font-medium">{(filters.page! - 1) * filters.limit! + 1}</span> à <span className="font-medium">{Math.min(filters.page! * filters.limit!, pagination.total)}</span> sur <span className="font-medium">{pagination.total}</span> résultats
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchContacts({ ...filters, page: (filters.page || 1) - 1 })}
                disabled={!pagination.hasPrev}
                className="p-1 border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight size={16} className="rotate-180" />
              </button>
              <button
                onClick={() => fetchContacts({ ...filters, page: (filters.page || 1) + 1 })}
                disabled={!pagination.hasNext}
                className="p-1 border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}