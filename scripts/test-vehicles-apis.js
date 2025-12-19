#!/usr/bin/env node

/**
 * Script de test automatisé pour les APIs Vehicles
 * Tests CRUD complets pour tous les endpoints véhicules
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const TEST_TIMEOUT = 30000;

// Variables globales
let authToken = null;
let testVehicleId = null;
let testMeterEntryId = null;
let testExpenseEntryId = null;
let testAssignmentId = null;

// Fonction utilitaire pour les logs
const log = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  console.log(logMessage);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

// Fonction pour attendre
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Classe pour les tests
class VehiclesAPITester {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.total = 0;
  }

  // Méthode de test générique
  async test(name, testFn) {
    this.total++;
    try {
      log('INFO', `🔄 Running test: ${name}`);
      await testFn();
      this.passed++;
      log('SUCCESS', `✅ PASSED: ${name}`);
    } catch (error) {
      this.failed++;
      log('ERROR', `❌ FAILED: ${name} - ${error.message}`);
      if (error.response) {
        log('ERROR', `Status: ${error.response.status}`);
        log('ERROR', `Response: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
  }

  // Assertion simple
  assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  // Vérification de réponse
  assertResponse(response, expectedStatus = 200) {
    this.assert(
      response.status === expectedStatus,
      `Expected status ${expectedStatus}, got ${response.status}`
    );
    this.assert(
      response.data.success === true,
      `Expected success=true, got ${response.data.success}`
    );
  }

  // Affichage du résumé
  printSummary() {
    log('INFO', `\n📊 TEST SUMMARY:`);
    log('INFO', `Total tests: ${this.total}`);
    log('SUCCESS', `Passed: ${this.passed}`);
    log('ERROR', `Failed: ${this.failed}`);
    log('INFO', `Success rate: ${((this.passed / this.total) * 100).toFixed(1)}%`);
    
    if (this.failed === 0) {
      log('SUCCESS', `\n🎉 ALL TESTS PASSED! 🎉`);
    } else {
      log('ERROR', `\n💥 SOME TESTS FAILED! 💥`);
    }
  }
}

// Tests d'authentification
async function testAuth(tester) {
  await tester.test('POST /api/auth/login - Connexion utilisateur test', async () => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'test@fleetmada.com',
        password: 'test123'
      }, {
        timeout: TEST_TIMEOUT
      });

      if (response.data.success) {
        authToken = response.data.data.token;
        log('INFO', `Auth token obtained: ${authToken.substring(0, 20)}...`);
      } else {
        // Si la connexion échoue, on essaie de créer un utilisateur de test
        log('INFO', 'Login failed, attempting to create test user...');
        await createTestUser(tester);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        log('INFO', 'Login failed, creating test user...');
        await createTestUser(tester);
      } else {
        throw error;
      }
    }
  });
}

// Création d'un utilisateur de test
async function createTestUser(tester) {
  try {
    // Enregistrement
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test User',
      email: 'test@fleetmada.com',
      password: 'test123'
    }, {
      timeout: TEST_TIMEOUT
    });

    if (registerResponse.data.success) {
      log('INFO', 'Test user created successfully');
    }

    // Connexion
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@fleetmada.com',
      password: 'test123'
    }, {
      timeout: TEST_TIMEOUT
    });

    if (loginResponse.data.success) {
      authToken = loginResponse.data.data.token;
      log('INFO', `Auth token obtained: ${authToken.substring(0, 20)}...`);
    }
  } catch (error) {
    log('ERROR', 'Failed to create test user:', error.message);
    throw error;
  }
}

// Headers d'authentification
function getAuthHeaders() {
  return {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };
}

// Tests des APIs Vehicles CRUD
async function testVehiclesCRUD(tester) {
  const testVehicle = {
    name: 'Test Vehicle F-150',
    vin: '1FTFW1E45MFA12345',
    type: 'Truck',
    year: 2021,
    make: 'Ford',
    model: 'F-150',
    status: 'ACTIVE',
    ownership: 'Owned',
    labels: ['Test', 'Fleet'],
    primaryMeter: 'Miles',
    fuelUnit: 'Gallons (US)',
    measurementUnits: 'Imperial',
    loanLeaseType: 'None'
  };

  await tester.test('GET /api/vehicles - Liste véhicules (vide)', async () => {
    const response = await axios.get(`${BASE_URL}/vehicles`, {
      headers: getAuthHeaders(),
      timeout: TEST_TIMEOUT
    });

    tester.assertResponse(response, 200);
    tester.assert(Array.isArray(response.data.data.vehicles), 'Expected vehicles array');
    log('INFO', `Found ${response.data.data.vehicles.length} vehicles`);
  });

  await tester.test('POST /api/vehicles - Création véhicule', async () => {
    const response = await axios.post(`${BASE_URL}/vehicles`, testVehicle, {
      headers: getAuthHeaders(),
      timeout: TEST_TIMEOUT
    });

    tester.assertResponse(response, 201);
    tester.assert(response.data.data.id, 'Expected vehicle ID');
    testVehicleId = response.data.data.id;
    log('INFO', `Created vehicle with ID: ${testVehicleId}`);
  });

  await tester.test('GET /api/vehicles - Liste véhicules (avec véhicule)', async () => {
    const response = await axios.get(`${BASE_URL}/vehicles`, {
      headers: getAuthHeaders(),
      timeout: TEST_TIMEOUT
    });

    tester.assertResponse(response, 200);
    tester.assert(response.data.data.vehicles.length > 0, 'Expected vehicles array');
    const vehicle = response.data.data.vehicles.find(v => v.id === testVehicleId);
    tester.assert(vehicle, 'Expected created vehicle in list');
    log('INFO', `Found ${response.data.data.vehicles.length} vehicles`);
  });

  await tester.test('GET /api/vehicles/[id] - Détails véhicule', async () => {
    const response = await axios.get(`${BASE_URL}/vehicles/${testVehicleId}`, {
      headers: getAuthHeaders(),
      timeout: TEST_TIMEOUT
    });

    tester.assertResponse(response, 200);
    tester.assert(response.data.data.id === testVehicleId, 'Expected correct vehicle ID');
    tester.assert(response.data.data.name === testVehicle.name, 'Expected correct vehicle name');
  });

  await tester.test('PUT /api/vehicles/[id] - Modification véhicule', async () => {
    const updateData = {
      name: 'Updated Test Vehicle F-150',
      status: 'MAINTENANCE',
      labels: ['Test', 'Updated', 'Fleet']
    };

    const response = await axios.put(`${BASE_URL}/vehicles/${testVehicleId}`, updateData, {
      headers: getAuthHeaders(),
      timeout: TEST_TIMEOUT
    });

    tester.assertResponse(response, 200);
    tester.assert(response.data.data.name === updateData.name, 'Expected updated name');
    tester.assert(response.data.data.status === updateData.status, 'Expected updated status');
  });
}

// Tests des APIs Meter Entries
async function testMeterEntries(tester) {
  const testMeterEntry = {
    vehicleId: testVehicleId,
    date: new Date().toISOString(),
    value: 50000,
    type: 'MILEAGE',
    unit: 'mi',
    source: 'Manual Entry'
  };

  await tester.test('POST /api/vehicles/[id]/meter-entries - Nouvelle lecture', async () => {
    const response = await axios.post(`${BASE_URL}/vehicles/${testVehicleId}/meter-entries`, testMeterEntry, {
      headers: getAuthHeaders(),
      timeout: TEST_TIMEOUT
    });

    tester.assertResponse(response, 201);
    tester.assert(response.data.data.id, 'Expected meter entry ID');
    testMeterEntryId = response.data.data.id;
    log('INFO', `Created meter entry with ID: ${testMeterEntryId}`);
  });

  await tester.test('GET /api/vehicles/[id]/meter-entries - Liste lectures', async () => {
    const response = await axios.get(`${BASE_URL}/vehicles/${testVehicleId}/meter-entries`, {
      headers: getAuthHeaders(),
      timeout: TEST_TIMEOUT
    });

    tester.assertResponse(response, 200);
    tester.assert(Array.isArray(response.data.data.meterEntries), 'Expected meter entries array');
    const entry = response.data.data.meterEntries.find(e => e.id === testMeterEntryId);
    tester.assert(entry, 'Expected created meter entry in list');
    log('INFO', `Found ${response.data.data.meterEntries.length} meter entries`);
  });

  await tester.test('GET /api/vehicles/[id]/meter-entries/[entryId] - Détails lecture', async () => {
    const response = await axios.get(`${BASE_URL}/vehicles/${testVehicleId}/meter-entries/${testMeterEntryId}`, {
      headers: getAuthHeaders(),
      timeout: TEST_TIMEOUT
    });

    tester.assertResponse(response, 200);
    tester.assert(response.data.data.id === testMeterEntryId, 'Expected correct meter entry ID');
  });

  await tester.test('PUT /api/vehicles/[id]/meter-entries/[entryId] - Modification lecture', async () => {
    const updateData = {
      value: 50050,
      notes: 'Updated reading'
    };

    const response = await axios.put(`${BASE_URL}/vehicles/${testVehicleId}/meter-entries/${testMeterEntryId}`, updateData, {
      headers: getAuthHeaders(),
      timeout: TEST_TIMEOUT
    });

    tester.assertResponse(response, 200);
    tester.assert(response.data.data.value === updateData.value, 'Expected updated value');
  });
}

// Tests des APIs Expenses
async function testExpenses(tester) {
  const testExpense = {
    vehicleId: testVehicleId,
    date: new Date().toISOString(),
    type: 'Fuel',
    vendor: 'Shell',
    source: 'Manual Entry',
    amount: 75.50,
    currency: 'USD',
    notes: 'Tank refill'
  };

  await tester.test('POST /api/vehicles/[id]/expenses - Nouvelle dépense', async () => {
    const response = await axios.post(`${BASE_URL}/vehicles/${testVehicleId}/expenses`, testExpense, {
      headers: getAuthHeaders(),
      timeout: TEST_TIMEOUT
    });

    tester.assertResponse(response, 201);
    tester.assert(response.data.data.id, 'Expected expense ID');
    testExpenseEntryId = response.data.data.id;
    log('INFO', `Created expense with ID: ${testExpenseEntryId}`);
  });

  await tester.test('GET /api/vehicles/[id]/expenses - Liste dépenses', async () => {
    const response = await axios.get(`${BASE_URL}/vehicles/${testVehicleId}/expenses`, {
      headers: getAuthHeaders(),
      timeout: TEST_TIMEOUT
    });

    tester.assertResponse(response, 200);
    tester.assert(Array.isArray(response.data.data.expenses), 'Expected expenses array');
    const expense = response.data.data.expenses.find(e => e.id === testExpenseEntryId);
    tester.assert(expense, 'Expected created expense in list');
    tester.assert(response.data.data.stats, 'Expected stats object');
    log('INFO', `Found ${response.data.data.expenses.length} expenses`);
  });

  await tester.test('GET /api/vehicles/[id]/expenses/[expenseId] - Détails dépense', async () => {
    const response = await axios.get(`${BASE_URL}/vehicles/${testVehicleId}/expenses/${testExpenseEntryId}`, {
      headers: getAuthHeaders(),
      timeout: TEST_TIMEOUT
    });

    tester.assertResponse(response, 200);
    tester.assert(response.data.data.id === testExpenseEntryId, 'Expected correct expense ID');
  });

  await tester.test('PUT /api/vehicles/[id]/expenses/[expenseId] - Modification dépense', async () => {
    const updateData = {
      amount: 80.00,
      notes: 'Updated fuel cost'
    };

    const response = await axios.put(`${BASE_URL}/vehicles/${testVehicleId}/expenses/${testExpenseEntryId}`, updateData, {
      headers: getAuthHeaders(),
      timeout: TEST_TIMEOUT
    });

    tester.assertResponse(response, 200);
    tester.assert(response.data.data.amount === updateData.amount, 'Expected updated amount');
  });
}

// Tests des APIs Assignments
async function testAssignments(tester) {
  const testAssignment = {
    vehicleId: testVehicleId,
    operator: 'John Doe',
    startDate: new Date().toISOString(),
    status: 'ACTIVE'
  };

  await tester.test('POST /api/vehicles/[id]/assignments - Nouvelle assignation', async () => {
    const response = await axios.post(`${BASE_URL}/vehicles/${testVehicleId}/assignments`, testAssignment, {
      headers: getAuthHeaders(),
      timeout: TEST_TIMEOUT
    });

    tester.assertResponse(response, 201);
    tester.assert(response.data.data.id, 'Expected assignment ID');
    testAssignmentId = response.data.data.id;
    log('INFO', `Created assignment with ID: ${testAssignmentId}`);
  });

  await tester.test('GET /api/vehicles/[id]/assignments - Liste assignations', async () => {
    const response = await axios.get(`${BASE_URL}/vehicles/${testVehicleId}/assignments`, {
      headers: getAuthHeaders(),
      timeout: TEST_TIMEOUT
    });

    tester.assertResponse(response, 200);
    tester.assert(Array.isArray(response.data.data.assignments), 'Expected assignments array');
    const assignment = response.data.data.assignments.find(a => a.id === testAssignmentId);
    tester.assert(assignment, 'Expected created assignment in list');
    tester.assert(response.data.data.stats, 'Expected stats object');
    log('INFO', `Found ${response.data.data.assignments.length} assignments`);
  });
}

// Tests de nettoyage
async function testCleanup(tester) {
  if (testExpenseEntryId) {
    await tester.test('DELETE /api/vehicles/[id]/expenses/[expenseId] - Suppression dépense', async () => {
      const response = await axios.delete(`${BASE_URL}/vehicles/${testVehicleId}/expenses/${testExpenseEntryId}`, {
        headers: getAuthHeaders(),
        timeout: TEST_TIMEOUT
      });

      tester.assertResponse(response, 200);
      log('INFO', 'Expense deleted successfully');
    });
  }

  if (testMeterEntryId) {
    await tester.test('DELETE /api/vehicles/[id]/meter-entries/[entryId] - Suppression lecture', async () => {
      const response = await axios.delete(`${BASE_URL}/vehicles/${testVehicleId}/meter-entries/${testMeterEntryId}`, {
        headers: getAuthHeaders(),
        timeout: TEST_TIMEOUT
      });

      tester.assertResponse(response, 200);
      log('INFO', 'Meter entry deleted successfully');
    });
  }

  if (testVehicleId) {
    await tester.test('DELETE /api/vehicles/[id] - Suppression véhicule', async () => {
      const response = await axios.delete(`${BASE_URL}/vehicles/${testVehicleId}`, {
        headers: getAuthHeaders(),
        timeout: TEST_TIMEOUT
      });

      tester.assertResponse(response, 200);
      log('INFO', 'Vehicle deleted successfully');
    });
  }
}

// Tests de validation et d'erreurs
async function testValidation(tester) {
  await tester.test('POST /api/vehicles - Validation VIN duplicate', async () => {
    const duplicateVehicle = {
      name: 'Duplicate VIN Vehicle',
      vin: '1FTFW1E45MFA12345', // Same VIN as test vehicle
      type: 'Car',
      year: 2020,
      make: 'Toyota',
      model: 'Camry'
    };

    try {
      await axios.post(`${BASE_URL}/vehicles`, duplicateVehicle, {
        headers: getAuthHeaders(),
        timeout: TEST_TIMEOUT
      });
      throw new Error('Expected 409 conflict error');
    } catch (error) {
      tester.assert(error.response?.status === 409, 'Expected 409 conflict status');
      log('INFO', 'Duplicate VIN validation working correctly');
    }
  });

  await tester.test('POST /api/vehicles - Validation données manquantes', async () => {
    const invalidVehicle = {
      name: '', // Empty name
      vin: '',  // Empty VIN
      type: ''  // Empty type
    };

    try {
      await axios.post(`${BASE_URL}/vehicles`, invalidVehicle, {
        headers: getAuthHeaders(),
        timeout: TEST_TIMEOUT
      });
      throw new Error('Expected validation error');
    } catch (error) {
      tester.assert(error.response?.status === 400, 'Expected 400 validation status');
      log('INFO', 'Validation working correctly');
    }
  });

  await tester.test('GET /api/vehicles/[id] - Accès véhicule inexistant', async () => {
    try {
      await axios.get(`${BASE_URL}/vehicles/nonexistent-id`, {
        headers: getAuthHeaders(),
        timeout: TEST_TIMEOUT
      });
      throw new Error('Expected 404 error');
    } catch (error) {
      tester.assert(error.response?.status === 404, 'Expected 404 status');
      log('INFO', '404 handling working correctly');
    }
  });

  await tester.test('GET /api/vehicles - Sans token d\'authentification', async () => {
    try {
      await axios.get(`${BASE_URL}/vehicles`, {
        timeout: TEST_TIMEOUT
      });
      throw new Error('Expected 401 error');
    } catch (error) {
      tester.assert(error.response?.status === 401, 'Expected 401 status');
      log('INFO', 'Authentication working correctly');
    }
  });
}

// Fonction principale
async function main() {
  log('INFO', '🚀 Starting Vehicles APIs Testing Suite');
  log('INFO', `📍 Base URL: ${BASE_URL}`);

  const tester = new VehiclesAPITester();

  try {
    // Tests d'authentification
    await testAuth(tester);

    if (!authToken) {
      throw new Error('No authentication token available');
    }

    // Tests CRUD complets
    await testVehiclesCRUD(tester);
    await testMeterEntries(tester);
    await testExpenses(tester);
    await testAssignments(tester);

    // Tests de validation
    await testValidation(tester);

    // Tests de nettoyage
    await testCleanup(tester);

  } catch (error) {
    log('ERROR', 'Fatal error during testing:', error.message);
    process.exit(1);
  }

  // Affichage du résumé
  tester.printSummary();

  // Code de sortie
  process.exit(tester.failed > 0 ? 1 : 0);
}

// Lancement des tests
if (require.main === module) {
  main().catch(error => {
    log('ERROR', 'Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { VehiclesAPITester, main };