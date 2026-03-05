# Modules hors menu gauche actuel

Ce fichier couvre des modules presents dans le code source mais non exposes directement dans le menu gauche actuel.

## 1) Documents

### Perimetre
- UI: `/documents`, `/documents/upload`, `/documents/[id]`
- API: `/api/documents`, `/api/documents/upload`, `/api/documents/[id]`, `/api/documents/search`, `/api/documents/by-attachment`

### User stories

#### US-DOC-001 - Televerser des documents (P0)
En tant qu'utilisateur, je veux televerser des documents afin d'attacher des justificatifs aux operations.

Criteres d'acceptation:
1. L'upload accepte plusieurs fichiers et metadonnees.
2. Les fichiers uploades apparaissent dans la liste des documents.
3. Les erreurs d'upload sont affichees sans perte de contexte utilisateur.

#### US-DOC-002 - Rechercher et filtrer les documents (P1)
En tant que gestionnaire, je veux rechercher par nom/type/tri afin de retrouver rapidement un document.

Criteres d'acceptation:
1. La recherche texte et les filtres MIME/tri sont disponibles.
2. La pagination est supportee sur la liste.
3. L'ouverture d'un document detail fonctionne depuis la grille/liste.

#### US-DOC-003 - Gerer le cycle de vie du document (P1)
En tant qu'utilisateur autorise, je veux previsualiser, telecharger, modifier et supprimer un document afin de maintenir une base documentaire propre.

Criteres d'acceptation:
1. Le detail document permet preview/download/share/edit/delete.
2. Les etiquettes/metadonnees sont modifiables.
3. Une suppression demandee requiert confirmation utilisateur.

## 2) Lieux (Places)

### Perimetre
- UI: `/places`, `/places/create`, `/places/[id]`, `/places/[id]/edit`
- API: `/api/places`, `/api/places/[id]`, `/api/places/geocode`, `/api/places/reverse-geocode`, `/api/places/nearby`, `/api/places/search`

### User stories

#### US-PLA-001 - Gerer les lieux operationnels (P1)
En tant que gestionnaire operations, je veux gerer les sites (bureaux, stations, centres) afin de structurer le reseau terrain.

Criteres d'acceptation:
1. Un lieu peut etre cree, consulte, modifie et supprime.
2. La liste est filtrable par type de lieu.
3. Le detail lieu affiche les informations principales et l'etat actif/inactif.

#### US-PLA-002 - Exploiter la geolocalisation (P2)
En tant qu'utilisateur operations, je veux utiliser geocodage et apercu cartographique afin de fiabiliser les adresses.

Criteres d'acceptation:
1. L'adresse peut etre convertie en coordonnees via geocode.
2. Un apercu cartographique est disponible sur detail/edition.
3. Les erreurs de geocodage sont gerables sans perte des donnees saisies.

## 3) Rapports & Notifications

### Perimetre
- UI: `/reports`
- API: `/api/reports`, `/api/reports/generate`, `/api/notifications`

### User stories

#### US-REP-001 - Generer des rapports (P1)
En tant que manager, je veux generer des rapports afin de partager des analyses de flotte.

Criteres d'acceptation:
1. Le module propose des templates de rapports.
2. Un rapport peut etre genere et enregistre.
3. Les erreurs de generation sont affichees de maniere actionnable.

#### US-REP-002 - Gerer les favoris et partages (P2)
En tant qu'utilisateur metier, je veux marquer mes rapports favoris et les partager afin de gagner du temps en collaboration.

Criteres d'acceptation:
1. Un rapport peut etre marque favori/enregistre.
2. Les actions de partage/export sont disponibles selon permissions.
3. Les listes/filtres de rapports refleteront l'etat favori/enregistre.

#### US-NOTIF-001 - Consulter les notifications (P1)
En tant qu'utilisateur, je veux consulter mes notifications afin de ne pas rater les alertes importantes.

Criteres d'acceptation:
1. Les notifications sont recuperees depuis l'endpoint dedie.
2. Les notifications affichent type, priorite et contexte.
3. Les erreurs de chargement sont traitees proprement en UI.
