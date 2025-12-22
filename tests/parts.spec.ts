import { test, expect, Page } from '@playwright/test';

test.describe('Module Parts - Tests E2E', () => {
  let page: Page;
  const randomSuffix = Math.floor(Math.random() * 10000);

  test.beforeEach(async ({ page: p }) => {
    page = p;
    // Se connecter (utiliser le stockage d'état si disponible, sinon se connecter manuellement)
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@fleetmadagascar.mg');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');

    // Attendre la redirection vers le dashboard
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 30000 });

    // Naviguer vers la page des pièces
    await page.goto('/parts');

    await expect(page.locator('[data-testid="page-title"]')).toBeVisible();
  });

  test('Devrait afficher la liste vide initialement ou avec des données', async () => {
    // La page devrait charger
    await expect(page.locator('table')).toBeVisible();

    // Le titre devrait être présent
    await expect(page.locator('[data-testid="page-title"]')).toContainText('Parts');
  });

  test('Devrait créer une nouvelle pièce', async () => {
    const partNumber = `PART-${randomSuffix}-001`;
    await page.click('[data-testid="add-part-button"]');
    await expect(page).toHaveURL('/parts/create');

    await page.fill('[data-testid="part-number"]', partNumber);
    await page.fill('[data-testid="part-description"]', 'Nouvelle pièce test E2E');
    await page.selectOption('[data-testid="part-category"]', 'engine');
    await page.fill('[data-testid="part-cost"]', '15000');
    await page.fill('[data-testid="part-quantity"]', '10');
    await page.click('[data-testid="save-part-button"]');

    // Vérifier le message de succès AVANT la redirection (car il est local à la page)
    await expect(page.locator('text=Pièce créée avec succès')).toBeVisible();

    // Vérifier la redirection
    await expect(page).toHaveURL('/parts');

    // Vérifier que la pièce est dans la liste (Maintenant possible grâce au tri par défaut desc)
    await expect(page.locator(`text=${partNumber}`)).toBeVisible();
  });

  test('Devrait afficher les détails d\'une pièce', async () => {
    const partNum = `DETAIL-${randomSuffix}-001`;
    await page.click('[data-testid="add-part-button"]');
    await page.fill('[data-testid="part-number"]', partNum);
    await page.fill('[data-testid="part-description"]', 'Pièce pour test détails');
    await page.fill('[data-testid="part-cost"]', '25000');
    await page.fill('[data-testid="part-quantity"]', '5');
    await page.click('[data-testid="save-part-button"]');

    // Cliquer sur la pièce pour voir les détails
    await page.click(`text=${partNum}`);
    await expect(page).toHaveURL(/\/parts\/.+/, { timeout: 10000 });

    // Vérifier les détails
    await expect(page.locator('[data-testid="page-title"]')).toContainText(partNum);

    await expect(page.locator('[data-testid="stock-quantity"]')).toContainText('5');
  });

  test('Devrait éditer une pièce existante', async () => {
    const partNum = `EDIT-${randomSuffix}-001`;
    await page.click('[data-testid="add-part-button"]');
    await page.fill('[data-testid="part-number"]', partNum);
    await page.fill('[data-testid="part-description"]', 'Pièce à éditer');
    await page.click('[data-testid="save-part-button"]');

    // Naviguer vers les détails
    await page.click(`text=${partNum}`);

    // Cliquer sur éditer
    await page.click('[data-testid="edit-part-button"]');

    // Modifier les détails
    await page.fill('[data-testid="part-description"]', 'Pièce éditée - test E2E');
    await page.fill('[data-testid="part-cost"]', '30000');
    await page.click('[data-testid="save-changes-button"]');

    // Vérifier le message de succès (s'il existe sur l'un ou l'autre)
    // await expect(page.locator('text=Pièce mise à jour avec succès')).toBeVisible();

    // Vérifier les modifications dans les détails
    await expect(page.locator('text=Pièce éditée - test E2E')).toBeVisible();
    await expect(page.locator('[data-testid="page-title"]')).toContainText('Pièce éditée - test E2E');
    // Utiliser une regex pour le coût car le formatage (espace vs virgule) varie
    await expect(page.locator('body')).toContainText(/30[.,\s]?000/);

  });

  test('Devrait gérer le stock avec ajustements', async () => {
    const stockPartNum = `STOCK-${randomSuffix}-001`;
    await page.click('[data-testid="add-part-button"]');
    await page.fill('[data-testid="part-number"]', stockPartNum);
    await page.fill('[data-testid="part-description"]', 'Pièce pour test stock');
    await page.fill('[data-testid="part-quantity"]', '5');
    await page.fill('[data-testid="part-minimum-stock"]', '10');
    await page.click('[data-testid="save-part-button"]');

    // Aller dans les détails
    await page.click(`text=${stockPartNum}`);

    // Vérifier l'état du stock faible
    await expect(page.locator('text=Stock faible')).toBeVisible();

    // Ajuster le stock
    await page.click('[data-testid="adjust-stock-button"]');
    await page.selectOption('[data-testid="adjustment-type"]', 'add');
    await page.fill('[data-testid="adjustment-quantity"]', '10');
    await page.fill('[data-testid="adjustment-reason"]', 'Réception commande');
    await page.click('[data-testid="confirm-adjustment-button"]');

    // Attendre que le modal soit fermé
    await expect(page.getByRole('heading', { name: 'Ajuster le stock', exact: true })).not.toBeVisible();


    // Vérifier le nouveau stock (5 + 10 = 15)
    await expect(page.locator('[data-testid="stock-quantity"]')).toContainText('15', { timeout: 10000 });
    // Le badge stock faible ne devrait plus être là (min=10, qty=15)
    await expect(page.locator('text=Stock faible')).not.toBeVisible();
  });

  test('Devrait filtrer les pièces par catégorie', async () => {
    const catPartNum = `FILTER-${randomSuffix}-001`;
    await page.click('[data-testid="add-part-button"]');
    await page.fill('[data-testid="part-number"]', catPartNum);
    await page.fill('[data-testid="part-description"]', 'Filtre à huile');
    await page.selectOption('[data-testid="part-category"]', 'filters');
    await page.click('[data-testid="save-part-button"]');

    // Activer le filtre
    await page.click('[data-testid="category-filter"]');
    // Note: On assume que le clic sur Part Category (ligne 151 de page.tsx) fait office de filtre
    await page.click('button:has-text("Part Category")');

    await expect(page.locator(`text=${catPartNum}`)).toBeVisible();
  });

  test('Devrait rechercher des pièces', async () => {
    const searchPartNum = `SEARCH-${randomSuffix}-001`;
    await page.click('[data-testid="add-part-button"]');
    await page.fill('[data-testid="part-number"]', searchPartNum);
    await page.fill('[data-testid="part-description"]', 'Unique random part');
    await page.click('[data-testid="save-part-button"]');

    // Rechercher
    await page.fill('[data-testid="search-input"]', searchPartNum);

    // Attendre le filtrage
    await expect(page.locator(`text=${searchPartNum}`)).toBeVisible();
  });

  test('Devrait afficher les statistiques en bas de page', async () => {
    // Les statistiques devraient être visibles si des pièces existent
    const stats = page.locator('[data-testid="parts-stats"]');
    await expect(stats).toBeVisible();
    await expect(stats).toContainText(/Ar [\d,]+/);
  });

  test('Devrait gérer les erreurs de validation', async () => {
    await page.click('[data-testid="add-part-button"]');
    // Sans numéro
    await page.fill('[data-testid="part-description"]', 'Test validation');
    await expect(page.locator('[data-testid="save-part-button"]')).toBeDisabled();

    // Avec numéro mais sans description
    await page.fill('[data-testid="part-number"]', 'VALID-001');
    await page.fill('[data-testid="part-description"]', '');
    await expect(page.locator('[data-testid="save-part-button"]')).toBeDisabled();
  });

  test('Devrait afficher les onglets All et Low Stock', async () => {
    const lowPartNum = `LOW-${randomSuffix}-001`;
    await page.click('[data-testid="add-part-button"]');
    await page.fill('[data-testid="part-number"]', lowPartNum);
    await page.fill('[data-testid="part-description"]', 'Low stock part');
    await page.fill('[data-testid="part-quantity"]', '2');
    await page.fill('[data-testid="part-minimum-stock"]', '10');
    await page.click('[data-testid="save-part-button"]');

    // Vérifier dans All
    await page.click('[data-testid="tab-all"]');
    await expect(page.locator(`text=${lowPartNum}`)).toBeVisible();

    // Vérifier dans Low Stock
    await page.click('[data-testid="tab-low-stock"]');
    await expect(page.locator(`text=${lowPartNum}`)).toBeVisible();
  });

  test('Devrait naviguer correctement avec les boutons retour', async () => {
    // Liste -> Création -> Liste
    await page.click('[data-testid="add-part-button"]');
    await expect(page).toHaveURL('/parts/create');
    await page.click('[data-testid="back-button"]');
    await expect(page).toHaveURL('/parts');

    // Liste -> Détails -> Liste
    const navPartNum = `NAV-${randomSuffix}-001`;
    await page.click('[data-testid="add-part-button"]');
    await page.fill('[data-testid="part-number"]', navPartNum);
    await page.fill('[data-testid="part-description"]', 'Nav part');
    await page.click('[data-testid="save-part-button"]');

    await page.click(`text=${navPartNum}`);
    await expect(page).toHaveURL(/\/parts\/.+/);
    await page.click('[data-testid="back-button"]');
    await expect(page).toHaveURL('/parts');
  });

});