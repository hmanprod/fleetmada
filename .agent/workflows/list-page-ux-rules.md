---
description: Règles UX pour les pages de type liste (tableau de données)
---

# Règles UX - Pages Liste

Ce document définit les règles UX à suivre pour toutes les pages affichant une liste d'éléments sous forme de tableau.

---

## 1. Structure Globale de la Page

La page est divisée en **5 zones verticales** dans cet ordre :

```
┌─────────────────────────────────────────────────────────────┐
│  ZONE 1 : HEADER                                            │
├─────────────────────────────────────────────────────────────┤
│  ZONE 2 : ONGLETS DE NAVIGATION                             │
├─────────────────────────────────────────────────────────────┤
│  ZONE 3 : BARRE D'ACTIONS (Filtres & Pagination)            │
├─────────────────────────────────────────────────────────────┤
│  ZONE 4 : DASHBOARD STATISTIQUES                            │
├─────────────────────────────────────────────────────────────┤
│  ZONE 5 : TABLEAU DE DONNÉES                                │
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
| Titre | Nom de la section au singulier ou pluriel (ex: "Historique de Service", "Problèmes") |
| Bouton principal | Toujours présent, libellé "+ Nouvelle Entrée" ou "+ Nouveau [Élément]" |
| Couleur Bouton | Vert `#008751` (hover `#007043`) |

---

## 3. Zone 2 : Onglets de Navigation

### Fonction
Permettre un **filtrage rapide par statut** sans ouvrir les filtres avancés.

### Règles
| Règle | Description |
|-------|-------------|
| Position | Alignés à gauche |
| Style actif | Texte vert `#008751` + Bordure basse verte `#008751` (2px) |
| Style inactif | Texte gris `text-gray-500` + Bordure transparente |
| Items | "Tous" + Statuts principaux (ex: Programmées, En cours, Terminées, Annulées) |

---

## 4. Zone 3 : Barre d'Actions (Filtres & Pagination)

Cette zone regroupe la recherche, les filtres rapides et la pagination dans un conteneur unifié.

### Style du conteneur
- Background : `bg-gray-50`
- Border : `border border-gray-200`
- Radius : `rounded-lg`
- Padding : `p-3`

### Disposition (Flexbox)
```
[🔍 Recherche...] [Select Rapide ▼] [Filtres (Icon)] .....espace..... [1-4 sur 4] [<] [>]
```

### Éléments
| Élément | Règle |
|---------|-------|
| **Recherche** | Input avec icône loupe à gauche. Placeholder "Rechercher..." |
| **Select Rapide** | (Optionnel) Un dropdown pour le filtre le plus courant (ex: Véhicule) |
| **Bouton Filtres** | Bouton blanc avec icône. Affiche un badge compteur si filtres actifs. |
| **Bouton Effacer** | Lien "Effacer" visible uniquement si des filtres sont actifs. |
| **Pagination Info** | Texte "X - Y sur Z" aligné à droite (`ml-auto` ou `flex-1 text-right`). |
| **Pagination Nav** | Boutons Précédent/Suivant (Chevrons). Désactivés si non applicable. |

---

## 5. Zone 4 : Dashboard Statistiques

Une ligne de cartes statistiques résumant les données affichées.

### Style
- Background : `bg-white`
- Border : `border border-gray-200`
- Shadow : `shadow-sm`
- Layout : Grid (cols-2 md:cols-4 ou 5)

### Contenu Recommandé
- **Total** : Nombre total d'entrées
- **Par Statut** : Comptes pour chaque statut important (Terminées, En cours, etc.)
- **Métrique Financière** : Coût Total (si applicable), affiché en couleur (ex: mauve).

---

## 6. Zone 5 : Tableau de Données

### Structure HTML & Classes
- Container : `bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden`
- Header (`<thead>`) : `bg-gray-50`
- Row (`<tr>`) : `hover:bg-gray-50 cursor-pointer border-b`

### Colonnes Standards

| Position | Type | Header Class | Cell Content |
|----------|------|--------------|--------------|
| **1** | Checkbox | `w-8 px-6 py-3` | Checkbox de sélection multiple |
| **2** | Entité | `uppercase text-xs` | Avatar/Initiale + Titre (Vert/Gras) + Sous-titre |
| **3** | Date | `uppercase text-xs` | Date formatée (DD/MM/YYYY) |
| **4** | Statut | `uppercase text-xs` | Badge coloré + Icône |
| **Var** | Priorité | `uppercase text-xs` | Badge simple (Gris/Bleu/Orange/Rouge) |
| **Var** | Métriques | `uppercase text-xs` | Compteur (km), Heures, etc. |
| **Var** | Tâches | `uppercase text-xs` | Liste tronquée (ex: 2 items + "... autres") |
| **Fin** | Coût | `uppercase text-xs` | Montant en gras (ex: "1500 MGA") |

### États Spéciaux
- **Chargement** : Spinner centré dans une ligne couvrant tout le tableau.
- **Vide** : Icône + Message "Aucune entrée" + Bouton d'action (Créer ou Effacer filtres).

---

## 7. Comportements & Interactions

1.  **Clic sur ligne** : Redirection vers la page de détail `/[entité]/[id]`. (Empêcher la propagation sur la checkbox).
2.  **Sélection** : La checkbox permet de sélectionner des éléments pour des actions groupées (via une barre flottante ou menu contextuel - non détaillé ici).
3.  **Pagination** : Les boutons < et > changent la page et rafraîchissent les données.
4.  **Filtres** :
    - Recherche : Filtrage local ou serveur (debounce).
    - Onglets : Modifient le filtre `status`.
    - Dropdowns : Modifient les filtres spécifiques.
    - Reset : "Effacer" réinitialise tout sauf peut-être les onglets selon le cas, ou tout.

---

## 8. Pages concernées dans FleetMada sur hmanprod/fleetmada

Cette structure doit être appliquée uniformément sur :
- `/issues/` - Détail d'un problème
- `/service/history/` - Détail d'une entrée de maintenance
- `/service/work-orders/` - Détail d'un ordre de travail
- `/service/programs/` - Détail d'un programme d'entretien
- `/fuel/history/` - Détail d'une entrée carburant
- `/fuel/charging/` - Détail d'une recharge électrique
- `/reminders/service/` - Détail d'un rappel de service
- `/reminders/vehicle-renewals/` - Détail d'un renouvellement
- `/inspections/history/` - Détail d'une inspection
- `/parts/` - Détail d'une pièce
- `/contacts/` - Détail d'un contact
- `/vehicles/list/` - Détail d'un véhicule
- `/vehicles/expense/` - Détail d'une dépense
- `/vendors/` - Détail d'un fournisseur
- `/places/` - Détail d'un lieu