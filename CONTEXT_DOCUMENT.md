# Document de Contexte - FleetMada

## 1. Vue d'ensemble de l'application

**FleetMada** est une application web complète de gestion de flotte automobile construite avec **Next.js 14** et **Prisma ORM**. Elle permet aux entreprises de gérer efficacement leurs véhicules, les services de maintenance, les inspections, les dépenses, et les renouvellements administratifs.

### Informations clés
- **Stack technologique**: Next.js 14, React 18, TypeScript, Prisma 5, PostgreSQL
- **Architecture**: Full-stack avec API REST et frontend React
- **Authentification**: JWT avec blacklist de tokens
- **Intégrations externes**: Google Maps API (géolocalisation, cartes, géocodage)
- **Déploiement**: Docker Compose (PostgreSQL)

---

## 2. Architecture technique

### 2.1 Structure du projet

```
fleetmada/
├── app/                          # Application Next.js (App Router)
│   ├── (auth)/                   # Routes d'authentification
│   │   ├── login/
│   │   ├── register/
│   │   └── onboarding/
│   ├── (main)/                   # Routes principales (protégées)
│   │   ├── dashboard/
│   │   ├── vehicles/
│   │   ├── service/
│   │   ├── inspections/
│   │   ├── issues/
│   │   ├── fuel/
│   │   ├── contacts/
│   │   ├── vendors/
│   │   ├── parts/
│   │   ├── places/
│   │   ├── documents/
│   │   ├── reports/
│   │   ├── reminders/
│   │   └── settings/
│   ├── api/                      # Routes API
│   │   ├── auth/                 # Authentification
│   │   ├── vehicles/             # Gestion des véhicules
│   │   ├── service/              # Gestion des services
│   │   ├── inspections/          # Gestion des inspections
│   │   ├── issues/               # Gestion des problèmes
│   │   ├── fuel/                 # Gestion du carburant
│   │   ├── charging/             # Gestion des recharges
│   │   ├── contacts/             # Gestion des contacts
│   │   ├── vendors/              # Gestion des fournisseurs
│   │   ├── parts/                # Gestion des pièces
│   │   ├── places/               # Gestion des sites
│   │   ├── documents/            # Gestion des documents
│   │   ├── reports/              # Génération de rapports
│   │   ├── notifications/        # Notifications
│   │   ├── dashboard/            # Données du dashboard
│   │   ├── settings/             # Paramètres
│   │   └── onboarding/           # Onboarding
│   ├── components/               # Composants React
│   ├── globals.css               # Styles globaux
│   ├── layout.tsx                # Layout principal
│   └── page.tsx                  # Page d'accueil
├── lib/                          # Utilitaires et services
│   ├── services/                 # Services métier
│   │   ├── vehicles-api.ts
│   │   ├── service-api.ts
│   │   ├── inspections-api.ts
│   │   ├── issues-api.ts
│   │   ├── fuel-api.ts
│   │   ├── charging-api.ts
│   │   ├── contacts-api.ts
│   │   ├── vendors-api.ts
│   │   ├── parts-api.ts
│   │   ├── places-api.ts
│   │   ├── documents-api.ts
│   │   ├── geocoding-service.ts
│   │   ├── notification-service.ts
│   │   ├── report-generator.ts
│   │   ├── reminder-generator.ts
│   │   └── export-service.ts
│   ├── hooks/                    # Hooks React personnalisés
│   ├── types/                    # Types TypeScript
│   ├── validations/              # Schémas de validation Zod
│   ├── auth-context.tsx          # Contexte d'authentification
│   ├── auth-api.ts               # Utilitaires d'authentification
│   ├── api-utils.ts              # Utilitaires API
│   └── prisma.ts                 # Client Prisma
├── prisma/
│   ├── schema.prisma             # Schéma de base de données
│   ├── seed-setup.ts             # Seed initial
│   └── seed-dev.ts               # Seed développement
├── middleware.ts                 # Middleware Next.js
├── types.ts                      # Types globaux
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── playwright.config.ts          # Configuration tests E2E
└── docker-compose.yml            # Configuration Docker
```

