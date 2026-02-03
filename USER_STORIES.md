# User Stories - FleetMada

## 1. Authentification et Onboarding

### US-001: Créer un compte utilisateur
**En tant que** nouvel utilisateur
**Je veux** créer un compte
**Afin de** accéder à l'application

**Critères d'acceptation:**
- [ ] Formulaire de registration avec email et mot de passe
- [ ] Validation de l'email (format valide, unique)
- [ ] Validation du mot de passe (min 8 caractères, complexité)
- [ ] Confirmation du mot de passe
- [ ] Message de succès et redirection vers onboarding
- [ ] Gestion des erreurs (email existant, etc.)

**Tâches:**
- Créer la page `/register`
- Implémenter l'API `/api/auth/register`
- Ajouter les validations Zod
- Tester les cas d'erreur

---

### US-002: Se connecter à l'application
**En tant que** utilisateur enregistré
**Je veux** me connecter avec mon email et mot de passe
**Afin de** accéder à mon compte

**Critères d'acceptation:**
- [ ] Formulaire de login avec email et mot de passe
- [ ] Validation des identifiants
- [ ] Génération d'un JWT
- [ ] Stockage du token localement
- [ ] Redirection vers le dashboard
- [ ] Gestion des erreurs (identifiants invalides)

**Tâches:**
- Créer la page `/login`
- Implémenter l'API `/api/auth/login`
- Implémenter la génération JWT
- Ajouter le contexte d'authentification

---

### US-003: Compléter l'onboarding
**En tant que** nouvel utilisateur
**Je veux** configurer les informations de mon entreprise
**Afin de** personnaliser l'application

**Critères d'acceptation:**
- [ ] Formulaire avec informations d'entreprise
- [ ] Champs: Nom, adresse, téléphone, site web
- [ ] Paramètres initiaux: Devise, unités, langue
- [ ] Validation des données
- [ ] Sauvegarde en base de données
- [ ] Redirection vers le dashboard

**Tâches:**
- Créer la page `/onboarding`
- Implémenter l'API `/api/onboarding/company`
- Ajouter les validations

---

## 2. Gestion des véhicules

### US-004: Créer un nouveau véhicule
**En tant que** gestionnaire de flotte
**Je veux** ajouter un nouveau véhicule
**Afin de** le gérer dans le système

**Critères d'acceptation:**
- [ ] Formulaire avec tous les champs obligatoires
- [ ] Validation du VIN (unique)
- [ ] Validation des données numériques
- [ ] Upload optionnel d'une image
- [ ] Sauvegarde en base de données
- [ ] Message de succès
- [ ] Redirection vers la liste

**Tâches:**
- Créer la page `/vehicles/add`
- Créer le composant `VehicleForm`
- Implémenter l'API `/api/vehicles` (POST)
- Ajouter les validations

---

### US-005: Consulter la liste des véhicules
**En tant que** gestionnaire de flotte
**Je veux** voir tous mes véhicules
**Afin de** les gérer efficacement

**Critères d'acceptation:**
- [ ] Tableau avec colonnes: Nom, VIN, Marque, Modèle, Année, Statut
- [ ] Pagination (50 par défaut)
- [ ] Filtrage par statut, type, groupe
- [ ] Recherche par nom, VIN, plaque
- [ ] Tri par colonne
- [ ] Actions: Voir détails, Modifier, Supprimer
- [ ] Export en CSV

**Tâches:**
- Créer la page `/vehicles`
- Créer le composant `VehiclesTable`
- Implémenter l'API `/api/vehicles` (GET)
- Ajouter les filtres et tri

---

### US-006: Consulter les détails d'un véhicule
**En tant que** gestionnaire de flotte
**Je veux** voir tous les détails d'un véhicule
**Afin de** connaître son historique et son statut

**Critères d'acceptation:**
- [ ] Affichage de toutes les informations
- [ ] Onglets: Informations, Services, Inspections, Problèmes, Carburant
- [ ] Historique des compteurs
- [ ] Assignations actuelles et passées
- [ ] Boutons: Modifier, Supprimer, Ajouter service, etc.

**Tâches:**
- Créer la page `/vehicles/[id]`
- Créer les composants pour chaque onglet
- Implémenter l'API `/api/vehicles/[id]` (GET)

---

### US-007: Modifier un véhicule
**En tant que** gestionnaire de flotte
**Je veux** modifier les informations d'un véhicule
**Afin de** les maintenir à jour

**Critères d'acceptation:**
- [ ] Formulaire pré-rempli avec les données actuelles
- [ ] Modification de tous les champs
- [ ] Validation des données
- [ ] Sauvegarde en base de données
- [ ] Message de succès
- [ ] Historique des modifications

**Tâches:**
- Créer la page `/vehicles/[id]/edit`
- Réutiliser le composant `VehicleForm`
- Implémenter l'API `/api/vehicles/[id]` (PUT)

---

### US-008: Supprimer un véhicule
**En tant que** gestionnaire de flotte
**Je veux** supprimer un véhicule
**Afin de** le retirer du système

