"use client";

import React, { useState, useEffect } from 'react';
import {
  LayoutList, Search, Filter, Plus, Car, MoreVertical, Loader2,
  Settings, CheckCircle, Wrench, Paperclip, Fuel, History, Archive
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useVehicles } from '@/lib/hooks/useVehicles';
import type { VehicleListQuery } from '@/lib/validations/vehicle-validations';

export default function VehicleList() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<VehicleListQuery>({
    page: 1,
    limit: 20,
    search: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const { vehicles, loading, error, fetchVehicles, hasNext, hasPrev, pagination } = useVehicles({
    query: filters,
    autoFetch: true
  });

  // Filtrage côté client en plus des filtres API
  const filteredVehicles = vehicles.filter(v =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.vin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gestion de la recherche
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  // Gestion des filtres
  const handleFilter = (newFilters: Partial<VehicleListQuery>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  // Charger plus de véhicules
  const loadMore = () => {
    if (hasNext && !loading) {
      setFilters(prev => ({ ...prev, page: prev.page + 1 }));
    }
  };

  // Mapper les statuts API vers les statuts UI
  const getStatusBadge = (status: string) => {
    const statusMap = {
      'ACTIVE': { label: 'Active', class: 'bg-green-100 text-green-800' },
      'INACTIVE': { label: 'Inactive', class: 'bg-gray-100 text-gray-800' },
      'MAINTENANCE': { label: 'In Shop', class: 'bg-yellow-100 text-yellow-800' },
      'DISPOSED': { label: 'Out of Service', class: 'bg-red-100 text-red-800' }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { label: status, class: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Véhicules</h1>
        <button
          onClick={() => router.push('/vehicles/list/create')}
          className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
        >
          <Plus size={20} /> Ajouter un véhicule
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="text-red-800">
            <strong>Erreur:</strong> {error}
          </div>
          <button
            onClick={() => fetchVehicles()}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Réessayer
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher par nom ou VIN..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#008751] focus:border-transparent"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50">
            <Filter size={18} /> Filtres
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <Loader2 className="mx-auto mb-4 text-gray-300 animate-spin" size={48} />
            <p>Chargement des véhicules...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <LayoutList size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Aucun véhicule trouvé.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                    <th className="p-4 font-medium">Nom / VIN</th>
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium">Statut</th>
                    <th className="p-4 font-medium">Opérateur</th>
                    <th className="p-4 font-medium">Compteur</th>
                    <th className="p-4 font-medium">Groupe</th>
                    <th className="p-4 font-medium w-10"></th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                  {filteredVehicles.map((vehicle) => (
                    <tr
                      key={vehicle.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/vehicles/list/${vehicle.id}`)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-500">
                            <Car size={20} />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{vehicle.name}</div>
                            <div className="text-xs text-gray-500">{vehicle.vin}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-700">{vehicle.type}</td>
                      <td className="p-4">
                        {getStatusBadge(vehicle.status)}
                      </td>
                      <td className="p-4 text-gray-700">
                        {vehicle.operator ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                              {vehicle.operator.charAt(0)}
                            </div>
                            {vehicle.operator}
                          </div>
                        ) : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="p-4 text-gray-700">
                        {vehicle.meterReading ? 
                          `${vehicle.meterReading.toLocaleString()} ${vehicle.primaryMeter || 'mi'}` :
                          vehicle.lastMeterReading ? 
                            `${vehicle.lastMeterReading.toLocaleString()} ${vehicle.lastMeterUnit || 'mi'}` :
                            <span className="text-gray-400">-</span>
                        }
                      </td>
                      <td className="p-4 text-gray-700">
                        {vehicle.group || <span className="text-gray-400">-</span>}
                      </td>
                      <td className="p-4 text-gray-400">
                        <div className="relative group">
                          <button
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            onClick={(e) => { e.stopPropagation(); }}
                          >
                            <MoreVertical size={16} />
                          </button>
                          
                          {/* Dropdown Menu */}
                          <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20 hidden group-hover:block">
                            <button
                              onClick={(e) => { e.stopPropagation(); router.push(`/vehicles/list/${vehicle.id}/edit`); }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <Settings size={14} /> Edit Vehicle Settings
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <CheckCircle size={14} /> Manage Inspection Forms
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <Wrench size={14} /> Manage Service Programs
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <Paperclip size={14} /> Attach Shared Document
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <Fuel size={14} /> Recalculate Fuel Entries
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <History size={14} /> View Record History
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button
                              onClick={(e) => { e.stopPropagation(); }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Archive size={14} /> Archive
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Page {pagination.page} sur {pagination.totalPages} ({pagination.totalCount} véhicules)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={!hasPrev || loading}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={!hasNext || loading}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}