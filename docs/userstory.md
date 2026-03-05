# User Stories - FleetMada

Ce document est l'index central des user stories du produit.  
Le detail fonctionnel est decoupe par module dans `docs/userstories/` pour eviter un fichier monolithique.

## Sources de verite utilisees
- Menu gauche (reference des modules): `components/Sidebar.tsx`
- Parcours d'authentification: `app/(auth)/*`, `lib/auth-context.tsx`, `lib/auth-api.ts`, `middleware.ts`
- Comportements reels: routes UI `app/(main)/**` et API `app/api/**`

## Convention de redaction
- Format: *En tant que [role], je veux [objectif], afin de [valeur]*
- IDs: `US-<MODULE>-NNN`
- Priorites:
  - `P0` = indispensable MVP
  - `P1` = important
  - `P2` = optimisation

## Modules et fichiers

### 0. Authentification
- [00-authentification-onboarding.md](./userstories/00-authentification-onboarding.md)

### 1. Modules du menu gauche (ordre du produit)
- [01-tableau-de-bord.md](./userstories/01-tableau-de-bord.md)
- [02-vehicules.md](./userstories/02-vehicules.md)
- [03-inspections.md](./userstories/03-inspections.md)
- [04-problemes.md](./userstories/04-problemes.md)
- [05-rappels.md](./userstories/05-rappels.md)
- [06-entretien.md](./userstories/06-entretien.md)
- [07-contacts.md](./userstories/07-contacts.md)
- [08-fournisseurs.md](./userstories/08-fournisseurs.md)
- [09-carburant-energie.md](./userstories/09-carburant-energie.md)
- [10-pieces.md](./userstories/10-pieces.md)
- [11-parametres.md](./userstories/11-parametres.md)

### 2. Modules detectes dans le code mais hors menu gauche actuel
- [12-modules-hors-menu.md](./userstories/12-modules-hors-menu.md)

## Notes
- Le menu gauche reste la reference pour la priorisation des modules.
- Les modules hors menu sont maintenus dans un fichier dedie pour ne pas perdre la couverture fonctionnelle du code.
- Ce backlog est vivant: les stories peuvent etre affinees sprint par sprint (ajout de donnees, regles de gestion, edge cases).
