#!/usr/bin/env node

/**
 * Script de test complet pour le module Reminders FleetMada
 * Teste toutes les APIs backend : service reminders et vehicle renewals
 * 
 * Usage: node scripts/test-reminders-complete.js
 */

const API_BASE = 'http://localhost:3000/api';
const TEST_TOKEN = 'test-jwt-token'; // À remplacer par un token valide

// Utilitaires de test
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`[${timestamp}] ${prefix} ${message}`);
};

const makeRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`,
        ...options.headers,
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || `HTTP ${response.status}`);
    }
    
    return { success: true, data: result.data, response };
  } catch (error) {
    log(`API Error [${endpoint}]: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
};

// Tests des Service Reminders APIs
async function testServiceReminders() {
  log('🧪 Début des tests Service Reminders APIs', 'info');
  
  // Test 1: GET service reminders (liste)
  log('Test 1: GET /api/service/reminders - Liste des rappels');
  const listResult = await makeRequest('/service/reminders');
  if (listResult.success) {
    log(`✅ Liste récupérée: ${listResult.data.reminders.length} rappels`, 'success');
  } else {
    log(`❌ Échec de la récupération de la liste`, 'error');
    return false;
  }

  // Test 2: POST service reminder (création)
  log('Test 2: POST /api/service/reminders - Création d\'un rappel');
  const createData = {
    vehicleId: 'test-vehicle-id',
    task: 'Test Service Reminder',
    nextDue: '2025-12-25T00:00:00Z',
    intervalMonths: 3,
    type: 'date'
  };
  
  const createResult = await makeRequest('/service/reminders', {
    method: 'POST',
    body: JSON.stringify(createData)
  });
  
  if (createResult.success) {
    log(`✅ Rappel créé avec ID: ${createResult.data.id}`, 'success');
    const reminderId = createResult.data.id;
    
    // Test 3: GET service reminder (détail)
    log('Test 3: GET /api/service/reminders/[id] - Détail du rappel');
    const detailResult = await makeRequest(`/service/reminders/${reminderId}`);
    if (detailResult.success) {
      log(`✅ Détail récupéré pour: ${detailResult.data.task}`, 'success');
    } else {
      log(`❌ Échec de récupération du détail`, 'error');
      return false;
    }

    // Test 4: PUT service reminder (mise à jour)
    log('Test 4: PUT /api/service/reminders/[id] - Mise à jour du rappel');
    const updateResult = await makeRequest(`/service/reminders/${reminderId}`, {
      method: 'PUT',
      body: JSON.stringify({
        task: 'Updated Test Service Reminder',
        intervalMonths: 6
      })
    });
    if (updateResult.success) {
      log(`✅ Rappel mis à jour`, 'success');
    } else {
      log(`❌ Échec de mise à jour`, 'error');
      return false;
    }

    // Test 5: POST dismiss service reminder
    log('Test 5: POST /api/service/reminders/[id]/dismiss - Rejeter le rappel');
    const dismissResult = await makeRequest(`/service/reminders/${reminderId}/dismiss`, {
      method: 'POST'
    });
    if (dismissResult.success) {
      log(`✅ Rappel rejeté - Statut: ${dismissResult.data.status}`, 'success');
    } else {
      log(`❌ Échec du rejet`, 'error');
      return false;
    }

    // Test 6: POST snooze service reminder
    log('Test 6: POST /api/service/reminders/[id]/snooze - Reporter le rappel');
    const snoozeResult = await makeRequest(`/service/reminders/${reminderId}/snooze`, {
      method: 'POST',
      body: JSON.stringify({ days: 7 })
    });
    if (snoozeResult.success) {
      log(`✅ Rappel reporté jusqu'au: ${snoozeResult.data.snoozedUntil}`, 'success');
    } else {
      log(`❌ Échec du report`, 'error');
      return false;
    }

    // Test 7: DELETE service reminder
    log('Test 7: DELETE /api/service/reminders/[id] - Suppression du rappel');
    const deleteResult = await makeRequest(`/service/reminders/${reminderId}`, {
      method: 'DELETE'
    });
    if (deleteResult.success) {
      log(`✅ Rappel supprimé`, 'success');
    } else {
      log(`❌ Échec de suppression`, 'error');
      return false;
    }

  } else {
    log(`❌ Échec de création`, 'error');
    return false;
  }

  return true;
}

