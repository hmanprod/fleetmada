# Module Vehicules

## Perimetre
- UI: `/vehicles/list`, `/vehicles/list/create`, `/vehicles/list/[id]`, `/vehicles/list/[id]/edit`, `/vehicles/assignments`, `/vehicles/meter-history`, `/vehicles/expense`, `/vehicles/replacement`
- API: `/api/vehicles/*`, `/api/assignments`, `/api/meter-entries`, `/api/expenses`
- Roles menu: tous (avec restrictions sur certains sous-modules)

## User stories

### US-VEH-001 - Gerer le parc vehicules (P0)
En tant que gestionnaire de flotte, je veux creer et consulter mes vehicules afin de maintenir un referentiel fiable.

Criteres d'acceptation:
1. La liste des vehicules est consultable avec recherche/filtrage.
2. La creation d'un vehicule valide enregistre les informations d'identification de base.
3. L'acces au detail d'un vehicule est possible depuis la liste.

### US-VEH-002 - Modifier les donnees vehicule (P0)
En tant que gestionnaire, je veux modifier un vehicule afin de garder ses informations a jour.

Criteres d'acceptation:
1. La page d'edition pre-remplit les donnees existantes.
2. Les changements valides sont sauvegardes via API et visibles au retour detail/liste.
3. Les champs obligatoires sont controles avant sauvegarde.

### US-VEH-003 - Suivre les affectations conducteur-vehicule (P1)
En tant que responsable exploitation, je veux enregistrer les affectations afin de savoir qui conduit quoi.

Criteres d'acceptation:
1. Les affectations peuvent etre creees et visualisees.
2. Un historique d'affectation est accessible.
3. Les permissions de role sont appliquees (pas d'acces conducteur sur cette section).

### US-VEH-004 - Suivre les compteurs et l'usage (P1)
En tant que gestionnaire maintenance, je veux suivre les releves compteur afin de declencher les entretiens au bon moment.

Criteres d'acceptation:
1. Les entrees compteur sont historisees par vehicule.
2. Les nouvelles entrees mettent a jour les vues d'historique.
3. Les valeurs invalides (donnee manquante/incoherente) sont refusees.

### US-VEH-005 - Gerer les depenses vehicule (P1)
En tant que manager, je veux saisir les depenses hors carburant afin de suivre le cout total du vehicule.

Criteres d'acceptation:
1. Les depenses peuvent etre creees, consultees et modifiees.
2. Les depenses peuvent etre liees a un fournisseur et a des justificatifs.
3. Les depenses alimentent les vues de synthese couts.

### US-VEH-006 - Evaluer le remplacement vehicule (P2)
En tant que responsable flotte, je veux analyser le remplacement d'un vehicule afin d'optimiser le cycle de vie des actifs.

Criteres d'acceptation:
1. La page d'analyse fournit des indicateurs de decision.
2. L'analyse utilise les donnees vehicule/couts disponibles.
3. Les roles non autorises n'accedent pas a cette fonctionnalite.
