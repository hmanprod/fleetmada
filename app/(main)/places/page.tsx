'use client';

import React, { useState } from 'react';
import { Search, Plus, Filter, MoreHorizontal, ChevronRight, ChevronDown, Settings, MapPin, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePlaces, usePlaceSearch } from '@/lib/hooks/usePlaces';
import { PlaceType } from '@/types/geolocation';

export default function PlacesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    locationType: false,
    locationDate: false,
    geofenceRadius: false
  });
  const [placeTypeFilter, setPlaceTypeFilter] = useState<PlaceType | ''>('');

  // Utilisation des hooks
  const { places, loading, error, refresh } = usePlaces({
    search: searchTerm,
    type: placeTypeFilter || undefined,
    limit: 20
  });

  const { searchPlaces } = usePlaceSearch();

  const handleAddPlace = () => {
    router.push('/places/create');
  };

  const handleLearnMore = () => {
    // TODO: Navigate to documentation or help page
    console.log('Navigate to learn more about places');
  };

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filter]: !prev[filter as keyof typeof prev]
    }));
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      searchPlaces(value);
    }
  };

  const handlePlaceTypeFilter = (type: PlaceType | '') => {
    setPlaceTypeFilter(type);
  };

  if (error) {
    return (
      <div className="p-6 max-w-[1800px] mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading places: {error}</p>
          <button
            onClick={refresh}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900" data-testid="places-title">Places</h1>
          {/* <button
            onClick={handleLearnMore}
            className="text-gray-500 hover:bg-gray-100 p-1 rounded text-xs bg-gray-50 border border-gray-200 px-2"
          >
            Learn
          </button> */}
        </div>
        <div className="flex gap-2">
          <button className="border border-gray-300 rounded p-2 text-gray-600 hover:bg-gray-50"><MoreHorizontal size={20} /></button>
          <button
            onClick={handleAddPlace}
            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
            data-testid="add-place-button"
          >
            <Plus size={20} /> Add Place
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search places..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-[#008751] focus:border-[#008751]"
            data-testid="search-input"
          />
        </div>
        <button
          onClick={() => toggleFilter('locationType')}
          className={`bg-white border px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 ${selectedFilters.locationType
            ? 'border-[#008751] bg-[#008751] text-white'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
        >
          Location Entry Type <ChevronDown size={14} />
        </button>
        <button
          onClick={() => toggleFilter('locationDate')}
          className={`bg-white border px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 ${selectedFilters.locationDate
            ? 'border-[#008751] bg-[#008751] text-white'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
        >
          Location Entry Date <ChevronDown size={14} />
        </button>
        <button
          onClick={() => toggleFilter('geofenceRadius')}
          className={`bg-white border px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 ${selectedFilters.geofenceRadius
            ? 'border-[#008751] bg-[#008751] text-white'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
        >
          Place Geofence Radius <ChevronDown size={14} />
        </button>
        <button className="bg-white border border-gray-300 px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          <Filter size={14} /> Filters
        </button>
        <div className="flex gap-1 ml-auto">
          <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white cursor-not-allowed"><ChevronRight size={16} className="rotate-180" /></button>
          <button className="p-1 border border-gray-300 rounded text-gray-400 bg-white cursor-not-allowed"><ChevronRight size={16} /></button>
        </div>
        <button className="bg-white border border-gray-300 px-2 py-1.5 rounded text-gray-700 hover:bg-gray-50">
          <Settings size={16} />
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden min-h-[400px]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Name ▲</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider underline decoration-dotted">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin mr-2" size={24} />
                    <span>Loading places...</span>
                  </div>
                </td>
              </tr>
            ) : places.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-16 w-16 rounded-full border-2 border-green-500 flex items-center justify-center mb-4">
                      <Search size={32} className="text-green-500" />
                    </div>
                    <p className="text-gray-500 mb-1">
                      {searchTerm || Object.values(selectedFilters).some(Boolean)
                        ? 'No places found matching your search criteria.'
                        : 'No results to show.'
                      }
                    </p>
                    <p className="text-sm text-gray-400 mb-4 max-w-md text-center">
                      Places are specific locations that are important for your fleet.
                    </p>
                    {!searchTerm && !Object.values(selectedFilters).some(Boolean) && (
                      <button
                        onClick={handleLearnMore}
                        className="text-[#008751] font-medium hover:underline text-sm mb-4"
                      >
                        Learn More
                      </button>
                    )}
                    <button
                      onClick={handleAddPlace}
                      className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                    >
                      <Plus size={20} /> Add Place
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              places.map((place) => (
                <tr key={place.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/places/${place.id}`)} data-testid="place-row">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin size={16} className="text-gray-400 mr-2" />
                      <div className="text-sm font-medium text-gray-900">{place.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {place.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {place.address || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${place.placeType === 'FUEL_STATION' ? 'bg-green-100 text-green-800' :
                      place.placeType === 'SERVICE_CENTER' ? 'bg-blue-100 text-blue-800' :
                        place.placeType === 'OFFICE' ? 'bg-purple-100 text-purple-800' :
                          place.placeType === 'CLIENT_SITE' ? 'bg-orange-100 text-orange-800' :
                            place.placeType === 'HOME' ? 'bg-pink-100 text-pink-800' :
                              'bg-gray-100 text-gray-800'
                      }`}>
                      {place.placeType.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/places/${place.id}/edit`);
                      }}
                      className="text-[#008751] hover:text-[#007043]"
                    >
                      Edit
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