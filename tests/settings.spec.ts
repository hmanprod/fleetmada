import { test, expect } from '@playwright/test';

test.describe('Module Settings', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('email-input').fill('admin@fleetmadagascar.mg');
    await page.getByTestId('password-input').fill('testpassword123');
    await page.getByTestId('login-button').click();

    await page.waitForURL('**/dashboard**', { timeout: 30000 });

    try {
      await page.locator('text=Chargement des données...').waitFor({ state: 'hidden', timeout: 45000 });
    } catch {
      // ignore
    }

    const modalClose = page.locator('button:has-text("Plus tard"), button[aria-label="Close"], .modal-close').first();
    if (await modalClose.isVisible({ timeout: 2000 }).catch(() => false)) {
      await modalClose.click();
    }
  });

  test.describe('Paramètres Généraux', () => {
    test('devrait afficher et modifier les paramètres généraux', async ({ page }) => {
      await page.goto('/settings/general');

      // Vérifier le chargement de la page
      await expect(page.getByRole('heading', { name: 'Paramètres généraux' })).toBeVisible();

      // Modifier le nom de l'entreprise
      const companyNameInput = page
        .locator('label:has-text("Nom de l\\\'entreprise")')
        .locator('..')
        .locator('input');
      await companyNameInput.fill('FleetMada Test Corp');

      // Sauvegarder
      await page.getByRole('button', { name: /^Enregistrer$/ }).click();

      // Vérifier le message de succès
      await expect(page.getByText(/Paramètres mis à jour avec succès/i)).toBeVisible({ timeout: 20000 });
    });
  });

  test.describe('Profil Utilisateur', () => {
    test('devrait permettre de modifier le profil', async ({ page }) => {
      await page.goto('/settings/user-profile');

      // Vérifier le titre
      await expect(page.getByRole('heading', { name: 'Profil utilisateur' })).toBeVisible();

      // Modifier le prénom
      await page.getByLabel(/Prénom/i).fill('Test');
      await page.getByLabel(/^Nom/i).fill('User');

      // Sauvegarder
      const profileUpdate = page.waitForResponse(
        res => res.url().includes('/api/profile') && res.request().method() === 'PUT',
        { timeout: 30000 }
      );
      const preferencesUpdate = page.waitForResponse(
        res => res.url().includes('/api/settings/preferences') && res.request().method() === 'PUT',
        { timeout: 30000 }
      );

      await page.locator('form').getByRole('button', { name: /^Enregistrer$/ }).click();

      const [profileResponse, preferencesResponse] = await Promise.all([profileUpdate, preferencesUpdate]);
      expect(profileResponse.ok()).toBeTruthy();
      expect(preferencesResponse.ok()).toBeTruthy();
    });
  });

  test.describe('Sécurité', () => {
    test('devrait afficher les options de sécurité', async ({ page }) => {
      await page.goto('/settings/login-password');

      await expect(page.getByRole('heading', { name: /Identifiant/i })).toBeVisible();

      // Vérifier les onglets
      await expect(page.getByRole('button', { name: 'Informations de connexion' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Changer le mot de passe' })).toBeVisible();

      // Tester le changement d'onglet
      await page.getByRole('button', { name: 'Changer le mot de passe' }).click();

      // Vérifier les champs de mot de passe
      await expect(page.locator('input[type="password"]')).toHaveCount(3);
    });

    test('devrait valider les mots de passe', async ({ page }) => {
      await page.goto('/settings/login-password');
      await page.getByRole('button', { name: 'Changer le mot de passe' }).click();

      // Remplir avec des mots de passe qui ne correspondent pas
      const inputs = page.locator('input[type="password"]');
      await inputs.nth(0).fill('oldpass');
      await inputs.nth(1).fill('newpass123');
      await inputs.nth(2).fill('mismatch123');

      await page.getByRole('button', { name: /^Enregistrer$/ }).click();

      // Vérifier le message d'erreur
      await expect(page.getByText(/ne correspondent pas/i)).toBeVisible();
    });
  });
});
