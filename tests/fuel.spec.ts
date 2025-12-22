import { test, expect, Page } from '@playwright/test';

test.describe('Module Fuel E2E Tests', () => {
  const randomSuffix = Math.floor(Math.random() * 10000).toString();
  let page: Page;

  test.setTimeout(90000);

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    page = await context.newPage();

    // Authentification

    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@fleetmadagascar.mg');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');

    // Attendre le dashboard
    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 30000 });

    // Attendre que le chargement initial soit terminé
    await page.waitForLoadState('networkidle');
  });


  test.describe('Fuel History Page', () => {
    test('should display fuel history page', async () => {
      await page.goto('/fuel/history');

      // Vérifier le titre de la page
      await expect(page.getByTestId('page-title')).toContainText('Fuel History');

      // Vérifier les boutons principaux
      await expect(page.locator('button:has-text("Add Fuel Entry")')).toBeVisible();
      await expect(page.getByTestId('refresh-button')).toBeVisible();
    });

    test('should navigate to create fuel entry page', async () => {
      await page.goto('/fuel/history');

      await page.click('button:has-text("Add Fuel Entry")');
      await expect(page).toHaveURL('/fuel/history/create');

      // Vérifier le formulaire de création
      await expect(page.locator('h1').filter({ hasText: 'New Fuel Entry' })).toBeVisible();
    });

    test('should filter fuel entries by search', async () => {
      await page.goto('/fuel/history');

      // Taper dans le champ de recherche
      const searchTerm = 'Test Vehicle';
      await page.fill('input[placeholder="Search"]', searchTerm);

      // Attendre les résultats filtrés (via network ou timeout raisonnable)
      await page.waitForTimeout(1000);

      // Vérifier que la recherche est active
      await expect(page.locator('input[placeholder="Search"]')).toHaveValue(searchTerm);
    });

    test('should refresh fuel entries', async () => {
      await page.goto('/fuel/history');

      // Cliquer sur le bouton refresh
      await page.click('button[data-testid="refresh-button"]');

      // Vérifier que le loading spinner apparaît
      await expect(page.getByTestId('refresh-spinner')).toBeVisible();
    });
  });

  test.describe('Fuel Entry Creation', () => {
    test('should create new fuel entry', async () => {
      await page.goto('/fuel/history/create');

      // Sélection dynamique du véhicule
      const vehicleSelect = page.getByTestId('vehicle-select');
      await vehicleSelect.click();
      // Attendre que les options soient chargées
      await page.waitForFunction(() => {
        const select = document.querySelector('select[data-testid="vehicle-select"]') as HTMLSelectElement;
        return select && select.options.length > 1;
      }, { timeout: 10000 });
      await vehicleSelect.selectOption({ index: 1 });



      await page.fill('input[data-testid="date-input"]', '2024-12-17T10:30');
      await page.selectOption('select[data-testid="vendor-select"]', 'Chevron');
      await page.fill('input[data-testid="volume-input"]', '50.5');
      await page.fill('input[data-testid="cost-input"]', '150000'); // Valid currency value

      // Soumettre le formulaire
      await page.click('button[data-testid="save-button"]');

      // Vérifier la redirection vers la liste
      await expect(page).toHaveURL('/fuel/history', { timeout: 20000 });


    });

    test('should validate required fields', async () => {
      await page.goto('/fuel/history/create');

      // Intercepter l'alerte
      page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('Please fill in all required fields');
        await dialog.accept();
      });

      await page.click('button[data-testid="save-button"]');
    });

    test('should cancel fuel entry creation', async () => {
      await page.goto('/fuel/history/create');

      // Cliquer sur Cancel
      await page.getByTestId('cancel-button').first().click();

      // Vérifier la redirection
      await expect(page).toHaveURL('/fuel/history');
    });

  });

  test.describe('Charging History Page', () => {
    test('should display charging history page', async () => {
      await page.goto('/fuel/charging');

      // Vérifier le titre de la page
      await expect(page.getByTestId('page-title')).toContainText('Charging History');

      // Vérifier les boutons principaux
      await expect(page.getByTestId('add-charging-entry-button')).toBeVisible();
      await expect(page.getByTestId('refresh-button')).toBeVisible();
    });

    test('should navigate to create charging entry page', async () => {
      await page.goto('/fuel/charging');

      await page.click('[data-testid="add-charging-entry-button"]');
      await expect(page).toHaveURL('/fuel/charging/create');

      // Vérifier le formulaire de création
      await expect(page.locator('h1').filter({ hasText: 'New Charging Entry' })).toBeVisible();
    });

    test('should display charging statistics', async () => {
      await page.goto('/fuel/charging');

      // Vérifier les cartes de statistiques
      await expect(page.locator('text=Total Charging Cost')).toBeVisible();
      await expect(page.locator('text=Total Energy')).toBeVisible();
      await expect(page.locator('text=Total Duration')).toBeVisible();
      await expect(page.locator('text=Avg. Cost')).toBeVisible();
    });
  });

  test.describe('Charging Entry Creation', () => {
    test('should create new charging entry', async () => {
      await page.goto('/fuel/charging/create');

      // Sélection dynamique du véhicule
      const vehicleSelect = page.getByTestId('vehicle-select');
      // Attendre que les options soient chargées
      await page.waitForFunction(() => {
        const select = document.querySelector('select[data-testid="vehicle-select"]') as HTMLSelectElement;
        return select && select.options.length > 1;
      }, { timeout: 10000 });
      await vehicleSelect.selectOption({ index: 1 });



      await page.selectOption('select[data-testid="vendor-select"]', 'Tesla');

      // Fill date/time inputs
      await page.fill('[data-testid="start-date-input"]', '2024-12-17');
      await page.fill('[data-testid="start-time-input"]', '10:30');

      await page.fill('input[data-testid="energy-input"]', '28.5');
      await page.fill('input[data-testid="price-input"]', '850.00');

      // Wait for auto-calculation
      await page.waitForTimeout(1000);

      // Soumettre le formulaire
      await page.click('button[data-testid="save-button"]');

      // Vérifier la redirection vers la liste
      await expect(page).toHaveURL('/fuel/charging', { timeout: 20000 });


    });

    test('should calculate charging duration automatically', async () => {
      await page.goto('/fuel/charging/create');

      // Remplir les dates de début et de fin
      await page.fill('[data-testid="start-date-input"]', '2024-12-17');
      await page.fill('[data-testid="start-time-input"]', '10:30');

      await page.fill('[data-testid="end-date-input"]', '2024-12-17');
      await page.fill('[data-testid="end-time-input"]', '11:30');

      // Vérifier que la durée est calculée automatiquement
      const durationField = page.getByTestId('duration-input');
      await expect(durationField).toHaveValue('60 min');
    });

    test('should calculate total cost automatically', async () => {
      await page.goto('/fuel/charging/create');

      // Remplir l'énergie et le prix par kWh
      await page.fill('input[data-testid="energy-input"]', '25.0');
      await page.fill('input[data-testid="price-input"]', '800.00');

      // Vérifier que le coût total est calculé automatiquement
      const costField = page.locator('input[data-testid="cost-input"]');
      await expect(costField).toHaveValue('20000');
    });
  });

  test.describe('Navigation and UI', () => {
    test('should navigate between fuel pages', async () => {
      await page.goto('/fuel/history');
      await page.goto('/fuel/charging');
      await page.goto('/fuel/history');

      // Vérifier que les URLs sont correctes
      await expect(page).toHaveURL(/.*\/fuel\/history/);
    });

    test('should handle responsive design', async () => {
      // Test en mode mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/fuel/history');

      // Vérifier que le bouton est visible
      await expect(page.locator('button:has-text("Add Fuel Entry")')).toBeVisible();

      // Test en mode desktop
      await page.setViewportSize({ width: 1280, height: 720 });
      await expect(page.locator('button:has-text("Add Fuel Entry")')).toBeVisible();
    });

    test('should handle empty states', async () => {
      // Mock for empty state
      await page.route('**/api/fuel/entries*', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            entries: [],
            page: 1,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          })
        });
      });

      await page.goto('/fuel/history');
      await expect(page.locator('text=No fuel entries found')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      // Mock API error
      await page.route('**/api/fuel/entries*', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: 'Internal Server Error' })
        });
      });

      await page.goto('/fuel/history');
      await expect(page.locator('text=Error:')).toBeVisible();
    });

    test('should handle loading states', async () => {
      await page.goto('/fuel/history');

      // Mock delay
      await page.route('**/api/fuel/entries*', async route => {
        await new Promise(f => setTimeout(f, 1000));
        await route.continue();
      });

      // Cliquer sur refresh
      await page.click('button[data-testid="refresh-button"]');

      // Vérifier le spinner
      await expect(page.getByTestId('refresh-spinner')).toBeVisible();
    });
  });

  test.describe('Form Validation', () => {
    test('should validate fuel entry form', async () => {
      await page.goto('/fuel/history/create');

      page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('Please fill in all required fields');
        await dialog.accept();
      });

      await page.click('button[data-testid="save-button"]');
    });

    test('should validate charging entry form', async () => {
      await page.goto('/fuel/charging/create');

      page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('Please fill in all required fields');
        await dialog.accept();
      });

      await page.click('button[data-testid="save-button"]');
    });
  });
});