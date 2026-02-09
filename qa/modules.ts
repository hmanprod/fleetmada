import type { QARoute, UserRole } from './routes';

export type QAModuleId =
  | 'auth'
  | 'dashboard'
  | 'vehicles'
  | 'inspections'
  | 'service'
  | 'issues'
  | 'fuel'
  | 'parts'
  | 'places'
  | 'contacts'
  | 'vendors'
  | 'reminders'
  | 'settings'
  | 'documents'
  | 'reports';

export type QAModule = {
  id: QAModuleId;
  label: string;
  areas: QARoute['area'][];
  playwrightFiles: string[];
  /**
   * Optional: restrict which roles are relevant for this module.
   * If omitted, the CLI `--roles` value is used.
   */
  roles?: UserRole[];
};

export const QA_MODULES: QAModule[] = [
  {
    id: 'auth',
    label: 'Authentification',
    areas: ['auth'],
    playwrightFiles: ['tests/login-onboarding.spec.ts', 'tests/registration-flow.spec.ts'],
  },
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    areas: ['dashboard'],
    playwrightFiles: ['tests/dashboard.spec.ts'],
  },
  {
    id: 'vehicles',
    label: 'Véhicules',
    areas: ['vehicles'],
    playwrightFiles: [
      'tests/vehicles.spec.ts',
      'tests/vehicle-filters.spec.ts',
      'tests/assignments-persistence.spec.ts',
    ],
  },
  {
    id: 'inspections',
    label: 'Inspections',
    areas: ['inspections'],
    playwrightFiles: ['tests/inspections.spec.ts'],
  },
  {
    id: 'service',
    label: 'Entretien',
    areas: ['service'],
    playwrightFiles: ['tests/service.spec.ts'],
  },
  {
    id: 'issues',
    label: 'Problèmes',
    areas: ['issues'],
    playwrightFiles: ['tests/issues.spec.ts'],
  },
  {
    id: 'fuel',
    label: 'Carburant',
    areas: ['fuel'],
    playwrightFiles: ['tests/fuel.spec.ts'],
  },
  {
    id: 'parts',
    label: 'Pièces',
    areas: ['parts'],
    playwrightFiles: ['tests/setup/parts-seed.setup.ts', 'tests/parts.spec.ts'],
  },
  {
    id: 'places',
    label: 'Sites',
    areas: ['places'],
    playwrightFiles: ['tests/places.spec.ts'],
  },
  {
    id: 'contacts',
    label: 'Contacts',
    areas: ['contacts'],
    playwrightFiles: ['tests/contacts.spec.ts'],
  },
  {
    id: 'vendors',
    label: 'Fournisseurs',
    areas: ['vendors'],
    playwrightFiles: ['tests/vendors.spec.ts'],
  },
  {
    id: 'reminders',
    label: 'Rappels',
    areas: ['reminders'],
    playwrightFiles: ['tests/reminders.spec.ts'],
  },
  {
    id: 'settings',
    label: 'Paramètres',
    areas: ['settings'],
    playwrightFiles: ['tests/settings.spec.ts'],
  },
  {
    id: 'documents',
    label: 'Documents',
    areas: ['documents'],
    playwrightFiles: ['tests/documents.spec.ts'],
  },
  {
    id: 'reports',
    label: 'Rapports',
    areas: ['reports'],
    playwrightFiles: ['tests/reports.spec.ts'],
  },
];

export function getModuleById(id: string): QAModule | undefined {
  return QA_MODULES.find(m => m.id === id);
}

export function listModuleIds(): QAModuleId[] {
  return QA_MODULES.map(m => m.id);
}
