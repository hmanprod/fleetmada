

📄 FleetMada – Product Reference Specification

Loss Prevention Product Strategy

⸻

1. Objectif du document

Ce document définit :
	•	La définition officielle du produit FleetMada Loss Prevention
	•	Le périmètre fonctionnel attendu
	•	La distinction V1 vs V2
	•	Les fonctionnalités explicitement exclues
	•	Les critères de succès produit
	•	Une base de comparaison avec l’implémentation actuelle

Ce document sert de référence produit stratégique et technique.

⸻

2. Vision Produit

FleetMada est une solution SaaS qui aide les entreprises malgaches à réduire immédiatement les pertes financières visibles liées à leur flotte de véhicules.

Le produit privilégie :
	•	ROI rapide
	•	Simplicité d’adoption
	•	Faible friction d’usage
	•	Valeur financière mesurable

⸻

3. Positionnement Produit

FleetMada n’est pas initialement :
	•	Un système complet de fleet management
	•	Un système télématique
	•	Un ERP logistique

FleetMada est :

👉 Un système de contrôle et prévention des pertes financières de flotte

⸻

4. Personas Cibles

Responsable Flotte / Manager Opérationnel

Objectif :
	•	Réduire les dépenses
	•	Surveiller les anomalies
	•	Anticiper les coûts

Dirigeant / Propriétaire

Objectif :
	•	Visualiser rentabilité flotte
	•	Contrôler les dérives financières

Chauffeur

Objectif :
	•	Enregistrer rapidement certaines opérations
	•	Consulter ses obligations

⸻

5. Hypothèses Produit Fondamentales

Le succès repose sur :
	•	Les pertes carburant sont la plus forte fuite financière
	•	La maintenance tardive génère des coûts disproportionnés
	•	La non conformité administrative immobilise les actifs
	•	La simplicité d’usage est critique pour adoption

⸻

6. Scope Produit Global

FleetMada Loss Prevention s’articule autour de 4 piliers :
	1.	Fuel Loss Control
	2.	Maintenance Risk Control
	3.	Compliance Guard
	4.	Financial Visibility Dashboard

⸻

⸻

🟢 7. Scope Fonctionnel V1 – Core Loss Prevention

🎯 Objectif V1

Permettre à une entreprise de :
	•	Suivre ses dépenses carburant
	•	Prévenir maintenance critique
	•	Éviter blocages administratifs
	•	Visualiser rapidement les pertes financières

⸻

7.1 Gestion Véhicules

Fonctionnalités obligatoires
	•	Création véhicule
	•	Informations essentielles :
	•	Immatriculation
	•	Modèle
	•	Type carburant
	•	Kilométrage initial
	•	Statut véhicule

⸻

7.2 Module Fuel Loss Control (PRIORITÉ MAX)

Capacités

Enregistrement carburant
	•	Date
	•	Véhicule
	•	Chauffeur
	•	Kilométrage
	•	Quantité carburant
	•	Montant total

⸻

Calculs automatiques
	•	Consommation par véhicule
	•	Coût carburant par période
	•	Coût carburant par kilomètre

⸻

Détection anomalies

Le système doit détecter :
	•	Surconsommation vs historique véhicule
	•	Surconsommation vs moyenne flotte
	•	Variation inhabituelle entre deux pleins

⸻

Visualisation
	•	Historique carburant véhicule
	•	Classement véhicules les plus coûteux
	•	Tendances mensuelles

⸻

7.3 Module Maintenance Risk Control

Capacités

Planification entretien

Support basé sur :
	•	Kilométrage
	•	Date

⸻

Types d’événements
	•	Révision périodique
	•	Réparation corrective
	•	Inspection technique interne

⸻

Suivi coûts
	•	Coût maintenance par véhicule
	•	Historique interventions

⸻

Alertes
	•	Entretien en retard
	•	Entretien imminent

⸻

7.4 Module Compliance Guard

Capacités

Suivi des documents :
	•	Assurance
	•	Visite technique
	•	Documents administratifs véhicule

⸻

Fonctionnalités
	•	Stockage date expiration
	•	Alertes renouvellement
	•	Statut conformité véhicule

⸻

