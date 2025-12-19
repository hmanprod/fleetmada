/**
 * Script de test pour les APIs Reports FleetMada
 * Teste toutes les fonctionnalités : CRUD, génération, export, favoris, partage
 */

const API_BASE_URL = 'http://localhost:3000/api'

// Configuration des tests
const TEST_CONFIG = {
  // Token d'authentification (à remplacer par un vrai token valide)
  authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJ0eXBlIjoibG9naW4iLCJpYXQiOjE3MzQwNzQ2MDAsImV4cCI6MTc0OTY1MDYwMH0.test-signature',
  
  // Données de test pour les rapports
  testReport: {
    title: 'Test Vehicle Cost Report',
    description: 'Rapport de test pour les coûts véhicule',
    category: 'Vehicles',
    template: 'vehicle-cost-comparison',
    config: {
      dateRange: {
        start: '2024-01-01',
        end: '2024-12-31'
      },
      filters: {},
      includeCharts: true,
      includeSummary: true
    }
  },

  // Configuration de test pour génération de rapport
  generateConfig: {
    template: 'vehicle-cost-comparison',
    config: {
      dateRange: {
        start: '2024-01-01',
        end: '2024-12-31'
      },
      filters: {},
      includeCharts: true,
      includeSummary: true
    },
    save: false
  }
}

