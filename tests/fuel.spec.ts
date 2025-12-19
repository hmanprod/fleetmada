import { test, expect } from '@playwright/test';

test.describe('Module Fuel E2E Tests', () => {
  let authToken: string;

  test.beforeEach(async ({ page }) => {
    // Authentification avant chaque test
    const loginResponse = await page.request.post('/api/auth/login', {
      data: {
        email: 'test@fleetmada.com',
        password: 'testpassword123'
      }
    });

    if (loginResponse.ok()) {
      const loginData = await loginResponse.json();
      authToken = loginData.token;
    }

    // Configuration des headers d'authentification pour toutes les requêtes
    await page.context().setExtraHTTPHeaders({
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    });
  });

  test.describe('Fuel History Page', () => {
    test('should display fuel history page', async ({ page }) => {
      await page.goto('/fuel/history');
      
      // Vérifier le titre de la page
      await expect(page.locator('h1')).toContainText('Fuel History');
      
      // Vérifier les boutons principaux
      await expect(page.locator('button:has-text("Add Fuel Entry")')).toBeVisible();
      await expect(page.locator('button:has-text("Refresh")')).toBeVisible();
    });

    test('should navigate to create fuel entry page', async ({ page }) => {
      await page.goto('/fuel/history');
      
      await page.click('button:has-text("Add Fuel Entry")');
      await expect(page).toHaveURL('/fuel/history/create');
      
      // Vérifier le formulaire de création
      await expect(page.locator('h1')).toContainText('New Fuel Entry');
    });

    test('should filter fuel entries by search', async ({ page }) => {
      await page.goto('/fuel/history');
      
      // Taper dans le champ de recherche
      await page.fill('input[placeholder="Search"]', 'Test Vehicle');
      
      // Attendre les résultats filtrés
      await page.waitForTimeout(1000);
      
      // Vérifier que la recherche est active
      await expect(page.locator('input[placeholder="Search"]')).toHaveValue('Test Vehicle');
    });

    test('should refresh fuel entries', async ({ page }) => {
      await page.goto('/fuel/history');
      
      // Cliquer sur le bouton refresh
      await page.click('button:has-text("Refresh")');
      
      // Vérifier que le loading spinner apparaît
      await expect(page.locator('.animate-spin')).toBeVisible();
    });
  });

  test.describe('Fuel Entry Creation', () => {
    test('should create new fuel entry', async ({ page }) => {
      await page.goto('/fuel/history/create');
      
      // Remplir le formulaire
      await page.selectOption('select', 'MV112TRNS');
      await page.fill('input[type="datetime-local"]', '2024-12-17T10:30:00');
      await page.selectOption('select:nth-of-type(2)', 'Chevron');
      await page.fill('input[step="0.001"]', '50.5');
      await page.fill('input[placeholder="MGA"]', '150.25');
      
      // Soumettre le formulaire
      await page.click('button:has-text("Save Entry")');
      
      // Vérifier la redirection vers la liste
      await expect(page).toHaveURL('/fuel/history');
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto('/fuel/history/create');
      
      // Essayer de sauvegarder sans remplir les champs requis
      await page.click('button:has-text("Save Entry")');
      
      // Vérifier qu'une alerte apparaît (validation côté client)
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('Please fill in all required fields');
        await dialog.accept();
      });
    });

    test('should cancel fuel entry creation', async ({ page }) => {
      await page.goto('/fuel/history/create');
      
      // Cliquer sur Cancel
      await page.click('button:has-text("Cancel")');
      
      // Vérifier la redirection
      await expect(page).toHaveURL('/fuel/history');
    });
  });

  test.describe('Charging History Page', () => {
    test('should display charging history page', async ({ page }) => {
      await page.goto('/fuel/charging');
      
      // Vérifier le titre de la page
      await expect(page.locator('h1')).toContainText('Charging History');
      
      // Vérifier les boutons principaux
      await expect(page.locator('button:has-text("New Charging Entry")')).toBeVisible();
      await expect(page.locator('button:has-text("Refresh")')).toBeVisible();
    });

    test('should navigate to create charging entry page', async ({ page }) => {
      await page.goto('/fuel/charging');
      
      await page.click('button:has-text("New Charging Entry")');
      await expect(page).toHaveURL('/fuel/charging/create');
      
      // Vérifier le formulaire de création
      await expect(page.locator('h1')).toContainText('New Charging Entry');
    });

    test('should display charging statistics', async ({ page }) => {
      await page.goto('/fuel/charging');
      
      // Vérifier les cartes de statistiques
      await expect(page.locator('text=Total Charging Cost')).toBeVisible();
      await expect(page.locator('text=Total Energy')).toBeVisible();
      await expect(page.locator('text=Total Duration')).toBeVisible();
      await expect(page.locator('text=Avg. Cost')).toBeVisible();
    });
  });

  test.describe('Charging Entry Creation', () => {
    test('should create new charging entry', async ({ page }) => {
      await page.goto('/fuel/charging/create');
      
      // Remplir le formulaire
      await page.selectOption('select', 'MV112TRNS');
      await page.selectOption('select:nth-of-type(2)', 'Tesla');
      await page.fill('input[type="date"]', '2024-12-17');
      await page.fill('input[type="time"]', '10:30');
      await page.fill('input[placeholder="kWh"]', '28.5');
      await page.fill('input[placeholder="/ kWh"]', '850.00');
      
      // Soumettre le formulaire
      await page.click('button:has-text("Save Charging Entry")');
      
      // Vérifier la redirection vers la liste
      await expect(page).toHaveURL('/fuel/charging');
    });

    test('should calculate charging duration automatically', async ({ page }) => {
      await page.goto('/fuel/charging/create');
      
      // Remplir les dates de début et de fin
      await page.fill('input[type="date"]:nth-of-type(1)', '2024-12-17');
      await page.fill('input[type="time"]:nth-of-type(1)', '10:30');
      await page.fill('input[type="date"]:nth-of-type(2)', '2024-12-17');
      await page.fill('input[type="time"]:nth-of-type(2)', '11:30');
      
      // Vérifier que la durée est calculée automatiquement
      const durationField = page.locator('input[placeholder="Auto-calculated"]');
      await expect(durationField).toHaveValue('60 min');
    });

    test('should calculate total cost automatically', async ({ page }) => {
      await page.goto('/fuel/charging/create');
      
      // Remplir l'énergie et le prix par kWh
      await page.fill('input[placeholder="kWh"]', '25.0');
      await page.fill('input[placeholder="/ kWh"]', '800.00');
      
      // Vérifier que le coût total est calculé automatiquement
      const costField = page.locator('input[placeholder="MGA"]:last-of-type');
      await expect(costField).toHaveValue('20000');
    });
  });

  test.describe('Navigation and UI', () => {
    test('should navigate between fuel pages', async ({ page }) => {
      // Depuis fuel history vers charging
      await page.goto('/fuel/history');
      await page.goto('/fuel/charging');
      
      // Depuis charging vers history
      await page.goto('/fuel/charging');
      await page.goto('/fuel/history');
      
      // Vérifier que les URLs sont correctes
      await expect(page).toHaveURL(/.*\/fuel\/history/);
    });

    test('should handle responsive design', async ({ page }) => {
      // Test en mode mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/fuel/history');
      
      // Vérifier que la navigation mobile fonctionne
      await expect(page.locator('button:has-text("Add Fuel Entry")')).toBeVisible();
      
      // Test en mode desktop
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(page.locator('button:has-text("Add Fuel Entry")')).toBeVisible();
    });

    test('should handle empty states', async ({ page }) => {
      await page.goto('/fuel/history');
      
      // Si la liste est vide, vérifier le message approprié
      const emptyMessage = page.locator('text=No fuel entries found');
      await expect(emptyMessage).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // Simuler une erreur en supprimant le token d'auth
      await page.context().setExtraHTTPHeaders({
        'Authorization': 'Bearer invalid-token'
      });
      
      await page.goto('/fuel/history');
      
      // Vérifier qu'un message d'erreur s'affiche
      await expect(page.locator('text=Error:')).toBeVisible();
    });

    test('should handle loading states', async ({ page }) => {
      await page.goto('/fuel/history');
      
      // Cliquer sur refresh pour voir l'état de chargement
      await page.click('button:has-text("Refresh")');
      
      // Vérifier que le spinner de chargement apparaît
      await expect(page.locator('.animate-spin')).toBeVisible();
      
      // Attendre que le chargement se termine
      await page.waitForSelector('.animate-spin', { state: 'hidden' });
    });
  });

  test.describe('Form Validation', () => {
    test('should validate fuel entry form', async ({ page }) => {
      await page.goto('/fuel/history/create');
      
      // Test avec des valeurs invalides
      await page.fill('input[step="0.001"]', '-10'); // Volume négatif
      await page.fill('input[placeholder="MGA"]', '-50'); // Coût négatif
      
      await page.click('button:has-text("Save Entry")');
      
      // Vérifier la validation
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('Please fill in all required fields');
        await dialog.accept();
      });
    });

    test('should validate charging entry form', async ({ page }) => {
      await page.goto('/fuel/charging/create');
      
      // Test avec des valeurs invalides
      await page.fill('input[placeholder="kWh"]', '0'); // Énergie nulle
      await page.fill('input[placeholder="MGA"]:last-of-type', '-100'); // Coût négatif
      
      await page.click('button:has-text("Save Charging Entry")');
      
      // Vérifier la validation
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('Please fill in all required fields');
        await dialog.accept();
      });
    });
  });
});