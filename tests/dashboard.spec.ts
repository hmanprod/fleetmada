import { test, expect } from '@playwright/test';

test.describe('Dashboard FleetMada', () => {
  test.beforeEach(async ({ page }) => {
    // Authentification via API pour plus de rapidité
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@fleetmadagascar.mg');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="login-button"]');

    // Attendre d'être sur le dashboard
    await page.waitForURL(/\/dashboard/);
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible({ timeout: 15000 });
  });

  test('should display dashboard header and navigation', async ({ page }) => {
    // Vérifier la présence du header via data-testid
    await expect(page.locator('[data-testid="dashboard-title"]')).toContainText('Dashboard FleetMada');

    // Vérifier les onglets de navigation via data-testid
    await expect(page.locator('[data-testid="dashboard-overview-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-costs-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-maintenance-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-vehicles-tab"]')).toBeVisible();

    // Vérifier les boutons d'action via data-testid
    await expect(page.locator('[data-testid="refresh-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification-button"]')).toBeVisible();
  });

  test('should display metric cards in overview tab', async ({ page }) => {
    // Vérifier que l'onglet Vue d'ensemble est actif par défaut
    const overviewTab = page.locator('[data-testid="dashboard-overview-tab"]');
    await expect(overviewTab).toHaveClass(/border-\[#008751\]/);

    // Vérifier la présence des cartes métriques via data-testid
    await expect(page.locator('[data-testid="metric-card-total-vehicles"]')).toBeVisible();
    await expect(page.locator('[data-testid="metric-card-total-costs"]')).toBeVisible();
    await expect(page.locator('[data-testid="metric-card-maintenance"]')).toBeVisible();
  });

  test('should switch between dashboard tabs', async ({ page }) => {
    // Cliquer sur l'onglet "Analyse des coûts"
    await page.click('[data-testid="dashboard-costs-tab"]');
    // Utiliser un sélecteur plus spécifique pour éviter les doublons textuels
    await expect(page.locator('h3:has-text("Coûts Totaux")')).toBeVisible();

    // Cliquer sur l'onglet "Maintenance"
    await page.click('[data-testid="dashboard-maintenance-tab"]');
    await expect(page.locator('h3:has-text("Rappels Totaux")')).toBeVisible();

    // Cliquer sur l'onglet "Véhicules"
    await page.click('[data-testid="dashboard-vehicles-tab"]');
    await expect(page.locator('[data-testid="vehicle-overview-table"]')).toBeVisible();

    // Revenir à l'onglet Vue d'ensemble
    await page.click('[data-testid="dashboard-overview-tab"]');
    await expect(page.locator('[data-testid="metric-card-total-vehicles"]')).toBeVisible();
  });

  test('should handle refresh functionality', async ({ page }) => {
    // Cliquer sur le bouton d'actualisation
    const refreshBtn = page.locator('[data-testid="refresh-button"]');
    await refreshBtn.click();

    // Vérifier que le bouton montre un état de chargement (ou overlay)
    // L'overlay est plus fiable si le bouton est désactivé trop vite
    const loadingOverlay = page.locator('[data-testid="loading-overlay"]');
    if (await loadingOverlay.isVisible({ timeout: 1000 })) {
      await expect(loadingOverlay).toBeVisible();
      await expect(loadingOverlay).toBeHidden({ timeout: 15000 });
    }

    // Vérifier que le bouton est à nouveau utilisable
    await expect(refreshBtn).toBeEnabled({ timeout: 15000 });
  });

  test('should display alerts and notifications', async ({ page }) => {
    // Vérifier la présence du widget d'alertes via data-testid
    await expect(page.locator('[data-testid="alert-summary"]')).toBeVisible();

    // Vérifier les notifications
    const notificationBadge = page.locator('[data-testid="notification-badge"]');
    if (await notificationBadge.isVisible()) {
      await expect(notificationBadge).toContainText(/\d+/);
    }
  });

  test('should display vehicle overview table', async ({ page }) => {
    // Aller à l'onglet Véhicules
    await page.click('[data-testid="dashboard-vehicles-tab"]');

    // Vérifier le tableau des véhicules via data-testid
    await expect(page.locator('[data-testid="vehicle-overview-table"]')).toBeVisible();

    // Vérifier au moins une ligne si possible (dépend des données du seed)
    const rows = page.locator('[data-testid="vehicle-row"]');
    await expect(rows.first()).toBeVisible({ timeout: 10000 });
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Simuler un affichage mobile
    await page.setViewportSize({ width: 375, height: 667 });

    // Vérifier que le dashboard est toujours là
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();

    // Revenir à la taille desktop
    await page.setViewportSize({ width: 1280, height: 720 });
  });
});

test.describe('Dashboard Performance & Reliability', () => {
  test('should load dashboard within performance threshold', async ({ page }) => {
    // Login d'abord
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@fleetmadagascar.mg');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="login-button"]');

    const startTime = Date.now();
    await page.waitForURL(/\/dashboard/);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Seuil de performance
    expect(loadTime).toBeLessThan(5000);
  });
});