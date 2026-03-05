# Module Problemes (Issues)

## Perimetre
- UI: `/issues`, `/issues/create`, `/issues/[id]`, `/issues/[id]/edit`
- API: `/api/issues`, `/api/issues/[id]`
- Roles menu: ADMIN, MANAGER, TECHNICIAN, DRIVER

## User stories

### US-ISS-001 - Signaler un probleme (P0)
En tant qu'utilisateur terrain, je veux declarer un probleme afin de lancer sa resolution.

Criteres d'acceptation:
1. Un probleme peut etre cree avec titre, priorite, description et vehicule cible.
2. L'utilisateur peut joindre des documents/photos au signalement.
3. Le probleme cree apparait immediatement dans la liste.

### US-ISS-002 - Consulter et filtrer les problemes (P0)
En tant que manager, je veux filtrer les problemes par statut/priorite afin de traiter les urgences en premier.

Criteres d'acceptation:
1. La liste supporte la recherche et les filtres principaux.
2. Le detail d'un probleme est accessible depuis la liste.
3. Les compteurs/listes se mettent a jour apres creation/modification.

### US-ISS-003 - Mettre a jour le cycle de vie d'un probleme (P1)
En tant que technicien, je veux changer le statut d'un probleme afin de refleter son avancement.

Criteres d'acceptation:
1. Les statuts autorises peuvent etre modifies depuis le detail/edition.
2. Les transitions invalides sont bloquees avec message.
3. La date de mise a jour est tracee.

### US-ISS-004 - Collaborer sur la resolution (P1)
En tant qu'equipe maintenance, je veux ajouter des commentaires/preuves afin de centraliser le contexte de resolution.

Criteres d'acceptation:
1. Les commentaires sont visibles dans l'ordre chronologique.
2. Les pieces jointes associees restent accessibles.
3. Les erreurs d'upload n'interrompent pas la sauvegarde des donnees textuelles.
