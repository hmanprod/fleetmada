# Guide d'Installation Développeur - FleetMada

> **Version** : 1.0.0 | **Dernière mise à jour** : 14 Décembre 2025
> 
> Ce guide vous permet de configurer l'environnement de développement FleetMada en moins de 30 minutes.

## 🚀 Démarrage Rapide (5 minutes)

### Prérequis Système
- **Node.js** 18.17+ ou 20.x (recommandé)
- **Docker** 24.x+ et **Docker Compose** v2
- **Git** pour le contrôle de version
- **npm** 9.x+ (inclus avec Node.js) ou **yarn** 1.22+

### Installation Express (Recommandée)

```bash
# 1. Cloner et configurer le projet
git clone <repository-url>
cd fleetmada-web-nextjs

# 2. Installation automatique complète
npm run setup

# 3. Démarrer l'application
npm run dev
```

**🎯 Résultat** : L'application sera disponible sur [http://localhost:3000](http://localhost:3000)

### Que fait le script `setup` ?

Le script automatique effectue ces étapes en séquence :
```bash
npm install                    # 📦 Installation des dépendances
npm run docker:up             # 🐳 Démarrage PostgreSQL + Redis
cp .env.example .env.local     # ⚙️ Configuration environnement
npm run db:generate           # 🗄️ Génération client Prisma
npm run db:migrate            # 🏗️ Application des migrations
npm run test:infra            # ✅ Test de validation infrastructure
```

### Installation Manuelle (Étape par Étape)

Si vous préférez une installation manuelle ou en cas de problème avec le setup automatique :

#### 1. 📦 Installation des Dépendances

```bash
npm install
```

#### 2. ⚙️ Configuration de l'Environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env.local

# Éditer les variables selon vos besoins
# IMPORTANT : Changez les mots de passe par défaut en production
nano .env.local
```

**Variables critiques à modifier :**
- `JWT_SECRET` : Clé secrète pour l'authentification
- `POSTGRES_PASSWORD` : Mot de passe base de données
- `API_KEY` : Clé API pour les services externes

#### 3. 🐳 Démarrage des Services Docker

```bash
# Démarrer PostgreSQL et Redis
npm run docker:up

# Vérifier le statut des conteneurs
docker-compose ps

# Voir les logs de PostgreSQL
npm run docker:logs
```

**Ports utilisés :**
- PostgreSQL : `5432` (configurable via `POSTGRES_PORT`)
- Redis : `6379` (configurable via `REDIS_PORT`)
- Application : `3000`

#### 4. 🗄️ Configuration de la Base de Données

```bash
# Générer le client Prisma TypeScript
npm run db:generate

# Appliquer les migrations
npm run db:migrate

# (Optionnel) Réinitialiser la base de données
npm run db:reset

# (Optionnel) Ajouter des données de test
npm run db:seed
```

#### 5. 🚀 Lancement de l'Application

```bash
# Mode développement avec hot-reload
npm run dev

# L'application sera disponible sur http://localhost:3000
```

### ✅ Validation de l'Installation

Pour vérifier que tout fonctionne correctement :

```bash
# Test complet de l'infrastructure
npm run test:infra

# Vérifier les conteneurs Docker
docker-compose ps

# Tester la connexion base de données
docker exec -it fleetmada_postgres pg_isready -U fleetmada
```

**🎉 Succès** : Si tous les tests passent, votre environnement est prêt !

## 🐳 Configuration Docker

### Services Configurés

| Service | Port | Description |
|---------|------|-------------|
| **PostgreSQL** | 5432 | Base de données principale |
| **Redis** | 6379 | Cache et sessions |

### Variables d'Environnement Docker

Les variables suivantes sont définies dans `.env.example` :

```env
# PostgreSQL
POSTGRES_USER=fleetmada
POSTGRES_PASSWORD=fleetmada123
POSTGRES_DB=fleetmada_db
POSTGRES_PORT=5432

# Redis
REDIS_PORT=6379

# Application
DATABASE_URL=postgresql://fleetmada:fleetmada123@localhost:5432/fleetmada_db
```

### Commandes Docker Utiles

```bash
# Démarrer les services
docker-compose up -d

# Arrêter les services
npm run docker:down

# Redémarrer les services
npm run docker:restart

# Voir les logs
docker-compose logs -f

