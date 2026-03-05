# Module Parametres

## Perimetre
- UI: `/settings/general`, `/settings/user-profile`, `/settings/login-password`, `/settings/groups`, `/settings/parts/categories`, `/settings/parts/manufacturers`, `/settings/parts/locations`
- API: `/api/settings/general`, `/api/settings/preferences`, `/api/settings/security`, `/api/groups`, `/api/groups/[id]`, `/api/profile`
- Acces: utilisateur authentifie (avec niveaux de permission selon section)

## User stories

### US-SET-001 - Gerer le profil utilisateur (P0)
En tant qu'utilisateur connecte, je veux modifier mon profil afin de garder mes informations personnelles a jour.

Criteres d'acceptation:
1. Le profil affiche les donnees du compte connecte.
2. Les modifications valides sont sauvegardees via API profil.
3. Les preferences d'affichage utilisateur sont persistantes.

### US-SET-002 - Gerer les parametres generaux entreprise (P0)
En tant qu'admin entreprise, je veux configurer les parametres generaux afin d'aligner l'application avec mon organisation.

Criteres d'acceptation:
1. Les sections principales de parametres generaux sont modifiables.
2. Une action de sauvegarde persiste les changements.
3. Les erreurs de sauvegarde sont remontees clairement.

### US-SET-003 - Gerer identifiant et mot de passe (P0)
En tant qu'utilisateur, je veux mettre a jour mes identifiants afin de securiser mon acces.

Criteres d'acceptation:
1. Le module permet la mise a jour du mot de passe avec validations.
2. Les parametres de connexion (onglet login) sont consultables/modifiables selon droits.
3. Les integrations tierces (ex: Google) peuvent etre deconnectees si configurees.

### US-SET-004 - Gerer les groupes d'utilisateurs (P1)
En tant qu'admin, je veux administrer les groupes afin d'organiser les acces et responsabilites.

Criteres d'acceptation:
1. Un groupe peut etre cree, edite et supprime.
2. Les erreurs de contraintes (doublons, groupe invalide) sont gerees.
3. Les changements sont visibles dans la liste sans rechargement manuel.

### US-SET-005 - Gerer les referentiels pieces et emplacements (P1)
En tant que responsable magasin, je veux administrer categories/fabricants/emplacements afin d'assurer une nomenclature propre.

Criteres d'acceptation:
1. Categories, fabricants et emplacements sont administrables depuis Parametres.
2. Les emplacements peuvent pointer vers les lieux operationnels (`/places`).
3. Ces referentiels sont reutilises dans les formulaires pieces.
