# Module Pieces

## Perimetre
- UI: `/parts`, `/parts/create`, `/parts/[id]`, `/parts/[id]/edit`
- API: `/api/parts`, `/api/parts/[id]`, `/api/parts/categories`, `/api/parts/manufacturers`, `/api/parts/stats`, `/api/parts/low-stock`, `/api/parts/usage-analytics`
- Roles menu: ADMIN, MANAGER, TECHNICIAN

## User stories

### US-PAR-001 - Gerer le catalogue de pieces (P0)
En tant que magasinier, je veux creer et consulter des pieces afin de disposer d'un referentiel fiable.

Criteres d'acceptation:
1. Une piece peut etre creee avec code, designation, categorie et fabricant.
2. La liste des pieces supporte recherche et filtres.
3. La fiche detail d'une piece est accessible depuis la liste.

### US-PAR-002 - Suivre le stock et les seuils (P0)
En tant que responsable stock, je veux suivre le niveau de stock afin d'eviter les ruptures.

Criteres d'acceptation:
1. Le stock courant et le seuil mini sont visibles.
2. Les pieces en stock bas sont detectees via endpoint dedie.
3. Les alertes stock bas sont exploitables en priorisation quotidienne.

### US-PAR-003 - Analyser l'usage des pieces (P1)
En tant que manager maintenance, je veux analyser l'usage des pieces afin d'optimiser l'approvisionnement.

Criteres d'acceptation:
1. Des statistiques et analytics d'usage sont accessibles.
2. Les analyses peuvent etre ventilees par periode/vehicule si disponible.
3. Les donnees d'analyse sont coherentes avec les consommations declarees.

### US-PAR-004 - Maintenir les referentiels pieces (P1)
En tant qu'admin, je veux gerer categories et fabricants afin de normaliser la qualite des donnees.

Criteres d'acceptation:
1. Les categories et fabricants sont creables/modifiables/supprimables via Parametres.
2. Les formulaires de pieces reutilisent ces referentiels.
3. La suppression d'un referentiel utilise est encadree (blocage ou migration).
