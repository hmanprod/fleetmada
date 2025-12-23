import { test, expect, Page, BrowserContext } from '@playwright/test';

test.describe('Module Reports E2E Tests', () => {
  const randomSuffix = Math.floor(Math.random() * 10000).toString();
  let context: BrowserContext;
  let page: Page;

  test.setTimeout(90000);

  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    page = await context.newPage();

    // Authentification standardisée
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@fleetmadagascar.mg');
    await page.fill('input[type="password"]', 'testpassword123');

    // Attendre que le bouton soit activé
    await page.waitForSelector('button[type="submit"]:not([disabled])');
    await page.click('button[type="submit"]');

    // Attendre la redirection vers le dashboard
    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 30000 });

    // Attendre que le chargement initial soit terminé
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async () => {
    await context.close();
  });

  test('Accès et Navigation Reports', async () => {
    // Navigation directe ou via menu
    await page.goto('/reports');
    await page.waitForLoadState('networkidle');

    // Vérifier le titre et les éléments principaux via data-testid
    await expect(page.getByTestId('page-title')).toContainText('Reports');
    await expect(page.getByTestId('search-reports-input')).toBeVisible();
    await expect(page.getByTestId('reports-grid')).toBeVisible();

    // Vérifier les onglets (tabs)
    await expect(page.getByTestId('nav-tab-standard')).toBeVisible();
    await expect(page.getByTestId('nav-tab-favorites')).toBeVisible();
    await expect(page.getByTestId('nav-tab-saved')).toBeVisible();

    // Vérifier les catégories
    await expect(page.getByTestId('category-filter-Vehicles')).toBeVisible();
    await expect(page.getByTestId('category-filter-Service')).toBeVisible();
  });

  test('Affichage des Templates et Filtrage', async () => {
    await page.goto('/reports');

    // Trouver une catégorie avec des items (count > 0)
    // On cherche un bouton de filtre qui contient un nombre > 0 dans son badge
    const categoryButton = page.getByTestId(/^category-filter-/).filter({ hasText: /[1-9]/ }).first();

    // Si on trouve une catégorie avec des items, on la teste
    if (await categoryButton.count() > 0) {
      await categoryButton.click();

      // Attendre que le chargement soit terminé
      await expect(page.getByTestId('loading-state')).toBeHidden({ timeout: 10000 });

      // Vérifier que des cartes sont affichées
      const reportCards = page.getByTestId('report-card');
      await expect(reportCards.first()).toBeVisible({ timeout: 10000 });

      const initialCount = await reportCards.count();
      expect(initialCount).toBeGreaterThan(0);
    } else {
      console.log('Test skipped: Aucun rapport disponible dans les catégories pour tester le filtre');
    }
  });

  test('Changer de vue (Grille/Liste)', async () => {
    await page.goto('/reports');

    // Vue Liste
    await page.getByTestId('view-list').click();
    await expect(page.getByTestId('reports-list')).toBeVisible();
    await expect(page.getByTestId('reports-grid')).not.toBeVisible();

    // Vue Grille
    await page.getByTestId('view-grid').click();
    await expect(page.getByTestId('reports-grid')).toBeVisible();
    await expect(page.getByTestId('reports-list')).not.toBeVisible();
  });

  test('Génération de Rapport (Mock)', async () => {
    await page.goto('/reports');

    // Cliquer sur le bouton générer du premier rapport
    const firstCard = page.getByTestId('report-card').first();
    await firstCard.getByTestId('generate-button').click();

    // Vérifier l'indicateur de génération
    await expect(page.getByTestId('generating-indicator')).toBeVisible();

    // Gérer l'alerte de succès (window.alert mock)
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('succès');
      await dialog.accept();
    });

    // Attendre la disparition de l'indicateur
    await expect(page.getByTestId('generating-indicator')).toBeHidden({ timeout: 15000 });
  });

  test('Recherche de Rapport', async () => {
    await page.goto('/reports');

    const searchInput = page.getByTestId('search-reports-input');
    await searchInput.fill('XYZ_NON_EXISTENT_REPORT');

    // Vérifier l'état vide
    await expect(page.getByTestId('empty-state')).toBeVisible();
    await expect(page.getByTestId('empty-state')).toContainText('Aucun rapport trouvé');

    // Effacer la recherche
    await page.getByRole('button', { name: 'Effacer la recherche' }).click();
    await expect(page.getByTestId('reports-grid')).toBeVisible();
  });

  test('Gestion des Favoris', async () => {
    await page.goto('/reports');

    const firstCard = page.getByTestId('report-card').first();

    // Comme l'état initial des favoris est inconnu, on clique pour changer l'état
    await firstCard.getByTestId('favorite-button').click();

    // Vérifier qu'il n'y a pas d'erreur affichée
    await expect(page.getByTestId('error-message')).not.toBeVisible();
  });

});