---
description: Workflow pour traduire le contenu des pages en français
---

# Workflow - Traduction FR

Ce workflow définit les étapes et règles pour traduire tout le contenu visible de l'application en français.

---

## 1. Périmètre de Traduction

### Dossiers concernés
- `app/(main)/` - Toutes les pages de l'application principale
- `app/(auth)/` - Pages de connexion/inscription

### Éléments à traduire

| Élément | Exemples |
|---------|----------|
| **Titres de page** | "Issues" → "Problèmes" |
| **Labels de formulaire** | "First Name" → "Prénom" |
| **Placeholders** | "Search..." → "Rechercher..." |
| **Boutons** | "Save" → "Enregistrer" |
| **Messages d'erreur** | "Field required" → "Champ requis" |
| **Messages de succès** | "Saved successfully" → "Enregistré avec succès" |
| **Onglets** | "All", "Open" → "Tous", "Ouverts" |
| **En-têtes de tableau** | "Name", "Date" → "Nom", "Date" |
| **États vides** | "No items found" → "Aucun élément trouvé" |
| **Confirmations** | "Are you sure?" → "Êtes-vous sûr ?" |
| **Tooltips** | "Click to edit" → "Cliquer pour modifier" |

---

## 2. Dictionnaire de Traduction

### Navigation & Actions

| Anglais | Français |
|---------|----------|
| Add | Ajouter |
| Back | Retour |
| Cancel | Annuler |
| Close | Fermer |
| Confirm | Confirmer |
| Create | Créer |
| Delete | Supprimer |
| Edit | Modifier |
| Export | Exporter |
| Filter | Filtrer |
| Import | Importer |
| New | Nouveau |
| Next | Suivant |
| Previous | Précédent |
| Refresh | Actualiser |
| Remove | Retirer |
| Save | Enregistrer |
| Search | Rechercher |
| Submit | Soumettre |
| Update | Mettre à jour |
| View | Voir |

### Statuts

| Anglais | Français |
|---------|----------|
| Active | Actif |
| All | Tous |
| Cancelled | Annulé |
| Closed | Fermé |
| Completed | Terminé |
| Draft | Brouillon |
| Due Soon | À venir |
| Failed | Échoué |
| In Progress | En cours |
| Inactive | Inactif |
| Open | Ouvert |
| Overdue | En retard |
| Pending | En attente |
| Resolved | Résolu |
| Scheduled | Planifié |

### Priorités

| Anglais | Français |
|---------|----------|
| Critical | Critique |
| High | Haute |
| Low | Basse |
| Medium | Moyenne |
| Normal | Normale |

### Formulaires

| Anglais | Français |
|---------|----------|
| Address | Adresse |
| City | Ville |
| Comment | Commentaire |
| Company | Entreprise |
| Cost | Coût |
| Country | Pays |
| Date | Date |
| Description | Description |
| Due Date | Date d'échéance |
| Email | E-mail |
| End Date | Date de fin |
| First Name | Prénom |
| Last Name | Nom |
| License Plate | Immatriculation |
| Make | Marque |
| Meter | Compteur |
| Model | Modèle |
| Name | Nom |
| Notes | Notes |
| Password | Mot de passe |
| Phone | Téléphone |
| Photo | Photo |
| Price | Prix |
| Quantity | Quantité |
| Start Date | Date de début |
| Status | Statut |
| Summary | Résumé |
| Title | Titre |
| Total | Total |
| Type | Type |
| Unit | Unité |
| Vendor | Fournisseur |
| VIN | VIN |
| Year | Année |

### Entités

| Anglais | Français |
|---------|----------|
| Comment | Commentaire |
| Contact | Contact |
| Document | Document |
| Driver | Conducteur |
| Expense | Dépense |
| Fleet | Flotte |
| Fuel | Carburant |
| Group | Groupe |
| Inspection | Inspection |
| Issue | Problème |
| Label | Étiquette |
| Location | Localisation |
| Maintenance | Maintenance |
| Meter History | Historique compteur |
| Operator | Opérateur |
| Part | Pièce |
| Photo | Photo |
| Place | Lieu |
| Reminder | Rappel |
| Renewal | Renouvellement |
| Service Entry | Entrée de service |
| Service Task | Tâche de service |
| Vehicle | Véhicule |
| Watcher | Observateur |
| Work Order | Ordre de travail |

### Messages courants

| Anglais | Français |
|---------|----------|
| Are you sure you want to delete? | Êtes-vous sûr de vouloir supprimer ? |
| Changes saved successfully | Modifications enregistrées avec succès |
| Created successfully | Créé avec succès |
| Deleted successfully | Supprimé avec succès |
| Error loading data | Erreur lors du chargement des données |
| Field is required | Ce champ est requis |
| Invalid email format | Format d'email invalide |
| Loading... | Chargement... |
| No comments yet | Aucun commentaire |
| No data found | Aucune donnée trouvée |
| No items found | Aucun élément trouvé |
| No photos yet | Aucune photo |
| No results | Aucun résultat |
| Please select | Veuillez sélectionner |
| Required | Requis |
| Saved successfully | Enregistré avec succès |
| Select a vehicle | Sélectionner un véhicule |
| Something went wrong | Une erreur s'est produite |
| Updated successfully | Mis à jour avec succès |

### Labels tableau

