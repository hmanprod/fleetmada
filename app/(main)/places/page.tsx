'use client';

import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, ChevronDown, MapPin, Loader2, Home, Building2, Fuel, Wrench, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePlaces } from '@/lib/hooks/usePlaces';
import { PlaceType } from '@/types/geolocation';

export default function PlacesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<PlaceType | ''>('');

  // Utilisation du hook avec les filtres
  const { places, loading, error, pagination } = usePlaces({
    search: searchTerm,
    type: activeTab || undefined,
    limit: 50
  });

  const handleAddPlace = () => {
    router.push('/places/create');
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const getPlaceTypeIcon = (type: PlaceType) => {
    switch (type) {
      case PlaceType.OFFICE: return <Building2 size={16} />;
      case PlaceType.FUEL_STATION: return <Fuel size={16} />;
      case PlaceType.SERVICE_CENTER: return <Wrench size={16} />;
      case PlaceType.CLIENT_SITE: return <Briefcase size={16} />;
      case PlaceType.HOME: return <Home size={16} />;
      default: return <MapPin size={16} />;
    }
  };

  const getPlaceTypeLabel = (type: PlaceType) => {
    switch (type) {
      case PlaceType.OFFICE: return 'Bureau';
      case PlaceType.FUEL_STATION: return 'Station-service';
      case PlaceType.SERVICE_CENTER: return 'Centre d\'entretien';
      case PlaceType.CLIENT_SITE: return 'Site client';
      case PlaceType.HOME: return 'Domicile';
      case PlaceType.GENERAL: return 'Général';
      default: return type;
    }
  };

  const getPlaceTypeBadgeColor = (type: PlaceType) => {
    switch (type) {
      case PlaceType.OFFICE: return 'bg-purple-100 text-purple-800';
      case PlaceType.FUEL_STATION: return 'bg-green-100 text-green-800';
      case PlaceType.SERVICE_CENTER: return 'bg-blue-100 text-blue-800';
      case PlaceType.CLIENT_SITE: return 'bg-orange-100 text-orange-800';
      case PlaceType.HOME: return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { title: 'Tous', value: '' },
    { title: 'Bureaux', value: PlaceType.OFFICE, icon: <Building2 size={14} /> },
    { title: 'Stations', value: PlaceType.FUEL_STATION, icon: <Fuel size={14} /> },
    { title: 'Entretien', value: PlaceType.SERVICE_CENTER, icon: <Wrench size={14} /> },
    { title: 'Clients', value: PlaceType.CLIENT_SITE, icon: <Briefcase size={14} /> },
  ];

  if (error) {
    return (
      <div className="p-6 max-w-[1800px] mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Erreur lors du chargement des sites opérationnels : {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1800px] mx-auto space-y-6">
      {/* ZONE 1: HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" data-testid="places-title">Sites opérationnels</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez les emplacements clés de votre flotte</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAddPlace}
            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 shadow-sm transition-all active:scale-95"
            data-testid="add-place-button"
          >
            <Plus size={20} /> Ajouter un lieu
          </button>
        </div>
      </div>

      {/* ZONE 2: NAVIGATION TABS */}
      <div className="flex gap-6 border-b border-gray-200 font-medium text-sm text-gray-500">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value as any)}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${activeTab === tab.value
              ? 'border-[#008751] text-[#008751] font-bold'
              : 'border-transparent hover:text-gray-700'
              }`}
          >
            {tab.icon} {tab.title}
          </button>
        ))}
      </div>

      {/* ZONE 3: FILTERS BAR */}
      <div className="flex flex-wrap gap-4 bg-gray-50 p-3 rounded-xl border border-gray-200 items-center">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher par nom ou adresse..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none transition-all"
            data-testid="search-input"
          />
        </div>
        <button className="bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
          <Filter size={16} /> Filtres avancés
        </button>

        <div className="flex-1 text-right text-sm text-gray-500">
          {pagination ? `${places.length} sur ${pagination.total} sites opérationnels` : '0 lieu'}
        </div>
        <div className="flex gap-1">
          <button className="p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50"><ChevronRight size={18} className="rotate-180" /></button>
          <button className="p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50"><ChevronRight size={18} /></button>
        </div>
      </div>

      {/* ZONE 4: DASHBOARD STATISTIQUES */}
      <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-sm text-gray-500 font-medium mb-1">Total Sites opérationnels</p>
          <p className="text-2xl font-bold text-gray-900">{pagination?.total || places.length}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 font-medium mb-1">Actifs</p>
          <p className="text-2xl font-bold text-green-600">{places.filter(p => p.isActive).length}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 font-medium mb-1">Bureaux</p>
          <p className="text-2xl font-bold text-purple-600">{places.filter(p => p.placeType === PlaceType.OFFICE).length}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 font-medium mb-1">Stations</p>
          <p className="text-2xl font-bold text-blue-600">{places.filter(p => p.placeType === PlaceType.FUEL_STATION).length}</p>
        </div>
      </div>

      {/* ZONE 5: TABLEAU DE DONNÉES */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Adresse</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="animate-spin text-[#008751]" size={32} />
                    <span className="text-gray-500 font-medium">Chargement des sites opérationnels...</span>
                  </div>
                </td>
              </tr>
            ) : places.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                      <MapPin size={32} className="text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">Aucun lieu trouvé</p>
                    <p className="text-sm text-gray-400 mt-1">Essayez d'ajuster vos filtres ou ajoutez un nouveau lieu.</p>
                  </div>
                </td>
              </tr>
            ) : (
              places.map((place) => (
                <tr
                  key={place.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/places/${place.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 ${getPlaceTypeBadgeColor(place.placeType)} opacity-80`}>
                        {getPlaceTypeIcon(place.placeType)}
                      </div>
                      <div className="text-sm font-bold text-gray-900">{place.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                      {place.description || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                      {place.address || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${getPlaceTypeBadgeColor(place.placeType)}`}>
                      {getPlaceTypeLabel(place.placeType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/places/${place.id}/edit`);
                      }}
                      className="text-gray-400 hover:text-[#008751] transition-colors p-1"
                    >
                      <MoreHorizontal size={20} />
                    </button>
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