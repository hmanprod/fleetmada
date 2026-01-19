---
description: Règles UX pour les pages de type création et modification d'une entité (formulaires)
---

# Règles UX - Création & Modification

Ce document définit les règles UX à suivre pour toutes les pages de formulaires permettant de créer ou de modifier une entité dans le système.

---

## 1. Structure Globale de la Page

La page est divisée en **2 zones principales** :

```
┌─────────────────────────────────────────────────────────────┐
│  ZONE 1 : HEADER (Titre + Boutons rapides)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ZONE 2 : CONTENU PRINCIPAL (Formulaire groupé par cartes)  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```


---

## 2. Zone 1 : Header

### Disposition
- **Extrême Gauche** : Lien de retour avec chevron et nom de la catégorie (ex: `< Demandes d'entretien`).
- **Centre-Gauche** : Titre de création en gras (ex: **Nouvel ordre de travail**).
- **Droite** : Groupe d'actions rapides :
    - Bouton "Annuler" (style lien texte discret).
    - Bouton Split "Enregistrer et..." (dropdown pour "Nouveau", "Fermer", etc.).
    - Bouton Principal "Enregistrer [Entité]" (fond vert `#008751`, texte blanc).

### Règles
| **Lien Retour** | Toujours présent en haut à gauche, pointe vers la liste parente (création) ou la page détail (modification). |
| **Titre** | Format "Nouveau [Nom de l'entité]" ou "Modifier [Nom] #[ID]". |
| **Actions** | Les boutons de sauvegarde peuvent être dupliqués ici pour les longs formulaires. |

---

## 3. Zone 2 : Contenu Principal (Formulaire)

### Groupement
Le formulaire doit être organisé en **Cartes (Cards)** thématiques pour éviter une surcharge cognitive.

### Entités Liées (Sélection)
| Règle | Description |
|-------|-------------|
| **Outil de recherche** | Utiliser impérativement des composants de type **Searchable Select** (Combobox) pour les véhicules, contacts, vendeurs, fournisseurs, ou tâches. |
| **Composants dédiés** | Utiliser `VehicleSelect`, `ContactSelect`, `ServiceTaskSelect` etc. |
| **Affichage** | Afficher les informations clés dans le sélecteur (ex: Nom du véhicule + VIN). |

### Champs d'Upload (Photos & Documents)
| Règle | Description |
|-------|-------------|
| **User-friendly** | Utiliser une zone de drop ou un bouton clair "Ajouter des fichiers". |
| **Feedback** | Afficher une miniature pour les images et une icône de fichier pour les documents. |
| **Gestion** | Permettre la suppression d'un fichier avant la soumission. |
| **Progression** | (Optionnel) Afficher l'état de l'upload si les fichiers sont volumineux. |

---


## 4. Communication API & Gestion des Erreurs

| **Initialisation** | Pour les pages de modification, charger les données existantes via un `GET` avant d'afficher le formulaire. |
| **Avant envoi** | Validation côté client (champs requis, formats). |
| **Pendant envoi** | Désactiver le bouton de validation pour éviter les doubles clics. |
| **Action API** | `POST /api/[entité]` pour une création, `PUT /api/[entité]/[id]` pour une modification. |
| **Succès** | Afficher un `Toast` de succès et rediriger vers la page détail. |

### Gestion des Erreurs
| Type d'erreur | Action |
|---------------|--------|
| **Validation** | Surligner les champs en erreur avec un message explicatif en rouge. |
| **Serveur** | Afficher une notification `Toast` d'erreur avec un message compréhensible. |
| **Accès/Réseau** | Alerter l'utilisateur de l'impossibilité de joindre le serveur. |

---

## 5. Liste des Composants Standard
- **Toast** : Pour les confirmations et alertes (`useToast`).
- **Loader2** : Pour les états d'attente (animations).
- **VehicleSelect** : Sélection de véhicule avec recherche.
- **ContactSelect** : Sélection de contact avec recherche.
- **ServiceTaskSelect** : Sélection de tâche avec recherche.

---

## 6. Checklist de Validation

- [ ] Bouton retour présent.
- [ ] Champs obligatoires marqués par une astérisque rouge (*).
- [ ] Sélecteurs d'entités avec recherche fonctionnelle.
- [ ] Zone d'upload de fichiers fonctionnelle (ajout/suppression).
- [ ] Bouton de sauvegarde avec état "loading".
- [ ] Feedback utilisateur via Toasts (Succès/Erreur).
- [ ] Formulaire responsive (grilles 1 col mobile / 2 cols desktop).

---

## 7. Pages Concernées

Voici la liste des pages de création et de modification identifiées dans le projet :

### Création (create)
- `app/(main)/contacts/create/page.tsx`
- `app/(main)/fuel/charging/create/page.tsx`
- `app/(main)/fuel/history/create/page.tsx`
- `app/(main)/inspections/forms/create/page.tsx`
- `app/(main)/inspections/history/create/page.tsx`
- `app/(main)/issues/create/page.tsx`
- `app/(main)/parts/create/page.tsx`
- `app/(main)/places/create/page.tsx`
- `app/(main)/reminders/service/create/page.tsx`
- `app/(main)/reminders/vehicle-renewals/create/page.tsx`
- `app/(main)/service/history/create/page.tsx`
- `app/(main)/service/programs/create/page.tsx`
- `app/(main)/service/tasks/create/page.tsx`
- `app/(main)/service/work-orders/create/page.tsx`
- `app/(main)/vehicles/expense/create/page.tsx`
- `app/(main)/vehicles/list/create/page.tsx`
- `app/(main)/vendors/create/page.tsx`

### Modification (edit)
- `app/(main)/contacts/[id]/edit/page.tsx`
- `app/(main)/fuel/charging/[id]/edit/page.tsx`
- `app/(main)/fuel/history/[id]/edit/page.tsx`
- `app/(main)/inspections/forms/[id]/edit/page.tsx`
- `app/(main)/inspections/history/[id]/edit/page.tsx`
- `app/(main)/issues/[id]/edit/page.tsx`
- `app/(main)/parts/[id]/edit/page.tsx`
- `app/(main)/places/[id]/edit/page.tsx`
- `app/(main)/reminders/service/[id]/edit/page.tsx`
- `app/(main)/reminders/vehicle-renewals/[id]/edit/page.tsx`
- `app/(main)/service/history/[id]/edit/page.tsx`
- `app/(main)/service/programs/[id]/edit/page.tsx`
- `app/(main)/service/work-orders/[id]/edit/page.tsx`
- `app/(main)/vehicles/expense/[id]/edit/page.tsx`
- `app/(main)/vehicles/list/[id]/edit/page.tsx`