import { test, expect, Page } from '@playwright/test';

test.describe('Module Settings', () => {
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

  test.describe('Paramètres Généraux', () => {
    test('devrait afficher et modifier les paramètres généraux', async ({ page }) => {
      await page.goto('/settings/general');

      // Vérifier le chargement de la page
      await expect(page.locator('h1')).toContainText('Paramètres généraux');

      // Modifier le nom de l'entreprise
      const companyNameInput = page.locator('input[value="ONNO"]').first();
      // Si le champ n'a pas la valeur par défaut, on le cherche par son label ou autre attribut
      const nameInput = page.locator('input').first(); // Simplification pour l'exemple

      await nameInput.fill('FleetMada Test Corp');

      // Sauvegarder
      await page.click('button:has-text("Enregistrer")'); // Adapter le sélecteur selon l'UI réelle

      // Vérifier le message de succès
      await expect(page.locator('.text-green-600')).toBeVisible();
      await expect(page.locator('.text-green-600')).toContainText('succès');
    });
  });

  test.describe('Profil Utilisateur', () => {
    test('devrait permettre de modifier le profil', async ({ page }) => {
      await page.goto('/settings/user-profile');

      // Vérifier le titre
      await expect(page.locator('h1')).toContainText('Profil utilisateur');

      // Modifier le prénom
      await page.fill('input[name="firstName"]', 'Test');
      await page.fill('input[name="lastName"]', 'User');

      // Changer une préférence
      await page.selectOption('select', { value: '100' }); // Items per page

      // Sauvegarder
      await page.click('button[type="submit"]');

      // Vérifier le succès
      await expect(page.locator('.text-green-600')).toBeVisible();
    });
  });

  test.describe('Sécurité', () => {
    test('devrait afficher les options de sécurité', async ({ page }) => {
      await page.goto('/settings/login-password');

      // Vérifier les onglets
      await expect(page.locator('button:has-text("Informations de connexion")')).toBeVisible();
      await expect(page.locator('button:has-text("Changer le mot de passe")')).toBeVisible();

      // Tester le changement d'onglet
      await page.click('button:has-text("Changer le mot de passe")');

      // Vérifier les champs de mot de passe
      await expect(page.locator('input[type="password"]')).toHaveCount(3);
    });

    test('devrait valider les mots de passe', async ({ page }) => {
      await page.goto('/settings/login-password');
      await page.click('button:has-text("Changer le mot de passe")');

      // Remplir avec des mots de passe qui ne correspondent pas
      const inputs = page.locator('input[type="password"]');
      await inputs.nth(0).fill('oldpass');
      await inputs.nth(1).fill('newpass123');
      await inputs.nth(2).fill('mismatch123');

      await page.click('button:has-text("Enregistrer")');

      // Vérifier le message d'erreur
      await expect(page.locator('text=Les mots de passe ne correspondent pas')).toBeVisible();
    });
  });
});
