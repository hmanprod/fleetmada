'use client';

import React, { useState } from 'react';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCreateFuelEntry } from '@/lib/hooks/useFuelEntries';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { CreateFuelEntryData } from '@/types/fuel';


export default function FuelEntryCreatePage() {
  const router = useRouter();
  const { createEntry, loading, error } = useCreateFuelEntry();
  const { vehicles, loading: vehiclesLoading } = useVehicles();


  const [formData, setFormData] = useState<CreateFuelEntryData>({
    vehicleId: '',
    date: '',
    vendor: '',
    volume: 0,
    cost: 0,
    usage: 0,
    odometer: 0,
    fuelType: '',
    notes: '',
    location: ''
  });

  const [notes, setNotes] = useState('');

  const handleCancel = () => {
    router.push('/fuel/history');
  };

  const handleSave = async () => {
    if (!formData.vehicleId || !formData.date || !formData.volume || !formData.cost) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    try {
      const entryData = {
        ...formData,
        notes: notes || undefined
      };

      const newEntry = await createEntry(entryData);
      if (newEntry) {
        router.push('/fuel/history');
      }
    } catch (err) {
      console.error('Error creating fuel entry:', err);
    }
  };

  const handleInputChange = (field: keyof CreateFuelEntryData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={handleCancel} data-testid="cancel-button" className="text-gray-500 hover:text-gray-700 flex items-center gap-1">

            <ArrowLeft size={18} /> Entrées de carburant
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle entrée de carburant</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={handleCancel} data-testid="cancel-button" className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded bg-white">Annuler</button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Enregistrer
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Erreur : {error}
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Informations de base</h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Véhicule <span className="text-red-500">*</span></label>
              <select
                value={formData.vehicleId}
                onChange={e => handleInputChange('vehicleId', e.target.value)}
                data-testid="vehicle-select"
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
              >
                <option value="">{vehiclesLoading ? 'Chargement des véhicules...' : 'Veuillez sélectionner'}</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>{vehicle.name}</option>
                ))}

              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
              <input
                type="datetime-local"
                value={formData.date}
                onChange={e => handleInputChange('date', e.target.value)}
                data-testid="date-input"
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
              <select
                value={formData.vendor || ''}
                onChange={e => handleInputChange('vendor', e.target.value)}
                data-testid="vendor-select"
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
              >
                <option value="">Veuillez sélectionner</option>
                <option value="Chevron">Chevron</option>
                <option value="Shell">Shell</option>
                <option value="BP">BP</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Volume (L) <span className="text-red-500">*</span></label>
              <input
                type="number"
                step="0.001"
                value={formData.volume || ''}
                onChange={e => handleInputChange('volume', parseFloat(e.target.value) || 0)}
                data-testid="volume-input"
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coût total</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">MGA</span>
                <input
                  type="number"
                  value={formData.cost || ''}
                  onChange={e => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                  data-testid="cost-input"
                  className="w-full pl-8 p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de carburant</label>
              <select
                value={formData.fuelType || ''}
                onChange={e => handleInputChange('fuelType', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
              >
                <option value="">Veuillez sélectionner</option>
                <option value="Diesel">Diesel</option>
                <option value="Gasoline">Essence</option>
                <option value="LPG">LPG</option>
              </select>
            </div>
          </div>
        </div>

        {/* Meter Reading */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Relevé compteur</h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Odomètre (km)</label>
              <input
                type="number"
                value={formData.odometer || ''}
                onChange={e => handleInputChange('odometer', parseInt(e.target.value) || 0)}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heures moteur</label>
              <input
                type="number"
                step="0.1"
                value={formData.usage || ''}
                onChange={e => handleInputChange('usage', parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
              />
            </div>
          </div>
        </div>

        {/* Receipt Upload */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Reçu</h2>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium text-[#008751] hover:text-[#007043] cursor-pointer">Cliquez pour téléverser</span> ou glissez-déposez
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, PDF jusqu’à 10MB</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Notes</h2>
          <textarea
            rows={4}
            placeholder="Ajoutez des notes si nécessaire…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
          ></textarea>
        </div>

        <div className="flex justify-end gap-3 pt-4 pb-12">
          <button onClick={handleCancel} data-testid="cancel-button" className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded border border-gray-300 bg-white">Annuler</button>

          <button
            onClick={handleSave}
            disabled={loading}
            data-testid="save-button"
            className="px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-bold rounded shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
