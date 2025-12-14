# Documentation du Seed et des Tests

## Vue d'ensemble

Ce document décrit le système de seed de la base de données FleetMada, qui fournit des données de test réalistes pour le développement et les tests.

## 📋 Scripts Disponibles

### Commandes de base de données
```bash
# Exécuter le seed
npm run db:seed

# Réinitialiser la base de données et reseeder
npm run db:reset

# Générer le client Prisma
npm run db:generate

# Appliquer les migrations
npm run db:migrate

# Déployer les migrations (production)
npm run db:deploy
```

### Commandes Docker
```bash
# Démarrer PostgreSQL
npm run docker:up

# Arrêter PostgreSQL
npm run docker:down

# Redémarrer PostgreSQL
npm run docker:restart

# Voir les logs PostgreSQL
npm run docker:logs
```

## 🔑 Credentials de Test

### Administrateur Principal
- **Email**: `admin@fleetmadagascar.mg`
- **Mot de passe**: `testpassword123`
- **Entreprise**: FleetMadagascar SARL
- **Rôle**: Administrateur système

### Utilisateurs Standard

#### FleetMadagascar SARL
- **Email**: `marie.ratsimba@fleetmadagascar.mg`
- **Mot de passe**: `userpassword123`
- **Nom**: Marie Ratsimba (Fleet Manager)

- **Email**: `paul.andriamanantsoa@fleetmadagascar.mg`
- **Mot de passe**: `userpassword123`
- **Nom**: Paul Andriamanantsoa (Conducteur)

#### Transport Iavola
- **Email**: `sophie@transport-iavola.mg`
- **Mot de passe**: `userpassword123`
- **Nom**: Sophie Razafindrakoto (Transport Manager)

#### Taxi Be Express
- **Email**: `alain@taxibe.mg`
- **Mot de passe**: `userpassword123`
- **Nom**: Alain Ratsahotra (Conducteur)

## 🏢 Structure des Données de Test

### Entreprises (3)

1. **FleetMadagascar SARL**
   - Adresse: Lot II M 89 Bis Antsahavola, Antananarivo 101
   - Téléphone: +261 20 22 123 45
   - Site web: https://fleetmadagascar.mg
   - Employés: 45
   - Taille de flotte: 28 véhicules

2. **Transport Iavola**
   - Adresse: Zone Industrielle Ivato, Antananarivo 105
   - Téléphone: +261 20 24 567 89
   - Site web: https://transport-iavola.mg
   - Employés: 78
   - Taille de flotte: 52 véhicules

3. **Taxi Be Express**
   - Adresse: Avenue de l'Europe, Analakely, Antananarivo 101
   - Téléphone: +261 20 22 987 65
   - Employés: 156
   - Taille de flotte: 89 véhicules

### Véhicules (5)

1. **Toyota Hilux - FM-001-AA**
   - VIN: JTFB22H10A1234567
   - Type: Camion
   - Année: 2022
   - Compteur: 45,670.5 km
   - Statut: ACTIF

2. **Nissan Pathfinder - FM-002-BB**
   - VIN: 5N1AR2MN0HC123456
   - Type: SUV
   - Année: 2021
   - Compteur: 32,840.2 km
   - Statut: ACTIF

3. **Mitsubishi L200 - FM-003-CC**
   - VIN: MMCELK1A0JH123456
   - Type: Pickup
   - Année: 2023
   - Compteur: 12,340.8 km
   - Statut: ACTIF

4. **Ford Transit - TI-001-DD**
   - VIN: 1FBAX2CM5MKA12345
   - Type: Fourgonnette
   - Année: 2022
   - Compteur: 67,890.3 km
   - Statut: MAINTENANCE

5. **Peugeot 208 - TB-001-EE**
   - VIN: VF3CC8HZCJS123456
   - Type: Berline
   - Année: 2023
   - Compteur: 18,750.6 km
   - Statut: ACTIF

### Entrées de Carburant (3)

1. **Toyota Hilux** - 10 décembre 2024
   - Station: Total Antsahavola
   - Volume: 50.0L
   - Coût: 150,000 Ariary
   - Consommation: 8.2L/100km

2. **Nissan Pathfinder** - 11 décembre 2024
   - Station: Shell Ivato
   - Volume: 45.0L
   - Coût: 135,000 Ariary
   - Consommation: 8.9L/100km

3. **Peugeot 208** - 12 décembre 2024
   - Station: Evo Energy Behoririka
   - Volume: 35.0L
   - Coût: 105,000 Ariary
   - Consommation: 10.1L/100km

### Entrées de Recharge Électrique (1)

- **Peugeot 208** - 13 décembre 2024
- **Station**: JIRAMA Analakely
- **Énergie**: 28.5 kWh
- **Coût**: 28,450 Ariary
- **Durée**: 45 minutes

### Fournisseurs (2)

