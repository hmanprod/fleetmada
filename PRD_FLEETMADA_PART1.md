# Product Requirements Document (PRD) - FleetMada

## Executive Summary

**FleetMada** est une plateforme SaaS complète de gestion de flotte automobile conçue pour les entreprises de transport, logistique et services. Elle offre une solution intégrée pour gérer les véhicules, la maintenance préventive, les inspections, les dépenses, et les renouvellements administratifs.

### Objectifs principaux
1. Centraliser la gestion de la flotte automobile
2. Réduire les coûts de maintenance par prévention
3. Assurer la conformité réglementaire
4. Améliorer la productivité opérationnelle
5. Fournir des insights analytiques pour la prise de décision

### Valeur proposée
- **Réduction des coûts**: Maintenance préventive, optimisation du carburant
- **Conformité**: Suivi automatique des renouvellements et inspections
- **Productivité**: Automatisation des rappels et notifications
- **Visibilité**: Rapports détaillés et dashboards en temps réel
- **Scalabilité**: Support de flottes de toutes tailles

---

## 1. Vue d'ensemble du produit

### 1.1 Description générale
FleetMada est une application web full-stack permettant aux gestionnaires de flotte de:
- Gérer un inventaire complet de véhicules
- Planifier et suivre la maintenance préventive
- Enregistrer les dépenses (carburant, services, pièces)
- Effectuer des inspections régulières
- Générer des rapports analytiques
- Gérer les contacts et fournisseurs
- Automatiser les rappels et notifications

### 1.2 Public cible
- **Entreprises de transport** (petites à moyennes)
- **Entreprises de logistique**
- **Services de livraison**
- **Flottes d'entreprise** (ventes, services)
- **Gestionnaires de parc automobile**

### 1.3 Taille du marché
- Marché mondial de la gestion de flotte: ~$10B
- Croissance annuelle: 12-15%
- Principaux concurrents: Samsara, Verizon Connect, Geotab, Teletrac Navman

---

## 2. Fonctionnalités principales

### 2.1 Gestion des véhicules

#### 2.1.1 Création et modification
- **Champs obligatoires**: Nom, VIN, marque, modèle, année, type
- **Spécifications techniques**: Moteur, transmission, dimensions, poids, capacités
- **Informations de cycle de vie**: Date de mise en service, valeur résiduelle estimée
- **Statuts**: Actif, Inactif, Maintenance, Retiré
- **Étiquettes et groupes**: Pour organisation et filtrage

#### 2.1.2 Historique des compteurs
- Enregistrement des lectures de compteur (kilométrage, heures)
- Validation des données (pas de régression)
- Calcul des distances parcourues
- Tendances d'utilisation

#### 2.1.3 Assignation d'opérateurs
- Assignation de conducteurs aux véhicules
- Dates de début et fin
- Historique complet des assignations
- Statuts: Actif, Futur, Terminé

#### 2.1.4 Recherche et filtrage
- Filtrage par statut, type, groupe
- Recherche par nom, VIN, plaque d'immatriculation
- Tri par colonne
- Sauvegarde des filtres personnalisés

### 2.2 Gestion des services et maintenance

#### 2.2.1 Enregistrement des services
- Date et heure du service
- Sélection du véhicule
- Tâches effectuées (sélection ou création)
- Pièces utilisées avec coûts
- Fournisseur/garage
- Lieu du service
- Statut: Programmé, En cours, Complété, Annulé

#### 2.2.2 Coûts détaillés
- Coûts de main-d'œuvre
- Coûts des pièces
- Taxes (configurables)
- Remises (montant ou pourcentage)
- Coût total calculé automatiquement

#### 2.2.3 Programmes de maintenance préventive
- Création de programmes avec fréquences
- Assignation de tâches aux programmes
- Assignation de véhicules aux programmes
- Génération automatique de rappels
- Suivi de la conformité

#### 2.2.4 Tâches de service
- Catalogue de tâches standardisées
- Codes de catégorie, système, assemblage
- Descriptions et instructions
- Compteurs d'utilisation
- Coûts estimés

