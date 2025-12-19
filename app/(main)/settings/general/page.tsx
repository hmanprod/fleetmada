'use client';

import React, { useState, useEffect } from 'react';
import { AlignLeft, MoreHorizontal, Loader2, Check, AlertCircle } from 'lucide-react';
import { useGeneralSettings } from '@/lib/hooks/useSettings';

export default function SettingsGeneralPage() {
  const { 
    settings, 
    loading, 
    error, 
    isSaving,
    updateSettings, 
    clearError 
  } = useGeneralSettings();
  
  const [formData, setFormData] = useState({
    companyName: 'ONNO',
    address: '',
    addressLine2: '',
    city: 'Antananarivo',
    state: 'Analamanga',
    postalCode: '',
    country: 'Madagascar',
    phone: '',
    industry: 'Transport & Logistique',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    timezone: 'UTC',
    timeFormat: '24',
    usageUnit: 'kilometers',
    fuelUnit: 'L',
    measurementSystem: 'metric',
    vehicleLabel: 'vehicle',
    laborTaxExempt: false,
    secondaryTax: false,
    defaultTax1: '',
    defaultTax2: '',
    defaultTaxType: 'percentage'
  });
  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Charger les données existantes
  useEffect(() => {
    if (settings) {
      setFormData({
        companyName: settings.name || 'ONNO',
        address: settings.address || '',
        addressLine2: settings.addressLine2 || '',
        city: settings.city || 'Antananarivo',
        state: settings.state || 'Analamanga',
        postalCode: settings.postalCode || '',
        country: settings.country || 'Madagascar',
        phone: settings.phone || '',
        industry: settings.industry || 'Transport & Logistique',
        currency: settings.currency || 'EUR',
        dateFormat: settings.dateFormat || 'DD/MM/YYYY',
        timezone: settings.timezone || 'UTC',
        timeFormat: settings.timeFormat || '24',
        usageUnit: settings.distanceUnit === 'MI' ? 'miles' : 'kilometers',
        fuelUnit: settings.fuelUnit === 'GAL' ? 'gallons_us' : 'liters',
        measurementSystem: settings.distanceUnit === 'MI' ? 'imperial' : 'metric',
        vehicleLabel: 'vehicle',
        laborTaxExempt: settings.laborTaxExempt || false,
        secondaryTax: settings.secondaryTax || false,
        defaultTax1: settings.defaultTax1 || '',
        defaultTax2: settings.defaultTax2 || '',
        defaultTaxType: settings.defaultTaxType || 'percentage'
      });
    }
  }, [settings]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsSaved(false);
    setSaveMessage('');
    clearError();
  };

  const handleSave = async () => {
    try {
      setIsSaved(false);
      setSaveMessage('');
      clearError();
      
      // Mapper les données du formulaire vers l'API
      const apiData = {
        name: formData.companyName,
        address: formData.address,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
        phone: formData.phone,
        industry: formData.industry,
        currency: formData.currency,
        dateFormat: formData.dateFormat,
        timezone: formData.timezone,
        timeFormat: formData.timeFormat,
        fuelUnit: formData.fuelUnit === 'gallons_us' ? 'GAL' : 'L',
        distanceUnit: formData.usageUnit === 'miles' ? 'MI' : 'KM',
        laborTaxExempt: formData.laborTaxExempt,
        secondaryTax: formData.secondaryTax,
        defaultTax1: formData.defaultTax1,
        defaultTax2: formData.defaultTax2,
        defaultTaxType: formData.defaultTaxType
      };
      
      const result = await updateSettings(apiData);
      
      if (result.success) {
        setIsSaved(true);
        setSaveMessage('Paramètres généraux mis à jour avec succès !');
        setTimeout(() => {
          setIsSaved(false);
          setSaveMessage('');
        }, 3000);
      } else {
        setSaveMessage('Erreur lors de la sauvegarde des paramètres.');
      }
    } catch (error) {
      setSaveMessage('Erreur lors de la sauvegarde.');
    }
  };

  const handleDisableDemoData = () => {
    console.log('Disable demo data');
    // TODO: Implement disable demo data logic
  };

  const handleChangeOwner = () => {
    console.log('Change account owner');
    // TODO: Implement change owner logic
  };

  const handleExplorePlans = () => {
    console.log('Explore plans');
    // TODO: Implement explore plans logic
  };

  if (loading && !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-[#008751]" />
        <span className="ml-2 text-gray-600">Chargement des paramètres...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <h1 className="text-2xl font-bold text-gray-900">Paramètres généraux</h1>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      {(isSaved || saveMessage) && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500" />
          <p className="text-sm text-green-600">{saveMessage || 'Paramètres mis à jour avec succès !'}</p>
        </div>
      )}

      {/* Sample Data Banner */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-start gap-4">
         <div className="mt-1">
            <AlignLeft className="text-green-600" size={24} />
         </div>
         <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
               <span className="font-bold text-gray-900">Les données démo sont <span className="text-green-600">ACTIVÉES</span></span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
               Les véhicules et autres enregistrements étiquetés <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs font-medium">Exemple</span> sont disponibles pour vous aider à explorer le fonctionnement de FleetMada pendant votre essai.
            </p>
            <button 
              onClick={handleDisableDemoData}
              className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded text-sm font-medium"
            >
               Désactiver les données démo
            </button>
         </div>
      </div>

      {/* Account Owner */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
         <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Propriétaire du compte</h2>
            <button 
              onClick={handleChangeOwner}
              className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded text-sm font-medium"
            >
              Changer de propriétaire
            </button>
         </div>
         <div className="p-6 flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-purple-400 text-white flex items-center justify-center text-xl font-bold">HR</div>
            <div>
               <div className="font-bold text-gray-900 text-lg">Hery RABOTOVAO</div>
               <div className="text-[#008751]">hmanprod@gmail.com</div>
            </div>
         </div>
      </div>

      {/* Account Usage */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
         <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Utilisation du compte</h2>
            <button 
              onClick={handleExplorePlans}
              className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded text-sm font-medium"
            >
              Explorer les plans
            </button>
         </div>
         <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <div>
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#008751]">Documents</span>
                    <span className="text-gray-600">0 o sur 25.0 Go</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-[#008751] h-2 rounded-full" style={{ width: '1%' }}></div>
                </div>
            </div>
            <div>
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#008751]">Rôles</span>
                    <span className="text-gray-900 font-medium">4 sur 15</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-[#008751] h-2 rounded-full" style={{ width: '26%' }}></div>
                </div>
            </div>
            <div>
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#008751]">Véhicules</span>
                    <span className="text-gray-900 font-medium">1 sur 5</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-[#008751] h-2 rounded-full" style={{ width: '20%' }}></div>
                </div>
            </div>
            <div>
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#008751]">Champs personnalisés</span>
                    <span className="text-gray-900 font-medium">0 sur 50</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-[#008751] h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
            </div>
            <div>
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#008751]">Groupes</span>
                    <span className="text-gray-900 font-medium">0 sur 100</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-[#008751] h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
            </div>
            <div>
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#008751]">Événements Webhook</span>
                    <span className="text-gray-900 font-medium underline decoration-dotted">0 sur 10000</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-[#008751] h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
            </div>
         </div>
      </div>

      {/* General Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
         <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900">Général</h2>
         </div>
         <div className="p-6 space-y-6">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise <span className="text-red-500">*</span></label>
               <div className="relative">
                   <input 
                     type="text" 
                     value={formData.companyName}
                     onChange={(e) => handleInputChange('companyName', e.target.value)}
                     className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" 
                   />
                   <div className="absolute right-2 top-2.5 text-red-400"><MoreHorizontal size={20} /></div>
               </div>
               <p className="mt-1 text-xs text-gray-500">Veuillez fournir le nom légal de votre entreprise.</p>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
               <div className="flex items-center gap-2">
                  <button className="bg-[#008751] hover:bg-[#007043] text-white text-sm font-medium px-4 py-2 rounded">Choisir un fichier</button>
                  <button className="bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2 rounded border border-gray-300 border-dashed">Ou glisser un fichier ici</button>
               </div>
               <p className="mt-2 text-sm text-gray-500 italic">Aucun fichier sélectionné</p>
               <p className="text-xs text-gray-500">Seuls les fichiers PNG, GIF, JPG et TIFF sont acceptés.</p>
            </div>

            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input 
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" 
                  />
                  <p className="mt-1 text-xs text-gray-500">Adresse postale, boîte postale, etc.</p>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Complément d'adresse</label>
                  <input 
                    type="text"
                    value={formData.addressLine2}
                    onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" 
                  />
                  <p className="mt-1 text-xs text-gray-500">Appartement, unité, bâtiment, étage, etc.</p>
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                     <input 
                       type="text"
                       value={formData.city}
                       onChange={(e) => handleInputChange('city', e.target.value)}
                       className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" 
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">État/Province/Région</label>
                     <input 
                       type="text"
                       value={formData.state}
                       onChange={(e) => handleInputChange('state', e.target.value)}
                       className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" 
                     />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                     <input 
                       type="text"
                       value={formData.postalCode}
                       onChange={(e) => handleInputChange('postalCode', e.target.value)}
                       className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" 
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                     <select 
                       value={formData.country}
                       onChange={(e) => handleInputChange('country', e.target.value)}
                       className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
                     >
                        <option>Madagascar</option>
                     </select>
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone</label>
                  <input 
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" 
                  />
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Secteur d'activité</label>
               <select 
                 value={formData.industry}
                 onChange={(e) => handleInputChange('industry', e.target.value)}
                 className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
               >
                  <option>Transport & Logistique</option>
               </select>
            </div>
         </div>
      </div>

      {/* Regional Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
         <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900">Paramètres régionaux</h2>
         </div>
         <div className="p-6 space-y-6">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
               <select 
                 value={formData.currency}
                 onChange={(e) => handleInputChange('currency', e.target.value)}
                 className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
               >
                  <option>(MGA) Ariary Malgache (Ar20,000.0)</option>
               </select>
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Format de date court</label>
               <select 
                 value={formData.dateFormat}
                 onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                 className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
               >
                  <option>JJ/MM/AAAA</option>
               </select>
               <p className="mt-1 text-xs text-gray-500">Choisissez comment les dates sont affichées dans certaines parties de FleetMada (affecte tous les utilisateurs du compte).</p>
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Fuseau horaire</label>
               <select 
                 value={formData.timezone}
                 onChange={(e) => handleInputChange('timezone', e.target.value)}
                 className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
               >
                  <option>(GMT+03:00) Antananarivo</option>
               </select>
               <p className="mt-1 text-xs text-gray-500">Les utilisateurs ajoutés à votre compte auront ce fuseau horaire par défaut. Ils pourront le modifier plus tard.</p>
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Format de l'heure</label>
               <div className="space-y-2">
                  <label className="flex items-center gap-2">
                     <input 
                       type="radio" 
                       name="timeFormat" 
                       value="12"
                       checked={formData.timeFormat === '12'}
                       onChange={(e) => handleInputChange('timeFormat', e.target.value)}
                       className="text-[#008751] focus:ring-[#008751]" 
                     />
                     <span className="text-sm text-gray-700">12 heures</span>
                  </label>
                  <label className="flex items-center gap-2">
                     <input 
                       type="radio" 
                       name="timeFormat" 
                       value="24"
                       checked={formData.timeFormat === '24'}
                       onChange={(e) => handleInputChange('timeFormat', e.target.value)}
                       className="text-[#008751] focus:ring-[#008751]" 
                     />
                     <span className="text-sm text-gray-700">24 heures</span>
                  </label>
               </div>
               <p className="mt-2 text-xs text-gray-500">Choisissez comment les heures sont affichées dans certaines parties de FleetMada.</p>
            </div>
         </div>
      </div>

      {/* Default Units */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
         <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900">Unités par défaut</h2>
         </div>
         <div className="p-6 space-y-6">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Utilisation</label>
               <div className="space-y-2">
                  <label className="flex items-center gap-2">
                     <input 
                       type="radio" 
                       name="usage" 
                       value="miles"
                       checked={formData.usageUnit === 'miles'}
                       onChange={(e) => handleInputChange('usageUnit', e.target.value)}
                       className="text-[#008751] focus:ring-[#008751]" 
                     />
                     <span className="text-sm text-gray-700">Miles</span>
                  </label>
                  <label className="flex items-center gap-2">
                     <input 
                       type="radio" 
                       name="usage" 
                       value="kilometers"
                       checked={formData.usageUnit === 'kilometers'}
                       onChange={(e) => handleInputChange('usageUnit', e.target.value)}
                       className="text-[#008751] focus:ring-[#008751]" 
                     />
                     <span className="text-sm text-gray-700">Kilomètres</span>
                  </label>
                  <label className="flex items-center gap-2">
                     <input 
                       type="radio" 
                       name="usage" 
                       value="hours"
                       checked={formData.usageUnit === 'hours'}
                       onChange={(e) => handleInputChange('usageUnit', e.target.value)}
                       className="text-[#008751] focus:ring-[#008751]" 
                     />
                     <span className="text-sm text-gray-700">Heures</span>
                  </label>
               </div>
               <p className="mt-2 text-xs text-gray-500">Les nouveaux véhicules auront cette unité d'utilisation sélectionnée par défaut.</p>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Volume carburant</label>
               <div className="space-y-2">
                  <label className="flex items-center gap-2">
                     <input 
                       type="radio" 
                       name="fuel" 
                       value="gallons_us"
                       checked={formData.fuelUnit === 'gallons_us'}
                       onChange={(e) => handleInputChange('fuelUnit', e.target.value)}
                       className="text-[#008751] focus:ring-[#008751]" 
                     />
                     <span className="text-sm text-gray-700">Gallons (US)</span>
                  </label>
                  <label className="flex items-center gap-2">
                     <input 
                       type="radio" 
                       name="fuel" 
                       value="gallons_uk"
                       checked={formData.fuelUnit === 'gallons_uk'}
                       onChange={(e) => handleInputChange('fuelUnit', e.target.value)}
                       className="text-[#008751] focus:ring-[#008751]" 
                     />
                     <span className="text-sm text-gray-700">Gallons (UK)</span>
                  </label>
                  <label className="flex items-center gap-2">
                     <input 
                       type="radio" 
                       name="fuel" 
                       value="liters"
                       checked={formData.fuelUnit === 'liters'}
                       onChange={(e) => handleInputChange('fuelUnit', e.target.value)}
                       className="text-[#008751] focus:ring-[#008751]" 
                     />
                     <span className="text-sm text-gray-700">Litres</span>
                  </label>
               </div>
               <p className="mt-2 text-xs text-gray-500">Les nouveaux véhicules auront cette unité de volume sélectionnée par défaut.</p>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Système de mesure</label>
               <div className="space-y-2">
                  <label className="flex items-center gap-2">
                     <input 
                       type="radio" 
                       name="measurement" 
                       value="imperial"
                       checked={formData.measurementSystem === 'imperial'}
                       onChange={(e) => handleInputChange('measurementSystem', e.target.value)}
                       className="text-[#008751] focus:ring-[#008751]" 
                     />
                     <span className="text-sm text-gray-700">Impérial</span>
                  </label>
                  <label className="flex items-center gap-2">
                     <input 
                       type="radio" 
                       name="measurement" 
                       value="metric"
                       checked={formData.measurementSystem === 'metric'}
                       onChange={(e) => handleInputChange('measurementSystem', e.target.value)}
                       className="text-[#008751] focus:ring-[#008751]" 
                     />
                     <span className="text-sm text-gray-700">Métrique</span>
                  </label>
               </div>
               <p className="mt-2 text-xs text-gray-500">Les nouveaux véhicules utiliseront ce système de mesure par défaut.</p>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Libellé du système véhicule</label>
               <div className="space-y-2">
                  <label className="flex items-center gap-2">
                     <input 
                       type="radio" 
                       name="vehicleLabel" 
                       value="vehicle"
                       checked={formData.vehicleLabel === 'vehicle'}
                       onChange={(e) => handleInputChange('vehicleLabel', e.target.value)}
                       className="text-[#008751] focus:ring-[#008751]" 
                     />
                     <span className="text-sm text-gray-700">Véhicule</span>
                  </label>
                  <label className="flex items-center gap-2">
                     <input 
                       type="radio" 
                       name="vehicleLabel" 
                       value="asset"
                       checked={formData.vehicleLabel === 'asset'}
                       onChange={(e) => handleInputChange('vehicleLabel', e.target.value)}
                       className="text-[#008751] focus:ring-[#008751]" 
                     />
                     <span className="text-sm text-gray-700">Actif</span>
                  </label>
               </div>
               <p className="mt-2 text-xs text-gray-500">Utilisé pour ajuster la terminologie dans FleetMada. Par exemple, changer ceci en 'Actif' changera toutes les références de 'Véhicule' en 'Actif'.</p>
            </div>
         </div>
      </div>

      {/* Tax Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
         <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900">Paramètres de taxes</h2>
         </div>
         <div className="p-6 space-y-6">
            <div className="space-y-4">
                <label className="flex items-start gap-3">
                     <input 
                       type="checkbox" 
                       checked={formData.laborTaxExempt}
                       onChange={(e) => handleInputChange('laborTaxExempt', e.target.checked)}
                       className="mt-1 text-[#008751] focus:ring-[#008751] rounded" 
                     />
                     <div>
                         <span className="block text-sm font-bold text-gray-900">Main d'œuvre hors taxe</span>
                         <span className="block text-xs text-gray-500">Si sélectionné, les calculs de taxes n'incluront pas les sous-totaux de main d'œuvre.</span>
                     </div>
                 </label>
                 <label className="flex items-start gap-3">
                     <input 
                       type="checkbox" 
                       checked={formData.secondaryTax}
                       onChange={(e) => handleInputChange('secondaryTax', e.target.checked)}
                       className="mt-1 text-[#008751] focus:ring-[#008751] rounded" 
                     />
                     <div>
                         <span className="block text-sm font-bold text-gray-900">Taxe secondaire</span>
                         <span className="block text-xs text-gray-500">Active un second champ de taxe pour les ordres de travail et les entrées d'entretien.</span>
                     </div>
                 </label>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Taxe par défaut 1</label>
               <input 
                 type="text"
                 value={formData.defaultTax1}
                 onChange={(e) => handleInputChange('defaultTax1', e.target.value)}
                 className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" 
               />
               <p className="mt-1 text-xs text-gray-500">La valeur saisie sera utilisée pour pré-remplir automatiquement les champs 'Taxe 1' dans FleetMada. Les utilisateurs pourront toujours modifier la valeur.</p>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Taxe par défaut 2</label>
               <input 
                 type="text"
                 value={formData.defaultTax2}
                 onChange={(e) => handleInputChange('defaultTax2', e.target.value)}
                 className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" 
               />
               <p className="mt-1 text-xs text-gray-500">La valeur saisie sera utilisée pour pré-remplir automatiquement les champs 'Taxe 2' dans FleetMada.</p>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Type de taxe par défaut</label>
               <select 
                 value={formData.defaultTaxType}
                 onChange={(e) => handleInputChange('defaultTaxType', e.target.value)}
                 className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
               >
                  <option value="percentage">Pourcentage</option>
                  <option value="fixed">Fix</option>
               </select>
               <p className="mt-1 text-xs text-gray-500">Comment les montants de taxes sont-ils saisis sur les ordres de travail ? Choisissez 'pourcentage' ou 'fixe'.</p>
            </div>
         </div>
      </div>

      <div className="text-center text-xs text-[#008751]">
         Créé il y a 18 heures · Mis à jour il y a 18 heures
      </div>

      <div className="flex justify-end">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                Enregistrement...
              </>
            ) : (
              'Enregistrer le compte'
            )}
          </button>
      </div>
    </div>
  );
}