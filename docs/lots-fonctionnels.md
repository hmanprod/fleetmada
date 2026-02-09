# Segmentation des fonctionnalités en lots fonctionnels — FleetMada

## Objectif

Découper l’application en **lots fonctionnels livrables** (vertical slices) afin de faciliter la planification (roadmap/sprints), le cadrage (MVP vs V2), la QA et le déploiement progressif.

## Périmètre (constaté dans le code)

- **UI** : routes Next.js App Router dans `app/(auth)` et `app/(main)` (pages `page.tsx`).
- **API** : endpoints REST dans `app/api/**` (fichiers `route.ts`).
- **Données** : modèles Prisma dans `prisma/schema.prisma` (référence pour les entités).

> Note : le `middleware.ts` bloque actuellement l’accès aux routes UI `/documents` et `/reports` (redirigées vers `/`). Prévoir un ajustement si ces modules doivent être exposés.

## Principes de découpage

- Un **lot** = une unité de valeur utilisateur testable de bout en bout (**UI + API + DB + règles**).
- Minimiser les dépendances entre lots ; quand une dépendance existe, la rendre explicite.
- Définir un **Definition of Done** identique pour tous les lots (voir section dédiée).

## Vue d’ensemble (lots proposés)

| Lot | Nom | Valeur métier | Dépendances |
|---:|---|---|---|
| 0 | Socle (auth, onboarding, settings) | Accès sécurisé + configuration tenant/utilisateur | — |
| 1 | Référentiel flotte (véhicules + compteurs) | Base de tout suivi (actifs, usage, historique) | 0 |
| 2 | Contacts & assignations | Savoir “qui conduit quoi” + annuaire | 0, 1 |
| 3 | Carburant & recharge | Suivre dépenses énergie + historiques | 0, 1, (2 recommandé) |
| 4 | Dépenses véhicule | Centraliser coûts hors carburant/maintenance | 0, 1 |
| 5 | Maintenance & services (work orders, programmes) | Préventif/correctif + traçabilité des interventions | 0, 1, 9 recommandé |
| 6 | Rappels & conformité (renouvellements) | Éviter immobilisation/non-conformité | 0, 1 |
| 7 | Inspections (templates, planning, exécution) | Standardiser contrôles + conformité | 0, 1 |
| 8 | Problèmes/Issues (assignation, statut, médias) | Suivi des incidents et résolution | 0, 1, 2 recommandé |
| 9 | Pièces, stocks & fournisseurs | Maîtrise pièces/appro, alertes stock, référentiel vendors | 0 |
| 10 | Sites & géolocalisation (places) | Gestion des sites + cartes (Google Maps) | 0 |
| 11 | Documents | Centraliser pièces jointes et recherche | 0, (10 optionnel) |
| 12 | Tableaux de bord, rapports & notifications | Pilotage + export/partage + alerting | 0 + lots “données” (1→11) |

---

## Lot 0 — Socle (auth, onboarding, settings)

**But** : sécuriser l’accès, initialiser l’entreprise, permettre la gestion du profil et des réglages.

- **UI (exemples)** : `/login`, `/register`, `/onboarding`, `/settings/general`, `/settings/user-profile`, `/settings/login-password`, `/settings/groups`, `/settings/parts/*`
- **API** : `/api/auth/*`, `/api/onboarding/company`, `/api/profile`, `/api/settings/*`, `/api/groups/*`, `/api/test-auth`
- **Entités clés** : `User`, `Company`, `BlacklistedToken`, `UserPreferences`, `SecuritySettings`, `CompanySettings`, `SystemSettings`, `UserSession`
- **Points d’attention** : JWT + blacklist (logout / check blacklist / clean expired tokens).

## Lot 1 — Référentiel flotte (véhicules + compteurs)

**But** : CRUD véhicules + suivi d’utilisation (compteurs) + artefacts (photos/commentaires).

- **UI** : `/vehicles/list` (+ `create`, `[id]`, `[id]/edit`), `/vehicles/meter-history`, `/vehicles/replacement`
- **API** : `/api/vehicles/*`, `/api/vehicles/[id]/meter-entries/*`, `/api/vehicles/[id]/meter-history`, `/api/meter-entries`
- **Entités clés** : `Vehicle`, `MeterEntry`, `Photo`, `Comment`
- **Inclus** : commentaires & médias côté véhicule (`/api/vehicles/[id]/comments/*`, `/api/vehicles/[id]/photos/*`).

## Lot 2 — Contacts & assignations

**But** : répertoire + assignations conducteur ↔ véhicule (historisées).

- **UI** : `/contacts` (+ `create`, `[id]`, `[id]/edit`), `/vehicles/assignments`
- **API** : `/api/contacts/*`, `/api/assignments`, `/api/vehicles/[id]/assignments`
- **Entités clés** : `Contact`, `VehicleAssignment` (ou équivalent), `Group` (si utilisé pour segmenter)

## Lot 3 — Carburant & recharge

**But** : saisir et analyser la consommation/dépense énergie (thermique + électrique).

- **UI** : `/fuel/history` (+ `create`, `[id]`, `[id]/edit`), `/fuel/charging` (+ `create`, `[id]`, `[id]/edit`)
- **API** : `/api/fuel/entries/*`, `/api/charging/entries/*`, `/api/vehicles/[id]/fuel-entries`
- **Entités clés** : `FuelEntry`, `ChargingEntry`
- **Sorties attendues** : stats (endpoints `*/stats`) + historiques par véhicule.

## Lot 4 — Dépenses véhicule (hors fuel/charge)

**But** : capturer les coûts divers (péage, assurance, divers, etc.) et les rattacher au véhicule.

