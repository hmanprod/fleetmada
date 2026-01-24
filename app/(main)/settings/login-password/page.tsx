'use client';

import React, { useState, useEffect } from 'react';
import { MoreHorizontal, Loader2, Check, AlertCircle } from 'lucide-react';
import { useSecuritySettings } from '@/lib/hooks/useSettings';
import { useUserPreferences } from '@/lib/hooks/useSettings';
import { useAuth } from '@/lib/auth-context';

export default function SettingsLoginPasswordPage() {
  const { user } = useAuth();
  const {
    settings: securitySettings,
    loading: securityLoading,
    isSaving: securitySaving,
    changePassword,
    updateSettings: updateSecuritySettings,
    clearError: clearSecurityError
  } = useSecuritySettings();

  const {
    preferences,
    loading: preferencesLoading,
    isSaving: preferencesSaving,
    updatePreferences,
    clearError: clearPreferencesError
  } = useUserPreferences();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
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
  const [passwordMessage, setPasswordMessage] = useState({ text: '', type: 'info' as 'info' | 'success' | 'error' });

  // Charger les données existantes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : (user.firstName || user.lastName || ''),
        email: user.email || ''
      }));
    }

    if (securitySettings) {
      setFormData(prev => ({
        ...prev,
        marketingEmails: securitySettings.marketingEmails ?? true
      }));
    }

    if (preferences) {
      setFormData(prev => ({
        ...prev,
        timezone: preferences.timezone || 'UTC',
        language: preferences.language || 'fr'
      }));
    }
  }, [securitySettings, preferences, user]);

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

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    setPasswordMessage({ text: '', type: 'info' });
    clearSecurityError();
  };

  const handleSaveSettings = async () => {
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
        setSaveMessage(securityResult.error || preferencesResult.error || 'Erreur lors de la sauvegarde des paramètres.');
      }
    } catch (error) {
      setSaveMessage('Erreur lors de la sauvegarde.');
    }
  };

  const handleUpdatePassword = async () => {
    try {
      setPasswordMessage({ text: '', type: 'info' });
      clearSecurityError();

      if (!passwordData.currentPassword) {
        setPasswordMessage({ text: 'Veuillez saisir votre mot de passe actuel.', type: 'error' });
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordMessage({ text: 'Les nouveaux mots de passe ne correspondent pas.', type: 'error' });
        return;
      }

      if (passwordData.newPassword.length < 8) {
        setPasswordMessage({ text: 'Le mot de passe doit contenir au moins 8 caractères.', type: 'error' });
        return;
      }

      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });

      if (result.success) {
        setPasswordMessage({ text: 'Mot de passe modifié avec succès !', type: 'success' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setPasswordMessage({ text: '', type: 'info' }), 5000);
      } else {
        setPasswordMessage({ text: result.error || 'Erreur lors du changement de mot de passe.', type: 'error' });
      }
    } catch (error) {
      setPasswordMessage({ text: 'Erreur lors du changement de mot de passe.', type: 'error' });
    }
  };

  const handleDisconnectGoogle = () => {
    console.log('Disconnect Google account');
    // TODO: Implement Google disconnect logic
  };

  const isLoading = (securityLoading && !securitySettings) || (preferencesLoading && !preferences);
  const isSaving = securitySaving || preferencesSaving;

  if (isLoading) {
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

      {saveMessage && !isSaved && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <p className="text-sm text-red-600">{saveMessage}</p>
        </div>
      )}

      {isSaved && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500" />
          <p className="text-sm text-green-600">{saveMessage}</p>
        </div>
      )}

      {passwordMessage.text && (
        <div className={`p-3 border rounded-md flex items-center gap-2 ${passwordMessage.type === 'success'
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
          }`}>
          {passwordMessage.type === 'success' ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <p className={`text-sm ${passwordMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`}>{passwordMessage.text}</p>
        </div>
      )}

      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('login')}
          className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${activeTab === 'login'
            ? 'bg-[#008751] text-white'
            : 'text-[#008751] hover:bg-green-50'
            }`}
        >
          Informations de connexion
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${activeTab === 'password'
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom d'affichage</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.username}
                  readOnly
                  disabled
                  className="w-full p-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Votre nom est géré dans vos informations de profil.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  disabled
                  className="w-full p-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Votre adresse email est utilisée comme identifiant de connexion.</p>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="marketingEmails"
                checked={formData.marketingEmails}
                onChange={(e) => handleInputChange('marketingEmails', e.target.checked)}
                className="mt-1 h-4 w-4 text-[#008751] focus:ring-[#008751] rounded border-gray-300"
              />
              <label htmlFor="marketingEmails" className="text-sm text-gray-700">M'envoyer des emails marketing à propos de FleetMada</label>
            </div>

            {securitySettings?.googleConnected && (
              <div>
                <button
                  onClick={handleDisconnectGoogle}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded shadow-sm transition-colors"
                >
                  Déconnecter votre compte Google
                </button>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fuseau horaire</label>
              <select
                value={formData.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-[#008751] focus:border-[#008751]"
              >
                <option value="UTC">UTC (Temps universel coordonné)</option>
                <option value="Africa/Antananarivo">(GMT+03:00) Antananarivo</option>
                <option value="Europe/Paris">(GMT+01:00) Paris</option>
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
                <option value="fr">Français</option>
                <option value="en">English</option>
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
                value={passwordData.currentPassword}
                onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                placeholder="Saisissez votre mot de passe actuel"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                placeholder="Au moins 8 caractères"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#008751] focus:border-[#008751]"
                placeholder="Confirmez votre nouveau mot de passe"
              />
            </div>

            <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-md border border-blue-100">
              <p className="font-medium text-blue-800">Le mot de passe doit contenir au moins :</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-blue-700">
                <li>8 caractères minimum</li>
                <li>Au moins une lettre majuscule</li>
                <li>Au moins une lettre minuscule</li>
                <li>Au moins un chiffre</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={activeTab === 'login' ? handleSaveSettings : handleUpdatePassword}
          disabled={isSaving}
          className={`flex items-center gap-2 bg-[#008751] hover:bg-[#007043] text-white font-bold py-2 px-6 rounded shadow-sm transition-all ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSaving && <Loader2 size={18} className="animate-spin" />}
          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}