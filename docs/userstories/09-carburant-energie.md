# Module Carburant & Energie

## Perimetre
- UI: `/fuel/history`, `/fuel/history/create`, `/fuel/history/[id]`, `/fuel/history/[id]/edit`, `/fuel/charging`, `/fuel/charging/create`, `/fuel/charging/[id]`, `/fuel/charging/[id]/edit`
- API: `/api/fuel/entries`, `/api/charging/entries`
- Roles menu: ADMIN, MANAGER, TECHNICIAN, DRIVER

## User stories

### US-FUE-001 - Saisir un plein de carburant (P0)
En tant que conducteur ou gestionnaire, je veux enregistrer un plein afin de suivre les consommations et depenses energie.

Criteres d'acceptation:
1. La saisie inclut vehicule, date, volume, cout, compteur et fournisseur.
2. Un recu/document peut etre attache a l'entree.
3. L'entree valide apparait dans l'historique carburant.

### US-FUE-002 - Saisir une recharge electrique (P0)
En tant qu'utilisateur flotte EV, je veux enregistrer une recharge afin de suivre l'energie consommee et son cout.

Criteres d'acceptation:
1. La saisie inclut vehicule, station/fournisseur, debut/fin, energie et prix.
2. Les frais/remises additionnels peuvent etre ajoutes.
3. L'entree valide apparait dans l'historique recharge.

### US-FUE-003 - Consulter les historiques carburant et recharge (P1)
En tant que manager, je veux consulter les historiques afin d'analyser les tendances de consommation.

Criteres d'acceptation:
1. Les listes sont consultables avec filtres et pagination.
2. Les details d'une entree sont accessibles depuis la liste.
3. Les actions d'actualisation rechargent les donnees sans casser l'etat UI.

### US-FUE-004 - Mettre a jour une entree energie (P1)
En tant que gestionnaire, je veux corriger une entree carburant/recharge afin de fiabiliser les KPI cout/consommation.

Criteres d'acceptation:
1. Les pages d'edition sont accessibles pour les entrees existantes.
2. Les modifications valides sont persistantes.
3. Les validations metier bloquent les donnees incoherentes.
