# Module Issues FleetMada - Documentation Complète

## Vue d'Ensemble

Le module Issues de FleetMada est un système complet de gestion des problèmes et incidents permettant de :

- **Créer et suivre** les problèmes de véhicules
- **Assigner et gérer** les statuts des issues
- **Collaborer** via un système de commentaires
- **Documenter** avec upload d'images
- **Analyser** via le Dashboard intégré
- **Intégrer** avec les modules Vehicles et Service

## Architecture Technique

### Backend APIs

```
/api/issues/
├── GET    /                    # Liste des issues avec filtres
├── POST   /                    # Créer une nouvelle issue
├── GET    /[id]                # Détails d'une issue
├── PUT    /[id]                # Modifier une issue
├── DELETE /[id]                # Supprimer une issue
├── POST   /[id]/status         # Changer le statut
├── POST   /[id]/assign         # Assigner l'issue
├── GET    /[id]/comments       # Liste des commentaires
├── POST   /[id]/comments       # Ajouter un commentaire
├── PUT    /[id]/comments/[id]  # Modifier un commentaire
├── DELETE /[id]/comments/[id]  # Supprimer un commentaire
├── GET    /[id]/images         # Liste des images
├── POST   /[id]/images         # Upload d'images
└── DELETE /[id]/images/[id]    # Supprimer une image
```

### Frontend Structure

```
app/(main)/issues/
├── page.tsx                   # Liste des issues
├── create/
│   └── page.tsx              # Création d'issue
└── [id]/
    ├── page.tsx              # Détails d'issue
    └── edit/
        └── page.tsx          # Édition d'issue
```

### Hooks React

- **`useIssues`** - Gestion liste, création, modification, suppression
- **`useIssueDetails`** - Détails d'une issue spécifique
- **`useIssueComments`** - Gestion des commentaires
- **`useIssuesStatus`** - Métriques Dashboard Issues

### Composants Dashboard

- **`IssuesStatus`** - Widget Dashboard pour métriques Issues
- **`/api/dashboard/issues`** - API backend Dashboard

## Fonctionnalités Détaillées

### 1. Gestion des Issues

#### Statuts Disponibles
- **OPEN** - Problème nouvellement créé
- **IN_PROGRESS** - En cours de traitement
- **RESOLVED** - Problème résolu
- **CLOSED** - Problème fermé

#### Priorités
- **LOW** - Priorité faible
- **MEDIUM** - Priorité moyenne
- **HIGH** - Priorité haute
- **CRITICAL** - Priorité critique

#### Catégories/Labels
- **Electrical** - Problèmes électriques
- **Mechanical** - Problèmes mécaniques
- **Body** - Problèmes de carrosserie
- **Safety** - Problèmes de sécurité
- **Recall** - Rappels constructeurs

### 2. Interface Utilisateur

#### Page Liste (Issues)
```typescript
// Fonctionnalités
- Tableau paginé avec filtres avancés
- Recherche textuelle
- Filtres par statut, priorité, véhicule, assignee
- Tri par date, priorité, statut
- Actions rapides (assigner, changer statut)
- Bouton création nouvelle issue
```

#### Page Création
```typescript
// Formulaire complet
- Sélection véhicule (API réelle)
- Résumé (obligatoire)
- Description détaillée
- Priorité (dropdown)
- Labels/catégories
- Assignation
- Upload d'images multiples
- Dates (signalement, échéance)
```

#### Page Détails
```typescript
// Vue complète issue
- Informations générales
- Véhicule associé
- Historique des commentaires
- Galerie images avec zoom
- Actions : statut, assignation, édition
- Timeline des modifications
```

#### Page Édition
```typescript
// Modification fields
- Tous les champs modifiables sauf véhicule
- Upload/suppression images
- Sauvegarde avec validation
- Retour automatique aux détails
```

### 3. Système de Commentaires

#### Fonctionnalités
- **Ajout** de commentaires en temps réel
- **Modification** des commentaires existants
- **Suppression** avec confirmation
- **Historique** chronologique
- **Auteur** et timestamp
- **Notifications** automatiques

#### API Endpoints
```typescript
GET    /api/issues/[id]/comments     // Liste
POST   /api/issues/[id]/comments     // Ajout
PUT    /api/issues/[id]/comments/[id] // Modification
DELETE /api/issues/[id]/comments/[id] // Suppression
```

### 4. Gestion des Images

#### Upload et Stockage
- **Multiple** fichiers supportés
- **Formats** : JPG, PNG, GIF
- **Taille max** : 5MB par image
- **Compression** automatique
- **Stockage** sécurisé