**Critères d'acceptation:**
- [ ] Confirmation avant suppression
- [ ] Vérification des dépendances
- [ ] Suppression en base de données
- [ ] Message de succès
- [ ] Redirection vers la liste

**Tâches:**
- Ajouter un modal de confirmation
- Implémenter l'API `/api/vehicles/[id]` (DELETE)

---

## 3. Gestion des services

### US-009: Enregistrer un service
**En tant que** technicien
**Je veux** enregistrer un service effectué
**Afin de** maintenir l'historique de maintenance

**Critères d'acceptation:**
- [ ] Formulaire avec: Véhicule, Date, Tâches, Pièces, Coûts
- [ ] Sélection du véhicule
- [ ] Ajout de tâches (sélection ou création)
- [ ] Ajout de pièces avec quantités et coûts
- [ ] Calcul automatique du coût total
- [ ] Sélection du fournisseur et lieu
- [ ] Génération automatique du rappel
- [ ] Sauvegarde en base de données

**Tâches:**
- Créer la page `/service/entries/add`
- Créer le composant `ServiceForm`
- Implémenter l'API `/api/service/entries` (POST)
- Implémenter la génération de rappels

---

### US-010: Consulter l'historique des services
**En tant que** gestionnaire de flotte
**Je veux** voir l'historique des services
**Afin de** analyser les coûts de maintenance

**Critères d'acceptation:**
- [ ] Tableau avec: Véhicule, Date, Tâches, Coût, Fournisseur
- [ ] Filtrage par véhicule, date, fournisseur
- [ ] Tri par date, coût
- [ ] Pagination
- [ ] Détails d'un service
- [ ] Export en CSV/PDF

**Tâches:**
- Créer la page `/service/entries`
- Créer le composant `ServiceEntriesTable`
- Implémenter l'API `/api/service/entries` (GET)

---

## 4. Gestion des inspections

### US-011: Créer un template d'inspection
**En tant que** gestionnaire de flotte
**Je veux** créer un template d'inspection
**Afin de** standardiser les inspections

**Critères d'acceptation:**
- [ ] Formulaire avec: Nom, Description, Catégorie
- [ ] Ajout de champs d'inspection
- [ ] Types de champs: Pass/Fail, Texte, Numérique, Photos, Signatures
- [ ] Champs obligatoires/optionnels
- [ ] Sauvegarde en base de données
- [ ] Réutilisation du template

**Tâches:**
- Créer la page `/inspections/templates/add`
- Créer le composant `InspectionTemplateForm`
- Implémenter l'API `/api/inspection-templates` (POST)

---

### US-012: Programmer une inspection
**En tant que** gestionnaire de flotte
**Je veux** programmer une inspection
**Afin de** assurer la conformité

**Critères d'acceptation:**
- [ ] Sélection d'un template
- [ ] Définition des règles (tous les véhicules, par attribut, spécifique)
- [ ] Définition de la fréquence
- [ ] Calcul des dates d'échéance
- [ ] Sauvegarde en base de données
- [ ] Génération automatique des inspections

**Tâches:**
- Créer la page `/inspections/schedules/add`
- Créer le composant `InspectionScheduleForm`
- Implémenter l'API `/api/inspection-schedules` (POST)
- Implémenter la génération automatique

---

### US-013: Effectuer une inspection
**En tant que** technicien
**Je veux** effectuer une inspection
**Afin de** vérifier l'état du véhicule

**Critères d'acceptation:**
- [ ] Affichage du template
- [ ] Saisie des résultats pour chaque champ
- [ ] Attachement de photos
- [ ] Calcul du score de conformité
- [ ] Sauvegarde en base de données
- [ ] Génération de rapport

**Tâches:**
- Créer la page `/inspections/[id]/execute`
- Créer le composant `InspectionExecutor`
- Implémenter l'API `/api/inspections` (POST)
- Implémenter le calcul de conformité

---

## 5. Gestion des problèmes

### US-014: Signaler un problème
**En tant que** conducteur ou technicien
**Je veux** signaler un problème
**Afin de** le faire résoudre

**Critères d'acceptation:**
- [ ] Formulaire avec: Résumé, Description, Véhicule, Priorité
- [ ] Sélection du véhicule
- [ ] Priorités: Basse, Moyenne, Haute, Critique
- [ ] Attachement optionnel de photos
- [ ] Sauvegarde en base de données
- [ ] Notification au gestionnaire

**Tâches:**
- Créer la page `/issues/add`
- Créer le composant `IssueForm`
- Implémenter l'API `/api/issues` (POST)
- Implémenter les notifications

---

### US-015: Consulter les problèmes
**En tant que** gestionnaire de flotte
**Je veux** voir tous les problèmes
**Afin de** les gérer efficacement

**Critères d'acceptation:**
- [ ] Tableau avec: Résumé, Véhicule, Priorité, Statut, Date
- [ ] Filtrage par statut, priorité, véhicule
- [ ] Tri par date, priorité
- [ ] Pagination
- [ ] Actions: Voir détails, Assigner, Changer statut

