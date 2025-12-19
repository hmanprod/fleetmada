/**
 * Service API pour la gestion des paramètres et settings de FleetMada
 * 
 * Ce service centralise toutes les communications avec les APIs backend
 * pour les paramètres utilisateur, entreprise et sécurité.
 */

import { useAuthToken } from '@/lib/hooks/useAuthToken'

// Types pour les paramètres généraux
export interface GeneralSettings {
  id: string
  companyId: string
  name: string
  address?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  phone?: string
  email?: string
  website?: string
  logo?: string
  fiscalYear: string
  currency: string
  timezone: string
  dateFormat: string
  numberFormat: string
  fuelUnit: string
  distanceUnit: string
  timeFormat: string
  industry?: string
  laborTaxExempt: boolean
  secondaryTax: boolean
  defaultTax1?: string
  defaultTax2?: string
  defaultTaxType: string
  createdAt: Date
  updatedAt: Date
}

// Types pour les préférences utilisateur
export interface UserPreferences {
  id: string
  userId: string
  theme: string
  language: string
  timezone: string
  notifications: any
  dashboard: any
  fuelEconomyDisplay: string
  itemsPerPage: number
  createdAt: Date
  updatedAt: Date
}

// Types pour les paramètres de sécurité
export interface SecuritySettings {
  id: string
  userId: string
  twoFactorEnabled: boolean
  twoFactorSecret?: string | null
  loginAttempts: number
  lastLogin?: Date | null
  passwordChanged: Date
  sessionTimeout: number
  ipWhitelist: string[]
  googleConnected: boolean
  marketingEmails: boolean
  createdAt: Date
  updatedAt: Date
}

// Types pour les mises à jour
export interface GeneralSettingsUpdate {
  name?: string
  address?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  phone?: string
  email?: string
  website?: string
  logo?: string
  fiscalYear?: string
  currency?: string
  timezone?: string
  dateFormat?: string
  numberFormat?: string
  fuelUnit?: string
  distanceUnit?: string
  timeFormat?: string
  industry?: string
  laborTaxExempt?: boolean
  secondaryTax?: boolean
  defaultTax1?: string
  defaultTax2?: string
  defaultTaxType?: string
}

export interface UserPreferencesUpdate {
  theme?: string
  language?: string
  timezone?: string
  notifications?: any
  dashboard?: any
  fuelEconomyDisplay?: string
  itemsPerPage?: number
}

export interface SecuritySettingsUpdate {
  twoFactorEnabled?: boolean
  sessionTimeout?: number
  ipWhitelist?: string[]
  googleConnected?: boolean
  marketingEmails?: boolean
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Types pour les réponses API
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  details?: Array<{
    field: string
    message: string
  }>
}

class SettingsApiService {
  private baseUrl = '/api/settings'

  private getToken(): string | null {
    if (typeof window === 'undefined') {
      return null
    }
    return localStorage.getItem('authToken') || 
           document.cookie.match(/authToken=([^;]*)/)?.[1] || null
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken()
    
    if (!token) {
      return {
        success: false,
        error: 'Token d\'authentification manquant'
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Erreur lors de la requête',
          details: data.details
        }
      }

      return data
    } catch (error) {
      console.error('Settings API Error:', error)
      return {
        success: false,
        error: 'Erreur de connexion au serveur'
      }
    }
  }

  // ===== PARAMÈTRES GÉNÉRAUX =====

  /**
   * Récupérer les paramètres généraux de l'entreprise
   */
  async getGeneralSettings(): Promise<ApiResponse<GeneralSettings>> {
    return this.makeRequest<GeneralSettings>('/general')
  }

  /**
   * Mettre à jour les paramètres généraux
   */
  async updateGeneralSettings(settings: GeneralSettingsUpdate): Promise<ApiResponse<GeneralSettings>> {
    return this.makeRequest<GeneralSettings>('/general', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
  }

  // ===== PRÉFÉRENCES UTILISATEUR =====

  /**
   * Récupérer les préférences utilisateur
   */
  async getUserPreferences(): Promise<ApiResponse<UserPreferences>> {
    return this.makeRequest<UserPreferences>('/preferences')
  }

  /**
   * Mettre à jour les préférences utilisateur
   */
  async updateUserPreferences(preferences: UserPreferencesUpdate): Promise<ApiResponse<UserPreferences>> {
    return this.makeRequest<UserPreferences>('/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    })
  }

  // ===== PARAMÈTRES DE SÉCURITÉ =====

  /**
   * Récupérer les paramètres de sécurité
   */
  async getSecuritySettings(): Promise<ApiResponse<SecuritySettings>> {
    return this.makeRequest<SecuritySettings>('/security')
  }

  /**
   * Mettre à jour les paramètres de sécurité
   */
  async updateSecuritySettings(settings: SecuritySettingsUpdate): Promise<ApiResponse<SecuritySettings>> {
    return this.makeRequest<SecuritySettings>('/security', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
  }

  /**
   * Changer le mot de passe
   */
  async changePassword(passwordData: ChangePasswordRequest): Promise<ApiResponse<null>> {
    return this.makeRequest<null>('/security/password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    })
  }

  // ===== UTILITAIRES =====

  /**
   * Tester la connectivité avec l'API Settings
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.getGeneralSettings()
      return response.success
    } catch (error) {
      console.error('Settings API connection test failed:', error)
      return false
    }
  }

  /**
   * Obtenir tous les paramètres d'un coup (utilisé pour l'initialisation)
   */
  async getAllSettings() {
    try {
      const [general, preferences, security] = await Promise.allSettled([
        this.getGeneralSettings(),
        this.getUserPreferences(),
        this.getSecuritySettings()
      ])

      return {
        general: general.status === 'fulfilled' ? general.value : null,
        preferences: preferences.status === 'fulfilled' ? preferences.value : null,
        security: security.status === 'fulfilled' ? security.value : null,
        errors: [
          general.status === 'rejected' ? 'general' : null,
          preferences.status === 'rejected' ? 'preferences' : null,
          security.status === 'rejected' ? 'security' : null
        ].filter(Boolean)
      }
    } catch (error) {
      console.error('Failed to get all settings:', error)
      return {
        general: null,
        preferences: null,
        security: null,
        errors: ['all']
      }
    }
  }
}

// Instance singleton du service
export const settingsApi = new SettingsApiService()
export default settingsApi