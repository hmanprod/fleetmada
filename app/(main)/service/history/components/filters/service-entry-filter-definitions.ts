import { FilterField } from '../../../../inspections/components/filters/filter-definitions';

export const SERVICE_ENTRY_FILTER_FIELDS: FilterField[] = [
    {
        id: 'status',
        label: 'Statut',
        type: 'enum',
        category: 'SERVICE' as any,
        options: [
            { value: 'SCHEDULED', label: 'Programmé' },
            { value: 'IN_PROGRESS', label: 'En cours' },
            { value: 'COMPLETED', label: 'Terminé' },
            { value: 'CANCELLED', label: 'Annulé' },
        ]
    },
    {
        id: 'priority',
        label: 'Priorité',
        type: 'enum',
        category: 'SERVICE' as any,
        options: [
            { value: 'LOW', label: 'Faible' },
            { value: 'MEDIUM', label: 'Moyen' },
            { value: 'HIGH', label: 'Élevé' },
            { value: 'CRITICAL', label: 'Critique' },
        ]
    },
    { id: 'date', label: 'Date', type: 'date', category: 'SERVICE' as any },
    { id: 'vehicleId', label: 'Véhicule', type: 'enum', category: 'SERVICE' as any },
    { id: 'vendorId', label: 'Fournisseur', type: 'enum', category: 'SERVICE' as any },
];
