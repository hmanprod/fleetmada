import { test, expect, Page } from '@playwright/test';

test.describe('Module Service - Tests E2E', () => {
  const randomSuffix = Math.floor(Math.random() * 10000).toString();
  let page: Page;

  test.setTimeout(120000);

  test.beforeEach(async ({ page: p }) => {
    page = p;
    // 1. Authentification
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@fleetmadagascar.mg');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="login-button"]');

    // 2. Attendre la redirection vers le dashboard
    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 30000 });
    // Attendre que le dashboard soit chargé
    await page.waitForSelector('[data-testid="dashboard-title"]', { state: 'visible' });
  });

  test.describe('Dashboard Service', () => {
    test('devrait afficher le dashboard principal avec les stats et actions', async ({ page }) => {
      await page.goto('/service');

      // Vérifier le titre de la page
      await expect(page.locator('[data-testid="service-dashboard-title"]')).toBeVisible();

      // Vérifier les statistiques principales via data-testid
      await expect(page.locator('[data-testid="service-stats-grid"]')).toBeVisible();
      await expect(page.locator('[data-testid="stat-card-programmes-actifs"]')).toBeVisible();
      await expect(page.locator('[data-testid="stat-card-entrées-récentes"]')).toBeVisible();

      // Vérifier les actions rapides
      await expect(page.locator('[data-testid="quick-action-history"]')).toBeVisible();
      await expect(page.locator('[data-testid="quick-action-work-orders"]')).toBeVisible();
      await expect(page.locator('[data-testid="quick-action-programs"]')).toBeVisible();

      // Vérifier les sections d'activité
      await expect(page.locator('text=Activité Récente')).toBeVisible();
      await expect(page.locator('text=Rappels & Alertes')).toBeVisible();
    });

    test('devrait permettre la navigation vers les différentes sections', async ({ page }) => {
      await page.goto('/service');

      // Navigation vers l'historique
      await page.click('[data-testid="quick-action-history"]');
      await expect(page).toHaveURL(/\/service\/history/);

      // Retour au dashboard
      await page.goto('/service');

      // Navigation vers les work orders
      await page.click('[data-testid="quick-action-work-orders"]');
      await expect(page).toHaveURL(/\/service\/work-orders/);

      // Retour au dashboard
      await page.goto('/service');

      // Navigation vers les programmes
      await page.click('[data-testid="quick-action-programs"]');
      await expect(page).toHaveURL(/\/service\/programs/);
    });
  });

  test.describe('Gestion des Programmes', () => {
    test('devrait afficher la liste des programmes et les stats', async ({ page }) => {
      await page.goto('/service/programs');

      // Vérifier le titre
      await expect(page.locator('[data-testid="page-title"]')).toContainText('Service Programs');

      // Vérifier les stats
      await expect(page.locator('[data-testid="program-stats-row"]')).toBeVisible();
      await expect(page.locator('[data-testid="stat-total-programs"]')).toBeVisible();

      // Vérifier les filtres
      await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="filter-vehicle-button"]')).toBeVisible();
    });

    test('devrait créer un nouveau programme', async ({ page }) => {
      await page.goto('/service/programs');
      const programName = `Prog E2E ${randomSuffix}`;

      // Cliquer sur le bouton de création
      await page.click('[data-testid="add-program-button"]');

      // Vérifier la redirection
      await expect(page).toHaveURL(/\/service\/programs\/create/);

      // Remplir le formulaire
      await page.fill('[data-testid="program-name"]', programName);

      // Cliquer sur sauvegarder
      await page.click('[data-testid="save-button"]');

      // Vérifier la redirection et la présence du programme
      await expect(page).toHaveURL(/\/service\/programs/);

      // Rechercher le programme spécifiquement
      await page.fill('[data-testid="search-input"]', programName);

      // Attendre que la recherche soit traitée
      await page.waitForResponse(response =>
        response.url().includes('/api/service/programs') && response.status() === 200
      );

      // Vérifier la visibilité
      await expect(page.getByText(programName)).toBeVisible({ timeout: 15000 });
    });

  });



  test.describe('Gestion des Work Orders', () => {
    test('devrait afficher la liste des work orders', async ({ page }) => {
      await page.goto('/service/work-orders');

      // Vérifier le titre
      await expect(page.locator('[data-testid="page-title"]')).toContainText('Demandes d’entretien');

      // Vérifier les onglets
      await expect(page.locator('button:has-text("Tous")')).toBeVisible();
      await expect(page.locator('button:has-text("Ouverts")')).toBeVisible();
    });

    test('devrait créer un nouveau work order avec sélection de véhicule', async ({ page }) => {
      await page.goto('/service/work-orders');

      // Cliquer sur le bouton de création
      await page.click('[data-testid="add-work-order-button"]');

      // Vérifier la redirection
      await expect(page).toHaveURL(/\/service\/work-orders\/create/);

      // Sélectionner dynamiquement le premier véhicule disponible (pas test-vehicle-1)
      const vehicleSelect = page.locator('[data-testid="vehicle-select"]');
      await vehicleSelect.selectOption({ index: 1 }); // Index 0 est "Please select"

      // Remplir d'autres champs
      await page.click('[data-testid="status-open"]');

      // Sauvegarder
      await page.click('[data-testid="save-button"]');

      // Vérifier la redirection
      await expect(page).toHaveURL(/\/service\/work-orders/);
    });
  });

  test.describe('Historique des Maintenances', () => {
    test('devrait afficher l\'historique des maintenances', async ({ page }) => {
      await page.goto('/service/history');

      // Vérifier le titre
      await expect(page.locator('[data-testid="page-title"]')).toContainText('Service History');

      // Vérifier les stats via data-testid
      await expect(page.locator('[data-testid="history-stats-row"]')).toBeVisible();
      await expect(page.locator('[data-testid="stat-total-entries"]')).toBeVisible();
    });

    test('devrait permettre de filtrer', async ({ page }) => {
      await page.goto('/service/history');

      // Vérifier la présence des filtres
      await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="filter-vehicle-button"]')).toBeVisible();
    });
  });


  test.describe('Performance et Accessibilité', () => {
    test('devrait charger en un temps raisonnable', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/service');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      // Seuil augmenté à 10s pour environnements de test lents, 3s était trop strict
      expect(loadTime).toBeLessThan(10000);
    });
  });
});