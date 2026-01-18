import { FilterField } from '../../../inspections/components/filters/filter-definitions';

export const VENDOR_FILTER_FIELDS: FilterField[] = [
    {
        id: 'classification',
        label: 'Classification',
        type: 'enum',
        category: 'FOURNISSEUR' as any,
        options: [
            { value: 'Fuel', label: 'Carburant' },
            { value: 'Service', label: 'Entretien' },
            { value: 'Parts', label: 'Pièces' },
            { value: 'Insurance', label: 'Assurance' },
            { value: 'Registration', label: 'Immatriculation' },
            { value: 'Charging', label: 'Recharge' },
            { value: 'Tools', label: 'Outils' },
        ]
    },
    {
        id: 'label',
        label: 'Étiquette',
        type: 'multiselect',
        category: 'FOURNISSEUR' as any,
        options: [
            { value: 'Sample', label: 'Exemple' },
            { value: 'Preferred', label: 'Préféré' },
            { value: 'Emergency', label: 'Urgence' },
        ]
    },
    { id: 'search', label: 'Recherche', type: 'text', category: 'FOURNISSEUR' as any },
];