#### Galerie Images
- **Aperçu** avec zoom
- **Annotations** possibles
- **Organisation** chronologique
- **Suppression** individuelle

### 5. Intégration Dashboard

#### Métriques Affichées
```typescript
interface IssuesSummary {
  totalIssues: number;           // Total problèmes
  openIssues: number;           // Problèmes ouverts
  inProgressIssues: number;     // En cours
  resolvedIssues: number;       // Résolus
  closedIssues: number;         // Fermés
  criticalIssues: number;       // Critiques
  averageResolutionTime: number; // Temps moyen (heures)
  issuesThisMonth: number;      // Ce mois
  complianceRate: number;       // Taux conformité (%)
}
```

#### Widgets Dashboard
- **Métriques principales** (4 cards)
- **Jauge de statut** global
- **Liste problèmes critiques**
- **Problèmes récents**
- **Actions recommandées**

#### API Dashboard
```typescript
GET /api/dashboard/issues
// Retourne métriques et listes pour Dashboard
```

### 6. Intégration avec Autres Modules

#### Module Vehicles
- **Sélection véhicule** dans création/édition
- **Affichage détails véhicule** dans issue
- **Historique issues par véhicule**
- **Impact sur statut véhicule**

#### Module Service
- **Création ordre de travail** depuis issue résolue
- **Synchronisation statuts**
- **Suivi réparations**
- **Validation résolutions**

#### Module Documents
- **Stockage images** dans Documents
- **Liaison issue-document**
- **Historique complet preuves**

## Guide d'Utilisation

### 1. Créer un Problème

1. **Naviguer** vers Issues → "Nouveau Problème"
2. **Sélectionner** le véhicule concerné
3. **Décrire** le problème (résumé + description)
4. **Définir** la priorité appropriée
5. **Ajouter** des labels/catégories
6. **Assigner** à un technicien (optionnel)
7. **Upload** photos du problème
8. **Sauvegarder**

### 2. Gérer un Problème

#### Changer le Statut
1. Ouvrir la page détails du problème
2. Cliquer sur le statut actuel
3. Sélectionner nouveau statut
4. Confirmer le changement

#### Assigner/Réassigner
1. Dans les détails du problème
2. Cliquer sur "Assigné à"
3. Sélectionner technicien
4. Confirmer l'assignation

#### Ajouter un Commentaire
1. Section commentaires en bas
2. Saisir le commentaire
3. Cliquer "Ajouter"
4. Commentaire visible immédiatement

### 3. Modifier un Problème

1. Page détails → "Modifier"
2. Modifier les champs nécessaires
3. Gérer les images (ajout/suppression)
4. Sauvegarder les changements

### 4. Analyser via Dashboard

1. Dashboard → Onglet "Problèmes"
2. **Métriques** : Vue d'ensemble quantitative
3. **Critiques** : Problèmes nécessitant attention
4. **Récents** : Derniers problèmes créés
5. **Actions** : Recommandations automatiques

## Configuration et Paramétrage

### Variables d'Environnement
```bash
# JWT Configuration
JWT_SECRET=your-jwt-secret-key

# File Upload Configuration
MAX_FILE_SIZE=5242880  # 5MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif

# Database Configuration
DATABASE_URL=your-database-url
```

### Base de Données

#### Table Issues
```sql
CREATE TABLE Issue (
  id              String   @id @default(cuid())
  vehicleId       String?  @relation(fields: [vehicleId], references: [id])
  userId          String
  summary         String
  description     String?
  status          IssueStatus @default(OPEN)
  priority        IssuePriority @default(MEDIUM)
  labels          String[]
  assignedTo      String?
  reportedDate    DateTime @default(now())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  vehicle         Vehicle? @relation(fields: [vehicleId], references: [id])
  comments        Comment[]
  images          IssueImage[]
)
```

#### Table Comments
```sql
CREATE TABLE Comment (
  id          String   @id @default(cuid())
  issueId     String
  author      String
  content     String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  issue       Issue    @relation(fields: [issueId], references: [id], onDelete: Cascade)
)
```

#### Table IssueImages
```sql
CREATE TABLE IssueImage (
  id          String   @id @default(cuid())
  issueId     String
  fileName    String
  filePath    String
  fileSize    Int
  mimeType    String
  createdAt   DateTime @default(now())
  
  issue       Issue    @relation(fields: [issueId], references: [id], onDelete: Cascade)
)
```

### Permissions et Sécurité

#### Authentification
- **JWT Token** requis pour toutes les APIs
- **Validation token** automatique
- **Expiration** et renewal support