### 2.2 Stack technologique détaillé

**Frontend:**
- Next.js 14.1.0 (App Router)
- React 18
- TypeScript 5
- Tailwind CSS 3.3
- Lucide React (icônes)
- Recharts (graphiques)
- Zod (validation)

**Backend:**
- Next.js API Routes
- Prisma 5.0 (ORM)
- PostgreSQL (base de données)
- JWT (authentification)
- bcryptjs (hachage de mots de passe)

**Intégrations:**
- Google Maps API (géolocalisation, géocodage, cartes)
- jsPDF (génération de PDF)
- jsPDF AutoTable (tableaux PDF)

**Testing & DevOps:**
- Playwright (tests E2E)
- Docker Compose
- TypeScript (type checking)

---

## 3. Modèle de données

### 3.1 Entités principales

#### **User (Utilisateur)**
- Authentification et profil utilisateur
- Rôles: ADMIN, MANAGER, TECHNICIAN, DRIVER
- Relations: Véhicules, entrées de carburant, services, inspections, problèmes, notifications

#### **Company (Entreprise)**
- Informations de l'entreprise
- Paramètres de configuration
- Utilisateurs associés
- Documents et rapports

#### **Vehicle (Véhicule)**
- Informations complètes du véhicule (VIN, marque, modèle, année, type)
- Spécifications techniques (moteur, transmission, dimensions, poids)
- Statut: ACTIVE, INACTIVE, MAINTENANCE, DISPOSED
- Historique des compteurs (kilométrage, heures)
- Assignations d'opérateurs
- Relations: Entrées de carburant, services, inspections, problèmes, renouvellements

#### **ServiceEntry (Entrée de service)**
- Enregistrement des services effectués
- Statut: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
- Coûts, fournisseur, lieu
- Tâches associées et pièces utilisées
- Support des bons de travail (Work Orders)

#### **ServiceTask (Tâche de service)**
- Tâches de maintenance standardisées
- Codes de catégorie, système, assemblage
- Compteurs d'utilisation

#### **ServiceProgram (Programme de service)**
- Plans de maintenance préventive
- Fréquence et intervalle
- Tâches associées
- Véhicules assignés

#### **ServiceReminder (Rappel de service)**
- Rappels automatiques pour services dus
- Statut: ACTIVE, DISMISSED, COMPLETED, OVERDUE
- Seuils de temps et de compteur
- Notifications associées

#### **Inspection (Inspection)**
- Inspections de véhicules
- Templates d'inspection réutilisables
- Statut: DRAFT, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
- Résultats et conformité
- Support des photos et commentaires

#### **Issue (Problème)**
- Signalement de problèmes/défauts
- Statut: OPEN, IN_PROGRESS, RESOLVED, CLOSED
- Priorité: LOW, MEDIUM, HIGH, CRITICAL
- Assignation, commentaires, images
- Watchers et labels

#### **FuelEntry (Entrée de carburant)**
- Enregistrement des ravitaillements
- Coûts, volume, consommation
- Calcul MPG (miles par gallon)
- Fournisseur et lieu

#### **ChargingEntry (Entrée de recharge)**
- Enregistrement des recharges électriques
- Énergie (kWh), coût, durée
- Fournisseur et lieu

#### **ExpenseEntry (Entrée de dépense)**
- Dépenses diverses liées aux véhicules
- Type, montant, devise
- Fournisseur et source

#### **Contact (Contact)**
- Contacts (conducteurs, techniciens, fournisseurs)
- Statut: ACTIVE, INACTIVE, ARCHIVED
- Informations personnelles et professionnelles
- Assignations de véhicules
- Groupes de contacts

#### **Vendor (Fournisseur)**
- Fournisseurs de services (garages, stations essence, etc.)
- Informations de contact
- Classifications et labels

#### **Part (Pièce)**
- Catalogue de pièces de rechange
- Numéro, description, catégorie
- Coûts et quantités
- Mouvements de stock

