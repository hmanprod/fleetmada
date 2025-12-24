'use client';

import React, { useState } from 'react';
import { ArrowLeft, MoreHorizontal, Info, MapPin, Plus, Minus, Loader2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCreatePlace, useCreatePlaceFromAddress, useGeocode } from '@/lib/hooks/usePlaces';
import { PlaceType } from '@/types/geolocation';

export default function PlaceCreatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    geofenceRadius: '',
    placeType: PlaceType.GENERAL,
    isActive: true
  });

  const [autoGeocode, setAutoGeocode] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Hooks pour les opérations
  const { createPlace, loading: createLoading, error: createError } = useCreatePlace();
  const { createPlaceFromAddress, loading: geocodeLoading, error: geocodeError } = useCreatePlaceFromAddress();
  const { geocodeAddress, loading: geocodeAddressLoading } = useGeocode();

  const handleBack = () => {
    router.push('/places');
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.name.trim()) {
      errors.push('Name is required');
    }

    if (formData.address && autoGeocode) {
      // Will be geocoded automatically
    } else {
      if (!formData.latitude) {
        errors.push('Latitude is required');
      }
      if (!formData.longitude) {
        errors.push('Longitude is required');
      }

      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);

      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.push('Latitude must be between -90 and 90');
      }

      if (isNaN(lng) || lng < -180 || lng > 180) {
        errors.push('Longitude must be between -180 and 180');
      }
    }

    if (formData.geofenceRadius) {
      const radius = parseFloat(formData.geofenceRadius);
      if (isNaN(radius) || radius <= 0) {
        errors.push('Geofence radius must be a positive number');
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleGeocodeAddress = async () => {
    if (!formData.address.trim()) return;

    try {
      const result = await geocodeAddress(formData.address);
      setFormData(prev => ({
        ...prev,
        latitude: result.latitude.toString(),
        longitude: result.longitude.toString(),
        address: result.formattedAddress
      }));
    } catch (error) {
      console.error('Geocoding failed:', error);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      let placeData;

      if (autoGeocode && formData.address.trim()) {
        // Create place with automatic geocoding
        placeData = await createPlaceFromAddress({
          name: formData.name,
          description: formData.description || undefined,
          address: formData.address,
          geofenceRadius: formData.geofenceRadius ? parseFloat(formData.geofenceRadius) : undefined,
          placeType: formData.placeType
        });
      } else {
        // Create place with manual coordinates
        placeData = await createPlace({
          name: formData.name,
          description: formData.description || undefined,
          address: formData.address || undefined,
          latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
          longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
          geofenceRadius: formData.geofenceRadius ? parseFloat(formData.geofenceRadius) : undefined,
          placeType: formData.placeType,
          isActive: formData.isActive
        });
      }

      // Navigate to the new place detail page
      router.push(`/places/${placeData.id}`);
    } catch (error) {
      console.error('Failed to create place:', error);
    }
  };

  const handleSaveAndAddAnother = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (autoGeocode && formData.address.trim()) {
        await createPlaceFromAddress({
          name: formData.name,
          description: formData.description || undefined,
          address: formData.address,
          geofenceRadius: formData.geofenceRadius ? parseFloat(formData.geofenceRadius) : undefined,
          placeType: formData.placeType
        });
      } else {
        await createPlace({
          name: formData.name,
          description: formData.description || undefined,
          address: formData.address || undefined,
          latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
          longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
          geofenceRadius: formData.geofenceRadius ? parseFloat(formData.geofenceRadius) : undefined,
          placeType: formData.placeType,
          isActive: formData.isActive
        });
      }

      // Reset form for another entry
      setFormData({
        name: '',
        description: '',
        address: '',
        latitude: '',
        longitude: '',
        geofenceRadius: '',
        placeType: PlaceType.GENERAL,
        isActive: true
      });
    } catch (error) {
      console.error('Failed to create place:', error);
    }
  };

  const isLoading = createLoading || geocodeLoading || geocodeAddressLoading;
  const error = createError || geocodeError;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <ArrowLeft size={18} /> Places
          </button>
          <h1 className="text-2xl font-bold text-gray-900">New Place</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={handleBack} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Cancel</button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            data-testid="save-place-button"
          >
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : null}
            Save Place
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-8 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error: {error}</p>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="mx-8 mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-600 font-medium">Please fix the following errors:</p>
          <ul className="text-yellow-600 text-sm mt-1 list-disc list-inside">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto py-8 px-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                    data-testid="place-name-input"
                  />
                  <div className="absolute right-3 top-3 text-red-400"><MoreHorizontal size={16} /></div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                  data-testid="place-description-textarea"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Place Type</label>
                <select
                  value={formData.placeType}
                  onChange={(e) => handleInputChange('placeType', e.target.value as PlaceType)}
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                  data-testid="place-type-select"
                >
                  <option value={PlaceType.GENERAL}>General</option>
                  <option value={PlaceType.FUEL_STATION}>Fuel Station</option>
                  <option value={PlaceType.SERVICE_CENTER}>Service Center</option>
                  <option value={PlaceType.OFFICE}>Office</option>
                  <option value={PlaceType.CLIENT_SITE}>Client Site</option>
                  <option value={PlaceType.HOME}>Home</option>
                </select>
              </div>
            </div>

            <hr className="my-6 border-gray-200" />

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Location Information</h3>
                <p className="text-xs text-gray-500 mb-4">
                  {autoGeocode
                    ? 'Enter an address below and coordinates will be automatically detected.'
                    : 'Enter coordinates manually or use the address field with geocoding.'
                  }
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoGeocode"
                  checked={autoGeocode}
                  onChange={(e) => setAutoGeocode(e.target.checked)}
                  className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]"
                />
                <label htmlFor="autoGeocode" className="text-sm text-gray-700">
                  Enable automatic geocoding
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address {autoGeocode && <span className="text-red-500">*</span>}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="flex-1 p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                    placeholder="Enter full address"
                    data-testid="place-address-input"
                  />
                  {autoGeocode && formData.address && (
                    <button
                      onClick={handleGeocodeAddress}
                      disabled={geocodeAddressLoading}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                    >
                      {geocodeAddressLoading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                      Geocode
                    </button>
                  )}
                </div>
              </div>

              {!autoGeocode && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => handleInputChange('latitude', e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => handleInputChange('longitude', e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                    />
                  </div>
                </div>
              )}
            </div>

            <hr className="my-6 border-gray-200" />

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Geofence Radius (meters)</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Enter radius in meters"
                    value={formData.geofenceRadius}
                    onChange={(e) => handleInputChange('geofenceRadius', e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                  />
                  <div className="absolute right-3 top-3 text-gray-400">
                    <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor"><path d="M5 0L0 5H10L5 0ZM5 16L10 11H0L5 16Z" /></svg>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  The geofence radius is used to determine location entries associated with this place.
                  You can use this geofence to send alerts when a location entry is here.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="rounded border-gray-300 text-[#008751] focus:ring-[#008751]"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Active place
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-4 flex items-center gap-3 text-blue-800 text-sm">
            <Info size={20} className="text-blue-500" />
            <div>
              <p className="font-medium">Interactive Map Preview</p>
              <p>Enter coordinates above to see the location on the map. The geofence will be visualized as a circle around the location.</p>
            </div>
          </div>

          <div className="bg-white border border-gray-300 rounded-lg shadow-sm h-[600px] relative overflow-hidden">
            {/* Map Placeholder with coordinates */}
            {formData.latitude && formData.longitude ? (
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${(parseFloat(formData.longitude) - 0.01).toString()}%2C${(parseFloat(formData.latitude) - 0.01).toString()}%2C${(parseFloat(formData.longitude) + 0.01).toString()}%2C${(parseFloat(formData.latitude) + 0.01).toString()}&layer=mapnik&marker=${formData.latitude}%2C${formData.longitude}`}
                title="Location Map"
              ></iframe>
            ) : (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Enter coordinates to view location on map</p>
                </div>
              </div>
            )}

            {/* Map Controls Mockup */}
            <div className="absolute top-2 left-2 bg-white border border-gray-300 rounded shadow-sm flex">
              <button className="p-2 hover:bg-gray-50 border-r border-gray-300"><span className="block w-4 h-4 border-2 border-gray-600 rounded-full"></span></button>
              <button className="p-2 hover:bg-gray-50 border-r border-gray-300"><span className="block w-4 h-4 bg-gray-400 rounded-full"></span></button>
              <button className="p-2 hover:bg-gray-50"><span className="block w-4 h-4 transform rotate-45 border-2 border-gray-600"></span></button>
            </div>

            <div className="absolute top-2 right-2 bg-white border border-gray-300 rounded shadow-sm">
              <button className="p-2 hover:bg-gray-50">
                <img src="https://maps.gstatic.com/mapfiles/api-3/images/pegman_dock_2x.png" className="w-5 h-8 object-contain opacity-70" alt="Street View" />
              </button>
            </div>

            {/* Location Pin */}
            {formData.latitude && formData.longitude && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <MapPin size={48} className="text-red-600 fill-red-600 drop-shadow-lg" />
              </div>
            )}

            {/* Zoom Controls */}
            <div className="absolute bottom-8 right-2 bg-white border border-gray-300 rounded shadow-sm flex flex-col">
              <button className="p-2 hover:bg-gray-50 border-b border-gray-300"><Plus size={16} /></button>
              <button className="p-2 hover:bg-gray-50"><Minus size={16} /></button>
            </div>

            <div className="absolute bottom-1 right-1 bg-white/80 text-[10px] px-1 text-gray-600">
              Keyboard shortcuts | Map data ©2025 OpenStreetMap | Terms
            </div>
            <div className="absolute bottom-1 left-1">
              <span className="text-blue-500 font-bold text-lg tracking-tighter">OSM</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 flex justify-end gap-3 bg-white border-t border-gray-200 sticky bottom-0">
        <button onClick={handleBack} className="text-[#008751] font-medium hover:underline mr-auto">Cancel</button>
        <button
          onClick={handleSaveAndAddAnother}
          disabled={isLoading}
          className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save & Add Another
        </button>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          data-testid="save-place-button"
        >
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : null}
          Save Place
        </button>
      </div>
    </div>
  );
}