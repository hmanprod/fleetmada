# Module Rappels

## Perimetre
- UI: `/reminders/service`, `/reminders/service/create`, `/reminders/service/[id]`, `/reminders/service/[id]/edit`, `/reminders/vehicle-renewals`, `/reminders/vehicle-renewals/create`, `/reminders/vehicle-renewals/[id]`, `/reminders/vehicle-renewals/[id]/edit`
- API: `/api/service/reminders`, `/api/vehicle-renewals`, `/api/vehicle-renewals/[id]`
- Roles menu: ADMIN, MANAGER, TECHNICIAN

## User stories

### US-REM-001 - Creer un rappel d'entretien (P0)
En tant que planificateur maintenance, je veux definir un rappel par temps ou kilometrage afin d'anticiper les operations.

Criteres d'acceptation:
1. Un rappel peut etre configure avec intervalle et unite.
2. Le rappel est rattache a un vehicule et une tache/programme.
3. Le rappel cree apparait dans la liste des rappels d'entretien.

### US-REM-002 - Creer un rappel de renouvellement vehicule (P0)
En tant que gestionnaire conformite, je veux planifier les renouvellements afin d'eviter les depassements d'echeance.

Criteres d'acceptation:
1. Le rappel stocke l'echeance et le type de renouvellement.
2. La liste distingue les echeances proches et depassees.
3. Les erreurs de saisie (date invalide/champ requis) sont bloquees.

### US-REM-003 - Suivre et filtrer les rappels (P1)
En tant que manager, je veux filtrer les rappels afin de prioriser les actions critiques.

Criteres d'acceptation:
1. Les rappels sont filtrables par statut, vehicule et periode.
2. Le detail d'un rappel est accessible depuis la liste.
3. Les vues se rafraichissent apres modifications.

### US-REM-004 - Mettre a jour ou cloturer un rappel (P1)
En tant que technicien, je veux modifier ou terminer un rappel afin de maintenir un planning fiable.

Criteres d'acceptation:
1. Un rappel peut etre edite depuis sa fiche.
2. Un rappel termine sort des actions urgentes.
3. Les changements sont persistants et historises dans les vues.