#### 2.2.5 Bons de travail (Work Orders)
- Création de bons de travail
- Assignation à des techniciens
- Priorités et dates d'échéance
- Suivi du statut
- Notifications aux assignés

### 2.3 Gestion des rappels et notifications

#### 2.3.1 Rappels de service
- Génération automatique basée sur programmes
- Seuils de temps (jours) et compteur (km/heures)
- Statuts: Actif, Reporté, Complété, En retard
- Notifications progressives (due soon, overdue)
- Possibilité de reporter (snooze)

#### 2.3.2 Renouvellements de véhicule
- Types: Immatriculation, Assurance, Contrôle technique, Test d'émission
- Dates d'échéance
- Statuts: Dû, Complété, En retard, Rejeté
- Notifications automatiques
- Historique des renouvellements

#### 2.3.3 Notifications
- Types: Rappel dû, Rappel en retard, Assignation, Commentaire, Système
- Marquage comme lues
- Suppression
- Nettoyage automatique des anciennes notifications

### 2.4 Gestion des inspections

#### 2.4.1 Templates d'inspection
- Création de templates réutilisables
- Types de champs: Pass/Fail, Texte, Numérique, Photos, Signatures, Date/Heure
- Champs obligatoires/optionnels
- Descriptions et instructions
- Catégorisation

#### 2.4.2 Programmation des inspections
- Programmation automatique par règles
- Règles: Tous les véhicules, Par attribut, Véhicule spécifique
- Fréquences: Quotidienne, Hebdomadaire, Mensuelle, Par compteur
- Dates d'échéance

#### 2.4.3 Exécution des inspections
- Statuts: Brouillon, Programmée, En cours, Complétée, Annulée
- Saisie des résultats pour chaque champ
- Attachement de photos
- Notes et commentaires
- Calcul du score de conformité

#### 2.4.4 Résultats et conformité
- Statut de conformité: Conforme, Non-conforme, En attente d'examen
- Score global
- Détails des non-conformités
- Historique des inspections

### 2.5 Gestion des problèmes

#### 2.5.1 Signalement de problèmes
- Résumé et description
- Sélection du véhicule
- Priorité: Basse, Moyenne, Haute, Critique
- Statut: Ouvert, En cours, Résolu, Fermé
- Date de signalement

#### 2.5.2 Assignation et suivi
- Assignation à un ou plusieurs techniciens
- Watchers pour notifications
- Étiquettes pour catégorisation
- Dates d'échéance

#### 2.5.3 Commentaires et discussions
- Commentaires avec threading
- Mentions d'utilisateurs
- Attachement de fichiers
- Historique des modifications

#### 2.5.4 Images et documents
- Attachement de photos
- Galerie d'images
- Métadonnées (localisation, description)

### 2.6 Gestion du carburant et énergie

#### 2.6.1 Entrées de carburant
- Date et heure
- Véhicule
- Volume et coût
- Fournisseur et lieu
- Calcul MPG/L/100km
- Historique par véhicule

#### 2.6.2 Entrées de recharge (électrique)
- Date et heure
- Véhicule
- Énergie (kWh) et coût
- Durée de recharge
- Fournisseur et lieu

#### 2.6.3 Analyse de consommation
- Tendances par véhicule
- Comparaison entre véhicules
- Coûts par fournisseur
- Alertes sur consommation anormale

### 2.7 Gestion des contacts

#### 2.7.1 Répertoire de contacts
- Informations personnelles (nom, email, téléphone)
- Informations professionnelles (titre, entreprise)
- Groupes de contacts
- Statuts: Actif, Inactif, Archivé
- Classifications et étiquettes

#### 2.7.2 Assignation de véhicules
- Assignation de conducteurs aux véhicules
- Dates de début et fin
- Historique des assignations
- Statuts: Actif, Futur, Terminé

#### 2.7.3 Renouvellements de contacts
- Suivi des permis de conduire
- Dates d'expiration
- Notifications de renouvellement

### 2.8 Gestion des fournisseurs

