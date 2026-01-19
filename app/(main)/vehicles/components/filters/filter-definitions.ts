export type FilterCategory = 'VÉHICULE' | 'LECTURE COMPTEUR' | 'AFFECTATION' | 'PROBLÈME' | 'DÉPENSE';

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
    // METER ENTRY CATEGORY
    { id: 'date', label: 'Date du compteur', type: 'date', category: 'LECTURE COMPTEUR' },
    { id: 'value', label: 'Valeur du compteur', type: 'number', category: 'LECTURE COMPTEUR' },
    {
        id: 'type',
        label: 'Type de compteur',
        type: 'enum',
        category: 'LECTURE COMPTEUR',
        options: [
            { value: 'MILEAGE', label: 'Kilométrage' },
            { value: 'HOURS', label: 'Heures' },
        ]
    },
    {
        id: 'void',
        label: 'Statut d\'annulation',
        type: 'enum',
        category: 'LECTURE COMPTEUR',
        options: [
            { value: 'true', label: 'Annulé' },
            { value: 'false', label: 'Actif' },
        ]
    },
    { id: 'source', label: 'Source', type: 'text', category: 'LECTURE COMPTEUR' },
    { id: 'createdAt', label: 'Créé le', type: 'date', category: 'LECTURE COMPTEUR' },
    { id: 'updatedAt', label: 'Mis à jour le', type: 'date', category: 'LECTURE COMPTEUR' },

    // VEHICLE CATEGORY
    {
        id: 'status', label: 'Statut du véhicule', type: 'enum', category: 'VÉHICULE', options: [
            { value: 'ACTIVE', label: 'Actif' },
            { value: 'INACTIVE', label: 'Inactif' },
            { value: 'MAINTENANCE', label: 'En atelier' },
            { value: 'DISPOSED', label: 'Hors service' },
        ]
    },
    { id: 'name', label: 'Nom du véhicule', type: 'text', category: 'VÉHICULE' },
    { id: 'vin', label: 'VIN', type: 'text', category: 'VÉHICULE' },
    { id: 'licensePlate', label: 'Plaque d\'immatriculation', type: 'text', category: 'VÉHICULE' },
    { id: 'make', label: 'Marque', type: 'text', category: 'VÉHICULE' },
    { id: 'model', label: 'Modèle', type: 'text', category: 'VÉHICULE' },
    { id: 'year', label: 'Année', type: 'number', category: 'VÉHICULE' },
    { id: 'group', label: 'Groupe', type: 'text', category: 'VÉHICULE' },
    { id: 'operator', label: 'Opérateur', type: 'text', category: 'VÉHICULE' },
    { id: 'type', label: 'Type de véhicule', type: 'text', category: 'VÉHICULE' },
    {
        id: 'ownership',
        label: 'Propriété',
        type: 'enum',
        category: 'VÉHICULE',
        options: [
            { value: 'Owned', label: 'Propriétaire' },
            { value: 'Leased', label: 'Bail (Leasing)' },
            { value: 'Rented', label: 'Loué' },
            { value: 'Customer', label: 'Client' },
        ]
    },
    { id: 'meterReading', label: 'Valeur actuelle du compteur', type: 'number', category: 'VÉHICULE' },

    // ASSIGNMENT CATEGORY
    { id: 'startDate', label: 'Début de l\'affectation', type: 'date', category: 'AFFECTATION' },
    { id: 'endDate', label: 'Fin de l\'affectation', type: 'date', category: 'AFFECTATION' },
    { id: 'operator', label: 'Opérateur affecté', type: 'text', category: 'AFFECTATION' },
    {
        id: 'status',
        label: 'Statut de l\'affectation',
        type: 'enum',
        category: 'AFFECTATION',
        options: [
            { value: 'ACTIVE', label: 'Actif' },
            { value: 'INACTIVE', label: 'Inactif' },
            { value: 'TEMPORARY', label: 'Temporaire' },
        ]
    },

    // EXPENSE CATEGORY
    { id: 'date', label: 'Date de la dépense', type: 'date', category: 'DÉPENSE' },
    { id: 'type', label: 'Type de dépense', type: 'text', category: 'DÉPENSE' },
    { id: 'vendor', label: '', type: 'text', category: 'DÉPENSE' },
    { id: 'amount', label: 'Montant', type: 'number', category: 'DÉPENSE' },
    { id: 'source', label: 'Source', type: 'text', category: 'DÉPENSE' },
];

export const METER_HISTORY_FIELDS = ALL_FILTER_FIELDS.filter(f =>
    f.category === 'LECTURE COMPTEUR' || (f.category === 'VÉHICULE' && ['status', 'group', 'operator', 'name', 'vin', 'make', 'model', 'year'].includes(f.id))
);

export const VEHICLE_LIST_FIELDS = ALL_FILTER_FIELDS.filter(f => f.category === 'VÉHICULE');

export const ASSIGNMENT_FIELDS = ALL_FILTER_FIELDS.filter(f =>
    f.category === 'AFFECTATION' || (f.category === 'VÉHICULE' && ['status', 'group', 'operator', 'name', 'vin', 'type'].includes(f.id))
);

export const EXPENSE_FIELDS = ALL_FILTER_FIELDS.filter(f =>
    f.category === 'DÉPENSE' || (f.category === 'VÉHICULE' && ['status', 'group', 'name', 'vin'].includes(f.id))
);
