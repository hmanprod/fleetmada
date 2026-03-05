# Module Fournisseurs

## Perimetre
- UI: `/vendors`, `/vendors/create`, `/vendors/[id]`, `/vendors/[id]/edit`
- API: `/api/vendors`, `/api/vendors/[id]`
- Roles menu: ADMIN, MANAGER, TECHNICIAN

## User stories

### US-VEN-001 - Creer un fournisseur (P0)
En tant qu'acheteur, je veux creer un fournisseur afin de structurer les achats et prestations.

Criteres d'acceptation:
1. Le fournisseur est cree avec informations generales et coordonnees.
2. Une classification fournisseur peut etre renseignee.
3. Le fournisseur apparait dans la liste et les selecteurs modules (fuel, depenses, pieces).

### US-VEN-002 - Rechercher et filtrer les fournisseurs (P1)
En tant que gestionnaire, je veux filtrer les fournisseurs afin de trouver rapidement le bon partenaire.

Criteres d'acceptation:
1. La liste supporte recherche textuelle et filtres metier.
2. Les resultats sont pagines si necessaire.
3. L'acces detail fonctionne depuis la liste.

### US-VEN-003 - Mettre a jour la fiche fournisseur (P1)
En tant qu'utilisateur autorise, je veux modifier un fournisseur afin de garder les informations commerciales a jour.

Criteres d'acceptation:
1. Les modifications sont persistantes et visibles apres rafraichissement.
2. Les champs obligatoires restent valides.
3. Les erreurs API sont affichees clairement a l'utilisateur.

### US-VEN-004 - Associer les fournisseurs aux transactions (P1)
En tant que controleur de gestion, je veux rattacher depenses et approvisionnements aux fournisseurs afin d'analyser les couts par partenaire.

Criteres d'acceptation:
1. Les selecteurs fournisseurs sont disponibles dans les formulaires concernes.
2. Le fournisseur selectionne est stocke sur l'enregistrement cree.
3. Les analyses/couts recuperent correctement ces associations.
