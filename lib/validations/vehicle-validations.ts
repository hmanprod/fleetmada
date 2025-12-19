import { z } from 'zod'

// Schémas de base
export const VehicleStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DISPOSED'])
export const MeterTypeSchema = z.enum(['MILEAGE', 'HOURS', 'FUEL'])
export const AssignmentStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'TEMPORARY'])

export const OwnershipSchema = z.enum(['Owned', 'Leased', 'Rented', 'Customer'])
export const LoanLeaseTypeSchema = z.enum(['Loan', 'Lease', 'None'])
export const FuelUnitSchema = z.enum(['Gallons (US)', 'Gallons (UK)', 'Liters'])
export const MeasurementUnitSchema = z.enum(['Imperial', 'Metric'])
export const MeterUnitSchema = z.enum(['Miles', 'Kilometers', 'Hours'])

// Schéma pour la création d'un véhicule
export const CreateVehicleSchema = z.object({
  name: z.string().min(1, 'Le nom du véhicule est requis'),
  vin: z.string().min(1, 'Le VIN est requis').max(17, 'Le VIN ne peut pas dépasser 17 caractères'),
  type: z.string().min(1, 'Le type de véhicule est requis'),
  year: z.number().int().min(1886, 'L\'année doit être postérieure à 1886').max(new Date().getFullYear() + 1, 'L\'année ne peut pas être dans le futur'),
  make: z.string().min(1, 'La marque est requise'),
  model: z.string().min(1, 'Le modèle est requis'),
  status: VehicleStatusSchema.default('ACTIVE'),
  ownership: OwnershipSchema.optional(),
  labels: z.array(z.string()).default([]),
  serviceProgram: z.string().optional(),
  // Lifecycle dates
  inServiceDate: z.string().datetime().optional(),
  inServiceOdometer: z.number().min(0).optional(),
  estimatedServiceLifeMonths: z.number().int().min(1).optional(),
  estimatedServiceLifeMiles: z.number().min(0).optional(),
  estimatedResaleValue: z.number().min(0).optional(),
  outOfServiceDate: z.string().datetime().optional(),
  outOfServiceOdometer: z.number().min(0).optional(),
  // Purchase information
  purchaseVendor: z.string().optional(),
  purchaseDate: z.string().datetime().optional(),
  purchasePrice: z.number().min(0).optional(),
  purchaseOdometer: z.number().min(0).optional(),
  purchaseNotes: z.string().optional(),
  loanLeaseType: LoanLeaseTypeSchema.default('None'),
  // Settings
  primaryMeter: MeterUnitSchema.default('Miles'),
  fuelUnit: FuelUnitSchema.default('Gallons (US)'),
  measurementUnits: MeasurementUnitSchema.default('Imperial'),
  // Computed/Other
  group: z.string().optional(),
  operator: z.string().optional(),
})

// Schéma pour la mise à jour d'un véhicule
export const UpdateVehicleSchema = CreateVehicleSchema.partial().extend({
  id: z.string(),
})

// Schéma pour les paramètres de requête de liste
export const VehicleListQuerySchema = z.object({
  page: z.string().transform((val) => parseInt(val)).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform((val) => parseInt(val)).pipe(z.number().min(1).max(100)).default('10'),
  search: z.string().optional(),
  status: VehicleStatusSchema.optional(),
  type: z.string().optional(),
  ownership: OwnershipSchema.optional(),
  group: z.string().optional(),
  operator: z.string().optional(),
  sortBy: z.enum(['name', 'year', 'status', 'createdAt', 'updatedAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

// Schéma pour la création d'une entrée de compteur
export const CreateMeterEntrySchema = z.object({
  vehicleId: z.string(),
  date: z.string().datetime(),
  value: z.number().min(0),
  type: MeterTypeSchema,
  void: z.boolean().default(false),
  voidStatus: z.string().optional(),
  autoVoidReason: z.string().optional(),
  unit: z.string().optional(),
  source: z.string().optional(),
})

// Schéma pour la mise à jour d'une entrée de compteur
export const UpdateMeterEntrySchema = CreateMeterEntrySchema.partial().extend({
  id: z.string(),
})

// Schéma pour les paramètres de requête de liste des compteurs
export const MeterEntriesQuerySchema = z.object({
  page: z.string().transform((val) => parseInt(val)).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform((val) => parseInt(val)).pipe(z.number().min(1).max(100)).default('20'),
  type: MeterTypeSchema.optional(),
  void: z.string().transform((val) => val === 'true').optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(['date', 'value', 'createdAt']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Schéma pour la création d'une assignation
export const CreateVehicleAssignmentSchema = z.object({
  vehicleId: z.string(),
  operator: z.string().min(1, 'L\'opérateur est requis'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  status: AssignmentStatusSchema.default('ACTIVE'),
})

// Schéma pour la mise à jour d'une assignation
export const UpdateVehicleAssignmentSchema = CreateVehicleAssignmentSchema.partial().extend({
  id: z.string(),
})

// Schéma pour la création d'une dépense
export const CreateExpenseEntrySchema = z.object({
  vehicleId: z.string(),
  date: z.string().datetime(),
  type: z.string().min(1, 'Le type de dépense est requis'),
  vendor: z.string().optional(),
  source: z.string().min(1, 'La source est requise'),
  amount: z.number().min(0, 'Le montant doit être positif'),
  currency: z.string().default('USD'),
  notes: z.string().optional(),
  status: z.string().optional(),
  docs: z.number().int().min(0).default(0),
  photos: z.number().int().min(0).default(0),
})

// Schéma pour la mise à jour d'une dépense
export const UpdateExpenseEntrySchema = CreateExpenseEntrySchema.partial().extend({
  id: z.string(),
})

// Types TypeScript générés
export type CreateVehicleInput = z.infer<typeof CreateVehicleSchema>
export type UpdateVehicleInput = z.infer<typeof UpdateVehicleSchema>
export type VehicleListQuery = z.infer<typeof VehicleListQuerySchema>
export type CreateMeterEntryInput = z.infer<typeof CreateMeterEntrySchema>
export type UpdateMeterEntryInput = z.infer<typeof UpdateMeterEntrySchema>
export type MeterEntriesQuery = z.infer<typeof MeterEntriesQuerySchema>
export type CreateVehicleAssignmentInput = z.infer<typeof CreateVehicleAssignmentSchema>
export type UpdateVehicleAssignmentInput = z.infer<typeof UpdateVehicleAssignmentSchema>
export type CreateExpenseEntryInput = z.infer<typeof CreateExpenseEntrySchema>
export type UpdateExpenseEntryInput = z.infer<typeof UpdateExpenseEntrySchema>