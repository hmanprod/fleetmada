#!/usr/bin/env node

/**
 * Test d'intégration Frontend-Backend Authentification
 * Ce script teste le workflow complet d'authentification
 */

const API_BASE_URL = 'http://localhost:3000/api';

// Fonction pour faire des requêtes HTTP
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    console.error(`Erreur lors de la requête à ${url}:`, error.message);
    return { status: 0, data: { message: error.message }, ok: false };
  }
}

// Générer un email unique pour les tests
function generateTestEmail() {
  const timestamp = Date.now();
  return `test-${timestamp}@fleetmada.test`;
}

// Générer un mot de passe sécurisé
function generatePassword() {
  return `TestPass${Math.random().toString(36).substring(2, 10)}!`;
}

// Test d'inscription
async function testRegister() {
  console.log('\n🔐 === TEST D\'INSCRIPTION ===');
  
  const testData = {
    name: 'Test User',
    email: generateTestEmail(),
    password: generatePassword(),
    avatar: ''
  };
  
  console.log('📧 Email de test:', testData.email);
  
  const result = await makeRequest(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(testData)
  });
  
  if (result.ok) {
    console.log('✅ Inscription réussie');
    console.log('🔑 Token reçu:', result.data.token ? 'OUI' : 'NON');
    console.log('👤 Utilisateur créé:', result.data.user ? 'OUI' : 'NON');
    return { success: true, token: result.data.token, user: result.data.user, email: testData.email };
  } else {
    console.log('❌ Échec de l\'inscription');
    console.log('💬 Message d\'erreur:', result.data.message);
    return { success: false, error: result.data.message };
  }
}

// Test de connexion
async function testLogin(email, password) {
  console.log('\n🔑 === TEST DE CONNEXION ===');
  
  const credentials = { email, password };
  
  const result = await makeRequest(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  
  if (result.ok) {
    console.log('✅ Connexion réussie');

    console.log('🔑 Token reçu:', result.data.token ? 'OUI' : 'NON');
    console.log('👤 Utilisateur connecté:', result.data.user ? 'OUI' : 'NON');
    return { success: true, token: result.data.token, user: result.data.user };
  } else {
    console.log('❌ Échec de la connexion');
    console.log('💬 Message d\'erreur:', result.data.message);
    return { success: false, error: result.data.message };
  }
}

// Test de récupération de profil
async function testGetProfile(token) {
  console.log('\n👤 === TEST DE RÉCUPÉRATION DU PROFIL ===');
  
  const result = await makeRequest(`${API_BASE_URL}/profile`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (result.ok) {
    console.log('✅ Profil récupéré avec succès');
    console.log('📊 Données du profil reçues:', Object.keys(result.data).length, 'champs');
    return { success: true, profile: result.data };
  } else {
    console.log('❌ Échec de la récupération du profil');
    console.log('💬 Message d\'erreur:', result.data.message);
    return { success: false, error: result.data.message };
  }
}

// Test de mise à jour du profil
async function testUpdateProfile(token) {
  console.log('\n✏️ === TEST DE MISE À JOUR DU PROFIL ===');
  
  const updateData = {
    firstName: 'Updated',
    lastName: 'User',
    preferences: {
      fuelEconomyDisplay: 'km/L · L/hr · Litres',
      itemsPerPage: 100
    }
  };
  
  const result = await makeRequest(`${API_BASE_URL}/profile`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(updateData)
  });
  
  if (result.ok) {
    console.log('✅ Profil mis à jour avec succès');
    console.log('🔄 Données mises à jour:', result.data.updated ? 'OUI' : 'NON');
    return { success: true, updatedProfile: result.data };
  } else {
    console.log('❌ Échec de la mise à jour du profil');
    console.log('💬 Message d\'erreur:', result.data.message);
    return { success: false, error: result.data.message };
  }
}

// Test d'onboarding
async function testOnboarding(token) {
  console.log('\n🚀 === TEST D\'ONBOARDING ===');
  
  const onboardingData = {
    fleetSize: '11-50',
    industry: 'Logistique / Transport',
    objectives: ['maintenance', 'costs']
  };
  
  const result = await makeRequest(`${API_BASE_URL}/onboarding/company`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(onboardingData)
  });
  
  if (result.ok) {
    console.log('✅ Onboarding terminé avec succès');
    console.log('🏢 Company créée:', result.data.company ? 'OUI' : 'NON');
    return { success: true, company: result.data.company };
  } else {
    console.log('❌ Échec de l\'onboarding');
    console.log('💬 Message d\'erreur:', result.data.message);
    return { success: false, error: result.data.message };
  }
}

// Test de déconnexion
async function testLogout(token) {
  console.log('\n👋 === TEST DE DÉCONNEXION ===');
  
  const result = await makeRequest(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (result.ok) {
    console.log('✅ Déconnexion réussie');
    console.log('🗑️ Token blacklisté:', result.data.blacklisted ? 'OUI' : 'NON');
    return { success: true };
  } else {
    console.log('❌ Échec de la déconnexion');
    console.log('💬 Message d\'erreur:', result.data.message);
    return { success: false, error: result.data.message };
  }
}

// Test principal
async function runTests() {
  console.log('🧪 === DÉMARRAGE DES TESTS D\'INTÉGRATION FRONTEND-BACKEND ===');
  console.log('🔗 URL de base:', API_BASE_URL);
  
  let testResults = {
    register: null,
    login: null,
    profile: null,
    updateProfile: null,
    onboarding: null,
    logout: null
  };
  
  try {
    // Test 1: Inscription
    testResults.register = await testRegister();
    
    if (testResults.register.success) {
      const { token: registerToken, email } = testResults.register;
      const password = testResults.register.password || generatePassword();
      
      // Test 2: Connexion
      testResults.login = await testLogin(email, password);
      
      if (testResults.login.success) {
        const token = testResults.login.token;
        
        // Test 3: Récupération du profil
        testResults.profile = await testGetProfile(token);
        
        if (testResults.profile.success) {
          // Test 4: Mise à jour du profil
          testResults.updateProfile = await testUpdateProfile(token);
          
          if (testResults.updateProfile.success) {
            // Test 5: Onboarding
            testResults.onboarding = await testOnboarding(token);
          }
        }
        
        // Test 6: Déconnexion
        testResults.logout = await testLogout(token);
      }
    }
    
  } catch (error) {
    console.error('\n💥 Erreur inattendue pendant les tests:', error.message);
  }
  
  // Résumé des résultats
  console.log('\n📊 === RÉSUMÉ DES TESTS ===');
  
  const tests = [
    { name: 'Inscription', result: testResults.register },
    { name: 'Connexion', result: testResults.login },
    { name: 'Récupération profil', result: testResults.profile },
    { name: 'Mise à jour profil', result: testResults.updateProfile },
    { name: 'Onboarding', result: testResults.onboarding },
    { name: 'Déconnexion', result: testResults.logout }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  tests.forEach(test => {
    const status = test.result?.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${test.name}`);
    if (test.result?.success) {
      passedTests++;
    } else if (test.result?.error) {
      console.log(`   💬 Erreur: ${test.result.error}`);
    }
  });
  
  console.log(`\n🏆 Score: ${passedTests}/${totalTests} tests réussis`);
  console.log(`📈 Pourcentage de réussite: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 Tous les tests sont passés avec succès !');
  } else {
    console.log('⚠️ Certains tests ont échoué. Vérifiez les erreurs ci-dessus.');
  }
}

// Exécution des tests
runTests().catch(console.error);