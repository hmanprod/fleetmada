'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, MapPin, Loader2, Info, Search, Check, Trash2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePlace, useUpdatePlace, useDeletePlace, useGeocode } from '@/lib/hooks/usePlaces';
import { PlaceType } from '@/types/geolocation';

export default function PlaceEditPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { place, loading: fetchLoading, error: fetchError } = usePlace(params.id);
    const { updatePlace, loading: updateLoading } = useUpdatePlace();
    const { deletePlace, loading: deleteLoading } = useDeletePlace();
    const { geocodeAddress, loading: geocodeLoading } = useGeocode();

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
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Synchronisation du formulaire avec les données reçues
    useEffect(() => {
        if (place) {
            setFormData({
                name: place.name || '',
                description: place.description || '',
                address: place.address || '',
                latitude: place.latitude?.toString() || '',
                longitude: place.longitude?.toString() || '',
                geofenceRadius: place.geofenceRadius?.toString() || '500',
                placeType: (place.placeType as PlaceType) || PlaceType.GENERAL,
                isActive: place.isActive ?? true
            });
        }
    }, [place]);

    const handleBack = () => {
        router.push(`/settings/parts/locations`);
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (validationErrors.length > 0) setValidationErrors([]);
    };

    const validateForm = () => {
        const errors: string[] = [];
        if (!formData.name.trim()) errors.push('Le nom est requis');
        if (!formData.latitude || !formData.longitude) {
            if (!autoGeocode) errors.push('Les coordonnées sont requises');
            else if (!formData.address.trim()) errors.push('L\'adresse est requise pour le géocodage');
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
        } catch (err) {
            console.error('Erreur géocodage:', err);
        }
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        try {
            await updatePlace(params.id, {
                name: formData.name,
                description: formData.description,
                address: formData.address,
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
                geofenceRadius: parseFloat(formData.geofenceRadius),
                placeType: formData.placeType,
                isActive: formData.isActive
            });
            setShowSuccess(true);
            setTimeout(() => router.push(`/places/${params.id}`), 1000);
        } catch (err) {
            console.error('Erreur MAJ:', err);
        }
    };

    const handleDelete = async () => {
        try {
            await deletePlace(params.id);
            router.push('/places');
        } catch (err) {
            console.error('Erreur suppression:', err);
        }
    };

    if (fetchLoading) return (
        <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-[#008751]" size={48} /></div>
    );

    const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    const mapUrl = formData.latitude && formData.longitude
        ? `https://www.google.com/maps/embed/v1/place?key=${googleMapsKey}&q=${formData.latitude},${formData.longitude}&zoom=15`
        : null;

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* ZONE 1: HEADER */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-20 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="text-gray-400 hover:text-[#008751] transition-colors flex items-center gap-1">
                        <ArrowLeft size={18} /> Retour
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 truncate max-w-[300px]">Modifier: {place?.name}</h1>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl font-bold transition-all flex items-center gap-2"
                    >
                        <Trash2 size={18} /> Supprimer
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={updateLoading || showSuccess}
                        className={`px-6 py-2 ${showSuccess ? 'bg-green-600' : 'bg-[#008751] hover:bg-[#007043]'} text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2`}
                    >
                        {updateLoading ? <Loader2 className="animate-spin" size={18} /> : showSuccess ? <Check size={18} /> : <Save size={18} />}
                        {showSuccess ? 'Modifié !' : 'Enregistrer'}
                    </button>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto py-8 px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Form Component */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">
                            <section className="space-y-6">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Info size={16} /> Informations de base
                                </h3>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nom du lieu *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751] outline-none transition-all font-bold text-gray-900"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Type</label>
                                        <select
                                            value={formData.placeType}
                                            onChange={(e) => handleInputChange('placeType', e.target.value)}
                                            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#008751]/20 font-medium"
                                        >
                                            <option value={PlaceType.OFFICE}>Bureau</option>
                                            <option value={PlaceType.FUEL_STATION}>Station-service</option>
                                            <option value={PlaceType.SERVICE_CENTER}>Centre d'entretien</option>
                                            <option value={PlaceType.CLIENT_SITE}>Site client</option>
                                            <option value={PlaceType.HOME}>Domicile</option>
                                            <option value={PlaceType.GENERAL}>Général</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Rayon (m)</label>
                                        <input
                                            type="number"
                                            value={formData.geofenceRadius}
                                            onChange={(e) => handleInputChange('geofenceRadius', e.target.value)}
                                            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#008751]/20 font-medium"
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6 pt-6 border-t border-gray-50">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <MapPin size={16} /> Localisation dynamique
                                </h3>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Adresse Google Maps</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type="text"
                                                value={formData.address}
                                                onChange={(e) => handleInputChange('address', e.target.value)}
                                                className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008751]/20 outline-none transition-all font-medium"
                                                placeholder="Saisissez l'adresse complète..."
                                            />
                                        </div>
                                        <button onClick={handleGeocodeAddress} disabled={geocodeLoading} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50">
                                            {geocodeLoading ? <Loader2 className="animate-spin" size={18} /> : 'Vérifier'}
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Latitude</label>
                                        <input type="number" step="any" value={formData.latitude} onChange={(e) => handleInputChange('latitude', e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-mono" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Longitude</label>
                                        <input type="number" step="any" value={formData.longitude} onChange={(e) => handleInputChange('longitude', e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-mono" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <div className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${formData.isActive ? 'bg-[#008751]' : 'bg-gray-300'}`}
                                        onClick={() => handleInputChange('isActive', !formData.isActive)}>
                                        <div className={`bg-white w-3 h-3 rounded-full shadow-sm transform transition-transform ${formData.isActive ? 'translate-x-5' : ''}`}></div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-700">Lieu actif</span>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Preview Component */}
                    <div className="space-y-6">
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl h-[700px] relative overflow-hidden group">
                            {mapUrl ? (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    src={mapUrl}
                                    title="Aperçu Google Maps"
                                ></iframe>
                            ) : (
                                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-center p-12">
                                    <div className="space-y-4">
                                        <MapPin size={40} className="text-gray-300 mx-auto" />
                                        <p className="text-gray-400 font-bold">Aucune coordonnée</p>
                                        <p className="text-gray-400 text-sm max-w-xs mx-auto">
                                            Renseignez une adresse ou des coordonnées (latitude/longitude) pour afficher l’aperçu sur la carte.
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-white/20">
                                <p className="text-[10px] font-bold text-[#008751] uppercase tracking-wider">Aperçu en temps réel</p>
                                <p className="text-xs font-bold text-gray-900 tracking-tight">Vérifiez les modifications sur la carte</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Confirmation Suppression */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 text-center mb-2">Confirmer la suppression ?</h3>
                        <p className="text-sm text-gray-500 text-center mb-8">Cette action est irréversible. L'historique associé à ce lieu pourrait être désynchronisé.</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setShowDeleteConfirm(false)} className="py-3 bg-gray-50 text-gray-700 font-bold rounded-2xl hover:bg-gray-100 transition-colors">Annuler</button>
                            <button onClick={handleDelete} disabled={deleteLoading} className="py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50">
                                {deleteLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Supprimer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
