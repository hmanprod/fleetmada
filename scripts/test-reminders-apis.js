#!/usr/bin/env node

/**
 * Script de test pour les APIs Reminders
 * Teste les fonctionnalités CRUD complètes pour Service Reminders et Vehicle Renewals
 */

const API_BASE = 'http://localhost:3000/api'

// Configuration de test
const TEST_CONFIG = {
  email: 'admin@fleetmada.com',
  password: 'admin123'
}

// Token d'authentification global
let authToken = null

// Fonction utilitaire pour les requêtes
async function makeRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      ...options.headers
    }
  })
  
  const result = await response.json()
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${result.error || 'Unknown error'}`)
  }
  
  return result
}

// Authentification
async function authenticate() {
  console.log('\n🔐 Authentification...')
  
  const response = await makeRequest(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify(TEST_CONFIG)
  })
  
  authToken = response.token
  console.log('✅ Authentification réussie')
  return authToken
}

// Test des Service Reminders
async function testServiceReminders() {
  console.log('\n🛠️ Test des Service Reminders...')
  
  let createdReminderId = null
  
  try {
    // 1. Liste des rappels (avec pagination)
    console.log('📋 Test GET /service/reminders')
    const listResponse = await makeRequest(`${API_BASE}/service/reminders?page=1&limit=10`)
    console.log(`   ✅ Liste récupérée: ${listResponse.data.reminders.length} rappels`)
    
    // 2. Création d'un nouveau rappel
    console.log('➕ Test POST /service/reminders')
    const createData = {
      vehicleId: 'test-vehicle-id', // À remplacer par un ID réel
      task: 'Test Oil Change',
      nextDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Dans 30 jours
      intervalMonths: 6,
      type: 'date',
      title: 'Test Reminder',
      description: 'Rappel de test pour l\'API',
      watchers: ['test-user-id'],
      escalationDays: 7
    }
    
    const createResponse = await makeRequest(`${API_BASE}/service/reminders`, {
      method: 'POST',
      body: JSON.stringify(createData)
    })
    
    createdReminderId = createResponse.data.id
    console.log(`   ✅ Rappel créé avec ID: ${createdReminderId}`)
    
    // 3. Détails du rappel
    console.log('👁️ Test GET /service/reminders/[id]')
    const detailResponse = await makeRequest(`${API_BASE}/service/reminders/${createdReminderId}`)
    console.log(`   ✅ Détails récupérés pour: ${detailResponse.data.task}`)
    
    // 4. Modification du rappel
    console.log('✏️ Test PUT /service/reminders/[id]')
    const updateData = {
      task: 'Updated Test Oil Change',
      description: 'Description mise à jour',
      escalationDays: 14
    }
    
    const updateResponse = await makeRequest(`${API_BASE}/service/reminders/${createdReminderId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    })
    
    console.log(`   ✅ Rappel modifié: ${updateResponse.data.task}`)
    
    // 5. Snooze du rappel
    console.log('⏰ Test POST /service/reminders/[id]/snooze')
    const snoozeData = {
      days: 7
    }
    
    const snoozeResponse = await makeRequest(`${API_BASE}/service/reminders/${createdReminderId}/snooze`, {
      method: 'POST',
      body: JSON.stringify(snoozeData)
    })
    
    console.log(`   ✅ Rappel reporté jusqu'au: ${snoozeResponse.data.snoozedUntil}`)
    
    // 6. Dismiss du rappel
    console.log('❌ Test POST /service/reminders/[id]/dismiss')
    const dismissResponse = await makeRequest(`${API_BASE}/service/reminders/${createdReminderId}/dismiss`, {
      method: 'POST'
    })
    
    console.log(`   ✅ Rappel marqué comme traité: ${dismissResponse.data.status}`)
    
    // 7. Test des filtres
    console.log('🔍 Test des filtres...')
    const overdueResponse = await makeRequest(`${API_BASE}/service/reminders?overdue=true`)
    console.log(`   ✅ Rappels en retard: ${overdueResponse.data.reminders.length}`)
    
    return createdReminderId
    
  } catch (error) {
    console.error('❌ Erreur dans les tests Service Reminders:', error.message)
    throw error
  }
}