// Fonction utilitaire pour les requêtes API
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TEST_CONFIG.authToken}`,
    ...options.headers
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    })

    const data = await response.json()
    
    return {
      success: response.ok,
      status: response.status,
      data
    }
  } catch (error) {
    console.error(`❌ API Request Error for ${endpoint}:`, error.message)
    return {
      success: false,
      status: 0,
      data: { error: error.message }
    }
  }
}

// Fonction de logging des tests
function logTest(testName, success, message = '') {
  const status = success ? '✅ PASS' : '❌ FAIL'
  console.log(`${status} ${testName}${message ? ': ' + message : ''}`)
}

// Suite de tests pour les APIs Reports
async function runReportsTests() {
  console.log('\n🚀 Démarrage des tests des APIs Reports...\n')

  let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
  }

  // === TEST 1: GET /api/reports (Liste des rapports) ===
  console.log('📋 Test 1: Récupération de la liste des rapports')
  testResults.total++
  
  const listResponse = await apiRequest('/reports')
  if (listResponse.success && listResponse.data.success) {
    testResults.passed++
    logTest('GET /api/reports', true, `Trouvé ${listResponse.data.data.reports.length} rapports`)
  } else {
    testResults.failed++
    logTest('GET /api/reports', false, listResponse.data.error || 'Erreur inconnue')
    testResults.errors.push({ test: 'GET /api/reports', error: listResponse.data.error })
  }

  // === TEST 2: POST /api/reports (Création d'un rapport) ===
  console.log('\n📋 Test 2: Création d\'un nouveau rapport')
  testResults.total++
  
  const createResponse = await apiRequest('/reports', {
    method: 'POST',
    body: JSON.stringify(TEST_CONFIG.testReport)
  })

  let createdReportId = null
  if (createResponse.success && createResponse.data.success) {
    testResults.passed++
    createdReportId = createResponse.data.data.report.id
    logTest('POST /api/reports', true, `Rapport créé avec ID: ${createdReportId}`)
  } else {
    testResults.failed++
    logTest('POST /api/reports', false, createResponse.data.error || 'Erreur inconnue')
    testResults.errors.push({ test: 'POST /api/reports', error: createResponse.data.error })
  }

  // === TEST 3: GET /api/reports/generate (Templates disponibles) ===
  console.log('\n📋 Test 3: Récupération des templates de rapports')
  testResults.total++
  
  const templatesResponse = await apiRequest('/reports/generate')
  if (templatesResponse.success && templatesResponse.data.success) {
    testResults.passed++
    const templateCount = Object.values(templatesResponse.data.data.templates)
      .reduce((total, templates) => total + templates.length, 0)
    logTest('GET /api/reports/generate', true, `${templateCount} templates disponibles`)
  } else {
    testResults.failed++
    logTest('GET /api/reports/generate', false, templatesResponse.data.error || 'Erreur inconnue')
    testResults.errors.push({ test: 'GET /api/reports/generate', error: templatesResponse.data.error })
  }

  // === TEST 4: POST /api/reports/generate (Génération d'un rapport) ===
  console.log('\n📋 Test 4: Génération d\'un rapport')
  testResults.total++
  
  const generateResponse = await apiRequest('/reports/generate', {
    method: 'POST',
    body: JSON.stringify(TEST_CONFIG.generateConfig)
  })

  if (generateResponse.success && generateResponse.data.success) {
    testResults.passed++
    logTest('POST /api/reports/generate', true, `Rapport généré avec ${generateResponse.data.data.reportData.metadata.totalRecords} enregistrements`)
  } else {
    testResults.failed++
    logTest('POST /api/reports/generate', false, generateResponse.data.error || 'Erreur inconnue')
    testResults.errors.push({ test: 'POST /api/reports/generate', error: generateResponse.data.error })
  }

  // === TEST 5: POST /api/reports/generate avec sauvegarde ===
  console.log('\n📋 Test 5: Génération et sauvegarde d\'un rapport')
  testResults.total++
  
  const saveConfig = {
    ...TEST_CONFIG.generateConfig,
    save: true,
    title: 'Test Saved Report',
    description: 'Rapport généré et sauvegardé pour les tests'
  }

  const saveResponse = await apiRequest('/reports/generate', {
    method: 'POST',
    body: JSON.stringify(saveConfig)
  })

  if (saveResponse.success && saveResponse.data.success && saveResponse.data.data.savedReport) {
    testResults.passed++
    logTest('POST /api/reports/generate (save)', true, `Rapport sauvegardé avec ID: ${saveResponse.data.data.savedReport.id}`)
    createdReportId = saveResponse.data.data.savedReport.id // Utiliser ce rapport pour les tests suivants
  } else {
    testResults.failed++
    logTest('POST /api/reports/generate (save)', false, saveResponse.data.error || 'Erreur inconnue')
    testResults.errors.push({ test: 'POST /api/reports/generate (save)', error: saveResponse.data.error })
  }

  // === TEST 6: GET /api/reports/[id]/share (Partages d'un rapport) ===
  if (createdReportId) {
    console.log('\n📋 Test 6: Récupération des partages d\'un rapport')
    testResults.total++
    
    const sharesResponse = await apiRequest(`/reports/${createdReportId}/share`)
    if (sharesResponse.success && sharesResponse.data.success) {
      testResults.passed++
      logTest('GET /api/reports/[id]/share', true, `${sharesResponse.data.data.shares.length} partages trouvés`)
    } else {
      testResults.failed++
      logTest('GET /api/reports/[id]/share', false, sharesResponse.data.error || 'Erreur inconnue')
      testResults.errors.push({ test: 'GET /api/reports/[id]/share', error: sharesResponse.data.error })
    }
  }

  // === TEST 7: POST /api/reports/[id]/favorite (Toggle favori) ===
  if (createdReportId) {
    console.log('\n📋 Test 7: Bascule de l\'état favori')
    testResults.total++
    
    const favoriteResponse = await apiRequest(`/reports/${createdReportId}/favorite`, {
      method: 'POST'
    })

    if (favoriteResponse.success && favoriteResponse.data.success) {
      testResults.passed++
      logTest('POST /api/reports/[id]/favorite', true, `Favori: ${favoriteResponse.data.data.isFavorite}`)
    } else {
      testResults.failed++
      logTest('POST /api/reports/[id]/favorite', false, favoriteResponse.data.error || 'Erreur inconnue')
      testResults.errors.push({ test: 'POST /api/reports/[id]/favorite', error: favoriteResponse.data.error })
    }
  }

  // === TEST 8: GET /api/reports/[id]/export/csv (Export CSV) ===
  if (createdReportId) {
    console.log('\n📋 Test 8: Export CSV d\'un rapport')
    testResults.total++
    
    const csvResponse = await apiRequest(`/reports/${createdReportId}/export/csv`, {
      method: 'GET'
    })

    if (csvResponse.success && csvResponse.data) {
      testResults.passed++
      logTest('GET /api/reports/[id]/export/csv', true, 'Fichier CSV généré')
    } else {
      testResults.failed++
      logTest('GET /api/reports/[id]/export/csv', false, csvResponse.data.error || 'Erreur inconnue')
      testResults.errors.push({ test: 'GET /api/reports/[id]/export/csv', error: csvResponse.data.error })
    }
  }

  // === TEST 9: Test de pagination ===
  console.log('\n📋 Test 9: Test de pagination des rapports')
  testResults.total++
  
  const paginatedResponse = await apiRequest('/reports?page=1&limit=5')
  if (paginatedResponse.success && paginatedResponse.data.success) {
    const pagination = paginatedResponse.data.data.pagination
    if (pagination && pagination.totalPages >= 1) {
      testResults.passed++
      logTest('GET /api/reports (pagination)', true, `Page ${pagination.page}/${pagination.totalPages}`)
    } else {
      testResults.failed++
      logTest('GET /api/reports (pagination)', false, 'Structure de pagination invalide')
      testResults.errors.push({ test: 'GET /api/reports (pagination)', error: 'Structure de pagination invalide' })
    }
  } else {
    testResults.failed++
    logTest('GET /api/reports (pagination)', false, paginatedResponse.data.error || 'Erreur inconnue')
    testResults.errors.push({ test: 'GET /api/reports (pagination)', error: paginatedResponse.data.error })
  }

  // === TEST 10: Test de filtrage ===
  console.log('\n📋 Test 10: Test de filtrage des rapports')
  testResults.total++
  
  const filteredResponse = await apiRequest('/reports?category=Vehicles&favorites=true')
  if (filteredResponse.success && filteredResponse.data.success) {
    testResults.passed++
    logTest('GET /api/reports (filters)', true, `${filteredResponse.data.data.reports.length} rapports filtrés`)
  } else {
    testResults.failed++
    logTest('GET /api/reports (filters)', false, filteredResponse.data.error || 'Erreur inconnue')
    testResults.errors.push({ test: 'GET /api/reports (filters)', error: filteredResponse.data.error })
  }

  // === RÉSUMÉ DES TESTS ===
  console.log('\n' + '='.repeat(50))
  console.log('📊 RÉSUMÉ DES TESTS')
  console.log('='.repeat(50))
  console.log(`✅ Tests réussis: ${testResults.passed}`)
  console.log(`❌ Tests échoués: ${testResults.failed}`)
  console.log(`📈 Total des tests: ${testResults.total}`)
  console.log(`📊 Taux de réussite: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`)

  if (testResults.errors.length > 0) {
    console.log('\n❌ ERREURS DÉTAILLÉES:')
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.test}: ${error.error}`)
    })
  }

  console.log('\n🏁 Tests terminés!')
  return testResults
}

