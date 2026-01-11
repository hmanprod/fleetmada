import {
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleListQuery,
  CreateMeterEntryInput,
  UpdateMeterEntryInput,
  MeterEntriesQuery,
  CreateVehicleAssignmentInput,
  UpdateVehicleAssignmentInput,
  CreateExpenseEntryInput,
  UpdateExpenseEntryInput
} from '@/lib/validations/vehicle-validations'
import { useAuthToken } from '@/lib/hooks/useAuthToken'

// Types pour les réponses API
export interface VehiclesResponse {
  vehicles: Vehicle[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface Vehicle {
  id: string
  name: string
  vin: string
  type: string
  year: number
  make: string
  model: string
  status: string
  ownership?: string
  labels: string[]
  serviceProgram?: string
  image?: string
  meterReading?: number
  // Lifecycle
  inServiceDate?: string
  inServiceOdometer?: number
  estimatedServiceLifeMonths?: number
  estimatedServiceLifeMiles?: number
  estimatedResaleValue?: number
  outOfServiceDate?: string
  outOfServiceOdometer?: number
  // Purchase information
  purchaseVendor?: string
  purchaseDate?: string
  purchasePrice?: number
  purchaseOdometer?: number
  purchaseNotes?: string
  loanLeaseType?: string
  // Settings
  primaryMeter?: string
  fuelUnit?: string
  measurementUnits?: string
  // Computed/Other
  group?: string
  operator?: string
  licensePlate?: string
  passengerCount?: number
  lastMeterReading?: number
  lastMeterDate?: string
  lastMeterUnit?: string
  metrics?: {
    fuelEntries: number
    serviceEntries: number
    issues: number
    chargingEntries: number
    meterEntries: number
    reminders: number
    expenses: number
    assignments: number
  }
  // Specifications - Dimensions
  bodyType?: string
  bodySubtype?: string
  msrp?: number
  width?: number
  height?: number
  length?: number
  interiorVolume?: number
  passengerVolume?: number
  cargoVolume?: number
  groundClearance?: number
  bedLength?: number
  // Specifications - Weight
  curbWeight?: number
  grossVehicleWeight?: number
  // Specifications - Performance
  towingCapacity?: number
  maxPayload?: number
  // Specifications - Fuel Economy
  epaCity?: number
  epaHighway?: number
  epaCombined?: number
  // Specifications - Fuel & Oil
  fuelQuality?: string
  fuelTankCapacity?: number
  fuelTank2Capacity?: number
  oilCapacity?: number
  // Specifications - Engine
  engineDescription?: string
  engineBrand?: string
  engineAspiration?: string
  engineBlockType?: string
  engineBore?: number
  engineCamType?: string
  engineCompression?: string
  engineCylinders?: number
  engineDisplacement?: number
  fuelInduction?: string
  maxHp?: number
  maxTorque?: number
  redlineRpm?: number
  engineStroke?: number
  engineValves?: number
  // Specifications - Transmission
  transmissionDescription?: string
  transmissionBrand?: string
  transmissionType?: string
  transmissionGears?: number
  // Specifications - Wheels & Tires
  driveType?: string
  brakeSystem?: string
  frontTrackWidth?: number
  rearTrackWidth?: number
  wheelbase?: number
  frontWheelDiameter?: number
  rearWheelDiameter?: number
  rearAxleType?: string
  frontTireType?: string
  frontTirePsi?: number
  rearTireType?: string
  rearTirePsi?: number
  // Other
  recentCosts?: number
  createdAt: string
  updatedAt: string
}

export interface MeterEntry {
  id: string
  vehicleId: string
  date: string
  value: number
  type: string
  unit?: string
  isVoid: boolean
  voidStatus?: string
  autoVoidReason?: string
  source?: string
  createdAt: string
}

export interface MeterEntriesResponse {
  meterEntries: MeterEntry[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  stats: {
    totalEntries: number
    voidEntries: number
    activeEntries: number
    averageValue: number
    latestReading: {
      value: number
      date: string
      unit: string
    } | null
  }
}

export interface VehicleAssignment {
  id: string
  vehicleId: string
  operator: string
  startDate: string
  endDate?: string
  status: string
  duration?: number
  isActive: boolean
  createdAt: string
}

export interface VehicleAssignmentsResponse {
  assignments: VehicleAssignment[]
  stats: {
    totalAssignments: number
    activeAssignments: number
    completedAssignments: number
    temporaryAssignments: number
    currentOperator?: string
    totalOperators: number
    averageDuration: number
  }
  recentActivity: Array<{
    operator: string
    startDate: string
    endDate?: string
    status: string
  }>
}

export interface ExpenseEntry {
  id: string
  vehicleId: string
  date: string
  type: string
  vendor?: string
  source: string
  amount: number
  currency: string
  notes?: string
  status?: string
  docs: number
  photos: number
  createdAt: string
  updatedAt: string
}

export interface VehicleExpensesResponse {
  expenses: ExpenseEntry[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  stats: {
    totalExpenses: number
    totalAmount: number
    averageAmount: number
    last30Days: {
      count: number
      amount: number
    }
    last90Days: {
      count: number
      amount: number
    }
  }
  typeBreakdown: Array<{
    type: string
    totalAmount: number
    count: number
    percentage: number
  }>
}

export interface GlobalExpensesResponse {
  expenses: (ExpenseEntry & { vehicle: { id: string; name: string; vin: string }; vendor?: { id: string; name: string } })[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  stats: {
    totalAmount: number
    count: number
  }
}

// Configuration de base pour les requêtes
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin + '/api'
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
}

const getAuthHeaders = (): Record<string, string> => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken')
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  }
  return {
    'Content-Type': 'application/json'
  }
}

// Fonction utilitaire pour gérer les erreurs
const handleApiError = (error: any) => {
  if (error.response) {
    // Erreur de réponse de l'API
    const { status, data } = error.response
    throw new Error(data.error || `Erreur API (${status})`)
  } else if (error.request) {
    // Erreur réseau
    throw new Error('Erreur de connexion au serveur')
  } else {
    // Autre erreur
    throw new Error(error.message || 'Erreur inconnue')
  }
}

// Service API Vehicles
export class VehiclesAPIService {
  private baseUrl = getBaseUrl()

  // === VEHICLES CRUD ===

  /**
   * Récupère la liste des véhicules avec filtres et pagination
   */
  async getVehicles(query?: VehicleListQuery): Promise<VehiclesResponse> {
    try {
      const params = new URLSearchParams()

      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString())
          }
        })
      }

      const response = await fetch(`${this.baseUrl}/vehicles?${params}`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la récupération des véhicules')
      }

      return data.data
    } catch (error) {
      handleApiError(error)
      throw error
    }
  }

  /**
   * Récupère les détails d'un véhicule spécifique
   */
  async getVehicle(id: string): Promise<Vehicle> {
    try {
      const response = await fetch(`${this.baseUrl}/vehicles/${id}`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la récupération du véhicule')
      }

      return data.data
    } catch (error) {
      handleApiError(error)
      throw error
    }
  }

  /**
   * Crée un nouveau véhicule
   */
  async createVehicle(vehicle: CreateVehicleInput): Promise<Vehicle> {
    try {
      const response = await fetch(`${this.baseUrl}/vehicles`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(vehicle)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la création du véhicule')
      }

      return data.data
    } catch (error) {
      handleApiError(error)
      throw error
    }
  }

  /**
   * Met à jour un véhicule existant
   */
  async updateVehicle(id: string, updates: UpdateVehicleInput): Promise<Vehicle> {
    try {
      const response = await fetch(`${this.baseUrl}/vehicles/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la mise à jour du véhicule')
      }

      return data.data
    } catch (error) {
      handleApiError(error)
      throw error
    }
  }

  /**
   * Archive un véhicule
   */
  async archiveVehicle(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/vehicles/${id}/archive`, {
        method: 'PUT',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de l\'archivage du véhicule')
      }
    } catch (error) {
      handleApiError(error)
      throw error
    }
  }

  /**
   * Supprime un véhicule
   */
  async deleteVehicle(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/vehicles/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la suppression du véhicule')
      }
    } catch (error) {
      handleApiError(error)
      throw error
    }
  }

  // === METER ENTRIES ===

  /**
   * Récupère les entrées de compteur d'un véhicule
   */
  async getMeterEntries(vehicleId: string, query?: MeterEntriesQuery): Promise<MeterEntriesResponse> {
    try {
      const params = new URLSearchParams()

      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString())
          }
        })
      }

      const response = await fetch(`${this.baseUrl}/vehicles/${vehicleId}/meter-entries?${params}`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la récupération des entrées de compteur')
      }

      return data.data
    } catch (error) {
      handleApiError(error)
      throw error
    }
  }

  /**
   * Récupère une entrée de compteur spécifique
   */
  async getMeterEntry(vehicleId: string, entryId: string): Promise<MeterEntry> {
    try {
      const response = await fetch(`${this.baseUrl}/vehicles/${vehicleId}/meter-entries/${entryId}`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la récupération de l\'entrée de compteur')
      }

      return data.data
    } catch (error) {
      handleApiError(error)
      throw error
    }
  }

  /**
   * Crée une nouvelle entrée de compteur
   */
  async createMeterEntry(vehicleId: string, entry: CreateMeterEntryInput): Promise<MeterEntry> {
    try {
      const response = await fetch(`${this.baseUrl}/vehicles/${vehicleId}/meter-entries`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...entry, vehicleId })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la création de l\'entrée de compteur')
      }

      return data.data
    } catch (error) {
      handleApiError(error)
      throw error
    }
  }

  /**
   * Met à jour une entrée de compteur
   */
  async updateMeterEntry(vehicleId: string, entryId: string, updates: UpdateMeterEntryInput): Promise<MeterEntry> {
    try {
      const response = await fetch(`${this.baseUrl}/vehicles/${vehicleId}/meter-entries/${entryId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...updates, id: entryId, vehicleId })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la mise à jour de l\'entrée de compteur')
      }

      return data.data
    } catch (error) {
      handleApiError(error)
      throw error
    }
  }

  /**
   * Supprime une entrée de compteur
   */
  async deleteMeterEntry(vehicleId: string, entryId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/vehicles/${vehicleId}/meter-entries/${entryId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la suppression de l\'entrée de compteur')
      }
    } catch (error) {
      handleApiError(error)
      throw error
    }
  }

  // === ASSIGNMENTS ===

  /**
   * Récupère TOUTES les assignations (global)
   */
  async getAllAssignments(): Promise<VehicleAssignment[]> {
    try {
      const response = await fetch(`${this.baseUrl}/assignments`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la récupération des assignations')
      }

      // The API returns { success: true, data: [ ...assignments ] } based on assignments page usage
      return data.data
    } catch (error) {
      handleApiError(error)
      throw error
    }
  }

  /**
   * Récupère les assignations d'un véhicule
   */
  async getVehicleAssignments(vehicleId: string): Promise<VehicleAssignmentsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/vehicles/${vehicleId}/assignments`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la récupération des assignations')
      }

      return data.data
    } catch (error) {
      handleApiError(error)
      throw error
    }
  }

  /**
   * Crée une nouvelle assignation
   */
  async createVehicleAssignment(vehicleId: string, assignment: CreateVehicleAssignmentInput): Promise<VehicleAssignment> {
    try {
      const response = await fetch(`${this.baseUrl}/vehicles/${vehicleId}/assignments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...assignment, vehicleId })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la création de l\'assignation')
      }

      return data.data
    } catch (error) {
      handleApiError(error)
      throw error
    }
  }




  // === EXPENSES ===

  /**
   * Récupère toutes les dépenses (global)
   */
  async getAllExpenses(query?: any): Promise<GlobalExpensesResponse> {
    try {
      const params = new URLSearchParams()

      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString())
          }
        })
      }

      const response = await fetch(`${this.baseUrl}/expenses?${params}`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la récupération des dépenses')
      }

      return data.data
    } catch (error) {
      handleApiError(error)
      throw error
    }
  }

  /**
   * Récupère les dépenses d'un véhicule
   */
  async getVehicleExpenses(vehicleId: string, query?: any): Promise<VehicleExpensesResponse> {
    try {
      const params = new URLSearchParams()

      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString())
          }
        })
      }

      const response = await fetch(`${this.baseUrl}/vehicles/${vehicleId}/expenses?${params}`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la récupération des dépenses')
      }

      return data.data
    } catch (error) {
      handleApiError(error)
      throw error
    }
  }

  /**
   * Récupère une dépense spécifique
   */
  async getVehicleExpense(vehicleId: string, expenseId: string): Promise<ExpenseEntry> {
    try {
      const response = await fetch(`${this.baseUrl}/vehicles/${vehicleId}/expenses/${expenseId}`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la récupération de la dépense')
      }

      return data.data
    } catch (error) {
      handleApiError(error)
      throw error
    }
  }

  /**
   * Crée une nouvelle dépense
   */
  async createVehicleExpense(vehicleId: string, expense: CreateExpenseEntryInput): Promise<ExpenseEntry> {
    try {
      const response = await fetch(`${this.baseUrl}/vehicles/${vehicleId}/expenses`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...expense, vehicleId })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la création de la dépense')
      }

      return data.data
    } catch (error) {
      handleApiError(error)
      throw error
    }
  }

  /**
   * Met à jour une dépense
   */
  async updateVehicleExpense(vehicleId: string, expenseId: string, updates: UpdateExpenseEntryInput): Promise<ExpenseEntry> {
    try {
      const response = await fetch(`${this.baseUrl}/vehicles/${vehicleId}/expenses/${expenseId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...updates, id: expenseId, vehicleId })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la mise à jour de la dépense')
      }

      return data.data
    } catch (error) {
      handleApiError(error)
      throw error
    }
  }

  /**
   * Supprime une dépense
   */
  async deleteVehicleExpense(vehicleId: string, expenseId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/vehicles/${vehicleId}/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la suppression de la dépense')
      }
    } catch (error) {
      handleApiError(error)
      throw error
    }
  }
  async getWorkOrders(vehicleId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vehicles/${vehicleId}/work-orders`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch work orders');
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching work orders:', error);
      return [];
    }
  }

  async getRenewals(vehicleId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vehicles/${vehicleId}/renewals`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch renewals');
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching renewals:', error);
      return [];
    }
  }

  async getIssues(vehicleId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vehicles/${vehicleId}/issues`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch issues');
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching issues:', error);
      return [];
    }
  }

  async getFuelEntries(vehicleId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vehicles/${vehicleId}/fuel-entries`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch fuel entries');
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching fuel entries:', error);
      return [];
    }
  }

  async getPartsHistory(vehicleId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vehicles/${vehicleId}/parts`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch parts history');
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching parts history:', error);
      return [];
    }
  }
  async getServiceHistory(vehicleId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vehicles/${vehicleId}/service-history`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch service history');
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching service history:', error);
      return [];
    }
  }

  async getInspections(vehicleId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vehicles/${vehicleId}/inspections`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch inspections');
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching inspections:', error);
      return [];
    }
  }

  async getServiceReminders(vehicleId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vehicles/${vehicleId}/service-reminders`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch service reminders');
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching service reminders:', error);
      return [];
    }
  }

  async getMeterHistory(vehicleId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vehicles/${vehicleId}/meter-history`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch meter history');
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching meter history:', error);
      return [];
    }
  }

  async getAssignments(vehicleId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vehicles/${vehicleId}/assignments`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch assignments');
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching assignments:', error);
      return [];
    }
  }

  async getExpenses(vehicleId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vehicles/${vehicleId}/expenses`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch expenses');
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      return [];
    }
  }
}

// Instance singleton du service
export const vehiclesAPI = new VehiclesAPIService()

// Export par défaut
export default vehiclesAPI