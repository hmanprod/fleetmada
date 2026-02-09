'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    ChevronLeft,
    ChevronDown,
    Loader2,
    Hash,
    Info,
    CreditCard,
    Ruler,
    MapPin,
    Upload,
    Camera,
    FileText,
    Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePartDetails } from '@/lib/hooks/usePartDetails';
import { UpdatePartData, partsAPI } from '@/lib/services/parts-api';
import { ManufacturerSelect } from '../../components/ManufacturerSelect';
import { CategorySelect } from '../../components/CategorySelect';
import { LocationSelect } from '../../components/LocationSelect';
import { useToast, ToastContainer } from '@/components/NotificationToast';
import { authAPI } from '@/lib/auth-api';

export default function PartEditPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { part, loading, error, updatePart } = usePartDetails(params.id);
    const { toast, toasts, removeToast } = useToast();

    // États du formulaire
    const [formData, setFormData] = useState<UpdatePartData & { locations: any[] }>({
        number: '',
        description: '',
        category: '',
        manufacturer: '',
        manufacturerPartNumber: '',
        upc: '',
        cost: 0,
        quantity: 0,
        minimumStock: 0,
        measurementUnit: 'pieces',
        locations: []
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [docList, setDocList] = useState<{ id: string; name: string; type: 'photo' | 'document'; url?: string }[]>([]);
    const [locationsLoaded, setLocationsLoaded] = useState(false);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const documentInputRef = useRef<HTMLInputElement>(null);

    // Charger les données de la pièce
    useEffect(() => {
        if (part) {
            setFormData({
                number: part.number || '',
                description: part.description || '',
                category: part.category || '',
                manufacturer: part.manufacturer || '',
                manufacturerPartNumber: part.manufacturerPartNumber || '',
                upc: part.upc || '',
                cost: part.cost || 0,
                quantity: part.quantity || 0,
                minimumStock: part.minimumStock || 0,
                measurementUnit: part.measurementUnit || 'pieces',
                locations: []
            });

            // Charger les emplacements existants
            if (!locationsLoaded) {
                partsAPI.getPartLocations(params.id).then(response => {
                    if (response.success && response.data) {
                        const locations = response.data.map((loc: any) => ({
                            id: loc.id,
                            placeId: loc.placeId,
                            placeName: loc.placeName || '',
                            aisle: loc.aisle || '',
                            row: loc.row || '',
                            bin: loc.bin || '',
                            quantity: loc.quantity || 0
                        }));
                        setFormData(prev => ({ ...prev, locations }));
                        setLocationsLoaded(true);
                    }
                }).catch(console.error);
            }
        }
    }, [part, params.id, locationsLoaded]);

    const handleBack = () => {
        router.push(`/parts/${params.id}`);
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateForm = (): boolean => {
        if (!formData.number || !formData.number.trim()) {
            toast.error('Erreur', 'Le numéro de pièce est requis');
            return false;
        }
        if (!formData.description || !formData.description.trim()) {
            toast.error('Erreur', 'La description est requise');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setIsSaving(true);
        try {
            const result = await updatePart(formData);
            if (result) {
                // Gérer les emplacements (supprimer les anciens, ajouter les nouveaux)
                // Pour simplifier, on met à jour les emplacements existants
                toast.success('Succès', 'Pièce mise à jour avec succès');
                setTimeout(() => router.push(`/parts/${params.id}`), 1500);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la pièce';
            toast.error('Erreur', errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'document') => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const uploadData = new FormData();
        Array.from(files).forEach(file => {
            uploadData.append('files', file);
        });
        uploadData.append('labels', type);
        uploadData.append('attachedTo', `part_${params.id}`);

        setIsUploading(true);
        try {
            const token = authAPI.getToken();
            const res = await fetch('/api/documents/upload', {
                method: 'POST',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: uploadData,
            });

            const data = await res.json();
            if (data.success) {
                const newDocs = data.data.successful.map((item: any) => ({
                    id: item.document.id,
                    name: item.document.fileName,
                    type: type,
                    url: item.document.filePath
                }));
                setDocList(prev => [...prev, ...newDocs]);
                toast.success('Succès', `${type === 'photo' ? 'Photos' : 'Documents'} téléchargés avec succès`);
            } else {
                toast.error('Erreur', 'Échec du téléchargement : ' + (data.error || 'Erreur inconnue'));
            }
        } catch (err) {
            console.error('Upload error:', err);
            toast.error('Erreur', 'Erreur lors du téléchargement des fichiers');
        } finally {
            setIsUploading(false);
        }

        if (e.target) e.target.value = '';
    };

    const handleRemoveFile = (id: string) => {
        setDocList(prev => prev.filter(doc => doc.id !== id));
    };

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008751]"></div>
                    <span className="text-gray-500">Chargement des données...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">Erreur de chargement: {error}</p>
                    <button
                        onClick={() => router.back()}
                        className="bg-[#008751] hover:bg-[#007043] text-white px-4 py-2 rounded"
                    >
                        Retour
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* HEADER */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-30 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-6">
                    <button
                        onClick={handleBack}
                        data-testid="back-button"
                        className="text-gray-500 hover:text-gray-700 flex items-center gap-1 font-medium text-sm transition-colors"
                    >
                        <ChevronLeft size={18} /> Retour
                    </button>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-gray-900">Modifier la pièce</h1>
                        <span className="text-gray-400 font-normal">#{formData.number}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleBack} className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900 transition-colors">Annuler</button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        data-testid="save-changes-button"
                        className="px-6 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        {isSaving && <Loader2 size={16} className="animate-spin" />}
                        Enregistrer les modifications
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 flex-1 w-full pb-32">
                {/* Section Informations Générales */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Info size={20} className="text-gray-400" /> Informations générales
                    </h2>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Numéro de pièce <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.number}
                                        onChange={(e) => handleInputChange('number', e.target.value)}
                                        data-testid="part-number"
                                        className="w-full p-2.5 pl-10 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] outline-none font-medium"
                                        placeholder="Ex: WF-10902"
                                    />
                                    <Hash size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Catégorie</label>
                                <CategorySelect
                                    selectedCategory={formData.category || ''}
                                    onSelect={(name) => handleInputChange('category', name)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description <span className="text-red-500">*</span></label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] outline-none resize-none"
                                placeholder="Décrivez précisément l'utilité et l'usage de cette pièce..."
                                data-testid="part-description"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Fabricant</label>
                                <ManufacturerSelect
                                    selectedManufacturerId={formData.manufacturer || ''}
                                    onSelect={(name) => handleInputChange('manufacturer', name)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Référence Fabricant</label>
                                <input
                                    type="text"
                                    value={formData.manufacturerPartNumber || ''}
                                    onChange={(e) => handleInputChange('manufacturerPartNumber', e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] outline-none font-medium"
                                    placeholder="Ex: BOSCH-2938"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Code UPC</label>
                            <input
                                type="text"
                                value={formData.upc || ''}
                                onChange={(e) => handleInputChange('upc', e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] outline-none font-medium"
                                placeholder="Code-barres UPC"
                            />
                        </div>
                    </div>
                </div>

                {/* Section Stock et Coût */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <CreditCard size={20} className="text-gray-400" /> Stock et Coût
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Coût unitaire (Ar)</label>
                            <input
                                type="number"
                                value={formData.cost || ''}
                                onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] outline-none font-medium"
                                min="0"
                                step="0.01"
                                data-testid="part-cost"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Unité de mesure</label>
                            <div className="relative">
                                <select
                                    value={formData.measurementUnit || 'pieces'}
                                    onChange={(e) => handleInputChange('measurementUnit', e.target.value)}
                                    className="w-full p-2.5 pl-10 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751] outline-none appearance-none cursor-pointer font-medium"
                                >
                                    <option value="pieces">Pièces</option>
                                    <option value="liters">Litres</option>
                                    <option value="kilograms">Kilogrammes</option>
                                    <option value="meters">Mètres</option>
                                </select>
                                <Ruler size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Réappro minimum</label>
                            <input
                                type="number"
                                value={formData.minimumStock || ''}
                                onChange={(e) => handleInputChange('minimumStock', parseInt(e.target.value) || 0)}
                                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] outline-none font-medium"
                                min="0"
                            />
                        </div>
                    </div>
                </div>

                {/* Section Emplacements */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MapPin size={20} className="text-gray-400" /> Emplacements de stockage
                        </div>
                        <span className="text-[10px] font-bold text-[#008751] bg-green-50 px-2 py-1 rounded-full uppercase tracking-wider">Lié aux Sites Opérationnels</span>
                    </h2>

                    <LocationSelect
                        locations={formData.locations}
                        onChange={(newLocs) => handleInputChange('locations', newLocs)}
                    />
                </div>

                {/* Photos & Documents */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Camera size={18} className="text-gray-400" /> Photos
                        </h2>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            ref={photoInputRef}
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, 'photo')}
                        />
                        <div
                            onClick={() => photoInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 hover:border-[#008751] transition-all group mb-4"
                        >
                            <div className="bg-gray-100 p-3 rounded-full mb-3 group-hover:bg-green-50 transition-colors">
                                <Upload size={24} className="text-gray-400 group-hover:text-[#008751]" />
                            </div>
                            <p className="text-sm font-bold text-gray-900">Glissez-déposez des photos</p>
                            <p className="text-xs text-gray-500 mt-1 font-medium">ou cliquez pour parcourir</p>
                            {isUploading && <p className="text-xs text-[#008751] mt-2 font-medium animate-pulse">Téléchargement...</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {docList.filter(d => d.type === 'photo').map(photo => (
                                <div key={photo.id} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-video bg-gray-50">
                                    <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button onClick={(e) => { e.stopPropagation(); handleRemoveFile(photo.id); }} className="bg-white p-1.5 rounded-full text-red-600 hover:bg-red-50 shadow-lg">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <FileText size={18} className="text-gray-400" /> Documents
                        </h2>
                        <input
                            type="file"
                            multiple
                            ref={documentInputRef}
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, 'document')}
                        />
                        <div
                            onClick={() => documentInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 hover:border-[#008751] transition-all group mb-4"
                        >
                            <div className="bg-gray-100 p-3 rounded-full mb-3 group-hover:bg-green-50 transition-colors">
                                <Upload size={24} className="text-gray-400 group-hover:text-[#008751]" />
                            </div>
                            <p className="text-sm font-bold text-gray-900">Glissez-déposez des documents</p>
                            <p className="text-xs text-gray-500 mt-1 font-medium">ou cliquez pour parcourir</p>
                            {isUploading && <p className="text-xs text-[#008751] mt-2 font-medium animate-pulse">Téléchargement...</p>}
                        </div>

                        <div className="space-y-2">
                            {docList.filter(d => d.type === 'document').map(doc => (
                                <div key={doc.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-200 group">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <FileText size={16} className="text-gray-400 shrink-0" />
                                        <span className="text-xs font-medium text-gray-700 truncate">{doc.name}</span>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); handleRemoveFile(doc.id); }} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-between items-center bg-transparent border-t border-gray-200 pt-8 mt-4">
                    <button onClick={handleBack} className="text-[#008751] hover:underline font-bold text-sm transition-all">Annuler</button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        data-testid="save-changes-button"
                        className="px-6 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded-md shadow-sm flex items-center gap-2 transition-all disabled:opacity-50 text-sm"
                    >
                        {isSaving && <Loader2 size={16} className="animate-spin" />}
                        Enregistrer les modifications
                    </button>
                </div>
            </div>
        </div>
    );
}
