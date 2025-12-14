#!/usr/bin/env node

/**
 * Script de test pour l'API User Profile CRUD
 * Teste tous les endpoints: GET, PUT, DELETE
 */

const BASE_URL = 'http://localhost:3000'
const API_BASE = `${BASE_URL}/api`

// Configuration des couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

// Fonction pour afficher les logs avec couleurs
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

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
    
    return {
      status: response.status,
      ok: response.ok,
      data
    }
  } catch (error) {
    log(`❌ Erreur réseau: ${error.message}`, 'red')
    return {
      status: 0,
      ok: false,
      data: { error: error.message }
    }
  }
}

// Fonction pour attendre
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Fonction de test
async function runTest(testName, testFunction) {
  log(`\n🧪 Test: ${testName}`, 'cyan')
  try {
    await testFunction()
    log(`✅ ${testName} - RÉUSSI`, 'green')
  } catch (error) {
    log(`❌ ${testName} - ÉCHEC: ${error.message}`, 'red')
  }
}

// Test 1: GET Profile - Lecture du profil utilisateur
async function testGetProfile() {
  // D'abord, se connecter pour obtenir un token
  const loginResponse = await makeRequest(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'testpassword123'
    })
  })

  if (!loginResponse.ok) {
    throw new Error(`Login échoué: ${JSON.stringify(loginResponse.data)}`)
  }

  const token = loginResponse.data.token
  const userId = loginResponse.data.user.id

  // Test GET Profile
  const profileResponse = await makeRequest(`${API_BASE}/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!profileResponse.ok) {
    throw new Error(`GET Profile échoué: ${JSON.stringify(profileResponse.data)}`)
  }

  if (!profileResponse.data.success) {
    throw new Error(`GET Profile returned success=false: ${JSON.stringify(profileResponse.data)}`)
  }

  if (!profileResponse.data.user || !profileResponse.data.user.id) {
    throw new Error('GET Profile: user data missing')
  }

  log(`   👤 Utilisateur lu: ${profileResponse.data.user.name} (${profileResponse.data.user.email})`, 'blue')
  
  return { token, userId, profileResponse: profileResponse.data }
}

// Test 2: PUT Profile - Mise à jour du profil
async function testUpdateProfile() {
  const { token, userId } = await testGetProfile()

  // Test mise à jour du nom et de l'entreprise
  const updateData = {
    name: 'Utilisateur Test Modifié',
    companyName: 'Entreprise Test Modifiée SARL'
  }

  const updateResponse = await makeRequest(`${API_BASE}/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updateData)
  })

  if (!updateResponse.ok) {
    throw new Error(`PUT Profile échoué: ${JSON.stringify(updateResponse.data)}`)
  }

  if (!updateResponse.data.success) {
    throw new Error(`PUT Profile returned success=false: ${JSON.stringify(updateResponse.data)}`)
  }

  if (updateResponse.data.user.name !== updateData.name) {
    throw new Error('PUT Profile: name not updated correctly')
  }

  if (updateResponse.data.user.companyName !== updateData.companyName) {
    throw new Error('PUT Profile: companyName not updated correctly')
  }

  log(`   📝 Profil mis à jour: ${updateResponse.data.user.name}`, 'blue')
  
  return { token, userId, updateResponse: updateResponse.data }
}

// Test 3: PUT Profile - Changement de mot de passe
async function testUpdatePassword() {
  const { token, userId } = await testGetProfile()

  // Test changement de mot de passe
  const passwordData = {
    currentPassword: 'testpassword123',
    password: 'newpassword456'
  }

  const passwordResponse = await makeRequest(`${API_BASE}/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(passwordData)
  })

  if (!passwordResponse.ok) {
    throw new Error(`PUT Password échoué: ${JSON.stringify(passwordResponse.data)}`)
  }

  if (!passwordResponse.data.success) {
    throw new Error(`PUT Password returned success=false: ${JSON.stringify(passwordResponse.data)}`)
  }

  log(`   🔐 Mot de passe mis à jour avec succès`, 'blue')

  // Test avec ancien mot de passe (doit échouer)
  const oldLoginResponse = await makeRequest(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'testpassword123'
    })
  })

  if (oldLoginResponse.ok) {
    throw new Error('Login with old password should have failed')
  }

  // Test avec nouveau mot de passe (doit réussir)
  const newLoginResponse = await makeRequest(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'newpassword456'
    })
  })

  if (!newLoginResponse.ok) {
    throw new Error('Login with new password should have succeeded')
  }

  log(`   ✅ Nouveau mot de passe fonctionne correctement`, 'blue')
  
  return { token: newLoginResponse.data.token, userId }
}

// Test 4: PUT Profile - Validation des erreurs
async function testProfileValidation() {
  const { token } = await testGetProfile()

  // Test 1: Nom trop court
  const shortNameResponse = await makeRequest(`${API_BASE}/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: 'A' // Trop court
    })
  })

  if (shortNameResponse.ok) {
    throw new Error('PUT Profile should have failed with short name')
  }

  if (shortNameResponse.status !== 400) {
    throw new Error('PUT Profile should return 400 for validation error')
  }

  log(`   ✅ Validation nom trop court: OK`, 'blue')

  // Test 2: Changement de mot de passe sans mot de passe actuel
  const noCurrentPasswordResponse = await makeRequest(`${API_BASE}/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      password: 'newpassword456'
      // currentPassword manquant
    })
  })

  if (noCurrentPasswordResponse.ok) {
    throw new Error('PUT Profile should have failed without currentPassword')
  }

  if (noCurrentPasswordResponse.status !== 400) {
    throw new Error('PUT Profile should return 400 for missing currentPassword')
  }

  log(`   ✅ Validation mot de passe actuel manquant: OK`, 'blue')

  // Test 3: Mot de passe actuel incorrect
  const wrongCurrentPasswordResponse = await makeRequest(`${API_BASE}/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      currentPassword: 'wrongpassword',
      password: 'newpassword456'
    })
  })

  if (wrongCurrentPasswordResponse.ok) {
    throw new Error('PUT Profile should have failed with wrong currentPassword')
  }

  if (wrongCurrentPasswordResponse.status !== 400) {
    throw new Error('PUT Profile should return 400 for wrong currentPassword')
  }

  log(`   ✅ Validation mot de passe actuel incorrect: OK`, 'blue')
}