# Voir les logs PostgreSQL uniquement
npm run docker:logs

# Accéder au shell PostgreSQL
docker exec -it fleetmada_postgres psql -U fleetmada -d fleetmada_db

# Sauvegarder la base de données
docker exec fleetmada_postgres pg_dump -U fleetmada fleetmada_db > backup.sql

# Restaurer la base de données
docker exec -i fleetmada_postgres psql -U fleetmada -d fleetmada_db < backup.sql
```

## 📊 Configuration Prisma

### Schéma de Base de Données

Le projet utilise **Prisma ORM** avec PostgreSQL. Le schéma complet comprend :

#### Modèles Principaux
- **User** : Gestion des utilisateurs
- **Vehicle** : Véhicules de la flotte
- **ServiceEntry** : Entrées de service/entretien
- **FuelEntry** : Consommation de carburant
- **Issue** : Problèmes et incidents

#### Relations
- Utilisateur → Véhicules (One-to-Many)
- Véhicule → Entrées de service (One-to-Many)
- Véhicule → Consommations carburant (One-to-Many)
- Utilisateur → Problèmes (One-to-Many)

### Commandes Prisma

```bash
# Générer le client TypeScript
npm run db:generate

# Créer et appliquer une migration
npm run db:migrate

# Appliquer les migrations en production
npm run db:deploy

# Réinitialiser la base de données (⚠️ Supprime toutes les données)
npm run db:reset

# Démarrer le seeding (données de test)
npm run db:seed
```

### Structure du Projet Prisma

```
prisma/
├── schema.prisma          # Schéma de la base de données
├── migrations/           # Migrations générées
└── seed.ts              # Données de test (à créer)
```

## 🎨 Configuration Tailwind CSS

### Fichiers de Configuration

- **tailwind.config.js** : Configuration personnalisée
- **postcss.config.js** : Plugins PostCSS
- **app/globals.css** : Styles globaux avec directives Tailwind

### Couleurs Personnalisées

Le projet utilise un système de couleurs cohérent :

```css
/* Couleurs primaires */
bg-primary-500    /* Bleu principal */
bg-secondary-500  /* Gris secondaire */

/* Couleurs d'état */
bg-success-500    /* Vert pour succès */
bg-warning-500    /* Orange pour attention */
bg-danger-500     /* Rouge pour erreurs */
```

### Classes Utilitaires Ajoutées

```css
/* Ombres personnalisées */
shadow-custom

/* Animations */
animate-fade-in
animate-slide-in

/* Police */
font-sans /* Inter, system-ui, sans-serif */
```

### Développement avec Tailwind

```bash
# Le serveur de développement recompile automatiquement
npm run dev

# Construire pour la production
npm run build
```

## 🛠️ Scripts npm Disponibles

### Scripts de Développement

| Commande | Description | Usage |
|----------|-------------|-------|
| `npm run dev` | 🚀 Démarre Next.js en mode développement avec hot-reload | Développement local |
| `npm run build` | 🔨 Construit l'application pour la production | Préparation déploiement |
| `npm run start` | 🌐 Démarre l'application en production | Serveur de production |
| `npm run lint` | 🔍 Analyse le code avec ESLint | Validation code |

**Exemples d'usage :**
```bash
# Développement avec rechargement automatique
npm run dev

# Préparation pour la production
npm run build && npm run start

# Validation du code avant commit
npm run lint
```

### Scripts Docker

| Commande | Description | Usage |
|----------|-------------|-------|
| `npm run docker:up` | 🐳 Démarre les conteneurs PostgreSQL et Redis | Infrastructure locale |
| `npm run docker:down` | ⬇️ Arrête tous les conteneurs | Arrêt propre |
| `npm run docker:restart` | 🔄 Redémarre les conteneurs | Redémarrage |
| `npm run docker:logs` | 📋 Affiche les logs PostgreSQL en temps réel | Debugging |

**Exemples d'usage :**
```bash
# Démarrer l'infrastructure
npm run docker:up

# Surveiller les logs
npm run docker:logs

