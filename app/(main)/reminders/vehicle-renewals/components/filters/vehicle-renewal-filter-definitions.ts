import { FilterField } from '../../../../inspections/components/filters/filter-definitions';

export const VEHICLE_RENEWAL_FILTER_FIELDS: FilterField[] = [
    {
        id: 'status',
        label: 'Status',
        type: 'enum',
        category: 'VEHICLE_RENEWAL' as any,
        options: [
            { value: 'DUE', label: 'Due' },
            { value: 'OVERDUE', label: 'Overdue' },
            { value: 'COMPLETED', label: 'Completed' },
            { value: 'DISMISSED', label: 'Dismissed' },
        ]
    },
    {
        id: 'type',
        label: 'Renewal Type',
        type: 'enum',
        category: 'VEHICLE_RENEWAL' as any,
        options: [
            { value: 'REGISTRATION', label: 'Registration' },
            { value: 'INSURANCE', label: 'Insurance' },
            { value: 'INSPECTION', label: 'Inspection' },
            { value: 'EMISSION_TEST', label: 'Emission Test' },
            { value: 'OTHER', label: 'Other' },
        ]
    },
    {
        id: 'priority',
        label: 'Priority',
        type: 'enum',
        category: 'VEHICLE_RENEWAL' as any,
        options: [
            { value: 'LOW', label: 'Low' },
            { value: 'MEDIUM', label: 'Medium' },
            { value: 'HIGH', label: 'High' },
            { value: 'CRITICAL', label: 'Critical' },
        ]
    },
    { id: 'dueDate', label: 'Due Date', type: 'date', category: 'VEHICLE_RENEWAL' as any },
    { id: 'title', label: 'Summary', type: 'text', category: 'VEHICLE_RENEWAL' as any },
    { id: 'vehicleId', label: 'Vehicle', type: 'enum', category: 'VEHICLE_RENEWAL' as any },
];
