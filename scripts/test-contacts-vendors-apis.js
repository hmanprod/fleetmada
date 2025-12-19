#!/usr/bin/env node

/**
 * Script de test pour les APIs Contacts & Vendors
 * Teste les fonctionnalités CRUD complètes avec authentification JWT
 */

const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const TEST_TOKEN = process.env.TEST_AUTH_TOKEN || 'test-jwt-token';
const TEST_USER_ID = process.env.TEST_USER_ID || 'test-user-id';

// Couleurs pour l'affichage console
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

// Utilitaires
const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logSection = (title) => {
  console.log('\n' + '='.repeat(60));
  log(`🧪 ${title}`, 'bright');
  console.log('='.repeat(60));
};

const logTest = (name, status, details = '') => {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  const color = status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : 'yellow';
  log(`${icon} ${name}`, color);
  if (details) {
    log(`   ${details}`, 'cyan');
  }
};

// Génération d'un token JWT de test
function generateTestJWT() {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const payload = {
    userId: TEST_USER_ID,
    email: 'test@example.com',
    type: 'login',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h
  };
  
  // Simulation d'un token JWT (pour les tests)
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItaWQiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJ0eXBlIjoibG9naW4iLCJpYXQiOjE2ODUwNzYwMDAsImV4cCI6MTY4NTE1MjAwMH0.test-signature';
}

// Fonction de requête HTTP
async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = generateTestJWT();
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  try {
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    });

    const data = await response.json();
    
    return {
      ok: response.ok,
      status: response.status,
      data,
      headers: response.headers
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: { error: error.message },
      headers: new Map()
    };
  }
}