// Tests des Vehicle Renewals APIs
async function testVehicleRenewals() {
  log('🧪 Début des tests Vehicle Renewals APIs', 'info');
  
  // Test 1: GET vehicle renewals (liste)
  log('Test 1: GET /api/vehicle-renewals - Liste des renouvellements');
  const listResult = await makeRequest('/vehicle-renewals');
  if (listResult.success) {
    log(`✅ Liste récupérée: ${listResult.data.renewals.length} renouvellements`, 'success');
  } else {
    log(`❌ Échec de la récupération de la liste`, 'error');
    return false;
  }

  // Test 2: POST vehicle renewal (création)
  log('Test 2: POST /api/vehicle-renewals - Création d\'un renouvellement');
  const createData = {
    vehicleId: 'test-vehicle-id',
    type: 'INSPECTION',
    title: 'Test Vehicle Renewal',
    dueDate: '2025-12-30T00:00:00Z',
    priority: 'HIGH'
  };
  
  const createResult = await makeRequest('/vehicle-renewals', {
    method: 'POST',
    body: JSON.stringify(createData)
  });
  
  if (createResult.success) {
    log(`✅ Renouvellement créé avec ID: ${createResult.data.id}`, 'success');
    const renewalId = createResult.data.id;
    
    // Test 3: GET vehicle renewal (détail)
    log('Test 3: GET /api/vehicle-renewals/[id] - Détail du renouvellement');
    const detailResult = await makeRequest(`/vehicle-renewals/${renewalId}`);
    if (detailResult.success) {
      log(`✅ Détail récupéré pour: ${detailResult.data.title}`, 'success');
    } else {
      log(`❌ Échec de récupération du détail`, 'error');
      return false;
    }

    // Test 4: PUT vehicle renewal (mise à jour)
    log('Test 4: PUT /api/vehicle-renewals/[id] - Mise à jour du renouvellement');
    const updateResult = await makeRequest(`/vehicle-renewals/${renewalId}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: 'Updated Test Vehicle Renewal',
        priority: 'MEDIUM'
      })
    });
    if (updateResult.success) {
      log(`✅ Renouvellement mis à jour`, 'success');
    } else {
      log(`❌ Échec de mise à jour`, 'error');
      return false;
    }

    // Test 5: POST complete vehicle renewal
    log('Test 5: POST /api/vehicle-renewals/[id]/complete - Compléter le renouvellement');
    const completeResult = await makeRequest(`/vehicle-renewals/${renewalId}/complete`, {
      method: 'POST',
      body: JSON.stringify({
        completedDate: '2025-12-18T10:00:00Z',
        cost: 150.50,
        provider: 'Test Provider',
        notes: 'Test completion'
      })
    });
    if (completeResult.success) {
      log(`✅ Renouvellement complété - Statut: ${completeResult.data.status}`, 'success');
      if (completeResult.data.nextDueDate) {
        log(`📅 Prochaine échéance: ${completeResult.data.nextDueDate}`, 'info');
      }
    } else {
      log(`❌ Échec de complétion`, 'error');
      return false;
    }

    // Test 6: DELETE vehicle renewal
    log('Test 6: DELETE /api/vehicle-renewals/[id] - Suppression du renouvellement');
    const deleteResult = await makeRequest(`/vehicle-renewals/${renewalId}`, {
      method: 'DELETE'
    });
    if (deleteResult.success) {
      log(`✅ Renouvellement supprimé`, 'success');
    } else {
      log(`❌ Échec de suppression`, 'error');
      return false;
    }

  } else {
    log(`❌ Échec de création`, 'error');
    return false;
  }

  return true;
}

// Test des filtres et pagination
async function testAdvancedFeatures() {
  log('🧪 Début des tests des fonctionnalités avancées', 'info');
  
  // Test des filtres service reminders
  log('Test: GET /api/service/reminders avec filtres');
  const filteredResult = await makeRequest('/service/reminders?status=ACTIVE&overdue=true&page=1&limit=5');
  if (filteredResult.success) {
    log(`✅ Filtres appliqués - Résultats: ${filteredResult.data.reminders.length}`, 'success');
    log(`📊 Pagination: page ${filteredResult.data.pagination.page}/${filteredResult.data.pagination.totalPages}`, 'info');
  } else {
    log(`❌ Échec des filtres`, 'error');
    return false;
  }

  // Test des filtres vehicle renewals
  log('Test: GET /api/vehicle-renewals avec filtres');
  const filteredRenewalResult = await makeRequest('/vehicle-renewals?status=DUE&type=INSPECTION&dueSoon=true&page=1&limit=5');
  if (filteredRenewalResult.success) {
    log(`✅ Filtres renouvellements appliqués - Résultats: ${filteredRenewalResult.data.renewals.length}`, 'success');
  } else {
    log(`❌ Échec des filtres renouvellements`, 'error');
    return false;
  }

  return true;
}

// Test des métriques dashboard
async function testDashboardIntegration() {
  log('🧪 Début des tests d\'intégration Dashboard', 'info');
  
  // Test de récupération des comptes pour le dashboard
  log('Test: getAllRemindersCount - Métriques pour le dashboard');
  try {
    const result = await makeRequest('/service/reminders?limit=1000');
    const renewalsResult = await makeRequest('/vehicle-renewals?limit=1000');
    
    if (result.success && renewalsResult.success) {
      const serviceReminders = result.data.reminders;
      const vehicleRenewals = renewalsResult.data.renewals;
      
      const overdue = [
        ...serviceReminders.filter(r => r.isOverdue),
        ...vehicleRenewals.filter(r => r.isOverdue)
      ].length;
      
      const dueSoon = [
        ...serviceReminders.filter(r => r.daysUntilDue != null && r.daysUntilDue <= 7),
        ...vehicleRenewals.filter(r => r.daysUntilDue != null && r.daysUntilDue <= 7)
      ].length;
      
      const metrics = {
        serviceReminders: serviceReminders.length,
        vehicleRenewals: vehicleRenewals.length,
        overdue,
        dueSoon
      };
      
      log(`✅ Métriques Dashboard:`, 'success');
      log(`   📊 Rappels service: ${metrics.serviceReminders}`, 'info');
      log(`   📊 Renouvellements: ${metrics.vehicleRenewals}`, 'info');
      log(`   🚨 En retard: ${metrics.overdue}`, 'info');
      log(`   ⏰ Échéance proche: ${metrics.dueSoon}`, 'info');
      
      return true;
    }
  } catch (error) {
    log(`❌ Erreur calcul métriques: ${error.message}`, 'error');
    return false;
  }
}

// Fonction principale de test
async function runAllTests() {
  log('🚀 Démarrage des tests complets du module Reminders', 'info');
  log('⚠️  Assurez-vous que le serveur de développement est démarré (npm run dev)', 'info');
  
  try {
    const serviceTests = await testServiceReminders();
    const renewalTests = await testVehicleRenewals();
    const advancedTests = await testAdvancedFeatures();
    const dashboardTests = await testDashboardIntegration();
    
    const allPassed = serviceTests && renewalTests && advancedTests && dashboardTests;
    
    if (allPassed) {
      log('🎉 Tous les tests sont passés avec succès!', 'success');
      log('✅ Module Reminders prêt pour la production', 'success');
    } else {
      log('💥 Certains tests ont échoué. Vérifiez les erreurs ci-dessus.', 'error');
    }
    
    return allPassed;
    
  } catch (error) {
    log(`💥 Erreur fatale lors des tests: ${error.message}`, 'error');
    return false;
  }
}

// Exécution si appelé directement
if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runAllTests, testServiceReminders, testVehicleRenewals, testAdvancedFeatures, testDashboardIntegration };