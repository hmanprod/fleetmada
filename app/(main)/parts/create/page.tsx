'use client';

import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useParts } from '@/lib/hooks/useParts';
import { CreatePartData } from '@/lib/services/parts-api';

export default function PartCreatePage() {
  const router = useRouter();
  const { createPart, loading, error } = useParts();

  const [formData, setFormData] = useState<CreatePartData>({
    number: '',
    description: '',
    category: '',
    manufacturer: '',
    manufacturerPartNumber: '',
    upc: '',
    cost: 0,
    quantity: 0,
    minimumStock: 0,
    measurementUnit: 'pieces'
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleBack = () => {
    router.push('/parts');
  };

  const handleSave = async () => {
    if (!formData.number || !formData.description) {
      alert('Le numéro et la description de la pièce sont requis.');
      return;
    }

    setSaving(true);
    try {
      const result = await createPart(formData);
      if (result) {
        setSaveSuccess(true);
        setTimeout(() => {
          router.push('/parts');
        }, 1000);
      }
    } catch (err) {
      console.error('Erreur lors de la création:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndAddAnother = async () => {
    if (!formData.number || !formData.description) {
      alert('Le numéro et la description de la pièce sont requis.');
      return;
    }

    setSaving(true);
    try {
      const result = await createPart(formData);
      if (result) {
        // Reset form for new part
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
          measurementUnit: 'pieces'
        });
        setSaveSuccess(false);
      }
    } catch (err) {
      console.error('Erreur lors de la création:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof CreatePartData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (amount: number) => {
    return `Ar ${amount.toLocaleString()}`;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} data-testid="back-button" className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <ArrowLeft size={18} /> Parts
          </button>
          <h1 data-testid="page-title" className="text-2xl font-bold text-gray-900">New Part</h1>
        </div>
        <div className="flex gap-3">
          <button data-testid="cancel-button" onClick={handleBack} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white" disabled={saving}>Cancel</button>
          <button
            onClick={handleSave}
            data-testid="save-part-button"
            className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={saving || !formData.number || !formData.description}
          >
            {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
        {/* Details Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Details</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de pièce <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.number}
                onChange={(e) => handleInputChange('number', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                placeholder="Ex: WF-10902"
                data-testid="part-number"
              />
              <p className="mt-1 text-xs text-gray-500">Identifiant interne de la pièce. Doit être unique.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                placeholder="Description détaillée de la pièce"
                data-testid="part-description"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                <div className="flex items-center gap-2">
                  <button className="bg-[#008751] text-white px-3 py-1.5 rounded text-sm font-medium">Pick File</button>
                  <button className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded text-sm border border-gray-300 border-dashed">Or drop file here</button>
                </div>
                <p className="mt-1 text-xs text-gray-500 italic">No file selected</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document</label>
                <div className="flex items-center gap-2">
                  <button className="bg-[#008751] text-white px-3 py-1.5 rounded text-sm font-medium">Pick File</button>
                  <button className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded text-sm border border-gray-300 border-dashed">Or drop file here</button>
                </div>
                <p className="mt-1 text-xs text-gray-500 italic">No file selected</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                value={formData.category || ''}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
                data-testid="part-category"
              >
                <option value="">Sélectionner</option>
                <option value="engine">Moteur</option>
                <option value="transmission">Boîte de vitesses</option>
                <option value="brakes">Freins</option>
                <option value="electrical">Électrique</option>
                <option value="filters">Filtres</option>
                <option value="oil">Huiles & Fluides</option>
                <option value="tires">Pneus</option>
                <option value="body">Carrosserie</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fabricant</label>
              <select
                value={formData.manufacturer || ''}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
                data-testid="part-manufacturer"
              >
                <option value="">Sélectionner</option>
                <option value="bosch">Bosch</option>
                <option value="continental">Continental</option>
                <option value="delphi">Delphi</option>
                <option value="denso">Denso</option>
                <option value="wix">Wix</option>
                <option value="mobil">Mobil</option>
                <option value="shell">Shell</option>
                <option value="bridgestone">Bridgestone</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro fabricant</label>
                <input
                  type="text"
                  value={formData.manufacturerPartNumber || ''}
                  onChange={(e) => handleInputChange('manufacturerPartNumber', e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                  placeholder="Numéro du fabricant"
                />
                <p className="mt-1 text-xs text-gray-500">Numéro spécifique du fabricant pour différencier de l'identifiant interne.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UPC</label>
                <input
                  type="text"
                  value={formData.upc || ''}
                  onChange={(e) => handleInputChange('upc', e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                  placeholder="Code UPC"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coût unitaire</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.cost || ''}
                    onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    data-testid="part-cost"
                  />
                  <div className="absolute right-3 top-2 flex items-center text-gray-500 text-sm font-medium">
                    Ar
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unité de mesure</label>
                <select
                  value={formData.measurementUnit || 'pieces'}
                  onChange={(e) => handleInputChange('measurementUnit', e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
                >
                  <option value="pieces">Pièces</option>
                  <option value="liters">Litres</option>
                  <option value="kilograms">Kilogrammes</option>
                  <option value="meters">Mètres</option>
                  <option value="liters">Litres</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité initiale</label>
                <input
                  type="number"
                  value={formData.quantity || ''}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                  placeholder="0"
                  min="0"
                  data-testid="part-quantity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock minimum</label>
                <input
                  type="number"
                  value={formData.minimumStock || ''}
                  onChange={(e) => handleInputChange('minimumStock', parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                  placeholder="0"
                  min="0"
                  data-testid="part-minimum-stock"
                />
                <p className="mt-1 text-xs text-gray-500">Seuil d'alerte pour le réapprovisionnement</p>
              </div>
            </div>
          </div>
        </div>

        {/* Locations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Locations</h2>

          <div>
            <p className="text-sm text-gray-600 mb-2">You do not have access to any Part Locations</p>
            <select className="w-full p-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-500" disabled>
              <option>Please select</option>
            </select>
          </div>
        </div>

        {/* Messages de succès/erreur */}
        {saveSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <div className="flex items-center">
              <div className="text-green-600">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">Pièce créée avec succès!</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-600">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 pb-12">
          <button onClick={handleBack} className="text-[#008751] font-medium hover:underline mr-auto ml-2" disabled={saving}>Annuler</button>
          <button
            onClick={handleSaveAndAddAnother}
            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded border border-gray-300 bg-white disabled:opacity-50"
            disabled={saving || !formData.number || !formData.description}
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder et ajouter'}
          </button>
          <button
            onClick={handleSave}
            data-testid="save-changes-button"
            className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={saving || !formData.number || !formData.description}
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder la pièce'}
          </button>
        </div>

      </div>
    </div>
  );
}