// Tests des APIs Contacts
async function testContactsAPI() {
  logSection('TESTS API CONTACTS');
  
  let testResults = {
    passed: 0,
    failed: 0,
    total: 0
  };

  // Données de test
  const testContact = {
    firstName: 'Test',
    lastName: 'Contact',
    email: `test.contact.${Date.now()}@example.com`,
    phone: '+33123456789',
    group: 'Test Group',
    status: 'ACTIVE',
    userType: 'Test User',
    classifications: ['Employee', 'Technician'],
    image: 'https://example.com/avatar.jpg',
    jobTitle: 'Test Engineer',
    company: 'Test Company'
  };

  let createdContactId = null;

  // Test 1: GET /api/contacts - Liste des contacts
  logTest('GET /api/contacts', 'STARTED');
  const listResponse = await makeRequest('/api/contacts');
  testResults.total++;
  
  if (listResponse.ok && listResponse.data.success) {
    logTest('GET /api/contacts', 'PASS', `Trouvé ${listResponse.data.data.contacts.length} contacts`);
    testResults.passed++;
  } else {
    logTest('GET /api/contacts', 'FAIL', `Erreur: ${listResponse.data.error || 'Réponse invalide'}`);
    testResults.failed++;
  }

  // Test 2: POST /api/contacts - Création d'un contact
  logTest('POST /api/contacts', 'STARTED');
  const createResponse = await makeRequest('/api/contacts', {
    method: 'POST',
    body: JSON.stringify(testContact)
  });
  testResults.total++;
  
  if (createResponse.ok && createResponse.data.success) {
    createdContactId = createResponse.data.data.id;
    logTest('POST /api/contacts', 'PASS', `Contact créé avec l'ID: ${createdContactId}`);
    testResults.passed++;
  } else {
    logTest('POST /api/contacts', 'FAIL', `Erreur: ${createResponse.data.error || 'Échec de création'}`);
    testResults.failed++;
  }

  // Test 3: GET /api/contacts/[id] - Détails d'un contact
  if (createdContactId) {
    logTest('GET /api/contacts/[id]', 'STARTED');
    const detailResponse = await makeRequest(`/api/contacts/${createdContactId}`);
    testResults.total++;
    
    if (detailResponse.ok && detailResponse.data.success) {
      logTest('GET /api/contacts/[id]', 'PASS', `Contact récupéré: ${detailResponse.data.data.firstName} ${detailResponse.data.data.lastName}`);
      testResults.passed++;
    } else {
      logTest('GET /api/contacts/[id]', 'FAIL', `Erreur: ${detailResponse.data.error || 'Contact non trouvé'}`);
      testResults.failed++;
    }
  }

  // Test 4: PUT /api/contacts/[id] - Mise à jour d'un contact
  if (createdContactId) {
    logTest('PUT /api/contacts/[id]', 'STARTED');
    const updateData = {
      ...testContact,
      firstName: 'Updated Test',
      jobTitle: 'Updated Engineer'
    };
    
    const updateResponse = await makeRequest(`/api/contacts/${createdContactId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
    testResults.total++;
    
    if (updateResponse.ok && updateResponse.data.success) {
      logTest('PUT /api/contacts/[id]', 'PASS', 'Contact mis à jour avec succès');
      testResults.passed++;
    } else {
      logTest('PUT /api/contacts/[id]', 'FAIL', `Erreur: ${updateResponse.data.error || 'Échec de mise à jour'}`);
      testResults.failed++;
    }
  }

  // Test 5: GET /api/contacts avec filtres
  logTest('GET /api/contacts avec filtres', 'STARTED');
  const filteredResponse = await makeRequest('/api/contacts?status=ACTIVE&group=Test%20Group&limit=10');
  testResults.total++;
  
  if (filteredResponse.ok && filteredResponse.data.success) {
    logTest('GET /api/contacts avec filtres', 'PASS', `Filtres appliqués: ${filteredResponse.data.data.contacts.length} résultats`);
    testResults.passed++;
  } else {
    logTest('GET /api/contacts avec filtres', 'FAIL', `Erreur: ${filteredResponse.data.error || 'Échec des filtres'}`);
    testResults.failed++;
  }

  // Test 6: DELETE /api/contacts/[id] - Suppression d'un contact
  if (createdContactId) {
    logTest('DELETE /api/contacts/[id]', 'STARTED');
    const deleteResponse = await makeRequest(`/api/contacts/${createdContactId}`, {
      method: 'DELETE'
    });
    testResults.total++;
    
    if (deleteResponse.ok && deleteResponse.data.success) {
      logTest('DELETE /api/contacts/[id]', 'PASS', 'Contact supprimé avec succès');
      testResults.passed++;
    } else {
      logTest('DELETE /api/contacts/[id]', 'FAIL', `Erreur: ${deleteResponse.data.error || 'Échec de suppression'}`);
      testResults.failed++;
    }
  }

  // Test 7: Validation des erreurs
  logTest('Validation des erreurs', 'STARTED');
  const errorResponse = await makeRequest('/api/contacts', {
    method: 'POST',
    body: JSON.stringify({ invalid: 'data' })
  });
  testResults.total++;
  
  if (!errorResponse.ok && errorResponse.data.error) {
    logTest('Validation des erreurs', 'PASS', 'Erreurs correctement validées');
    testResults.passed++;
  } else {
    logTest('Validation des erreurs', 'FAIL', 'Validation des erreurs échouée');
    testResults.failed++;
  }

  return testResults;
}

// Tests des APIs Vendors
async function testVendorsAPI() {
  logSection('TESTS API VENDORS');
  
  let testResults = {
    passed: 0,
    failed: 0,
    total: 0
  };

  // Données de test
  const testVendor = {
    name: `Test Vendor ${Date.now()}`,
    phone: '+33123456789',
    website: 'https://test-vendor.com',
    address: '123 Test Street, Test City',
    contactName: 'Test Contact Person',
    contactEmail: 'contact@test-vendor.com',
    contactPhone: '+33987654321',
    labels: ['Sample', 'Preferred'],
    classification: ['Fuel', 'Service']
  };

  let createdVendorId = null;

  // Test 1: GET /api/vendors - Liste des vendors
  logTest('GET /api/vendors', 'STARTED');
  const listResponse = await makeRequest('/api/vendors');
  testResults.total++;
  
  if (listResponse.ok && listResponse.data.success) {
    logTest('GET /api/vendors', 'PASS', `Trouvé ${listResponse.data.data.vendors.length} vendors`);
    testResults.passed++;
  } else {
    logTest('GET /api/vendors', 'FAIL', `Erreur: ${listResponse.data.error || 'Réponse invalide'}`);
    testResults.failed++;
  }

  // Test 2: POST /api/vendors - Création d'un vendor
  logTest('POST /api/vendors', 'STARTED');
  const createResponse = await makeRequest('/api/vendors', {
    method: 'POST',
    body: JSON.stringify(testVendor)
  });
  testResults.total++;
  
  if (createResponse.ok && createResponse.data.success) {
    createdVendorId = createResponse.data.data.id;
    logTest('POST /api/vendors', 'PASS', `Vendor créé avec l'ID: ${createdVendorId}`);
    testResults.passed++;
  } else {
    logTest('POST /api/vendors', 'FAIL', `Erreur: ${createResponse.data.error || 'Échec de création'}`);
    testResults.failed++;
  }

  // Test 3: GET /api/vendors/[id] - Détails d'un vendor
  if (createdVendorId) {
    logTest('GET /api/vendors/[id]', 'STARTED');
    const detailResponse = await makeRequest(`/api/vendors/${createdVendorId}`);
    testResults.total++;
    
    if (detailResponse.ok && detailResponse.data.success) {
      logTest('GET /api/vendors/[id]', 'PASS', `Vendor récupéré: ${detailResponse.data.data.name}`);
      testResults.passed++;
    } else {
      logTest('GET /api/vendors/[id]', 'FAIL', `Erreur: ${detailResponse.data.error || 'Vendor non trouvé'}`);
      testResults.failed++;
    }
  }

  // Test 4: PUT /api/vendors/[id] - Mise à jour d'un vendor
  if (createdVendorId) {
    logTest('PUT /api/vendors/[id]', 'STARTED');
    const updateData = {
      ...testVendor,
      name: `Updated Test Vendor ${Date.now()}`,
      website: 'https://updated-test-vendor.com'
    };
    
    const updateResponse = await makeRequest(`/api/vendors/${createdVendorId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
    testResults.total++;
    
    if (updateResponse.ok && updateResponse.data.success) {
      logTest('PUT /api/vendors/[id]', 'PASS', 'Vendor mis à jour avec succès');
      testResults.passed++;
    } else {
      logTest('PUT /api/vendors/[id]', 'FAIL', `Erreur: ${updateResponse.data.error || 'Échec de mise à jour'}`);
      testResults.failed++;
    }
  }

  // Test 5: GET /api/vendors avec filtres
  logTest('GET /api/vendors avec filtres', 'STARTED');
  const filteredResponse = await makeRequest('/api/vendors?classification=Fuel&limit=10');
  testResults.total++;
  
  if (filteredResponse.ok && filteredResponse.data.success) {
    logTest('GET /api/vendors avec filtres', 'PASS', `Filtres appliqués: ${filteredResponse.data.data.vendors.length} résultats`);
    testResults.passed++;
  } else {
    logTest('GET /api/vendors avec filtres', 'FAIL', `Erreur: ${filteredResponse.data.error || 'Échec des filtres'}`);
    testResults.failed++;
  }

  // Test 6: DELETE /api/vendors/[id] - Suppression d'un vendor
  if (createdVendorId) {
    logTest('DELETE /api/vendors/[id]', 'STARTED');
    const deleteResponse = await makeRequest(`/api/vendors/${createdVendorId}`, {
      method: 'DELETE'
    });
    testResults.total++;
    
    if (deleteResponse.ok && deleteResponse.data.success) {
      logTest('DELETE /api/vendors/[id]', 'PASS', 'Vendor supprimé avec succès');
      testResults.passed++;
    } else {
      logTest('DELETE /api/vendors/[id]', 'FAIL', `Erreur: ${deleteResponse.data.error || 'Échec de suppression'}`);
      testResults.failed++;
    }
  }

  // Test 7: Validation des erreurs
  logTest('Validation des erreurs', 'STARTED');
  const errorResponse = await makeRequest('/api/vendors', {
    method: 'POST',
    body: JSON.stringify({ invalid: 'data' })
  });
  testResults.total++;
  
  if (!errorResponse.ok && errorResponse.data.error) {
    logTest('Validation des erreurs', 'PASS', 'Erreurs correctement validées');
    testResults.passed++;
  } else {
    logTest('Validation des erreurs', 'FAIL', 'Validation des erreurs échouée');
    testResults.failed++;
  }

  return testResults;
}

// Test de performance
async function testPerformance() {
  logSection('TESTS DE PERFORMANCE');
  
  const iterations = 10;
  const startTime = Date.now();
  
  for (let i = 0; i < iterations; i++) {
    const response = await makeRequest('/api/contacts?limit=50');
    if (!response.ok) {
      logTest(`Performance test ${i + 1}`, 'FAIL', 'Requête échouée');
      return;
    }
  }
  
  const endTime = Date.now();
  const avgTime = (endTime - startTime) / iterations;
  
  logTest('Tests de performance', 'PASS', `Temps moyen: ${avgTime.toFixed(2)}ms sur ${iterations} requêtes`);
}

// Fonction principale
async function main() {
  log('🧪 Démarrage des tests API Contacts & Vendors', 'bright');
  log(`📡 URL de base: ${API_BASE_URL}`, 'cyan');
  log(`👤 Utilisateur test: ${TEST_USER_ID}`, 'cyan');
  log(`🔑 Token: ${TEST_TOKEN ? 'Configuré' : 'Non configuré (utilise token généré)'}`, 'cyan');
  
  try {
    // Tests des APIs Contacts
    const contactsResults = await testContactsAPI();
    
    // Tests des APIs Vendors
    const vendorsResults = await testVendorsAPI();
    
    // Tests de performance
    await testPerformance();
    
    // Résumé des résultats
    logSection('RÉSUMÉ DES TESTS');
    
    const totalPassed = contactsResults.passed + vendorsResults.passed;
    const totalFailed = contactsResults.failed + vendorsResults.failed;
    const totalTests = contactsResults.total + vendorsResults.total;
    const successRate = ((totalPassed / totalTests) * 100).toFixed(1);
    
    log(`📊 Tests Contacts: ${contactsResults.passed}/${contactsResults.total} réussis`, 'green');
    log(`📊 Tests Vendors: ${vendorsResults.passed}/${vendorsResults.total} réussis`, 'green');
    log(`📊 Total: ${totalPassed}/${totalTests} tests réussis (${successRate}%)`, totalFailed === 0 ? 'green' : 'yellow');
    
    if (totalFailed === 0) {
      log('🎉 Tous les tests sont passés avec succès!', 'bright');
      process.exit(0);
    } else {
      log(`⚠️  ${totalFailed} test(s) ont échoué`, 'red');
      process.exit(1);
    }
    
  } catch (error) {
    log(`💥 Erreur durant les tests: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Gestion des arguments de ligne de commande
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  log('Usage: node test-contacts-vendors-apis.js [options]', 'bright');
  log('');
  log('Options:');
  log('  --help, -h        Affiche cette aide');
  log('  --contacts        Teste seulement les APIs Contacts');
  log('  --vendors         Teste seulement les APIs Vendors');
  log('  --performance     Teste seulement les performances');
  log('');
  log('Variables d\'environnement:');
  log('  API_BASE_URL         URL de base de l\'API (défaut: http://localhost:3000)');
  log('  TEST_AUTH_TOKEN      Token d\'authentification pour les tests');
  log('  TEST_USER_ID         ID utilisateur pour les tests');
  process.exit(0);
}

// Exécution conditionnelle
async function runConditionalTests() {
  if (args.includes('--contacts')) {
    const results = await testContactsAPI();
    logSection('RÉSUMÉ CONTACTS');
    log(`✅ ${results.passed}/${results.total} tests réussis`, results.failed === 0 ? 'green' : 'yellow');
    process.exit(results.failed === 0 ? 0 : 1);
  } else if (args.includes('--vendors')) {
    const results = await testVendorsAPI();
    logSection('RÉSUMÉ VENDORS');
    log(`✅ ${results.passed}/${results.total} tests réussis`, results.failed === 0 ? 'green' : 'yellow');
    process.exit(results.failed === 0 ? 0 : 1);
  } else if (args.includes('--performance')) {
    await testPerformance();
    process.exit(0);
  } else {
    await main();
  }
}

// Point d'entrée
runConditionalTests();