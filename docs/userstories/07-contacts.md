# Module Contacts

## Perimetre
- UI: `/contacts`, `/contacts/create`, `/contacts/[id]`, `/contacts/[id]/edit`
- API: `/api/contacts`, `/api/contacts/[id]`
- Roles menu: ADMIN, MANAGER, TECHNICIAN

## User stories

### US-CON-001 - Creer un contact (P0)
En tant qu'utilisateur back-office, je veux creer une fiche contact afin d'alimenter l'annuaire de l'entreprise.

Criteres d'acceptation:
1. Le formulaire impose les informations necessaires (identite, coordonnees, role).
2. Le contact cree est immediatement visible dans la liste.
3. Les validations de format (email, telephone) sont appliquees.

### US-CON-002 - Consulter et rechercher des contacts (P0)
En tant que manager, je veux retrouver rapidement un contact afin de faciliter les operations quotidiennes.

Criteres d'acceptation:
1. La liste propose recherche et filtrage.
2. Un clic sur un contact ouvre sa fiche detail.
3. Les etats vide/erreur/chargement sont geres.

### US-CON-003 - Modifier une fiche contact (P1)
En tant qu'utilisateur autorise, je veux mettre a jour une fiche contact afin de garder les donnees fiables.

Criteres d'acceptation:
1. Les champs modifiables sont pre-remplis depuis la fiche existante.
2. La sauvegarde met a jour la liste et la fiche detail.
3. Les changements invalides sont refuses avec message explicite.

### US-CON-004 - Utiliser les contacts pour les affectations (P1)
En tant que responsable flotte, je veux reutiliser les contacts dans les affectations vehicules afin d'eviter la ressaisie.

Criteres d'acceptation:
1. Les contacts sont disponibles dans les selecteurs d'affectation.
2. Les contacts inactifs n'apparaissent pas dans les selections operationnelles.
3. La coherence des donnees est respectee entre modules Contacts et Vehicules.
