/**
 * Script de test pour les APIs Fuel et Charging
 * Teste toutes les fonctionnalités CRUD et les statistiques
 */

const API_BASE = 'http://localhost:3001'
let authToken = ''

// Utilitaires
const log = (message, data = null) => {
  console.log(`\n[TEST] ${message}`)
  if (data) {
    console.log(JSON.stringify(data, null, 2))
  }
}

const logError = (message, error) => {
  console.error(`\n[ERROR] ${message}:`, error)
}

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`)
  }
}

// Fonctions d'authentification pour les tests
const authenticateTestUser = async () => {
  try {
    log('Authentification de l\'utilisateur de test...')
    
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@fleetmada.com',
        password: 'testpassword123'
      })
    })

    if (!response.ok) {
      throw new Error(`Erreur d'authentification: ${response.status}`)
    }

    const data = await response.json()
    authToken = data.token
    
    log('Authentification réussie', { token: authToken.substring(0, 20) + '...' })
    return true
  } catch (error) {
    logError('Échec de l\'authentification', error)
    return false
  }
}

const makeAuthenticatedRequest = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`,
    ...options.headers
  }

  return fetch(`${API_BASE}${url}`, {
    ...options,
    headers
  })
}

// Tests des APIs Fuel Entries
const testFuelEntriesAPI = async () => {
  log('=== TESTS API FUEL ENTRIES ===')
  
  let testVehicleId = ''
  let createdEntryId = ''
  
  try {
    // 1. Test GET /api/fuel/entries - Liste vide initialement
    log('Test 1: GET /api/fuel/entries (liste vide)')
    let response = await makeAuthenticatedRequest('/api/fuel/entries')
    let data = await response.json()
    
    assert(response.ok, 'Réponse OK attendue')
    assert(Array.isArray(data.entries), 'entries doit être un tableau')
    log('Liste initiale récupérée', { count: data.entries.length })
    
    // 2. Test POST /api/fuel/entries - Créer une entrée
    log('Test 2: POST /api/fuel/entries (création)')
    
    // D'abord, récupérer un vehicleId valide
    const vehiclesResponse = await makeAuthenticatedRequest('/api/vehicles')
    const vehiclesData = await vehiclesResponse.json()
    
    if (vehiclesData.entries && vehiclesData.entries.length > 0) {
      testVehicleId = vehiclesData.entries[0].id
      log('Vehicle ID trouvé pour les tests', { vehicleId: testVehicleId })
    } else {
      log('Aucun véhicule trouvé pour les tests - création d\'un véhicule de test')
      // Créer un véhicule de test si nécessaire
      const createVehicleResponse = await makeAuthenticatedRequest('/api/vehicles', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Véhicule Test Fuel',
          vin: 'TESTFUEL001',
          type: 'Car',
          year: 2023,
          make: 'TestMake',
          model: 'TestModel'
        })
      })
      
      if (createVehicleResponse.ok) {
        const newVehicle = await createVehicleResponse.json()
        testVehicleId = newVehicle.id
        log('Véhicule de test créé', { vehicleId: testVehicleId })
      } else {
        throw new Error('Impossible de créer un véhicule de test')
      }
    }
    
    const fuelEntryData = {
      vehicleId: testVehicleId,
      date: new Date().toISOString(),
      vendor: 'Station Test',
      volume: 50.5,
      cost: 75.25,
      usage: 100,
      notes: 'Entrée de test créée automatiquement'
    }
    
    response = await makeAuthenticatedRequest('/api/fuel/entries', {
      method: 'POST',
      body: JSON.stringify(fuelEntryData)
    })
    
    assert(response.ok, 'Création réussie attendue')
    const createdEntry = await response.json()
    createdEntryId = createdEntry.id
    
    log('Entrée carburant créée', { id: createdEntryId, volume: createdEntry.volume, cost: createdEntry.cost })
    
    // 3. Test GET /api/fuel/entries - Liste avec entrée
    log('Test 3: GET /api/fuel/entries (liste avec données)')
    response = await makeAuthenticatedRequest('/api/fuel/entries')
    data = await response.json()
    
    assert(response.ok, 'Réponse OK attendue')
    assert(data.entries.length > 0, 'Au moins une entrée doit être présente')
    log('Liste mise à jour récupérée', { count: data.entries.length })
    
    // 4. Test GET /api/fuel/entries/[id] - Détails de l'entrée
    log('Test 4: GET /api/fuel/entries/[id] (détails)')
    response = await makeAuthenticatedRequest(`/api/fuel/entries/${createdEntryId}`)
    
    assert(response.ok, 'Détails récupération réussie')
    const entryDetails = await response.json()
    
    assert(entryDetails.id === createdEntryId, 'ID doit correspondre')
    assert(entryDetails.volume === fuelEntryData.volume, 'Volume doit correspondre')
    assert(entryDetails.cost === fuelEntryData.cost, 'Coût doit correspondre')
    
    log('Détails de l\'entrée récupérés', { id: entryDetails.id, volume: entryDetails.volume })
    
    // 5. Test PUT /api/fuel/entries/[id] - Modification
    log('Test 5: PUT /api/fuel/entries/[id] (modification)')
    const updateData = {
      ...fuelEntryData,
      volume: 55.0,
      cost: 82.50,
      notes: 'Entrée modifiée lors du test'
    }
    
    response = await makeAuthenticatedRequest(`/api/fuel/entries/${createdEntryId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    })
    
    assert(response.ok, 'Modification réussie')
    const updatedEntry = await response.json()
    
    assert(updatedEntry.volume === 55.0, 'Volume modifié doit être 55.0')
    assert(updatedEntry.cost === 82.50, 'Coût modifié doit être 82.50')
    
    log('Entrée modifiée avec succès', { volume: updatedEntry.volume, cost: updatedEntry.cost })
    
    // 6. Test GET /api/fuel/entries/stats - Statistiques
    log('Test 6: GET /api/fuel/entries/stats (statistiques)')
    response = await makeAuthenticatedRequest('/api/fuel/entries/stats?period=30d')
    
    assert(response.ok, 'Statistiques récupération réussie')
    const stats = await response.json()
    
    assert(typeof stats.totalCost === 'number', 'totalCost doit être un nombre')
    assert(typeof stats.totalVolume === 'number', 'totalVolume doit être un nombre')
    assert(stats.totalEntries >= 1, 'Au moins une entrée dans les stats')
    
    log('Statistiques récupérées', {
      totalCost: stats.totalCost,
      totalVolume: stats.totalVolume,
      totalEntries: stats.totalEntries
    })
    
    // 7. Test filtres
    log('Test 7: Filtres et pagination')
    response = await makeAuthenticatedRequest('/api/fuel/entries?vehicleId=' + testVehicleId + '&limit=10&page=1')
    data = await response.json()
    
    assert(response.ok, 'Filtres fonctionnent')
    assert(data.page === 1, 'Page doit être 1')
    assert(data.limit === 10, 'Limit doit être 10')
    
    log('Filtres et pagination testés', { page: data.page, limit: data.limit })
    
    // 8. Test DELETE /api/fuel/entries/[id] - Suppression
    log('Test 8: DELETE /api/fuel/entries/[id] (suppression)')
    response = await makeAuthenticatedRequest(`/api/fuel/entries/${createdEntryId}`, {
      method: 'DELETE'
    })
    
    assert(response.ok, 'Suppression réussie')
    
    // Vérifier que l'entrée n'existe plus
    response = await makeAuthenticatedRequest(`/api/fuel/entries/${createdEntryId}`)
    assert(response.status === 404, 'Entrée doit être supprimée (404)')
    
    log('Suppression testée avec succès')
    
    log('✅ TOUS LES TESTS FUEL ENTRIES RÉUSSIS')
    
  } catch (error) {
    logError('Échec des tests Fuel Entries', error)
    
    // Nettoyage : supprimer l'entrée de test si elle existe
    if (createdEntryId) {
      try {
        await makeAuthenticatedRequest(`/api/fuel/entries/${createdEntryId}`, {
          method: 'DELETE'
        })
      } catch (cleanupError) {
        logError('Erreur lors du nettoyage', cleanupError)
      }
    }
    
    throw error
  }
}

