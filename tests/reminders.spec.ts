import { test, expect, Page } from '@playwright/test';

/**
 * Tests E2E Playwright pour le module Reminders FleetMada
 * Tests complets : navigation, CRUD, actions, filtres, responsive
 */

test.describe('Module Reminders - E2E Tests', () => {
  let context: any;
  let page: Page;

  test.setTimeout(90000);

  test.beforeEach(async ({ browser }) => {
    // 1. Create explicit context
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    page = await context.newPage();

    // 2. UI-based authentication
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@fleetmadagascar.mg');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="login-button"]');

    // 3. Wait for redirect to dashboard
    await page.waitForURL('**/dashboard**', { timeout: 30000 });

    // 4. Wait for vehicle list to be available (ensuring data is loaded)
    await page.waitForSelector('[data-testid="sidebar-vehicles"]', { timeout: 30000 });
  });

  test.afterEach(async () => {
    await page.close();
    await context.close();
  });

  test.describe('Navigation et Layout', () => {
    test('Navigation vers Service Reminders', async () => {
      // Cliquer sur le menu Reminders dans la sidebar si nécessaire
      const subMenu = page.locator('[data-testid="sidebar-service-reminders"]');
      if (!(await subMenu.isVisible())) {
        await page.click('[data-testid="sidebar-reminders"]');
      }
      await subMenu.click();
      await expect(page).toHaveURL(/\/reminders\/service/);

      // Vérifier le titre de la page
      await expect(page.locator('[data-testid="page-title"]')).toContainText('Service Reminders');

      // Vérifier les onglets
      await expect(page.locator('[data-testid="tab-all"]')).toContainText('All');
      await expect(page.locator('[data-testid="tab-due-soon"]')).toContainText('Due Soon');
      await expect(page.locator('[data-testid="tab-overdue"]')).toContainText('Overdue');
      await expect(page.locator('[data-testid="tab-snoozed"]')).toContainText('Snoozed');
    });

    test('Navigation vers Vehicle Renewals', async () => {
      const subMenu = page.locator('[data-testid="sidebar-vehicle-renewals"]');
      if (!(await subMenu.isVisible())) {
        await page.click('[data-testid="sidebar-reminders"]');
      }
      await subMenu.click();
      await expect(page).toHaveURL(/\/reminders\/vehicle-renewals/);

      // Vérifier le titre de la page
      await expect(page.locator('[data-testid="page-title"]')).toContainText('Vehicle Renewal Reminders');

      // Vérifier les onglets
      await expect(page.locator('[data-testid="tab-all"]')).toContainText('All');
      await expect(page.locator('[data-testid="tab-due-soon"]')).toContainText('Due Soon');
      await expect(page.locator('[data-testid="tab-overdue"]')).toContainText('Overdue');
    });
  });

  test.describe('Service Reminders - Liste et Filtres', () => {
    test('Affichage de la liste des rappels service', async () => {
      await page.goto('/reminders/service');

      // Attendre le chargement des données
      await page.waitForSelector('[data-testid="reminders-table"]');

      // Vérifier la structure du tableau
      await expect(page.locator('th').nth(1)).toContainText('Vehicle');
      await expect(page.locator('th').nth(2)).toContainText('Service Task');
      await expect(page.locator('th').nth(3)).toContainText('Status');
      await expect(page.locator('th').nth(4)).toContainText('Next Due');

      // Vérifier la pagination
      await expect(page.locator('[data-testid="pagination-info"]')).toBeVisible();
    });

    test('Filtres par statut - Overdue', async () => {
      await page.goto('/reminders/service');
      await page.waitForSelector('[data-testid="reminders-table"]');

      // Cliquer sur l'onglet Overdue
      await page.click('[data-testid="tab-overdue"]');

      // Attendre le rechargement des données filtrées
      await page.waitForTimeout(1000);

      // Vérifier que l'onglet Overdue est actif
      await expect(page.locator('[data-testid="tab-overdue"]')).toHaveClass(/text-\[#008751\]/);

      // Vérifier que les rappels affichés sont bien en retard
      const rows = page.locator('[data-testid="reminder-row"]');
      const count = await rows.count();
      if (count > 0) {
        // Au moins un rappel doit être en retard
        await expect(page.locator('.text-sm.font-bold').first()).toBeVisible();
      }
    });

    test('Recherche dans les rappels', async () => {
      await page.goto('/reminders/service');
      await page.waitForSelector('[data-testid="reminders-table"]');

      // Utiliser la barre de recherche
      await page.fill('[data-testid="search-input"]', 'oil');
      await page.press('[data-testid="search-input"]', 'Enter');

      // Attendre les résultats filtrés
      await page.waitForTimeout(1000);
    });

    test('Sélection multiple de rappels', async () => {
      await page.goto('/reminders/service');
      await page.waitForSelector('[data-testid="reminders-table"]', { timeout: 30000 });

      // Cocher la case "Sélectionner tout"
      await page.click('[data-testid="select-all-checkbox"]');

      // Vérifier que toutes les cases sont cochées
      const checkboxes = page.locator('[data-testid="reminder-checkbox"]');
      const count = await checkboxes.count();

      for (let i = 0; i < count; i++) {
        await expect(checkboxes.nth(i)).toBeChecked();
      }
    });
  });

  test.describe('Service Reminders - Détails et Actions', () => {
    test('Affichage des détails d\'un rappel', async () => {
      await page.goto('/reminders/service');
      await page.waitForSelector('[data-testid="reminders-table"]');

      // Cliquer sur le premier rappel
      const firstRow = page.locator('[data-testid="reminder-row"]').first();
      await firstRow.click();

      // Vérifier la redirection vers la page de détails
      await expect(page).toHaveURL(/\/reminders\/service\/[^/]+$/);

      // Vérifier les éléments de la page de détails
      await expect(page.locator('[data-testid="page-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="reminder-status"]')).toBeVisible();
      await expect(page.locator('[data-testid="reminder-vehicle"]')).toBeVisible();
    });

    test('Action Dismiss (Rejeter)', async () => {
      await page.goto('/reminders/service');
      await page.waitForSelector('[data-testid="reminders-table"]');

      // Trouver un rappel qui n'est pas déjà rejeté
      const rows = page.locator('[data-testid="reminder-row"]');
      await rows.first().click();

      await page.waitForSelector('[data-testid="dismiss-button"]');
      await page.click('[data-testid="dismiss-button"]');

      // Attendre le rechargement
      await page.waitForLoadState('networkidle');

      // Vérifier que le statut est maintenant Dismissed
      await expect(page.locator('[data-testid="reminder-status"]')).toContainText(/Dismissed|Rejeté/i, { timeout: 15000 });
    });

    test('Action Snooze (Reporter)', async () => {
      await page.goto('/reminders/service');
      await page.waitForSelector('[data-testid="reminders-table"]');

      // On prend le deuxième rappel pour éviter les conflits avec le test Dismiss si possible
      const rows = page.locator('[data-testid="reminder-row"]');
      if (await rows.count() > 1) {
        await rows.nth(1).click();
      } else {
        await rows.first().click();
      }

      await page.waitForSelector('[data-testid="snooze-button"]');
      await page.click('[data-testid="snooze-button"]');

      // Attendre le rechargement
      await page.waitForLoadState('networkidle');

      // Vérifier que le statut est Snoozed
      await expect(page.locator('[data-testid="reminder-status"]')).toContainText(/Snoozed|Reporté/i, { timeout: 15000 });
    });
  });

  test.describe('Service Reminders - Création', () => {
    test('Formulaire de création - navigation et validation', async () => {
      await page.goto('/reminders/service');
      await page.click('[data-testid="add-service-reminder"]');

      // Vérifier la redirection
      await expect(page).toHaveURL('/reminders/service/create');

      // Vérifier les champs obligatoires
      await expect(page.locator('[data-testid="vehicle-select"]')).toBeVisible();
      await expect(page.locator('[data-testid="service-task-select"]')).toBeVisible();
      await expect(page.locator('[data-testid="time-interval-input"]')).toBeVisible();
    });

    test('Création d\'un nouveau rappel service', async () => {
      await page.goto('/reminders/service/create');

      // Remplir le formulaire avec les valeurs réelles disponibles dans le select
      await page.selectOption('[data-testid="vehicle-select"]', { label: 'Toyota Hilux - FM-001-AA' });
      await page.selectOption('[data-testid="service-task-select"]', { label: 'Engine Oil & Filter Replacement' });
      await page.fill('[data-testid="time-interval-input"]', '6');
      await page.selectOption('[data-testid="time-interval-unit"]', 'month(s)');

      // Sauvegarder
      await page.click('[data-testid="save-reminder"]');

      // Attendre la redirection - augmentation du timeout
      await page.waitForURL(/\/reminders\/service$/, { timeout: 15000 });
      await expect(page).toHaveURL(/\/reminders\/service/);
    });
  });

  test.describe('Vehicle Renewals - Liste et Actions', () => {
    test('Affichage de la liste des renouvellements', async () => {
      await page.goto('/reminders/vehicle-renewals');
      await page.waitForSelector('[data-testid="renewals-table"]');

      // Vérifier la structure du tableau
      await expect(page.locator('th').nth(1)).toContainText('Vehicle');
      await expect(page.locator('th').nth(2)).toContainText('Renewal Type');
      await expect(page.locator('th').nth(3)).toContainText('Status');
      await expect(page.locator('th').nth(4)).toContainText('Due Date');
    });

    test('Action Complete (Compléter)', async () => {
      await page.goto('/reminders/vehicle-renewals');
      await page.waitForSelector('[data-testid="renewals-table"]');

      const rows = page.locator('[data-testid="renewal-row"]');
      if (await rows.count() > 0) {
        await rows.first().click();
        await page.waitForURL(/\/reminders\/vehicle-renewals\//);

        await page.waitForSelector('[data-testid="complete-button"]');
        await page.click('[data-testid="complete-button"]');

        // Attendre le rechargement
        await page.waitForLoadState('networkidle');
        await expect(page.locator('[data-testid="renewal-status"]')).toContainText(/Completed|Terminé/i, { timeout: 15000 });
      }
    });

    test('Navigation vers Edition', async () => {
      await page.goto('/reminders/vehicle-renewals');
      const rows = page.locator('[data-testid="renewal-row"]');
      if (await rows.count() > 0) {
        await rows.first().click();
        await page.waitForSelector('[data-testid="edit-button"]');
        await page.click('[data-testid="edit-button"]');
        await expect(page).toHaveURL(/\/reminders\/vehicle-renewals\/[^/]+\/edit/);
      }
    });
  });

  test.describe('Vehicle Renewals - Création', () => {
    test('Création d\'un nouveau renouvellement', async () => {
      await page.goto('/reminders/vehicle-renewals');
      await page.click('[data-testid="add-vehicle-renewal"]');

      // Vérifier la redirection
      await expect(page).toHaveURL('/reminders/vehicle-renewals/create');

      // Remplir le formulaire
      await page.selectOption('[data-testid="vehicle-select"]', { label: 'Toyota Hilux - FM-001-AA' });
      await page.selectOption('[data-testid="renewal-type-select"]', { label: 'Emission Test' });
      await page.fill('[data-testid="due-date-input"]', '2025-12-30'); // Format standard ISO pour date input

      // Sauvegarder
      await page.click('[data-testid="save-renewal"]');

      // Vérifier la redirection
      await page.waitForURL(/\/reminders\/vehicle-renewals/);
      await expect(page).toHaveURL(/\/reminders\/vehicle-renewals/);
    });
  });

  test.describe('Interface Responsive', () => {
    test('Navigation mobile', async () => {
      // Simuler un écran mobile
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/reminders/service');

      // Vérifier que le menu hamburger est visible
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();

      // Tester l'ouverture du menu mobile
      await page.click('[data-testid="mobile-menu-button"]');
      await expect(page.locator('[data-testid="mobile-sidebar"]')).toBeVisible();
    });
  });

  test.describe('Performance et Accessibilité', () => {
    test('Temps de chargement des pages', async () => {
      const startTime = Date.now();

      await page.goto('/reminders/service');
      await page.waitForSelector('[data-testid="reminders-table"]');

      const loadTime = Date.now() - startTime;

      // Le chargement doit être inférieur à 5 secondes (soyez indulgent en dev)
      expect(loadTime).toBeLessThan(5000);
    });
  });
});