1. **Toyota Madagascar**
   - Contact: Rakoto Ratsimba
   - Téléphone: +261 34 12 345 67
   - Email: rakoto@toyota.mg
   - Labels: Concessionnaire, Pièces détachées

2. **Garage Central**
   - Contact: Jean Claude
   - Téléphone: +261 33 98 765 43
   - Email: jc@garagecentral.mg
   - Labels: Réparation, Maintenance

### Contacts (2)

1. **Hery Rakotoarivelo**
   - Email: hery.rakotoarivelo@example.mg
   - Téléphone: +261 34 11 22 33 4
   - Groupe: Fournisseurs
   - Poste: Directeur Logistique

2. **Voahangy Andrianjafy**
   - Email: voahangy.andrianjafy@example.mg
   - Téléphone: +261 32 44 55 66 7
   - Groupe: Clients
   - Poste: Responsable Achats

### Rappels de Maintenance (2)

1. **Toyota Hilux**
   - Tâche: Vidange moteur
   - Échéance: 15 janvier 2025
   - Conformité: 85.5%

2. **Nissan Pathfinder**
   - Tâche: Contrôle technique
   - Échéance: 1 février 2025
   - Conformité: 92.3%

## 🚀 Instructions d'Utilisation

### Première Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Démarrer PostgreSQL avec Docker
npm run docker:up

# 3. Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos paramètres

# 4. Générer le client Prisma
npm run db:generate

# 5. Appliquer les migrations
npm run db:migrate

# 6. Exécuter le seed
npm run db:seed
```

### Réinitialisation Complète

```bash
# Réinitialiser la base de données et reseeder
npm run db:reset
```

### Utilisation en Développement

```bash
# Démarrer le serveur de développement
npm run dev

# Dans un autre terminal, vous pouvez re-exécuter le seed si nécessaire
npm run db:seed
```

## 🧪 Tests d'Intégration

### Test de Connexion API

```bash
# Connexion avec l'administrateur
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fleetmadagascar.mg",
    "password": "testpassword123"
  }'
```

### Test de Récupération du Profil

```bash
# Récupérer le profil utilisateur
curl -X GET http://localhost:3000/api/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test des Véhicules

```bash
# Lister les véhicules
curl -X GET http://localhost:3000/api/vehicles \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📝 Exemples d'Utilisation

### Scénarios de Test

#### 1. Test d'Authentification
```javascript
// Connexion avec différents utilisateurs
const users = [
  { email: 'admin@fleetmadagascar.mg', password: 'testpassword123' },
  { email: 'marie.ratsimba@fleetmadagascar.mg', password: 'userpassword123' },
  { email: 'alain@taxibe.mg', password: 'userpassword123' }
];
```

#### 2. Test de Gestion de Flotte
```javascript
// Créer une nouvelle entrée de carburant
const fuelEntry = {
  vehicleId: 'vehicle-id',
  date: new Date(),
  vendor: 'Station Shell',
  volume: 40.0,
  cost: 120000,
  usage: 9.5
};
```

#### 3. Test de Multi-Entreprise
```javascript
// Filtrer les données par entreprise
const companyUsers = users.filter(user => 
  user.companyId === fleetMadagascar.id
);
```

## ⚠️ Points d'Attention

### Sécurité
- Les mots de passe de test ne doivent **JAMAIS** être utilisés en production
- Le seed supprime toutes les données existantes
- Les tokens JWT des utilisateurs de test expirent normalement

### Performance
- Le seed peut prendre quelques secondes à s'exécuter
- Évitez d'exécuter le seed en production
- Utilisez `db:reset` uniquement en développement

### Maintenance
- Les données de test peuvent être mises à jour selon les besoins
- Les entreprises et utilisateurs malgaches sont basés sur des données réalistes
- Les prix sont en Ariary malgache (MGA)

## 🔧 Personnalisation

### Ajout de Nouvelles Données

Pour ajouter de nouvelles données de test, modifiez le fichier `prisma/seed.ts` :

```typescript
// Exemple : Ajouter un nouveau véhicule
const newVehicle = await prisma.vehicle.create({
  data: {
    name: 'Nouveau Véhicule',
    vin: 'VIN_EXAMPLE',
    type: 'Type Véhicule',
    year: 2024,
    make: 'Marque',
    model: 'Modèle',
    status: 'ACTIVE',
    meterReading: 0,
    userId: adminUser.id,
  },
});
```

### Modification des Credentials

Pour changer les mots de passe de test :

```typescript
const adminPassword = await bcrypt.hash('nouveau_mot_de_passe', 10);
```

## 📞 Support

En cas de problème avec le seed :
1. Vérifiez que PostgreSQL est en cours d'exécution
2. Vérifiez les variables d'environnement
3. Consultez les logs dans la console
4. Utilisez `npm run db:reset` en dernier recours

---

**Dernière mise à jour**: 14 décembre 2024
**Version**: 1.0.0