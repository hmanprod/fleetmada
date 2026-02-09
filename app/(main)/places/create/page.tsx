'use client';

import React, { useState } from 'react';
import { ArrowLeft, MoreHorizontal, Info, MapPin, Plus, Minus, Loader2, Search, Check, Upload, Camera, X, FileText, Trash2 } from 'lucide-react';
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
    geofenceRadius: '500',
    placeType: PlaceType.GENERAL,
    isActive: true
  });

  const [autoGeocode, setAutoGeocode] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([]);
  // Hooks pour les opérations
  const { createPlace, loading: createLoading, error: createError } = useCreatePlace();
  const { createPlaceFromAddress, loading: geocodeLoading, error: geocodeError } = useCreatePlaceFromAddress();
  const { geocodeAddress, loading: geocodeAddressLoading } = useGeocode();

  const handleBack = () => {
    router.push('/settings/parts/locations');
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.name.trim()) {
      errors.push('Le nom est requis');
    }

    if (autoGeocode && !formData.address.trim()) {
      errors.push('L\'adresse est requise pour le géocodage automatique');
    }

    if (!autoGeocode) {
      if (!formData.latitude) errors.push('La latitude est requise');
      if (!formData.longitude) errors.push('La longitude est requise');

      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);

      if (isNaN(lat) || lat < -90 || lat > 90) errors.push('Latitude invalide (-90 à 90)');
      if (isNaN(lng) || lng < -180 || lng > 180) errors.push('Longitude invalide (-180 à 180)');
    }

    if (formData.geofenceRadius) {
      const radius = parseFloat(formData.geofenceRadius);
      if (isNaN(radius) || radius <= 0) {
        errors.push('Le rayon de géofence doit être un nombre positif');
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleGeocodeAddress = async () => {
    if (!formData.address.trim()) return;

    try {
      const result = await geocodeAddress(formData.address);
      if (result) {
        setFormData(prev => ({
          ...prev,
          latitude: (result as any).latitude.toString(),
          longitude: (result as any).longitude.toString(),
          address: (result as any).formattedAddress
        }));
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedImages(prev => [...prev, ...files]);
    if (event.target) event.target.value = '';
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedDocuments(prev => [...prev, ...files]);
    if (event.target) event.target.value = '';
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setUploadedImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleRemoveDocument = (indexToRemove: number) => {
    setUploadedDocuments(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleCamera = () => {
    // simulation d'une prise de vue caméra
    const mockFile = new File([''], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
    setUploadedImages(prev => [...prev, mockFile]);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      let placeData;
      if (autoGeocode && formData.address.trim()) {
        placeData = await createPlaceFromAddress({
          name: formData.name,
          description: formData.description || undefined,
          address: formData.address,
          geofenceRadius: formData.geofenceRadius ? parseFloat(formData.geofenceRadius) : undefined,
          placeType: formData.placeType
        });
      } else {
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

      setShowSuccess(true);
      setTimeout(() => {
        router.push(`/places?created=true`);
      }, 1500);
    } catch (error) {
      console.error('Failed to create place:', error);
    }
  };

  const isLoading = createLoading || geocodeLoading || geocodeAddressLoading;
  const error = createError || geocodeError;

  // URL Google Maps pour le mode preview
  const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const mapUrl = formData.latitude && formData.longitude
    ? `https://www.google.com/maps/embed/v1/place?key=${googleMapsKey}&q=${formData.latitude},${formData.longitude}&zoom=15`
    : null;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ZONE 1: HEADER & ACTIONS */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="text-gray-400 hover:text-[#008751] transition-colors flex items-center gap-1">
            <ArrowLeft size={18} /> Sites opérationnels
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Nouveau lieu</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={handleBack} className="px-5 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded transition-colors bg-white">Annuler</button>
          <button
            onClick={handleSave}
            disabled={isLoading || showSuccess}
            className={`px-6 py-2 ${showSuccess ? 'bg-green-600' : 'bg-[#008751] hover:bg-[#007043]'} text-white font-bold rounded shadow-md disabled:opacity-50 transition-all flex items-center gap-2`}
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : showSuccess ? <Check size={18} /> : null}
            {showSuccess ? 'Lieu créé !' : 'Enregistrer le lieu'}
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto py-8 px-8">
        {(error || validationErrors.length > 0) && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-3 text-red-800">
              <Info size={20} className="text-red-500" />
              <div>
                <p className="font-bold">Attention</p>
                <p className="text-sm">{error || 'Veuillez corriger les erreurs ci-dessous.'}</p>
                {validationErrors.length > 0 && (
                  <ul className="mt-1 text-xs list-disc list-inside opacity-80">
                    {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Info size={20} className="text-[#008751]" /> Informations générales
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nom du lieu *</label>
                  <input
                    type="text"
                    placeholder="Ex: Siège Social Tana, Station Total..."
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Type de lieu</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: PlaceType.GENERAL, label: 'Général' },
                      { value: PlaceType.OFFICE, label: 'Bureau' },
                      { value: PlaceType.FUEL_STATION, label: 'Station-service' },
                      { value: PlaceType.SERVICE_CENTER, label: 'Centre d\'entretien' },
                      { value: PlaceType.CLIENT_SITE, label: 'Site client' },
                      { value: PlaceType.HOME, label: 'Domicile' }
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => handleInputChange('placeType', type.value)}
                        className={`p-3 text-sm rounded-xl border transition-all text-left font-medium ${formData.placeType === type.value
                          ? 'border-[#008751] bg-[#008751]/5 text-[#008751] ring-1 ring-[#008751]'
                          : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-300'}`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Détails supplémentaires sur ce lieu..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none transition-all"
                  ></textarea>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MapPin size={20} className="text-[#008751]" /> Localisation
                </h2>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-6 border border-gray-100">
                  <div className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${autoGeocode ? 'bg-[#008751]' : 'bg-gray-300'}`}
                    onClick={() => setAutoGeocode(!autoGeocode)}>
                    <div className={`bg-white w-3 h-3 rounded-full shadow-sm transform transition-transform ${autoGeocode ? 'translate-x-5' : ''}`}></div>
                  </div>
                  <span className="text-sm font-bold text-gray-700">Géocodage Google Maps automatique</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Adresse complète *</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="text"
                          placeholder="Rechercher une adresse sur Google Maps..."
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          onBlur={autoGeocode ? handleGeocodeAddress : undefined}
                          className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none transition-all font-medium shadow-sm"
                        />
                      </div>
                      {autoGeocode && formData.address && (
                        <button
                          onClick={handleGeocodeAddress}
                          disabled={geocodeAddressLoading}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 font-bold shadow-sm"
                        >
                          {geocodeAddressLoading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                          Vérifier
                        </button>
                      )}
                    </div>
                  </div>

                  {!autoGeocode && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          value={formData.latitude}
                          onChange={(e) => handleInputChange('latitude', e.target.value)}
                          className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          value={formData.longitude}
                          onChange={(e) => handleInputChange('longitude', e.target.value)}
                          className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none font-mono text-sm"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Rayon Géofence (mètres)</label>
                    <input
                      type="number"
                      placeholder="500"
                      value={formData.geofenceRadius}
                      onChange={(e) => handleInputChange('geofenceRadius', e.target.value)}
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none transition-all font-medium"
                    />
                    <p className="mt-2 text-xs text-gray-400 italic">
                      Utilisé pour détecter automatiquement l'entrée ou la sortie d'un véhicule dans cette zone.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Photos Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Camera size={20} className="text-[#008751]" /> Photos
              </h2>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    className="flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xl text-sm font-bold transition-all"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choisir photos
                  </button>
                  <button
                    type="button"
                    onClick={handleCamera}
                    className="flex items-center justify-center px-4 py-2 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-xl text-sm font-bold transition-all text-blue-700"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Prendre photo
                  </button>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                    {uploadedImages.map((file, index) => (
                      <div key={index} className="relative group aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                        {file.size > 0 ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <Camera size={24} className="text-gray-300" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg active:scale-95"
                        >
                          <X size={14} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate backdrop-blur-sm">
                          {file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-gray-400 font-medium">JPG, PNG, GIF acceptés. Max 5MB par fichier.</p>
              </div>
            </div>

            {/* Documents Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText size={20} className="text-[#008751]" /> Documents
              </h2>

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => document.getElementById('doc-upload')?.click()}
                  className="flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xl text-sm font-bold transition-all"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Ajouter documents
                </button>
                <input
                  id="doc-upload"
                  type="file"
                  multiple
                  onChange={handleDocumentUpload}
                  className="hidden"
                />

                {uploadedDocuments.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {uploadedDocuments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group hover:border-[#008751]/30 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-[#008751] shadow-sm border border-gray-100">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{file.name}</p>
                            <p className="text-[10px] text-gray-500 font-mono uppercase">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(index)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-gray-400 font-medium">PDF, DOCX, XLSX acceptés. Max 10MB par fichier.</p>
              </div>
            </div>
          </div>

          {/* Map Preview Section */}
          <div className="space-y-6">
            <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Aperçu Google Maps</h3>
                  <p className="text-blue-100 text-sm opacity-90">Visualisez l'emplacement et le géofencing en temps réel.</p>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-xl h-[700px] relative overflow-hidden group">
              {mapUrl ? (
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={mapUrl}
                  title="Aperçu Google Maps"
                ></iframe>
              ) : (
                <div className="absolute inset-0 bg-gray-50 flex items-center justify-center text-center p-12">
                  <div className="space-y-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                      <MapPin size={40} className="text-gray-300" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-400">Aucune coordonnée</h4>
                    <p className="text-gray-400 text-sm max-w-xs mx-auto">
                      {autoGeocode
                        ? 'Saisissez une adresse puis cliquez sur « Vérifier l’adresse » pour afficher l’aperçu.'
                        : 'Renseignez la latitude et la longitude (mode manuel) pour afficher l’aperçu.'}
                    </p>
                    {autoGeocode && formData.address.trim() && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleGeocodeAddress}
                          disabled={geocodeAddressLoading}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#008751] text-white font-bold hover:bg-[#007043] disabled:opacity-50"
                        >
                          {geocodeAddressLoading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                          Vérifier l’adresse
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Location Pin Hover UI */}
              {formData.latitude && formData.longitude && (
                <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/20 max-w-xs animate-in zoom-in duration-500">
                  <p className="text-xs font-bold text-[#008751] uppercase mb-1">Localisation détectée</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{formData.address || 'Point manuel'}</p>
                  <div className="mt-2 flex gap-3 text-[10px] font-mono text-gray-500">
                    <span>LAT: {parseFloat(formData.latitude).toFixed(4)}</span>
                    <span>LNG: {parseFloat(formData.longitude).toFixed(4)}</span>
                  </div>
                </div>
              )}

              <div className="absolute bottom-4 left-4">
                <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-blue-600 shadow-sm border border-blue-100">
                  Propulsé par Google Maps
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
