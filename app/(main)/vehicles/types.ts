export type VehicleStatus = 'Active' | 'Inactive' | 'In Shop' | 'Out of Service' | 'Sold';
export type VehicleType = 'Car' | 'Truck' | 'Van' | 'Bus' | 'Trailer' | 'Forklift' | 'Other';
export type Ownership = 'Owned' | 'Leased' | 'Rented' | 'Customer';
export type LoanLeaseType = 'Loan' | 'Lease' | 'None';
export type FuelUnit = 'Gallons (US)' | 'Gallons (UK)' | 'Liters';
export type MeasurementUnit = 'Imperial' | 'Metric';
export type MeterUnit = 'Miles' | 'Kilometers' | 'Hours';

export interface Vehicle {
    id: string;
    // Details
    name: string;
    vin: string;
    type: VehicleType;
    status: VehicleStatus;
    ownership: Ownership;
    labels: string[];
    image?: string;

    // Maintenance
    serviceProgram?: string;

    // Lifecycle
    inServiceDate?: string;
    inServiceOdometer?: number;
    estimatedServiceLifeMonths?: number;
    estimatedServiceLifeMiles?: number;
    estimatedResaleValue?: number;
    outOfServiceDate?: string;
    outOfServiceOdometer?: number;

    // Financial
    purchaseVendor?: string;
    purchaseDate?: string;
    purchasePrice?: number;
    purchaseOdometer?: number;
    purchaseNotes?: string;
    loanLeaseType: LoanLeaseType;

    // Settings
    primaryMeter: MeterUnit;
    fuelUnit: FuelUnit;
    measurementUnits: MeasurementUnit;

    // Computed/Other
    currentMeter?: number;
    group?: string;
    operator?: string;
}

export const MOCK_VEHICLES: Vehicle[] = [
    {
        id: '1',
        name: '2019 Ford F-150',
        vin: '1FTEW1E45KFA12345',
        type: 'Truck',
        status: 'Active',
        ownership: 'Owned',
        labels: ['Fleet', 'North'],
        primaryMeter: 'Miles',
        fuelUnit: 'Gallons (US)',
        measurementUnits: 'Imperial',
        loanLeaseType: 'None',
        currentMeter: 45230,
        group: 'Maintenance',
        operator: 'John Doe'
    },
    {
        id: '2',
        name: '2020 Toyota Camry',
        vin: '4T1B11HK4LU567890',
        type: 'Car',
        status: 'Active',
        ownership: 'Leased',
        labels: ['Sales'],
        primaryMeter: 'Miles',
        fuelUnit: 'Gallons (US)',
        measurementUnits: 'Imperial',
        loanLeaseType: 'Lease',
        currentMeter: 12500,
        group: 'Sales',
        operator: 'Jane Smith'
    },
    {
        id: '3',
        name: '2018 Mercedes-Benz Sprinter',
        vin: 'WD3PE7CC9K554321',
        type: 'Van',
        status: 'In Shop',
        ownership: 'Owned',
        labels: ['Delivery'],
        primaryMeter: 'Kilometers',
        fuelUnit: 'Liters',
        measurementUnits: 'Metric',
        loanLeaseType: 'None',
        currentMeter: 89000,
        group: 'Logistics',
        operator: 'Mike Johnson'
    }
];

export interface Assignment {
    id: string;
    vehicleId: string;
    operator: string;
    startDate: string; // ISO Date string (YYYY-MM-DD)
    startTime: string; // Time string (HH:MM)
    endDate?: string;
    endTime?: string;
    comments?: string;
}

export const MOCK_ASSIGNMENTS: Assignment[] = [
    {
        id: '1',
        vehicleId: '1', // Ford F-150
        operator: 'John Doe',
        startDate: new Date().toISOString().split('T')[0],
        startTime: '08:00',
        endDate: new Date().toISOString().split('T')[0],
        endTime: '17:00',
        comments: 'Daily delivery route'
    },
    {
        id: '2',
        vehicleId: '3', // Sprinter
        operator: 'Mike Johnson',
        startDate: new Date().toISOString().split('T')[0],
        startTime: '06:00',
        endDate: new Date().toISOString().split('T')[0],
        endTime: '14:00',
        comments: 'Morning shift'
    }
];

export interface MeterEntry {
    id: string;
    vehicleId: string;
    date: string; // YYYY-MM-DD
    value: number;
    type: string;
    unit: string;
    isVoid: boolean;
    source?: string;
    voidStatus?: string;
    autoVoidReason?: string;
}

export const MOCK_METER_ENTRIES: MeterEntry[] = [
    {
        id: '1',
        vehicleId: '1',
        date: '2025-12-14',
        value: 45230,
        type: 'Primary',
        unit: 'mi',
        isVoid: false,
        source: 'Manual'
    },
    {
        id: '2',
        vehicleId: '1',
        date: '2025-12-11',
        value: 45100,
        type: 'Primary',
        unit: 'mi',
        isVoid: false,
        source: 'Fuel Entry #195960968'
    },
    {
        id: '3',
        vehicleId: '2',
        date: '2025-12-14',
        value: 12500,
        type: 'Primary',
        unit: 'mi',
        isVoid: false,
        source: 'External Integration'
    }
];

export interface ExpenseEntry {
    id: string;
    vehicleId: string;
    date: string; // YYYY-MM-DD
    type: string;
    vendor?: string;
    source: string;
    amount: number;
    currency: string;
    notes?: string;
    status?: string; // e.g., 'Draft', 'Submitted', 'Approved'
    docs?: number;
    photos?: number;
}

export const MOCK_EXPENSE_ENTRIES: ExpenseEntry[] = [
    {
        id: '1',
        vehicleId: '1',
        date: '2025-12-14',
        type: 'Tolls',
        vendor: 'I-PASS',
        source: 'Manually Entered',
        amount: 12.50,
        currency: 'USD',
        notes: 'Toll road payment',
        docs: 0,
        photos: 0
    },
    {
        id: '2',
        vehicleId: '2',
        date: '2025-12-12',
        type: 'Insurance',
        vendor: 'Geico',
        source: 'Manually Entered',
        amount: 120.00,
        currency: 'USD',
        notes: 'Monthly premium',
        docs: 1,
        photos: 0
    },
    {
        id: '3',
        vehicleId: '1',
        date: '2025-11-30',
        type: 'Vehicle Registration',
        vendor: 'DMV',
        source: 'Manually Entered',
        amount: 85.00,
        currency: 'USD',
        notes: 'Annual renewal',
        docs: 1,
        photos: 1
    }
];
