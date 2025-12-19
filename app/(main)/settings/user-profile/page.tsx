'use client';

import React, { useState, useEffect } from 'react';
import { MoreHorizontal, AlertCircle, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useUserPreferences } from '@/lib/hooks/useSettings';

export default function UserProfilePage() {
  const { user, updateProfile, isLoading, error, clearError } = useAuth();
  const { 
    preferences, 
    loading: preferencesLoading, 
    error: preferencesError, 
    isSaving: preferencesSaving,
    updatePreferences, 
    clearError: clearPreferencesError 
  } = useUserPreferences();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    fuelEconomyDisplay: '',
    itemsPerPage: 50
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        fuelEconomyDisplay: preferences?.fuelEconomyDisplay || 'L/100km · L/100hr · Litres',
        itemsPerPage: preferences?.itemsPerPage || 50
      });
    }
  }, [user, preferences]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
    setSaveMessage('');
    clearError();
    clearPreferencesError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsSaved(false);
    setSaveMessage('');
    clearError();
    clearPreferencesError();
    
    try {
      // Mise à jour du profil utilisateur
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName
      });
      
      // Mise à jour des préférences
      const preferencesResult = await updatePreferences({
        fuelEconomyDisplay: formData.fuelEconomyDisplay,
        itemsPerPage: formData.itemsPerPage
      });
      
      if (preferencesResult.success) {
        setIsSaved(true);
        setSaveMessage('Profil et préférences mis à jour avec succès !');
        setTimeout(() => {
          setIsSaved(false);
          setSaveMessage('');
        }, 3000);
      } else {
        setSaveMessage('Profil mis à jour, mais erreur lors de la sauvegarde des préférences.');
      }
    } catch (error) {
      setSaveMessage('Erreur lors de la sauvegarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if ((isLoading && !user) || (preferencesLoading && !preferences)) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-[#008751]" />
        <span className="ml-2 text-gray-600">Chargement du profil...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <h1 className="text-2xl font-bold text-gray-900">Profil utilisateur</h1>

      {(error || preferencesError) && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <p className="text-sm text-red-600">{error || preferencesError}</p>
        </div>
      )}
      
      {(isSaved || saveMessage) && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500" />
          <p className="text-sm text-green-600">{saveMessage || 'Profil mis à jour avec succès !'}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Photo</label>
              <div className="flex items-center gap-2">
                <button type="button" className="bg-[#008751] hover:bg-[#007043] text-white text-sm font-medium px-4 py-2 rounded">Choisir un fichier</button>
                <button type="button" className="bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2 rounded border border-gray-300 border-dashed">Ou glisser un fichier ici</button>
              </div>
              <p className="mt-2 text-sm text-gray-500 italic">Aucun fichier sélectionné</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom <span className="text-red-500">*</span></label>
              <div className="relative">
                <input 
                  type="text" 
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" 
                />
                <div className="absolute right-2 top-2.5 text-red-400"><MoreHorizontal size={20} /></div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input 
                type="text" 
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751] bg-gray-50" 
              />
              <p className="mt-1 text-xs text-gray-500">C'est ici que vous recevrez les emails de notification pour votre compte actuel</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionnez comment vous souhaitez voir les valeurs d'économie de carburant dans FleetMada. <span className="text-red-500">*</span></label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="economy" 
                    value="mpg (US) · g/hr (US) · Gallons (US)"
                    checked={formData.fuelEconomyDisplay === 'mpg (US) · g/hr (US) · Gallons (US)'}
                    onChange={(e) => handleInputChange('fuelEconomyDisplay', e.target.value)}
                    className="text-[#008751] focus:ring-[#008751]" 
                  />
                  <span className="text-sm text-gray-700">mpg (US) · g/hr (US) · Gallons (US)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="economy" 
                    value="mpg (UK) · g/hr (UK) · Gallons (UK)"
                    checked={formData.fuelEconomyDisplay === 'mpg (UK) · g/hr (UK) · Gallons (UK)'}
                    onChange={(e) => handleInputChange('fuelEconomyDisplay', e.target.value)}
                    className="text-[#008751] focus:ring-[#008751]" 
                  />
                  <span className="text-sm text-gray-700">mpg (UK) · g/hr (UK) · Gallons (UK)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="economy" 
                    value="L/100km · L/100hr · Litres"
                    checked={formData.fuelEconomyDisplay === 'L/100km · L/100hr · Litres'}
                    onChange={(e) => handleInputChange('fuelEconomyDisplay', e.target.value)}
                    className="text-[#008751] focus:ring-[#008751]" 
                  />
                  <span className="text-sm text-gray-700">L/100km · L/100hr · Litres</span>
                </label>
                <label className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="economy" 
                    value="km/L · L/hr · Litres"
                    checked={formData.fuelEconomyDisplay === 'km/L · L/hr · Litres'}
                    onChange={(e) => handleInputChange('fuelEconomyDisplay', e.target.value)}
                    className="text-[#008751] focus:ring-[#008751]" 
                  />
                  <span className="text-sm text-gray-700">km/L · L/hr · Litres</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Éléments par page <span className="text-red-500">*</span></label>
              <select 
                value={formData.itemsPerPage}
                onChange={(e) => handleInputChange('itemsPerPage', parseInt(e.target.value))}
                className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">Nombre d'éléments par défaut sur les listes et rapports.</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button 
            type="submit"
            disabled={isSubmitting || preferencesSaving}
            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting || preferencesSaving ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                Enregistrement...
              </>
            ) : (
              'Enregistrer'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}