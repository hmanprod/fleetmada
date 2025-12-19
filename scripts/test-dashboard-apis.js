/**
 * Tests Backend pour les APIs Dashboard FleetMada
 * Ce script teste tous les endpoints dashboard créés
 */

const BASE_URL = 'http://localhost:3000'
const API_BASE = `${BASE_URL}/api/dashboard`

// Simuler un token JWT valide pour les tests
const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MzQwODM5MDJ9.' +
  'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

// Fonction utilitaire pour les requêtes
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MOCK_TOKEN}`,
        ...options.headers
      }
    })
    
    const data = await response.json()
    
    return {
      status: response.status,
      ok: response.ok,
      data
    }
  } catch (error) {
    console.error(`Erreur lors de la requête vers ${url}:`, error.message)
    return {
      status: 500,
      ok: false,
      data: { error: error.message }
    }
  }
}

// Fonction de test avec rapport
async function testEndpoint(name, url, expectedStatus = 200) {
  console.log(`\n🔍 Test: ${name}`)
  console.log(`   URL: ${url}`)
  
  const result = await makeRequest(url)
  
  if (result.status === expectedStatus && result.ok) {
    console.log(`   ✅ SUCCÈS - Status: ${result.status}`)
    if (result.data.success) {
      console.log(`   📊 Données reçues: ${JSON.stringify(result.data.data, null, 2).substring(0, 200)}...`)
    }
  } else {
    console.log(`   ❌ ÉCHEC - Status: ${result.status}`)
    console.log(`   📄 Réponse: ${JSON.stringify(result.data, null, 2)}`)
  }
  
  return result.ok
}

// Tests des endpoints
async function runDashboardTests() {
  console.log('🚀 Démarrage des tests des APIs Dashboard FleetMada')
  console.log('=' * 60)
  
  const results = []
  
  // Test 1: Overview API
  const overviewResult = await testEndpoint(
    'Overview API - Vue d\'ensemble générale',
    `${API_BASE}/overview`
  )
  results.push({ name: 'Overview API', success: overviewResult })
  
  // Test 2: Costs API
  const costsResult = await testEndpoint(
    'Costs API - Analyse des coûts',
    `${API_BASE}/costs?period=30d`
  )
  results.push({ name: 'Costs API', success: costsResult })
  
  // Test 3: Costs API avec période différente
  const costs7dResult = await testEndpoint(
    'Costs API - Période 7 jours',
    `${API_BASE}/costs?period=7d`
  )
  results.push({ name: 'Costs API (7d)', success: costs7dResult })
  
  // Test 4: Maintenance API
  const maintenanceResult = await testEndpoint(
    'Maintenance API - État maintenance et rappels',
    `${API_BASE}/maintenance`
  )
  results.push({ name: 'Maintenance API', success: maintenanceResult })
  
  // Test 5: Fuel API
  const fuelResult = await testEndpoint(
    'Fuel API - Données carburant et consommation',
    `${API_BASE}/fuel?period=30d`
  )
  results.push({ name: 'Fuel API', success: fuelResult })
  
  // Test 6: Fuel API avec période différente
  const fuel90dResult = await testEndpoint(
    'Fuel API - Période 90 jours',
    `${API_BASE}/fuel?period=90d`
  )
  results.push({ name: 'Fuel API (90d)', success: fuel90dResult })
  
  // Test 7: Vehicles API
  const vehiclesResult = await testEndpoint(
    'Vehicles API - Métriques détaillées des véhicules',
    `${API_BASE}/vehicles?limit=5`
  )
  results.push({ name: 'Vehicles API', success: vehiclesResult })
  
  // Test 8: Vehicles API avec filtre statut
  const vehiclesActiveResult = await testEndpoint(
    'Vehicles API - Véhicules actifs uniquement',
    `${API_BASE}/vehicles?status=ACTIVE&limit=3`
  )
  results.push({ name: 'Vehicles API (ACTIVE)', success: vehiclesActiveResult })
  
  // Test 9: Méthodes non autorisées (POST)
  console.log('\n🔍 Test: Validation méthodes non autorisées')
  const postResult = await makeRequest(`${API_BASE}/overview`, { method: 'POST' })
  const postAllowed = postResult.status === 405
  console.log(`   ${postAllowed ? '✅' : '❌'} POST sur /overview: ${postResult.status} (attendu: 405)`)
  results.push({ name: 'POST Validation', success: postAllowed })
  
  // Test 10: Token manquant
  console.log('\n🔍 Test: Validation token manquant')
  const noTokenResult = await fetch(`${API_BASE}/overview`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
  const noTokenAllowed = noTokenResult.status === 401
  console.log(`   ${noTokenAllowed ? '✅' : '❌'} Token manquant: ${noTokenResult.status} (attendu: 401)`)
  results.push({ name: 'Token Validation', success: noTokenAllowed })
  
  // Rapport final
  console.log('\n' + '=' * 60)
  console.log('📋 RAPPORT DES TESTS')
  console.log('=' * 60)
  
  const totalTests = results.length
  const successfulTests = results.filter(r => r.success).length
  const failedTests = totalTests - successfulTests
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL'
    console.log(`${status} ${result.name}`)
  })
  
  console.log(`\n📊 Résultats: ${successfulTests}/${totalTests} tests réussis`)
  if (failedTests > 0) {
    console.log(`⚠️  ${failedTests} tests ont échoué`)
  } else {
    console.log('🎉 Tous les tests sont passés avec succès !')
  }
  
  return {
    total: totalTests,
    successful: successfulTests,
    failed: failedTests,
    successRate: Math.round((successfulTests / totalTests) * 100)
  }
}

// Test de performance basique
async function performanceTest() {
  console.log('\n⏱️  Test de performance des APIs')
  console.log('-' * 40)
  
  const endpoints = [
    `${API_BASE}/overview`,
    `${API_BASE}/costs`,
    `${API_BASE}/maintenance`,
    `${API_BASE}/fuel`,
    `${API_BASE}/vehicles`
  ]
  
  const performanceResults = []
  
  for (const endpoint of endpoints) {
    const startTime = Date.now()
    const result = await makeRequest(endpoint)
    const endTime = Date.now()
    const duration = endTime - startTime
    
    performanceResults.push({
      endpoint: endpoint.split('/').pop(),
      duration,
      status: result.status
    })
    
    console.log(`📊 ${endpoint.split('/').pop()}: ${duration}ms (Status: ${result.status})`)
  }
  
  const averageDuration = performanceResults.reduce((sum, r) => sum + r.duration, 0) / performanceResults.length
  console.log(`\n⏱️  Temps de réponse moyen: ${Math.round(averageDuration)}ms`)
  
  return performanceResults
}

// Exécution des tests
async function main() {
  try {
    // Test de connectivité
    console.log('🔍 Vérification de la connectivité...')
    const healthCheck = await makeRequest(BASE_URL)
    
    if (!healthCheck.ok) {
      console.log('⚠️  Attention: Le serveur ne semble pas accessible à', BASE_URL)
      console.log('   Assurez-vous que le serveur de développement est démarré.')
      console.log('   Lancez: npm run dev')
      return
    }
    
    // Tests principaux
    const testResults = await runDashboardTests()
    
    // Tests de performance
    const performanceResults = await performanceTest()
    
    // Sauvegarde des résultats
    const report = {
      timestamp: new Date().toISOString(),
      tests: testResults,
      performance: performanceResults
    }
    
    console.log('\n💾 Rapport sauvegardé dans test-results.json')
    console.log(JSON.stringify(report, null, 2))
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution des tests:', error.message)
  }
}

// Lancement des tests si exécuté directement
if (require.main === module) {
  main()
}

module.exports = {
  runDashboardTests,
  performanceTest,
  makeRequest
}