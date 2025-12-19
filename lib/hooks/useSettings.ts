/**
 * Hooks React pour la gestion des paramètres et settings de FleetMada
 * 
 * Ces hooks centralisent la logique de gestion des paramètres côté frontend
 * et s'intègrent avec le service API settings pour les communications backend.
 */

"use client";

import { useState, useEffect, useCallback } from 'react';
import { settingsApi } from '@/lib/services/settings-api';

// ===== HOOKS POUR LES PARAMÈTRES GÉNÉRAUX =====

export function useGeneralSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await settingsApi.getGeneralSettings();
      
      if (response.success && response.data) {
        setSettings(response.data);
      } else {
        setError(response.error || 'Erreur lors du chargement des paramètres');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (updates) => {
    try {
      setIsSaving(true);
      setError(null);
      const response = await settingsApi.updateGeneralSettings(updates);
      
      if (response.success && response.data) {
        setSettings(response.data);
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.error || 'Erreur lors de la sauvegarde';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = 'Erreur de connexion au serveur';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsSaving(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    isSaving,
    updateSettings,
    refetch: fetchSettings,
    clearError: () => setError(null)
  };
}

// ===== HOOKS POUR LES PRÉFÉRENCES UTILISATEUR =====

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await settingsApi.getUserPreferences();
      
      if (response.success && response.data) {
        setPreferences(response.data);
      } else {
        setError(response.error || 'Erreur lors du chargement des préférences');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(async (updates) => {
    try {
      setIsSaving(true);
      setError(null);
      const response = await settingsApi.updateUserPreferences(updates);
      
      if (response.success && response.data) {
        setPreferences(response.data);
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.error || 'Erreur lors de la sauvegarde';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = 'Erreur de connexion au serveur';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Hook spécialisé pour le thème
  const updateTheme = useCallback(async (theme) => {
    return updatePreferences({ theme });
  }, [updatePreferences]);

  // Hook spécialisé pour la langue
  const updateLanguage = useCallback(async (language) => {
    return updatePreferences({ language });
  }, [updatePreferences]);

  // Hook spécialisé pour le fuseau horaire
  const updateTimezone = useCallback(async (timezone) => {
    return updatePreferences({ timezone });
  }, [updatePreferences]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    loading,
    error,
    isSaving,
    updatePreferences,
    updateTheme,
    updateLanguage,
    updateTimezone,
    refetch: fetchPreferences,
    clearError: () => setError(null)
  };
}

// ===== HOOKS POUR LES PARAMÈTRES DE SÉCURITÉ =====

export function useSecuritySettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await settingsApi.getSecuritySettings();
      
      if (response.success && response.data) {
        setSettings(response.data);
      } else {
        setError(response.error || 'Erreur lors du chargement des paramètres de sécurité');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (updates) => {
    try {
      setIsSaving(true);
      setError(null);
      const response = await settingsApi.updateSecuritySettings(updates);
      
      if (response.success && response.data) {
        setSettings(response.data);
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.error || 'Erreur lors de la sauvegarde';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = 'Erreur de connexion au serveur';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsSaving(false);
    }
  }, []);

  const changePassword = useCallback(async (passwordData) => {
    try {
      setIsSaving(true);
      setError(null);
      const response = await settingsApi.changePassword(passwordData);
      
      if (response.success) {
        return { success: true };
      } else {
        const errorMsg = response.error || 'Erreur lors du changement de mot de passe';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = 'Erreur de connexion au serveur';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Hook spécialisé pour activer/désactiver la 2FA
  const toggleTwoFactor = useCallback(async (enabled) => {
    return updateSettings({ twoFactorEnabled: enabled });
  }, [updateSettings]);

  // Hook spécialisé pour la durée de session
  const updateSessionTimeout = useCallback(async (timeout) => {
    return updateSettings({ sessionTimeout: timeout });
  }, [updateSettings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    isSaving,
    updateSettings,
    changePassword,
    toggleTwoFactor,
    updateSessionTimeout,
    refetch: fetchSettings,
    clearError: () => setError(null)
  };
}

// ===== HOOK GLOBAL POUR TOUS LES SETTINGS =====

export function useAllSettings() {
  const [general, setGeneral] = useState<any>(null);
  const [preferences, setPreferences] = useState<any>(null);
  const [security, setSecurity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await settingsApi.getAllSettings();
      
      if (response.errors.length === 0) {
        setGeneral(response.general?.data || null);
        setPreferences(response.preferences?.data || null);
        setSecurity(response.security?.data || null);
      } else {
        setError('Erreur lors du chargement de certains paramètres');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    await fetchAllSettings();
  }, [fetchAllSettings]);

  useEffect(() => {
    fetchAllSettings();
  }, [fetchAllSettings]);

  return {
    general,
    preferences,
    security,
    loading,
    error,
    refreshSettings,
    clearError: () => setError(null)
  };
}

// ===== HOOK UTILITAIRE POUR LA SAUVEGARDE =====

export function useSettingsSaver() {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const saveWithRetry = useCallback(async (saveFunction, data, maxRetries = 3) => {
    setIsSaving(true);
    let lastError = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const result = await saveFunction(data);
        if (result.success) {
          setLastSaved(new Date());
          setIsSaving(false);
          return result;
        } else {
          lastError = result.error;
          if (i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Délai progressif
          }
        }
      } catch (err) {
        lastError = err.message;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }

    setIsSaving(false);
    return { success: false, error: lastError };
  }, []);

  const clearLastSaved = useCallback(() => {
    setLastSaved(null);
  }, []);

  return {
    isSaving,
    lastSaved,
    saveWithRetry,
    clearLastSaved
  };
}