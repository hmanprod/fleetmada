import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Module Documents E2E Tests', () => {
  const randomSuffix = Math.floor(Math.random() * 10000).toString();
  let page: Page;

  test.setTimeout(90000);

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    page = await context.newPage();

    // Browser console logging
    page.on('console', msg => console.log(`BROWSER [${msg.type()}]: ${msg.text()}`));

    // Authentification
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@fleetmadagascar.mg');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.waitForSelector('button[type="submit"]:not([disabled])');
    await page.click('button[type="submit"]');

    // Attendre le dashboard
    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 30000 });

    // Attendre que le chargement initial soit terminé
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async () => {
    // Nettoyer les fichiers de test
    const testFiles = [
      `test-document-${randomSuffix}.txt`,
      `test-file-1-${randomSuffix}.txt`,
      `test-file-2-${randomSuffix}.txt`,
      `test-file-3-${randomSuffix}.txt`
    ];

    testFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  });

  test.describe('Documents List Page', () => {
    test('should display documents list and search/filters', async () => {
      await page.goto('/documents');

      // Vérifier le titre de la page
      await expect(page.getByTestId('page-title')).toContainText('Documents');

      // Vérifier les boutons principaux
      await expect(page.getByTestId('add-document-button')).toBeVisible();
      await expect(page.getByTestId('search-input')).toBeVisible();

      // Tester l'affichage des filtres
      await page.click('button[data-testid="filter-button"]');
      await expect(page.getByTestId('mime-type-select')).toBeVisible();
      await expect(page.getByTestId('sort-by-select')).toBeVisible();
      await expect(page.getByTestId('sort-order-select')).toBeVisible();
    });

    test('should search documents', async () => {
      await page.goto('/documents');

      const searchInput = page.getByTestId('search-input');
      await searchInput.fill('non-existent-document-xyz');
      await page.keyboard.press('Enter');

      // Attendre que la recherche soit effectuée
      await page.waitForTimeout(1000);

      // Vérifier le message "aucun résultat"
      await expect(page.locator('text=Aucun document trouvé')).toBeVisible();
    });
  });

  test.describe('Document Upload', () => {
    test('should upload document with metadata and vehicle attachment', async () => {
      await page.goto('/documents/upload');

      const fileName = `test-document-${randomSuffix}.txt`;
      fs.writeFileSync(fileName, `Content of test document ${randomSuffix}`);

      // Upload du fichier
      await page.setInputFiles('input[data-testid="file-input"]', fileName);

      // Vérifier que le fichier est listé
      await expect(page.locator(`text=${fileName}`)).toBeVisible();

      // Remplir la description
      await page.fill('textarea[data-testid="description-textarea"]', 'Test description for E2E');

      // Ajouter une étiquette
      const labelInput = page.getByTestId('label-input');
      await labelInput.fill(`tag-${randomSuffix}`);
      await page.click('button[data-testid="add-label-button"]');
      await expect(page.locator(`text=tag-${randomSuffix}`)).toBeVisible();

      // Attachement dynamique à un véhicule
      await page.selectOption('select[data-testid="attached-to-select"]', 'vehicle');

      // On a besoin d'un ID de véhicule réel. On va aller chercher le premier véhicule dispo
      // Mais dans ce test, on peut aussi simplement tester le champ texte qui apparaît
      await expect(page.getByTestId('attached-id-input')).toBeVisible();
      await page.fill('input[data-testid="attached-id-input"]', 'TEST-VEHICLE-ID');

      // Lancer l'upload
      await page.click('button[data-testid="upload-button"]');

      // Attendre le succès (CheckCircle est affiché sur la page de succès)
      await expect(page.locator('text=Upload réussi !')).toBeVisible({ timeout: 20000 });

      // Vérifier la redirection vers la liste
      await expect(page).toHaveURL(/\/documents/, { timeout: 10000 });

      console.log(`Verifying file in list: ${fileName}`);
      await expect(page.getByTestId('search-input')).toBeVisible({ timeout: 10000 });
      await page.getByTestId('search-input').fill(fileName);
      await page.waitForTimeout(2000);

      console.log('Checking if document card is visible...');
      const documentCard = page.getByTestId('document-card').filter({ hasText: fileName }).first();
      await expect(documentCard).toBeVisible({ timeout: 15000 });
      await expect(page.locator('text=' + fileName)).toBeVisible();
    });

    test('should handle cancellation', async () => {
      await page.goto('/documents/upload');
      await page.click('button[data-testid="cancel-button"]');
      await expect(page).toHaveURL(/\/documents/);
    });
  });

  test.describe('Document Actions', () => {
    test('should show actions on document card', async () => {
      await page.goto('/documents');

      // Attendre que les documents chargent
      await page.waitForLoadState('networkidle');

      const documentCard = page.getByTestId('document-card').first();

      if (await documentCard.isVisible()) {
        await expect(documentCard.getByTestId('preview-button')).toBeVisible();
        await expect(documentCard.getByTestId('download-button')).toBeVisible();
        await expect(documentCard.getByTestId('delete-button')).toBeVisible();
      } else {
        console.log('No documents found to test actions');
      }
    });

    test('should handle document deletion with confirmation', async () => {
      await page.goto('/documents');

      const documentCard = page.getByTestId('document-card').first();

      if (await documentCard.isVisible()) {
        // Mock window.confirm
        page.on('dialog', async dialog => {
          expect(dialog.message()).toContain('Êtes-vous sûr');
          await dialog.accept();
        });

        await documentCard.getByTestId('delete-button').click();

        // Attendre que l'élément soit supprimé (ou que la page se rafraîchisse)
        await page.waitForTimeout(2000);
      }
    });
  });

  test.describe('Accessibility and Responsiveness', () => {
    test('should be responsive on mobile', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/documents');

      await expect(page.getByTestId('page-title')).toBeVisible();
      await expect(page.getByTestId('add-document-button')).toBeVisible();

      // Revenir à desktop
      await page.setViewportSize({ width: 1280, height: 720 });
    });
  });
});