| Anglais | Français |
|---------|----------|
| Actions | Actions |
| Assigned | Assigné |
| Assigned To | Assigné à |
| Created At | Créé le |
| Created By | Créé par |
| Issue # | Problème # |
| Labels | Étiquettes |
| Priority | Priorité |
| Reported By | Signalé par |
| Reported Date | Date de signalement |
| Source | Source |
| Updated At | Mis à jour le |
| Watchers | Observateurs |

---

## 3. Règles de Traduction

### Conventions

| Règle | Exemple |
|-------|---------|
| **Vouvoiement** | Utiliser "vous" et non "tu" |
| **Majuscules** | Première lettre seulement (pas "CRÉER" mais "Créer") |
| **Ponctuation** | Espace avant : ; ! ? en français |
| **Dates** | Format DD/MM/YYYY (ex: 18/01/2026) |
| **Nombres** | Séparateur décimal = virgule (ex: 1 234,56) |
| **Devise** | € ou Ar après le montant (ex: 1 234 Ar) |

### Boutons standards

| Contexte | Texte |
|----------|-------|
| Création | "+ Nouveau [Élément]" |
| Sauvegarde | "Enregistrer" |
| Annulation | "Annuler" |
| Suppression | "Supprimer" |
| Modification | "Modifier" |
| Validation | "Valider" ou "Confirmer" |
| Fermeture | "Fermer" |

### Messages toast

| Type | Format |
|------|--------|
| Succès création | "[Élément] créé avec succès" |
| Succès modification | "[Élément] mis à jour avec succès" |
| Succès suppression | "[Élément] supprimé avec succès" |
| Erreur générique | "Une erreur s'est produite" |
| Erreur spécifique | "Impossible de [action] : [raison]" |

---

## 4. Étapes de Traduction

### Pour chaque fichier page.tsx

1. **Ouvrir le fichier** dans l'éditeur
2. **Identifier** tous les textes en anglais
3. **Remplacer** par les traductions du dictionnaire
4. **Vérifier** la cohérence avec les autres pages
5. **Tester** visuellement dans le navigateur

### Checklist par page

- [ ] Titre de la page (h1)
- [ ] Liens de navigation (breadcrumb)
- [ ] Boutons d'action
- [ ] Onglets de filtrage
- [ ] Labels de formulaire
- [ ] Placeholders des inputs
- [ ] En-têtes de tableau
- [ ] Messages d'état vide
- [ ] Messages d'erreur
- [ ] Messages de succès (toast)
- [ ] Textes de confirmation (modales)

---

## 5. Liste des Fichiers à Traduire

### app/(auth)/
- [ ] `login/page.tsx`
- [ ] `register/page.tsx`
- [ ] `forgot-password/page.tsx`

### app/(main)/issues/
- [ ] `page.tsx`
- [ ] `create/page.tsx`
- [ ] `[id]/page.tsx`
- [ ] `[id]/edit/page.tsx`

### app/(main)/service/
- [ ] `history/page.tsx`
- [ ] `history/create/page.tsx`
- [ ] `history/[id]/page.tsx`
- [ ] `history/[id]/edit/page.tsx`
- [ ] `work-orders/page.tsx`
- [ ] `tasks/page.tsx`
- [ ] `tasks/create/page.tsx`
- [ ] `programs/page.tsx`

### app/(main)/fuel/
- [ ] `history/page.tsx`
- [ ] `history/create/page.tsx`
- [ ] `charging/page.tsx`

### app/(main)/reminders/
- [ ] `service/page.tsx`
- [ ] `service/create/page.tsx`
- [ ] `service/[id]/page.tsx`
- [ ] `service/[id]/edit/page.tsx`
- [ ] `vehicle-renewals/page.tsx`
- [ ] `vehicle-renewals/create/page.tsx`
- [ ] `vehicle-renewals/[id]/page.tsx`
- [ ] `vehicle-renewals/[id]/edit/page.tsx`

### app/(main)/inspections/
- [ ] `history/page.tsx`
- [ ] `forms/page.tsx`
- [ ] `forms/[id]/start/page.tsx`

### app/(main)/vehicles/
- [ ] `list/page.tsx`
- [ ] `expense/page.tsx`
- [ ] `meter-history/page.tsx`

### app/(main)/
- [ ] `parts/page.tsx`
- [ ] `places/page.tsx`
- [ ] `contacts/page.tsx`
- [ ] `dashboard/page.tsx`

---

## 6. Commande pour lister les fichiers

```bash
# Lister tous les fichiers page.tsx à traduire
find app/\(main\) app/\(auth\) -name "page.tsx" | sort
```

---

## 7. Exemple de Traduction

### Avant (anglais)
```tsx
<h1>Issues</h1>
<button>+ New Issue</button>
<input placeholder="Search..." />
<th>Priority</th>
<th>Assigned To</th>
<p>No issues found</p>
toast.success('Issue created successfully');
```

### Après (français)
```tsx
<h1>Problèmes</h1>
<button>+ Nouveau Problème</button>
<input placeholder="Rechercher..." />
<th>Priorité</th>
<th>Assigné à</th>
<p>Aucun problème trouvé</p>
toast.success('Problème créé avec succès');
```

---

## 8. Vérification Finale

Après traduction de toutes les pages :

1. **Navigation complète** : Parcourir toutes les pages de l'application
2. **Cohérence** : Vérifier que les mêmes termes sont utilisés partout
3. **Troncature** : Vérifier que les textes ne sont pas coupés (boutons, colonnes)
4. **Messages** : Tester les messages de succès/erreur
5. **Formulaires** : Tester la validation et les messages d'erreur
