#!/usr/bin/env node

/**
 * Test script pour les APIs Places de FleetMada
 * Teste toutes les fonctionnalités CRUD et de géocodage
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName, success, details = '') {
  const status = success ? '✓ PASS' : '✗ FAIL';
  const color = success ? 'green' : 'red';
  log(`  ${status} ${testName}`, color);
  if (details) {
    log(`    ${details}`, 'cyan');
  }
}

// Données de test
const testData = {
  place1: {
    name: 'Test Station-Service',
    description: 'Station-service de test pour les véhicules de la flotte',
    address: '123 Rue de la République, 75001 Paris, France',
    placeType: 'FUEL_STATION',
    geofenceRadius: 150,
    isActive: true
  },
  place2: {
    name: 'Centre Service Test',
    description: 'Centre de maintenance automobile',
    latitude: 48.8566,
    longitude: 2.3522,
    placeType: 'SERVICE_CENTER',
    geofenceRadius: 200,
    isActive: true
  },
  place3: {
    name: 'Bureau Test',
    description: 'Bureau principal de l\'entreprise',
    address: '456 Avenue des Champs-Élysées, 75008 Paris, France',
    placeType: 'OFFICE',
    geofenceRadius: 100,
    isActive: true
  }
};

class PlacesApiTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      errors: []
    };
    this.placeIds = [];
  }

  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
      }

      return { success: true, data, response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async testPlacesCRUD() {
    log('\n🔍 Test des APIs CRUD Places', 'bright');

    // Test 1: Création d'un lieu avec géocodage automatique
    const createResult = await this.makeRequest('/places', {
      method: 'POST',
      body: JSON.stringify(testData.place1)
    });

    logTest('Création lieu avec géocodage automatique', createResult.success,
      createResult.success ? `Lieu créé: ${createResult.data.name}` : createResult.error);

    if (createResult.success) {
      this.placeIds.push(createResult.data.id);
      this.results.passed++;
    } else {
      this.results.failed++;
      this.results.errors.push(`CREATE: ${createResult.error}`);
    }

    // Test 2: Création d'un lieu avec coordonnées manuelles
    const createManualResult = await this.makeRequest('/places', {
      method: 'POST',
      body: JSON.stringify(testData.place2)
    });

    logTest('Création lieu avec coordonnées manuelles', createManualResult.success,
      createManualResult.success ? `Lieu créé: ${createManualResult.data.name}` : createManualResult.error);

    if (createManualResult.success) {
      this.placeIds.push(createManualResult.data.id);
      this.results.passed++;
    } else {
      this.results.failed++;
      this.results.errors.push(`CREATE MANUAL: ${createManualResult.error}`);
    }

    // Test 3: Récupération de la liste des sites opérationnels
    const listResult = await this.makeRequest('/places');
    logTest('Récupération liste des sites opérationnels', listResult.success,
      listResult.success ? `${listResult.data.places.length} sites opérationnels trouvés` : listResult.error);

    if (listResult.success) {
      this.results.passed++;
    } else {
      this.results.failed++;
      this.results.errors.push(`LIST: ${listResult.error}`);
    }

    // Test 4: Récupération d'un lieu spécifique
    if (this.placeIds.length > 0) {
      const getResult = await this.makeRequest(`/places/${this.placeIds[0]}`);
      logTest('Récupération lieu spécifique', getResult.success,
        getResult.success ? `Lieu récupéré: ${getResult.data.name}` : getResult.error);

      if (getResult.success) {
        this.results.passed++;
      } else {
        this.results.failed++;
        this.results.errors.push(`GET: ${getResult.error}`);
      }
    }

    // Test 5: Mise à jour d'un lieu
    if (this.placeIds.length > 0) {
      const updateData = {
        description: 'Description mise à jour via test',
        geofenceRadius: 300
      };

      const updateResult = await this.makeRequest(`/places/${this.placeIds[0]}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      logTest('Mise à jour lieu', updateResult.success,
        updateResult.success ? 'Lieu mis à jour avec succès' : updateResult.error);

      if (updateResult.success) {
        this.results.passed++;
      } else {
        this.results.failed++;
        this.results.errors.push(`UPDATE: ${updateResult.error}`);
      }
    }

    // Test 6: Suppression d'un lieu
    if (this.placeIds.length > 1) {
      const deleteResult = await this.makeRequest(`/places/${this.placeIds[1]}`, {
        method: 'DELETE'
      });

      logTest('Suppression lieu', deleteResult.success,
        deleteResult.success ? 'Lieu supprimé avec succès' : deleteResult.error);

      if (deleteResult.success) {
        this.results.passed++;
      } else {
        this.results.failed++;
        this.results.errors.push(`DELETE: ${deleteResult.error}`);
      }
    }
  }

  async testGeocodingAPIs() {
    log('\n🗺️ Test des APIs de géocodage', 'bright');

    // Test 7: Géocodage d'adresse
    const geocodeResult = await this.makeRequest('/places/geocode?address=Paris, France');
    logTest('Géocodage d\'adresse', geocodeResult.success,
      geocodeResult.success ?
        `Coordonnées: ${geocodeResult.data.latitude}, ${geocodeResult.data.longitude}` :
        geocodeResult.error);

    if (geocodeResult.success) {
      this.results.passed++;
    } else {
      this.results.failed++;
      this.results.errors.push(`GEOCODE: ${geocodeResult.error}`);
    }

    // Test 8: Géocodage inverse
    const reverseGeocodeResult = await this.makeRequest('/places/reverse-geocode?lat=48.8566&lng=2.3522');
    logTest('Géocodage inverse', reverseGeocodeResult.success,
      reverseGeocodeResult.success ?
        `Adresse: ${reverseGeocodeResult.data.formattedAddress}` :
        reverseGeocodeResult.error);

    if (reverseGeocodeResult.success) {
      this.results.passed++;
    } else {
      this.results.failed++;
      this.results.errors.push(`REVERSE_GEOCODE: ${reverseGeocodeResult.error}`);
    }

    // Test 9: Recherche de sites opérationnels proches
    const nearbyResult = await this.makeRequest('/places/nearby?lat=48.8566&lng=2.3522&radius=10');
    logTest('Recherche sites opérationnels proches', nearbyResult.success,
      nearbyResult.success ?
        `${nearbyResult.data.totalFound} sites opérationnels trouvés dans un rayon de ${nearbyResult.data.radius}km` :
        nearbyResult.error);

    if (nearbyResult.success) {
      this.results.passed++;
    } else {
      this.results.failed++;
      this.results.errors.push(`NEARBY: ${nearbyResult.error}`);
    }
  }

  async testFilteringAndPagination() {
    log('\n🔍 Test des filtres et pagination', 'bright');

    // Test 10: Filtrage par type de lieu
    const filterResult = await this.makeRequest('/places?type=FUEL_STATION');
    logTest('Filtrage par type de lieu', filterResult.success,
      filterResult.success ?
        `${filterResult.data.places.length} stations-service trouvées` :
        filterResult.error);

    if (filterResult.success) {
      this.results.passed++;
    } else {
      this.results.failed++;
      this.results.errors.push(`FILTER_TYPE: ${filterResult.error}`);
    }

    // Test 11: Recherche textuelle
    const searchResult = await this.makeRequest('/places?search=Test');
    logTest('Recherche textuelle', searchResult.success,
      searchResult.success ?
        `${searchResult.data.places.length} sites opérationnels trouvés pour "Test"` :
        searchResult.error);

    if (searchResult.success) {
      this.results.passed++;
    } else {
      this.results.failed++;
      this.results.errors.push(`SEARCH: ${searchResult.error}`);
    }

    // Test 12: Pagination
    const paginatedResult = await this.makeRequest('/places?page=1&limit=5');
    logTest('Pagination', paginatedResult.success,
      paginatedResult.success ?
        `Page ${paginatedResult.data.pagination.page} sur ${paginatedResult.data.pagination.pages}` :
        paginatedResult.error);

    if (paginatedResult.success) {
      this.results.passed++;
    } else {
      this.results.failed++;
      this.results.errors.push(`PAGINATION: ${paginatedResult.error}`);
    }
  }

  async testValidation() {
    log('\n⚠️ Test de validation', 'bright');

    // Test 13: Validation des données manquantes
    const invalidData = { name: '' };
    const validationResult = await this.makeRequest('/places', {
      method: 'POST',
      body: JSON.stringify(invalidData)
    });

    logTest('Validation données manquantes', !validationResult.success,
      !validationResult.success ? 'Validation fonctionnelle (erreur attendue)' : 'Erreur: validation non fonctionnelle');

    if (!validationResult.success) {
      this.results.passed++;
    } else {
      this.results.failed++;
      this.results.errors.push(`VALIDATION: La validation n'a pas détecté les données invalides`);
    }

    // Test 14: Coordonnées invalides
    const invalidCoords = {
      name: 'Test Lieu',
      latitude: 999, // Latitude invalide
      longitude: 200 // Longitude invalide
    };

    const coordsValidationResult = await this.makeRequest('/places', {
      method: 'POST',
      body: JSON.stringify(invalidCoords)
    });

    logTest('Validation coordonnées invalides', !coordsValidationResult.success,
      !coordsValidationResult.success ? 'Validation coordonnées fonctionnelle' : 'Erreur: validation coordonnées non fonctionnelle');

    if (!coordsValidationResult.success) {
      this.results.passed++;
    } else {
      this.results.failed++;
      this.results.errors.push(`COORD_VALIDATION: La validation n'a pas détecté les coordonnées invalides`);
    }
  }

  async cleanup() {
    log('\n🧹 Nettoyage des données de test', 'bright');

    // Supprimer tous les sites opérationnels de test créés
    for (const placeId of this.placeIds) {
      try {
        await this.makeRequest(`/places/${placeId}`, { method: 'DELETE' });
        log(`  🗑️ Lieu ${placeId} supprimé`, 'cyan');
      } catch (error) {
        log(`  ⚠️ Impossible de supprimer le lieu ${placeId}: ${error.message}`, 'yellow');
      }
    }
  }

  async runAllTests() {
    log('🚀 Démarrage des tests des APIs Places FleetMada', 'bright');
    log(`📡 URL de base: ${BASE_URL}`, 'cyan');
    log(`⏰ Date du test: ${new Date().toISOString()}`, 'cyan');

    try {
      await this.testPlacesCRUD();
      await this.testGeocodingAPIs();
      await this.testFilteringAndPagination();
      await this.testValidation();

      // Affichage du résumé
      log('\n📊 Résumé des tests', 'bright');
      log(`✅ Tests réussis: ${this.results.passed}`, 'green');
      log(`❌ Tests échoués: ${this.results.failed}`, 'red');

      if (this.results.errors.length > 0) {
        log('\n🚨 Erreurs détaillées:', 'red');
        this.results.errors.forEach((error, index) => {
          log(`${index + 1}. ${error}`, 'red');
        });
      }

      // Score final
      const totalTests = this.results.passed + this.results.failed;
      const successRate = totalTests > 0 ? ((this.results.passed / totalTests) * 100).toFixed(1) : 0;
      log(`\n🎯 Taux de réussite: ${successRate}%`, successRate >= 80 ? 'green' : successRate >= 60 ? 'yellow' : 'red');

      if (successRate >= 80) {
        log('🎉 Les APIs Places sont opérationnelles!', 'green');
      } else {
        log('⚠️ Des problèmes ont été détectés dans les APIs Places.', 'yellow');
      }

    } catch (error) {
      log(`\n💥 Erreur fatale lors des tests: ${error.message}`, 'red');
    } finally {
      // Nettoyage
      await this.cleanup();
      log('\n🏁 Tests terminés', 'bright');
    }
  }
}

// Exécution des tests
if (require.main === module) {
  const tester = new PlacesApiTester();
  tester.runAllTests().catch(error => {
    log(`Erreur lors de l'exécution des tests: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = PlacesApiTester;