# QA Modules

Ce document est la référence “module-first” pour lancer `npm run qa:audit` module par module, itérer et obtenir des rapports dédiés.

## Commandes (template)

```bash
# Itération standard (vert/rouge)
npm run qa:audit -- --module <id> --strict

# Plus rapide (infra déjà OK)
npm run qa:audit -- --module <id> --skip-setup --strict

# Playwright uniquement
npm run qa:audit -- --module <id> --skip-explore --strict
```

## Modules disponibles

| Id | Label | Areas (`qa/routes.ts`) | Playwright files |
|---|---|---|---|
| auth | Authentification | auth | tests/login-onboarding.spec.ts, tests/registration-flow.spec.ts |
| dashboard | Tableau de bord | dashboard | tests/dashboard.spec.ts |
| vehicles | Véhicules | vehicles | tests/vehicles.spec.ts, tests/vehicle-filters.spec.ts, tests/assignments-persistence.spec.ts |
| inspections | Inspections | inspections | tests/inspections.spec.ts |
| service | Entretien | service | tests/service.spec.ts |
| issues | Problèmes | issues | tests/issues.spec.ts |
| fuel | Carburant | fuel | tests/fuel.spec.ts |
| parts | Pièces | parts | tests/setup/parts-seed.setup.ts, tests/parts.spec.ts |
| places | Sites | places | tests/places.spec.ts |
| contacts | Contacts | contacts | tests/contacts.spec.ts |
| vendors | Fournisseurs | vendors | tests/vendors.spec.ts |
| reminders | Rappels | reminders | tests/reminders.spec.ts |
| settings | Paramètres | settings | tests/settings.spec.ts |
| documents | Documents | documents | tests/documents.spec.ts |
| reports | Rapports | reports | tests/reports.spec.ts |

## Exemples rapides

```bash
npm run qa:audit -- --module vehicles --strict
npm run qa:audit -- --modules vehicles,fuel --strict
npm run qa:audit -- --all --strict --bail
```

## Où trouver les rapports

- Index du run: `qa/audits/<YYYY-MM-DD>/<runId>/index.md`
- Rapport d’un module: `qa/audits/<YYYY-MM-DD>/<moduleId>/<runId>/report.md`