#### **Place (Site)**
- Sites opérationnels (stations essence, garages, bureaux, etc.)
- Géolocalisation (latitude, longitude)
- Rayon de géofence
- Types: FUEL_STATION, SERVICE_CENTER, OFFICE, CLIENT_SITE, HOME, GENERAL

#### **Document (Document)**
- Gestion des documents
- Versioning et checksums
- Attachement à des entités
- Partage et permissions

#### **Report (Rapport)**
- Rapports analytiques
- Templates prédéfinis et personnalisés
- Partage et programmation
- Caching des données

#### **VehicleRenewal (Renouvellement de véhicule)**
- Renouvellements administratifs
- Types: REGISTRATION, INSURANCE, INSPECTION, EMISSION_TEST, OTHER
- Statut: DUE, COMPLETED, OVERDUE, DISMISSED
- Dates d'échéance

#### **Notification (Notification)**
- Notifications utilisateur
- Types: REMINDER_DUE, REMINDER_OVERDUE, ASSIGNMENT, COMMENT, SYSTEM
- Marquage comme lues

#### **Settings (Paramètres)**
- UserPreferences: Thème, langue, timezone, notifications
- CompanySettings: Devise, unités, formats
- SecuritySettings: 2FA, sessions, IP whitelist
- SystemSettings: Configuration globale
- Integration: Intégrations externes

---

## 4. Fonctionnalités principales

### 4.1 Gestion des véhicules
- **Création et modification** de véhicules avec spécifications complètes
- **Historique des compteurs** (kilométrage, heures)
- **Assignation d'opérateurs** avec dates de début/fin
- **Statuts de véhicule** (actif, inactif, maintenance, retiré)
- **Étiquettes et groupes** pour organisation
- **Informations de cycle de vie** (date de mise en service, valeur résiduelle estimée)

