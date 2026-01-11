import { FilterField } from '../../../inspections/components/filters/filter-definitions';

export const ISSUE_FILTER_FIELDS: FilterField[] = [
    {
        id: 'status',
        label: 'Status',
        type: 'enum',
        category: 'ISSUE' as any,
        options: [
            { value: 'OPEN', label: 'Open' },
            { value: 'IN_PROGRESS', label: 'In Progress' },
            { value: 'RESOLVED', label: 'Resolved' },
            { value: 'CLOSED', label: 'Closed' },
        ]
    },
    {
        id: 'priority',
        label: 'Priority',
        type: 'enum',
        category: 'ISSUE' as any,
        options: [
            { value: 'LOW', label: 'Low' },
            { value: 'MEDIUM', label: 'Medium' },
            { value: 'HIGH', label: 'High' },
            { value: 'CRITICAL', label: 'Critical' },
        ]
    },
    { id: 'reportedDate', label: 'Reported Date', type: 'date', category: 'ISSUE' as any },
    { id: 'summary', label: 'Summary', type: 'text', category: 'ISSUE' as any },
    { id: 'assignedTo', label: 'Assigned To', type: 'enum', category: 'ISSUE' as any },
    { id: 'labels', label: 'Labels', type: 'multiselect', category: 'ISSUE' as any },
    { id: 'groupId', label: 'Group', type: 'enum', category: 'ISSUE' as any },
    { id: 'vehicleId', label: 'Vehicle', type: 'enum', category: 'ISSUE' as any },
];
