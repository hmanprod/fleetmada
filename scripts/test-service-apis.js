#!/usr/bin/env node

/**
 * Script de test pour les APIs du module Service FleetMada
 * Teste les endpoints CRUD pour Service Entries, Tasks, Parts, Programs, Reminders
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

// Fonction de logging
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

// Fonction pour faire des requêtes HTTP
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
    
    const data = await response.json()
    return { status: response.status, data }
  } catch (error) {
    log(`Erreur de requête: ${error.message}`, colors.red)
    return { status: 500, data: { error: error.message } }
  }
}

// Fonction pour obtenir un token JWT de test
async function getTestToken() {
  const testCredentials = {
    email: 'test@fleetmada.com',
    password: 'test123456'
  }
  
  const { data } = await makeRequest(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify(testCredentials)
  })
  
  if (data.token) {
    log('✅ Token JWT obtenu avec succès', colors.green)
    return data.token
  } else {
    log('❌ Échec de l\'authentification', colors.red)
    log(`Réponse: ${JSON.stringify(data, null, 2)}`, colors.red)
    return null
  }
}

// Fonction pour créer un utilisateur de test
async function createTestUser() {
  const testUser = {
    name: 'Test User Service',
    email: 'test@fleetmada.com',
    password: 'test123456',
    companyName: 'Test Company'
  }
  
  const { data } = await makeRequest(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(testUser)
  })
  
  if (data.token) {
    log('✅ Utilisateur de test créé avec succès', colors.green)
    return data.token
  } else {
    log('⚠️  Utilisateur existe peut-être déjà', colors.yellow)
    return await getTestToken()
  }
}

// Test des APIs Service Tasks
async function testServiceTasks(token) {
  log('\n🔍 Test des APIs Service Tasks', colors.cyan)
  
  // GET - Liste des tâches
  log('  GET /api/service/tasks', colors.blue)
  const { status: getTasksStatus, data: getTasksData } = await makeRequest(
    `${API_BASE}/service/tasks`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  
  if (getTasksStatus === 200) {
    log(`  ✅ GET Tasks réussi - ${getTasksData.data.tasks?.length || 0} tâches trouvées`, colors.green)
  } else {
    log(`  ❌ GET Tasks échoué - Status: ${getTasksStatus}`, colors.red)
  }
  
  // POST - Nouvelle tâche
  log('  POST /api/service/tasks', colors.blue)
  const newTask = {
    name: 'Test Task',
    description: 'Tâche de test pour les APIs',
    categoryCode: 'MAINT',
    systemCode: 'ENGINE'
  }
  
  const { status: postTaskStatus, data: postTaskData } = await makeRequest(
    `${API_BASE}/service/tasks`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(newTask)
    }
  )
  
  if (postTaskStatus === 201) {
    log(`  ✅ POST Task réussi - ID: ${postTaskData.data.id}`, colors.green)
    return postTaskData.data.id
  } else {
    log(`  ❌ POST Task échoué - Status: ${postTaskStatus}`, colors.red)
    log(`     Réponse: ${JSON.stringify(postTaskData, null, 2)}`, colors.red)
    return null
  }
}

// Test des APIs Parts
async function testParts(token) {
  log('\n🔍 Test des APIs Parts', colors.cyan)
  
  // GET - Liste des pièces
  log('  GET /api/parts', colors.blue)
  const { status: getPartsStatus, data: getPartsData } = await makeRequest(
    `${API_BASE}/parts`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  
  if (getPartsStatus === 200) {
    log(`  ✅ GET Parts réussi - ${getPartsData.data.parts?.length || 0} pièces trouvées`, colors.green)
  } else {
    log(`  ❌ GET Parts échoué - Status: ${getPartsStatus}`, colors.red)
  }
  
  // POST - Nouvelle pièce
  log('  POST /api/parts', colors.blue)
  const newPart = {
    number: 'TEST-001',
    description: 'Pièce de test',
    category: 'FILTERS',
    manufacturer: 'TestBrand',
    cost: 25.50,
    quantity: 10,
    minimumStock: 2
  }
  
  const { status: postPartStatus, data: postPartData } = await makeRequest(
    `${API_BASE}/parts`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(newPart)
    }
  )
  
  if (postPartStatus === 201) {
    log(`  ✅ POST Part réussi - ID: ${postPartData.data.id}`, colors.green)
    return postPartData.data.id
  } else {
    log(`  ❌ POST Part échoué - Status: ${postPartStatus}`, colors.red)
    log(`     Réponse: ${JSON.stringify(postPartData, null, 2)}`, colors.red)
    return null
  }
}

// Test des APIs Service Programs
async function testServicePrograms(token) {
  log('\n🔍 Test des APIs Service Programs', colors.cyan)
  
  // GET - Liste des programmes
  log('  GET /api/service/programs', colors.blue)
  const { status: getProgramsStatus, data: getProgramsData } = await makeRequest(
    `${API_BASE}/service/programs`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  
  if (getProgramsStatus === 200) {
    log(`  ✅ GET Programs réussi - ${getProgramsData.data.programs?.length || 0} programmes trouvés`, colors.green)
  } else {
    log(`  ❌ GET Programs échoué - Status: ${getProgramsStatus}`, colors.red)
  }
  
  // POST - Nouveau programme
  log('  POST /api/service/programs', colors.blue)
  const newProgram = {
    name: 'Test Program',
    description: 'Programme de test',
    frequency: 'monthly',
    active: true
  }
  
  const { status: postProgramStatus, data: postProgramData } = await makeRequest(
    `${API_BASE}/service/programs`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(newProgram)
    }
  )
  
  if (postProgramStatus === 201) {
    log(`  ✅ POST Program réussi - ID: ${postProgramData.data.id}`, colors.green)
    return postProgramData.data.id
  } else {
    log(`  ❌ POST Program échoué - Status: ${postProgramStatus}`, colors.red)
    log(`     Réponse: ${JSON.stringify(postProgramData, null, 2)}`, colors.red)
    return null
  }
}

// Test des APIs Service Entries
async function testServiceEntries(token) {
  log('\n🔍 Test des APIs Service Entries', colors.cyan)
  
  // GET - Liste des entrées de service
  log('  GET /api/service/entries', colors.blue)
  const { status: getEntriesStatus, data: getEntriesData } = await makeRequest(
    `${API_BASE}/service/entries`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  
  if (getEntriesStatus === 200) {
    log(`  ✅ GET Entries réussi - ${getEntriesData.data.entries?.length || 0} entrées trouvées`, colors.green)
  } else {
    log(`  ❌ GET Entries échoué - Status: ${getEntriesStatus}`, colors.red)
  }
  
  // POST - Nouvelle entrée de service (work order)
  log('  POST /api/service/entries (Work Order)', colors.blue)
  const newEntry = {
    vehicleId: 'test-vehicle-1',
    date: new Date().toISOString(),
    status: 'SCHEDULED',
    totalCost: 150.00,
    priority: 'MEDIUM',
    isWorkOrder: true,
    notes: 'Test work order from API test'
  }
  
  const { status: postEntryStatus, data: postEntryData } = await makeRequest(
    `${API_BASE}/service/entries`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(newEntry)
    }
  )
  
  if (postEntryStatus === 201) {
    log(`  ✅ POST Entry réussi - ID: ${postEntryData.data.id}`, colors.green)
    return postEntryData.data.id
  } else {
    log(`  ❌ POST Entry échoué - Status: ${postEntryStatus}`, colors.red)
    log(`     Réponse: ${JSON.stringify(postEntryData, null, 2)}`, colors.red)
    return null
  }
}

// Test des APIs Service Reminders
async function testServiceReminders(token) {
  log('\n🔍 Test des APIs Service Reminders', colors.cyan)
  
  // GET - Liste des rappels
  log('  GET /api/service/reminders', colors.blue)
  const { status: getRemindersStatus, data: getRemindersData } = await makeRequest(
    `${API_BASE}/service/reminders`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  
  if (getRemindersStatus === 200) {
    log(`  ✅ GET Reminders réussi - ${getRemindersData.data.reminders?.length || 0} rappels trouvés`, colors.green)
  } else {
    log(`  ❌ GET Reminders échoué - Status: ${getRemindersStatus}`, colors.red)
  }
  
  // POST - Nouveau rappel
  log('  POST /api/service/reminders', colors.blue)
  const newReminder = {
    vehicleId: 'test-vehicle-1',
    task: 'Test Reminder Task',
    nextDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 jours
    type: 'PREVENTIVE'
  }
  
  const { status: postReminderStatus, data: postReminderData } = await makeRequest(
    `${API_BASE}/service/reminders`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(newReminder)
    }
  )
  
  if (postReminderStatus === 201) {
    log(`  ✅ POST Reminder réussi - ID: ${postReminderData.data.id}`, colors.green)
    return postReminderData.data.id
  } else {
    log(`  ❌ POST Reminder échoué - Status: ${postReminderStatus}`, colors.red)
    log(`     Réponse: ${JSON.stringify(postReminderData, null, 2)}`, colors.red)
    return null
  }
}

// Fonction principale de test
async function runTests() {
  log('🚀 Démarrage des tests des APIs Service', colors.bright)
  log(`URL de base: ${BASE_URL}`, colors.blue)
  
  try {
    // Créer un utilisateur de test
    const token = await createTestUser()
    
    if (!token) {
      log('❌ Impossible d\'obtenir un token d\'authentification', colors.red)
      process.exit(1)
    }
    
    // Tester les APIs
    await testServiceTasks(token)
    await testParts(token)
    await testServicePrograms(token)
    await testServiceEntries(token)
    await testServiceReminders(token)
    
    log('\n✅ Tests des APIs Service terminés', colors.green)
    
  } catch (error) {
    log(`❌ Erreur durant les tests: ${error.message}`, colors.red)
    process.exit(1)
  }
}

// Vérifier si le serveur est accessible
async function checkServer() {
  log('🔍 Vérification de la disponibilité du serveur...', colors.blue)
  
  try {
    const response = await fetch(BASE_URL)
    if (response.ok) {
      log('✅ Serveur accessible', colors.green)
      return true
    } else {
      log(`⚠️  Serveur répond avec status: ${response.status}`, colors.yellow)
      return false
    }
  } catch (error) {
    log(`❌ Serveur non accessible: ${error.message}`, colors.red)
    log('💡 Assurez-vous que le serveur Next.js est en cours d\'exécution', colors.yellow)
    return false
  }
}

// Point d'entrée
async function main() {
  const serverRunning = await checkServer()
  
  if (!serverRunning) {
    log('💡 Pour démarrer le serveur:', colors.cyan)
    log('   npm run dev', colors.yellow)
    process.exit(1)
  }
  
  await runTests()
}

// Exécuter les tests
if (require.main === module) {
  main()
}

module.exports = {
  makeRequest,
  getTestToken,
  createTestUser,
  testServiceTasks,
  testParts,
  testServicePrograms,
  testServiceEntries
}