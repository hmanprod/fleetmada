import { test, expect, Page } from '@playwright/test';

// Test data helpers
const testVehicle = {
  name: 'TEST001',
  make: 'Toyota',
  model: 'Corolla',
  vin: '1HGBH41JXMN109186'
};

const testIssue = {
  summary: 'Test Issue - Moteur fait du bruit',
  priority: 'HIGH' as const,
  labels: ['Mechanical', 'Engine'],
  description: 'Le moteur fait un bruit anormal depuis ce matin'
};

const testComment = {
  author: 'Test User',
  content: 'Commentaire de test pour vérifier le système de commentaires'
};

test.describe('Module Issues - E2E Tests', () => {
  test.setTimeout(90000);
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    page = await context.newPage();

    // 1. Authentification
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@fleetmadagascar.mg');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');

    // 2. Attendre la redirection vers le dashboard
    await page.waitForURL('**/dashboard**', { timeout: 30000 });

    // 3. Attendre que l'overlay de chargement disparaisse
    try {
      await page.waitForSelector('text=Chargement des données...', { state: 'hidden', timeout: 45000 });
    } catch (e) {
      console.log('Timeout waiting for loading overlay to hide, proceeding anyway...');
    }

    // 4. Gérer le modal éventuel
    try {
      const modalClose = page.locator('button:has-text("Plus tard"), button[aria-label="Close"], .modal-close').first();
      if (await modalClose.isVisible({ timeout: 5000 })) {
        await modalClose.click();
      }
    } catch (e) {
      // Pas de modal, on continue
    }
  });

  async function navigateToIssues(page: Page) {
    // Navigation via sidebar
    const issuesLink = page.locator('a[href="/issues"], [data-testid="sidebar-issues"]').first();
    await issuesLink.waitFor({ state: 'visible' });
    await issuesLink.click({ force: true });
    await page.waitForURL('**/issues**');
  }

  test.describe('Navigation et Accès', () => {
    test('should navigate to Issues page via sidebar', async ({ page }) => {
      await navigateToIssues(page);

      // Check page elements
      await expect(page.locator('h1').filter({ hasText: 'Problèmes' }).first()).toBeVisible();
      await expect(page.locator('[data-testid="issues-list"]')).toBeVisible();
    });

    test('should show Issues tab in Dashboard', async ({ page }) => {
      await page.goto('/dashboard');

      await page.click('[data-testid="dashboard-issues-tab"]');
      await expect(page.locator('[data-testid="issues-status"]')).toBeVisible();
    });
  });

  test.describe('Liste des Issues', () => {
    test('should display issues list with proper headers', async ({ page }) => {
      await navigateToIssues(page);

      // Check table headers
      await expect(page.locator('th:has-text("Véhicule")')).toBeVisible();
      await expect(page.locator('th:has-text("Résumé")')).toBeVisible();
      await expect(page.locator('th:has-text("Priorité")')).toBeVisible();
      await expect(page.locator('th:has-text("Statut")')).toBeVisible();
      await expect(page.locator('th:has-text("Assigné à")')).toBeVisible();
    });

    test('should filter issues by status', async ({ page }) => {
      await navigateToIssues(page);

      // Open filters
      await page.click('[data-testid="filter-button"]');

      // Select "Open" status filter
      await page.selectOption('select[name="status"]', 'OPEN');

      // Apply filter
      await page.click('button:has-text("Appliquer")');

      // Check that filter is applied
      await expect(page.locator('[data-testid="status-filter"]')).toContainText('OPEN');
    });

    test('should search issues by summary', async ({ page }) => {
      await navigateToIssues(page);

      // Use search
      await page.fill('input[placeholder*="rechercher"]', 'moteur');
      await page.press('input[placeholder*="rechercher"]', 'Enter');

      // Check search results
      await expect(page.locator('[data-testid="issues-list"]')).toBeVisible();
    });
  });

  test.describe('Création d\'Issue', () => {
    test('should navigate to create issue page', async ({ page }) => {
      await navigateToIssues(page);

      await page.click('button:has-text("Nouveau Problème")');
      await expect(page).toHaveURL('/issues/create');
    });

    test('should create a new issue with all required fields', async ({ page }) => {
      await page.goto('/issues/create');

      // Fill vehicle selection
      await page.selectOption('select[name="vehicleId"]', testVehicle.name);

      // Fill summary
      await page.fill('input[name="summary"]', testIssue.summary);

      // Select priority
      await page.selectOption('select[name="priority"]', testIssue.priority);

      // Add labels
      await page.selectOption('select[name="labels"]', testIssue.labels[0]);
      await page.click('button:has-text("Ajouter")');

      // Fill description
      await page.fill('textarea[name="description"]', testIssue.description);

      // Save issue
      await page.click('button:has-text("Sauvegarder")');

      // Check success and redirect
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Problème créé avec succès');
      await expect(page).toHaveURL(/\/issues\/[a-zA-Z0-9-]+$/);
    });

    test('should show validation errors for missing required fields', async ({ page }) => {
      await page.goto('/issues/create');

      // Try to save without filling required fields
      await page.click('button:has-text("Sauvegarder")');

      // Check validation errors
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Le résumé est requis');
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Veuillez sélectionner un véhicule');
    });
  });

  test.describe('Détails d\'Issue', () => {
    let createdIssueId: string;

    test.beforeEach(async ({ page }) => {
      // Create a test issue first
      await page.goto('/issues/create');

      await page.selectOption('select[name="vehicleId"]', testVehicle.name);
      await page.fill('input[name="summary"]', testIssue.summary);
      await page.selectOption('select[name="priority"]', testIssue.priority);

      await page.click('button:has-text("Sauvegarder")');

      // Get the issue ID from URL
      const url = page.url();
      createdIssueId = url.split('/').pop() || '';
    });

    test('should display issue details correctly', async ({ page }) => {
      await page.goto(`/issues/${createdIssueId}`);

      // Check all detail sections
      await expect(page.locator('h1').filter({ hasText: testIssue.summary }).first()).toBeVisible();
      await expect(page.locator('[data-testid="issue-priority"]')).toContainText(testIssue.priority);
      await expect(page.locator('[data-testid="issue-vehicle"]')).toContainText(testVehicle.name);
      await expect(page.locator('[data-testid="issue-status"]')).toContainText('OPEN');
    });

    test('should change issue status', async ({ page }) => {
      await page.goto(`/issues/${createdIssueId}`);

      // Open status dropdown
      await page.click('[data-testid="status-dropdown"]');

      // Select "In Progress"
      await page.click('[data-testid="status-option-IN_PROGRESS"]');

      // Verify status change
      await expect(page.locator('[data-testid="issue-status"]')).toContainText('En cours');
    });

    test('should assign issue to user', async ({ page }) => {
      await page.goto(`/issues/${createdIssueId}`);

      // Open assign dropdown
      await page.click('[data-testid="assign-dropdown"]');

      // Select user
      await page.click('[data-testid="assign-option-user-1"]');

      // Verify assignment
      await expect(page.locator('[data-testid="issue-assignee"]')).toContainText('Hery RABOTOVAO');
    });
  });

  test.describe('Commentaires', () => {
    let createdIssueId: string;

    test.beforeEach(async ({ page }) => {
      // Create a test issue first
      await page.goto('/issues/create');

      await page.selectOption('select[name="vehicleId"]', testVehicle.name);
      await page.fill('input[name="summary"]', testIssue.summary);

      await page.click('button:has-text("Sauvegarder")');

      // Get the issue ID from URL
      const url = page.url();
      createdIssueId = url.split('/').pop() || '';
    });

    test('should add a comment to issue', async ({ page }) => {
      await page.goto(`/issues/${createdIssueId}`);

      // Add comment
      await page.fill('textarea[name="comment"]', testComment.content);
      await page.click('button:has-text("Ajouter")');

      // Verify comment appears
      await expect(page.locator('[data-testid="comment-content"]')).toContainText(testComment.content);
    });

    test('should display comment history', async ({ page }) => {
      // Add multiple comments
      await page.goto(`/issues/${createdIssueId}`);

      await page.fill('textarea[name="comment"]', 'Premier commentaire');
      await page.click('button:has-text("Ajouter")');

      await page.fill('textarea[name="comment"]', 'Deuxième commentaire');
      await page.click('button:has-text("Ajouter")');

      // Check both comments are displayed
      await expect(page.locator('[data-testid="comments-list"]')).toContainText('Premier commentaire');
      await expect(page.locator('[data-testid="comments-list"]')).toContainText('Deuxième commentaire');
    });
  });

  test.describe('Modification d\'Issue', () => {
    let createdIssueId: string;

    test.beforeEach(async ({ page }) => {
      // Create a test issue first
      await page.goto('/issues/create');

      await page.selectOption('select[name="vehicleId"]', testVehicle.name);
      await page.fill('input[name="summary"]', testIssue.summary);

      await page.click('button:has-text("Sauvegarder")');

      // Get the issue ID from URL
      const url = page.url();
      createdIssueId = url.split('/').pop() || '';
    });

    test('should navigate to edit page', async ({ page }) => {
      await page.goto(`/issues/${createdIssueId}`);

      await page.click('button:has-text("Modifier")');
      await expect(page).toHaveURL(`/issues/${createdIssueId}/edit`);
    });

    test('should update issue details', async ({ page }) => {
      await page.goto(`/issues/${createdIssueId}/edit`);

      // Update summary
      await page.fill('input[name="summary"]', 'Issue modifiée - Test de mise à jour');

      // Update priority
      await page.selectOption('select[name="priority"]', 'CRITICAL');

      // Save changes
      await page.click('button:has-text("Sauvegarder")');

      // Verify success and redirect
      await expect(page.locator('[data-testid="success-message"]')).toContainText('modifié avec succès');
      await expect(page).toHaveURL(`/issues/${createdIssueId}`);

      // Verify changes are reflected
      await expect(page.locator('h1').filter({ hasText: 'Issue modifiée - Test de mise à jour' }).first()).toBeVisible();
      await expect(page.locator('[data-testid="issue-priority"]')).toContainText('CRITIQUE');
    });
  });

  test.describe('Upload d\'Images', () => {
    let createdIssueId: string;

    test.beforeEach(async ({ page }) => {
      // Create a test issue first
      await page.goto('/issues/create');

      await page.selectOption('select[name="vehicleId"]', testVehicle.name);
      await page.fill('input[name="summary"]', testIssue.summary);

      await page.click('button:has-text("Sauvegarder")');

      // Get the issue ID from URL
      const url = page.url();
      createdIssueId = url.split('/').pop() || '';
    });

    test('should upload images to issue', async ({ page }) => {
      await page.goto(`/issues/${createdIssueId}/edit`);

      // Upload image
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('tests/fixtures/test-image.jpg');

      // Save to upload
      await page.click('button:has-text("Sauvegarder")');

      // Verify image appears
      await expect(page.locator('[data-testid="issue-images"]')).toContainText('test-image.jpg');
    });
  });

  test.describe('Dashboard Integration', () => {
    test('should display issues metrics in dashboard', async ({ page }) => {
      await page.goto('/dashboard');

      // Navigate to Issues tab
      await page.click('[data-testid="dashboard-issues-tab"]');

      // Check metrics are displayed
      await expect(page.locator('[data-testid="issues-total"]')).toBeVisible();
      await expect(page.locator('[data-testid="issues-critical"]')).toBeVisible();
      await expect(page.locator('[data-testid="issues-in-progress"]')).toBeVisible();
    });

    test('should show recent issues in dashboard', async ({ page }) => {
      await page.goto('/dashboard');

      // Go to Issues tab
      await page.click('[data-testid="dashboard-issues-tab"]');

      // Check recent issues section
      await expect(page.locator('[data-testid="recent-issues"]')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await navigateToIssues(page);

      // Check mobile navigation
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();

      // Check list is responsive
      await expect(page.locator('[data-testid="issues-list"]')).toBeVisible();
    });

    test('should work on tablet devices', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      await navigateToIssues(page);

      // Check tablet layout
      await expect(page.locator('[data-testid="issues-list"]')).toBeVisible();
      await expect(page.locator('[data-testid="issues-filters"]')).toBeVisible();
    });
  });

  test.describe('Performance et Accessibilité', () => {
    test('should load issues page within acceptable time', async ({ page }) => {
      const startTime = Date.now();

      await navigateToIssues(page);

      // Wait for content to load
      await expect(page.locator('[data-testid="issues-list"]')).toBeVisible();

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    });

    test('should have proper accessibility attributes', async ({ page }) => {
      await navigateToIssues(page);

      // Check for aria labels and roles
      await expect(page.locator('[role="table"]')).toBeVisible();
      await expect(page.locator('[aria-label*="issues"]')).toBeVisible();

      // Check keyboard navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      // Should be able to navigate with keyboard
    });
  });
});

// Cleanup test data after all tests
test.afterAll(async ({ page }) => {
  // This would ideally clean up test data
  // For now, we'll just log completion
  console.log('Issues E2E tests completed');
});
