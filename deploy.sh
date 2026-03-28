#!/bin/bash
set -e

# ─────────────────────────────────────────
# Config
# ─────────────────────────────────────────
APP_NAME="fleetmada"
APP_DIR="/var/www/html/fleetmada"
LOG_DIR="/var/log/pm2"
BRANCH="${1:-main}"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✔] $1${NC}"; }
warn() { echo -e "${YELLOW}[!] $1${NC}"; }
fail() { echo -e "${RED}[✘] $1${NC}"; exit 1; }

# ─────────────────────────────────────────
# Vérifications préalables
# ─────────────────────────────────────────
log "Démarrage du déploiement → branche: $BRANCH"

cd "$APP_DIR" || fail "Répertoire $APP_DIR introuvable"

[ -f ".env" ] || fail "Fichier .env manquant — copier .env.example et remplir les valeurs"

command -v node  >/dev/null 2>&1 || fail "Node.js non installé"
command -v npm   >/dev/null 2>&1 || fail "npm non installé"
command -v pm2   >/dev/null 2>&1 || fail "PM2 non installé (npm i -g pm2)"
command -v git   >/dev/null 2>&1 || fail "git non installé"

# ─────────────────────────────────────────
# Git pull
# ─────────────────────────────────────────
log "Pull git ($BRANCH)..."
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

# ─────────────────────────────────────────
# Dépendances
# ─────────────────────────────────────────
log "Installation des dépendances..."
npm ci --omit=dev

# ─────────────────────────────────────────
# Prisma
# ─────────────────────────────────────────
log "Génération du client Prisma..."
npx prisma generate

log "Migration base de données..."
npx prisma migrate deploy

# ─────────────────────────────────────────
# Build Next.js
# ─────────────────────────────────────────
log "Build Next.js..."
NODE_ENV=production npm run build

# ─────────────────────────────────────────
# Logs PM2
# ─────────────────────────────────────────
mkdir -p "$LOG_DIR"

# ─────────────────────────────────────────
# Redémarrage PM2
# ─────────────────────────────────────────
if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
  log "Redémarrage PM2 ($APP_NAME)..."
  pm2 reload "$APP_NAME" --update-env
else
  warn "Première mise en route — démarrage PM2..."
  pm2 start ecosystem.config.js
fi

pm2 save

# ─────────────────────────────────────────
# Résumé
# ─────────────────────────────────────────
echo ""
log "Déploiement terminé."
pm2 status "$APP_NAME"
