#!/usr/bin/env node

/**
 * Test Suite Complet pour les APIs Documents FleetMada
 * 
 * Ce script teste toutes les fonctionnalités du module Documents :
 * - APIs CRUD (GET, POST, PUT, DELETE)
 * - Upload de fichiers (simple et multiple)
 * - Téléchargement sécurisé
 * - Recherche avancée
 * - Attachements aux autres modules
 * - Permissions et sécurité
 */

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api/documents`;

// Configuration des tests
const TEST_CONFIG = {
  timeout: 10000,
  retries: 3,
  maxFileSize: 10 * 1024 * 1024 // 10MB pour les tests
};

// Utilitaires de test
class TestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.total = 0;
    this.testResults = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type] || 'ℹ️';
    
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async test(name, testFunction) {
    this.total++;
    this.log(`Test: ${name}`);
    
    try {
      await testFunction();
      this.passed++;
      this.testResults.push({ name, status: 'PASSED', error: null });
      this.log(`✅ ${name}`, 'success');
    } catch (error) {
      this.failed++;
      this.testResults.push({ name, status: 'FAILED', error: error.message });
      this.log(`❌ ${name}: ${error.message}`, 'error');
    }
  }

  async runTestSuite(suiteName, tests) {
    this.log(`\n🚀 Début de la suite: ${suiteName}`);
    
    for (const [name, testFunction] of tests) {
      await this.test(name, testFunction);
    }
    
    this.log(`\n📊 Résultats de ${suiteName}:`, 'info');
    this.log(`✅ Réussis: ${this.passed}`);
    this.log(`❌ Échoués: ${this.failed}`);
    this.log(`📈 Total: ${this.total}`);
    
    return this.failed === 0;
  }

  generateReport() {
    const report = {
      summary: {
        total: this.total,
        passed: this.passed,
        failed: this.failed,
        successRate: ((this.passed / this.total) * 100).toFixed(2) + '%'
      },
      timestamp: new Date().toISOString(),
      results: this.testResults
    };
    
    console.log('\n📋 RAPPORT FINAL DE TEST');
    console.log('='.repeat(50));
    console.log(`Total des tests: ${report.summary.total}`);
    console.log(`Réussis: ${report.summary.passed}`);
    console.log(`Échoués: ${report.summary.failed}`);
    console.log(`Taux de réussite: ${report.summary.successRate}`);
    console.log('='.repeat(50));
    
    if (this.failed > 0) {
      console.log('\n❌ TESTS ÉCHOUÉS:');
      this.testResults
        .filter(test => test.status === 'FAILED')
        .forEach(test => console.log(`  - ${test.name}: ${test.error}`));
    }
    
    return report;
  }
}

// Utilitaires HTTP
class HTTPClient {
  static async request(url, options = {}) {
    const defaultOptions = {
      timeout: TEST_CONFIG.timeout,
      ...options
    };

    try {
      const response = await fetch(url, defaultOptions);
      const data = await response.json();
      
      return {
        status: response.status,
        ok: response.ok,
        data,
        headers: response.headers
      };
    } catch (error) {
      throw new Error(`Requête échouée: ${error.message}`);
    }
  }

  static async get(url, token = null) {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
    
    return this.request(url, { method: 'GET', headers });
  }

  static async post(url, body = null, token = null, isFormData = false) {
    const headers = isFormData ? {} : {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
    
    return this.request(url, {
      method: 'POST',
      headers,
      body: isFormData ? body : JSON.stringify(body)
    });
  }

  static async put(url, body = null, token = null) {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
    
    return this.request(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });
  }

  static async delete(url, token = null) {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
    
    return this.request(url, { method: 'DELETE', headers });
  }
}

// Gestionnaire d'authentification
class AuthManager {
  constructor() {
    this.token = null;
    this.user = null;
  }

  async login(email = 'test@fleetmada.com', password = 'test123') {
    try {
      const response = await HTTPClient.post(`${BASE_URL}/api/auth/login`, {
        email,
        password
      });

      if (response.ok && response.data.success) {
        this.token = response.data.token || response.data.accessToken;
        this.user = response.data.user;
        return true;
      } else {
        throw new Error(response.data.error || 'Échec de la connexion');
      }
    } catch (error) {
      // Si la connexion échoue, générer un token factice pour les tests
      this.token = 'fake-jwt-token-for-testing';
      this.user = { id: 'test-user-id', email, name: 'Test User' };
      return false;
    }
  }

  getToken() {
    return this.token;
  }
}

// Générateur de fichiers de test
class TestFileGenerator {
  static createTestFile(content = 'Test file content', name = 'test.txt') {
    return new File([content], name, { type: 'text/plain' });
  }

  static createTestImage(width = 100, height = 100, name = 'test-image.png') {
    // Création d'un canvas pour générer une image de test
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, width, height);
    
    return new File([canvas.toDataURL()], name, { type: 'image/png' });
  }

  static createTestPdf(content = 'Test PDF content', name = 'test.pdf') {
    // Pour les tests, on utilise un fichier texte avec extension PDF
    return new File([content], name, { type: 'application/pdf' });
  }
}

// Tests des APIs Documents
class DocumentsAPITests {
  constructor(authManager) {
    this.auth = authManager;
    this.testDocuments = [];
  }

  async testDocumentCRUD() {
    const tests = [];

    // Test: Récupération de la liste des documents
    tests.push(['Récupération liste documents', async () => {
      const response = await HTTPClient.get(`${API_BASE}`, this.auth.getToken());
      if (!response.ok) throw new Error(`Échec HTTP: ${response.status}`);
      if (!response.data.success) throw new Error(response.data.error);
    }]);

    // Test: Upload d'un document simple
    tests.push(['Upload document simple', async () => {
      const testFile = TestFileGenerator.createTestFile('Hello World', 'hello-world.txt');
      const formData = new FormData();
      formData.append('file', testFile);
      formData.append('description', 'Document de test');
      formData.append('labels', 'test,automated');
      
      const response = await HTTPClient.post(`${API_BASE}`, formData, this.auth.getToken(), true);
      if (!response.ok) throw new Error(`Échec HTTP: ${response.status}`);
      if (!response.data.success) throw new Error(response.data.error);
      
      if (response.data.data) {
        this.testDocuments.push(response.data.data);
      }
    }]);

    // Test: Récupération d'un document spécifique
    tests.push(['Récupération document spécifique', async () => {
      if (this.testDocuments.length === 0) throw new Error('Aucun document de test disponible');
      
      const documentId = this.testDocuments[0].id;
      const response = await HTTPClient.get(`${API_BASE}/${documentId}`, this.auth.getToken());
      if (!response.ok) throw new Error(`Échec HTTP: ${response.status}`);
      if (!response.data.success) throw new Error(response.data.error);
    }]);

    // Test: Mise à jour d'un document
    tests.push(['Mise à jour document', async () => {
      if (this.testDocuments.length === 0) throw new Error('Aucun document de test disponible');
      
      const documentId = this.testDocuments[0].id;
      const response = await HTTPClient.put(`${API_BASE}/${documentId}`, {
        description: 'Document de test modifié',
        labels: ['test', 'modified', 'automated']
      }, this.auth.getToken());
      if (!response.ok) throw new Error(`Échec HTTP: ${response.status}`);
      if (!response.data.success) throw new Error(response.data.error);
    }]);

    return tests;
  }

  async testDocumentUpload() {
    const tests = [];

    // Test: Upload multiple
    tests.push(['Upload multiple documents', async () => {
      const file1 = TestFileGenerator.createTestFile('Document 1', 'doc1.txt');
      const file2 = TestFileGenerator.createTestFile('Document 2', 'doc2.txt');
      
      const formData = new FormData();
      formData.append('files', file1);
      formData.append('files', file2);
      formData.append('description', 'Documents multiples de test');
      
      const response = await HTTPClient.post(`${API_BASE}/upload`, formData, this.auth.getToken(), true);
      if (!response.ok) throw new Error(`Échec HTTP: ${response.status}`);
      if (!response.data.success) throw new Error(response.data.error);
    }]);

    // Test: Upload avec types MIME valides
    tests.push(['Upload types MIME valides', async () => {
      const testCases = [
        { file: TestFileGenerator.createTestImage(), expectedType: 'image' },
        { file: TestFileGenerator.createTestPdf(), expectedType: 'pdf' },
        { file: TestFileGenerator.createTestFile(), expectedType: 'text' }
      ];

      for (const testCase of testCases) {
        const formData = new FormData();
        formData.append('file', testCase.file);
        
        const response = await HTTPClient.post(`${API_BASE}`, formData, this.auth.getToken(), true);
        if (!response.ok) throw new Error(`Échec HTTP: ${response.status}`);
        if (!response.data.success) throw new Error(response.data.error);
      }
    }]);

    // Test: Upload avec fichier trop volumineux (doit échouer)
    tests.push(['Rejet fichier trop volumineux', async () => {
      const largeContent = 'x'.repeat(TEST_CONFIG.maxFileSize + 1);
      const largeFile = TestFileGenerator.createTestFile(largeContent, 'large-file.txt');
      
      const formData = new FormData();
      formData.append('file', largeFile);
      
      const response = await HTTPClient.post(`${API_BASE}`, formData, this.auth.getToken(), true);
      if (response.ok) throw new Error('Le fichier volumineux aurait dû être rejeté');
      if (!response.data.error.includes('volumineux')) {
        throw new Error('Erreur attendue non reçue');
      }
    }]);

    return tests;
  }

  async testDocumentDownload() {
    const tests = [];

    // Test: Téléchargement d'un document
    tests.push(['Téléchargement document', async () => {
      if (this.testDocuments.length === 0) throw new Error('Aucun document de test disponible');
      
      const documentId = this.testDocuments[0].id;
      const response = await HTTPClient.get(`${API_BASE}/${documentId}/download`, this.auth.getToken());
      if (!response.ok) throw new Error(`Échec HTTP: ${response.status}`);
    }]);

    // Test: Accès refusé (document inexistant)
    tests.push(['Accès refusé document inexistant', async () => {
      const response = await HTTPClient.get(`${API_BASE}/nonexistent-id/download`, this.auth.getToken());
      if (response.ok) throw new Error('Accès aurait dû être refusé');
    }]);

    return tests;
  }

  async testDocumentSearch() {
    const tests = [];

    // Test: Recherche textuelle
    tests.push(['Recherche textuelle', async () => {
      const response = await HTTPClient.get(`${API_BASE}/search?search=test&limit=10`, this.auth.getToken());
      if (!response.ok) throw new Error(`Échec HTTP: ${response.status}`);
      if (!response.data.success) throw new Error(response.data.error);
    }]);

    // Test: Recherche avec filtres
    tests.push(['Recherche avec filtres', async () => {
      const response = await HTTPClient.get(
        `${API_BASE}/search?search=test&mimeTypes=text/plain&limit=10`, 
        this.auth.getToken()
      );
      if (!response.ok) throw new Error(`Échec HTTP: ${response.status}`);
      if (!response.data.success) throw new Error(response.data.error);
    }]);

    return tests;
  }

  async testDocumentAttachments() {
    const tests = [];

    // Test: Récupération documents attachés
    tests.push(['Récupération documents attachés', async () => {
      const response = await HTTPClient.get(
        `${API_BASE}/by-attachment?attachedTo=vehicle&attachedId=test-vehicle-id`, 
        this.auth.getToken()
      );
      if (!response.ok) throw new Error(`Échec HTTP: ${response.status}`);
      if (!response.data.success) throw new Error(response.data.error);
    }]);

    // Test: Attachement de document à une entité
    tests.push(['Attachement document', async () => {
      if (this.testDocuments.length === 0) throw new Error('Aucun document de test disponible');
      
      const documentId = this.testDocuments[0].id;
      const response = await HTTPClient.post(`${API_BASE}/by-attachment`, {
        documentIds: [documentId],
        attachedTo: 'vehicle',
        attachedId: 'test-vehicle-id'
      }, this.auth.getToken());
      if (!response.ok) throw new Error(`Échec HTTP: ${response.status}`);
      if (!response.data.success) throw new Error(response.data.error);
    }]);

    return tests;
  }

  async testSecurityAndPermissions() {
    const tests = [];

    // Test: Accès sans token
    tests.push(['Accès sans token', async () => {
      const response = await HTTPClient.get(`${API_BASE}`);
      if (response.ok) throw new Error('Accès aurait dû être refusé sans token');
    }]);

    // Test: Token invalide
    tests.push(['Token invalide', async () => {
      const response = await HTTPClient.get(`${API_BASE}`, 'invalid-token');
      if (response.ok) throw new Error('Accès aurait dû être refusé avec un token invalide');
    }]);

    // Test: Suppression document (cleanup)
    tests.push(['Suppression document cleanup', async () => {
      for (const document of this.testDocuments) {
        try {
          await HTTPClient.delete(`${API_BASE}/${document.id}`, this.auth.getToken());
        } catch (error) {
          // Ignorer les erreurs de suppression lors du cleanup
        }
      }
    }]);

    return tests;
  }
}

// Fonction principale
async function main() {
  const runner = new TestRunner();
  const auth = new AuthManager();

  try {
    console.log('🚀 Démarrage des tests des APIs Documents FleetMada');
    console.log(`📍 URL de base: ${BASE_URL}`);
    console.log(`⏱️ Timeout: ${TEST_CONFIG.timeout}ms`);
    console.log('');

    // Connexion pour les tests
    await runner.test('Connexion utilisateur', async () => {
      const loggedIn = await auth.login();
      if (!loggedIn) {
        runner.log('⚠️ Connexion échouée, utilisation d\'un token factice', 'warning');
      }
    });

    // Tests des APIs Documents
    const documentsTests = new DocumentsAPITests(auth);

    // Exécution de toutes les suites de tests
    const suites = [
      ['Tests CRUD Documents', await documentsTests.testDocumentCRUD()],
      ['Tests Upload Documents', await documentsTests.testDocumentUpload()],
      ['Tests Téléchargement Documents', await documentsTests.testDocumentDownload()],
      ['Tests Recherche Documents', await documentsTests.testDocumentSearch()],
      ['Tests Attachements Documents', await documentsTests.testDocumentAttachments()],
      ['Tests Sécurité Documents', await documentsTests.testSecurityAndPermissions()]
    ];

    for (const [suiteName, tests] of suites) {
      const success = await runner.runTestSuite(suiteName, tests);
      if (!success) {
        runner.log(`⚠️ Suite ${suiteName} contient des échecs`, 'warning');
      }
    }

    // Génération du rapport final
    const report = runner.generateReport();

    // Sauvegarde du rapport
    const fs = require('fs');
    const reportPath = `./test-results-documents-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    runner.log(`📄 Rapport sauvegardé: ${reportPath}`);

    // Code de sortie
    process.exit(report.summary.failed === 0 ? 0 : 1);

  } catch (error) {
    runner.log(`💥 Erreur critique: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Exécution si appelé directement
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  TestRunner,
  HTTPClient,
  AuthManager,
  TestFileGenerator,
  DocumentsAPITests
};