# 🚀 Guide de Démarrage Rapide - FleetMada

> **⏱️ Durée estimée** : 15-30 minutes | **Niveau** : Débutant  
> **Objectif** : Configuration complète de l'environnement de développement

## ✅ Checklist de Démarrage Rapide

- [ ] 1. **Vérifier les prérequis** (5 min)
- [ ] 2. **Cloner et installer** (5 min)
- [ ] 3. **Configurer l'environnement** (5 min)
- [ ] 4. **Démarrer l'application** (5 min)
- [ ] 5. **Valider l'installation** (5 min)

---

## 1. 🚀 Vérification des Prérequis (5 min)

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

### ❌ Si une commande échoue :

**Installer Node.js :**
- [Node.js](https://nodejs.org/) : Télécharger et installer la version LTS
- **macOS** : `brew install node`
- **Ubuntu/Debian** : `sudo apt update && sudo apt install nodejs npm`

**Installer Docker :**
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) : Installer et démarrer
- **macOS** : `brew install --cask docker`
- **Ubuntu/Debian** : `sudo apt install docker.io docker-compose`

---

## 2. 📦 Cloner et Installer (5 min)

```bash
# Cloner le projet
git clone <repository-url>
cd fleetmada-web-nextjs

# Vérifier le contenu
ls -la
# ✅ Devrait afficher : package.json, docker-compose.yml, .env.example, etc.
```

---

## 3. ⚙️ Configuration Rapide (5 min)

### Méthode Express (Recommandée)

```bash
# Script automatique tout-en-un
npm run setup
```

### Méthode Manuelle

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

---

## 4. 🚀 Démarrage de l'Application (5 min)

```bash
# Démarrer en mode développement
npm run dev
```

### ✅ Attendez que vous voyiez :

```
Local:    http://localhost:3000
Network:  http://192.168.x.x:3000

ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

---

## 5. ✅ Validation de l'Installation (5 min)

### Tests de validation

**1. Application web** : [http://localhost:3000](http://localhost:3000)
- ✅ La page d'accueil se charge
- ✅ Pas d'erreurs dans la console

**2. Base de données** :
```bash
docker exec -it fleetmada_postgres pg_isready -U fleetmada
# ✅ Devrait afficher : "accepting connections"
```

**3. Infrastructure complète** :
```bash
npm run test:infra
# ✅ Devrait afficher : "All infrastructure tests passed!"
```

**4. API** :
```bash
curl http://localhost:3000/api/health
# ✅ Devrait retourner : {"status":"ok"}
```

---

## 🎉 Félicitations !

**Si tous les tests passent, votre environnement FleetMada est prêt !**

---

## 🔗 Prochaines Étapes

### 📚 Documentation Complète
- **Guide détaillé** : [README-SETUP.md](README-SETUP.md) pour la configuration avancée
- **Scripts npm** : Consultez tous les scripts disponibles
- **Dépannage** : Solutions aux problèmes courants

### 🎨 Explorer l'Application
- **Interface** : [http://localhost:3000](http://localhost:3000)
- **Authentification** : Créez un compte ou connectez-vous
- **Fonctionnalités** : Explorez la gestion de flotte

### 🛠️ Développement
- **Structure** : Explorez les dossiers `app/`, `components/`, `pages/`
- **Base de données** : Consultez `prisma/schema.prisma`
- **API** : Explorez les endpoints dans `pages/api/`

---

## 📞 Besoin d'Aide ?

### 🐛 Problèmes Courants

**Erreur de connexion base de données :**
```bash
# Redémarrer PostgreSQL
npm run docker:restart

# Vérifier les logs
npm run docker:logs
```

**Port déjà utilisé :**
```bash
# Identifier le processus
lsof -i :3000
# Arrêter le processus
kill -9 <PID>
```

**Erreur de dépendances :**
```bash
# Nettoyer et réinstaller
rm -rf node_modules
npm install
```

### 🆘 Support

**Avant de demander de l'aide :**

1. ✅ **Exécutez le diagnostic** : `npm run test:infra`
2. ✅ **Consultez le [dépannage](README-SETUP.md#-dépannage-troubleshooting)**
3. ✅ **Vérifiez les logs** dans votre terminal

**Informations à inclure dans votre demande :**
- Votre OS et version
- Résultats de `npm run test:infra`
- Messages d'erreur complets
- Étapes pour reproduire le problème

---

## 📋 Commandes Essentielles

### Développement
```bash
npm run dev          # Démarrer l'application
npm run build        # Construire pour production
npm run lint         # Vérifier le code
```

### Base de Données
```bash
npm run db:generate  # Régénérer le client Prisma
npm run db:migrate   # Appliquer les migrations
npm run db:reset     # Réinitialiser (⚠️ destructeur)
```

### Docker
```bash
npm run docker:up    # Démarrer les conteneurs
npm run docker:down  # Arrêter les conteneurs
npm run docker:logs  # Voir les logs
```

### Utilitaires
```bash
npm run setup        # Setup automatique complet
npm run test:infra   # Tester l'infrastructure
```

---

**🎯 Objectif atteint** : Environnement de développement FleetMada opérationnel en moins de 30 minutes !