---
description: Règles UX pour les pages de type détail/vue d'un élément
---

# Règles UX - Pages Détail

Ce document définit les règles UX à suivre pour toutes les pages affichant le détail d'un élément unique.

---

## 1. Structure Globale de la Page

La page est divisée en **2 zones principales** :

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ZONE HEADER : Navigation + Titre + Actions                            │
├───────────────────────────────────────────┬─────────────────────────────┤
│                                           │                             │
│  ZONE PRINCIPALE                          │  ZONE SIDEBAR               │
│  (Carte Détails)                          │  (Commentaires/Photos/Docs) │
│                                           │                             │
│                                           │                             │
└───────────────────────────────────────────┴─────────────────────────────┘
```

**Ratio recommandé** : 65% zone principale / 35% sidebar

---

## 2. Zone Header

### Disposition (de gauche à droite)

```
[ ← Retour Section ]  [ Titre de l'élément ]  ...espace...  [Avatar] [...] [Modifier] [Action Principale]
```

### Éléments

| Position | Élément | Description |
|----------|---------|-------------|
| **Gauche** | Lien retour | "← [Nom de la section]" - Retourne à la page liste |
| **Gauche** | Titre | Titre/résumé de l'élément affiché |
| **Droite** | Avatar assigné | Initiales de la personne assignée (optionnel) |
| **Droite** | Bouton "..." | Menu déroulant avec actions secondaires (Supprimer, Dupliquer, etc.) |
| **Droite** | Bouton "Modifier" | Navigue vers la page d'édition `/[entité]/[id]/edit` |
| **Droite** | Bouton action principale | Action contextuelle (Résoudre, Compléter, Valider...) - Style vert |

### Règles

| Règle | Description |
|-------|-------------|
| Lien retour | Toujours visible, permet de revenir à la liste |
| Titre | Affiche le nom/résumé principal de l'élément |
| Bouton action principale | Couleur accent verte (#008751), toujours en dernier |
| Menu "..." | Contient les actions moins fréquentes |

---

## 3. Zone Principale - Carte Détails

### Structure

```
┌─────────────────────────────────────────────┐
│  Détails                                    │
├─────────────────────────────────────────────┤
│  TOUS LES CHAMPS                            │
│                                             │
│  Label 1          Valeur 1                  │
│  ─────────────────────────────────────────  │
│  Label 2          Valeur 2                  │
│  ─────────────────────────────────────────  │
│  Label 3          Valeur 3                  │
│  ...                                        │
└─────────────────────────────────────────────┘
```

### Règles d'affichage des champs

| Règle | Description |
|-------|-------------|
| **Disposition** | Deux colonnes : Label (gauche) + Valeur (droite) |
| **Séparateur** | Ligne fine entre chaque champ |
| **En-tête section** | "TOUS LES CHAMPS" ou nom de groupe en majuscules grises |
| **Ordre des champs** | ID/Référence → Statut → Résumé → Détails → Relations → Dates |

### Types de valeurs et leur formatage

| Type | Formatage |
|------|-----------|
| **ID/Référence** | Préfixé avec # (ex: #1lipce) |
| **Statut** | Badge coloré (OPEN=jaune, RESOLVED=vert, CLOSED=gris) |
| **Texte** | Texte simple, noir |
| **Priorité** | Texte coloré avec icône "!" (CRITICAL=rouge, HIGH=orange, MEDIUM=jaune, LOW=bleu) |
| **Entité liée** | Image miniature + Nom cliquable (vert) + Badge identifiant |
| **Date** | Format complet avec heure (ex: "18 janv. 2026, 08:39") |
| **Personne** | Nom complet ou badge avec nom |
| **Valeur vide** | Tiret "—" ou non affiché |

### Champs standards à afficher selon le contexte

| Entité | Champs recommandés |
|--------|-------------------|
| **Issue** | ID, Statut, Résumé, Priorité, Véhicule, Date signalement, Signalé par, Assigné à, Source |
| **Service Entry** | ID, Statut, Véhicule, Date, Compteur, Vendeur, Coût total, Tâches |
| **Reminder** | ID, Type, Véhicule, Échéance, Seuil, Assigné à |
| **Vehicle Renewal** | ID, Type, Véhicule, Date expiration, Coût, Statut |

---

## 4. Zone Sidebar - EntitySidebar

### Structure

```
┌───────────────────────────┬──┐
│  Comments       🔄 ✕      │💬│
├───────────────────────────┤📷│
│                           │📄│
│  [Contenu dynamique]      │  │
│                           │  │
├───────────────────────────┤  │
│  [HR] Add a comment...    │  │
│  📎 Attach                │  │
└───────────────────────────┴──┘
```

### Onglets de la sidebar

| Onglet | Icône | Contenu |
|--------|-------|---------|
| **Comments** | 💬 | Liste des commentaires + formulaire d'ajout |
| **Photos** | 📷 | Galerie de photos attachées + upload |
| **Documents** | 📄 | Liste des documents attachés + upload |

### Règles

| Règle | Description |
|-------|-------------|
| **Onglet actif** | Mis en évidence visuellement |
| **Bouton refresh** | 🔄 Permet de recharger les données |
| **Bouton fermer** | ✕ Ferme la sidebar (si applicable) |
| **Zone commentaire** | Toujours visible en bas, avec avatar utilisateur |
| **Bouton Attach** | Permet d'ajouter des fichiers au commentaire |

### États de la sidebar

| État | Affichage |
|------|-----------|
| **Chargement** | Spinner centré |
| **Vide** | Icône + "No comments yet." / "No photos yet." |
| **Avec contenu** | Liste scrollable des éléments |
| **Erreur** | Message d'erreur + bouton retry |

---

## 5. Comportements Interactifs

### Navigation

| Action | Comportement |
|--------|--------------|
| Clic sur "← Retour" | Retour à la page liste |
| Clic sur "Modifier" | Navigation vers `/[entité]/[id]/edit` |
| Clic sur entité liée | Navigation vers le détail de cette entité |
| Clic sur onglet sidebar | Change le contenu affiché |

### Actions

| Action | Comportement |
|--------|--------------|
| Action principale (Résoudre, etc.) | Exécute l'action + feedback toast |
| Menu "..." → Supprimer | Confirmation + suppression + redirection liste |
| Ajout commentaire | POST API + refresh liste commentaires |
| Upload photo/document | POST API + refresh galerie |

---

## 6. Vérification de la Connexion API

### Endpoints nécessaires

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/[entité]/[id]` | GET | Récupère les détails de l'élément |
| `/api/[entité]/[id]` | PUT | Met à jour l'élément |
| `/api/[entité]/[id]` | DELETE | Supprime l'élément |
| `/api/[entité]/[id]/comments` | GET/POST | Gestion des commentaires |
| `/api/[entité]/[id]/photos` | GET/POST | Gestion des photos |
| `/api/documents` | POST | Upload de documents |

### Points de vérification

1. **GET détail** : Vérifie que toutes les relations sont chargées (include Prisma)
2. **Actions** : Vérifie que PUT/DELETE fonctionnent avec bon retour
3. **Sidebar** : Vérifie que les commentaires/photos se chargent correctement
4. **Upload** : Vérifie que l'upload de fichiers fonctionne

---

## 7. Checklist d'Implémentation

Avant de considérer une page détail comme terminée, vérifier :

### Header
- [ ] Lien retour "← [Section]" fonctionnel
- [ ] Titre de l'élément affiché
- [ ] Bouton "Modifier" → navigue vers `/edit`
- [ ] Bouton action principale avec bon libellé
- [ ] Menu "..." avec actions secondaires (Supprimer, etc.)

### Zone Principale
- [ ] Carte "Détails" avec tous les champs
- [ ] Labels à gauche, valeurs à droite
- [ ] Séparateurs entre les champs
- [ ] Formatage correct (badges, dates, liens)
- [ ] Entités liées cliquables

### Sidebar
- [ ] Onglet Comments avec liste + ajout
- [ ] Onglet Photos avec galerie + upload
- [ ] Onglet Documents avec liste + upload
- [ ] États vides gérés
- [ ] Chargement géré

### API
- [ ] GET /api/[entité]/[id] fonctionne
- [ ] Relations chargées (vehicle, contact, etc.)
- [ ] Actions (update status, delete) fonctionnent

---

## 8. Exemple de Structure JSX

```tsx
<div className="page-container">
  {/* HEADER */}
  <div className="header">
    <div className="left">
      <Link href="/entities">← Entités</Link>
      <h1>{entity.title}</h1>
    </div>
    <div className="right">
      <Avatar initials="LR" />
      <DropdownMenu>...</DropdownMenu>
      <Button onClick={() => router.push(`/entities/${id}/edit`)}>
        Modifier
      </Button>
      <Button variant="primary" onClick={handleMainAction}>
        Résoudre
      </Button>
    </div>
  </div>

  {/* CONTENT */}
  <div className="content-grid">
    {/* Zone Principale */}
    <div className="main-card">
      <h2>Détails</h2>
      <div className="fields">
        <div className="field">
          <span className="label">ID</span>
          <span className="value">#{entity.id}</span>
        </div>
        <div className="field">
          <span className="label">Statut</span>
          <Badge>{entity.status}</Badge>
        </div>
        {/* ... autres champs */}
      </div>
    </div>

    {/* Sidebar */}
    <EntitySidebar
      entityType="issue"
      entityId={id}
    />
  </div>
</div>
```

---

## 9. Pages concernées dans FleetMada

Cette structure s'applique à :
- `/issues/[id]` - Détail d'un problème
- `/service/history/[id]` - Détail d'une entrée de maintenance
- `/service/work-orders/[id]` - Détail d'un ordre de travail
- `/fuel/history/[id]` - Détail d'une entrée carburant
- `/reminders/service/[id]` - Détail d'un rappel de service
- `/reminders/vehicle-renewals/[id]` - Détail d'un renouvellement
- `/inspections/history/[id]` - Détail d'une inspection
- `/parts/[id]` - Détail d'une pièce
- `/contacts/[id]` - Détail d'un contact
- `/vehicles/[id]` - Détail d'un véhicule