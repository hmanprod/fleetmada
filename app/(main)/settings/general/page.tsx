'use client';

import React, { useState, useEffect } from 'react';
import { AlignLeft, Loader2, Link as LinkIcon, Mail, Globe, MapPin, Phone, Building2, Save, X, ChevronLeft } from 'lucide-react';
import { useGeneralSettings } from '@/lib/hooks/useSettings';
import { useToast, ToastContainer } from '@/components/NotificationToast';
import Link from 'next/link';

export default function SettingsGeneralPage() {
   const {
      settings,
      loading,
      error,
      isSaving,
      updateSettings,
      clearError
   } = useGeneralSettings();

   const { toast, toasts, removeToast } = useToast();

   const [formData, setFormData] = useState({
      companyName: '',
      address: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Madagascar',
      phone: '',
      email: '',
      website: '',
      industry: 'Transport & Logistique',
      currency: 'EUR',
      dateFormat: 'DD/MM/YYYY',
      timezone: 'UTC',
      timeFormat: '24',
      usageUnit: 'kilometers', // kilometers, miles, hours
      fuelUnit: 'L', // L, GAL
      measurementSystem: 'metric', // metric, imperial
      laborTaxExempt: false,
      secondaryTax: false,
      defaultTax1: '',
      defaultTax2: '',
      defaultTaxType: 'percentage', // percentage, fixed
      fiscalYear: 'jan-dec',
      numberFormat: '1,234.56'
   });

   // Charger les données existantes
   useEffect(() => {
      if (settings) {
         setFormData({
            companyName: settings.name || '',
            address: settings.address || '',
            addressLine2: settings.addressLine2 || '',
            city: settings.city || '',
            state: settings.state || '',
            postalCode: settings.postalCode || '',
            country: settings.country || 'Madagascar',
            phone: settings.phone || '',
            email: settings.email || '',
            website: settings.website || '',
            industry: settings.industry || 'Transport & Logistique',
            currency: settings.currency || 'EUR',
            dateFormat: settings.dateFormat || 'DD/MM/YYYY',
            timezone: settings.timezone || 'UTC',
            timeFormat: settings.timeFormat || '24',
            usageUnit: settings.distanceUnit === 'MI' ? 'miles' : (settings.distanceUnit === 'H' ? 'hours' : 'kilometers'),
            fuelUnit: settings.fuelUnit || 'L',
            measurementSystem: settings.distanceUnit === 'MI' ? 'imperial' : 'metric',
            laborTaxExempt: settings.laborTaxExempt || false,
            secondaryTax: settings.secondaryTax || false,
            defaultTax1: settings.defaultTax1 || '',
            defaultTax2: settings.defaultTax2 || '',
            defaultTaxType: settings.defaultTaxType || 'percentage',
            fiscalYear: settings.fiscalYear || 'jan-dec',
            numberFormat: settings.numberFormat || '1,234.56'
         });
      }
   }, [settings]);

   // Afficher l'erreur globale si elle existe
   useEffect(() => {
      if (error) {
         toast.error("Erreur", error);
         clearError();
      }
   }, [error, toast, clearError]);

   const handleInputChange = (field: string, value: string | boolean) => {
      setFormData(prev => ({
         ...prev,
         [field]: value
      }));
   };

   const handleSave = async () => {
      try {
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
            email: formData.email,
            website: formData.website,
            industry: formData.industry,
            currency: formData.currency,
            dateFormat: formData.dateFormat,
            timezone: formData.timezone,
            timeFormat: formData.timeFormat,
            fuelUnit: formData.fuelUnit,
            distanceUnit: formData.usageUnit === 'miles' ? 'MI' : (formData.usageUnit === 'hours' ? 'H' : 'KM'),
            laborTaxExempt: formData.laborTaxExempt,
            secondaryTax: formData.secondaryTax,
            defaultTax1: formData.defaultTax1,
            defaultTax2: formData.defaultTax2,
            defaultTaxType: formData.defaultTaxType,
            fiscalYear: formData.fiscalYear,
            numberFormat: formData.numberFormat
         };

         const result = await updateSettings(apiData);

         if (result.success) {
            toast.success('Succès', 'Paramètres mis à jour avec succès !');
         }
      } catch (err) {
         toast.error('Erreur', 'Une erreur inattendue est survenue.');
      }
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
      <div className="space-y-6 pb-20">
         <ToastContainer toasts={toasts} removeToast={removeToast} />

         {/* Header Rule UX */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200 sticky top-0 z-10">
            <div className="flex items-center gap-4">
               <Link href="/settings" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                  <ChevronLeft size={24} />
               </Link>
               <div>
                  <h1 className="text-xl font-bold text-gray-900">Paramètres généraux</h1>
                  <p className="text-sm text-gray-500">Gérez les informations de votre entreprise et les préférences globales.</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
               >
                  Annuler
               </button>
               <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-[#008751] hover:bg-[#007043] text-white px-6 py-2 rounded-md font-bold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Enregistrer
               </button>
            </div>
         </div>

         {/* Section Information de l'entreprise */}
         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
               <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Building2 size={20} className="text-[#008751]" />
                  Informations de l'entreprise
               </h2>
            </div>
            <div className="p-6 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                     <label className="block text-sm font-semibold text-gray-700">Nom de l'entreprise <span className="text-red-500">*</span></label>
                     <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        placeholder="Ex: ONNO"
                        className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#008751] focus:border-[#008751] outline-none transition-all"
                     />
                  </div>
                  <div className="space-y-1">
                     <label className="block text-sm font-semibold text-gray-700">Secteur d'activité</label>
                     <select
                        value={formData.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-[#008751] focus:border-[#008751] outline-none"
                     >
                        <option value="Transport & Logistique">Transport & Logistique</option>
                        <option value="Construction">Construction</option>
                        <option value="Services">Services</option>
                        <option value="Autre">Autre</option>
                     </select>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                     <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
                        <Mail size={14} /> Email de contact
                     </label>
                     <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="contact@entreprise.com"
                        className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#008751] focus:border-[#008751] outline-none"
                     />
                  </div>
                  <div className="space-y-1">
                     <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
                        <Phone size={14} /> Téléphone
                     </label>
                     <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+261 34 00 000 00"
                        className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#008751] focus:border-[#008751] outline-none"
                     />
                  </div>
               </div>

               <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
                     <Globe size={14} /> Site Web
                  </label>
                  <input
                     type="text"
                     value={formData.website}
                     onChange={(e) => handleInputChange('website', e.target.value)}
                     placeholder="https://www.monentreprise.com"
                     className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#008751] focus:border-[#008751] outline-none"
                  />
               </div>

               <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">
                     <MapPin size={16} className="text-[#008751]" />
                     Localisation
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">Adresse</label>
                        <input
                           type="text"
                           value={formData.address}
                           onChange={(e) => handleInputChange('address', e.target.value)}
                           className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#008751] focus:border-[#008751] outline-none"
                        />
                     </div>
                     <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">Complément d'adresse</label>
                        <input
                           type="text"
                           value={formData.addressLine2}
                           onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                           className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#008751] focus:border-[#008751] outline-none"
                        />
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">Ville</label>
                        <input
                           type="text"
                           value={formData.city}
                           onChange={(e) => handleInputChange('city', e.target.value)}
                           className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#008751] focus:border-[#008751] outline-none"
                        />
                     </div>
                     <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">État/Région</label>
                        <input
                           type="text"
                           value={formData.state}
                           onChange={(e) => handleInputChange('state', e.target.value)}
                           className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#008751] focus:border-[#008751] outline-none"
                        />
                     </div>
                     <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">Code postal</label>
                        <input
                           type="text"
                           value={formData.postalCode}
                           onChange={(e) => handleInputChange('postalCode', e.target.value)}
                           className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#008751] focus:border-[#008751] outline-none"
                        />
                     </div>
                  </div>
                  <div className="space-y-1">
                     <label className="block text-sm font-semibold text-gray-700">Pays</label>
                     <select
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-[#008751] focus:border-[#008751] outline-none"
                     >
                        <option value="Madagascar">Madagascar</option>
                        <option value="France">France</option>
                        <option value="Maurice">Maurice</option>
                        <option value="Autre">Autre</option>
                     </select>
                  </div>
               </div>
            </div>
         </div>

         {/* Section Paramètres régionaux */}
         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
               <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Globe size={20} className="text-[#008751]" />
                  Paramètres régionaux
               </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">Devise</label>
                  <select
                     value={formData.currency}
                     onChange={(e) => handleInputChange('currency', e.target.value)}
                     className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-[#008751] focus:border-[#008751] outline-none"
                  >
                     <option value="EUR">Euro (€)</option>
                     <option value="MGA">Ariary Malgache (Ar)</option>
                     <option value="USD">Dollar US ($)</option>
                  </select>
               </div>
               <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">Fuseau horaire</label>
                  <select
                     value={formData.timezone}
                     onChange={(e) => handleInputChange('timezone', e.target.value)}
                     className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-[#008751] focus:border-[#008751] outline-none"
                  >
                     <option value="UTC">(GMT+00:00) UTC</option>
                     <option value="Indian/Antananarivo">(GMT+03:00) Antananarivo</option>
                     <option value="Europe/Paris">(GMT+01:00) Paris</option>
                  </select>
               </div>
               <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">Format de date court</label>
                  <select
                     value={formData.dateFormat}
                     onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                     className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-[#008751] focus:border-[#008751] outline-none"
                  >
                     <option value="DD/MM/YYYY">JJ/MM/AAAA</option>
                     <option value="MM/DD/YYYY">MM/JJ/AAAA</option>
                     <option value="YYYY-MM-DD">AAAA-MM-JJ</option>
                  </select>
               </div>
               <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">Début de l'exercice fiscal</label>
                  <select
                     value={formData.fiscalYear}
                     onChange={(e) => handleInputChange('fiscalYear', e.target.value)}
                     className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-[#008751] focus:border-[#008751] outline-none"
                  >
                     <option value="jan-dec">Janvier - Décembre</option>
                     <option value="apr-mar">Avril - Mars</option>
                     <option value="jul-jun">Juillet - Juin</option>
                     <option value="oct-sep">Octobre - Septembre</option>
                  </select>
               </div>
               <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">Format des nombres</label>
                  <select
                     value={formData.numberFormat}
                     onChange={(e) => handleInputChange('numberFormat', e.target.value)}
                     className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-[#008751] focus:border-[#008751] outline-none"
                  >
                     <option value="1,234.56">1,234.56</option>
                     <option value="1.234,56">1.234,56</option>
                     <option value="1 234,56">1 234,56</option>
                  </select>
               </div>
               <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">Format de l'heure</label>
                  <div className="flex items-center gap-6 p-2.5">
                     <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                           type="radio"
                           name="timeFormat"
                           value="12"
                           checked={formData.timeFormat === '12'}
                           onChange={(e) => handleInputChange('timeFormat', e.target.value)}
                           className="w-4 h-4 text-[#008751] focus:ring-[#008751]"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-[#008751] transition-colors">12 heures</span>
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                           type="radio"
                           name="timeFormat"
                           value="24"
                           checked={formData.timeFormat === '24'}
                           onChange={(e) => handleInputChange('timeFormat', e.target.value)}
                           className="w-4 h-4 text-[#008751] focus:ring-[#008751]"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-[#008751] transition-colors">24 heures</span>
                     </label>
                  </div>
               </div>
            </div>
         </div>

         {/* Section Unités par défaut */}
         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
               <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <AlignLeft size={20} className="text-[#008751]" />
                  Unités par défaut
               </h2>
            </div>
            <div className="p-6 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="block text-sm font-semibold text-gray-700">Unité d'utilisation</label>
                     <div className="space-y-2">
                        {['kilometers', 'miles', 'hours'].map((unit) => (
                           <label key={unit} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-200">
                              <input
                                 type="radio"
                                 name="usageUnit"
                                 value={unit}
                                 checked={formData.usageUnit === unit}
                                 onChange={(e) => handleInputChange('usageUnit', e.target.value)}
                                 className="w-4 h-4 text-[#008751] focus:ring-[#008751]"
                              />
                              <span className="text-sm text-gray-700 capitalize">
                                 {unit === 'kilometers' ? 'Kilomètres' : unit === 'miles' ? 'Miles' : 'Heures'}
                              </span>
                           </label>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-3">
                     <label className="block text-sm font-semibold text-gray-700">Volume carburant</label>
                     <div className="space-y-2">
                        {[
                           { val: 'L', label: 'Litres' },
                           { val: 'GAL', label: 'Gallons (US)' }
                        ].map((u) => (
                           <label key={u.val} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-200">
                              <input
                                 type="radio"
                                 name="fuelUnit"
                                 value={u.val}
                                 checked={formData.fuelUnit === u.val}
                                 onChange={(e) => handleInputChange('fuelUnit', e.target.value)}
                                 className="w-4 h-4 text-[#008751] focus:ring-[#008751]"
                              />
                              <span className="text-sm text-gray-700">{u.label}</span>
                           </label>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Section Taxes */}
         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
               <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-[#008751] font-black text-xl">%</span>
                  Paramètres de taxes
               </h2>
            </div>
            <div className="p-6 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-[#008751]/30 hover:bg-[#008751]/5 transition-all cursor-pointer">
                        <input
                           type="checkbox"
                           checked={formData.laborTaxExempt}
                           onChange={(e) => handleInputChange('laborTaxExempt', e.target.checked)}
                           className="mt-1 w-4 h-4 text-[#008751] focus:ring-[#008751] rounded"
                        />
                        <div>
                           <span className="block text-sm font-bold text-gray-900">Main d'œuvre hors taxe</span>
                           <span className="block text-xs text-gray-500 mt-0.5">Si sélectionné, les calculs de taxes n'incluront pas la main d'œuvre.</span>
                        </div>
                     </label>

                     <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-[#008751]/30 hover:bg-[#008751]/5 transition-all cursor-pointer">
                        <input
                           type="checkbox"
                           checked={formData.secondaryTax}
                           onChange={(e) => handleInputChange('secondaryTax', e.target.checked)}
                           className="mt-1 w-4 h-4 text-[#008751] focus:ring-[#008751] rounded"
                        />
                        <div>
                           <span className="block text-sm font-bold text-gray-900">Activer la taxe secondaire</span>
                           <span className="block text-xs text-gray-500 mt-0.5">Active un second champ de taxe pour les interventions.</span>
                        </div>
                     </label>
                  </div>

                  <div className="space-y-4">
                     <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">Taxe par défaut 1 (%)</label>
                        <input
                           type="text"
                           value={formData.defaultTax1}
                           onChange={(e) => handleInputChange('defaultTax1', e.target.value)}
                           placeholder="0.00"
                           className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#008751] focus:border-[#008751] outline-none"
                        />
                     </div>
                     <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">Taxe par défaut 2 (%)</label>
                        <input
                           type="text"
                           value={formData.defaultTax2}
                           onChange={(e) => handleInputChange('defaultTax2', e.target.value)}
                           placeholder="0.00"
                           className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#008751] focus:border-[#008751] outline-none"
                        />
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Footer Actions */}
         <div className="flex justify-end items-center gap-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
            <button
               onClick={() => window.location.reload()}
               className="text-gray-600 font-semibold hover:text-gray-900 transition-colors"
            >
               Réinitialiser
            </button>
            <button
               onClick={handleSave}
               disabled={isSaving}
               className="flex items-center gap-2 bg-[#008751] hover:bg-[#007043] text-white px-10 py-3 rounded-md font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {isSaving ? (
                  <>
                     <Loader2 className="animate-spin h-5 w-5" />
                     Enregistrement...
                  </>
               ) : (
                  <>
                     <Save size={20} />
                     Enregistrer les modifications
                  </>
               )}
            </button>
         </div>
      </div>
   );
}