# Redémarrer après modification docker-compose.yml
npm run docker:restart
```

### Scripts Base de Données (Prisma)

| Commande | Description | Usage |
|----------|-------------|-------|
| `npm run db:generate` | 🔧 Génère le client TypeScript Prisma | Après modification du schéma |
| `npm run db:migrate` | 🏗️ Applique les migrations en développement | Évolution du schéma |
| `npm run db:deploy` | 🚀 Déploie les migrations en production | Déploiement sécurisé |
| `npm run db:reset` | 🗑️ Réinitialise complètement la base de données | Reset complet (⚠️ destructeur) |
| `npm run db:seed` | 🌱 Exécute le seeding avec des données de test | Données de démonstration |

**Exemples d'usage :**
```bash
# Après modification du schéma Prisma
npm run db:generate && npm run db:migrate

# Réinitialiser complètement (⚠️ supprime toutes les données)
npm run db:reset && npm run db:seed

# Déploiement en production
npm run db:deploy
```

### Scripts d'Automatisation

| Commande | Description | Usage |
|----------|-------------|-------|
| `npm run setup` | ⚡ Installation automatique complète | Setup initial du projet |
| `npm run test:infra` | ✅ Test de validation de l'infrastructure | Vérification système |

**Script `setup` détaillé :**
```bash
# Le script execute automatiquement dans cet ordre :
npm install                    # 📦 Installation dépendances
npm run docker:up             # 🐳 Démarrage conteneurs
cp .env.example .env.local     # ⚙️ Configuration environnement
npm run db:generate           # 🔧 Génération client Prisma
npm run db:migrate            # 🏗️ Application migrations
npm run test:infra            # ✅ Test infrastructure
```

### 🚨 Scripts de Maintenance

**Pour nettoyer l'environnement :**
```bash
# Arrêter et supprimer les conteneurs avec volumes
npm run docker:down && docker-compose down -v

# Nettoyer Docker complètement
docker system prune -f

# Réinstaller toutes les dépendances
rm -rf node_modules package-lock.json
npm install
```

**Pour diagnostiquer :**
```bash
# Test complet de l'infrastructure
npm run test:infra

# Vérifier les conteneurs
docker-compose ps

# Voir tous les logs
docker-compose logs

# Tester la base de données
docker exec -it fleetmada_postgres pg_isready -U fleetmada
```

## 🚨 Dépannage (Troubleshooting)

### Diagnostic Rapide

```bash
# Test complet de l'infrastructure
npm run test:infra

# Vérifier l'état des services
docker-compose ps
docker-compose logs --tail=20

# Tester la connectivité
curl -I http://localhost:3000
docker exec -it fleetmada_postgres pg_isready -U fleetmada
```

### Problèmes Courants et Solutions

#### 🔴 Erreur de Connexion à la Base de Données

**Symptômes :**
- `Error: Can't reach database server`
- `ECONNREFUSED` sur le port 5432
- `FATAL: password authentication failed`

**Solutions :**
```bash
# 1. Vérifier que PostgreSQL fonctionne
docker-compose ps
docker-compose logs postgres

# 2. Tester la connexion manuellement
docker exec -it fleetmada_postgres pg_isready -U fleetmada

# 3. Redémarrer PostgreSQL
npm run docker:restart

# 4. Vérifier la configuration
cat .env.local | grep DATABASE_URL

# 5. Si problème persiste, recréer les conteneurs
npm run docker:down
docker-compose down -v
npm run docker:up
```

#### 🔴 Erreur Prisma Client

**Symptômes :**
- `Error: Unknown type` dans les requêtes Prisma
- `Prisma Client is not generated`
- Erreurs TypeScript avec Prisma

**Solutions :**
```bash
# 1. Régénérer le client Prisma
npm run db:generate

# 2. Nettoyer et réinstaller si problème persiste
rm -rf node_modules
npm install
npm run db:generate

# 3. Vérifier le schéma Prisma
npx prisma validate

# 4. Recréer les migrations si nécessaire
npm run db:reset
npm run db:migrate
```

#### 🔴 Port Déjà Utilisé

**Symptômes :**
- `Error: listen EADDRINUSE: address already in use :::3000`
- `Port 5432 is already in use`

**Solutions :**
```bash
# 1. Identifier les processus utilisant les ports
lsof -i :3000
lsof -i :5432
lsof -i :6379

# 2. Arrêter les processus conflictuels
kill -9 <PID>

# 3. Ou utiliser des ports différents
# Éditer .env.local :
export POSTGRES_PORT=5433
export REDIS_PORT=6380
export PORT=3001

# 4. Redémarrer avec les nouveaux ports
npm run docker:restart
npm run dev
```

