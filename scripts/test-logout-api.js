/**
 * Script de test pour l'API de déconnexion FleetMada
 * Ce script teste tous les cas d'usage de l'endpoint POST /api/auth/logout
 */

const API_BASE_URL = 'http://localhost:3000'

// Configuration des couleurs pour la console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

// Fonction utilitaire pour afficher les logs colorés
const log = (color, message) => {
  console.log(`${color}${message}${colors.reset}`)
}

const logTest = (message) => log(colors.blue, `🧪 ${message}`)
const logSuccess = (message) => log(colors.green, `✅ ${message}`)
const logError = (message) => log(colors.red, `❌ ${message}`)
const logWarning = (message) => log(colors.yellow, `⚠️  ${message}`)

// Fonction pour faire une requête HTTP
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })
    
    const data = await response.json()
    return { status: response.status, data, headers: response.headers }
  } catch (error) {
    return { 
      status: 0, 
      data: { error: 'Erreur de connexion', details: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }
}

// Test 1: Déconnexion sans token (devrait échouer avec 401)
async function testLogoutWithoutToken() {
  logTest('Test 1: Déconnexion sans token')
  
  const result = await makeRequest(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST'
  })
  
  if (result.status === 401 && !result.data.success) {
    logSuccess('✅ Rejet correct pour token manquant')
    return true
  } else {
    logError(`❌ Code de statut attendu: 401, reçu: ${result.status}`)
    logError(`Réponse: ${JSON.stringify(result.data)}`)
    return false
  }
}

// Test 2: Déconnexion avec token invalide
async function testLogoutWithInvalidToken() {
  logTest('Test 2: Déconnexion avec token invalide')
  
  const result = await makeRequest(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer invalid_token_here'
    }
  })
  
  if (result.status === 401 && !result.data.success) {
    logSuccess('✅ Rejet correct pour token invalide')
    return true
  } else {
    logError(`❌ Code de statut attendu: 401, reçu: ${result.status}`)
    logError(`Réponse: ${JSON.stringify(result.data)}`)
    return false
  }
}

// Test 3: Déconnexion avec format d'header incorrect
async function testLogoutWithInvalidHeaderFormat() {
  logTest('Test 3: Déconnexion avec format d\'header incorrect')
  
  const result = await makeRequest(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: {
      'Authorization': 'InvalidFormat token'
    }
  })
  
  if (result.status === 401 && !result.data.success) {
    logSuccess('✅ Rejet correct pour format d\'header invalide')
    return true
  } else {
    logError(`❌ Code de statut attendu: 401, reçu: ${result.status}`)
    logError(`Réponse: ${JSON.stringify(result.data)}`)
    return false
  }
}

// Test 4: Méthode non autorisée (GET)
async function testLogoutWithGetMethod() {
  logTest('Test 4: Méthode GET non autorisée')
  
  const result = await makeRequest(`${API_BASE_URL}/api/auth/logout`, {
    method: 'GET'
  })
  
  if (result.status === 405) {
    logSuccess('✅ Rejet correct pour méthode GET')
    return true
  } else {
    logError(`❌ Code de statut attendu: 405, reçu: ${result.status}`)
    logError(`Réponse: ${JSON.stringify(result.data)}`)
    return false
  }
}

