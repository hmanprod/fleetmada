# Module Tableau de bord

## Perimetre
- UI: `/dashboard` (et route `/` selon navigation)
- API: `/api/dashboard/overview`, `/api/dashboard/vehicles`, `/api/dashboard/maintenance`, `/api/dashboard/fuel`, `/api/dashboard/costs`, `/api/dashboard/inspections`, `/api/dashboard/issues`, `/api/dashboard/parts`
- Roles menu: ADMIN, MANAGER, TECHNICIAN, DRIVER

## User stories

### US-DASH-001 - Visualiser les KPI globaux (P0)
En tant que gestionnaire de flotte, je veux voir les indicateurs principaux afin de piloter l'activite au quotidien.

Criteres d'acceptation:
1. Le dashboard affiche un etat chargeur pendant la recuperation des donnees.
2. Les indicateurs cles s'affichent par domaine (vehicules, maintenance, carburant, inspections, problemes, pieces).
3. En cas d'erreur API, un etat d'erreur visible est affiche.

### US-DASH-002 - Consulter les tendances par domaine (P1)
En tant que manager, je veux consulter les vues par domaine afin d'identifier rapidement les ecarts.

Criteres d'acceptation:
1. Les donnees de chaque domaine proviennent des endpoints dedies.
2. Les donnees sont coherentes avec les modules source (ex: fuel, service, issues).
3. Les valeurs sont rafraichissables sans rechargement complet de la page.

### US-DASH-003 - Acces role-based au dashboard (P0)
En tant qu'admin produit, je veux que le dashboard soit accessible selon les roles autorises afin de conserver une experience coherente.

Criteres d'acceptation:
1. Les roles autorises voient l'entree de menu dashboard.
2. Un utilisateur non authentifie est redirige vers la connexion.
3. Les tuiles ne doivent pas exposer de donnees si la session est invalide.

### US-DASH-004 - Navigation vers les modules operationnels (P1)
En tant qu'utilisateur operationnel, je veux acceder rapidement aux modules cibles depuis le dashboard afin de traiter une action sans friction.

Criteres d'acceptation:
1. Les raccourcis pointent vers les routes fonctionnelles existantes.
2. Le contexte de navigation est preserve (retour navigateur fonctionnel).
3. Les raccourcis respectent les permissions de role.
