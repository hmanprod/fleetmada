# Module Inspections

## Perimetre
- UI: `/inspections`, `/inspections/history`, `/inspections/history/create`, `/inspections/history/[id]`, `/inspections/history/[id]/edit`, `/inspections/schedules`, `/inspections/forms`, `/inspections/forms/create`, `/inspections/forms/[id]/edit`, `/inspections/forms/[id]/start`
- API: `/api/inspections`, `/api/inspections/[id]`, `/api/inspection-schedules`, `/api/inspection-templates/*`
- Roles menu: tous (planifications/formulaires limites ADMIN, MANAGER)

## User stories

### US-INSP-001 - Consulter le hub inspections (P0)
En tant qu'utilisateur terrain, je veux voir la vue d'ensemble des inspections afin de prioriser mes actions.

Criteres d'acceptation:
1. Le hub affiche les inspections en cours, planifiees et recentes.
2. Les filtres permettent de reduire la liste selon des criteres metier.
3. Les erreurs de chargement sont affichees clairement.

### US-INSP-002 - Gerer les formulaires d'inspection (P1)
En tant que manager, je veux creer et modifier des formulaires afin de standardiser les controles.

Criteres d'acceptation:
1. Un formulaire peut etre cree et edite.
2. Un formulaire peut etre demarre depuis sa fiche.
3. Les roles non autorises ne voient pas les actions de gestion de formulaires.

### US-INSP-003 - Planifier les inspections (P1)
En tant que responsable conformite, je veux planifier des inspections afin d'assurer la periodicite reglementaire.

Criteres d'acceptation:
1. Une inspection peut etre programmee via la vue planifications.
2. La planification est persistante et visible dans les vues concernees.
3. Les conflits/erreurs de donnees sont remontes a l'utilisateur.

### US-INSP-004 - Executer et historiser une inspection (P0)
En tant que technicien, je veux saisir les resultats d'inspection afin de tracer la conformite du vehicule.

Criteres d'acceptation:
1. Chaque item peut etre marque conforme/non conforme.
2. Des preuves (notes/photos) peuvent etre attachees aux resultats.
3. Le rapport d'inspection final est disponible dans l'historique.

### US-INSP-005 - Modifier une inspection historique (P2)
En tant que manager, je veux corriger une inspection historisee afin de maintenir la qualite des donnees.

Criteres d'acceptation:
1. Une inspection existante peut etre ouverte en edition.
2. Les modifications sont journalisees et sauvegardees.
3. Les contraintes metier (statut, champs obligatoires) sont respectees.