#### 🔴 Problème avec Docker

**Symptômes :**
- `Cannot connect to the Docker daemon`
- Conteneurs qui ne démarrent pas
- Erreurs de volume ou de réseau

**Solutions :**
```bash
# 1. Vérifier Docker
docker --version
docker-compose --version
docker ps

# 2. Nettoyer Docker
npm run docker:down
docker-compose down -v
docker system prune -f

# 3. Redémarrer avec volumes propres
docker-compose up -d --force-recreate

# 4. Vérifier les permissions (Linux/macOS)
sudo chown -R $USER:$USER ~/.docker

# 5. Redémarrer le service Docker (Linux)
sudo systemctl restart docker
```

#### 🔴 Erreur Tailwind CSS

**Symptômes :**
- Styles Tailwind non appliqués
- Classes CSS non reconnues
- Erreurs de compilation PostCSS

**Solutions :**
```bash
# 1. Vérifier la configuration
npx tailwindcss -h
npx postcss --version

# 2. Reconstruire les styles
npm run build

# 3. Nettoyer le cache Next.js
rm -rf .next
npm run dev

# 4. Vérifier tailwind.config.js
cat tailwind.config.js

# 5. Réinstaller Tailwind
npm uninstall tailwindcss postcss autoprefixer
npm install -D tailwindcss postcss autoprefixer
```

#### 🔴 Erreur d'Installation des Dépendances

**Symptômes :**
- `npm ERR! peer dep missing`
- `ENOENT: no such file or directory`
- Erreurs de version Node.js/npm

**Solutions :**
```bash
# 1. Vérifier les versions
node --version  # Doit être 18.17+ ou 20.x
npm --version   # Doit être 9.x+

# 2. Nettoyer npm
npm cache clean --force
rm -rf node_modules package-lock.json

# 3. Réinstaller avec npm limpo
npm install

# 4. Ou utiliser yarn
yarn install

# 5. Forcer la résolution des peer deps
npm install --legacy-peer-deps
```

### 🛠️ Outils de Debug

#### Logs et Monitoring

```bash
# Logs de l'application (terminal séparé)
npm run dev

# Logs Docker tous services
docker-compose logs -f

# Logs PostgreSQL spécifiques
docker-compose logs -f postgres

# Logs Redis
docker-compose logs -f redis

# Suivre tous les logs en temps réel
docker-compose logs -f --tail=0
```

#### Tests de Connectivité

```bash
# Test application
curl -I http://localhost:3000
curl -X GET http://localhost:3000/api/health

# Test base de données
docker exec -it fleetmada_postgres psql -U fleetmada -d fleetmada_db -c "SELECT version();"

# Test Redis
docker exec -it fleetmada_redis redis-cli ping

# Test réseau Docker
docker network ls
docker network inspect fleetmada_fleetmada_network
```

#### Nettoyage Complet

```bash
# 🚨 ATTENTION : Supprime toutes les données

# 1. Arrêter tous les services
npm run docker:down
docker-compose down -v

# 2. Nettoyer Docker
docker system prune -af

# 3. Supprimer les fichiers générés
rm -rf node_modules
rm -rf .next
rm -rf prisma/migrations
rm -f .env.local

# 4. Recommencer l'installation
npm run setup
```

### 📞 Support et Aide

**Avant de demander de l'aide :**

1. ✅ **Exécutez le diagnostic** : `npm run test:infra`
2. ✅ **Consultez cette section** de dépannage
3. ✅ **Vérifiez les logs** pour identifier l'erreur précise
4. ✅ **Testez avec un projet propre** : `rm -rf . env.local && npm run setup`

**Informations à inclure dans votre demande d'aide :**

- Système d'exploitation et version
- Versions Node.js et npm
- Message d'erreur complet (logs)
- Étapes pour reproduire le problème
- Résultat de `npm run test:infra`

