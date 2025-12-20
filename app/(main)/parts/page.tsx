'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, ChevronDown, Settings, Lightbulb, Grid, AlertTriangle, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useParts } from '@/lib/hooks/useParts';
import { Part } from '@/lib/services/parts-api';

export default function PartsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const {
    parts,
    loading,
    error,
    pagination,
    fetchParts,
    lowStockParts,
    totalValue,
    refresh
  } = useParts({
    page: currentPage,
    limit: 10,
    search: searchTerm || undefined,
    category: selectedCategory || undefined,
    lowStock: activeTab === 'low-stock'
  });

  // Gestion des changements de filtres
  useEffect(() => {
    fetchParts({
      page: currentPage,
      search: searchTerm || undefined,
      category: selectedCategory || undefined,
      lowStock: activeTab === 'low-stock'
    });
  }, [searchTerm, selectedCategory, activeTab, currentPage]);

  const handleAddPart = () => {
    router.push('/parts/create');
  };

  const handleLearnMore = () => {
    // TODO: Implement navigation to documentation
    console.log('Navigate to learn more about parts');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStockStatus = (part: Part) => {
    if (!part.quantity) return { status: 'OUT_OF_STOCK', color: 'text-red-600', bg: 'bg-red-50' };
    if (part.lowStockAlert) return { status: 'LOW_STOCK', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { status: 'IN_STOCK', color: 'text-green-600', bg: 'bg-green-50' };
  };

  const formatCurrency = (amount: number) => {
    return `Ar ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Parts</h1>
          <button
            onClick={handleLearnMore}
            className="text-gray-500 hover:bg-gray-100 p-1 rounded text-xs bg-gray-50 border border-gray-200 px-2 flex items-center gap-1"
          >
            <Lightbulb size={12} /> Learn
          </button>
        </div>
        <div className="flex gap-2">
          <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button>
          <button
            onClick={handleAddPart}
            data-testid="add-part-button"
            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          >
            <Plus size={20} /> Add Part
          </button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-6">
        <button
          onClick={() => handleTabChange('all')}
          data-testid="tab-all"
          className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'all'
            ? 'border-[#008751] text-[#008751]'
            : 'border-transparent text-gray-900 hover:text-gray-700'
            }`}
        >
          All <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-xs">{pagination?.total || 0}</span>
        </button>
        <button
          onClick={() => handleTabChange('low-stock')}
          data-testid="tab-low-stock"
          className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'low-stock'
            ? 'border-[#008751] text-[#008751]'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <AlertTriangle size={14} className="text-yellow-500" /> Low Stock <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-xs">{lowStockParts.length}</span>
        </button>
        <button
          onClick={() => handleTabChange('archived')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'archived'
            ? 'border-[#008751] text-[#008751]'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          Archived
        </button>
        <button
          onClick={() => console.log('Add new tab')}
          className="px-4 py-2 text-sm font-medium text-[#008751] hover:text-[#007043] flex items-center gap-1"
        >
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
            data-testid="search-input"
            className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]"
          />
        </div>
        <button
          onClick={() => setSelectedCategory(selectedCategory === 'engine' ? '' : 'engine')}
          className={`bg-white border px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 ${selectedCategory
            ? 'border-[#008751] bg-[#008751] text-white'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
        >
          Part Category <ChevronDown size={14} />
        </button>
        <button
          onClick={() => setSelectedManufacturer(selectedManufacturer === 'bosch' ? '' : 'bosch')}
          className={`bg-white border px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 ${selectedManufacturer
            ? 'border-[#008751] bg-[#008751] text-white'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
        >
          Part Manufacturer <ChevronDown size={14} />
        </button>
        <button data-testid="category-filter" className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          <Filter size={14} /> Filters
        </button>
        <div className="flex gap-1 ml-auto">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={!pagination?.hasPrev}
            className={`p-1 border border-gray-300 rounded ${pagination?.hasPrev ? 'text-gray-600 hover:bg-gray-50' : 'text-gray-400 bg-white cursor-not-allowed'}`}
          >
            <ChevronRight size={16} className="rotate-180" />
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination?.hasNext}
            className={`p-1 border border-gray-300 rounded ${pagination?.hasNext ? 'text-gray-600 hover:bg-gray-50' : 'text-gray-400 bg-white cursor-not-allowed'}`}
          >
            <ChevronRight size={16} />
          </button>
          <button data-testid="prev-page" className="hidden" onClick={() => handlePageChange(Math.max(1, currentPage - 1))}></button>
          <button data-testid="next-page" className="hidden" onClick={() => handlePageChange(currentPage + 1)}></button>
        </div>
        <button className="bg-white border border-gray-300 px-2 py-1.5 rounded text-gray-700 hover:bg-gray-50">
          <Settings size={16} />
        </button>
        <button
          onClick={() => console.log('Save view')}
          className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          Save View <ChevronDown size={14} />
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-white border-b border-gray-200">
            <tr>
              <th className="w-8 px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900 flex items-center gap-1 cursor-pointer">Part ▲</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Description</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Category</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Manufacturer</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Manufacturer Part Number</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Measurement Unit</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Aisle/Row/Bin</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-900">Unit Cost</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-6 py-24 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008751]"></div>
                    <span className="ml-2 text-gray-500">Chargement des pièces...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={9} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <AlertTriangle size={32} className="text-red-500 mb-4" />
                    <p className="text-red-500 mb-1">Erreur de chargement</p>
                    <p className="text-sm text-gray-400 mb-4">{error}</p>
                    <button
                      onClick={refresh}
                      className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                    >
                      Réessayer
                    </button>
                  </div>
                </td>
              </tr>
            ) : parts.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-16 w-16 rounded-full border-2 border-[#008751] text-[#008751] flex items-center justify-center mb-4">
                      <Package size={32} />
                    </div>
                    <p className="text-gray-500 mb-1">Aucune pièce trouvée.</p>
                    <p className="text-sm text-gray-400 mb-6 max-w-md text-center">
                      Les pièces sont des enregistrements pour gérer l'historique de l'inventaire physique.
                      <br />
                      <button className="text-[#008751] hover:underline font-medium">En savoir plus</button>
                    </p>
                    <button
                      onClick={handleAddPart}
                      className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                    >
                      <Plus size={20} /> Ajouter une pièce
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              parts.map(part => {
                const stockStatus = getStockStatus(part);
                return (
                  <tr key={part.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/parts/${part.id}`)}>
                    <td className="w-8 px-4 py-3">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{part.number}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900">{part.description}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-900">{part.category || 'Non classé'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-900">{part.manufacturer || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-900">{part.manufacturerPartNumber || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-900">{part.measurementUnit || 'Pièces'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-900">—</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900">{formatCurrency(part.cost || 0)}</span>
                        {part.lowStockAlert && (
                          <div title="Stock faible">
                            <AlertTriangle size={14} className="text-yellow-500" />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={!pagination.hasPrev}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Précédent
            </button>
            <button
              onClick={() => handlePageChange(Math.min(pagination.totalPages, currentPage + 1))}
              disabled={!pagination.hasNext}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de <span className="font-medium">{((currentPage - 1) * pagination.limit) + 1}</span> à{' '}
                <span className="font-medium">{Math.min(currentPage * pagination.limit, pagination.total)}</span> sur{' '}
                <span className="font-medium">{pagination.total}</span> résultats
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Précédent
                </button>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                        ? 'z-10 bg-[#008751] border-[#008751] text-white'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(Math.min(pagination.totalPages, currentPage + 1))}
                  disabled={!pagination.hasNext}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Suivant
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {parts.length > 0 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-6">
              <span>Valeur totale: <strong className="text-gray-900">{formatCurrency(totalValue)}</strong></span>
              <span>Stock faible: <strong className="text-yellow-600">{lowStockParts.length}</strong></span>
            </div>
            <button
              onClick={refresh}
              className="text-[#008751] hover:text-[#007043] font-medium"
            >
              Actualiser
            </button>
            <button
              onClick={refresh}
              data-testid="refresh-button"
              className="hidden"
            ></button>

          </div>
        </div>
      )
      }
    </div >
  );
}