#### 2.8.1 Catalogue de fournisseurs
- Nom et informations de contact
- Site web et adresse
- Classifications (garage, station essence, etc.)
- Étiquettes pour filtrage
- Historique des services

#### 2.8.2 Évaluation des fournisseurs
- Nombre de services
- Coûts moyens
- Qualité (basée sur les problèmes signalés)

### 2.9 Gestion des pièces

#### 2.9.1 Catalogue de pièces
- Numéro de pièce unique
- Description et catégorie
- Fabricant
- Coûts unitaires
- Quantités en stock

#### 2.9.2 Suivi des stocks
- Quantités par lieu
- Mouvements de stock (achat, consommation, ajustement)
- Alertes de stock faible
- Historique des mouvements

#### 2.9.3 Utilisation des pièces
- Historique d'utilisation par véhicule
- Coûts totaux par pièce
- Tendances d'utilisation

### 2.10 Gestion des sites

#### 2.10.1 Répertoire de sites
- Nom et description
- Adresse et géolocalisation
- Types: Station essence, Garage, Bureau, Site client, Domicile, Général
- Rayon de géofence

#### 2.10.2 Recherche de sites proches
- Recherche par localisation
- Filtrage par type
- Affichage sur carte
- Calcul de distances

### 2.11 Gestion des documents

#### 2.11.1 Upload et stockage
- Upload de fichiers
- Versioning des documents
- Métadonnées (tags, descriptions)
- Checksums pour intégrité

#### 2.11.2 Attachement à des entités
- Attachement à véhicules, services, inspections, etc.
- Historique des attachements
- Suppression automatique optionnelle

#### 2.11.3 Partage et permissions
- Partage avec d'autres utilisateurs
- Permissions: Lecture, Modification
- Partage public optionnel

### 2.12 Rapports et analytiques

#### 2.12.1 Templates de rapports prédéfinis
**Catégorie Véhicules:**
- Comparaison des coûts par véhicule
- Tendance coûts vs compteur
- Résumé des dépenses
- Dépenses par véhicule
- Changements de groupe
- Changements de statut
- Résumé d'utilisation
- Historique des compteurs
- Liste des véhicules
- Profitabilité des véhicules
- Résumé des véhicules
- Économie de carburant
- Analyse de remplacement
- Coûts vs budget

**Catégorie Services:**
- Catégorisation de la maintenance
- Résumé des entrées de service
- Historique des services par véhicule
- Conformité des rappels
- Résumé des coûts de service
- Performance des fournisseurs
- Main-d'œuvre vs pièces
- Résumé des bons de travail

**Catégorie Carburant:**
- Entrées de carburant par véhicule
- Résumé du carburant
- Résumé du carburant par lieu

**Catégorie Problèmes:**
- Résumé des défauts
- Liste des problèmes

**Catégorie Inspections:**
- Défaillances d'inspection
- Programmation des inspections
- Soumissions d'inspection
- Résumé des inspections

**Catégorie Contacts:**
- Rappels de renouvellement de contacts
- Liste des contacts

**Catégorie Pièces:**
- Pièces par véhicule

#### 2.12.2 Rapports personnalisés
- Sélection de sources de données
- Filtres personnalisés (dates, véhicules, etc.)
- Graphiques et tableaux personnalisés
- Sauvegarde des rapports

#### 2.12.3 Export et partage
- Export en PDF
- Export en Excel
- Export en CSV
- Partage avec d'autres utilisateurs
- Programmation de rapports récurrents

#### 2.12.4 Visualisations
- Graphiques en barres
- Graphiques en courbes
- Graphiques en camembert
- Tableaux avec totaux
- Cartes interactives

### 2.13 Paramètres et configuration

#### 2.13.1 Préférences utilisateur
- Thème (clair, sombre, auto)
- Langue (français, anglais, etc.)
- Timezone
- Notifications (types, fréquence)
- Widgets du dashboard

#### 2.13.2 Paramètres d'entreprise
- Nom et informations
- Devise (EUR, USD, etc.)
- Unités (km, miles, litres, gallons)
- Formats de date et nombre
- Année fiscale
- Taxes par défaut