// Test 5: DELETE Profile - Suppression du compte
async function testDeleteProfile() {
  // Créer un nouvel utilisateur pour la suppression
  const registerResponse = await makeRequest(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({
      name: 'Utilisateur à Supprimer',
      email: `delete-${Date.now()}@example.com`,
      password: 'testpassword123',
      companyName: 'Entreprise à Supprimer'
    })
  })

  if (!registerResponse.ok) {
    throw new Error(`Register échoué: ${JSON.stringify(registerResponse.data)}`)
  }

  // Se connecter avec ce nouvel utilisateur
  const loginResponse = await makeRequest(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: registerResponse.data.user.email,
      password: 'testpassword123'
    })
  })

  if (!loginResponse.ok) {
    throw new Error(`Login échoué: ${JSON.stringify(loginResponse.data)}`)
  }

  const token = loginResponse.data.token
  const userId = loginResponse.data.user.id

  // Test DELETE Profile
  const deleteResponse = await makeRequest(`${API_BASE}/profile`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!deleteResponse.ok) {
    throw new Error(`DELETE Profile échoué: ${JSON.stringify(deleteResponse.data)}`)
  }

  if (!deleteResponse.data.success) {
    throw new Error(`DELETE Profile returned success=false: ${JSON.stringify(deleteResponse.data)}`)
  }

  log(`   🗑️ Compte supprimé: ${userId}`, 'blue')

  // Vérifier que l'utilisateur n'existe plus
  await sleep(1000) // Attendre la propagation de la base de données

  const checkResponse = await makeRequest(`${API_BASE}/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (checkResponse.ok) {
    throw new Error('GET Profile should have failed after account deletion')
  }

  if (checkResponse.status !== 404) {
    throw new Error(`GET Profile should return 404 after deletion, got ${checkResponse.status}`)
  }

  log(`   ✅ Suppression vérifiée: utilisateur introuvable`, 'blue')
}

// Test 6: GET Profile sans authentification
async function testGetProfileNoAuth() {
  const response = await makeRequest(`${API_BASE}/profile`, {
    method: 'GET'
  })

  if (response.ok) {
    throw new Error('GET Profile should have failed without authentication')
  }

  if (response.status !== 401) {
    throw new Error(`GET Profile should return 401 without auth, got ${response.status}`)
  }

  log(`   ✅ Authentification requise: OK`, 'blue')
}

// Test 7: Méthodes non autorisées
async function testUnauthorizedMethods() {
  // Test POST (non autorisé)
  const postResponse = await makeRequest(`${API_BASE}/profile`, {
    method: 'POST'
  })

  if (postResponse.status !== 405) {
    throw new Error(`POST should return 405, got ${postResponse.status}`)
  }

  log(`   ✅ POST non autorisé: OK`, 'blue')
}

// Fonction principale
async function main() {
  log('🚀 Démarrage des tests API Profile CRUD', 'bright')
  log('====================================', 'cyan')

  try {
    // Attendre que le serveur soit prêt
    log('⏳ Attente du démarrage du serveur...', 'yellow')
    await sleep(2000)

    // Exécuter tous les tests
    await runTest('GET Profile sans authentification', testGetProfileNoAuth)
    await runTest('Méthodes non autorisées', testUnauthorizedMethods)
    await runTest('GET Profile - Lecture du profil', testGetProfile)
    await runTest('PUT Profile - Mise à jour du profil', testUpdateProfile)
    await runTest('PUT Profile - Changement de mot de passe', testUpdatePassword)
    await runTest('PUT Profile - Validation des erreurs', testProfileValidation)
    await runTest('DELETE Profile - Suppression du compte', testDeleteProfile)

    log('\n🎉 Tous les tests ont été exécutés!', 'bright')
    log('====================================', 'cyan')

  } catch (error) {
    log(`\n💥 Erreur lors de l'exécution des tests: ${error.message}`, 'red')
    process.exit(1)
  }
}

// Exécution
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  makeRequest,
  runTest,
  testGetProfile,
  testUpdateProfile,
  testUpdatePassword,
  testProfileValidation,
  testDeleteProfile,
  testGetProfileNoAuth,
  testUnauthorizedMethods
}