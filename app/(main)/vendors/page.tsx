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
    autoFetch: false
  });

  const activeFilters = {
    search: searchQuery || undefined,
    classification: selectedClassification || undefined,
    label: selectedLabel || undefined
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchVendors({
        page: 1,
        limit: 20,
        ...activeFilters
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedClassification, selectedLabel, fetchVendors]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleApplyFilters = (criteria: FilterCriterion[]) => {
    setActiveCriteria(criteria);
    setIsFiltersOpen(false);

    let newSearch = searchQuery;
    let newClass = selectedClassification;
    let newLabel = selectedLabel;

    criteria.forEach(c => {
      const value = Array.isArray(c.value) ? c.value[0] : c.value;

      if (c.field === 'classification') {
        newClass = value as string;
      } else if (c.field === 'label') {
        newLabel = Array.isArray(c.value) ? c.value[0] : value as string;
      } else if (c.field === 'search') {
        newSearch = value as string;
      }
    });

    setSearchQuery(newSearch);
    setSelectedClassification(newClass);
    setSelectedLabel(newLabel);
  };

  const activeFilterCount = [
    selectedClassification,
    selectedLabel,
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

  const getClassificationLabel = (classification: string) => {
    const labels: Record<string, string> = {
      'fuel': 'Carburant',
      'service': 'Entretien',
      'parts': 'Pièces',
      'insurance': 'Assurance',
      'registration': 'Immatriculation',
      'charging': 'Recharge',
      'tools': 'Outils',
      'all': 'Tous'
    };
    return labels[classification.toLowerCase()] || classification;
  };

  const tabs = ['All', 'Charging', 'Fuel', 'Service', 'Tools'];
  const handleTabClick = (tab: string) => {
    if (tab === 'All') {
      setSelectedClassification('');
    } else {
      setSelectedClassification(tab);
    }
  };

  const activeTab = selectedClassification
    ? (tabs.includes(selectedClassification) ? selectedClassification : '')
    : 'All';

  return (
    <div className="p-6 max-w-[1800px] mx-auto relative">
      <FiltersSidebar
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        onApply={handleApplyFilters}
        initialFilters={activeCriteria}
        availableFields={VENDOR_FILTER_FIELDS}
      />

      {/* ZONE 1: HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900" data-testid="vendors-title">Fournisseurs</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleAdd(router)}
            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2 transition-colors"
            data-testid="add-vendor-button"
          >
            <Plus size={20} /> Nouveau fournisseur
          </button>
        </div>
      </div>

      {/* ZONE 2: NAVIGATION TABS */}
      <div className="flex gap-6 border-b border-gray-200 mb-6 font-medium text-sm">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`pb-3 border-b-2 transition-colors ${activeTab === tab
              ? 'border-[#008751] text-[#008751] font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            {getClassificationLabel(tab)}
          </button>
        ))}
      </div>


      {/* ZONE 3: FILTERS BAR */}
      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751] outline-none"
            data-testid="search-input"
          />
        </div>

        <select
          value={selectedClassification}
          onChange={(e) => setSelectedClassification(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751] outline-none bg-white min-w-[150px]"
        >
          <option value="">Toutes classifications</option>
          <option value="Fuel">Carburant</option>
          <option value="Service">Entretien</option>
          <option value="Parts">Pièces</option>
          <option value="Charging">Recharge</option>
          <option value="Tools">Outils</option>
        </select>

        <button
          onClick={() => setIsFiltersOpen(true)}
          className="px-3 py-2 border border-gray-300 bg-white text-gray-700 rounded text-sm hover:bg-gray-50 flex items-center gap-2"
        >
          <Filter size={16} /> Filtres
          {activeFilterCount > 0 && (
            <span className="bg-[#008751] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {(searchQuery || selectedClassification || selectedLabel) && (
          <button
            onClick={clearFilters}
            className="text-sm font-medium text-[#008751] hover:underline"
          >
            Effacer
          </button>
        )}

        <div className="flex-1 text-right text-sm text-gray-500">
          {pagination ? `${(pagination.page - 1) * pagination.limit + 1} - ${Math.min(pagination.page * pagination.limit, pagination.total)} sur ${pagination.total}` : '0'}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => fetchVendors({ page: (pagination?.page || 1) - 1, limit: pagination?.limit || 20, ...activeFilters })}
            disabled={!pagination?.hasPrev}
            className="p-1 border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronRight size={16} className="rotate-180" />
          </button>
          <button
            onClick={() => fetchVendors({ page: (pagination?.page || 1) + 1, limit: pagination?.limit || 20, ...activeFilters })}
            disabled={!pagination?.hasNext}
            className="p-1 border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ZONE 4: DASHBOARD STATISTIQUES */}
      <div className="bg-white p-4 border border-gray-200 rounded-lg mb-6 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-500 font-medium mb-1">Total Fournisseurs</div>
            <div className="text-2xl font-bold text-gray-900">{pagination?.total || 0}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 font-medium mb-1">Carburant</div>
            <div className="text-2xl font-bold text-blue-600">{vendors.filter(v => v.classification.includes('Fuel')).length}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 font-medium mb-1">Entretien</div>
            <div className="text-2xl font-bold text-green-600">{vendors.filter(v => v.classification.includes('Service')).length}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 font-medium mb-1">Pièces</div>
            <div className="text-2xl font-bold text-purple-600">{vendors.filter(v => v.classification.includes('Parts')).length}</div>
          </div>
        </div>
      </div>

      {/* ZONE 5: TABLEAU DE DONNÉES */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Fournisseur</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Classification</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Localisation</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Libellés</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-red-600">
                    <p>Erreur lors du chargement des fournisseurs : {error}</p>
                    <button onClick={refresh} className="mt-2 underline hover:text-red-800">Réessayer</button>
                  </td>
                </tr>
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Store size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun fournisseur trouvé</h3>
                    <p className="text-gray-500 mb-4">
                      {searchQuery || selectedClassification || selectedLabel ? "Essayez d'ajuster vos critères de recherche" : "Commencez par ajouter votre premier fournisseur"}
                    </p>
                    <button
                      onClick={() => handleAdd(router)}
                      className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2 mx-auto"
                    >
                      <Plus size={20} /> Ajouter un fournisseur
                    </button>
                  </td>
                </tr>
              ) : (
                vendors.map((vendor) => (
                  <tr
                    key={vendor.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSelect(vendor, router)}
                  >
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
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {vendor.contactName || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {vendor.classification.slice(0, 2).map((cls, index) => (
                          <span key={index} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getClassificationColor(cls)}`}>
                            {getClassificationLabel(cls)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{vendor.address || '—'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {vendor.labels.slice(0, 2).map((label, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-[#008751]">
                      <ChevronRight size={16} className="inline ml-auto" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 text-sm text-gray-700">
            <div>
              Affichage de <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> à <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> sur <span className="font-medium">{pagination.total}</span> résultats
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchVendors({ page: pagination.page - 1, limit: pagination.limit, ...activeFilters })}
                disabled={!pagination.hasPrev}
                className="p-1 border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight size={16} className="rotate-180" />
              </button>
              <button
                onClick={() => fetchVendors({ page: pagination.page + 1, limit: pagination.limit, ...activeFilters })}
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