// Tests des APIs Charging Entries
const testChargingEntriesAPI = async () => {
  log('=== TESTS API CHARGING ENTRIES ===')
  
  let testVehicleId = ''
  let createdEntryId = ''
  
  try {
    // 1. Test GET /api/charging/entries - Liste vide initialement
    log('Test 1: GET /api/charging/entries (liste vide)')
    let response = await makeAuthenticatedRequest('/api/charging/entries')
    let data = await response.json()
    
    assert(response.ok, 'Réponse OK attendue')
    assert(Array.isArray(data.entries), 'entries doit être un tableau')
    log('Liste initiale récupérée', { count: data.entries.length })
    
    // 2. Test POST /api/charging/entries - Créer une entrée
    log('Test 2: POST /api/charging/entries (création)')
    
    // Récupérer un vehicleId valide (réutiliser celui de Fuel si disponible)
    if (!testVehicleId) {
      const vehiclesResponse = await makeAuthenticatedRequest('/api/vehicles')
      const vehiclesData = await vehiclesResponse.json()
      
      if (vehiclesData.entries && vehiclesData.entries.length > 0) {
        testVehicleId = vehiclesData.entries[0].id
      } else {
        throw new Error('Aucun véhicule disponible pour les tests de charging')
      }
    }
    
    const chargingEntryData = {
      vehicleId: testVehicleId,
      date: new Date().toISOString(),
      location: 'Superchargeur Test',
      energyKwh: 75.5,
      cost: 22.65,
      durationMin: 45
    }
    
    response = await makeAuthenticatedRequest('/api/charging/entries', {
      method: 'POST',
      body: JSON.stringify(chargingEntryData)
    })
    
    assert(response.ok, 'Création réussie attendue')
    const createdEntry = await response.json()
    createdEntryId = createdEntry.id
    
    log('Entrée de recharge créée', { id: createdEntryId, energyKwh: createdEntry.energyKwh, cost: createdEntry.cost })
    
    // 3. Test GET /api/charging/entries - Liste avec entrée
    log('Test 3: GET /api/charging/entries (liste avec données)')
    response = await makeAuthenticatedRequest('/api/charging/entries')
    data = await response.json()
    
    assert(response.ok, 'Réponse OK attendue')
    assert(data.entries.length > 0, 'Au moins une entrée doit être présente')
    log('Liste mise à jour récupérée', { count: data.entries.length })
    
    // 4. Test GET /api/charging/entries/[id] - Détails de l'entrée
    log('Test 4: GET /api/charging/entries/[id] (détails)')
    response = await makeAuthenticatedRequest(`/api/charging/entries/${createdEntryId}`)
    
    assert(response.ok, 'Détails récupération réussie')
    const entryDetails = await response.json()
    
    assert(entryDetails.id === createdEntryId, 'ID doit correspondre')
    assert(entryDetails.energyKwh === chargingEntryData.energyKwh, 'Énergie doit correspondre')
    assert(entryDetails.cost === chargingEntryData.cost, 'Coût doit correspondre')
    
    log('Détails de l\'entrée récupérés', { id: entryDetails.id, energyKwh: entryDetails.energyKwh })
    
    // 5. Test PUT /api/charging/entries/[id] - Modification
    log('Test 5: PUT /api/charging/entries/[id] (modification)')
    const updateData = {
      ...chargingEntryData,
      energyKwh: 80.0,
      cost: 24.00,
      durationMin: 50,
      location: 'Superchargeur Test Modifié'
    }
    
    response = await makeAuthenticatedRequest(`/api/charging/entries/${createdEntryId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    })
    
    assert(response.ok, 'Modification réussie')
    const updatedEntry = await response.json()
    
    assert(updatedEntry.energyKwh === 80.0, 'Énergie modifiée doit être 80.0')
    assert(updatedEntry.cost === 24.00, 'Coût modifié doit être 24.00')
    
    log('Entrée modifiée avec succès', { energyKwh: updatedEntry.energyKwh, cost: updatedEntry.cost })
    
    // 6. Test GET /api/charging/entries/stats - Statistiques
    log('Test 6: GET /api/charging/entries/stats (statistiques)')
    response = await makeAuthenticatedRequest('/api/charging/entries/stats?period=30d')
    
    assert(response.ok, 'Statistiques récupération réussie')
    const stats = await response.json()
    
    assert(typeof stats.totalCost === 'number', 'totalCost doit être un nombre')
    assert(typeof stats.totalEnergyKwh === 'number', 'totalEnergyKwh doit être un nombre')
    assert(stats.totalEntries >= 1, 'Au moins une entrée dans les stats')
    
    log('Statistiques récupérées', {
      totalCost: stats.totalCost,
      totalEnergyKwh: stats.totalEnergyKwh,
      totalEntries: stats.totalEntries
    })
    
    // 7. Test DELETE /api/charging/entries/[id] - Suppression
    log('Test 7: DELETE /api/charging/entries/[id] (suppression)')
    response = await makeAuthenticatedRequest(`/api/charging/entries/${createdEntryId}`, {
      method: 'DELETE'
    })
    
    assert(response.ok, 'Suppression réussie')
    
    // Vérifier que l'entrée n'existe plus
    response = await makeAuthenticatedRequest(`/api/charging/entries/${createdEntryId}`)
    assert(response.status === 404, 'Entrée doit être supprimée (404)')
    
    log('Suppression testée avec succès')
    
    log('✅ TOUS LES TESTS CHARGING ENTRIES RÉUSSIS')
    
  } catch (error) {
    logError('Échec des tests Charging Entries', error)
    
    // Nettoyage : supprimer l'entrée de test si elle existe
    if (createdEntryId) {
      try {
        await makeAuthenticatedRequest(`/api/charging/entries/${createdEntryId}`, {
          method: 'DELETE'
        })
      } catch (cleanupError) {
        logError('Erreur lors du nettoyage', cleanupError)
      }
    }
    
    throw error
  }
}

// Test des fonctionnalités avancées
const testAdvancedFeatures = async () => {
  log('=== TESTS FONCTIONNALITÉS AVANCÉES ===')
  
  try {
    // Test des filtres avancés Fuel
    log('Test 1: Filtres avancés Fuel')
    let response = await makeAuthenticatedRequest('/api/fuel/entries?search=test&vendor=Chevron&minCost=10&maxCost=100')
    let data = await response.json()
    
    assert(response.ok, 'Filtres avancés Fuel doivent fonctionner')
    log('Filtres avancés Fuel testés', { filteredCount: data.entries.length })
    
    // Test des filtres avancés Charging
    log('Test 2: Filtres avancés Charging')
    response = await makeAuthenticatedRequest('/api/charging/entries?location=Super&minCost=5&maxCost=50')
    data = await response.json()
    
    assert(response.ok, 'Filtres avancés Charging doivent fonctionner')
    log('Filtres avancés Charging testés', { filteredCount: data.entries.length })
    
    // Test des statistiques par période
    log('Test 3: Statistiques par période')
    const periods = ['7d', '30d', '90d', '1y']
    
    for (const period of periods) {
      response = await makeAuthenticatedRequest(`/api/fuel/entries/stats?period=${period}`)
      assert(response.ok, `Statistiques période ${period} doivent fonctionner`)
      
      const stats = await response.json()
      assert(stats.period === period, `Période doit être ${period}`)
      log(`Statistiques période ${period} testées`, { period: stats.period })
    }
    
    // Test tri et pagination
    log('Test 4: Tri et pagination')
    response = await makeAuthenticatedRequest('/api/fuel/entries?sortBy=cost&sortOrder=desc&limit=5&page=1')
    data = await response.json()
    
    assert(response.ok, 'Tri et pagination doivent fonctionner')
    assert(data.limit === 5, 'Limit doit être 5')
    assert(data.page === 1, 'Page doit être 1')
    
    log('Tri et pagination testés', { page: data.page, limit: data.limit })
    
    log('✅ TOUS LES TESTS FONCTIONNALITÉS AVANCÉES RÉUSSIS')
    
  } catch (error) {
    logError('Échec des tests fonctionnalités avancées', error)
    throw error
  }
}

// Fonction principale de test
const runAllTests = async () => {
  console.log('🚀 DÉBUT DES TESTS DES APIs FUEL ET CHARGING')
  console.log('==================================================')
  
  try {
    // Authentification
    const authenticated = await authenticateTestUser()
    if (!authenticated) {
      throw new Error('Impossible de s\'authentifier - arrêt des tests')
    }
    
    // Tests Fuel Entries
    await testFuelEntriesAPI()
    
    // Tests Charging Entries
    await testChargingEntriesAPI()
    
    // Tests fonctionnalités avancées
    await testAdvancedFeatures()
    
    console.log('\n🎉 TOUS LES TESTS ONT RÉUSSI!')
    console.log('==================================================')
    console.log('✅ APIs Fuel Entries: Fonctionnelles')
    console.log('✅ APIs Charging Entries: Fonctionnelles')
    console.log('✅ Fonctionnalités avancées: Fonctionnelles')
    console.log('✅ CRUD Operations: Fonctionnelles')
    console.log('✅ Statistiques: Fonctionnelles')
    console.log('✅ Filtres et Pagination: Fonctionnelles')
    
  } catch (error) {
    console.log('\n❌ ÉCHEC DES TESTS')
    console.log('==================================================')
    logError('Erreur lors de l\'exécution des tests', error)
    process.exit(1)
  }
}

// Vérification des variables d'environnement
const checkEnvironment = () => {
  console.log('🔧 VÉRIFICATION DE L\'ENVIRONNEMENT')
  console.log('=====================================')
  
  if (!process.env.DATABASE_URL) {
    console.log('⚠️  DATABASE_URL non définie dans les variables d\'environnement')
  } else {
    console.log('✅ DATABASE_URL configurée')
  }
  
  if (!process.env.JWT_SECRET) {
    console.log('⚠️  JWT_SECRET non définie dans les variables d\'environnement')
  } else {
    console.log('✅ JWT_SECRET configurée')
  }
  
  console.log(`🌐 API_BASE: ${API_BASE}`)
  console.log('=====================================\n')
}

// Point d'entrée
if (require.main === module) {
  checkEnvironment()
  runAllTests()
}

module.exports = {
  runAllTests,
  testFuelEntriesAPI,
  testChargingEntriesAPI,
  testAdvancedFeatures
}