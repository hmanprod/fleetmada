import { FilterField } from '../../../../inspections/components/filters/filter-definitions';

export const SERVICE_REMINDER_FILTER_FIELDS: FilterField[] = [
    {
        id: 'status',
        label: 'Statut',
        type: 'enum',
        category: 'SERVICE_REMINDER' as any,
        options: [
            { value: 'ACTIVE', label: 'Actif' },
            { value: 'OVERDUE', label: 'En retard' },
            { value: 'DISMISSED', label: 'Ignoré / reporté' },
            { value: 'COMPLETED', label: 'Terminé' },
        ]
    },
    {
        id: 'priority',
        label: 'Priorité',
        type: 'enum',
        category: 'SERVICE_REMINDER' as any,
        options: [
            { value: 'NORMAL', label: 'Normale' },
            { value: 'SOON', label: 'Bientôt dû' },
            { value: 'OVERDUE', label: 'En retard' },
        ]
    },
    { id: 'nextDue', label: 'Prochaine échéance', type: 'date', category: 'SERVICE_REMINDER' as any },
    { id: 'task', label: 'Tâche d’entretien', type: 'text', category: 'SERVICE_REMINDER' as any },
    { id: 'vehicleId', label: 'Véhicule', type: 'enum', category: 'SERVICE_REMINDER' as any },
];
