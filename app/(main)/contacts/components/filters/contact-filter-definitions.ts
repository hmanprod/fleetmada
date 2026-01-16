import { FilterField } from '../../../inspections/components/filters/filter-definitions';

export const CONTACT_FILTER_FIELDS: FilterField[] = [
    {
        id: 'status',
        label: 'Status',
        type: 'enum',
        category: 'CONTACT' as any,
        options: [
            { value: 'ACTIVE', label: 'Active' },
            { value: 'INACTIVE', label: 'Inactive' },
            { value: 'ARCHIVED', label: 'Archived' },
        ]
    },
    {
        id: 'group',
        label: 'Group',
        type: 'enum',
        category: 'CONTACT' as any,
        options: [] // Will be populated dynamically
    },
    {
        id: 'classification',
        label: 'Classification',
        type: 'enum',
        category: 'CONTACT' as any,
        options: [
            { value: 'Operator', label: 'Operator' },
            { value: 'Technician', label: 'Technician' },
            { value: 'Manager', label: 'Manager' },
            { value: 'Employee', label: 'Employee' },
            { value: 'Admin', label: 'Admin' },
            { value: 'Vendor', label: 'Vendor' },
        ]
    },
    {
        id: 'department',
        label: 'Department',
        type: 'text',
        category: 'CONTACT' as any,
    },
    {
        id: 'jobTitle',
        label: 'Job Title',
        type: 'text',
        category: 'CONTACT' as any,
    }
];