- **UI** : `/vehicles/expense` (+ `create`, `[id]`, `[id]/edit`)
- **API** : `/api/expenses/*`, `/api/vehicles/[id]/expenses/*`
- **Entités clés** : `ExpenseEntry`

## Lot 5 — Maintenance & services (work orders, programmes)

**But** : gérer les interventions, tâches standard, bons de travail, programmes préventifs et historique.

- **UI** : `/service` (hub), `/service/history` (+ `create`, `[id]`, `[id]/edit`), `/service/work-orders` (+ `create`, `[id]`, `[id]/edit`), `/service/tasks` (+ `create`), `/service/programs` (+ `create`, `[id]`, `[id]/edit`, `[id]/vehicles/add`)
- **API (socle service)** : `/api/service/entries/*`, `/api/service/tasks`, `/api/service/programs`, `/api/service/reminders/*`
- **API (rattaché véhicule)** : `/api/vehicles/[id]/service-history`, `/api/vehicles/[id]/work-orders`, `/api/vehicles/[id]/parts`, `/api/vehicles/[id]/service-reminders`
- **Entités clés** : `ServiceEntry`, `ServiceTask`, `ServiceProgram`, `ServiceReminder`, `WorkOrder`, `ProgramVehicle`
- **Inclus** : commentaires & médias sur interventions (`/api/service/entries/[id]/comments/*`, `/api/service/entries/[id]/photos/*`).

## Lot 6 — Rappels & conformité (renouvellements)

**But** : piloter les échéances (renouvellements administratifs) + vues dédiées de traitement.

- **UI** : `/reminders/service` (+ `create`, `[id]`, `[id]/edit`), `/reminders/vehicle-renewals` (+ `create`, `[id]`, `[id]/edit`)
- **API** : `/api/vehicle-renewals/*`, `/api/vehicle-renewals/[id]/complete`, `/api/vehicles/[id]/renewals`
- **Entités clés** : `VehicleRenewal`

## Lot 7 — Inspections (templates, planning, exécution)

**But** : définir des templates, planifier des inspections, exécuter et historiser les résultats.

- **UI** : `/inspections` (hub), `/inspections/forms` (+ `create`, `[id]/edit`, `[id]/start`), `/inspections/schedules`, `/inspections/history` (+ `create`, `[id]`, `[id]/edit`)
- **API** : `/api/inspection-templates/*` (items, duplicate, schedules), `/api/inspection-schedules`, `/api/inspections/*` (start, cancel, results, items), `/api/vehicles/[id]/inspections`
- **Entités clés** : `InspectionTemplate`, `InspectionSchedule`, `Inspection`

## Lot 8 — Problèmes / Issues (collaboration)

**But** : signaler un problème, l’assigner, suivre statut/échanges et conserver les médias.

- **UI** : `/issues` (+ `create`, `[id]`, `[id]/edit`)
- **API** : `/api/issues/*` (status, assign, comments, images), `/api/vehicles/[id]/issues`
- **Entités clés** : `Issue`, `Comment`, `Photo` (ou `IssueImage`)

## Lot 9 — Pièces, stocks & fournisseurs

**But** : référentiel pièces, niveaux de stock multi-lieux, alertes, et gestion des fournisseurs.

- **UI** : `/parts` (+ `create`, `[id]`, `[id]/edit`), `/vendors` (+ `create`, `[id]`, `[id]/edit`), `/settings/parts/categories`, `/settings/parts/manufacturers`, `/settings/parts/locations`
- **API (parts)** : `/api/parts/*` (stats, categories, manufacturers, low-stock, usage-analytics, adjust-stock, reorder, stock-history, locations)
- **API (vendors)** : `/api/vendors/*`
- **Entités clés** : `Part`, `PartCategory`, `PartManufacturer`, `PartLocation`, `PartStock*`, `Vendor`

## Lot 10 — Sites & géolocalisation (places)

**But** : gérer les sites opérationnels et offrir la recherche / géocodage.

- **UI** : `/places` (+ `create`, `[id]`, `[id]/edit`)
- **API** : `/api/places/*` (geocode, reverse-geocode, nearby, search)
- **Entités clés** : `Place`
- **Intégration** : Google Maps (clés côté serveur et côté client, cf. `README.md`).

## Lot 11 — Documents

**But** : upload, consultation, téléchargement, recherche.

- **UI** : `/documents`, `/documents/upload`, `/documents/[id]`
- **API** : `/api/documents/*` (upload, download, search, by-attachment)
- **Entités clés** : `Document` (+ éventuelles relations d’attachements)

## Lot 12 — Tableaux de bord, rapports & notifications

**But** : piloter (KPI), produire des rapports (export/partage) et notifier.

- **UI** : `/dashboard`, `/reports`
- **API (dashboard)** : `/api/dashboard/*` (overview, vehicles, maintenance, fuel, costs, inspections, issues, parts…)
- **API (rapports)** : `/api/reports/*` (generate, export, share, favorite)
- **API (notifications)** : `/api/notifications`
- **Entités clés** : `Report`, `Notification`
- **Dépendances** : nécessite des données alimentées par les lots 1→11 (au minimum véhicules + fuel + maintenance pour un dashboard “V1”).

---

## Definition of Done (DoD) recommandé (par lot)

1. **UI** : parcours principal complet (liste → création → détail → édition/suppression si prévu).
2. **API** : endpoints CRUD + validations + codes d’erreur cohérents.
3. **DB** : migrations Prisma ok + contraintes (unicité, index, relations).
4. **Sécurité** : routes protégées, contrôle d’accès de base (au minimum “utilisateur connecté”).
5. **Qualité** : un jeu de tests E2E Playwright ciblés sur le parcours principal du lot.

