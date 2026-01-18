import { FilterField } from '../../../inspections/components/filters/filter-definitions';

export const ISSUE_FILTER_FIELDS: FilterField[] = [
    {
        id: 'status',
        label: 'Statut',
        type: 'enum',
        category: 'PROBLÈME' as any,
        options: [
            { value: 'OPEN', label: 'Ouvert' },
            { value: 'IN_PROGRESS', label: 'En cours' },
            { value: 'RESOLVED', label: 'Résolu' },
            { value: 'CLOSED', label: 'Fermé' },
        ]
    },
    {
        id: 'priority',
        label: 'Priorité',
        type: 'enum',
        category: 'PROBLÈME' as any,
        options: [
            { value: 'LOW', label: 'Faible' },
            { value: 'MEDIUM', label: 'Moyen' },
            { value: 'HIGH', label: 'Élevé' },
            { value: 'CRITICAL', label: 'Critique' },
        ]
    },
    { id: 'reportedDate', label: 'Date de signalement', type: 'date', category: 'PROBLÈME' as any },
    { id: 'summary', label: 'Résumé', type: 'text', category: 'PROBLÈME' as any },
    { id: 'assignedTo', label: 'Assigné à', type: 'enum', category: 'PROBLÈME' as any },
    { id: 'labels', label: 'Étiquettes', type: 'multiselect', category: 'PROBLÈME' as any },
    { id: 'groupId', label: 'Groupe', type: 'enum', category: 'PROBLÈME' as any },
    { id: 'vehicleId', label: 'Véhicule', type: 'enum', category: 'PROBLÈME' as any },
];
