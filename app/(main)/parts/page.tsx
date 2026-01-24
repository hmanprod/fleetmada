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

  const handleAddPart = () => {
    router.push('/parts/create');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
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

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      {/* ZONE 1: HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 data-testid="page-title" className="text-3xl font-bold text-gray-900">Pièces détachées</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAddPart}
            data-testid="add-part-button"
            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2 transition-colors"
          >
            <Plus size={20} /> Nouvelle pièce
          </button>
        </div>
      </div>

      {/* ZONE 2: NAVIGATION TABS */}
      <div className="flex gap-6 border-b border-gray-200 mb-6 font-medium text-sm">
        <button
          onClick={() => handleTabChange('all')}
          data-testid="tab-all"
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'all' ? 'border-[#008751] text-[#008751] font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Toutes
        </button>
        <button
          onClick={() => handleTabChange('low-stock')}
          data-testid="tab-low-stock"
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'low-stock' ? 'border-[#008751] text-[#008751] font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div> Stock faible
        </button>
        <button
          onClick={() => handleTabChange('archived')}
          className={`pb-3 border-b-2 transition-colors ${activeTab === 'archived' ? 'border-[#008751] text-[#008751] font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Archivées
        </button>
      </div>


      {/* ZONE 3: FILTERS BAR */}
      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="search-input"
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751] outline-none"
          />
        </div>
        <select
          className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white text-gray-700"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Catégorie</option>
          <option value="engine">Moteur</option>
        </select>

        <button data-testid="category-filter" className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
          <Filter size={14} /> Filtres
        </button>

        <div className="flex-1 text-right text-sm text-gray-500" data-testid="pagination-info">
          {pagination ? `${(currentPage - 1) * pagination.limit + 1} - ${Math.min(currentPage * pagination.limit, pagination.total)} sur ${pagination.total}` : '0'}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={!pagination?.hasPrev}
            className="p-1 border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronRight size={16} className="rotate-180" />
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
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
            <div className="text-sm text-gray-500 font-medium mb-1">Total Pièces</div>
            <div className="text-2xl font-bold text-gray-900">{pagination?.total || 0}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 font-medium mb-1">Stock faible</div>
            <div className="text-2xl font-bold text-yellow-600">{lowStockParts.length}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 font-medium mb-1">Valeur Totale</div>
            <div className="text-2xl font-bold text-[#008751]">{formatCurrency(totalValue)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 font-medium mb-1">Catégories</div>
            <div className="text-2xl font-bold text-gray-900">{[...new Set(parts.map(p => p.category))].filter(Boolean).length}</div>
          </div>
        </div>
      </div>

      {/* ZONE 5: TABLEAU DE DONNÉES */}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8 px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">PIÈCE</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">DESCRIPTION</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">CATÉGORIE</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">FABRICANT</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">RÉF. FABRICANT</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">UNITÉ</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">EMPLACEMENT</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">COÛT UNITAIRE</th>
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
                return (
                  <tr key={part.id} data-testid="part-row" className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/parts/${part.id}`)}>
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
                  <ChevronRight size={16} className="rotate-180" />
                </button>
                <button
                  onClick={() => handlePageChange(Math.min(pagination.totalPages, currentPage + 1))}
                  disabled={!pagination.hasNext}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRight size={16} />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}