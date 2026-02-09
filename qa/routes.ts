export type UserRole = 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'DRIVER';

export type QARoute = {
  path: string;
  area:
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
  allowedRoles: UserRole[];
  destructive?: boolean;
};

// Intentionally conservative: we include only known "safe to open" pages.
// Create/Edit pages are marked destructive=false but we do not submit forms in automation.
export const QA_ROUTES: QARoute[] = [
  { path: '/login', area: 'auth', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'DRIVER'] },
  { path: '/register', area: 'auth', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'DRIVER'] },
  { path: '/onboarding', area: 'auth', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'DRIVER'] },

  { path: '/', area: 'dashboard', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'DRIVER'] },
  { path: '/dashboard', area: 'dashboard', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'DRIVER'] },

  { path: '/vehicles/list', area: 'vehicles', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'DRIVER'] },
  { path: '/vehicles/list/create', area: 'vehicles', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'DRIVER'] },
  { path: '/vehicles/assignments', area: 'vehicles', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
  { path: '/vehicles/meter-history', area: 'vehicles', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
  { path: '/vehicles/expense', area: 'vehicles', allowedRoles: ['ADMIN', 'MANAGER'] },
  { path: '/vehicles/expense/create', area: 'vehicles', allowedRoles: ['ADMIN', 'MANAGER'] },
  { path: '/vehicles/replacement', area: 'vehicles', allowedRoles: ['ADMIN', 'MANAGER'] },

  { path: '/inspections', area: 'inspections', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'DRIVER'] },
  { path: '/inspections/history', area: 'inspections', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'DRIVER'] },
  { path: '/inspections/history/create', area: 'inspections', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'DRIVER'] },
  { path: '/inspections/schedules', area: 'inspections', allowedRoles: ['ADMIN', 'MANAGER'] },
  { path: '/inspections/forms', area: 'inspections', allowedRoles: ['ADMIN', 'MANAGER'] },
  { path: '/inspections/forms/create', area: 'inspections', allowedRoles: ['ADMIN', 'MANAGER'] },

  { path: '/service', area: 'service', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
  { path: '/service/history', area: 'service', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
  { path: '/service/history/create', area: 'service', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
  { path: '/service/work-orders', area: 'service', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
  { path: '/service/work-orders/create', area: 'service', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
  { path: '/service/tasks', area: 'service', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
  { path: '/service/tasks/create', area: 'service', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
  { path: '/service/programs', area: 'service', allowedRoles: ['ADMIN', 'MANAGER'] },
  { path: '/service/programs/create', area: 'service', allowedRoles: ['ADMIN', 'MANAGER'] },

  { path: '/issues', area: 'issues', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'DRIVER'] },
  { path: '/issues/create', area: 'issues', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'DRIVER'] },

  { path: '/fuel/history', area: 'fuel', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'DRIVER'] },
  { path: '/fuel/history/create', area: 'fuel', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'DRIVER'] },
  { path: '/fuel/charging', area: 'fuel', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'DRIVER'] },
  { path: '/fuel/charging/create', area: 'fuel', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'DRIVER'] },

  { path: '/parts', area: 'parts', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
  { path: '/parts/create', area: 'parts', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },

  { path: '/places', area: 'places', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
  { path: '/places/create', area: 'places', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },

  { path: '/contacts', area: 'contacts', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
  { path: '/contacts/create', area: 'contacts', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },

  { path: '/vendors', area: 'vendors', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
  { path: '/vendors/create', area: 'vendors', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },

  { path: '/reminders/service', area: 'reminders', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
  { path: '/reminders/service/create', area: 'reminders', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
  { path: '/reminders/vehicle-renewals', area: 'reminders', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
  { path: '/reminders/vehicle-renewals/create', area: 'reminders', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },

  { path: '/settings/general', area: 'settings', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'DRIVER'] },
  { path: '/settings/user-profile', area: 'settings', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'DRIVER'] },
  { path: '/settings/login-password', area: 'settings', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'DRIVER'] },
  { path: '/settings/groups', area: 'settings', allowedRoles: ['ADMIN', 'MANAGER'] },

  // Known special-case: middleware currently blocks these non-API routes.
  { path: '/documents', area: 'documents', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'DRIVER'] },
  { path: '/reports', area: 'reports', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'DRIVER'] },
];

// Small “V1 pillars” subset (from docs/product-vision.md) for lightweight snapshots during QA exploration.
export const QA_ROUTES_CORE: QARoute[] = [
  { path: '/dashboard', area: 'dashboard', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'DRIVER'] },
  { path: '/vehicles/list', area: 'vehicles', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'DRIVER'] },
  { path: '/fuel/history', area: 'fuel', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'DRIVER'] },
  { path: '/fuel/charging', area: 'fuel', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'DRIVER'] },
  { path: '/service', area: 'service', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
  { path: '/reminders/service', area: 'reminders', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
  { path: '/reminders/vehicle-renewals', area: 'reminders', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
  { path: '/settings/general', area: 'settings', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'DRIVER'] },
  // Known special-case: middleware blocks these (likely conflicts with Compliance Guard intent).
  { path: '/documents', area: 'documents', allowedRoles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'DRIVER'] },
];

export function routesForRole(role: UserRole): QARoute[] {
  return QA_ROUTES.filter(r => r.allowedRoles.includes(role));
}

export function coreRoutesForRole(role: UserRole): QARoute[] {
  return QA_ROUTES_CORE.filter(r => r.allowedRoles.includes(role));
}
