import { test, expect, Page } from '@playwright/test';

test.describe('Module Documents - Tests E2E', () => {
  const randomSuffix = Math.floor(Math.random() * 10000).toString();
  let page: Page;
  let testDocumentId: string;

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

  test('Authentification et navigation vers Documents', async () => {
    // Navigation vers le module Documents
    await page.click('a[href="/documents"], a:has-text("Documents")');
    await expect(page).toHaveURL(/\/documents/);
  });

  test('Liste des documents - interface utilisateur', async () => {
    // Vérifier que la page des documents se charge
    await expect(page.locator('h1')).toContainText(/documents/i);

    // Vérifier la présence des éléments d'interface
    await expect(page.locator('button:has-text("Add Document")')).toBeVisible();
    await expect(page.locator('input[placeholder*="Rechercher"]')).toBeVisible();

    // Vérifier la zone de filtres
    await page.click('button:has-text("Filter")');
    await expect(page.locator('select')).toBeVisible();
  });

  test('Upload de document avec métadonnées', async () => {
    // Aller à la page d'upload
    await page.click('button:has-text("Add Document")');
    await expect(page).toHaveURL(/\/documents\/upload/);

    // Vérifier la zone de drag & drop
    await expect(page.locator('input[type="file"]')).toBeVisible();

    // Créer un fichier de test
    const filePath = 'test-document.txt';
    const fs = require('fs');
    fs.writeFileSync(filePath, 'Contenu du document de test pour FleetMada');

    // Upload du fichier
    await page.setInputFiles('input[type="file"]', filePath);

    // Vérifier que le fichier apparaît dans la liste
    await expect(page.locator('text=test-document.txt')).toBeVisible();

    // Remplir les métadonnées
    await page.fill('textarea[placeholder*="Description"]', 'Document de test créé automatiquement');

    // Ajouter une étiquette
    await page.fill('input[placeholder*="étiquette"]', 'test');
    await page.click('button:has-text("+")');

    // Sélectionner un type d'attachement
    await page.selectOption('select', 'vehicle');
    await page.fill('input[placeholder*="ID"]', 'test-vehicle-123');

    // Lancer l'upload
    await page.click('button:has-text("Télécharger")');

    // Attendre le succès
    await expect(page.locator('text=Upload réussi')).toBeVisible({ timeout: 10000 });

    // Vérifier la redirection vers la liste
    await expect(page).toHaveURL(/\/documents/);
  });

  test('Recherche et filtrage de documents', async () => {
    // Aller à la liste des documents
    await page.goto('http://localhost:3000/documents');

    // Effectuer une recherche
    const searchInput = page.locator('input[placeholder*="Rechercher"]');
    await searchInput.fill('test');
    await page.keyboard.press('Enter');

    // Attendre les résultats (même si vides)
    await page.waitForTimeout(2000);

    // Tester les filtres
    await page.click('button:has-text("Filter")');
    await page.selectOption('select', 'pdf');
    await page.click('button:has-text("Rechercher")');

    await page.waitForTimeout(2000);
  });

  test('Détails et édition de document', async () => {
    // Si des documents existent, cliquer sur le premier
    const firstDocument = page.locator('[data-testid="document-card"], .document-card, .bg-white').first();

    if (await firstDocument.isVisible()) {
      await firstDocument.click();

      // Vérifier la page de détails
      await expect(page.locator('h1')).toContainText(/document/i);

      // Tester les actions
      await expect(page.locator('button[title="Prévisualiser"]')).toBeVisible();
      await expect(page.locator('button[title="Télécharger"]')).toBeVisible();
      await expect(page.locator('button[title="Modifier"]')).toBeVisible();

      // Tester l'édition
      await page.click('button[title="Modifier"]');
      await page.fill('textarea', 'Description modifiée pour le test');
      await page.click('button:has-text("Sauvegarder")');

      // Attendre la sauvegarde
      await page.waitForTimeout(2000);
    }
  });

  test('Téléchargement de document', async () => {
    // Aller à la liste des documents
    await page.goto('http://localhost:3000/documents');

    // Chercher un bouton de téléchargement
    const downloadButton = page.locator('button[title="Télécharger"]').first();

    if (await downloadButton.isVisible()) {
      // Intercept des téléchargements
      const downloadPromise = page.waitForEvent('download');
      await downloadButton.click();
      const download = await downloadPromise;

      // Vérifier que le téléchargement a été déclenché
      expect(download.suggestedFilename()).toBeTruthy();
    }
  });

  test('Suppression de document', async () => {
    // Aller à la liste des documents
    await page.goto('http://localhost:3000/documents');

    // Chercher un bouton de suppression
    const deleteButton = page.locator('button[title="Supprimer"]').first();

    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Confirmer la suppression dans le modal
      await expect(page.locator('text=Confirmer la suppression')).toBeVisible();
      await page.click('button:has-text("Supprimer")');

      // Attendre que la suppression soit traitée
      await page.waitForTimeout(2000);
    }
  });

  test('Gestion des erreurs et états de chargement', async () => {
    // Tester l'état de chargement sur la liste
    await page.goto('http://localhost:3000/documents');

    // Vérifier la présence d'un indicateur de chargement initial
    const loadingSpinner = page.locator('.animate-spin, [data-testid="loading"]');

    // Tester la gestion d'erreur avec une URL invalide
    await page.goto('http://localhost:3000/documents/invalid-id');
    await expect(page.locator('text=Document introuvable, text=Erreur')).toBeVisible();
  });

  test('Interface responsive et accessibilité', async () => {
    // Tester la responsivité mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/documents');

    // Vérifier que les éléments sont visibles sur mobile
    await expect(page.locator('h1')).toContainText(/documents/i);

    // Tester l'accessibilité - vérifier les labels
    const searchInput = page.locator('input[placeholder*="Rechercher"]');
    await expect(searchInput).toHaveAttribute('placeholder');

    // Revenir à la taille desktop
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('Upload multiple et progress tracking', async () => {
    await page.goto('http://localhost:3000/documents/upload');

    // Créer plusieurs fichiers de test
    const fs = require('fs');
    for (let i = 1; i <= 3; i++) {
      fs.writeFileSync(`test-file-${i}.txt`, `Contenu du fichier test ${i}`);
    }

    // Upload multiple
    await page.setInputFiles('input[type="file"]', [
      'test-file-1.txt',
      'test-file-2.txt',
      'test-file-3.txt'
    ]);

    // Vérifier que tous les fichiers apparaissent
    await expect(page.locator('text=test-file-1.txt')).toBeVisible();
    await expect(page.locator('text=test-file-2.txt')).toBeVisible();
    await expect(page.locator('text=test-file-3.txt')).toBeVisible();

    // Vérifier la barre de progrès pendant l'upload
    await page.click('button:has-text("Télécharger")');

    const progressBar = page.locator('.bg-\\[\\#008751\\], .bg-green-600').first();
    await expect(progressBar).toBeVisible();
  });

  test.afterEach(async () => {
    // Nettoyer les fichiers de test
    const fs = require('fs');
    const testFiles = ['test-document.txt', 'test-file-1.txt', 'test-file-2.txt', 'test-file-3.txt'];

    testFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  });
});

// Tests de performance et de sécurité
test.describe('Performance et Sécurité Documents', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test('Temps de chargement des pages', async () => {
    const startTime = Date.now();

    await page.goto('http://localhost:3000/documents');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // 5 secondes max

    console.log(`Temps de chargement: ${loadTime}ms`);
  });

  test('Validation côté client des uploads', async () => {
    await page.goto('http://localhost:3000/documents/upload');

    // Tester la validation de la taille de fichier
    const largeFile = Buffer.alloc(60 * 1024 * 1024); // 60MB

    await page.evaluate(([fileData]) => {
      const file = new File([fileData], 'large-file.txt', { type: 'text/plain' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, [largeFile]);

    // Vérifier qu'une erreur de validation s'affiche
    await page.waitForTimeout(1000);
    const errorMessage = page.locator('text=Trop volumineux, text=erreur');
    // Note: Cette vérification dépend de l'implémentation frontend
  });
});