// Test des Vehicle Renewals
async function testVehicleRenewals() {
  console.log('\n🚗 Test des Vehicle Renewals...')
  
  let createdRenewalId = null
  
  try {
    // 1. Liste des renouvellements
    console.log('📋 Test GET /vehicle-renewals')
    const listResponse = await makeRequest(`${API_BASE}/vehicle-renewals?page=1&limit=10`)
    console.log(`   ✅ Liste récupérée: ${listResponse.data.renewals.length} renouvellements`)
    
    // 2. Création d'un nouveau renouvellement
    console.log('➕ Test POST /vehicle-renewals')
    const createData = {
      vehicleId: 'test-vehicle-id', // À remplacer par un ID réel
      type: 'REGISTRATION',
      title: 'Test Registration Renewal',
      description: 'Renouvellement de test pour l\'API',
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // Dans 60 jours
      priority: 'MEDIUM',
      cost: 150.00,
      provider: 'DMV Test',
      notes: 'Test renewal notes',
      watchers: ['test-user-id']
    }
    
    const createResponse = await makeRequest(`${API_BASE}/vehicle-renewals`, {
      method: 'POST',
      body: JSON.stringify(createData)
    })
    
    createdRenewalId = createResponse.data.id
    console.log(`   ✅ Renouvellement créé avec ID: ${createdRenewalId}`)
    
    // 3. Détails du renouvellement
    console.log('👁️ Test GET /vehicle-renewals/[id]')
    const detailResponse = await makeRequest(`${API_BASE}/vehicle-renewals/${createdRenewalId}`)
    console.log(`   ✅ Détails récupérés pour: ${detailResponse.data.title}`)
    
    // 4. Modification du renouvellement
    console.log('✏️ Test PUT /vehicle-renewals/[id]')
    const updateData = {
      title: 'Updated Test Registration Renewal',
      description: 'Description mise à jour',
      cost: 175.00,
      priority: 'HIGH'
    }
    
    const updateResponse = await makeRequest(`${API_BASE}/vehicle-renewals/${createdRenewalId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    })
    
    console.log(`   ✅ Renouvellement modifié: ${updateResponse.data.title}`)
    
    // 5. Completion du renouvellement
    console.log('✅ Test POST /vehicle-renewals/[id]/complete')
    const completeData = {
      completedDate: new Date().toISOString(),
      cost: 175.00,
      provider: 'DMV Test',
      notes: 'Completed successfully',
      documentId: 'test-doc-id'
    }
    
    const completeResponse = await makeRequest(`${API_BASE}/vehicle-renewals/${createdRenewalId}/complete`, {
      method: 'POST',
      body: JSON.stringify(completeData)
    })
    
    console.log(`   ✅ Renouvellement complété: ${completeResponse.data.status}`)
    console.log(`   📅 Prochaine échéance: ${completeResponse.data.nextDueDate}`)
    
    // 6. Test des filtres
    console.log('🔍 Test des filtres...')
    const overdueResponse = await makeRequest(`${API_BASE}/vehicle-renewals?overdue=true`)
    console.log(`   ✅ Renouvellements en retard: ${overdueResponse.data.renewals.length}`)
    
    const dueSoonResponse = await makeRequest(`${API_BASE}/vehicle-renewals?dueSoon=true`)
    console.log(`   ✅ Renouvellements dus bientôt: ${dueSoonResponse.data.renewals.length}`)
    
    return createdRenewalId
    
  } catch (error) {
    console.error('❌ Erreur dans les tests Vehicle Renewals:', error.message)
    throw error
  }
}

// Test des Notifications
async function testNotifications() {
  console.log('\n🔔 Test des Notifications...')
  
  try {
    // 1. Liste des notifications
    console.log('📋 Test GET /notifications')
    const listResponse = await makeRequest(`${API_BASE}/notifications?page=1&limit=20`)
    console.log(`   ✅ Liste récupérée: ${listResponse.data.notifications.length} notifications`)
    console.log(`   🔴 Non lues: ${listResponse.data.unreadCount}`)
    
    // 2. Création d'une notification
    console.log('➕ Test POST /notifications')
    const createData = {
      title: 'Test Notification',
      message: 'Ceci est une notification de test pour l\'API',
      type: 'SYSTEM',
      link: '/test'
    }
    
    const createResponse = await makeRequest(`${API_BASE}/notifications`, {
      method: 'POST',
      body: JSON.stringify(createData)
    })
    
    console.log(`   ✅ Notification créée avec ID: ${createResponse.data.id}`)
    
    // 3. Marquage de toutes les notifications comme lues
    console.log('👁️ Test PATCH /notifications/mark-all-read')
    const markAllResponse = await makeRequest(`${API_BASE}/notifications/mark-all-read`, {
      method: 'PATCH'
    })
    
    console.log(`   ✅ ${markAllResponse.data.updatedCount} notifications marquées comme lues`)
    
    return true
    
  } catch (error) {
    console.error('❌ Erreur dans les tests Notifications:', error.message)
    throw error
  }
}

// Nettoyage
async function cleanup(createdReminderId, createdRenewalId) {
  console.log('\n🧹 Nettoyage des données de test...')
  
  try {
    if (createdReminderId) {
      await makeRequest(`${API_BASE}/service/reminders/${createdReminderId}`, {
        method: 'DELETE'
      })
      console.log('   ✅ Rappel de test supprimé')
    }
    
    if (createdRenewalId) {
      await makeRequest(`${API_BASE}/vehicle-renewals/${createdRenewalId}`, {
        method: 'DELETE'
      })
      console.log('   ✅ Renouvellement de test supprimé')
    }
    
  } catch (error) {
    console.warn('⚠️ Erreur lors du nettoyage:', error.message)
  }
}

// Test principal
async function runTests() {
  console.log('🚀 Démarrage des tests des APIs Reminders')
  console.log('=' .repeat(50))
  
  let createdReminderId = null
  let createdRenewalId = null
  
  try {
    // Authentification
    await authenticate()
    
    // Tests des fonctionnalités
    createdReminderId = await testServiceReminders()
    createdRenewalId = await testVehicleRenewals()
    await testNotifications()
    
    console.log('\n🎉 Tous les tests ont réussi!')
    console.log('=' .repeat(50))
    
  } catch (error) {
    console.error('\n💥 Échec des tests:', error.message)
    process.exit(1)
    
  } finally {
    // Nettoyage
    await cleanup(createdReminderId, createdRenewalId)
  }
}

// Vérification des prérequis
function checkPrerequisites() {
  console.log('🔍 Vérification des prérequis...')
  
  if (typeof fetch === 'undefined') {
    console.error('❌ fetch n\'est pas disponible. Utilisez Node.js 18+')
    process.exit(1)
  }
  
  console.log('✅ Prérequis OK')
}

// Point d'entrée
if (require.main === module) {
  checkPrerequisites()
  runTests()
    .then(() => {
      console.log('✅ Tests terminés avec succès')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error.message)
      process.exit(1)
    })
}

module.exports = { runTests, checkPrerequisites }