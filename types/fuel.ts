// Types pour FuelEntry et ChargingEntry
export interface FuelEntry {
  id: string;
  vehicleId: string;
  userId: string;
  date: string;
  vendor?: string;
  usage?: number;
  volume: number;
  cost: number;
  mpg?: number;
  odometer?: number;
  fuelType?: string;
  fuelCard?: boolean;
  reference?: string;
  notes?: string;
  receipt?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  vehicle?: VehicleRelation;
  user?: User;
}

export interface ChargingEntry {
  id: string;
  vehicleId: string;
  userId: string;
  date: string;
  location?: string;
  energyKwh: number;
  cost: number;
  durationMin?: number;
  createdAt: string;
  // Relations
  vehicle?: VehicleRelation;
  user?: User;
}

export interface Vehicle {
  id: string;
  name: string;
  vin: string;
  type: string;
  year: number;
  make: string;
  model: string;
  status: string;
  meterReading?: number;
  // Relations
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Type partiel pour les véhicules dans les relations (uniquement les champs sélectionnés)
export interface VehicleRelation {
  id: string;
  name: string;
  vin: string;
  type: string;
  year: number;
  make: string;
  model: string;
  status: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  companyId?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Types pour les statistiques et analytics
export interface FuelStats {
  totalCost: number;
  totalVolume: number;
  averageMpg: number;
  totalEntries: number;
  period: string;
  costByVehicle: { vehicleId: string; vehicleName: string; cost: number }[];
  costByVendor: { vendor: string; cost: number; volume: number }[];
  monthlyTrends: { month: string; cost: number; volume: number }[];
}

export interface ChargingStats {
  totalCost: number;
  totalEnergyKwh: number;
  totalDuration: number;
  totalEntries: number;
  averageCostPerKwh: number;
  period: string;
  costByVehicle: { vehicleId: string; vehicleName: string; cost: number }[];
  costByVendor: { vendor: string; cost: number; energyKwh: number }[];
  monthlyTrends: { month: string; cost: number; energyKwh: number }[];
}

// Types pour les filtres de recherche
export interface FuelEntryFilters {
  vehicleId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  vendor?: string;
  minCost?: number;
  maxCost?: number;
  minVolume?: number;
  maxVolume?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'cost' | 'volume' | 'mpg';
  sortOrder?: 'asc' | 'desc';
}

export interface ChargingEntryFilters {
  vehicleId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  vendor?: string;
  location?: string;
  minCost?: number;
  maxCost?: number;
  minEnergyKwh?: number;
  maxEnergyKwh?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'cost' | 'energyKwh' | 'durationMin';
  sortOrder?: 'asc' | 'desc';
}

// Types pour les réponses API paginées
export interface PaginatedFuelEntries {
  entries: FuelEntry[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedChargingEntries {
  entries: ChargingEntry[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Types pour les formulaires de création/édition
export interface CreateFuelEntryData {
  vehicleId: string;
  date: string;
  vendor?: string;
  usage?: number;
  volume: number;
  cost: number;
  mpg?: number;
  odometer?: number;
  fuelType?: string;
  fuelCard?: boolean;
  reference?: string;
  notes?: string;
  receipt?: string;
  location?: string;
}

export interface UpdateFuelEntryData extends Partial<CreateFuelEntryData> {
  id: string;
}

export interface CreateChargingEntryData {
  vehicleId: string;
  date: string;
  location?: string;
  energyKwh: number;
  cost: number;
  durationMin?: number;
  startTime?: string;
  endTime?: string;
  vendor?: string;
  energyPrice?: number;
  notes?: string;
}

export interface UpdateChargingEntryData extends Partial<CreateChargingEntryData> {
  id: string;
}