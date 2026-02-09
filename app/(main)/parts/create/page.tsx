'use client';

import React, { useState, useRef } from 'react';
import {
  ChevronLeft,
  ChevronDown,
  X,
  Plus,
  Search,
  Package,
  Upload,
  Camera,
  FileText,
  Trash2,
  Loader2,
  Hash,
  Layers,
  Info,
  CreditCard,
  Ruler,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useParts } from '@/lib/hooks/useParts';
import { CreatePartData, partsAPI } from '@/lib/services/parts-api';
import { ManufacturerSelect } from '../components/ManufacturerSelect';
import { CategorySelect } from '../components/CategorySelect';
import { LocationSelect } from '../components/LocationSelect';
import { useToast, ToastContainer } from '@/components/NotificationToast';
import { authAPI } from '@/lib/auth-api';

export default function PartCreatePage() {
  const router = useRouter();
  const { createPart, loading: savingHook } = useParts();
  const { toast, toasts, removeToast } = useToast();

  // États du formulaire
  const [formData, setFormData] = useState<CreatePartData & { locations: any[] }>({
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
  const photoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const handleBack = () => {
    router.push('/parts');
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.number.trim()) {
      toast.error('Erreur', 'Le numéro de pièce est requis');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Erreur', 'La description est requise');
      return false;
    }
    return true;
  };

  const handleSave = async (andClose = true) => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const result = await createPart(formData);
      if (result) {
        // Si des emplacements sont définis, les ajouter
        if (formData.locations.length > 0) {
          const locationResults = await Promise.allSettled(formData.locations.map(loc =>
            partsAPI.addPartLocation(result.id, {
              placeId: loc.placeId,
              aisle: loc.aisle,
              row: loc.row,
              bin: loc.bin,
              quantity: loc.quantity
            })
          ));

          // Vérifier s'il y a des erreurs
          const failedLocations = locationResults.filter(r => r.status === 'rejected');
          if (failedLocations.length > 0) {
            console.error('Erreurs lors de l\'ajout des emplacements:', failedLocations);
            toast.warning('Attention', `Pièce créée mais ${failedLocations.length} emplacement(s) n'ont pas pu être ajoutés`);
          }
        }

        toast.success('Succès', 'Pièce créée avec succès');
        if (andClose) {
          setTimeout(() => router.push('/parts'), 1500);
        } else {
          // Reset form for "Add another"
          setFormData({
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
          setDocList([]);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de la pièce';
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
    uploadData.append('attachedTo', 'temp_part');

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
        toast.success('Succès', `${type === 'photo' ? 'Photos' : 'Documents'} téléchargées avec succès`);
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

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* ZONE 1: HEADER */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-30 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-6">
          <button
            onClick={handleBack}
            data-testid="back-button"
            className="text-gray-500 hover:text-gray-700 flex items-center gap-1 font-medium text-sm transition-colors"
          >
            <ChevronLeft size={18} /> Pièces
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">Nouvelle Pièce</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900 transition-colors">Annuler</button>
          <div className="flex items-center bg-white border border-gray-300 rounded-md overflow-hidden shadow-sm">
            <button onClick={() => handleSave(false)} className="px-4 py-2 text-gray-700 font-bold text-sm hover:bg-gray-50 border-r border-gray-300 transition-colors">
              Enregistrer et ajouter une autre
            </button>
            <button className="px-2 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
              <ChevronDown size={16} />
            </button>
          </div>
          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            data-testid="save-part-button"
            className="px-6 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isSaving && <Loader2 size={16} className="animate-spin" />}
            Enregistrer la pièce
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
                  selectedCategory={formData.category}
                  onSelect={(name) => handleInputChange('category', name)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Description <span className="text-red-500">*</span></label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                data-testid="part-description"
                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] outline-none resize-none"
                placeholder="Décrivez précisément l'utilité et l'usage de cette pièce..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Fabricant</label>
                <ManufacturerSelect
                  selectedManufacturerId={formData.manufacturer}
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
          </div>
        </div>

        {/* Section Stock et Coût */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CreditCard size={20} className="text-gray-400" /> Stock et Coût
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Coût unitaire (Ar)</label>
              <input
                type="number"
                value={formData.cost || ''}
                onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                data-testid="part-cost"
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] outline-none font-medium"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Quantité initiale</label>
              <input
                type="number"
                value={formData.quantity || ''}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                data-testid="part-quantity"
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] outline-none font-medium"
                min="0"
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
                data-testid="part-minimum-stock"
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
          <div className="flex gap-4">
            <button onClick={() => handleSave(false)} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-bold bg-white hover:bg-gray-50 shadow-sm transition-all text-sm">
              Enregistrer et ajouter une autre
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="px-6 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded-md shadow-sm flex items-center gap-2 transition-all disabled:opacity-50 text-sm"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              Enregistrer la pièce
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
