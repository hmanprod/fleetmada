export type FilterCategory = 'INSPECTION' | 'MODÈLE';

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
    // CATÉGORIE INSPECTION
    {
        id: 'status',
        label: 'Statut',
        type: 'enum',
        category: 'INSPECTION',
        options: [
            { value: 'DRAFT', label: 'Brouillon' },
            { value: 'SCHEDULED', label: 'Planifié' },
            { value: 'IN_PROGRESS', label: 'En cours' },
            { value: 'COMPLETED', label: 'Terminé' },
            { value: 'CANCELLED', label: 'Annulé' },
        ]
    },
    {
        id: 'complianceStatus',
        label: 'État de conformité',
        type: 'enum',
        category: 'INSPECTION',
        options: [
            { value: 'COMPLIANT', label: 'Conforme' },
            { value: 'NON_COMPLIANT', label: 'Non conforme' },
            { value: 'PENDING_REVIEW', label: 'En attente de révision' },
        ]
    },
    { id: 'scheduledDate', label: 'Date planifiée', type: 'date', category: 'INSPECTION' },
    { id: 'startedAt', label: 'Date de début', type: 'date', category: 'INSPECTION' },
    { id: 'completedAt', label: 'Date de fin', type: 'date', category: 'INSPECTION' },
    { id: 'inspectorName', label: 'Nom de l\'inspecteur', type: 'text', category: 'INSPECTION' },
    { id: 'overallScore', label: 'Score', type: 'number', category: 'INSPECTION' },
    { id: 'title', label: 'Titre', type: 'text', category: 'INSPECTION' },
    { id: 'location', label: 'Emplacement', type: 'text', category: 'INSPECTION' },

    // CATÉGORIE MODÈLE
    { id: 'name', label: 'Nom du modèle', type: 'text', category: 'MODÈLE' },
    { id: 'category', label: 'Catégorie', type: 'text', category: 'MODÈLE' },
    {
        id: 'isActive',
        label: 'État actif',
        type: 'boolean',
        category: 'MODÈLE',
        options: [
            { value: 'true', label: 'Actif' },
            { value: 'false', label: 'Inactif' }
        ]
    },
    { id: 'description', label: 'Description', type: 'text', category: 'MODÈLE' },
];

export const INSPECTION_HISTORY_FIELDS = ALL_FILTER_FIELDS.filter(f => f.category === 'INSPECTION');
export const INSPECTION_SCHEDULE_FIELDS = ALL_FILTER_FIELDS.filter(f => f.category === 'INSPECTION' && f.id !== 'completedAt' && f.id !== 'startedAt' && f.id !== 'overallScore' && f.id !== 'complianceStatus');
export const TEMPLATE_FIELDS = ALL_FILTER_FIELDS.filter(f => f.category === 'MODÈLE');