**Ressources utiles :**
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation Docker](https://docs.docker.com/)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)

## ⚙️ Configuration de l'Environnement

### Variables d'Environnement (.env.local)

Le fichier `.env.local` configure tous les aspects de l'application. Voici la configuration complète :

#### 📋 Variables de Base de Données

| Variable | Valeur par défaut | Description | Obligatoire |
|----------|-------------------|-------------|-------------|
| `POSTGRES_USER` | `fleetmada` | Nom d'utilisateur PostgreSQL | ✅ |
| `POSTGRES_PASSWORD` | `fleetmada123` | Mot de passe PostgreSQL | ✅ |
| `POSTGRES_DB` | `fleetmada_db` | Nom de la base de données | ✅ |
| `POSTGRES_HOST` | `localhost` | Hôte PostgreSQL | ✅ |
| `POSTGRES_PORT` | `5432` | Port PostgreSQL | ✅ |
| `DATABASE_URL` | `postgresql://fleetmada:fleetmada123@localhost:5432/fleetmada_db` | URL de connexion complète | ✅ |

**🔒 Sécurité :** En production, changez impérativement `POSTGRES_PASSWORD` et configurez une URL sécurisée.

#### 🗄️ Variables Redis

| Variable | Valeur par défaut | Description | Obligatoire |
|----------|-------------------|-------------|-------------|
| `REDIS_HOST` | `localhost` | Hôte Redis | ✅ |
| `REDIS_PORT` | `6379` | Port Redis | ✅ |
| `REDIS_URL` | `redis://localhost:6379` | URL de connexion Redis | ✅ |

#### 🔐 Variables d'Authentification

| Variable | Valeur par défaut | Description | Obligatoire |
|----------|-------------------|-------------|-------------|
| `JWT_SECRET` | `your-super-secret-jwt-key-change-this-in-production` | Clé secrète pour JWT | ✅ |

**🔒 Sécurité :** Utilisez une clé complexe en production (minimum 32 caractères).

#### 🌐 Variables d'Application

| Variable | Valeur par défaut | Description | Obligatoire |
|----------|-------------------|-------------|-------------|
| `NODE_ENV` | `development` | Environnement d'exécution | ✅ |
| `PORT` | `3000` | Port de l'application Next.js | ✅ |
| `API_URL` | `http://localhost:3000/api` | URL de base de l'API | ✅ |

#### 🔑 Variables d'API Externe

| Variable | Valeur par défaut | Description | Obligatoire |
|----------|-------------------|-------------|-------------|
| `API_KEY` | `your-gemini-api-key-here` | Clé API pour services externes | ❌ |

#### 📧 Variables Email (Notifications)

| Variable | Valeur par défaut | Description | Obligatoire |
|----------|-------------------|-------------|-------------|
| `SMTP_HOST` | `smtp.gmail.com` | Serveur SMTP | ❌ |
| `SMTP_PORT` | `587` | Port SMTP | ❌ |
| `SMTP_USER` | `your-email@example.com` | Adresse email | ❌ |
| `SMTP_PASS` | `your-app-password` | Mot de passe application | ❌ |

#### 📁 Variables Upload de Fichiers

| Variable | Valeur par défaut | Description | Obligatoire |
|----------|-------------------|-------------|-------------|
| `MAX_FILE_SIZE` | `10MB` | Taille maximale des fichiers | ✅ |
| `UPLOAD_PATH` | `./uploads` | Répertoire de stockage | ✅ |

#### 📋 Variables de Logging

| Variable | Valeur par défaut | Description | Obligatoire |
|----------|-------------------|-------------|-------------|
| `LOG_LEVEL` | `info` | Niveau de log (debug, info, warn, error) | ✅ |

### 🔧 Configuration Avancée

#### Configuration Docker Personnalisée

Pour modifier les ports ou les configurations :

```bash
# Éditer .env.local
nano .env.local

# Variables importantes à modifier si conflit de ports
POSTGRES_PORT=5433
REDIS_PORT=6380
PORT=3001

# Redémarrer les services
npm run docker:restart
```

#### Configuration de Production

**Exemple de configuration production (.env.production) :**

```env
# Base de données sécurisée
POSTGRES_USER=fleetmada_prod
POSTGRES_PASSWORD=super-secure-random-password-256-bits
POSTGRES_DB=fleetmada_production
DATABASE_URL=postgresql://fleetmada_prod:super-secure-password@prod-db:5432/fleetmada_production

# JWT sécurisé
JWT_SECRET=extremely-secure-jwt-secret-with-256-bits-minimum-length-for-production-environment

# Environnement
NODE_ENV=production
PORT=3000

# Email sécurisé
SMTP_HOST=smtp.entreprise.com
SMTP_USER=fleetmada@entreprise.com
SMTP_PASS=app-specific-password

# API externe
API_KEY=production-api-key-from-provider

# Fichiers
MAX_FILE_SIZE=50MB
UPLOAD_PATH=/var/www/fleetmada/uploads

# Logs détaillés
LOG_LEVEL=warn
```

### 🌍 Variables par Environnement

#### Développement (.env.local)
```env
NODE_ENV=development
POSTGRES_PASSWORD=fleetmada123
JWT_SECRET=development-secret-key
LOG_LEVEL=debug
```

#### Test (.env.test)
```env
NODE_ENV=test
POSTGRES_DB=fleetmada_test
DATABASE_URL=postgresql://fleetmada:test123@localhost:5433/fleetmada_test
```

#### Production (.env.production)
```env
NODE_ENV=production
POSTGRES_PASSWORD=secure-production-password
JWT_SECRET=secure-production-jwt-secret
LOG_LEVEL=warn
```

### 🔒 Sécurité et Bonnes Pratiques

#### ✅ Checklist de Sécurité

- [ ] **Mots de passe forts** : Minimum 12 caractères, majuscules, minuscules, chiffres, symboles
- [ ] **Clés JWT sécurisées** : Minimum 32 caractères, aléatoires
- [ ] **Variables d'environnement** : Jamais commit dans le git
- [ ] **HTTPS en production** : Obligatoire pour les applications web
- [ ] **Accès base de données** : Restreindre les permissions utilisateur
- [ ] **Logs sécurisés** : Ne pas logger d'informations sensibles
- [ ] **Sauvegardes chiffrées** : Protéger les backups de données

#### 🛡️ Protection des Secrets

```bash
# Créer un fichier .env.local s'il n'existe pas
touch .env.local

# Attribuer des permissions restrictives
chmod 600 .env.local

# Ajouter .env.local au .gitignore
echo ".env.local" >> .gitignore

# Générer une clé JWT sécurisée
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 🔍 Validation des Variables

Pour vérifier que toutes les variables sont correctement configurées :

```bash
# Script de validation
node -e "
const required = ['DATABASE_URL', 'JWT_SECRET', 'POSTGRES_USER', 'POSTGRES_PASSWORD'];
const fs = require('fs');
const content = fs.readFileSync('.env.local', 'utf8');
const env = {};
content.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key] = value;
});
required.forEach(key => {
  if (!env[key]) console.log('❌ Variable manquante:', key);
  else console.log('✅', key);
});
"
```

## 🎆 Guide de Démarrage Rapide - Nouveaux Développeurs

> **⏱️ Durée estimée** : 15-30 minutes | **Niveau** : Débutant

### ✅ Checklist de Démarrage Rapide

- [ ] 1. **Vérifier les prérequis** (5 min)
- [ ] 2. **Cloner et installer** (5 min)
- [ ] 3. **Configurer l'environnement** (5 min)
- [ ] 4. **Démarrer l'application** (5 min)
- [ ] 5. **Valider l'installation** (5 min)

### 1. 🚀 Vérification des Prérequis (5 min)

**Vérifiez que vous avez tout installé :**

```bash
# Node.js (version 18+ ou 20.x)
node --version
# ✅ Devrait afficher : v18.x.x ou v20.x.x