// Test 5: Authentification et déconnexion complète
async function testCompleteLogoutFlow() {
  logTest('Test 5: Flux complet d\'authentification et déconnexion')
  
  try {
    // Étape 1: Créer un utilisateur
    const userData = {
      name: 'Test User Logout',
      email: 'test-logout@example.com',
      password: 'TestPassword123!',
      companyName: 'Test Company Logout'
    }
    
    log('   📝 Création d\'un utilisateur de test...')
    const registerResult = await makeRequest(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      body: JSON.stringify(userData)
    })
    
    if (registerResult.status !== 201) {
      logError(`❌ Échec de l'inscription: ${registerResult.status}`)
      logError(`Réponse: ${JSON.stringify(registerResult.data)}`)
      return false
    }
    
    logSuccess('✅ Utilisateur créé avec succès')
    
    // Étape 2: Se connecter pour obtenir un token
    log('   🔐 Connexion pour obtenir un token...')
    const loginResult = await makeRequest(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email,
        password: userData.password
      })
    })
    
    if (loginResult.status !== 200 || !loginResult.data.success || !loginResult.data.token) {
      logError(`❌ Échec de la connexion: ${loginResult.status}`)
      logError(`Réponse: ${JSON.stringify(loginResult.data)}`)
      return false
    }
    
    const token = loginResult.data.token
    logSuccess('✅ Token JWT obtenu')
    
    // Étape 3: Se déconnecter avec le token
    log('   🚪 Tentative de déconnexion...')
    const logoutResult = await makeRequest(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (logoutResult.status === 200 && logoutResult.data.success) {
      logSuccess('✅ Déconnexion réussie')
      return true
    } else {
      logError(`❌ Échec de la déconnexion: ${logoutResult.status}`)
      logError(`Réponse: ${JSON.stringify(logoutResult.data)}`)
      return false
    }
    
  } catch (error) {
    logError(`❌ Erreur lors du test complet: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    return false
  }
}

// Test 6: Tentative de réutilisation d'un token déjà blacklisté
async function testReuseBlacklistedToken() {
  logTest('Test 6: Tentative de réutilisation d\'un token blacklisté')
  
  try {
    // Créer un utilisateur
    const userData = {
      name: 'Test User Blacklist',
      email: 'test-blacklist@example.com',
      password: 'TestPassword123!',
      companyName: 'Test Company Blacklist'
    }
    
    // Inscription
    await makeRequest(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      body: JSON.stringify(userData)
    })
    
    // Connexion
    const loginResult = await makeRequest(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email,
        password: userData.password
      })
    })
    
    if (!loginResult.data.token) {
      logError('❌ Impossible d\'obtenir un token')
      return false
    }
    
    const token = loginResult.data.token
    
    // Première déconnexion
    await makeRequest(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    log('   🔒 Première déconnexion réussie, tentative de réutilisation du token...')
    
    // Deuxième déconnexion avec le même token (devrait être acceptée)
    const secondLogoutResult = await makeRequest(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (secondLogoutResult.status === 200 && secondLogoutResult.data.success) {
      logSuccess('✅ Déconnexion acceptée même si token déjà blacklisté')
      return true
    } else {
      logError(`❌ Déconnexion échouée: ${secondLogoutResult.status}`)
      logError(`Réponse: ${JSON.stringify(secondLogoutResult.data)}`)
      return false
    }
    
  } catch (error) {
    logError(`❌ Erreur lors du test de blacklist: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    return false
  }
}

// Fonction principale de test
async function runTests() {
  console.log(`${colors.bold}${colors.blue}
🧪 TESTS DE L'API DE DÉCONNEXION FLEETMADA
${colors.reset}`)
  
  const tests = [
    { name: 'Déconnexion sans token', fn: testLogoutWithoutToken },
    { name: 'Déconnexion avec token invalide', fn: testLogoutWithInvalidToken },
    { name: 'Format d\'header incorrect', fn: testLogoutWithInvalidHeaderFormat },
    { name: 'Méthode non autorisée', fn: testLogoutWithGetMethod },
    { name: 'Flux complet', fn: testCompleteLogoutFlow },
    { name: 'Token blacklisté', fn: testReuseBlacklistedToken }
  ]
  
  let passedTests = 0
  let totalTests = tests.length
  
  for (const test of tests) {
    try {
      const result = await test.fn()
      if (result) {
        passedTests++
      }
      console.log() // Ligne vide entre les tests
    } catch (error) {
      logError(`Erreur inattendue lors du test "${test.name}": ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
      console.log()
    }
  }
  
  // Résumé final
  console.log(`${colors.bold}📊 RÉSUMÉ DES TESTS${colors.reset}`)
  console.log(`Tests réussis: ${colors.green}${passedTests}/${totalTests}${colors.reset}`)
  console.log(`Tests échoués: ${colors.red}${totalTests - passedTests}/${totalTests}${colors.reset}`)
  
  if (passedTests === totalTests) {
    logSuccess('🎉 Tous les tests ont réussi ! L\'API de déconnexion fonctionne correctement.')
  } else {
    logWarning(`⚠️  ${totalTests - passedTests} test(s) ont échoué. Vérifiez les logs ci-dessus.`)
  }
  
  process.exit(passedTests === totalTests ? 0 : 1)
}

// Vérification que le serveur est démarré
async function checkServerHealth() {
  log('🔍 Vérification de la santé du serveur...')
  
  const result = await makeRequest(API_BASE_URL)
  if (result.status === 200 || result.status === 404) {
    logSuccess('✅ Serveur accessible')
    return true
  } else {
    logError(`❌ Serveur inaccessible (status: ${result.status})`)
    return false
  }
}

// Attendre que le serveur soit prêt
async function waitForServer(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    if (await checkServerHealth()) {
      return true
    }
    if (i < maxAttempts - 1) {
      logWarning(`⏳ Tentative ${i + 1}/${maxAttempts}, attente de 2 secondes...`)
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  return false
}

// Point d'entrée principal
if (require.main === module) {
  waitForServer().then(ready => {
    if (ready) {
      runTests()
    } else {
      logError('❌ Impossible de démarrer les tests - serveur non accessible')
      process.exit(1)
    }
  })
}

module.exports = { runTests, waitForServer }