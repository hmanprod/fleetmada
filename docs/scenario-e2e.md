# Scenarios E2E - FleetMada

Ce document reprend les modules de `docs/userstory.md` et les reordonne pour une execution E2E coherente, du socle vers les flux metier transverses.

## Principes d'ordonnancement
- Executer d'abord les prerequis de session et de configuration.
- Stabiliser ensuite les referentiels (contacts, fournisseurs, vehicules).
- Enchainer les flux operationnels (entretien, rappels, pieces, energie, inspections, problemes).
- Finir par les vues consolidees (dashboard, rapports, notifications).

## Ordre coherent des modules (campagne E2E)
1. Authentification & onboarding
2. Parametres
3. Contacts
4. Fournisseurs
5. Vehicules
6. Entretien
7. Rappels
8. Pieces
9. Carburant & energie
10. Inspections
11. Problemes
12. Documents (hors menu, transverse)
13. Tableau de bord
14. Rapports & notifications (hors menu)

## Scenarios par module

### E2E-01 - Authentification & onboarding
- Source: `docs/userstories/00-authentification-onboarding.md`
- Objectif: valider acces, creation compte et initialisation tenant.
- Parcours:
1. Ouvrir `/register`, remplir le formulaire, creer le compte.
2. Finaliser `/onboarding` (3 etapes) puis verifier redirection dashboard.
3. Se deconnecter puis se reconnecter via `/login`.
4. Verifier qu'une route protegee redirige vers `/login` si session absente.

### E2E-02 - Parametres
- Source: `docs/userstories/11-parametres.md`
- Objectif: valider la configuration de base du compte et des referentiels admin.
- Parcours:
1. Modifier le profil utilisateur (`/settings/user-profile`).
2. Modifier les parametres generaux (`/settings/general`) et sauvegarder.
3. Changer le mot de passe (`/settings/login-password`).
4. Creer un groupe (`/settings/groups`).
5. Ajouter une categorie et un fabricant de piece (`/settings/parts/*`).

### E2E-03 - Contacts
- Source: `docs/userstories/07-contacts.md`
- Objectif: disposer d'un annuaire exploitable par les modules operationnels.
- Parcours:
1. Creer un contact (`/contacts/create`).
2. Retrouver le contact via recherche sur `/contacts`.
3. Modifier la fiche (`/contacts/[id]/edit`) puis verifier persistance.

### E2E-04 - Fournisseurs
- Source: `docs/userstories/08-fournisseurs.md`
- Objectif: preparer les dependances achats/energie/pieces.
- Parcours:
1. Creer un fournisseur (`/vendors/create`).
2. Le retrouver via recherche/filtre dans `/vendors`.
3. Modifier la fiche (`/vendors/[id]/edit`) puis verifier les changements.

### E2E-05 - Vehicules
- Source: `docs/userstories/02-vehicules.md`
- Objectif: etablir le referentiel flotte principal.
- Parcours:
1. Creer un vehicule (`/vehicles/list/create`).
2. Verifier sa presence dans `/vehicles/list`.
3. Ouvrir le detail `/vehicles/list/[id]` puis modifier `/vehicles/list/[id]/edit`.
4. Ajouter une affectation (`/vehicles/assignments`).
5. Ajouter une entree compteur (`/vehicles/meter-history`).

### E2E-06 - Entretien
- Source: `docs/userstories/06-entretien.md`
- Objectif: valider le cycle maintenance preventif/correctif.
- Parcours:
1. Creer une tache de service (`/service/tasks/create`).
2. Creer un programme (`/service/programs/create`) et verifier en liste.
3. Creer une demande (`/service/work-orders/create`) et la faire evoluer.
4. Enregistrer une entree historique (`/service/history/create`) avec commentaire et pieces jointes.

### E2E-07 - Rappels
- Source: `docs/userstories/05-rappels.md`
- Objectif: verifier les echeances operationnelles et conformite.
- Parcours:
1. Creer un rappel d'entretien (`/reminders/service/create`).
2. Creer un rappel de renouvellement (`/reminders/vehicle-renewals/create`).
3. Verifier la visibilite dans les listes respectives.
4. Modifier/cloturer un rappel et verifier la mise a jour.