### 4.2 Gestion des services
- **Enregistrement des services** effectués
- **Programmes de maintenance préventive** avec fréquences
- **Tâches de service** standardisées avec codes
- **Rappels automatiques** pour services dus
- **Bons de travail** (Work Orders) avec assignation
- **Suivi des coûts** (main-d'œuvre, pièces, taxes, remises)
- **Historique complet** par véhicule

### 4.3 Gestion des inspections
- **Templates d'inspection** réutilisables
- **Types de champs** variés (pass/fail, texte, numérique, photos, signatures)
- **Programmation automatique** des inspections
- **Résultats et conformité** avec scoring
- **Historique des inspections** par véhicule
- **Export des résultats**

### 4.4 Gestion des problèmes
- **Signalement de défauts** avec priorités
- **Assignation et suivi** des problèmes
- **Commentaires et discussions** avec threading
- **Attachement d'images** et documents
- **Watchers** pour notifications
- **Labels** pour catégorisation
- **Historique complet** des modifications

### 4.5 Gestion du carburant et énergie
- **Enregistrement des ravitaillements** en carburant
- **Suivi de la consommation** (MPG/L/100km)
- **Recharges électriques** avec coûts énergétiques
- **Analyse par fournisseur** et lieu
- **Tendances de consommation**

### 4.6 Gestion des contacts
- **Répertoire de contacts** (conducteurs, techniciens, fournisseurs)
- **Groupes de contacts** pour organisation
- **Assignation de véhicules** aux conducteurs
- **Historique des assignations**
- **Informations professionnelles** (permis, salaire horaire)

### 4.7 Gestion des fournisseurs
- **Catalogue de fournisseurs** (garages, stations essence, etc.)
- **Informations de contact** et site web
- **Classifications** pour filtrage
- **Historique des services** fournis

### 4.8 Gestion des pièces
- **Catalogue de pièces** avec numéros et descriptions
- **Suivi des stocks** par lieu
- **Mouvements de stock** (achat, consommation, ajustement)
- **Coûts unitaires** et totaux
- **Historique d'utilisation**

### 4.9 Gestion des sites
- **Répertoire de sites** opérationnels
- **Géolocalisation** avec Google Maps
- **Géofences** pour détection de proximité
- **Types de sites** (station essence, garage, bureau, etc.)
- **Recherche de sites proches** via API

### 4.10 Gestion des documents
- **Upload et stockage** de documents
- **Versioning** des documents
- **Attachement** à des entités (véhicules, services, etc.)
- **Partage** avec permissions
- **Métadonnées** (tags, descriptions)
- **Suppression automatique** optionnelle

### 4.11 Rapports et analytiques
- **Templates de rapports** prédéfinis (30+ templates)
- **Rapports personnalisés** avec filtres
- **Graphiques et tableaux** interactifs
- **Export en PDF** et autres formats
- **Programmation** de rapports
- **Partage** de rapports
- **Favoris** pour accès rapide

**Catégories de rapports:**
- Véhicules (coûts, utilisation, profitabilité, remplacement)
- Services (maintenance, coûts, fournisseurs, conformité)
- Carburant (consommation, coûts, par lieu)
- Inspections (résultats, conformité, programmation)
- Problèmes (résumé, liste, priorités)
- Contacts (renouvellements, liste)
- Pièces (utilisation, stocks)

### 4.12 Notifications et rappels
- **Notifications en temps réel** pour événements importants
- **Rappels de services** dus et en retard
- **Rappels de renouvellements** (immatriculation, assurance, contrôle technique)
- **Notifications de commentaires** et assignations
- **Gestion des notifications** (lecture, suppression)
- **Nettoyage automatique** des anciennes notifications

### 4.13 Paramètres et configuration
- **Préférences utilisateur** (thème, langue, timezone)
- **Paramètres d'entreprise** (devise, unités, formats)
- **Paramètres de sécurité** (2FA, sessions, IP whitelist)
- **Intégrations externes** (Google Calendar, Slack, etc.)
- **Profil utilisateur** et avatar

---

## 5. Flux de travail principaux

### 5.1 Flux d'authentification
1. Utilisateur accède à `/login`
2. Saisit email et mot de passe
3. Validation via `/api/auth/login`
4. JWT généré et stocké localement
5. Redirection vers `/dashboard`
6. Middleware vérifie le token pour chaque requête API
7. Logout ajoute le token à la blacklist

### 5.2 Flux d'onboarding
1. Nouvel utilisateur accède à `/register`
2. Création du compte utilisateur
3. Redirection vers `/onboarding`
4. Saisie des informations d'entreprise
5. Configuration des paramètres initiaux
6. Accès au dashboard

### 5.3 Flux de gestion des véhicules
1. Utilisateur accède à `/vehicles`
2. Liste des véhicules avec filtres
3. Création d'un nouveau véhicule via `/vehicles/add`
4. Saisie des spécifications complètes
5. Assignation d'opérateurs
6. Suivi des compteurs
7. Historique des services et inspections

### 5.4 Flux de service et maintenance
1. Enregistrement d'une entrée de service
2. Sélection du véhicule et de la date
3. Ajout des tâches de service
4. Ajout des pièces utilisées
5. Saisie des coûts (main-d'œuvre, pièces, taxes)
6. Assignation à un fournisseur
7. Génération automatique du prochain rappel
8. Notification utilisateur

### 5.5 Flux d'inspection
1. Création d'un template d'inspection
2. Programmation automatique pour véhicules
3. Inspection effectuée par technicien
4. Saisie des résultats pour chaque champ
5. Attachement de photos
6. Calcul du score de conformité
7. Génération de rapport
8. Notifications si non-conformité

### 5.6 Flux de signalement de problème
1. Utilisateur signale un problème
2. Saisie du résumé et description
3. Sélection du véhicule et priorité
4. Assignation à un technicien
5. Commentaires et discussions
6. Attachement d'images
7. Changement de statut (ouvert → résolu → fermé)
8. Notifications aux watchers

### 5.7 Flux de rappels et notifications
1. Service/renouvellement créé
2. Rappel généré automatiquement
3. Seuils de temps/compteur définis
4. Notification créée quand seuil atteint
5. Utilisateur peut reporter (snooze) le rappel
6. Notification de retard si dépassé
7. Marquage comme complété

### 5.8 Flux de génération de rapports
1. Utilisateur accède à `/reports`
2. Sélection d'un template ou création personnalisée
3. Définition des filtres (dates, véhicules, etc.)
4. Génération du rapport
5. Affichage des graphiques et tableaux
6. Export en PDF ou autre format
7. Programmation de rapports récurrents
8. Partage avec d'autres utilisateurs

---

## 6. Intégrations externes

### 6.1 Google Maps API
**Utilisation:**
- Géocodage d'adresses (adresse → coordonnées)
- Géocodage inverse (coordonnées → adresse)
- Affichage de cartes interactives
- Calcul de distances entre points
- Détection de géofences
- Recherche de sites proches

**Configuration:**
```env
GOOGLE_MAPS_API_KEY=<clé API>
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<clé API publique>
```

**Service:** `lib/services/geocoding-service.ts`

### 6.2 Authentification JWT
**Implémentation:**
- Génération de JWT lors du login
- Validation du JWT dans le middleware
- Blacklist de tokens pour logout
- Expiration configurable

**Fichiers:**
- `lib/auth-api.ts` - Utilitaires JWT
- `middleware.ts` - Vérification des tokens
- `lib/auth-context.tsx` - Contexte React

### 6.3 Autres intégrations possibles
- Google Calendar (programmation des inspections)
- Slack (notifications)
- Microsoft Teams (notifications)
- Systèmes de comptabilité
- Systèmes de suivi de flotte GPS
- Fournisseurs de cartes carburant

---

## 7. Types d'utilisateurs et rôles

### 7.1 Rôles disponibles
- **ADMIN**: Accès complet, gestion des utilisateurs, paramètres système
- **MANAGER**: Gestion de la flotte, rapports, paramètres d'entreprise
- **TECHNICIAN**: Enregistrement des services, inspections, problèmes
- **DRIVER**: Consultation des assignations, historique des véhicules

### 7.2 Permissions par rôle
(À détailler selon les besoins spécifiques)

---

## 8. Points d'amélioration potentiels

### 8.1 Fonctionnalités manquantes
1. **Gestion des utilisateurs** - Interface d'administration pour créer/modifier/supprimer des utilisateurs
2. **Audit trail** - Historique complet des modifications par utilisateur
3. **Permissions granulaires** - Contrôle d'accès basé sur les rôles (RBAC) plus détaillé
4. **Synchronisation GPS** - Intégration avec systèmes de suivi GPS en temps réel
5. **Prévisions** - Prédiction des coûts de maintenance basée sur l'historique
6. **Budgets** - Définition et suivi des budgets par catégorie
7. **Alertes personnalisées** - Règles d'alerte configurables par utilisateur
8. **API publique** - Exposition d'une API pour intégrations tierces
9. **Mobile app** - Application mobile native ou PWA
10. **Synchronisation offline** - Support du mode hors ligne

### 8.2 Améliorations techniques
1. **Caching** - Implémentation de Redis pour caching des données fréquemment accédées
2. **Pagination** - Amélioration de la pagination pour grandes listes
3. **Recherche** - Implémentation d'une recherche full-text (Elasticsearch)
4. **Performance** - Optimisation des requêtes N+1, indexation des bases de données
5. **Tests** - Augmentation de la couverture de tests (unitaires, intégration)
6. **Documentation API** - Swagger/OpenAPI pour documentation automatique
7. **Monitoring** - Logging et monitoring en production (Sentry, DataDog)
8. **Scalabilité** - Architecture pour supporter plusieurs entreprises (multi-tenancy)

### 8.3 Améliorations UX/UI
1. **Dashboard** - Widgets personnalisables et KPIs en temps réel
2. **Filtres avancés** - Sauvegarde des filtres personnalisés
3. **Bulk operations** - Actions en masse sur plusieurs véhicules
4. **Drag & drop** - Interface intuitive pour assignations
5. **Notifications push** - Notifications navigateur et mobile
6. **Calendrier** - Vue calendrier pour inspections et services
7. **Cartes interactives** - Visualisation des véhicules sur carte
8. **Tableaux de bord** - Dashboards par rôle

### 8.4 Conformité et sécurité
1. **RGPD** - Conformité RGPD (droit à l'oubli, export de données)
2. **Chiffrement** - Chiffrement des données sensibles
3. **Audit** - Logs d'audit pour conformité
4. **Backup** - Stratégie de sauvegarde et récupération
5. **2FA** - Authentification à deux facteurs
6. **Rate limiting** - Protection contre les abus

---

## 9. Configuration et déploiement

### 9.1 Variables d'environnement
```env
# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/fleetmada

# Authentification
JWT_SECRET=<secret_jwt>
JWT_EXPIRATION=24h

# Google Maps
GOOGLE_MAPS_API_KEY=<clé_api>
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<clé_api_publique>

# Autres
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.fleetmada.com
```

### 9.2 Commandes utiles
```bash
# Installation
npm install

# Développement
npm run dev

# Build
npm run build

# Production
npm start

# Base de données
npm run db:generate      # Générer le client Prisma
npm run db:migrate       # Exécuter les migrations
npm run db:seed          # Seed la base de données
npm run db:reset         # Réinitialiser la base de données

# Docker
npm run docker:up        # Démarrer PostgreSQL
npm run docker:down      # Arrêter PostgreSQL

# Tests
npm run test:e2e         # Tests Playwright
npm run test:build       # Vérifier la build

# Linting
npm run lint             # Linter le code
npm run type-check       # Vérifier les types TypeScript
```

### 9.3 Structure Docker
- PostgreSQL 15 en conteneur
- Volume persistant pour les données
- Configuration via docker-compose.yml

---

## 10. Métriques et KPIs

### 10.1 Métriques de flotte
- Nombre total de véhicules
- Véhicules actifs/inactifs
- Coût total par véhicule
- Coût par kilomètre
- Utilisation moyenne
- Âge moyen de la flotte

### 10.2 Métriques de maintenance
- Taux de conformité des services
- Coûts de maintenance par véhicule
- Temps moyen entre services
- Taux de défaillance
- Coûts de main-d'œuvre vs pièces

### 10.3 Métriques de carburant
- Consommation moyenne (L/100km ou MPG)
- Coût par litre
- Coût total de carburant
- Tendances de consommation

### 10.4 Métriques d'inspections
- Taux de réussite
- Taux de non-conformité
- Problèmes les plus courants
- Temps moyen d'inspection

---

## 11. Glossaire

- **VIN**: Vehicle Identification Number (numéro d'identification du véhicule)
- **MPG**: Miles Per Gallon (consommation en miles par gallon)
- **L/100km**: Litres pour 100 kilomètres (consommation métrique)
- **JWT**: JSON Web Token (jeton d'authentification)
- **ORM**: Object-Relational Mapping (Prisma)
- **API**: Application Programming Interface
- **RBAC**: Role-Based Access Control (contrôle d'accès basé sur les rôles)
- **RGPD**: Règlement Général sur la Protection des Données
- **2FA**: Two-Factor Authentication (authentification à deux facteurs)
- **Géofence**: Zone géographique virtuelle
- **Geocoding**: Conversion d'adresse en coordonnées
- **Reverse Geocoding**: Conversion de coordonnées en adresse

---

## 12. Ressources et documentation

- **Documentation Next.js**: https://nextjs.org/docs
- **Documentation Prisma**: https://www.prisma.io/docs
- **Documentation PostgreSQL**: https://www.postgresql.org/docs
- **Google Maps API**: https://developers.google.com/maps
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs

---

**Document généré le**: 2024
**Version**: 1.0
**Statut**: Complet
