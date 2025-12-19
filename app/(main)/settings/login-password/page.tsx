'use client';

import React, { useState, useEffect } from 'react';
import { MoreHorizontal, Loader2, Check, AlertCircle } from 'lucide-react';
import { useSecuritySettings } from '@/lib/hooks/useSettings';
import { useUserPreferences } from '@/lib/hooks/useSettings';

export default function SettingsLoginPasswordPage() {
  const { 
    settings: securitySettings,
    loading: securityLoading,
    error: securityError,
    isSaving: securitySaving,
    changePassword,
    updateSettings: updateSecuritySettings,
    clearError: clearSecurityError
  } = useSecuritySettings();
  
  const {
    preferences,
    loading: preferencesLoading,
    error: preferencesError,
    isSaving: preferencesSaving,
    updatePreferences,
    clearError: clearPreferencesError
  } = useUserPreferences();
  
  const [formData, setFormData] = useState({
    username: '',
    email: 'hmanprod@gmail.com',
    marketingEmails: true,
    timezone: 'UTC',
    language: 'fr'
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [activeTab, setActiveTab] = useState('login');
  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  // Charger les données existantes
  useEffect(() => {
    if (securitySettings) {
      setFormData(prev => ({
        ...prev,
        marketingEmails: securitySettings.marketingEmails || true
      }));
    }
    
    if (preferences) {
      setFormData(prev => ({
        ...prev,
        timezone: preferences.timezone || 'UTC',
        language: preferences.language || 'fr'
      }));
    }
  }, [securitySettings, preferences]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsSaved(false);
    setSaveMessage('');
    clearSecurityError();
    clearPreferencesError();
  };
  
  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    setPasswordMessage('');
    clearSecurityError();
  };

  const handleSave = async () => {
    try {
      setIsSaved(false);
      setSaveMessage('');
      clearSecurityError();
      clearPreferencesError();
      
      // Mise à jour des paramètres de sécurité
      const securityResult = await updateSecuritySettings({
        marketingEmails: formData.marketingEmails
      });
      
      // Mise à jour des préférences utilisateur
      const preferencesResult = await updatePreferences({
        timezone: formData.timezone,
        language: formData.language
      });
      
      if (securityResult.success && preferencesResult.success) {
        setIsSaved(true);
        setSaveMessage('Paramètres mis à jour avec succès !');
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
  
  const handleChangePassword = async () => {
    try {
      setPasswordMessage('');
      clearSecurityError();
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordMessage('Les mots de passe ne correspondent pas.');
        return;
      }
      
      if (passwordData.newPassword.length < 8) {
        setPasswordMessage('Le mot de passe doit contenir au moins 8 caractères.');
        return;
      }
      
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });
      
      if (result.success) {
        setPasswordMessage('Mot de passe modifié avec succès !');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setPasswordMessage(''), 3000);
      } else {
        setPasswordMessage(result.error || 'Erreur lors du changement de mot de passe.');
      }
    } catch (error) {
      setPasswordMessage('Erreur lors du changement de mot de passe.');
    }
  };

  const handleDisconnectGoogle = () => {
    console.log('Disconnect Google account');
    // TODO: Implement Google disconnect logic
  };

  if ((securityLoading && !securitySettings) || (preferencesLoading && !preferences)) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-[#008751]" />
        <span className="ml-2 text-gray-600">Chargement des paramètres...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <h1 className="text-2xl font-bold text-gray-900">Identifiant & Mot de passe</h1>
      
      {(securityError || preferencesError) && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <p className="text-sm text-red-600">{securityError || preferencesError}</p>
        </div>
      )}
      
      {(isSaved || saveMessage) && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500" />
          <p className="text-sm text-green-600">{saveMessage}</p>
        </div>
      )}
      
      {passwordMessage && (
        <div className={`p-3 border rounded-md flex items-center gap-2 ${
          passwordMessage.includes('succès') 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <AlertCircle className={`h-4 w-4 ${
            passwordMessage.includes('succès') ? 'text-green-500' : 'text-red-500'
          }`} />
          <p className={`text-sm ${
            passwordMessage.includes('succès') ? 'text-green-600' : 'text-red-600'
          }`}>{passwordMessage}</p>
        </div>
      )}

      <div className="flex gap-4 border-b border-gray-200">
         <button 
           onClick={() => setActiveTab('login')}
           className={`px-4 py-2 text-sm font-medium rounded-t-md ${
             activeTab === 'login' 
               ? 'bg-[#008751] text-white' 
               : 'text-[#008751] hover:bg-green-50'
           }`}
         >
           Informations de connexion
         </button>
         <button 
           onClick={() => setActiveTab('password')}
           className={`px-4 py-2 text-sm font-medium rounded-t-md ${
             activeTab === 'password' 
               ? 'bg-[#008751] text-white' 
               : 'text-[#008751] hover:bg-green-50'
           }`}
         >
           Changer le mot de passe
         </button>
      </div>

      {activeTab === 'login' ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
           <div className="p-6 space-y-6">
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur <span className="text-red-500">*</span></label>
                 <div className="relative">
                     <input 
                       type="text"
                       value={formData.username}
                       onChange={(e) => handleInputChange('username', e.target.value)}
                       className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" 
                     />
                     <div className="absolute right-2 top-2.5 text-red-400"><MoreHorizontal size={20} /></div>
                 </div>
                 <p className="mt-1 text-xs text-gray-500">Vous pouvez vous connecter à FleetMada avec votre nom d'utilisateur ou votre email.</p>
              </div>

              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                 <div className="relative">
                     <input 
                       type="email"
                       value={formData.email}
                       onChange={(e) => handleInputChange('email', e.target.value)}
                       className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" 
                     />
                     <div className="absolute right-2 top-2.5 text-red-400"><MoreHorizontal size={20} /></div>
                 </div>
              </div>

              <div className="flex items-start gap-3">
                 <input 
                   type="checkbox" 
                   checked={formData.marketingEmails}
                   onChange={(e) => handleInputChange('marketingEmails', e.target.checked)}
                   className="mt-1 text-[#008751] focus:ring-[#008751] rounded" 
                 />
                 <span className="text-sm text-gray-700">M'envoyer des emails marketing à propos de FleetMada</span>
              </div>

              <div>
                 <button 
                   onClick={handleDisconnectGoogle}
                   className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded shadow-sm"
                 >
                   Déconnecter votre compte Google
                 </button>
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
                 <p className="mt-1 text-xs text-gray-500">Fuseau horaire préféré pour l'affichage des dates et heures.</p>
              </div>

              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Langue</label>
                 <select 
                   value={formData.language}
                   onChange={(e) => handleInputChange('language', e.target.value)}
                   className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
                 >
                    <option>Français</option>
                    <option>English</option>
                 </select>
              </div>
           </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
           <div className="p-6 space-y-6">
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                 <input 
                   type="password"
                   className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" 
                 />
              </div>

              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                 <input 
                   type="password"
                   className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" 
                 />
              </div>

              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
                 <input 
                   type="password"
                   className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]" 
                 />
              </div>

              <div className="text-sm text-gray-600">
                 <p>Le mot de passe doit contenir au moins :</p>
                 <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>8 caractères minimum</li>
                    <li>Au moins une lettre majuscule</li>
                    <li>Au moins une lettre minuscule</li>
                    <li>Au moins un chiffre</li>
                    <li>Au moins un caractère spécial</li>
                 </ul>
              </div>
           </div>
        </div>
      )}

      <div className="flex justify-end">
          <button 
            onClick={handleSave}
            className="bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-4 rounded shadow-sm"
          >
            Enregistrer
          </button>
      </div>
    </div>
  );
}