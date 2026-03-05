# Module Entretien (Service)

## Perimetre
- UI: `/service`, `/service/history`, `/service/history/create`, `/service/history/[id]`, `/service/history/[id]/edit`, `/service/work-orders`, `/service/work-orders/create`, `/service/work-orders/[id]`, `/service/work-orders/[id]/edit`, `/service/tasks`, `/service/tasks/create`, `/service/programs`, `/service/programs/create`, `/service/programs/[id]`, `/service/programs/[id]/edit`
- API: `/api/service/entries`, `/api/service/tasks`, `/api/service/programs`, `/api/service/reminders`
- Roles menu: ADMIN, MANAGER, TECHNICIAN

## User stories

### US-SVC-001 - Visualiser le dashboard maintenance (P0)
En tant que responsable maintenance, je veux un dashboard dedie afin de suivre les indicateurs d'entretien en temps reel.

Criteres d'acceptation:
1. Le dashboard affiche des stats cles (programmes actifs, couts, rappels urgents, activite recente).
2. Des actions rapides permettent d'ouvrir historique, demandes et programmes.
3. Les donnees sont rafraichissables depuis la page.

### US-SVC-002 - Gerer les entrees d'historique d'entretien (P0)
En tant que technicien, je veux enregistrer une intervention afin de tracer les operations realisees.

Criteres d'acceptation:
1. Une entree d'historique peut etre creee, consultee, modifiee et supprimee.
2. L'entree supporte couts, compteurs, commentaires, photos et documents.
3. Les entrees sont rattachees au vehicule concerne.

### US-SVC-003 - Piloter les demandes d'entretien (work orders) (P0)
En tant que manager, je veux suivre les demandes d'entretien afin de planifier et attribuer les travaux.

Criteres d'acceptation:
1. Une demande peut etre creee avec priorite, statut et affectation.
2. Le detail d'une demande expose les pieces jointes et commentaires associes.
3. Les modifications de statut sont visibles dans la liste.

### US-SVC-004 - Maintenir le catalogue de taches d'entretien (P1)
En tant que responsable methode, je veux definir des taches standards afin d'industrialiser les interventions.

Criteres d'acceptation:
1. Les taches sont creees et listees via le module dedie.
2. Les taches peuvent etre reutilisees dans rappels/programmes.
3. Les taches obsoletes peuvent etre desactivees ou retirees selon regles metier.

### US-SVC-005 - Gerer les programmes d'entretien (P1)
En tant que gestionnaire flotte, je veux configurer des programmes preventifs afin d'automatiser le suivi.

Criteres d'acceptation:
1. Un programme peut etre cree, edite et consulte.
2. Un programme peut etre associe a des vehicules.
3. Les rappels derives du programme sont exploitables dans le module Rappels.
