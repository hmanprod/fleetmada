import { FilterField } from '../../../../inspections/components/filters/filter-definitions';

export const SERVICE_REMINDER_FILTER_FIELDS: FilterField[] = [
    {
        id: 'status',
        label: 'Status',
        type: 'enum',
        category: 'SERVICE_REMINDER' as any,
        options: [
            { value: 'ACTIVE', label: 'Active' },
            { value: 'OVERDUE', label: 'Overdue' },
            { value: 'DISMISSED', label: 'Snoozed/Dismissed' },
            { value: 'COMPLETED', label: 'Completed' },
        ]
    },
    {
        id: 'priority',
        label: 'Priority',
        type: 'enum',
        category: 'SERVICE_REMINDER' as any,
        options: [
            { value: 'NORMAL', label: 'Normal' },
            { value: 'SOON', label: 'Due Soon' },
            { value: 'OVERDUE', label: 'Overdue' },
        ]
    },
    { id: 'nextDue', label: 'Next Due Date', type: 'date', category: 'SERVICE_REMINDER' as any },
    { id: 'task', label: 'Service Task', type: 'text', category: 'SERVICE_REMINDER' as any },
    { id: 'vehicleId', label: 'Vehicle', type: 'enum', category: 'SERVICE_REMINDER' as any },
];
