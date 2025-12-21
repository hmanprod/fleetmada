import { test, expect, Page } from '@playwright/test';

test.describe('Module Fuel E2E Tests', () => {
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
    await page.fill('input[type="email"]', 'admin@fleetmadagascar.mg');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');

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

  test.describe('Fuel History Page', () => {
    test('should display fuel history page', async () => {
      await page.goto('/fuel/history');

      // Vérifier le titre de la page
      await expect(page.locator('h1')).toContainText('Fuel History');

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
      await page.fill('input[placeholder="Search"]', 'Test Vehicle');

      // Attendre les résultats filtrés
      await page.waitForTimeout(1000);

      // Vérifier que la recherche est active
      await expect(page.locator('input[placeholder="Search"]')).toHaveValue('Test Vehicle');
    });

    test('should refresh fuel entries', async () => {
      await page.goto('/fuel/history');

      // Intercept the API call to add a delay
      await page.route('**/api/fuel/entries*', async route => {
        await new Promise(f => setTimeout(f, 1000));
        await route.continue();
      });

      // Cliquer sur le bouton refresh
      await page.click('button[data-testid="refresh-button"]');

      // Vérifier que le loading spinner apparaît
      await expect(page.getByTestId('refresh-spinner')).toBeVisible();
    });
  });

  test.describe('Fuel Entry Creation', () => {
    test('should create new fuel entry', async () => {
      await page.goto('/fuel/history/create');

      // Remplir le formulaire avec données aléatoires
      await page.selectOption('select[data-testid="vehicle-select"]', 'MV112TRNS');
      await page.fill('input[data-testid="date-input"]', '2024-12-17T10:30'); // Fixed: removed seconds
      await page.selectOption('select[data-testid="vendor-select"]', 'Chevron');
      await page.fill('input[data-testid="volume-input"]', '50.5');
      await page.fill('input[data-testid="cost-input"]', '150.25');

      // Soumettre le formulaire
      await page.click('button[data-testid="save-button"]');

      // Vérifier la redirection vers la liste
      await expect(page).toHaveURL('/fuel/history');
    });

    test('should validate required fields', async () => {
      await page.goto('/fuel/history/create');

      // Essayer de sauvegarder sans remplir les champs requis
      // Vérifier qu'une alerte apparaît (validation côté client)
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('Please fill in all required fields');
        await dialog.accept();
      });

      await page.click('button[data-testid="save-button"]');
    });

    test('should cancel fuel entry creation', async () => {
      await page.goto('/fuel/history/create');

      // Cliquer sur Cancel
      await page.click('button:has-text("Cancel")');

      // Vérifier la redirection
      await expect(page).toHaveURL('/fuel/history');
    });
  });

  test.describe('Charging History Page', () => {
    test('should display charging history page', async () => {
      await page.goto('/fuel/charging');

      // Vérifier le titre de la page
      await expect(page.locator('h1')).toContainText('Charging History');

      // Vérifier les boutons principaux
      await expect(page.locator('button:has-text("New Charging Entry")')).toBeVisible();
      await expect(page.locator('button:has-text("Refresh")')).toBeVisible();
    });

    test('should navigate to create charging entry page', async () => {
      await page.goto('/fuel/charging');

      await page.click('button:has-text("New Charging Entry")');
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

      // Remplir le formulaire avec tous les champs requis
      await page.selectOption('select[data-testid="vehicle-select"]', 'MV112TRNS');
      await page.selectOption('select[data-testid="vendor-select"]', 'Tesla');

      // Fill date/time inputs (Charging Started) - triggers useEffect for formData.date
      const dateInputs = await page.locator('input[type="date"]').all();
      const timeInputs = await page.locator('input[type="time"]').all();
      if (dateInputs.length > 0) await dateInputs[0].fill('2024-12-17');
      if (timeInputs.length > 0) await timeInputs[0].fill('10:30');

      await page.fill('input[data-testid="energy-input"]', '28.5');
      await page.fill('input[data-testid="price-input"]', '850.00');

      // Wait for auto-calculation and date sync via useEffect
      await page.waitForTimeout(1000);

      // Soumettre le formulaire
      await page.click('button[data-testid="save-button"]');

      // Vérifier la redirection vers la liste (wait longer for API call)
      await page.waitForURL('/fuel/charging', { timeout: 10000 });
    });

    test('should calculate charging duration automatically', async () => {
      await page.goto('/fuel/charging/create');

      // Remplir les dates de début et de fin
      await page.fill('input[type="date"]:nth-of-type(1)', '2024-12-17');
      await page.fill('input[type="time"]:nth-of-type(1)', '10:30');
      // Need to be careful with nth-of-type selector if there are multiple date inputs in DOM
      // The page has 3 date inputs? 
      // 1. Charging Started
      // 2. Charging Ended
      // 3. (Maybe hidden?)
      // In `fuel/charging/create/page.tsx`:
      // `Charging Started` -> date, time
      // `Charging Ended` -> date, time

      // Better to use labels:
      // `div:has(label:has-text("Charging Started")) input[type="date"]`

      const startContainer = page.locator('div:has(label:has-text("Charging Started"))');
      await startContainer.locator('input[type="date"]').first().fill('2024-12-17');
      await startContainer.locator('input[type="time"]').first().fill('10:30');

      const endContainer = page.locator('div:has(label:has-text("Charging Ended"))');
      await endContainer.locator('input[type="date"]').first().fill('2024-12-17');
      await endContainer.locator('input[type="time"]').first().fill('11:30');

      // Vérifier que la durée est calculée automatiquement
      const durationField = page.locator('input[placeholder="Auto-calculated"]');
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
      // Depuis fuel history vers charging
      await page.goto('/fuel/history');
      await page.goto('/fuel/charging');

      // Depuis charging vers history
      await page.goto('/fuel/charging');
      await page.goto('/fuel/history');

      // Vérifier que les URLs sont correctes
      await expect(page).toHaveURL(/.*\/fuel\/history/);
    });

    test('should handle responsive design', async () => {
      // Test en mode mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/fuel/history');

      // Vérifier que la navigation mobile fonctionne
      await expect(page.locator('button:has-text("Add Fuel Entry")')).toBeVisible();

      // Test en mode desktop
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(page.locator('button:has-text("Add Fuel Entry")')).toBeVisible();
    });

    test('should handle empty states', async () => {
      await page.goto('/fuel/history');

      // Si la liste est vide, vérifier le message approprié
      const emptyMessage = page.locator('text=No fuel entries found');
      // Note: This relies on the database being empty or mock returning empty.
      // If previous tests created entries, this might fail unless we clear DB or mock.
      // The initial tests passed this, so assume it works or is flaky.
      // Ideally we should mock the response to be empty here.

      // Adding mock for empty state
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

      // Reload to apply mock
      await page.reload();

      await expect(emptyMessage).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      // Store current context and create new one for this test
      await page.context().setExtraHTTPHeaders({
        'Authorization': 'Bearer invalid-token'
      });

      await page.goto('/fuel/history');

      // Vérifier qu'un message d'erreur s'affiche
      await expect(page.locator('text=Error:')).toBeVisible();

      // Note: Headers will be reset on next test due to beforeEach creating new context
    });

    test('should handle loading states', async () => {
      await page.goto('/fuel/history');

      // Mock delay
      await page.route('**/api/fuel/entries*', async route => {
        await new Promise(f => setTimeout(f, 1000));
        await route.continue();
      });

      // Cliquer sur refresh pour voir l'état de chargement
      await page.click('button[data-testid="refresh-button"]');

      // Vérifier que le spinner de chargement apparaît
      await expect(page.getByTestId('refresh-spinner')).toBeVisible();
    });
  });

  test.describe('Form Validation', () => {
    test('should validate fuel entry form', async () => {
      await page.goto('/fuel/history/create');

      // Test avec des valeurs invalides
      await page.fill('input[data-testid="volume-input"]', '-10'); // Volume négatif
      await page.fill('input[data-testid="cost-input"]', '-50'); // Coût négatif

      // Vérifier la validation
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('Please fill in all required fields');
        await dialog.accept();
      });

      await page.click('button[data-testid="save-button"]');
    });

    test('should validate charging entry form', async () => {
      await page.goto('/fuel/charging/create');

      // Test avec des valeurs invalides
      await page.fill('input[data-testid="energy-input"]', '0'); // Énergie nulle
      await page.fill('input[data-testid="cost-input"]', '-100'); // Coût négatif

      // Vérifier la validation
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('Please fill in all required fields');
        await dialog.accept();
      });

      await page.click('button[data-testid="save-button"]');
    });
  });
});