### E2E-08 - Pieces
- Source: `docs/userstories/10-pieces.md`
- Objectif: valider le stock et son integration avec la maintenance.
- Parcours:
1. Creer une piece (`/parts/create`) avec categorie/fabricant existants.
2. Verifier presence en liste `/parts` et acces detail.
3. Verifier la section stock bas et statistiques.

### E2E-09 - Carburant & energie
- Source: `docs/userstories/09-carburant-energie.md`
- Objectif: couvrir les flux couts energie (thermique + electrique).
- Parcours:
1. Creer une entree carburant (`/fuel/history/create`).
2. Creer une entree recharge (`/fuel/charging/create`).
3. Verifier presence dans les historiques et acces detail/edition.

### E2E-10 - Inspections
- Source: `docs/userstories/03-inspections.md`
- Objectif: valider templates, planification, execution et historisation.
- Parcours:
1. Creer un formulaire d'inspection (`/inspections/forms/create`).
2. Planifier une inspection (`/inspections/schedules`).
3. Demarrer et completer une inspection (`/inspections/forms/[id]/start`).
4. Verifier le resultat dans `/inspections/history`.

### E2E-11 - Problemes
- Source: `docs/userstories/04-problemes.md`
- Objectif: verifier la chaine de gestion d'incident.
- Parcours:
1. Creer un probleme (`/issues/create`) lie a un vehicule.
2. Verifier en liste `/issues` puis ouvrir le detail.
3. Changer statut/priorite et verifier mise a jour.

### E2E-12 - Documents (transverse)
- Source: `docs/userstories/12-modules-hors-menu.md`
- Objectif: valider le repository documentaire central.
- Parcours:
1. Uploader un document (`/documents/upload`).
2. Le retrouver via recherche/filtre (`/documents`).
3. Ouvrir `/documents/[id]`, tester preview/download/edit/delete.

### E2E-13 - Tableau de bord
- Source: `docs/userstories/01-tableau-de-bord.md`
- Objectif: verifier la consolidation KPI apres alimentation des modules.
- Parcours:
1. Ouvrir `/dashboard`.
2. Verifier la presence des widgets cles (vehicules, service, fuel, inspections, issues, pieces).
3. Verifier qu'un rafraichissement recharge les donnees.

### E2E-14 - Rapports & notifications
- Source: `docs/userstories/12-modules-hors-menu.md`
- Objectif: valider production et diffusion de syntheses.
- Parcours:
1. Ouvrir `/reports` et generer un rapport.
2. Marquer favori/enregistre puis verifier persistance.
3. Verifier la recuperation des notifications via les flux de l'application.

## Decoupage recommande pour execution Playwright
- Suite Smoke (PR): E2E-01, E2E-05, E2E-06, E2E-09, E2E-10, E2E-13
- Suite Regression metier (nightly): E2E-02 a E2E-14
- Suite Role-based (nightly): verifier restrictions ADMIN/MANAGER/TECHNICIAN/DRIVER sur modules sensibles

## Methodologie d'execution par module
Pour chaque module, nous appliquons une boucle stricte de qualite avant de passer au suivant.

1. Ecrire les tests end-to-end du module cible.
2. Lancer la suite E2E du module.
3. Corriger les anomalies detectees (fonctionnelles, UI, data, permissions).
4. Faire un screenshot des ecrans/parcours critiques du module.
5. Evaluer les screenshots (qualite visuelle, coherence UX, etats erreurs/succes).
6. Apporter de nouvelles corrections si necessaire.
7. Relancer les tests E2E du module.
8. Valider le module uniquement quand tous les tests E2E du module sont passes.
9. Passer au module suivant seulement apres validation complete du module courant.

Regle de passage:
- Aucun passage au module suivant tant que le module courant n'est pas a 100% de tests E2E reussis et screenshots valides.