// Fonction pour tester la génération de différents templates
async function testReportTemplates() {
  console.log('\n🔬 Test de génération pour différents templates...\n')

  const templates = [
    'vehicle-summary',
    'fuel-summary',
    'service-entries-summary',
    'issues-list'
  ]

  for (const template of templates) {
    console.log(`📊 Test template: ${template}`)
    
    const config = {
      template: template,
      config: {
        dateRange: {
          start: '2024-01-01',
          end: '2024-12-31'
        },
        filters: {},
        includeCharts: true,
        includeSummary: true
      }
    }

    const response = await apiRequest('/reports/generate', {
      method: 'POST',
      body: JSON.stringify(config)
    })

    if (response.success && response.data.success) {
      console.log(`✅ ${template}: Génération réussie`)
    } else {
      console.log(`❌ ${template}: ${response.data.error || 'Erreur inconnue'}`)
    }
  }
}

// Fonction pour tester les limites de taux (rate limiting)
async function testRateLimiting() {
  console.log('\n⚡ Test de limitation de taux...\n')

  console.log('📊 Envoi de 10 requêtes rapides...')
  
  const promises = []
  for (let i = 0; i < 10; i++) {
    promises.push(apiRequest('/reports'))
  }

  const results = await Promise.all(promises)
  const successCount = results.filter(r => r.success).length
  
  console.log(`✅ Requêtes réussies: ${successCount}/10`)
  
  if (successCount === 10) {
    console.log('✅ Aucune limitation de taux détectée')
  } else {
    console.log('⚠️ Limitation de taux possible')
  }
}

// Fonction principale d'exécution
async function main() {
  try {
    console.log('🧪 FleetMada Reports API Test Suite')
    console.log('=====================================\n')

    // Test de connectivité
    console.log('🔗 Test de connectivité à l\'API...')
    const healthCheck = await apiRequest('/reports?limit=1')
    
    if (!healthCheck.success) {
      console.log('❌ Impossible de se connecter à l\'API. Vérifiez que:')
      console.log('   1. Le serveur Next.js est en cours d\'exécution')
      console.log('   2. L\'URL de base est correcte')
      console.log('   3. Le token d\'authentification est valide')
      console.log('\n❌ Tests interrompus.')
      return
    }

    console.log('✅ Connectivité OK\n')

    // Exécution des tests
    const results = await runReportsTests()
    
    // Tests supplémentaires
    await testReportTemplates()
    await testRateLimiting()

    // Code de sortie
    const exitCode = results.failed === 0 ? 0 : 1
    process.exit(exitCode)

  } catch (error) {
    console.error('💥 Erreur fatale lors des tests:', error.message)
    process.exit(1)
  }
}

// Exécution si appelé directement
if (require.main === module) {
  main()
}

module.exports = {
  runReportsTests,
  testReportTemplates,
  testRateLimiting,
  apiRequest
}