#### 2.13.3 Paramètres de sécurité
- Authentification à deux facteurs (2FA)
- Gestion des sessions
- IP whitelist
- Historique de connexion

#### 2.13.4 Intégrations
- Google Maps
- Google Calendar
- Slack
- Microsoft Teams
- Autres services

---

## 3. Spécifications techniques

### 3.1 Architecture générale
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de données**: PostgreSQL
- **Authentification**: JWT
- **Intégrations**: Google Maps API

### 3.2 Modèle de données
(Voir Document de Contexte - Section 3)

### 3.3 API REST
- Endpoints RESTful pour toutes les entités
- Authentification JWT obligatoire
- Validation des données avec Zod
- Gestion des erreurs standardisée
- Pagination pour les listes

### 3.4 Performance
- Caching des données fréquemment accédées
- Optimisation des requêtes de base de données
- Compression des réponses
- CDN pour les assets statiques

### 3.5 Sécurité
- HTTPS obligatoire
- Validation des entrées
- Protection CSRF
- Rate limiting
- Chiffrement des données sensibles

---

## 4. Flux utilisateur

### 4.1 Authentification
1. Utilisateur accède à `/login`
2. Saisit email et mot de passe
3. Validation et génération JWT
4. Redirection vers `/dashboard`
5. Middleware vérifie le token pour chaque requête

### 4.2 Onboarding
1. Nouvel utilisateur accède à `/register`
2. Création du compte
3. Redirection vers `/onboarding`
4. Saisie des informations d'entreprise
5. Configuration des paramètres initiaux
6. Accès au dashboard

### 4.3 Gestion des véhicules
1. Accès à `/vehicles`
2. Visualisation de la liste
3. Création d'un nouveau véhicule
4. Saisie des spécifications
5. Assignation d'opérateurs
6. Suivi des compteurs

### 4.4 Enregistrement d'un service
1. Accès à `/service/entries`
2. Création d'une nouvelle entrée
3. Sélection du véhicule
4. Ajout des tâches
5. Ajout des pièces
6. Saisie des coûts
7. Assignation au fournisseur
8. Génération automatique du rappel

### 4.5 Création d'une inspection
1. Accès à `/inspections`
2. Sélection d'un template
3. Programmation automatique
4. Exécution par technicien
5. Saisie des résultats
6. Attachement de photos
7. Génération de rapport

### 4.6 Signalement d'un problème
1. Accès à `/issues`
2. Création d'un nouveau problème
3. Saisie du résumé et description
4. Sélection du véhicule et priorité
5. Assignation à un technicien
6. Commentaires et discussions
7. Changement de statut

### 4.7 Génération d'un rapport
1. Accès à `/reports`
2. Sélection d'un template
3. Définition des filtres
4. Génération du rapport
5. Visualisation des graphiques
6. Export en PDF
7. Programmation récurrente

---

## 5. Critères d'acceptation

### 5.1 Gestion des véhicules
- [ ] Créer un véhicule avec toutes les spécifications
- [ ] Modifier les informations d'un véhicule
- [ ] Supprimer un véhicule
- [ ] Lister les véhicules avec filtres et tri
- [ ] Enregistrer les lectures de compteur
- [ ] Assigner un opérateur à un véhicule
- [ ] Visualiser l'historique des assignations

### 5.2 Gestion des services
- [ ] Enregistrer une entrée de service
- [ ] Ajouter des tâches et pièces
- [ ] Calculer les coûts automatiquement
- [ ] Générer un rappel automatique
- [ ] Lister les services avec filtres
- [ ] Exporter l'historique des services

### 5.3 Gestion des inspections
- [ ] Créer un template d'inspection
- [ ] Programmer une inspection
- [ ] Exécuter une inspection
- [ ] Calculer le score de conformité
- [ ] Générer un rapport d'inspection
- [ ] Attacher des photos

### 5.4 Gestion des problèmes
- [ ] Signaler un problème
- [ ] Assigner à un technicien
- [ ] Ajouter des commentaires
- [ ] Attacher des images
- [ ] Changer le statut
- [ ] Notifier les watchers

