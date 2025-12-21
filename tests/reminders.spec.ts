import { test, expect, Page } from '@playwright/test';

/**
 * Tests E2E Playwright pour le module Reminders FleetMada
 * Tests complets : navigation, CRUD, actions, filtres, responsive
 */

test.describe('Module Reminders E2E Tests', () => {
  const randomSuffix = Math.floor(Math.random() * 10000).toString();
  let page: Page;

  test.setTimeout(90000);

  test.beforeEach(async ({ browser }) => {
    // 1. Create explicit context
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    page = await context.newPage();

    // 2. UI-based authentication
    await page.goto('/login');
    await page.fill('input[type="email"], [data-testid="email-input"]', 'admin@fleetmadagascar.mg');
    await page.fill('input[type="password"], [data-testid="password-input"]', 'testpassword123');
    await page.click('button[type="submit"], [data-testid="login-button"]');

    // 3. Wait for redirect to dashboard
    await page.waitForURL('**/dashboard**', { timeout: 30000 });

    // 4. Wait for loading overlay to hide
    try {
      await page.waitForSelector('text=Chargement des données...', { state: 'hidden', timeout: 45000 });
    } catch (e) {
      console.log('Timeout waiting for loading overlay to hide, proceeding anyway...');
    }

    // 5. Handle any modals
    try {
      const modalClose = page.locator('button:has-text("Plus tard"), button[aria-label="Close"], .modal-close').first();
      if (await modalClose.isVisible({ timeout: 5000 })) {
        await modalClose.click();
      }
    } catch (e) {
      // No modal, continue
    }
  });

  test.describe('Navigation et Layout', () => {
    test('Navigation vers Service Reminders', async ({ page }) => {
      // Cliquer sur le menu Reminders dans la sidebar
      await page.click('[data-testid="reminders-menu"]');
      await expect(page).toHaveURL('/reminders/service');

      // Vérifier le titre de la page
      await expect(page.locator('h1')).toContainText('Service Reminders');

      // Vérifier les onglets
      await expect(page.locator('[data-testid="tab-all"]')).toContainText('All');
      await expect(page.locator('[data-testid="tab-due-soon"]')).toContainText('Due Soon');
      await expect(page.locator('[data-testid="tab-overdue"]')).toContainText('Overdue');
      await expect(page.locator('[data-testid="tab-snoozed"]')).toContainText('Snoozed');
    });

    test('Navigation vers Vehicle Renewals', async ({ page }) => {
      await page.goto('/reminders/vehicle-renewals');

      // Vérifier le titre de la page
      await expect(page.locator('h1')).toContainText('Vehicle Renewal Reminders');

      // Vérifier les onglets
      await expect(page.locator('[data-testid="tab-all"]')).toContainText('All');
      await expect(page.locator('[data-testid="tab-due-soon"]')).toContainText('Due Soon');
      await expect(page.locator('[data-testid="tab-overdue"]')).toContainText('Overdue');
    });
  });

  test.describe('Service Reminders - Liste et Filtres', () => {
    test('Affichage de la liste des rappels service', async ({ page }) => {
      await page.goto('/reminders/service');

      // Attendre le chargement des données
      await page.waitForSelector('[data-testid="reminders-table"]');

      // Vérifier la structure du tableau
      await expect(page.locator('th').first()).toContainText('Vehicle');
      await expect(page.locator('th').nth(1)).toContainText('Service Task');
      await expect(page.locator('th').nth(2)).toContainText('Status');
      await expect(page.locator('th').nth(3)).toContainText('Next Due');

      // Vérifier la pagination
      await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
    });

    test('Filtres par statut - Overdue', async ({ page }) => {
      await page.goto('/reminders/service');
      await page.waitForSelector('[data-testid="reminders-table"]');

      // Cliquer sur l'onglet Overdue
      await page.click('[data-testid="tab-overdue"]');

      // Attendre le rechargement des données filtrées
      await page.waitForTimeout(1000);

      // Vérifier que l'onglet Overdue est actif
      await expect(page.locator('[data-testid="tab-overdue"]')).toHaveClass(/border-\[#008751\]/);

      // Vérifier que les rappels affichés sont bien en retard
      const rows = page.locator('tbody tr');
      const count = await rows.count();
      if (count > 0) {
        // Au moins un rappel doit être en retard
        await expect(page.locator('.text-red-600')).toBeVisible();
      }
    });

    test('Recherche dans les rappels', async ({ page }) => {
      await page.goto('/reminders/service');
      await page.waitForSelector('[data-testid="reminders-table"]');

      // Utiliser la barre de recherche
      await page.fill('[data-testid="search-input"]', 'oil');
      await page.press('[data-testid="search-input"]', 'Enter');

      // Attendre les résultats filtrés
      await page.waitForTimeout(1000);

      // Les résultats doivent contenir le terme recherché
      // Note: Cette vérification dépend des données de test
    });

    test('Sélection multiple de rappels', async ({ page }) => {
      await page.goto('/reminders/service');
      await page.waitForSelector('[data-testid="reminders-table"]');

      // Cocher la case "Sélectionner tout"
      await page.click('[data-testid="select-all-checkbox"]');

      // Vérifier que toutes les cases sont cochées
      const checkboxes = page.locator('tbody input[type="checkbox"]');
      const count = await checkboxes.count();

      for (let i = 0; i < count; i++) {
        await expect(checkboxes.nth(i)).toBeChecked();
      }
    });
  });

  test.describe('Service Reminders - Détails et Actions', () => {
    test('Affichage des détails d\'un rappel', async ({ page }) => {
      await page.goto('/reminders/service');
      await page.waitForSelector('[data-testid="reminders-table"]');

      // Cliquer sur le premier rappel
      const firstRow = page.locator('tbody tr').first();
      await firstRow.click();

      // Vérifier la redirection vers la page de détails
      await expect(page).toHaveURL(/\/reminders\/service\/[^/]+$/);

      // Vérifier les éléments de la page de détails
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('[data-testid="reminder-status"]')).toBeVisible();
      await expect(page.locator('[data-testid="reminder-vehicle"]')).toBeVisible();
    });

    test('Action Dismiss (Rejeter)', async ({ page }) => {
      await page.goto('/reminders/service/123'); // Supposer un ID valide
      await page.waitForSelector('[data-testid="dismiss-button"]');

      // Cliquer sur le bouton Dismiss
      await page.click('[data-testid="dismiss-button"]');

      // Confirmer l'action
      await page.click('[data-testid="confirm-dismiss"]');

      // Vérifier que le statut a changé
      await expect(page.locator('[data-testid="reminder-status"]')).toContainText('DISMISSED');
    });

    test('Action Snooze (Reporter)', async ({ page }) => {
      await page.goto('/reminders/service/123'); // Supposer un ID valide
      await page.waitForSelector('[data-testid="snooze-button"]');

      // Cliquer sur le bouton Snooze
      await page.click('[data-testid="snooze-button"]');

      // Sélectionner la durée (7 jours par défaut)
      await page.click('[data-testid="snooze-7-days"]');
      await page.click('[data-testid="confirm-snooze"]');

      // Vérifier que le statut a changé
      await expect(page.locator('[data-testid="reminder-status"]')).toContainText('DISMISSED');
      await expect(page.locator('[data-testid="snoozed-until"]')).toBeVisible();
    });
  });

  test.describe('Service Reminders - Création', () => {
    test('Formulaire de création - navigation et validation', async ({ page }) => {
      await page.goto('/reminders/service');
      await page.click('[data-testid="add-service-reminder"]');

      // Vérifier la redirection
      await expect(page).toHaveURL('/reminders/service/create');

      // Vérifier les champs obligatoires
      await expect(page.locator('[data-testid="vehicle-select"]')).toBeVisible();
      await expect(page.locator('[data-testid="service-task-select"]')).toBeVisible();
      await expect(page.locator('[data-testid="time-interval-input"]')).toBeVisible();
    });

    test('Création d\'un nouveau rappel service', async ({ page }) => {
      await page.goto('/reminders/service/create');

      // Remplir le formulaire
      await page.selectOption('[data-testid="vehicle-select"]', 'vehicle-1');
      await page.selectOption('[data-testid="service-task-select"]', 'oil_change');
      await page.fill('[data-testid="time-interval-input"]', '6');
      await page.selectOption('[data-testid="time-interval-unit"]', 'month(s)');

      // Sauvegarder
      await page.click('[data-testid="save-reminder"]');

      // Vérifier la redirection vers la liste
      await expect(page).toHaveURL('/reminders/service');

      // Vérifier que le nouveau rappel apparaît dans la liste
      await expect(page.locator('tbody tr').first()).toContainText('Oil Change');
    });
  });

  test.describe('Vehicle Renewals - Liste et Actions', () => {
    test('Affichage de la liste des renouvellements', async ({ page }) => {
      await page.goto('/reminders/vehicle-renewals');
      await page.waitForSelector('[data-testid="renewals-table"]');

      // Vérifier la structure du tableau
      await expect(page.locator('th').first()).toContainText('Vehicle');
      await expect(page.locator('th').nth(1)).toContainText('Renewal Type');
      await expect(page.locator('th').nth(2)).toContainText('Status');
      await expect(page.locator('th').nth(3)).toContainText('Due Date');
    });

    test('Filtres Vehicle Renewals - Due Soon', async ({ page }) => {
      await page.goto('/reminders/vehicle-renewals');
      await page.waitForSelector('[data-testid="renewals-table"]');

      // Cliquer sur l'onglet Due Soon
      await page.click('[data-testid="tab-due-soon"]');

      // Attendre le filtrage
      await page.waitForTimeout(1000);

      // Vérifier que l'onglet est actif
      await expect(page.locator('[data-testid="tab-due-soon"]')).toHaveClass(/border-\[#008751\]/);
    });

    test('Action Complete (Compléter)', async ({ page }) => {
      await page.goto('/reminders/vehicle-renewals/123'); // Supposer un ID valide
      await page.waitForSelector('[data-testid="complete-button"]');

      // Cliquer sur Complete
      await page.click('[data-testid="complete-button"]');

      // Remplir le formulaire de complétion
      await page.fill('[data-testid="completion-cost"]', '150.50');
      await page.fill('[data-testid="completion-provider"]', 'Test Provider');
      await page.fill('[data-testid="completion-notes"]', 'Test completion notes');

      // Confirmer
      await page.click('[data-testid="confirm-complete"]');

      // Vérifier que le statut a changé
      await expect(page.locator('[data-testid="renewal-status"]')).toContainText('COMPLETED');
    });
  });

  test.describe('Vehicle Renewals - Création', () => {
    test('Création d\'un nouveau renouvellement', async ({ page }) => {
      await page.goto('/reminders/vehicle-renewals');
      await page.click('[data-testid="add-vehicle-renewal"]');

      // Vérifier la redirection
      await expect(page).toHaveURL('/reminders/vehicle-renewals/create');

      // Remplir le formulaire
      await page.selectOption('[data-testid="vehicle-select"]', 'vehicle-1');
      await page.selectOption('[data-testid="renewal-type-select"]', 'INSPECTION');
      await page.fill('[data-testid="due-date-input"]', '2025-12-30');
      await page.selectOption('[data-testid="priority-select"]', 'HIGH');

      // Sauvegarder
      await page.click('[data-testid="save-renewal"]');

      // Vérifier la redirection
      await expect(page).toHaveURL('/reminders/vehicle-renewals');
    });
  });

  test.describe('Interface Responsive', () => {
    test('Navigation mobile', async ({ page }) => {
      // Simuler un écran mobile
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/reminders/service');

      // Vérifier que le menu hamburger est visible
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();

      // Tester l'ouverture du menu mobile
      await page.click('[data-testid="mobile-menu-button"]');
      await expect(page.locator('[data-testid="mobile-sidebar"]')).toBeVisible();
    });

    test('Tableau responsive sur mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/reminders/service');
      await page.waitForSelector('[data-testid="reminders-table"]');

      // Sur mobile, le tableau doit avoir des cards au lieu de lignes
      await expect(page.locator('[data-testid="reminder-card"]')).toBeVisible();
    });
  });

  test.describe('Intégration Dashboard', () => {
    test('Widgets Dashboard - Reminders', async ({ page }) => {
      await page.goto('/dashboard');

      // Vérifier les widgets de rappels
      await expect(page.locator('[data-testid="reminders-overview-widget"]')).toBeVisible();
      await expect(page.locator('[data-testid="overdue-reminders-count"]')).toBeVisible();
      await expect(page.locator('[data-testid="due-soon-reminders-count"]')).toBeVisible();

      // Tester le clic pour voir les détails
      await page.click('[data-testid="reminders-overview-widget"]');
      await expect(page).toHaveURL('/reminders/service');
    });
  });

  test.describe('Performance et Accessibilité', () => {
    test('Temps de chargement des pages', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/reminders/service');
      await page.waitForSelector('[data-testid="reminders-table"]');

      const loadTime = Date.now() - startTime;

      // Le chargement doit être inférieur à 2 secondes
      expect(loadTime).toBeLessThan(2000);
    });

    test('Accessibilité - Navigation clavier', async ({ page }) => {
      await page.goto('/reminders/service');

      // Tester la navigation avec Tab
      await page.press('body', 'Tab');
      await page.press('body', 'Tab');
      await page.press('body', 'Tab');

      // Vérifier que le focus est visible
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('Messages d\'erreur et feedback utilisateur', async ({ page }) => {
      await page.goto('/reminders/service/create');

      // Essayer de sauvegarder sans remplir les champs obligatoires
      await page.click('[data-testid="save-reminder"]');

      // Vérifier l'affichage des erreurs de validation
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    });
  });
});