# npm (version 9+)
npm --version
# ✅ Devrait afficher : 9.x.x

# Docker
docker --version
# ✅ Devrait afficher : 24.x.x ou supérieur

# Docker Compose
docker-compose --version
# ✅ Devrait afficher : 2.x.x ou supérieur
```

**❌ Si une commande échoue :**
- [Node.js](https://nodejs.org/) : Télécharger et installer la version LTS
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) : Installer et démarrer
- **macOS** : `brew install node docker docker-compose`
- **Ubuntu/Debian** : `sudo apt update && sudo apt install nodejs npm docker.io docker-compose`

### 2. 📦 Cloner et Installer (5 min)

```bash
# Cloner le projet
git clone <repository-url>
cd fleetmada-web-nextjs

# Vérifier le contenu
ls -la
# ✅ Devrait afficher : package.json, docker-compose.yml, .env.example, etc.
```

### 3. ⚙️ Configuration Rapide (5 min)

**Méthode Express (Recommandée) :**
```bash
# Script automatique tout-en-un
npm run setup
```

**Méthode Manuelle :**
```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env.local

# 3. Démarrer Docker
npm run docker:up

# 4. Configurer la base de données
npm run db:generate
npm run db:migrate
```

### 4. 🚀 Démarrage de l'Application (5 min)

```bash
# Démarrer en mode développement
npm run dev
```

**✅ Attendez que vous voyiez :**
```
Local:    http://localhost:3000
Network:  http://192.168.x.x:3000

ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### 5. ✅ Validation de l'Installation (5 min)

