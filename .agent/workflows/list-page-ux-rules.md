---
description: Règles UX pour les pages de type liste (tableau de données)
---

# Règles UX - Pages Liste

Ce document définit les règles UX à suivre pour toutes les pages affichant une liste d'éléments sous forme de tableau.

---

## 1. Structure Globale de la Page

La page est divisée en **4 zones verticales** dans cet ordre :

```
┌─────────────────────────────────────────────────────────────┐
│  ZONE 1 : HEADER                                            │
├─────────────────────────────────────────────────────────────┤
│  ZONE 2 : ONGLETS DE NAVIGATION                             │
├─────────────────────────────────────────────────────────────┤
│  ZONE 3 : BARRE DE FILTRES                                  │
├─────────────────────────────────────────────────────────────┤
│  ZONE 4 : TABLEAU DE DONNÉES                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Zone 1 : Header

### Disposition
- **Gauche** : Titre de la page
- **Droite** : Bouton d'action principal

### Règles
| Élément | Règle |
|---------|-------|
| Titre | Nom de la section au singulier ou pluriel (ex: "Problèmes", "Historique Service") |
| Bouton principal | Toujours présent, libellé "+ Nouveau [Élément]" |
| Actions secondaires | Si nécessaires, placées à gauche du bouton principal (dropdowns, etc.) |

---

## 3. Zone 2 : Onglets de Navigation

### Fonction
Permettre un **filtrage rapide par statut** sans ouvrir les filtres avancés.

### Règles
| Règle | Description |
|-------|-------------|
| Position | Alignés à gauche, séparés par un espace régulier |
| Premier onglet | Toujours "Tous" (affiche tous les éléments sans filtre) |
| Onglets suivants | Correspondent aux statuts principaux de l'entité |
| Onglet actif | Visuellement distinct (souligné + couleur accent) |
| Compteurs | Optionnel : afficher le nombre d'éléments par onglet |

### Exemples de statuts selon le contexte
- **Problèmes** : Tous / Ouverts / En retard / Résolus / Fermés
- **Rappels** : Tous / À venir / En retard / Complétés
- **Entrées service** : Tous / Planifiés / En cours / Complétés

---

## 4. Zone 3 : Barre de Filtres

### Disposition (de gauche à droite)
```
[ 🔍 Recherche...          ] | [Filtre 1 ▼] | [Filtre 2 ▼] | [🔧 Filters]
```

### Règles

| Élément | Règle |
|---------|-------|
| **Champ recherche** | Toujours en premier, occupe l'espace disponible (flex-1) |
| **Filtres dropdown** | Maximum 2-3 filtres rapides (les plus utilisés) |
| **Bouton Filters** | Toujours en dernier, ouvre les filtres avancés (sidebar cf FiltersSidebar component) |
| **Badge compteur** | Si filtres avancés actifs, afficher un badge avec le nombre |
| **Bouton Clear** | Apparaît seulement si des filtres sont actifs |

### Filtres dropdown recommandés par contexte
- Assignation (Assigné à)
- Groupement (Groupe, Véhicule, etc.)
- Priorité ou Statut selon besoin

---

## 5. Zone 4 : Tableau de Données

### Structure des colonnes

| Position | Type de colonne | Description |
|----------|-----------------|-------------|
| **1ère** | Checkbox | Sélection multiple pour actions groupées |
| **2ème** | Indicateur visuel | Priorité, statut ou icône type |
| **3ème** | Identifiant principal | Nom, titre ou référence de l'élément |
| **4ème-Nème** | Données contextuelles | Colonnes spécifiques à l'entité |
| **Avant-dernière** | Date principale | Date de création, échéance, etc. |
| **Dernière** | Action | Chevron → indiquant la navigation |

### Règles des lignes

| Règle | Description |
|-------|-------------|
| **Ligne cliquable** | Toute la ligne est cliquable et navigue vers le détail |
| **Hover** | Surbrillance au survol pour feedback visuel |
| **Chevron final** | Toujours présent pour indiquer l'action de navigation |
| **Données manquantes** | Afficher "—" (tiret long) pour les valeurs vides |

### Types de colonnes et leur formatage

| Type | Formatage |
|------|-----------|
| **Priorité** | Icône colorée + texte (CRITICAL=rouge, HIGH=orange, MEDIUM=jaune, LOW=bleu) |
| **Statut** | Badge coloré avec texte en majuscules |
| **Date** | Format local (DD/MM/YYYY pour fr-FR) |
| **Personne** | Prénom + Nom |
| **Entité liée** | Image miniature + Nom + Identifiant secondaire |
| **Labels/Tags** | Petits badges colorés |

---

## 6. Comportements Interactifs

### Navigation

| Action utilisateur | Comportement |
|--------------------|--------------|
| Clic sur une ligne | Navigation vers `/[entité]/[id]` (page détail) |
| Clic sur onglet | Filtre la liste par ce statut |
| Clic sur bouton "+ Nouveau" | Navigation vers `/[entité]/create` |

### Filtrage

| Action utilisateur | Comportement |
|--------------------|--------------|
| Saisie dans recherche | Filtre instantané (avec debounce 300ms) |
| Changement dropdown | Filtre immédiat + mise à jour URL |
| Bouton Filters | Ouvre sidebar de filtres avancés |
| Bouton Clear | Réinitialise tous les filtres |

### États de la page

| État | Affichage |
|------|-----------|
| **Chargement** | Spinner centré + message "Chargement..." |
| **Erreur** | Bandeau d'erreur avec message + bouton fermer |
| **Liste vide** | Message explicatif + bouton d'action (créer ou clear filtres) |
| **Liste vide (filtres actifs)** | Message + bouton "Effacer les filtres" |

---

## 7. Règles de Persistance

| Élément | Persistance |
|---------|-------------|
| Onglet actif | Dans l'URL (`?status=OPEN`) |
| Recherche | Dans l'URL (`?search=...`) |
| Filtres dropdown | Dans l'URL |
| Filtres avancés | Application locale (réinitialisés au rechargement) |
| Page de pagination | Dans l'URL (`?page=2`) |

---

## 8. Vérification de la Connexion API

Avant de finaliser une page liste, **vérifier que l'API fonctionne correctement** :

### Checklist API

| Vérification | Description |
|--------------|-------------|
| **Route API existante** | Vérifier que l'endpoint `/api/[entité]` existe et est accessible |
| **Méthode GET** | L'API répond correctement à une requête GET avec les données |
| **Filtres fonctionnels** | Les paramètres `?search=`, `?status=`, `?page=` sont traités |
| **Pagination** | L'API retourne `page`, `limit`, `totalCount`, `hasNext`, `hasPrev` |
| **Données complètes** | Toutes les colonnes affichées ont des données correspondantes |
| **Relations chargées** | Les entités liées (véhicule, contact, etc.) sont incluses dans la réponse |

### Points de vérification

1. **Ouvrir la console navigateur** (F12 → Network)
2. **Charger la page** et observer les appels API
3. **Vérifier la réponse** : statut 200 + données JSON valides
4. **Tester les filtres** : chaque filtre doit déclencher un nouvel appel API
5. **Tester la recherche** : le terme saisi doit apparaître dans l'URL de l'appel

### Erreurs courantes à surveiller

| Erreur | Cause probable |
|--------|----------------|
| 401 Unauthorized | Token d'authentification manquant ou expiré |
| 404 Not Found | Route API inexistante |
| 500 Internal Server Error | Erreur Prisma ou logique serveur |
| Données vides | Filtre trop restrictif ou base de données vide |
| Données incomplètes | Relations non incluses dans la requête Prisma |

---

## 9. Checklist d'Implémentation

Avant de considérer une page liste comme terminée, vérifier :

- [ ] Header avec titre + bouton "+ Nouveau"
- [ ] Onglets de statut fonctionnels
- [ ] Barre de filtres avec recherche + dropdowns + bouton Filters
- [ ] Tableau avec checkbox + colonnes de données + chevron final
- [ ] Lignes cliquables vers page détail
- [ ] Hover visible sur les lignes
- [ ] État de chargement géré
- [ ] État d'erreur géré
- [ ] État liste vide géré
- [ ] Filtres reflétés dans l'URL

---

## 10. Exemple de Structure JSX

```tsx
<div className="page-container">
  {/* ZONE 1: Header */}
  <div className="header">
    <h1>Titre de la Page</h1>
    <button>+ Nouveau Élément</button>
  </div>

  {/* ZONE 2: Onglets */}
  <div className="tabs">
    <button>Tous</button>
    <button>Statut 1</button>
    <button>Statut 2</button>
  </div>

  {/* ZONE 3: Filtres */}
  <div className="filters-bar">
    <input type="search" placeholder="Rechercher..." />
    <select>Filtre 1</select>
    <select>Filtre 2</select>
    <button>Filters</button>
  </div>

  {/* ZONE 4: Tableau */}
  <table>
    <thead>...</thead>
    <tbody>
      {items.map(item => (
        <tr onClick={() => navigate(`/entity/${item.id}`)}>
          ...
          <td><ChevronRight /></td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

## 11. Pages concernées dans FleetMada

Cette structure s'applique à :
- `/issues` - Problèmes
- `/service/history` - Historique de maintenance
- `/service/work-orders` - Historique de demande de maintenance
- `/service/tasks` - Historique des taches de maintenance
- `/service/programs` - Historique des programmes  de maintenance
- `/fuel/history` - Historique carburant
- `/fuel/charging` - Historique energie
- `/reminders/service` - Rappels de service
- `/reminders/vehicle-renewals` - Renouvellements véhicules
- `/inspections/history` - Inspections
- `/parts` - Pièces détachées
- `/places` - Localisations
- `/contacts` - Contacts
- `/vehicles/list` - Véhicules
- `/vehicles/expense` - Dépenses
- `/vehicles/meter-history` - Historique du kilométrage