### 5.5 Notifications et rappels
- [ ] Générer des rappels automatiques
- [ ] Envoyer des notifications
- [ ] Reporter un rappel
- [ ] Marquer une notification comme lue
- [ ] Nettoyer les anciennes notifications

### 5.6 Rapports
- [ ] Générer un rapport prédéfini
- [ ] Créer un rapport personnalisé
- [ ] Exporter en PDF
- [ ] Partager un rapport
- [ ] Programmer un rapport récurrent

### 5.7 Authentification et sécurité
- [ ] Créer un compte utilisateur
- [ ] Se connecter avec JWT
- [ ] Se déconnecter et blacklister le token
- [ ] Vérifier les permissions par rôle
- [ ] Protéger les routes API

---

## 6. Métriques de succès

### 6.1 Métriques d'utilisation
- Nombre d'utilisateurs actifs mensuels (MAU)
- Nombre de véhicules gérés
- Nombre de services enregistrés
- Nombre de rapports générés
- Taux de rétention utilisateur

### 6.2 Métriques de performance
- Temps de chargement des pages < 2s
- Disponibilité du service > 99.9%
- Temps de réponse API < 500ms
- Taux d'erreur < 0.1%

### 6.3 Métriques métier
- Réduction des coûts de maintenance (%)
- Amélioration de la conformité (%)
- Réduction du temps d'administration (%)
- Satisfaction client (NPS)

---

## 7. Roadmap produit

### Phase 1 (MVP - Actuelle)
- Gestion des véhicules
- Gestion des services
- Gestion des inspections
- Gestion des problèmes
- Gestion du carburant
- Notifications et rappels
- Rapports de base

### Phase 2 (Q2 2024)
- Gestion des contacts avancée
- Gestion des fournisseurs
- Gestion des pièces et stocks
- Gestion des sites
- Rapports avancés
- Intégrations (Google Calendar, Slack)

### Phase 3 (Q3 2024)
- Gestion des utilisateurs et permissions
- Audit trail complet
- API publique
- Mobile app (PWA)
- Synchronisation GPS
- Prévisions de coûts

### Phase 4 (Q4 2024)
- Budgets et alertes
- Synchronisation offline
- Elasticsearch pour recherche
- Multi-tenancy
- Monitoring et logging
- Conformité RGPD

---

## 8. Risques et mitigation

### 8.1 Risques techniques
- **Risque**: Performance avec grandes flottes
  **Mitigation**: Caching, indexation, pagination

- **Risque**: Intégrité des données
  **Mitigation**: Transactions, backups, audit trail

- **Risque**: Sécurité des données
  **Mitigation**: Chiffrement, HTTPS, validation

### 8.2 Risques métier
- **Risque**: Adoption utilisateur faible
  **Mitigation**: UX intuitive, formation, support

- **Risque**: Concurrence accrue
  **Mitigation**: Différenciation, innovation continue

- **Risque**: Conformité réglementaire
  **Mitigation**: Audit régulier, documentation

---

## 9. Dépendances et contraintes

### 9.1 Dépendances externes
- Google Maps API (géolocalisation)
- PostgreSQL (base de données)
- Services d'email (notifications)

### 9.2 Contraintes techniques
- Navigateurs modernes (Chrome, Firefox, Safari, Edge)
- Connexion internet requise
- Stockage cloud pour documents

### 9.3 Contraintes métier
- Conformité RGPD
- Conformité réglementaire locale
- Tarification compétitive

---

## 10. Glossaire

- **VIN**: Vehicle Identification Number
- **MPG**: Miles Per Gallon
- **JWT**: JSON Web Token
- **ORM**: Object-Relational Mapping
- **API**: Application Programming Interface
- **RBAC**: Role-Based Access Control
- **RGPD**: Règlement Général sur la Protection des Données
- **2FA**: Two-Factor Authentication
- **Géofence**: Zone géographique virtuelle
- **Geocoding**: Conversion adresse ↔ coordonnées

---

**Document généré le**: 2024
**Version**: 1.0
**Statut**: Complet
**Auteur**: Équipe Produit
