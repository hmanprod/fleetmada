export type FilterCategory = 'VEHICLE' | 'METER ENTRY' | 'ASSIGNMENT' | 'ISSUE' | 'EXPENSE';

export interface FilterOption {
    value: string;
    label: string;
}

export type FilterFieldType = 'text' | 'enum' | 'date' | 'number' | 'boolean' | 'multiselect';

export interface FilterField {
    id: string;
    label: string;
    type: FilterFieldType;
    category: FilterCategory;
    options?: FilterOption[];
    unit?: string;
}

export const ALL_FILTER_FIELDS: FilterField[] = [
    // METER ENTRY CATEGORY
    { id: 'date', label: 'Meter Date', type: 'date', category: 'METER ENTRY' },
    { id: 'value', label: 'Meter Value', type: 'number', category: 'METER ENTRY' },
    {
        id: 'type',
        label: 'Meter Type',
        type: 'enum',
        category: 'METER ENTRY',
        options: [
            { value: 'MILEAGE', label: 'Mileage' },
            { value: 'HOURS', label: 'Hours' },
        ]
    },
    {
        id: 'void',
        label: 'Void Status',
        type: 'enum',
        category: 'METER ENTRY',
        options: [
            { value: 'true', label: 'Voided' },
            { value: 'false', label: 'Active' },
        ]
    },
    { id: 'source', label: 'Source', type: 'text', category: 'METER ENTRY' },
    { id: 'createdAt', label: 'Created On', type: 'date', category: 'METER ENTRY' },
    { id: 'updatedAt', label: 'Updated On', type: 'date', category: 'METER ENTRY' },

    // VEHICLE CATEGORY
    {
        id: 'status', label: 'Vehicle Status', type: 'enum', category: 'VEHICLE', options: [
            { value: 'ACTIVE', label: 'Active' },
            { value: 'INACTIVE', label: 'Inactive' },
            { value: 'MAINTENANCE', label: 'In Shop' },
            { value: 'DISPOSED', label: 'Out of Service' },
        ]
    },
    { id: 'name', label: 'Vehicle Name', type: 'text', category: 'VEHICLE' },
    { id: 'vin', label: 'VIN', type: 'text', category: 'VEHICLE' },
    { id: 'licensePlate', label: 'License Plate', type: 'text', category: 'VEHICLE' },
    { id: 'make', label: 'Make', type: 'text', category: 'VEHICLE' },
    { id: 'model', label: 'Model', type: 'text', category: 'VEHICLE' },
    { id: 'year', label: 'Year', type: 'number', category: 'VEHICLE' },
    { id: 'group', label: 'Group', type: 'text', category: 'VEHICLE' },
    { id: 'operator', label: 'Operator', type: 'text', category: 'VEHICLE' },
    { id: 'type', label: 'Vehicle Type', type: 'text', category: 'VEHICLE' },
    {
        id: 'ownership',
        label: 'Ownership',
        type: 'enum',
        category: 'VEHICLE',
        options: [
            { value: 'Owned', label: 'Owned' },
            { value: 'Leased', label: 'Leased' },
            { value: 'Rented', label: 'Rented' },
            { value: 'Customer', label: 'Customer' },
        ]
    },
    { id: 'meterReading', label: 'Current Meter Value', type: 'number', category: 'VEHICLE' },

    // ASSIGNMENT CATEGORY
    { id: 'startDate', label: 'Assignment Start', type: 'date', category: 'ASSIGNMENT' },
    { id: 'endDate', label: 'Assignment End', type: 'date', category: 'ASSIGNMENT' },
    { id: 'operator', label: 'Assigned Operator', type: 'text', category: 'ASSIGNMENT' },
    {
        id: 'status',
        label: 'Assignment Status',
        type: 'enum',
        category: 'ASSIGNMENT',
        options: [
            { value: 'ACTIVE', label: 'Active' },
            { value: 'INACTIVE', label: 'Inactive' },
            { value: 'TEMPORARY', label: 'Temporary' },
        ]
    },

    // EXPENSE CATEGORY
    { id: 'date', label: 'Expense Date', type: 'date', category: 'EXPENSE' },
    { id: 'type', label: 'Expense Type', type: 'text', category: 'EXPENSE' },
    { id: 'vendor', label: 'Vendor', type: 'text', category: 'EXPENSE' },
    { id: 'amount', label: 'Amount', type: 'number', category: 'EXPENSE' },
    { id: 'source', label: 'Source', type: 'text', category: 'EXPENSE' },
];

export const METER_HISTORY_FIELDS = ALL_FILTER_FIELDS.filter(f =>
    f.category === 'METER ENTRY' || (f.category === 'VEHICLE' && ['status', 'group', 'operator', 'name', 'vin', 'make', 'model', 'year'].includes(f.id))
);

export const VEHICLE_LIST_FIELDS = ALL_FILTER_FIELDS.filter(f => f.category === 'VEHICLE');

export const ASSIGNMENT_FIELDS = ALL_FILTER_FIELDS.filter(f =>
    f.category === 'ASSIGNMENT' || (f.category === 'VEHICLE' && ['status', 'group', 'operator', 'name', 'vin', 'type'].includes(f.id))
);

export const EXPENSE_FIELDS = ALL_FILTER_FIELDS.filter(f =>
    f.category === 'EXPENSE' || (f.category === 'VEHICLE' && ['status', 'group', 'name', 'vin'].includes(f.id))
);
