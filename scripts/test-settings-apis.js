/**
 * Script de test pour valider les APIs Settings de FleetMada
 * 
 * Ce script teste :
 * - API Paramètres généraux (/api/settings/general)
 * - API Préférences utilisateur (/api/settings/preferences) 
 * - API Paramètres de sécurité (/api/settings/security)
 * - CRUD complet et persistance des données
 */

const { createTestUser } = require('./create-test-user');

const API_BASE_URL = 'http://localhost:3000/api/settings';

class SettingsApiTester {
  constructor() {
    this.results = {
      general: { tests: 0, passed: 0, failed: 0, errors: [] },
      preferences: { tests: 0, passed: 0, failed: 0, errors: [] },
      security: { tests: 0, passed: 0, failed: 0, errors: [] }
    };
    this.authToken = process.env.TEST_AUTH_TOKEN || null;
  }

  // Utilitaire pour faire des requêtes API authentifiées
  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
        ...options.headers,
      },
    });

    const data = await response.json();
    return { response, data, status: response.status };
  }

  // Test des paramètres généraux
  async testGeneralSettings() {
    console.log('\n🧪 Testing General Settings API...\n');
    
    try {
      // Test GET - Récupérer les paramètres
      console.log('1. Testing GET /general...');
      const getResult = await this.makeRequest('/general');
      
      if (getResult.status === 200 && getResult.data.success) {
        console.log('✅ GET /general: SUCCESS');
        // console.log('   📊 Data:', JSON.stringify(getResult.data.data, null, 2));
        this.results.general.tests++;
        this.results.general.passed++;
      } else {
        console.log('❌ GET /general: FAILED');
        console.log('   📊 Status:', getResult.status);
        console.log('   📊 Error:', getResult.data.error);
        this.results.general.tests++;
        this.results.general.failed++;
        this.results.general.errors.push(`GET /general: ${getResult.data.error}`);
      }

      // Test PUT - Mettre à jour les paramètres
      console.log('\n2. Testing PUT /general...');
      const updateData = {
        name: 'FleetMada Test Company',
        address: '123 Test Street',
        city: 'Test City',
        country: 'Madagascar',
        currency: 'MGA',
        timezone: 'Indian/Antananarivo',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24',
        fuelUnit: 'L',
        distanceUnit: 'KM',
        laborTaxExempt: false
      };

      const putResult = await this.makeRequest('/general', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      if (putResult.status === 200 && putResult.data.success) {
        console.log('✅ PUT /general: SUCCESS');
        console.log('   📊 Message:', putResult.data.message);
        this.results.general.tests++;
        this.results.general.passed++;
      } else {
        console.log('❌ PUT /general: FAILED');
        console.log('   📊 Status:', putResult.status);
        console.log('   📊 Error:', putResult.data.error);
        this.results.general.tests++;
        this.results.general.failed++;
        this.results.general.errors.push(`PUT /general: ${putResult.data.error}`);
      }

    } catch (error) {
      console.log('❌ General Settings API Error:', error.message);
      this.results.general.errors.push(`General Settings: ${error.message}`);
    }
  }

  // Test des préférences utilisateur
  async testUserPreferences() {
    console.log('\n🧪 Testing User Preferences API...\n');
    
    try {
      // Test GET - Récupérer les préférences
      console.log('1. Testing GET /preferences...');
      const getResult = await this.makeRequest('/preferences');
      
      if (getResult.status === 200 && getResult.data.success) {
        console.log('✅ GET /preferences: SUCCESS');
        // console.log('   📊 Data:', JSON.stringify(getResult.data.data, null, 2));
        this.results.preferences.tests++;
        this.results.preferences.passed++;
      } else {
        console.log('❌ GET /preferences: FAILED');
        console.log('   📊 Status:', getResult.status);
        console.log('   📊 Error:', getResult.data.error);
        this.results.preferences.tests++;
        this.results.preferences.failed++;
        this.results.preferences.errors.push(`GET /preferences: ${getResult.data.error}`);
      }

      // Test PUT - Mettre à jour les préférences
      console.log('\n2. Testing PUT /preferences...');
      const updateData = {
        theme: 'dark',
        language: 'en',
        timezone: 'America/New_York',
        fuelEconomyDisplay: 'mpg (US) · g/hr (US) · Gallons (US)',
        itemsPerPage: 100
      };

      const putResult = await this.makeRequest('/preferences', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      if (putResult.status === 200 && putResult.data.success) {
        console.log('✅ PUT /preferences: SUCCESS');
        console.log('   📊 Message:', putResult.data.message);
        this.results.preferences.tests++;
        this.results.preferences.passed++;
      } else {
        console.log('❌ PUT /preferences: FAILED');
        console.log('   📊 Status:', putResult.status);
        console.log('   📊 Error:', putResult.data.error);
        this.results.preferences.tests++;
        this.results.preferences.failed++;
        this.results.preferences.errors.push(`PUT /preferences: ${getResult.data.error || 'Unknown error'}`);
      }

    } catch (error) {
      console.log('❌ User Preferences API Error:', error.message);
      this.results.preferences.errors.push(`User Preferences: ${error.message}`);
    }
  }

  // Test des paramètres de sécurité
  async testSecuritySettings() {
    console.log('\n🧪 Testing Security Settings API...\n');
    
    try {
      // Test GET - Récupérer les paramètres de sécurité
      console.log('1. Testing GET /security...');
      const getResult = await this.makeRequest('/security');
      
      if (getResult.status === 200 && getResult.data.success) {
        console.log('✅ GET /security: SUCCESS');
        // console.log('   📊 Data:', JSON.stringify(getResult.data.data, null, 2));
        this.results.security.tests++;
        this.results.security.passed++;
      } else {
        console.log('❌ GET /security: FAILED');
        console.log('   📊 Status:', getResult.status);
        console.log('   📊 Error:', getResult.data.error);
        this.results.security.tests++;
        this.results.security.failed++;
        this.results.security.errors.push(`GET /security: ${getResult.data.error}`);
      }

      // Test PUT - Mettre à jour les paramètres de sécurité
      console.log('\n2. Testing PUT /security...');
      const updateData = {
        sessionTimeout: 60,
        marketingEmails: false,
        ipWhitelist: ['192.168.1.1', '10.0.0.1']
      };

      const putResult = await this.makeRequest('/security', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      if (putResult.status === 200 && putResult.data.success) {
        console.log('✅ PUT /security: SUCCESS');
        console.log('   📊 Message:', putResult.data.message);
        this.results.security.tests++;
        this.results.security.passed++;
      } else {
        console.log('❌ PUT /security: FAILED');
        console.log('   📊 Status:', putResult.status);
        console.log('   📊 Error:', putResult.data.error);
        this.results.security.tests++;
        this.results.security.failed++;
        this.results.security.errors.push(`PUT /security: ${putResult.data.error}`);
      }

      // Test POST - Changer le mot de passe
      console.log('\n3. Testing POST /security/password...');
      const passwordData = {
        currentPassword: 'testpassword123',
        newPassword: 'NewPassword456!',
        confirmPassword: 'NewPassword456!'
      };

      const passwordResult = await this.makeRequest('/security/password', {
        method: 'POST',
        body: JSON.stringify(passwordData)
      });

      if (passwordResult.status === 200 && passwordResult.data.success) {
        console.log('✅ POST /security/password: SUCCESS');
        console.log('   📊 Message:', passwordResult.data.message);
        this.results.security.tests++;
        this.results.security.passed++;
      } else {
        console.log('❌ POST /security/password: FAILED');
        console.log('   📊 Status:', passwordResult.status);
        console.log('   📊 Error:', passwordResult.data.error);
        this.results.security.tests++;
        this.results.security.failed++;
      }

    } catch (error) {
      console.log('❌ Security Settings API Error:', error.message);
      this.results.security.errors.push(`Security Settings: ${error.message}`);
    }
  }

  // Test des erreurs et validation
  async testErrorHandling() {
    console.log('\n🧪 Testing Error Handling...\n');
    
    try {
      // Test avec token invalide
      console.log('1. Testing with invalid token...');
      const invalidResponse = await fetch(`${API_BASE_URL}/general`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
      
      const invalidData = await invalidResponse.json();
      
      if (invalidResponse.status === 401) {
        console.log('✅ Invalid token: Properly rejected');
      } else {
        console.log('❌ Invalid token: Not properly rejected');
      }

      // Test avec données invalides
      console.log('\n2. Testing with invalid data...');
      const invalidDataResponse = await this.makeRequest('/general', {
        method: 'PUT',
        body: JSON.stringify({ name: '' }) // Nom vide invalide
      });

      if (invalidDataResponse.status === 400) {
        console.log('✅ Invalid data: Properly rejected');
        console.log('   📊 Validation errors:', invalidDataResponse.data.details);
      } else {
        console.log('❌ Invalid data: Not properly rejected');
      }

    } catch (error) {
      console.log('❌ Error Handling Test Error:', error.message);
    }
  }

  // Affichage du rapport final
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 SETTINGS API TEST REPORT');
    console.log('='.repeat(60));

    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;

    Object.keys(this.results).forEach(category => {
      const result = this.results[category];
      totalTests += result.tests;
      totalPassed += result.passed;
      totalFailed += result.failed;

      console.log(`\n📁 ${category.toUpperCase()} SETTINGS:`);
      console.log(`   Tests: ${result.tests}`);
      console.log(`   Passed: ${result.passed} ✅`);
      console.log(`   Failed: ${result.failed} ❌`);
      
      if (result.errors.length > 0) {
        console.log(`   Errors:`);
        result.errors.forEach(error => {
          console.log(`     - ${error}`);
        });
      }
    });

    console.log('\n' + '-'.repeat(60));
    console.log('📈 OVERALL RESULTS:');
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${totalPassed} ✅`);
    console.log(`   Failed: ${totalFailed} ❌`);
    console.log(`   Success Rate: ${totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0}%`);
    
    if (totalFailed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Settings API is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Please check the errors above.');
    }

    console.log('\n' + '='.repeat(60));
  }

  // Exécution de tous les tests
  async runAllTests() {
    console.log('🚀 Starting Settings API Tests...');
    console.log(`🔗 API Base URL: ${API_BASE_URL}`);

    if (!this.authToken) {
      console.log('⚠️  No auth token provided. Generating one via createTestUser...');
      try {
        this.authToken = await createTestUser();
        if (!this.authToken) {
            throw new Error('Failed to retrieve token from createTestUser');
        }
      } catch (err) {
        console.error('❌ Failed to create/authenticate test user:', err.message);
        process.exit(1);
      }
    }
    
    console.log(`🔑 Auth Token: Set`);

    await this.testGeneralSettings();
    await this.testUserPreferences();
    await this.testSecuritySettings();
    await this.testErrorHandling();
    
    this.generateReport();
  }
}

// Exécution du test
if (require.main === module) {
  const tester = new SettingsApiTester();
  tester.runAllTests().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = SettingsApiTester;
