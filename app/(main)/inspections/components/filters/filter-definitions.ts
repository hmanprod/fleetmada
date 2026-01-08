export type FilterCategory = 'INSPECTION' | 'TEMPLATE';

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
    // INSPECTION CATEGORY
    {
        id: 'status',
        label: 'Status',
        type: 'enum',
        category: 'INSPECTION',
        options: [
            { value: 'DRAFT', label: 'Draft' },
            { value: 'SCHEDULED', label: 'Scheduled' },
            { value: 'IN_PROGRESS', label: 'In Progress' },
            { value: 'COMPLETED', label: 'Completed' },
            { value: 'CANCELLED', label: 'Cancelled' },
        ]
    },
    {
        id: 'complianceStatus',
        label: 'Compliance Status',
        type: 'enum',
        category: 'INSPECTION',
        options: [
            { value: 'COMPLIANT', label: 'Compliant' },
            { value: 'NON_COMPLIANT', label: 'Non-Compliant' },
            { value: 'PENDING_REVIEW', label: 'Pending Review' },
        ]
    },
    { id: 'scheduledDate', label: 'Scheduled Date', type: 'date', category: 'INSPECTION' },
    { id: 'startedAt', label: 'Started Date', type: 'date', category: 'INSPECTION' },
    { id: 'completedAt', label: 'Completed Date', type: 'date', category: 'INSPECTION' },
    { id: 'inspectorName', label: 'Inspector Name', type: 'text', category: 'INSPECTION' },
    { id: 'overallScore', label: 'Score', type: 'number', category: 'INSPECTION' },
    { id: 'title', label: 'Title', type: 'text', category: 'INSPECTION' },
    { id: 'location', label: 'Location', type: 'text', category: 'INSPECTION' },

    // TEMPLATE CATEGORY
    { id: 'name', label: 'Template Name', type: 'text', category: 'TEMPLATE' },
    { id: 'category', label: 'Category', type: 'text', category: 'TEMPLATE' },
    {
        id: 'isActive',
        label: 'Active Status',
        type: 'boolean',
        category: 'TEMPLATE',
        options: [
            { value: 'true', label: 'Active' },
            { value: 'false', label: 'Inactive' }
        ]
    },
    { id: 'description', label: 'Description', type: 'text', category: 'TEMPLATE' },
];

export const INSPECTION_HISTORY_FIELDS = ALL_FILTER_FIELDS.filter(f => f.category === 'INSPECTION');
export const INSPECTION_SCHEDULE_FIELDS = ALL_FILTER_FIELDS.filter(f => f.category === 'INSPECTION' && f.id !== 'completedAt' && f.id !== 'startedAt' && f.id !== 'overallScore' && f.id !== 'complianceStatus');
export const TEMPLATE_FIELDS = ALL_FILTER_FIELDS.filter(f => f.category === 'TEMPLATE');