7.5 Financial Visibility Dashboard

Le dashboard V1 doit inclure :
	•	Dépense carburant globale
	•	Dépense maintenance globale
	•	Véhicules les plus coûteux
	•	Alertes actives

⸻

7.6 Gestion Utilisateurs

Rôles minimum
	•	Admin / Manager
	•	Chauffeur

⸻

7.7 Notifications
	•	Alertes maintenance
	•	Alertes conformité
	•	Alertes anomalies carburant

⸻

⸻

❌ 7.8 Exclusions explicites V1

Ces fonctionnalités NE DOIVENT PAS être incluses :

Offline Mode

Aucune gestion offline requise

⸻

GPS Tracking (localisation via navigateur on mobile only)

Aucune intégration télématique

⸻

OCR Factures

Aucune capture ni traitement facture

⸻

Marketplace fournisseurs

Exclu

⸻

Analytics prédictif avancé

Exclu

⸻

Gamification utilisateurs

Exclu

⸻

Automatisation IA

Exclu

⸻

⸻

🔵 8. Scope Fonctionnel V2 – Expansion Intelligence & Automatisation

🎯 Objectif V2

Réduire la saisie manuelle et améliorer la précision des analyses.

⸻

8.1 Offline-first
	•	Saisie carburant offline
	•	Synchronisation différée
	•	Gestion conflits données

⸻

8.2 Intégration GPS / Télématique
	•	Tracking kilométrage automatique
	•	Analyse conduite
	•	Corrélation consommation réelle

⸻

8.3 OCR Factures
	•	Scan facture carburant
	•	Extraction données automatique
	•	Validation utilisateur

⸻

8.4 Analytics Avancés
	•	Scoring performance véhicule
	•	Prévision coûts maintenance
	•	Benchmark flotte

⸻

8.5 Intelligence Fournisseurs
	•	Historique performance garages
	•	Comparaison coûts fournisseurs

⸻

⸻

9. Contraintes UX Produits

V1
	•	Enregistrement carburant < 15 secondes
	•	Interface mobile prioritaire
	•	Navigation simple
	•	Minimum champs obligatoires

⸻

V2
	•	Automatisation progressive
	•	Réduction saisie manuelle

⸻

⸻

10. Métriques Succès Produit

Activation
	•	1 véhicule créé
	•	1 plein carburant enregistré
	•	1 alerte générée

⸻

Adoption
	•	≥ 60% véhicules avec carburant mensuel loggé
	•	≥ 50% alertes traitées

⸻

Impact Business
	•	Réduction consommation carburant
	•	Réduction maintenance imprévue

⸻

⸻

11. Critères de Qualité Produit

Le produit doit être :
	•	Compréhensible sans formation longue
	•	Utilisable sur smartphone milieu de gamme
	•	Rapide en connexion faible
	•	Fiable dans calculs financiers

⸻

⸻

12. Indicateurs de Non Succès

Le produit échoue si :
	•	Les chauffeurs refusent la saisie
	•	Les managers ne consultent pas dashboard
	•	ROI non perceptible en 60 jours

⸻

⸻

13. Grille de Comparaison Produit (Pour Audit Interne)

Tu peux utiliser cette checklist pour comparer ton application actuelle :

Core Loss Prevention
	•	Suivi carburant complet
	•	Calcul consommation automatique
	•	Détection anomalies carburant
	•	Alertes maintenance
	•	Suivi conformité véhicule
	•	Dashboard financier

⸻

Simplicité UX
	•	Plein enregistrable en <15 secondes
	•	Mobile réellement optimisé
	•	Peu de champs obligatoires

⸻

Scope Control
	•	Pas de dépendance GPS
	•	Pas de dépendance offline
	•	Pas dépendance OCR

⸻

⸻

14. Définition Officielle du Produit V1

FleetMada V1 est un système SaaS permettant aux entreprises malgaches de contrôler leurs pertes financières liées au carburant, à la maintenance et à la conformité administrative via un outil simple et accessible en ligne.

⸻

⸻

15. Vision Long Terme Produit

FleetMada doit évoluer vers une plateforme intelligente d’optimisation complète de flotte basée sur l’automatisation des données terrain.

