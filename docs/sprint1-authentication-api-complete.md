# 📚 API Authentification & Utilisateurs - Sprint 1 FleetMada

## 📑 Table des Matières

- [🎯 Vue d'ensemble](#-vue-densemble)
- [🔐 API Authentification](#-api-authentification)
  - [1. Inscription Utilisateur](#1-inscription-utilisateur)
  - [2. Connexion Utilisateur](#2-connexion-utilisateur)
  - [3. Déconnexion Utilisateur](#3-déconnexion-utilisateur)
  - [4. Vérification Blacklist](#4-vérification-blacklist)
- [👤 API Gestion Profil](#-api-gestion-profil)
  - [1. Récupération Profil](#1-récupération-profil)
  - [2. Modification Profil](#2-modification-profil)
  - [3. Suppression Compte](#3-suppression-compte)
- [🏢 API Onboarding Company](#-api-onboarding-company)
  - [1. Récupération des Informations d'Entreprise](#1-récupération-des-informations-dentreprise)
  - [2. Création/Mise à jour des Informations d'Entreprise](#2-créationmise-à-jour-des-informations-dentreprise)
- [🔒 Middleware d'Authentification](#-middleware-dauthentification)
- [🛡️ Sécurité et Bonnes Pratiques](#🛡️-sécurité-et-bonnes-pratiques)
- [🧪 Tests et Validation](#🧪-tests-et-validation)
- [🔄 Workflow Complet](#-workflow-complet)

---

## 🎯 Vue d'ensemble

Cette documentation décrit l'API d'authentification complète du Sprint 1 de FleetMada, une solution de gestion de flotte automobile. Cette API offre un système d'authentification robuste avec JWT, gestion sécurisée des profils utilisateurs et déconnexion avec invalidation des tokens.

### Architecture du Système

```
┌─────────────────────────────────────────────────────────────┐
│                    FleetMada Auth System                     │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React/Next.js)                                   │
├─────────────────────────────────────────────────────────────┤
│  API Routes (Next.js App Router)                            │
│  ├── POST /api/auth/register      - Inscription             │
│  ├── POST /api/auth/login         - Connexion               │
│  ├── POST /api/auth/logout        - Déconnexion             │
│  ├── GET  /api/profile            - Profil (lecture)        │
│  ├── PUT  /api/profile            - Profil (modification)   │
│  ├── DELETE /api/profile          - Suppression compte      │
│  ├── GET  /api/onboarding/company - Infos entreprise        │
│  ├── PUT  /api/onboarding/company - Gestion entreprise      │
│  └── POST /api/auth/check-blacklist - Vérification token    │
├─────────────────────────────────────────────────────────────┤
│  Middleware d'authentification                              │
├─────────────────────────────────────────────────────────────┤
│  JWT Tokens (jsonwebtoken)                                  │
├─────────────────────────────────────────────────────────────┤
│  Base de données (Prisma + PostgreSQL)                      │
│  ├── User               - Données utilisateurs              │
│  ├── Company            - Informations entreprise           │
│  └── BlacklistedToken   - Tokens invalidés                 │
└─────────────────────────────────────────────────────────────┘
```

### Technologies Utilisées

- **Framework** : Next.js 14 avec App Router
- **Authentification** : JWT (JSON Web Tokens)
- **Hachage** : bcryptjs (12 rounds)
- **Validation** : Zod
- **Base de données** : Prisma ORM + PostgreSQL
- **Types** : TypeScript
- **Logging** : Console logs structurés

### Configuration

#### Base URL
```
Développement : http://localhost:3000/api
Production : https://your-domain.com/api
```

#### Headers Requis
```
Content-Type: application/json
Authorization: Bearer <jwt_token>  // Pour les routes protégées
```

#### Variables d'Environnement
```env
DATABASE_URL="postgresql://user:password@localhost:5432/fleetmada"
JWT_SECRET="your-super-secret-jwt-key"
NODE_ENV="development"
```

---

## 🔐 API Authentification

### 1. Inscription Utilisateur

#### POST `/api/auth/register`

Inscription d'un nouvel utilisateur avec validation complète et création automatique du compte.

**Headers :**
```
Content-Type: application/json
```

**Body :**
```typescript
{
  name: string           // Minimum 2 caractères
  email: string          // Format email valide, unique
  password: string       // Minimum 8 caractères
  companyName: string    // Minimum 2 caractères
  avatar?: string        // URL optionnelle, validée si fournie
}
```

**Exemple de Requête :**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jean Dupont",
    "email": "jean.dupont@example.com",
    "password": "MotDePasse123!",
    "companyName": "Transport Solutions SARL",
    "avatar": "https://example.com/avatar.jpg"
  }'
```

```javascript
// JavaScript/TypeScript
const registerUser = async (userData) => {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Inscription réussie:', result.user);
      console.log('Token de confirmation:', result.confirmationToken);
    } else {
      console.error('Erreur:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Erreur réseau:', error);
  }
};

// Utilisation
registerUser({
  name: "Jean Dupont",
  email: "jean.dupont@example.com",
  password: "MotDePasse123!",
  companyName: "Transport Solutions SARL"
});
```

**Réponses :**

✅ **Succès (201 Created)**
```json
{
  "success": true,
  "message": "Inscription réussie. Veuillez vérifier votre email pour confirmer votre compte.",
  "user": {
    "id": "clp1234567890abcdef",
    "name": "Jean Dupont",
    "email": "jean.dupont@example.com",
    "companyName": "Transport Solutions SARL",
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2024-12-14T19:46:00.000Z"
  },
  "confirmationToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // En développement
}
```

❌ **Erreur - Email déjà utilisé (409 Conflict)**
```json
{
  "success": false,
  "error": "Cet email est déjà utilisé"
}
```

❌ **Erreur - Données invalides (400 Bad Request)**
```json
{
  "success": false,
  "error": "Données invalides",
  "details": [
    {
      "field": "password",
      "message": "Le mot de passe doit contenir au moins 8 caractères"
    },
    {
      "field": "email",
      "message": "Format d'email invalide"
    }
  ]
}
```

❌ **Erreur - JSON invalide (400 Bad Request)**
```json
{
  "success": false,
  "error": "Format JSON invalide"
}
```

❌ **Erreur serveur (500 Internal Server Error)**
```json
{
  "success": false,
  "error": "Erreur lors de la création du compte"
}
```

**Validation des Données :**
- `name` : Minimum 2 caractères
- `email` : Format email valide et unique
- `password` : Minimum 8 caractères
- `companyName` : Minimum 2 caractères
- `avatar` : URL valide si fournie, sinon vide/optionnel

---

### 2. Connexion Utilisateur

#### POST `/api/auth/login`

Connexion avec validation des identifiants et génération du token JWT.

**Headers :**
```
Content-Type: application/json
```

**Body :**
```typescript
{
  email: string    // Email de l'utilisateur
  password: string // Mot de passe
}
```

**Exemple de Requête :**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.dupont@example.com",
    "password": "MotDePasse123!"
  }'
```

```javascript
// JavaScript/TypeScript
const loginUser = async (credentials) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const result = await response.json();
    
    if (result.success) {
      // Stocker le token en localStorage (exemple)
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      console.log('Connexion réussie:', result.user);
      console.log('Token:', result.token);
    } else {
      console.error('Erreur de connexion:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Erreur réseau:', error);
  }
};

// Utilisation
loginUser({
  email: "jean.dupont@example.com",
  password: "MotDePasse123!"
});
```

**Réponses :**

✅ **Succès (200 OK)**
```json
{
  "success": true,
  "user": {
    "id": "clp1234567890abcdef",
    "name": "Jean Dupont",
    "email": "jean.dupont@example.com",
    "companyName": "Transport Solutions SARL",
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2024-12-14T19:46:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbHAxMjM0NTY3ODkwYWJjZGVmIiw...",
  "expiresIn": "24h"
}
```

❌ **Erreur - Identifiants invalides (401 Unauthorized)**
```json
{
  "success": false,
  "error": "Email ou mot de passe incorrect"
}
```

❌ **Erreur - Données invalides (400 Bad Request)**
```json
{
  "success": false,
  "error": "Données invalides",
  "details": [
    {
      "field": "email",
      "message": "Format d'email invalide"
    },
    {
      "field": "password",
      "message": "Le mot de passe est requis"
    }
  ]
}
```

**Caractéristiques du Token JWT :**
- **Durée de vie** : 24 heures
- **Algorithme** : HS256
- **Type** : Bearer
- **Payload** : `{ userId, email, type: 'login', iat }`

---

### 3. Déconnexion Utilisateur

#### POST `/api/auth/logout`

Déconnexion sécurisée avec ajout du token à la blacklist pour empêcher sa réutilisation.

**Headers :**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Exemple de Requête :**

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbHAx..." \
  -H "Content-Type: application/json"
```

```javascript
// JavaScript/TypeScript
const logoutUser = async (token) => {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (result.success) {
      // Supprimer le token du localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      console.log('Déconnexion réussie');
    } else {
      console.error('Erreur de déconnexion:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Erreur réseau:', error);
  }
};

// Utilisation
const token = localStorage.getItem('authToken');
logoutUser(token);
```

**Réponses :**

✅ **Succès (200 OK)**
```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

❌ **Erreur - Token manquant (401 Unauthorized)**
```json
{
  "success": false,
  "error": "Token d'authentification manquant"
}
```

❌ **Erreur - Token invalide (401 Unauthorized)**
```json
{
  "success": false,
  "error": "Token invalide ou expiré"
}
```

❌ **Erreur - Format token incorrect (401 Unauthorized)**
```json
{
  "success": false,
  "error": "Format de token invalide"
}
```

**Fonctionnalités de Sécurité :**
- Validation complète du token JWT
- Vérification du type de token ('login')
- Ajout automatique à la blacklist avec date d'expiration
- Nettoyage automatique des tokens expirés
- Gestion des tokens déjà blacklistés
- Suppression des tokens blacklistés lors de la suppression du compte

---

### 4. Vérification Blacklist

#### POST `/api/auth/check-blacklist`

Vérifie si un token est présent dans la blacklist (utilisé par le middleware).

**Headers :**
```
Content-Type: application/json
```

**Body :**
```typescript
{
  token: string  // Token JWT à vérifier
}
```

**Exemple de Requête :**

```bash
curl -X POST http://localhost:3000/api/auth/check-blacklist \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Réponses :**

✅ **Succès (200 OK)**
```json
{
  "success": true,
  "isBlacklisted": false,
  "token": null
}
```

```json
{
  "success": true,
  "isBlacklisted": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

❌ **Erreur - Token manquant (400 Bad Request)**
```json
{
  "success": false,
  "error": "Token manquant"
}
```

❌ **Erreur serveur (500 Internal Server Error)**
```json
{
  "success": false,
  "error": "Erreur lors de la vérification"
}
```

---

## 👤 API Gestion Profil

### 1. Récupération Profil

#### GET `/api/profile`

Récupère les informations du profil utilisateur connecté.

**Headers :**
```
Authorization: Bearer <jwt_token>
```

**Exemple de Requête :**

```bash
curl -X GET http://localhost:3000/api/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbHAx..."
```

```javascript
// JavaScript/TypeScript
const getProfile = async (token) => {
  try {
    const response = await fetch('/api/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Profil utilisateur:', result.user);
      return result.user;
    } else {
      console.error('Erreur:', result.error);
    }
    
    return null;
  } catch (error) {
    console.error('Erreur réseau:', error);
  }
};

// Utilisation
const token = localStorage.getItem('authToken');
getProfile(token);
```

**Réponses :**

✅ **Succès (200 OK)**
```json
{
  "success": true,
  "user": {
    "id": "clp1234567890abcdef",
    "name": "Jean Dupont",
    "email": "jean.dupont@example.com",
    "companyName": "Transport Solutions SARL",
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2024-12-14T19:46:00.000Z",
    "updatedAt": "2024-12-14T19:46:00.000Z"
  }
}
```

❌ **Erreurs d'authentification** (Voir section Authentification)

---

### 2. Modification Profil

#### PUT `/api/profile`

Met à jour les informations du profil utilisateur.

**Headers :**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body :**
```typescript
{
  name?: string              // Minimum 2 caractères
  companyName?: string       // Minimum 2 caractères
  avatar?: string           // URL optionnelle
  password?: string         // Minimum 8 caractères
  currentPassword: string   // Requis si password fourni
}
```

**Exemple de Requête :**

```bash
curl -X PUT http://localhost:3000/api/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbHAx..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jean-Pierre Dupont",
    "companyName": "Transport Solutions & Logistique",
    "password": "NouveauMotDePasse123!",
    "currentPassword": "MotDePasse123!"
  }'
```

```javascript
// JavaScript/TypeScript
const updateProfile = async (token, updateData) => {
  try {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Profil mis à jour:', result.user);
      // Mettre à jour le localStorage
      localStorage.setItem('user', JSON.stringify(result.user));
    } else {
      console.error('Erreur:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Erreur réseau:', error);
  }
};

// Utilisation - Mise à jour nom uniquement
updateProfile(token, {
  name: "Jean-Pierre Dupont"
});

// Utilisation - Changement de mot de passe
updateProfile(token, {
  password: "NouveauMotDePasse123!",
  currentPassword: "AncienMotDePasse123!"
});
```

**Réponses :**

✅ **Succès (200 OK)**
```json
{
  "success": true,
  "user": {
    "id": "clp1234567890abcdef",
    "name": "Jean-Pierre Dupont",
    "email": "jean.dupont@example.com",
    "companyName": "Transport Solutions & Logistique",
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2024-12-14T19:46:00.000Z",
    "updatedAt": "2024-12-14T19:47:30.000Z"
  },
  "message": "Profil mis à jour avec succès"
}
```

❌ **Erreur - Mot de passe actuel incorrect (400 Bad Request)**
```json
{
  "success": false,
  "error": "Mot de passe actuel incorrect"
}
```

❌ **Erreur - Aucune donnée à mettre à jour (400 Bad Request)**
```json
{
  "success": false,
  "error": "Aucune donnée à mettre à jour"
}
```

❌ **Erreur - Validation (400 Bad Request)**
```json
{
  "success": false,
  "error": "Données invalides",
  "details": [
    {
      "field": "password",
      "message": "Le mot de passe actuel est requis pour changer le mot de passe"
    }
  ]
}
```

**Règles de Validation :**
- Tous les champs sont optionnels
- Si `password` est fourni, `currentPassword` est obligatoire
- Hachage automatique du nouveau mot de passe (12 rounds bcrypt)
- Mise à jour automatique du timestamp `updatedAt`

---

### 3. Suppression Compte

#### DELETE `/api/profile`

Supprime définitivement le compte utilisateur et toutes ses données associées.

**Headers :**
```
Authorization: Bearer <jwt_token>
```

**⚠️ Attention : Cette action est irréversible !**

**Exemple de Requête :**

```bash
curl -X DELETE http://localhost:3000/api/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbHAx..."
```

```javascript
// JavaScript/TypeScript
const deleteAccount = async (token) => {
  try {
    const response = await fetch('/api/profile', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Compte supprimé avec succès');
      // Supprimer toutes les données locales
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Rediriger vers la page d'accueil
      window.location.href = '/';
    } else {
      console.error('Erreur:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Erreur réseau:', error);
  }
};

// Utilisation avec confirmation
const confirmDelete = () => {
  if (window.confirm('Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.')) {
    const token = localStorage.getItem('authToken');
    deleteAccount(token);
  }
};
```

**Réponses :**

✅ **Succès (200 OK)**
```json
{
  "success": true,
  "message": "Compte supprimé avec succès"
}
```

❌ **Erreurs d'authentification** (Voir section Authentification)

**Actions Effectuées :**
1. Suppression de tous les tokens blacklistés de l'utilisateur
2. Suppression du compte utilisateur (cascade automatique pour les données liées)
3. Suppression automatique des données véhicules, carburant, maintenance, etc.

---

## 🏢 API Onboarding Company

### Vue d'ensemble

L'API Onboarding Company permet aux utilisateurs de gérer les informations détaillées de leur entreprise lors du processus d'onboarding. Cette API complète les informations de base fournies lors de l'inscription en permettant l'ajout d'informations complètes sur l'entreprise.

**Objectif :** Faciliter la configuration complète du profil d'entreprise pour une meilleure gestion de flotte.

**Fonctionnalités :**
- Récupération des informations d'entreprise existantes
- Création d'une nouvelle entreprise
- Mise à jour des informations d'entreprise
- Validation complète des données avec Zod
- Gestion des relations User-Company

### Modèle Company

```typescript
interface Company {
  id: string
  name: string                    // Nom de l'entreprise (unique)
  address?: string                // Adresse complète
  phone?: string                  // Numéro de téléphone
  website?: string                // Site web (URL valide)
  description?: string            // Description de l'entreprise
  taxId?: string                  // Numéro fiscal/TVA
  employees?: number              // Nombre d'employés
  fleetSize?: number              // Taille de la flotte
  createdAt: Date
  updatedAt: Date
  usersCount?: number             // Nombre d'utilisateurs associés
}
```

### 1. Récupération des Informations d'Entreprise

#### GET `/api/onboarding/company`

Récupère les informations détaillées de l'entreprise associée à l'utilisateur connecté.

**Headers :**
```
Authorization: Bearer <jwt_token>
```

**Exemple de Requête :**

```bash
curl -X GET http://localhost:3000/api/onboarding/company \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

```javascript
// JavaScript/TypeScript
const getCompanyInfo = async (token) => {
  try {
    const response = await fetch('/api/onboarding/company', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();
    
    if (result.success) {
      if (result.company) {
        console.log('Informations entreprise:', result.company);
        return result.company;
      } else {
        console.log('Aucune entreprise trouvée:', result.message);
        return null;
      }
    } else {
      console.error('Erreur:', result.error);
    }
    
    return null;
  } catch (error) {
    console.error('Erreur réseau:', error);
  }
};

// Utilisation
const token = localStorage.getItem('authToken');
getCompanyInfo(token);
```

**Réponses :**

✅ **Succès - Entreprise existante (200 OK)**
```json
{
  "success": true,
  "company": {
    "id": "cmp_1234567890abcdef",
    "name": "Transport Solutions SARL",
    "address": "123 Rue des Transporteurs, 75001 Paris, France",
    "phone": "+33 1 23 45 67 89",
    "website": "https://www.transportsolutions.fr",
    "description": "Spécialisée dans le transport de marchandises et la logistique",
    "taxId": "FR12345678901",
    "employees": 150,
    "fleetSize": 75,
    "createdAt": "2024-12-14T19:46:00.000Z",
    "updatedAt": "2024-12-14T19:50:00.000Z",
    "usersCount": 3
  }
}
```

✅ **Succès - Aucune entreprise (200 OK)**
```json
{
  "success": true,
  "company": null,
  "message": "Aucune entreprise associée à cet utilisateur. Utilisez PUT pour créer une entreprise."
}
```

❌ **Erreur - Token manquant (401 Unauthorized)**
```json
{
  "success": false,
  "error": "Token d'authentification manquant"
}
```

❌ **Erreur - Token invalide (401 Unauthorized)**
```json
{
  "success": false,
  "error": "Token invalide ou expiré"
}
```

❌ **Erreur - Format token incorrect (401 Unauthorized)**
```json
{
  "success": false,
  "error": "Format de token invalide"
}
```

❌ **Erreur - Utilisateur non trouvé (404 Not Found)**
```json
{
  "success": false,
  "error": "Utilisateur non trouvé"
}
```

❌ **Erreur serveur (500 Internal Server Error)**
```json
{
  "success": false,
  "error": "Erreur serveur interne"
}
```

---

### 2. Création/Mise à jour des Informations d'Entreprise

#### PUT `/api/onboarding/company`

Crée une nouvelle entreprise ou met à jour les informations existantes.

**Headers :**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body :**
```typescript
{
  name: string          // Requis - Nom de l'entreprise (2-100 caractères)
  address?: string      // Optionnel - Adresse (max 500 caractères)
  phone?: string        // Optionnel - Téléphone (max 20 caractères)
  website?: string      // Optionnel - Site web (URL valide, max 200 caractères)
  description?: string  // Optionnel - Description (max 1000 caractères)
  taxId?: string        // Optionnel - Numéro fiscal (max 50 caractères)
  employees?: number    // Optionnel - Nombre d'employés (1-100000)
  fleetSize?: number    // Optionnel - Taille de flotte (0-100000)
}
```

**Exemple de Requête - Création :**

```bash
curl -X PUT http://localhost:3000/api/onboarding/company \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Transport Solutions SARL",
    "address": "123 Rue des Transporteurs, 75001 Paris, France",
    "phone": "+33 1 23 45 67 89",
    "website": "https://www.transportsolutions.fr",
    "description": "Spécialisée dans le transport de marchandises et la logistique",
    "taxId": "FR12345678901",
    "employees": 150,
    "fleetSize": 75
  }'
```

**Exemple de Requête - Mise à jour partielle :**

```bash
curl -X PUT http://localhost:3000/api/onboarding/company \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+33 1 98 76 54 32",
    "fleetSize": 80,
    "description": "Spécialisée dans le transport de marchandises, logistique et maintenance de flotte"
  }'
```

```javascript
// JavaScript/TypeScript
const updateCompanyInfo = async (token, companyData) => {
  try {
    const response = await fetch('/api/onboarding/company', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(companyData),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Entreprise mise à jour:', result.company);
      console.log('Message:', result.message);
      return result.company;
    } else {
      console.error('Erreur:', result.error);
      if (result.details) {
        console.log('Détails de validation:', result.details);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Erreur réseau:', error);
  }
};

// Utilisation - Création
updateCompanyInfo(token, {
  name: "Transport Solutions SARL",
  address: "123 Rue des Transporteurs, 75001 Paris, France",
  phone: "+33 1 23 45 67 89",
  website: "https://www.transportsolutions.fr",
  description: "Spécialisée dans le transport de marchandises",
  taxId: "FR12345678901",
  employees: 150,
  fleetSize: 75
});

// Utilisation - Mise à jour partielle
updateCompanyInfo(token, {
  phone: "+33 1 98 76 54 32",
  fleetSize: 80
});
```

**Réponses :**

✅ **Succès - Création (200 OK)**
```json
{
  "success": true,
  "company": {
    "id": "cmp_1234567890abcdef",
    "name": "Transport Solutions SARL",
    "address": "123 Rue des Transporteurs, 75001 Paris, France",
    "phone": "+33 1 23 45 67 89",
    "website": "https://www.transportsolutions.fr",
    "description": "Spécialisée dans le transport de marchandises et la logistique",
    "taxId": "FR12345678901",
    "employees": 150,
    "fleetSize": 75,
    "createdAt": "2024-12-14T19:50:00.000Z",
    "updatedAt": "2024-12-14T19:50:00.000Z",
    "usersCount": 1
  },
  "message": "Entreprise créée avec succès"
}
```

✅ **Succès - Mise à jour (200 OK)**
```json
{
  "success": true,
  "company": {
    "id": "cmp_1234567890abcdef",
    "name": "Transport Solutions SARL",
    "phone": "+33 1 98 76 54 32",
    "fleetSize": 80,
    "description": "Spécialisée dans le transport de marchandises, logistique et maintenance de flotte",
    "updatedAt": "2024-12-14T19:55:00.000Z",
    "usersCount": 1
  },
  "message": "Entreprise mise à jour avec succès"
}
```

❌ **Erreur - Token manquant (401 Unauthorized)**
```json
{
  "success": false,
  "error": "Token d'authentification manquant"
}
```

❌ **Erreur - Données invalides (400 Bad Request)**
```json
{
  "success": false,
  "error": "Données invalides",
  "details": [
    {
      "field": "name",
      "message": "Le nom de l'entreprise doit contenir au moins 2 caractères"
    },
    {
      "field": "website",
      "message": "URL du site web invalide"
    },
    {
      "field": "employees",
      "message": "Le nombre d'employés doit être un nombre entier"
    }
  ]
}
```

❌ **Erreur - Format téléphone invalide (400 Bad Request)**
```json
{
  "success": false,
  "error": "Format de numéro de téléphone invalide"
}
```

❌ **Erreur - URL site web invalide (400 Bad Request)**
```json
{
  "success": false,
  "error": "URL du site web invalide"
}
```

❌ **Erreur - Nom d'entreprise déjà utilisé (409 Conflict)**
```json
{
  "success": false,
  "error": "Une entreprise avec ce nom existe déjà"
}
```

❌ **Erreur - JSON invalide (400 Bad Request)**
```json
{
  "success": false,
  "error": "Format JSON invalide"
}
```

**Schéma de Validation Zod :**

```typescript
const companyInfoSchema = z.object({
  name: z.string()
    .min(2, 'Le nom de l\'entreprise doit contenir au moins 2 caractères')
    .max(100, 'Le nom de l\'entreprise ne peut pas dépasser 100 caractères'),
  address: z.string()
    .max(500, 'L\'adresse ne peut pas dépasser 500 caractères')
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .max(20, 'Le numéro de téléphone ne peut pas dépasser 20 caractères')
    .optional()
    .or(z.literal('')),
  website: z.string()
    .url('URL du site web invalide')
    .max(200, 'L\'URL ne peut pas dépasser 200 caractères')
    .optional()
    .or(z.literal('')),
  description: z.string()
    .max(1000, 'La description ne peut pas dépasser 1000 caractères')
    .optional()
    .or(z.literal('')),
  taxId: z.string()
    .max(50, 'Le numéro fiscal ne peut pas dépasser 50 caractères')
    .optional()
    .or(z.literal('')),
  employees: z.number()
    .int('Le nombre d\'employés doit être un nombre entier')
    .min(1, 'Le nombre d\'employés doit être au moins 1')
    .max(100000, 'Le nombre d\'employés ne peut pas dépasser 100000')
    .optional(),
  fleetSize: z.number()
    .int('La taille de la flotte doit être un nombre entier')
    .min(0, 'La taille de la flotte doit être au moins 0')
    .max(100000, 'La taille de la flotte ne peut pas dépasser 100000')
    .optional()
})
```

**Règles de Validation :**
- `name` : Obligatoire, 2-100 caractères
- `address` : Optionnel, max 500 caractères
- `phone` : Optionnel, format validé, max 20 caractères
- `website` : Optionnel, URL valide, max 200 caractères
- `description` : Optionnel, max 1000 caractères
- `taxId` : Optionnel, max 50 caractères
- `employees` : Optionnel, nombre entier 1-100000
- `fleetSize` : Optionnel, nombre entier 0-100000
- Nom d'entreprise unique dans la base de données
- Validation supplémentaire du format téléphone et URL

---

## 🔒 Middleware d'Authentification

### Configuration et Fonctionnement

Le middleware `middleware.ts` protège automatiquement toutes les routes API exceptées celles explicitement publiques.

**Routes Publiques :**
```
/api/auth/login
/api/auth/register
/api/auth/check-blacklist
```

**Protection Automatique :**
- Vérification du header Authorization pour toutes les autres routes API
- Validation basique du format de token (Edge Runtime)
- Vérification de la blacklist des tokens
- Redirection avec code d'erreur 401 pour les tokens invalides

**Exemple de Protection :**

```typescript
// Cette route sera automatiquement protégée
export async function GET(request: NextRequest) {
  // Le middleware a déjà vérifié le token
  // Vous pouvez maintenant extraire les informations du token
  const token = request.headers.get('authorization')?.split(' ')[1];
  // ... logique de la route
}
```

**Gestion des Erreurs :**

❌ **Token manquant (401 Unauthorized)**
```json
{
  "success": false,
  "error": "Token d'authentification manquant"
}
```

❌ **Format token invalide (401 Unauthorized)**
```json
{
  "success": false,
  "error": "Format de token invalide"
}
```

❌ **Token blacklisté (401 Unauthorized)**
```json
{
  "success": false,
  "error": "Token invalide (déconnecté)"
}
```

---

## 🛡️ Sécurité et Bonnes Pratiques

### 1. Gestion des Tokens JWT

**Stockage Sécurisé :**
```javascript
// ✅ Recommandé - Stockage en mémoire ou sessionStorage
const storeToken = (token) => {
  sessionStorage.setItem('authToken', token);
};

// ❌ Éviter - localStorage (vulnérable aux XSS)
localStorage.setItem('authToken', token);
```

**Expiration et Renouvellement :**
```javascript
const checkTokenExpiration = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    
    if (currentTime >= expirationTime) {
      // Token expiré, déconnecter l'utilisateur
      logoutUser(token);
      return false;
    }
    
    // Vérifier si le token expire dans moins de 1 heure
    const timeUntilExpiration = expirationTime - currentTime;
    if (timeUntilExpiration < 3600000) {
      console.warn('Token va bientôt expirer');
      // Optionnel: Proposer le renouvellement
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    return false;
  }
};
```

### 2. Validation des Données

**Côté Client :**
```javascript
const validateRegistrationData = (data) => {
  const errors = [];
  
  if (!data.name || data.name.length < 2) {
    errors.push('Le nom doit contenir au moins 2 caractères');
  }
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Format d\'email invalide');
  }
  
  if (!data.password || data.password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
```

### 3. Gestion des Erreurs

**Pattern de Gestion d'Erreurs :**
```javascript
const handleApiError = (response) => {
  if (!response.ok) {
    switch (response.status) {
      case 401:
        // Token invalide ou expiré
        logoutUser();
        window.location.href = '/login';
        break;
      case 403:
        // Accès interdit
        alert('Vous n\'avez pas les permissions nécessaires');
        break;
      case 409:
        // Conflit (email déjà utilisé)
        alert('Cet email est déjà utilisé');
        break;
      case 500:
        // Erreur serveur
        alert('Erreur serveur, veuillez réessayer plus tard');
        break;
      default:
        alert('Une erreur inattendue s\'est produite');
    }
    return false;
  }
  return true;
};
```

### 4. Headers de Sécurité

```javascript
// Headers recommandés pour les requêtes API
const apiHeaders = {
  'Content-Type': 'application/json',
  'X-Requested-With': 'XMLHttpRequest', // Protection CSRF
};

// Ajouter le token pour les routes protégées
if (token) {
  apiHeaders['Authorization'] = `Bearer ${token}`;
}
```

---

## 🧪 Tests et Validation

### 1. Scripts de Test Disponibles

```bash
# Test de l'infrastructure complète
npm run test:infra

# Test du modèle utilisateur
node scripts/test-user-model.js

# Test des APIs d'authentification
node scripts/test-auth-apis-global.js

# Test spécifique de l'API logout
node scripts/test-logout-api.js

# Test du middleware
node scripts/test-middleware.js

# Test direct de la base de données
node scripts/test-db-direct.js
```

### 2. Tests Manuels avec cURL

**Workflow Complet de Test :**

```bash
#!/bin/bash
# test-auth-workflow.sh

BASE_URL="http://localhost:3000"

echo "=== Test Workflow Authentification FleetMada ==="

# 1. Inscription
echo -e "\n1. Test Inscription"
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!",
    "companyName": "Test Company"
  }')
echo "Réponse inscription: $REGISTER_RESPONSE"

# 2. Connexion
echo -e "\n2. Test Connexion"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }')
echo "Réponse connexion: $LOGIN_RESPONSE"

# Extraire le token
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Token extrait: $TOKEN"

# 3. Récupération profil
echo -e "\n3. Test Profil (GET)"
curl -s -X GET $BASE_URL/api/profile \
  -H "Authorization: Bearer $TOKEN"

# 4. Modification profil
echo -e "\n4. Test Profil (PUT)"
curl -s -X PUT $BASE_URL/api/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User Updated"}'

# 5. Déconnexion
echo -e "\n5. Test Déconnexion"
curl -s -X POST $BASE_URL/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"

# 6. Tentative d'accès avec token blacklisté
echo -e "\n6. Test Accès avec Token Blacklisté"
curl -s -X GET $BASE_URL/api/profile \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n=== Test Workflow Terminé ==="
```

### 3. Tests Unitaires JavaScript

```javascript
// test-auth-api.js
const API_BASE = 'http://localhost:3000/api';

class AuthAPITester {
  constructor() {
    this.results = [];
  }

  async testEndpoint(name, method, endpoint, options = {}) {
    console.log(`Testing ${method} ${endpoint}...`);
    
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      const result = await response.json();
      const success = response.ok;

      this.results.push({
        name,
        method,
        endpoint,
        status: response.status,
        success,
        result
      });

      console.log(`${success ? '✅' : '❌'} ${name}: ${response.status}`);
      return result;

    } catch (error) {
      console.error(`❌ ${name}: Erreur réseau`, error);
      this.results.push({
        name,
        method,
        endpoint,
        error: error.message
      });
    }
  }

  generateReport() {
    console.log('\n=== Rapport de Tests ===');
    const passed = this.results.filter(r => r.success).length;
    const total = this.results.length;
    
    console.log(`Tests réussis: ${passed}/${total}`);
    
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.name} (${result.status || 'Erreur'})`);
      
      if (!result.success && result.result?.error) {
        console.log(`   Erreur: ${result.result.error}`);
      }
    });
  }
}

// Utilisation
const tester = new AuthAPITester();

(async () => {
  // Test d'inscription
  await tester.testEndpoint('Inscription utilisateur', 'POST', '/auth/register', {
    body: {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'TestPass123!',
      companyName: 'Test Company'
    }
  });

  // Test de connexion
  const loginResult = await tester.testEndpoint('Connexion utilisateur', 'POST', '/auth/login', {
    body: {
      email: 'test@example.com',
      password: 'TestPass123!'
    }
  });

  const token = loginResult?.token;

  if (token) {
    // Test de récupération de profil
    await tester.testEndpoint('Récupération profil', 'GET', '/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // Test de modification de profil
    await tester.testEndpoint('Modification profil', 'PUT', '/profile', {
      headers: { 'Authorization': `Bearer ${token}` },
      body: { name: 'Test User Updated' }
    });

    // Test de déconnexion
    await tester.testEndpoint('Déconnexion', 'POST', '/auth/logout', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // Test d'accès avec token blacklisté
    await tester.testEndpoint('Accès token blacklisté', 'GET', '/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  tester.generateReport();
})();
```

---

## 🔧 Guide d'Intégration Frontend

### 1. Configuration du Client API

```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = this.getStoredToken();
  }

  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('authToken');
    }
    return null;
  }

  private setStoredToken(token: string | null): void {
    if (typeof window !== 'undefined') {
      if (token) {
        sessionStorage.setItem('authToken', token);
      } else {
        sessionStorage.removeItem('authToken');
      }
    }
  }

  setToken(token: string | null): void {
    this.token = token;
    this.setStoredToken(token);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const result = await response.json();

      if (response.ok) {
        return { success: true, data: result };
      } else {
        // Gestion des erreurs d'authentification
        if (response.status === 401) {
          this.setToken(null);
          // Redirection vers la page de connexion si nécessaire
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return { success: false, error: result.error || 'Erreur inconnue' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur réseau' 
      };
    }
  }

  // Méthodes d'authentification
  async register(userData: {
    name: string;
    email: string;
    password: string;
    companyName: string;
    avatar?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(email: string, password: string) {
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (result.success && result.data?.token) {
      this.setToken(result.data.token);
    }

    return result;
  }

  async logout() {
    const result = await this.request('/auth/logout', {
      method: 'POST',
    });
    
    this.setToken(null);
    return result;
  }

  // Méthodes de profil
  async getProfile() {
    return this.request('/profile');
  }

  async updateProfile(data: {
    name?: string;
    companyName?: string;
    avatar?: string;
    password?: string;
    currentPassword?: string;
  }) {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAccount() {
    const result = await this.request('/profile', {
      method: 'DELETE',
    });
    
    this.setToken(null);
    return result;
  }
}

export const apiClient = new ApiClient();
```

### 2. Hooks React Personnalisés

```typescript
// hooks/useAuth.ts
import { useState, useEffect, createContext, useContext } from 'react';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  companyName: string;
  avatar?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const result = await apiClient.getProfile();
      if (result.success && result.data?.user) {
        setUser(result.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const result = await apiClient.login(email, password);
    
    if (result.success && result.data?.user) {
      setUser(result.data.user);
      return true;
    }
    
    return false;
  };

  const register = async (userData: any): Promise<boolean> => {
    const result = await apiClient.register(userData);
    return result.success;
  };

  const logout = async (): Promise<void> => {
    await apiClient.logout();
    setUser(null);
  };

  const updateProfile = async (data: any): Promise<boolean> => {
    const result = await apiClient.updateProfile(data);
    
    if (result.success && result.data?.user) {
      setUser(result.data.user);
      return true;
    }
    
    return false;
  };

  const deleteAccount = async (): Promise<boolean> => {
    const result = await apiClient.deleteAccount();
    
    if (result.success) {
      setUser(null);
      return true;
    }
    
    return false;
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    deleteAccount,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### 3. Composants d'Interface

```typescript
// components/LoginForm.tsx
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(formData.email, formData.password);
      
      if (!success) {
        setError('Email ou mot de passe incorrect');
      }
    } catch (error) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="password" className="block text-sm font-medium">
          Mot de passe
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300"
        />
      </div>

      {error && (
        <div className="mb-4 text-red-600 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  );
};
```

### 4. Protection des Routes

```typescript
// components/ProtectedRoute.tsx
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from './LoginForm';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || <LoginForm />;
  }

  return <>{children}</>;
};

// Utilisation dans une page
const DashboardPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <div>
        <h1>Dashboard</h1>
        {/* Contenu protégé */}
      </div>
    </ProtectedRoute>
  );
};
```

---

## 📊 Schéma de Base de Données

### Modèle User

```prisma
model User {
  id              String          @id @default(cuid())
  name            String
  email           String          @unique
  password        String
  companyName     String
  avatar          String?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  // Relations avec cascade pour suppression
  chargingEntries ChargingEntry[]
  fuelEntries     FuelEntry[]
  issues          Issue[]
  serviceEntries  ServiceEntry[]
  vehicles        Vehicle[]
  blacklistedTokens BlacklistedToken[]
}
```

### Modèle BlacklistedToken

```prisma
model BlacklistedToken {
  id          String   @id @default(cuid())
  token       String   @unique
  userId      String
  expiresAt   DateTime
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([expiresAt])
}
```

### Index et Optimisations

```sql
-- Index pour l'unicité de l'email
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Index pour la recherche rapide d'utilisateurs
CREATE INDEX "User_id_idx" ON "User"("id");

-- Index pour les tokens blacklistés par utilisateur
CREATE INDEX "BlacklistedToken_userId_idx" ON "BlacklistedToken"("userId");

-- Index pour le nettoyage des tokens expirés
CREATE INDEX "BlacklistedToken_expiresAt_idx" ON "BlacklistedToken"("expiresAt");

-- Index pour la vérification rapide des tokens blacklistés
CREATE UNIQUE INDEX "BlacklistedToken_token_key" ON "BlacklistedToken"("token");
```

---

## 🚀 Déploiement et Configuration

### 1. Variables d'Environnement de Production

```env
# Base de données
DATABASE_URL="postgresql://username:password@host:port/database"

# JWT Secret (générer une clé sécurisée)
JWT_SECRET="your-super-secure-jwt-secret-key-256-bits-minimum"

# Environnement
NODE_ENV="production"
NEXT_PUBLIC_API_URL="https://your-domain.com/api"

# Logging
LOG_LEVEL="info"

# Rate Limiting (optionnel)
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

### 2. Configuration Docker

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: fleetmada
      POSTGRES_USER: fleetmada_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    environment:
      DATABASE_URL: "postgresql://fleetmada_user:secure_password@postgres:5432/fleetmada"
      JWT_SECRET: "${JWT_SECRET}"
      NODE_ENV: "production"
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    volumes:
      - .:/app
      - /app/node_modules

volumes:
  postgres_data:
```

### 3. Scripts de Déploiement

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Déploiement FleetMada API"

# 1. Installation des dépendances
npm install

# 2. Génération du client Prisma
npm run db:generate

# 3. Migration de la base de données
npm run db:migrate

# 4. Build de l'application
npm run build

# 5. Démarrage en production
npm run start

echo "✅ Déploiement terminé"
```

---

## 📝 Exemples Complets d'Intégration

### 1. Workflow Complet JavaScript

```javascript
// auth-workflow-example.js
class FleetMadaAuthExample {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
    this.token = null;
  }

  // 1. Inscription
  async registerUser(userData) {
    console.log('📝 Inscription en cours...');
    
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Inscription réussie:', result.user);
      return result;
    } else {
      console.error('❌ Erreur inscription:', result.error);
      throw new Error(result.error);
    }
  }

  // 2. Connexion
  async loginUser(email, password) {
    console.log('🔐 Connexion en cours...');
    
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    
    if (result.success) {
      this.token = result.token;
      console.log('✅ Connexion réussie:', result.user);
      return result;
    } else {
      console.error('❌ Erreur connexion:', result.error);
      throw new Error(result.error);
    }
  }

  // 3. Récupération profil
  async getUserProfile() {
    console.log('👤 Récupération du profil...');
    
    const response = await fetch(`${this.baseURL}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Profil récupéré:', result.user);
      return result.user;
    } else {
      console.error('❌ Erreur profil:', result.error);
      throw new Error(result.error);
    }
  }

  // 4. Modification profil
  async updateUserProfile(updates) {
    console.log('✏️ Modification du profil...');
    
    const response = await fetch(`${this.baseURL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify(updates),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Profil modifié:', result.user);
      return result.user;
    } else {
      console.error('❌ Erreur modification:', result.error);
      throw new Error(result.error);
    }
  }

  // 5. Déconnexion
  async logoutUser() {
    console.log('🚪 Déconnexion en cours...');
    
    const response = await fetch(`${this.baseURL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    const result = await response.json();
    
    if (result.success) {
      this.token = null;
      console.log('✅ Déconnexion réussie');
      return true;
    } else {
      console.error('❌ Erreur déconnexion:', result.error);
      throw new Error(result.error);
    }
  }

  // 6. Test accès avec token blacklisté
  async testBlacklistedAccess() {
    console.log('🧪 Test accès avec token blacklisté...');
    
    const response = await fetch(`${this.baseURL}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    const result = await response.json();
    
    if (!result.success && result.error.includes('déconnecté')) {
      console.log('✅ Token correctement blacklisté');
      return true;
    } else {
      console.error('❌ Problème avec la blacklist');
      return false;
    }
  }

  // Workflow complet
  async runCompleteWorkflow() {
    try {
      console.log('🚀 Démarrage du workflow complet\n');

      // 1. Inscription
      const registerResult = await this.registerUser({
        name: 'Jean Dupont',
        email: `jean.dupont.${Date.now()}@example.com`,
        password: 'MotDePasse123!',
        companyName: 'Transport Solutions SARL',
      });

      // 2. Connexion
      const loginResult = await this.loginUser(
        registerResult.user.email,
        'MotDePasse123!'
      );

      // 3. Récupération profil
      const profile = await this.getUserProfile();

      // 4. Modification profil
      const updatedProfile = await this.updateUserProfile({
        name: 'Jean-Pierre Dupont',
        companyName: 'Transport Solutions & Logistique',
      });

      // 5. Test accès autorisé
      await this.getUserProfile();

      // 6. Déconnexion
      await this.logoutUser();

      // 7. Test accès avec token blacklisté
      await this.testBlacklistedAccess();

      console.log('\n✅ Workflow complet terminé avec succès!');
      
    } catch (error) {
      console.error('\n❌ Erreur dans le workflow:', error.message);
    }
  }
}

// Exécution
const authExample = new FleetMadaAuthExample();
authExample.runCompleteWorkflow();
```

### 2. Exemple React avec Gestion d'État

```typescript
// components/UserManagement.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const UserManagement: React.FC = () => {
  const { user, login, register, logout, updateProfile, deleteAccount } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        companyName: user.companyName,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const updates: any = {
        name: formData.name,
        companyName: formData.companyName,
      };

      // Gestion du changement de mot de passe
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setMessage('Les mots de passe ne correspondent pas');
          return;
        }
        updates.password = formData.newPassword;
        updates.currentPassword = formData.currentPassword;
      }

      const success = await updateProfile(updates);
      
      if (success) {
        setMessage('Profil mis à jour avec succès');
        setIsEditing(false);
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setMessage('Erreur lors de la mise à jour');
      }
    } catch (error) {
      setMessage('Erreur lors de la mise à jour du profil');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      const success = await deleteAccount();
      if (success) {
        // Redirection vers la page d'accueil
        window.location.href = '/';
      } else {
        setMessage('Erreur lors de la suppression du compte');
      }
    }
  };

  if (!user) {
    return <div>Veuillez vous connecter</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Gestion du Profil</h1>

      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.includes('succès') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Informations du profil</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {isEditing ? 'Annuler' : 'Modifier'}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nom
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Entreprise
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-2">Changer le mot de passe</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Sauvegarder
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <p className="mt-1 text-sm text-gray-900">{user.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{user.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Entreprise</label>
              <p className="mt-1 text-sm text-gray-900">{user.companyName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Membre depuis</label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(user.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800 mb-2">Zone de danger</h3>
        <p className="text-sm text-red-600 mb-4">
          La suppression de votre compte est irréversible et entraînera la perte de toutes vos données.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Supprimer mon compte
        </button>
      </div>
    </div>
  );
};
```

---

## 🎯 Conclusion

Cette documentation API complète du Sprint 1 de FleetMada couvre l'intégralité du système d'authentification et de gestion des utilisateurs. Elle inclut :

### ✅ Fonctionnalités Documentées

- **🔐 Authentification complète** : Inscription, connexion, déconnexion sécurisée
- **👤 Gestion de profil** : Lecture, modification, suppression avec validation
- **🛡️ Sécurité robuste** : JWT, blacklist, hachage bcrypt, middleware
- **🧪 Tests complets** : Scripts automatisés et exemples manuels
- **📚 Intégration frontend** : Hooks React, composants, patterns
- **🚀 Déploiement** : Configuration Docker et variables d'environnement

### 🔧 Technologies Utilisées

- **Backend** : Next.js 14, TypeScript, Prisma, PostgreSQL
- **Authentification** : JWT, bcryptjs, Zod
- **Frontend** : React, hooks personnalisés, gestion d'état
- **Tests** : Scripts Node.js, cURL, workflows automatisés

### 📖 Prochaines Étapes

Cette documentation serve de base pour :
1. L'intégration frontend par les développeurs
2. Les tests d'intégration par l'équipe QA
3. Le déploiement en production
4. L'évolution vers les sprints suivants

Pour toute question ou clarification, référez-vous aux scripts de test inclus et aux exemples d'implémentation fournis.

---

## 🔄 Workflow Complet

### Vue d'ensemble du Workflow Utilisateur

Le workflow complet de FleetMada Sprint 1 suit le processus suivant :

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORKFLOW COMPLET FLEETMADA                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 📝 INSCRIPTION                                              │
│     └── POST /api/auth/register                                 │
│                                                                 │
│  2. 🔐 CONNEXION                                                │
│     └── POST /api/auth/login                                    │
│                                                                 │
│  3. 🏢 ONBOARDING COMPANY (Optionnel)                           │
│     ├── GET  /api/onboarding/company    (Récupération)         │
│     └── PUT  /api/onboarding/company    (Création/Mise à jour) │
│                                                                 │
│  4. 👤 GESTION PROFIL                                           │
│     ├── GET    /api/profile           (Lecture profil)         │
│     ├── PUT    /api/profile           (Modification profil)    │
│     └── DELETE /api/profile           (Suppression compte)     │
│                                                                 │
│  5. 🚪 DÉCONNEXION                                              │
│     └── POST /api/auth/logout                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Workflow JavaScript Complet

```javascript
// Classe complète pour gérer le workflow FleetMada
class FleetMadaAuthWorkflow {
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
    this.token = null;
    this.user = null;
  }

  // Étape 1: Inscription
  async register(userData) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Inscription réussie:', result.user);
        return { success: true, user: result.user, nextStep: 'login' };
      } else {
        console.error('❌ Erreur inscription:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Erreur réseau:', error);
      return { success: false, error: 'Erreur réseau' };
    }
  }

  // Étape 2: Connexion
  async login(credentials) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();
      
      if (result.success) {
        this.token = result.token;
        this.user = result.user;
        localStorage.setItem('authToken', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        
        console.log('✅ Connexion réussie:', this.user);
        return { success: true, user: this.user, token: this.token, nextStep: 'onboarding' };
      } else {
        console.error('❌ Erreur connexion:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Erreur réseau:', error);
      return { success: false, error: 'Erreur réseau' };
    }
  }

  // Étape 3: Onboarding Company
  async completeCompanyOnboarding(companyData) {
    if (!this.token) {
      return { success: false, error: 'Token d\'authentification manquant' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/onboarding/company`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Onboarding entreprise terminé:', result.company);
        return { success: true, company: result.company, nextStep: 'profile' };
      } else {
        console.error('❌ Erreur onboarding:', result.error);
        return { success: false, error: result.error, details: result.details };
      }
    } catch (error) {
      console.error('❌ Erreur réseau:', error);
      return { success: false, error: 'Erreur réseau' };
    }
  }

  // Récupérer les informations d'entreprise
  async getCompanyInfo() {
    if (!this.token) {
      return { success: false, error: 'Token d\'authentification manquant' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/onboarding/company`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${this.token}` },
      });

      const result = await response.json();
      
      if (result.success) {
        return { success: true, company: result.company, hasCompany: result.company !== null };
      } else {
        console.error('❌ Erreur récupération entreprise:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Erreur réseau:', error);
      return { success: false, error: 'Erreur réseau' };
    }
  }

  // Étape 4: Gestion du Profil
  async getProfile() {
    if (!this.token) {
      return { success: false, error: 'Token d\'authentification manquant' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/profile`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${this.token}` },
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Profil récupéré:', result.user);
        return { success: true, user: result.user };
      } else {
        console.error('❌ Erreur récupération profil:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Erreur réseau:', error);
      return { success: false, error: 'Erreur réseau' };
    }
  }

  async updateProfile(updateData) {
    if (!this.token) {
      return { success: false, error: 'Token d\'authentification manquant' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Profil mis à jour:', result.user);
        this.user = result.user;
        localStorage.setItem('user', JSON.stringify(this.user));
        return { success: true, user: result.user };
      } else {
        console.error('❌ Erreur mise à jour profil:', result.error);
        return { success: false, error: result.error, details: result.details };
      }
    } catch (error) {
      console.error('❌ Erreur réseau:', error);
      return { success: false, error: 'Erreur réseau' };
    }
  }

  // Étape 5: Déconnexion
  async logout() {
    if (!this.token) {
      return { success: false, error: 'Token d\'authentification manquant' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      // Nettoyer les données locales même en cas d'erreur
      this.token = null;
      this.user = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      if (result.success) {
        console.log('✅ Déconnexion réussie');
        return { success: true };
      } else {
        console.warn('⚠️ Déconnexion avec avertissement:', result.error);
        return { success: true, warning: result.error };
      }
    } catch (error) {
      console.error('❌ Erreur réseau:', error);
      // Nettoyer quand même les données locales
      this.token = null;
      this.user = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return { success: true, error: 'Erreur réseau lors de la déconnexion' };
    }
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    return this.token !== null && this.user !== null;
  }

  // Charger les données depuis localStorage
  loadFromStorage() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      this.token = token;
      try {
        this.user = JSON.parse(user);
      } catch (error) {
        console.error('Erreur parsing user data:', error);
        this.user = null;
      }
    }
    
    return this.isAuthenticated();
  }
}

// Exemple d'utilisation complète
async function completeFleetMadaWorkflow() {
  const fleetMada = new FleetMadaAuthWorkflow();
  
  // Charger les données existantes si disponibles
  fleetMada.loadFromStorage();
  
  // Si déjà connecté, vérifier l'onboarding entreprise
  if (fleetMada.isAuthenticated()) {
    console.log('🔄 Utilisateur déjà connecté');
    
    const companyInfo = await fleetMada.getCompanyInfo();
    if (companyInfo.success && !companyInfo.hasCompany) {
      console.log('🏢 Onboarding entreprise requis');
      
      const onboardingResult = await fleetMada.completeCompanyOnboarding({
        name: "Mon Entreprise SARL",
        address: "123 Rue Example, 75001 Paris",
        phone: "+33 1 23 45 67 89",
        website: "https://www.monentreprise.fr",
        description: "Entreprise de transport",
        employees: 50,
        fleetSize: 25
      });
      
      if (onboardingResult.success) {
        console.log('✅ Onboarding terminé');
      }
    }
    
    console.log('🎯 Accès au dashboard FleetMada');
    return;
  }
  
  // Workflow complet pour nouvel utilisateur
  try {
    // Étape 1: Inscription
    const registerResult = await fleetMada.register({
      name: "Jean Dupont",
      email: "jean.dupont@example.com",
      password: "MotDePasse123!",
      companyName: "Transport Solutions SARL"
    });
    
    if (!registerResult.success) {
      console.error('Échec inscription:', registerResult.error);
      return;
    }
    
    // Étape 2: Connexion
    const loginResult = await fleetMada.login({
      email: "jean.dupont@example.com",
      password: "MotDePasse123!"
    });
    
    if (!loginResult.success) {
      console.error('Échec connexion:', loginResult.error);
      return;
    }
    
    // Étape 3: Onboarding entreprise
    const onboardingResult = await fleetMada.completeCompanyOnboarding({
      name: "Transport Solutions SARL",
      address: "123 Rue des Transporteurs, 75001 Paris, France",
      phone: "+33 1 23 45 67 89",
      website: "https://www.transportsolutions.fr",
      description: "Spécialisée dans le transport de marchandises et la logistique",
      taxId: "FR12345678901",
      employees: 150,
      fleetSize: 75
    });
    
    if (onboardingResult.success) {
      console.log('✅ Onboarding entreprise terminé');
    }
    
    // Étape 4: Vérification du profil
    const profileResult = await fleetMada.getProfile();
    if (profileResult.success) {
      console.log('✅ Profil vérifié:', profileResult.user);
    }
    
    console.log('🎯 Bienvenue dans FleetMada ! Dashboard accessible');
    
  } catch (error) {
    console.error('❌ Erreur dans le workflow:', error);
  }
}
```

### États et Transitions du Workflow

| État Actuel | Action | État Suivant | API Endpoint |
|-------------|--------|--------------|---------------|
| Non connecté | Inscription | En attente de connexion | POST /api/auth/register |
| En attente de connexion | Connexion | Connecté sans entreprise | POST /api/auth/login |
| Connecté sans entreprise | Onboarding Company | Connecté avec entreprise | PUT /api/onboarding/company |
| Connecté avec entreprise | Accès Dashboard | Session active | GET /api/profile |
| Session active | Gestion Profil | Session active | GET/PUT/DELETE /api/profile |
| Session active | Déconnexion | Non connecté | POST /api/auth/logout |

### Points Clés du Workflow

1. **🔐 Authentification Robuste** : JWT avec blacklist pour sécurité maximale
2. **🏢 Onboarding Flexible** : Configuration entreprise optionnelle mais recommandée
3. **👤 Gestion Complète** : CRUD complet sur profil utilisateur
4. **🔄 États Bien Définis** : Workflow avec transitions claires
5. **🛡️ Gestion d'Erreurs** : Messages d'erreur contextuels et actions de récupération
6. **📱 UX Optimisée** : Workflow adaptatif selon l'état de l'utilisateur

---

**📅 Version** : Sprint 1 - FleetMada  
**🔄 Dernière mise à jour** : 14 Décembre 2024  
**👨‍💻 Maintenu par** : Équipe Développement FleetMada