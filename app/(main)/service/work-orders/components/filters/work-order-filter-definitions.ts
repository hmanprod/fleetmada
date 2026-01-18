import { FilterField } from "../../../../inspections/components/filters/filter-definitions";

export const WORK_ORDER_FILTER_FIELDS: FilterField[] = [
    {
        id: 'status',
        label: 'Statut',
        type: 'enum',
        category: 'Statut',
        options: [
            { value: 'SCHEDULED', label: 'Programmé' },
            { value: 'IN_PROGRESS', label: 'En cours' },
            { value: 'COMPLETED', label: 'Terminé' },
            { value: 'CANCELLED', label: 'Annulé' }
        ]
    },
    {
        id: 'priority',
        label: 'Priorité',
        type: 'enum',
        category: 'Statut',
        options: [
            { value: 'LOW', label: 'Faible' },
            { value: 'MEDIUM', label: 'Moyen' },
            { value: 'HIGH', label: 'Élevé' },
            { value: 'CRITICAL', label: 'Critique' }
        ]
    },
    {
        id: 'vehicleId',
        label: 'Véhicule',
        type: 'enum',
        category: 'Véhicule',
        options: [] // To be populated dynamically
    },
    {
        id: 'assignedTo',
        label: 'Assigné à',
        type: 'enum',
        category: 'Assignation',
        options: [] // To be populated dynamically
    },
    {
        id: 'date',
        label: 'Date programmée',
        type: 'date',
        category: 'Dates'
    }
];