#### Autorisation
- **Users** voient только leurs issues
- **Admins** voient toutes les issues
- **Technicians** voient leurs assignments

#### Sécurité Données
- **Validation** input avec Zod
- **Sanitization** automatique
- **Rate limiting** sur APIs
- **File upload** sécurisé

## Tests et Validation

### Tests Playwright E2E
```bash
# Lancer tests E2E
npm run test:e2e

# Tests spécifiques Issues
npx playwright test tests/issues.spec.ts
```

### Tests APIs Backend
```bash
# Script test APIs
node scripts/test-issues-apis.js

# Avec variables d'environnement
API_BASE=http://localhost:3000/api node scripts/test-issues-apis.js
```

### Couverture de Tests
- ✅ **CRUD** complet Issues
- ✅ **Commentaires** (CRUD)
- ✅ **Images** (upload, gestion)
- ✅ **Statuts** et assignations
- ✅ **Filtres** et pagination
- ✅ **Dashboard** integration
- ✅ **Responsive** design
- ✅ **Performance** (< 3s)
- ✅ **Accessibilité** WCAG

## Monitoring et Analytics

### Métriques Suivies
- **Temps résolution** moyen
- **Taux conformité** SLA
- **Volume** problèmes par période
- **Performance** techniciens
- **Problèmes récurrents**
- **Impact disponibilité** flotte

### Alertes Automatiques
- **Problèmes critiques** non assignés
- **SLA** dépassés
- **Problèmes récurrents** même véhicule
- **Tendances** négatives

### Rapports
- **Hebdomadaire** : résumé activité
- **Mensuel** : analyse tendances
- **Trimestriel** : performance équipe
- **Annuel** : ROI maintenance

## Maintenance et Support

### Tâches Régulières
- **Nettoyage** images orphelines
- **Archivage** old issues
- **Backup** base de données
- **Monitoring** performance APIs
- **Mise à jour** dépendances

### Troubleshooting

#### Problèmes Courants
1. **Upload images échoue**
   - Vérifier taille/format fichier
   - Contrôler permissions stockage
   
2. **API lente**
   - Index base données
   - Cache Redis
   
3. **JWT expiration**
   - Renouvellement automatique
   - Refresh token

#### Logs et Debug
```bash
# Logs API Issues
tail -f logs/issues-api.log

# Debug mode
DEBUG=issues:* npm run dev
```

## Roadmap et Évolutions

### Version 2.0 (Prévue)
- **IA** pour suggestion résolution
- **Mobile app** dédiée
- **API publique** pour intégrations
- **Workflows** personnalisables
- **Gamification** équipe

### Améliorations Techniques
- **Real-time** updates (WebSockets)
- **Offline mode** support
- **Advanced** analytics
- **Machine learning** predictions
- **Integration** third-party CMMS

## Support et Contact

### Équipe Développement
- **Lead Developer** : [Nom]
- **Backend** : [Nom]
- **Frontend** : [Nom]
- **QA** : [Nom]

### Documentation
- **API Docs** : `/docs/api-issues`
- **User Guide** : `/docs/user-guide-issues`
- **Admin Guide** : `/docs/admin-issues`

---

## Annexes

### A. Exemples d'API Calls

#### Créer Issue
```bash
curl -X POST http://localhost:3000/api/issues \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "veh_123",
    "summary": "Problème moteur",
    "priority": "HIGH",
    "labels": ["Mechanical", "Engine"]
  }'
```

#### Ajouter Commentaire
```bash
curl -X POST http://localhost:3000/api/issues/issue_123/comments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "author": "Technician 1",
    "content": "Problème identifié, pièce à commander"
  }'
```

### B. Configurations TypeScript

#### Types Principaux
```typescript
interface Issue {
  id: string;
  vehicleId?: string;
  summary: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  labels: string[];
  assignedTo?: string;
  reportedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### C. Configuration Tailwind

#### Classes Utilisées
```css
/* Status Colors */
.status-open { @apply bg-red-100 text-red-800; }
.status-progress { @apply bg-yellow-100 text-yellow-800; }
.status-resolved { @apply bg-green-100 text-green-800; }
.status-closed { @apply bg-blue-100 text-blue-800; }

/* Priority Colors */
.priority-low { @apply bg-green-100 text-green-800; }
.priority-medium { @apply bg-yellow-100 text-yellow-800; }
.priority-high { @apply bg-orange-100 text-orange-800; }
.priority-critical { @apply bg-red-100 text-red-800; }
```

---

**Document Version** : 1.0  
**Date** : 2025-12-18  
**Auteur** : FleetMada Development Team  
**Statut** : Production Ready ✅