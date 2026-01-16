import { FilterField } from '../../../inspections/components/filters/filter-definitions';

export const VENDOR_FILTER_FIELDS: FilterField[] = [
    {
        id: 'classification',
        label: 'Classification',
        type: 'enum',
        // Using 'ISSUE' or 'INSPECTION' as category doesn't matter much for internal logic unless it's strictly typed 
        // to specific values. Let's assume generic string or reuse one.
        // Checking usage in FiltersSidebar might be good, but assuming 'any' cast like in Issues works.
        category: 'VENDOR' as any,
        options: [
            { value: 'Fuel', label: 'Fuel' },
            { value: 'Service', label: 'Service' },
            { value: 'Parts', label: 'Parts' },
            { value: 'Insurance', label: 'Insurance' },
            { value: 'Registration', label: 'Registration' },
            { value: 'Charging', label: 'Charging' },
            { value: 'Tools', label: 'Tools' },
        ]
    },
    {
        id: 'label',
        label: 'Label',
        type: 'multiselect',
        category: 'VENDOR' as any,
        options: [
            { value: 'Sample', label: 'Sample' },
            { value: 'Preferred', label: 'Preferred' },
            { value: 'Emergency', label: 'Emergency' },
        ]
    },
    // Adding search as a filter field too if desired, though normally handled by main search bar.
    // Issues has 'summary' mapped to search.
    { id: 'search', label: 'Search', type: 'text', category: 'VENDOR' as any },
];
