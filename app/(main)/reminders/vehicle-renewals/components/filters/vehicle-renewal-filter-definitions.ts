import { FilterField } from '../../../../inspections/components/filters/filter-definitions';

export const VEHICLE_RENEWAL_FILTER_FIELDS: FilterField[] = [
    {
        id: 'status',
        label: 'Statut',
        type: 'enum',
        category: 'VEHICLE_RENEWAL' as any,
        options: [
            { value: 'DUE', label: 'À échéance' },
            { value: 'OVERDUE', label: 'En retard' },
            { value: 'COMPLETED', label: 'Terminé' },
            { value: 'DISMISSED', label: 'Ignoré' },
        ]
    },
    {
        id: 'type',
        label: 'Type de renouvellement',
        type: 'enum',
        category: 'VEHICLE_RENEWAL' as any,
        options: [
            { value: 'REGISTRATION', label: 'Immatriculation' },
            { value: 'INSURANCE', label: 'Assurance' },
            { value: 'INSPECTION', label: 'Inspection' },
            { value: 'EMISSION_TEST', label: 'Contrôle anti-pollution' },
            { value: 'OTHER', label: 'Autre' },
        ]
    },
    {
        id: 'priority',
        label: 'Priorité',
        type: 'enum',
        category: 'VEHICLE_RENEWAL' as any,
        options: [
            { value: 'LOW', label: 'Faible' },
            { value: 'MEDIUM', label: 'Moyenne' },
            { value: 'HIGH', label: 'Haute' },
            { value: 'CRITICAL', label: 'Critique' },
        ]
    },
    { id: 'dueDate', label: 'Date d’échéance', type: 'date', category: 'VEHICLE_RENEWAL' as any },
    { id: 'title', label: 'Résumé', type: 'text', category: 'VEHICLE_RENEWAL' as any },
    { id: 'vehicleId', label: 'Véhicule', type: 'enum', category: 'VEHICLE_RENEWAL' as any },
];
