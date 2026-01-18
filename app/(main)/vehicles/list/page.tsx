"use client";

import React, { useState, useEffect } from 'react';
import {
  LayoutList, Search, Filter, Plus, Car, MoreVertical, Loader2,
  Settings, CheckCircle, Wrench, Paperclip, Fuel, History, Archive, X,
  Eye
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { VehiclesAPIService, type Vehicle } from '@/lib/services/vehicles-api';
import type { VehicleListQuery } from '@/lib/validations/vehicle-validations';
import { FiltersSidebar } from '../components/filters/FiltersSidebar';
import { type FilterCriterion } from '../components/filters/FilterCard';
import { VEHICLE_LIST_FIELDS } from '../components/filters/filter-definitions';

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

  // État pour la popup de confirmation d'archivage
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [vehicleToArchive, setVehicleToArchive] = useState<Vehicle | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  // État pour la sidebar de filtres
  const [isFiltersSidebarOpen, setIsFiltersSidebarOpen] = useState(false);
  const [activeCriteria, setActiveCriteria] = useState<FilterCriterion[]>([]);

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

  const handleApplyFilters = (criteria: FilterCriterion[]) => {
    setActiveCriteria(criteria);

    // Convert criteria to query parameters
    const newFilters: any = {};

    // Reset known filters first to clear them if removed from sidebar
    VEHICLE_LIST_FIELDS.forEach(f => {
      newFilters[f.id] = undefined;
    });

    criteria.forEach(c => {
      const key = c.field;
      const value = c.value;
      const operator = c.operator;

      if (operator === 'between') {
        if (value.from) newFilters[`${key}_gte`] = value.from;
        if (value.to) newFilters[`${key}_lte`] = value.to;
      } else if (operator === 'is' || operator === 'contains') {
        newFilters[key] = value;
      } else if (operator === 'is_any_of') {
        newFilters[key] = Array.isArray(value) ? value.join(',') : value;
      } else {
        newFilters[`${key}_${operator}`] = value;
      }
    });

    handleFilter(newFilters);
    setIsFiltersSidebarOpen(false);
  };

  // Charger plus de véhicules
  const loadMore = () => {
    if (hasNext && !loading) {
      setFilters(prev => ({ ...prev, page: prev.page + 1 }));
    }
  };

  // Gestion de l'archivage
  const handleArchiveClick = (vehicle: Vehicle, e: React.MouseEvent) => {
    e.stopPropagation();
    setVehicleToArchive(vehicle);
    setIsArchiveModalOpen(true);
  };

  const handleConfirmArchive = async () => {
    if (!vehicleToArchive) return;

    setIsArchiving(true);
    try {
      const apiService = new VehiclesAPIService();
      await apiService.archiveVehicle(vehicleToArchive.id);

      // Rafraîchir la liste des véhicules
      await fetchVehicles();

      setIsArchiveModalOpen(false);
      setVehicleToArchive(null);
    } catch (error) {
      console.error('Erreur lors de l\'archivage:', error);
      alert('Erreur lors de l\'archivage du véhicule. Veuillez réessayer.');
    } finally {
      setIsArchiving(false);
    }
  };

  const handleCancelArchive = () => {
    setIsArchiveModalOpen(false);
    setVehicleToArchive(null);
  };

  // Mapper les statuts API vers les statuts UI
  const getStatusBadge = (status: string) => {
    const statusMap = {
      'ACTIVE': { label: 'Actif', class: 'bg-green-100 text-green-800' },
      'INACTIVE': { label: 'Inactif', class: 'bg-gray-100 text-gray-800' },
      'MAINTENANCE': { label: 'En atelier', class: 'bg-yellow-100 text-yellow-800' },
      'DISPOSED': { label: 'Hors service', class: 'bg-red-100 text-red-800' }
    };

    const config = statusMap[status as keyof typeof statusMap] || { label: status, class: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Véhicules</h1>
        <button
          onClick={() => router.push('/vehicles/list/create')}
          className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
        >
          <Plus size={20} /> Ajouter un véhicule
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Rechercher par nom ou VIN..."
            className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsFiltersSidebarOpen(true)}
          className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <Filter size={14} /> Filtres
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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
            <Loader2 className="animate-spin text-[#008751]" size={32} />
          </div>
        )}

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200 font-medium">
              <th className="p-4 w-8"><input type="checkbox" className="rounded border-gray-300" /></th>
              <th className="p-4">Nom / VIN</th>
              <th className="p-4">Type</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Opérateur</th>
              <th className="p-4">Compteur</th>
              <th className="p-4">Groupe</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {filteredVehicles.length > 0 ? filteredVehicles.map((vehicle) => (
              <tr
                key={vehicle.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => router.push(`/vehicles/list/${vehicle.id}`)}
              >
                <td className="p-4" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="rounded border-gray-300" /></td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-500">
                      <Car size={20} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{vehicle.name}</div>
                      <div className="text-xs text-gray-500">
                        {vehicle.vin}{vehicle.licensePlate ? ` • ${vehicle.licensePlate}` : ''}
                      </div>
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
                <td className="p-4 text-right text-gray-400">
                  <div className="relative group hover:z-30">
                    <button
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      onClick={(e) => { e.stopPropagation(); }}
                    >
                      <MoreVertical size={16} />
                    </button>

                    <div className="absolute right-0 mt-0 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20 hidden group-hover:block">
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/vehicles/list/${vehicle.id}`); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Eye size={14} /> Voir
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/vehicles/list/${vehicle.id}/edit`); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Settings size={14} /> Modifier
                      </button>
                      <button
                        onClick={(e) => handleArchiveClick(vehicle, e)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Archive size={14} /> Archiver
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            )) : !loading && (
              <tr>
                <td colSpan={8} className="p-12 text-center text-gray-500">
                  <LayoutList size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Aucun véhicule trouvé.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
          <div>
            Page {pagination.page} sur {pagination.totalPages} ({pagination.totalCount} véhicules)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={!hasPrev || loading}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={!hasNext || loading}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Popup de confirmation d'archivage */}
      {isArchiveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Confirmer l'archivage</h3>
              <button
                onClick={handleCancelArchive}
                className="text-gray-400 hover:text-gray-600"
                disabled={isArchiving}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Êtes-vous sûr de vouloir archiver le véhicule <strong>{vehicleToArchive?.name}</strong> ?
              </p>
              <p className="text-sm text-gray-500">
                Cette action peut être annulée ultérieurement. Le véhicule ne sera plus visible dans la liste active.
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-200">
              <button
                onClick={handleCancelArchive}
                disabled={isArchiving}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmArchive}
                disabled={isArchiving}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {isArchiving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Archivage...
                  </>
                ) : (
                  <>
                    <Archive size={16} />
                    Archiver
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar de Filtres */}
      <FiltersSidebar
        isOpen={isFiltersSidebarOpen}
        onClose={() => setIsFiltersSidebarOpen(false)}
        onApply={handleApplyFilters}
        initialFilters={activeCriteria}
        availableFields={VEHICLE_LIST_FIELDS}
      />
    </div>
  );
}