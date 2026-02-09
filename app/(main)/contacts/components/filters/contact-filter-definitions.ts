import { FilterField } from '../../../inspections/components/filters/filter-definitions';

export const CONTACT_FILTER_FIELDS: FilterField[] = [
    {
        id: 'status',
        label: 'Statut',
        type: 'enum',
        category: 'CONTACT' as any,
        options: [
            { value: 'ACTIVE', label: 'Actif' },
            { value: 'INACTIVE', label: 'Inactif' },
            { value: 'ARCHIVED', label: 'Archivé' },
        ]
    },
    {
        id: 'group',
        label: 'Groupe',
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
            { value: 'Operator', label: 'Opérateur' },
            { value: 'Technician', label: 'Technicien' },
            { value: 'Manager', label: 'Manager' },
            { value: 'Employee', label: 'Employé' },
            { value: 'Admin', label: 'Administrateur' },
            { value: 'Vendor', label: 'Fournisseur' },
        ]
    },
    {
        id: 'department',
        label: 'Département',
        type: 'text',
        category: 'CONTACT' as any,
    },
    {
        id: 'jobTitle',
        label: 'Intitulé du poste',
        type: 'text',
        category: 'CONTACT' as any,
    }
];