**Testez que tout fonctionne :**

```bash
# Terminal 1 : Démarrer l'app
npm run dev

# Terminal 2 : Tester l'infrastructure
npm run test:infra

# Terminal 3 : Vérifier Docker
docker-compose ps
```

**✅ Tests de validation :**

1. **Application web** : [http://localhost:3000](http://localhost:3000)
   - ✅ La page d'accueil se charge
   - ✅ Pas d'erreurs dans la console

2. **Base de données** :
   ```bash
   docker exec -it fleetmada_postgres pg_isready -U fleetmada
   # ✅ Devrait afficher : "accepting connections"
   ```

3. **API** :
   ```bash
   curl http://localhost:3000/api/health
   # ✅ Devrait retourner : {"status":"ok"}
   ```

### 🎆 Félicitations !

**Si tous les tests passent, votre environnement FleetMada est prêt !**

### 🔗 Prochaines Étapes

- 📚 **Lire la documentation** : Explorez les autres sections de ce guide
- 🛠️ **Scripts npm** : Consultez la section des scripts disponibles
- 🐛 **Dépannage** : En cas de problème, consultez la section troubleshooting
- 🎨 **Interface** : Ouvrez [http://localhost:3000](http://localhost:3000) pour découvrir l'application

### 📞 Besoin d'Aide ?

1. **Consultez le [dépannage](#-dépannage-troubleshooting)** pour les problèmes courants
2. **Exécutez** `npm run test:infra` pour un diagnostic automatique
3. **Vérifiez les logs** dans votre terminal

**📞 Support** : Si vous êtes bloqué, gather ces informations :
- Votre OS et version
- Résultats de `npm run test:infra`
- Messages d'erreur complets
- Étapes pour reproduire le problème

## 🔒 Sécurité en Production

### Checklist Sécurité

- [ ] **Changer tous les mots de passe par défaut**
- [ ] **Utiliser des variables d'environnement sécurisées**
- [ ] **Configurer HTTPS/SSL**
- [ ] **Activer les logs de sécurité**
- [ ] **Configurer les backups automatisés**
- [ ] **Mettre à jour les dépendances régulièrement**

### Variables Production

```env
# Production
NODE_ENV=production
POSTGRES_PASSWORD=secure-random-password-here
JWT_SECRET=very-secure-jwt-secret-for-production
DATABASE_URL=postgresql://fleetmada:secure-password@prod-db:5432/fleetmada_prod
```

## 📞 Support

Pour toute question ou problème :

1. **Vérifiez ce guide** de configuration
2. **Consultez les logs** pour identifier l'erreur
3. **Vérifiez la documentation** Prisma/Tailwind/Docker
4. **Contactez l'équipe** de développement

---

**Dernière mise à jour** : 14 Décembre 2025  
**Version** : 1.0.0

---

## 🎯 Prochaines Étapes - Sprint 1

### 📋 Roadmap de Développement

**Sprint 0** (Actuel) : ✅ **Infrastructure et Documentation**
- ✅ Architecture Next.js + Prisma + Docker
- ✅ Base de données PostgreSQL avec migrations
- ✅ Documentation développeur complète
- ✅ Scripts d'automatisation
- ✅ Infrastructure de test

**Sprint 1** (À venir) : 🚀 **Fonctionnalités Core**
- 🔄 **Authentification et Autorisation**
  - Système de connexion/inscription
  - Gestion des rôles et permissions
  - JWT et sessions sécurisées
  
- 🔄 **Gestion des Véhicules**
  - CRUD complet des véhicules
  - Métadonnées et caractéristiques
  - Import/Export de données
  
- 🔄 **Interface Utilisateur**
  - Design system complet
  - Composants réutilisables
  - Responsive design
  - Navigation et routing

- 🔄 **API REST**
  - Endpoints pour toutes les entités
  - Validation des données (Zod)
  - Gestion d'erreurs
  - Documentation API

### 🛠️ Technologies à Explorer

**Frontend :**
- **React Hooks** : useState, useEffect, useContext
- **React Router** : Navigation entre pages
- **Form Handling** : React Hook Form + Zod
- **State Management** : Context API ou Zustand
- **UI Components** : Headless UI ou Radix UI

**Backend :**
- **API Routes** : Next.js API routes
- **Middleware** : Authentification et validation
- **File Upload** : Gestion des fichiers
- **Email** : Nodemailer pour les notifications
- **Background Jobs** : Bull Queue pour les tâches

**Base de Données :**
- **Relations avancées** : One-to-Many, Many-to-Many
- **Indexes** : Optimisation des performances
- **Triggers** : Log automatique des modifications
- **Backup** : Stratégies de sauvegarde

### 📝 Tâches de Préparation

**Pour le Sprint 1, préparez-vous à :**

1. **Approfondir React/Next.js**
   - [ ] Hooks personnalisés
   - [ ] Server Components vs Client Components
   - [ ] Data Fetching (SWR, React Query)
   - [ ] Optimisation des performances

2. **Maîtriser Prisma**
   - [ ] Relations complexes
   - [ ] Transactions
   - [ ] Seeding avancé
   - [ ] Performance et optimisations

3. **UX/UI Design**
   - [ ] Design System
   - [ ] Accessibilité (a11y)
   - [ ] Responsive design
   - [ ] Animations et transitions

### 🔍 Ressources Recommandées

**Documentation :**
- [Next.js 14](https://nextjs.org/docs) - Framework React
- [Prisma 5](https://www.prisma.io/docs) - ORM TypeScript
- [Tailwind CSS](https://tailwindcss.com/docs) - Framework CSS
- [TypeScript](https://www.typescriptlang.org/docs) - Typage statique

**Formation :**
- [React 18](https://react.dev/learn) - Fondamentaux React
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices) - Bonnes pratiques
- [Docker](https://docs.docker.com/get-started/) - Conteneurisation
- [PostgreSQL](https://www.postgresql.org/docs/) - Base de données

**Outils de Développement :**
- [VS Code Extensions](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma) - Prisma, Tailwind, TypeScript
- [Postman](https://www.postman.com/) - Test d'API
- [pgAdmin](https://www.pgadmin.org/) - Interface PostgreSQL
- [Redis Desktop](https://redis.com/redis-enterprise/redis-insight/) - Monitoring Redis

### 🚀 Commencer le Sprint 1

**Commandes pour démarrer le Sprint 1 :**

```bash
# Créer une nouvelle branche
git checkout -b feature/sprint-1-auth

# Installer les nouvelles dépendances (exemple)
npm install react-hook-form @hookform/resolvers zod
npm install bcryptjs jsonwebtoken

# Générer une nouvelle migration Prisma
npx prisma migrate dev --name add-authentication

# Démarrer le développement
npm run dev
```

**Checklist de démarrage Sprint 1 :**
- [ ] Branch Git créée pour les nouvelles features
- [ ] Dépendances installées et configurées
- [ ] Migration Prisma si nécessaire
- [ ] Documentation mise à jour
- [ ] Tests d'intégration configurés

### 🎖️ Objectifs de Qualité

**Code Quality :**
- [ ] Tests unitaires (>80% coverage)
- [ ] Tests d'intégration
- [ ] ESLint + Prettier configurés
- [ ] Husky pour les git hooks
- [ ] Documentation du code

**Performance :**
- [ ] Lighthouse Score >90
- [ ] Time to Interactive <3s
- [ ] Bundle size optimisé
- [ ] Images optimisées
- [ ] CDN configuré

**Sécurité :**
- [ ] HTTPS en production
- [ ] Validation côté client et serveur
- [ ] Rate limiting sur les APIs
- [ ] Logs de sécurité
- [ ] Audit de sécurité régulier

---

**🎉 Félicitations !** Vous avez maintenant un environnement de développement complet et documenté pour FleetMada. 

**Prêt pour le Sprint 1** : Fonctionnalités core et interface utilisateur !

---

**Dernière mise à jour** : 14 Décembre 2025  
**Version** : 1.0.0  
**Sprint** : 0 (Infrastructure & Documentation)