**Tâches:**
- Créer la page `/issues`
- Créer le composant `IssuesTable`
- Implémenter l'API `/api/issues` (GET)

---

### US-016: Assigner et commenter un problème
**En tant que** gestionnaire de flotte
**Je veux** assigner un problème et ajouter des commentaires
**Afin de** le suivre et le résoudre

**Critères d'acceptation:**
- [ ] Assignation à un ou plusieurs techniciens
- [ ] Ajout de commentaires
- [ ] Threading des commentaires
- [ ] Attachement de fichiers
- [ ] Notifications aux assignés
- [ ] Historique des modifications

**Tâches:**
- Créer le composant `IssueAssignment`
- Créer le composant `IssueComments`
- Implémenter l'API `/api/issues/[id]/assign` (POST)
- Implémenter l'API `/api/issues/[id]/comments` (POST)

---

## 6. Notifications et rappels

### US-017: Recevoir des notifications de rappels
**En tant que** utilisateur
**Je veux** recevoir des notifications pour les services dus
**Afin de** ne pas oublier la maintenance

**Critères d'acceptation:**
- [ ] Notifications pour services dus
- [ ] Notifications pour services en retard
- [ ] Notifications pour renouvellements dus
- [ ] Notifications pour renouvellements en retard
- [ ] Marquage comme lues
- [ ] Suppression
- [ ] Historique des notifications

**Tâches:**
- Implémenter le service de notifications
- Implémenter la génération automatique
- Créer la page `/notifications`
- Implémenter l'API `/api/notifications` (GET, PATCH)

---

## 7. Rapports

### US-018: Générer un rapport de coûts
**En tant que** gestionnaire de flotte
**Je veux** générer un rapport de coûts
**Afin de** analyser les dépenses

**Critères d'acceptation:**
- [ ] Sélection d'un template
- [ ] Définition de la période
- [ ] Filtrage par véhicule, type de coût
- [ ] Graphiques et tableaux
- [ ] Export en PDF
- [ ] Programmation récurrente

**Tâches:**
- Créer la page `/reports`
- Créer le composant `ReportGenerator`
- Implémenter l'API `/api/reports/generate` (POST)
- Implémenter l'export PDF

---

## 8. Paramètres

### US-019: Configurer les préférences utilisateur
**En tant que** utilisateur
**Je veux** configurer mes préférences
**Afin de** personnaliser mon expérience

**Critères d'acceptation:**
- [ ] Sélection du thème (clair, sombre, auto)
- [ ] Sélection de la langue
- [ ] Sélection de la timezone
- [ ] Configuration des notifications
- [ ] Sauvegarde en base de données

**Tâches:**
- Créer la page `/settings/preferences`
- Créer le composant `PreferencesForm`
- Implémenter l'API `/api/settings/preferences` (GET, PUT)

---

### US-020: Configurer les paramètres d'entreprise
**En tant que** administrateur
**Je veux** configurer les paramètres d'entreprise
**Afin de** standardiser l'application

**Critères d'acceptation:**
- [ ] Configuration de la devise
- [ ] Configuration des unités
- [ ] Configuration des formats
- [ ] Configuration des taxes
- [ ] Sauvegarde en base de données

**Tâches:**
- Créer la page `/settings/company`
- Créer le composant `CompanySettingsForm`
- Implémenter l'API `/api/settings/company` (GET, PUT)

---

## Estimation des efforts

| User Story | Complexité | Effort (jours) |
|-----------|-----------|----------------|
| US-001 | Basse | 1 |
| US-002 | Basse | 1 |
| US-003 | Moyenne | 2 |
| US-004 | Moyenne | 2 |
| US-005 | Moyenne | 2 |
| US-006 | Moyenne | 2 |
| US-007 | Basse | 1 |
| US-008 | Basse | 1 |
| US-009 | Haute | 3 |
| US-010 | Moyenne | 2 |
| US-011 | Haute | 3 |
| US-012 | Haute | 3 |
| US-013 | Haute | 3 |
| US-014 | Moyenne | 2 |
| US-015 | Moyenne | 2 |
| US-016 | Moyenne | 2 |
| US-017 | Moyenne | 2 |
| US-018 | Haute | 3 |
| US-019 | Basse | 1 |
| US-020 | Basse | 1 |
| **TOTAL** | | **40 jours** |

---

## Priorités

### Sprint 1 (MVP)
- US-001, US-002, US-003 (Authentification)
- US-004, US-005, US-006, US-007, US-008 (Gestion des véhicules)
- US-009, US-010 (Gestion des services)

### Sprint 2
- US-011, US-012, US-013 (Gestion des inspections)
- US-014, US-015, US-016 (Gestion des problèmes)
- US-017 (Notifications)

### Sprint 3
- US-018 (Rapports)
- US-019, US-020 (Paramètres)
- Tests et optimisations

---

**Document généré le**: 2024
**Version**: 1.0
**Statut**: Complet
