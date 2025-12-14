# API User Profile CRUD - Documentation Sprint 1 FleetMada

## 📋 Vue d'ensemble

L'API User Profile CRUD permet aux utilisateurs authentifiés de gérer leur profil complet via les endpoints sécurisés. Cette API fait partie du Sprint 1 de FleetMada et suit les standards de sécurité JWT.

## 🚀 Endpoints disponibles

### Base URL
```
http://localhost:3000/api/profile
```

### Authentification
Tous les endpoints (sauf indication contraire) nécessitent un token JWT valide dans le header :
```
Authorization: Bearer <jwt_token>
```

## 📝 Endpoints détaillés

### 1. GET /api/profile
**Lecture du profil utilisateur**

#### Requête
```http
GET /api/profile
Authorization: Bearer <jwt_token>
```

#### Réponse succès (200)
```json
{
  "success": true,
  "user": {
    "id": "cmj62x0740001zq76c6emj2jd",
    "name": "Utilisateur Test",
    "email": "test@example.com",
    "companyName": "Entreprise Test",
    "avatar": null,
    "createdAt": "2025-12-14T18:49:30.689Z",
    "updatedAt": "2025-12-14T18:49:30.689Z"
  }
}
```

#### Codes d'erreur
- `401` : Token manquant ou invalide
- `404` : Utilisateur non trouvé
- `500` : Erreur serveur

---

### 2. PUT /api/profile
**Mise à jour du profil utilisateur**

#### Requête
```http
PUT /api/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Corps de requête
```json
{
  "name": "Nouveau nom (optionnel)",
  "companyName": "Nouvelle entreprise (optionnel)", 
  "avatar": "https://example.com/avatar.jpg (optionnel)",
  "password": "nouveau_mot_de_passe (optionnel)",
  "currentPassword": "mot_de_passe_actuel (requis si password fourni)"
}
```

#### Règles de validation
- `name` : Minimum 2 caractères
- `companyName` : Minimum 2 caractères  
- `avatar` : URL valide (optionnel)
- `password` : Minimum 8 caractères (optionnel)
- `currentPassword` : **Requis si `password` est fourni**

#### Réponse succès (200)
```json
{
  "success": true,
  "user": {
    "id": "cmj62x0740001zq76c6emj2jd",
    "name": "Utilisateur Test Modifié",
    "email": "test@example.com", 
    "companyName": "Entreprise Test Modifiée SARL",
    "avatar": null,
    "createdAt": "2025-12-14T18:49:30.689Z",
    "updatedAt": "2025-12-14T19:01:02.210Z"
  },
  "message": "Profil mis à jour avec succès"
}
```

#### Codes d'erreur
- `400` : Données invalides ou mot de passe actuel incorrect
- `401` : Token manquant ou invalide
- `404` : Utilisateur non trouvé
- `500` : Erreur serveur

---

### 3. DELETE /api/profile
**Suppression du compte utilisateur**

#### Requête
```http
DELETE /api/profile
Authorization: Bearer <jwt_token>
```

#### ⚠️ Attention
Cette action est **irréversible**. Elle supprime définitivement :
- Le compte utilisateur
- Toutes les données associées (véhicules, entrées de carburant, etc.)
- Les tokens blacklistés

#### Réponse succès (200)
```json
{
  "success": true,
  "message": "Compte supprimé avec succès"
}
```

#### Codes d'erreur
- `401` : Token manquant ou invalide
- `404` : Utilisateur non trouvé
- `500` : Erreur serveur

---

### 4. POST /api/profile (Non autorisé)
```json
{
  "error": "Méthode non autorisée"
}
```
**Statut :** `405 Method Not Allowed`

## 🔐 Sécurité

### Validation JWT
- Token JWT requis pour tous les endpoints protégés
- Validation du type de token (`type: 'login'`)
- Vérification de l'expiration

### Hachage des mots de passe
- Utilisation de `bcrypt` avec 12 rounds de salt
- Validation du mot de passe actuel obligatoire pour changement

### Validation des données
- Schéma Zod pour validation stricte des entrées
- Vérification de l'unicité (email, etc.)
- Nettoyage automatique des espaces

## 🛠️ Utilisation

### 1. Obtenir un token JWT
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "votre@email.com",
    "password": "votre_mot_de_passe"
  }'
```

### 2. Lire son profil
```bash
curl -X GET http://localhost:3000/api/profile \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

### 3. Mettre à jour son profil
```bash
curl -X PUT http://localhost:3000/api/profile \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nouveau nom",
    "companyName": "Nouvelle entreprise"
  }'
```

### 4. Changer son mot de passe
```bash
curl -X PUT http://localhost:3000/api/profile \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "ancien_mot_de_passe",
    "password": "nouveau_mot_de_passe"
  }'
```

### 5. Supprimer son compte
```bash
curl -X DELETE http://localhost:3000/api/profile \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

## 🧪 Tests

Un script de test complet est disponible :
```bash
node scripts/test-profile-api.js
```

### Tests couverts
- ✅ Lecture du profil (GET)
- ✅ Mise à jour des informations (PUT)
- ✅ Changement de mot de passe (PUT)
- ✅ Validation des erreurs (PUT)
- ✅ Suppression du compte (DELETE)
- ✅ Authentification requise
- ✅ Méthodes non autorisées

## 📊 Logging

Tous les endpoints loguent les actions importantes :
- Tentatives d'accès
- Validations échouées
- Succès/échecs des opérations
- Détails d'erreur pour debugging

Format des logs :
```
[Profile API] 2025-12-14T19:01:02.215Z - PUT Profile - Success - User: cmj62x0740001zq76c6emj2jd: {
  userId: 'cmj62x0740001zq76c6emj2jd',
  updatedFields: [ 'name', 'companyName' ]
}
```

## 🔧 Configuration requise

### Variables d'environnement
- `JWT_SECRET` : Clé secrète pour JWT (défaut: 'fallback-secret-key')
- `DATABASE_URL` : URL de la base de données PostgreSQL

### Dépendances
- `next` : Framework Next.js 14
- `prisma` : ORM pour PostgreSQL  
- `bcryptjs` : Hachage des mots de passe
- `jsonwebtoken` : Gestion des JWT
- `zod` : Validation des schémas

## 📝 Notes d'implémentation

### Architecture
- **Middleware** : Validation basique des tokens (Edge Runtime)
- **Routes API** : Validation JWT complète et logique métier
- **Prisma** : Transactions pour opérations sensibles
- **Zod** : Validation stricte des données d'entrée

### Limitations actuelles
- Pas de limite de taux (rate limiting)
- Pas de versioning de l'API
- Pas de pagination (non applicable)
- Suppression en cascade non configurée finement

### Améliorations futures possibles
- Activation/désactivation de compte au lieu de suppression
- Historique des modifications de profil
- Upload d'avatar avec traitement d'image
- Notifications par email des changements
- Audit trail des actions utilisateur

---

**Version :** 1.0.0  
**Date :** 2025-12-14  
**Statut :** ✅ Production Ready