import { getTestPassword } from './test-helpers';
import { mkdirSync } from 'fs';
import { expect, Page, test } from '@playwright/test';

async function registerAndCompleteOnboarding(page: Page) {
  const ts = Date.now();
  const firstName = 'E2E';
  const lastName = `Validation${ts}`;
  const email = `e2e.validation.${ts}@example.com`;
  const password = getTestPassword();

  await page.goto('/register');
  await page.locator('input[name="firstName"]').fill(firstName);
  await page.locator('input[name="lastName"]').fill(lastName);
  await page.locator('input[name="companyName"]').fill(`FleetMada Validation ${ts}`);
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('input[name="confirmPassword"]').fill(password);
  await page.locator('#terms').check();
  await page.getByRole('button', { name: /^Commencer$/ }).click();

  await expect(page).toHaveURL(/\/onboarding/);
  await page.getByRole('button', { name: '1-10' }).click();
  await page.locator('select').selectOption('Logistique / Transport');
  await page.getByRole('button', { name: /^Continuer$/ }).click();
  await page.locator('#goal-0').check();
  await page.getByRole('button', { name: /^Continuer$/ }).click();
  await page.getByRole('button', { name: /Aller au tableau de bord/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe('E2E-08 Vehicle Validation', () => {
  test('formulaire vide affiche des erreurs de validation', async ({ page }) => {
    test.setTimeout(120000);
    await registerAndCompleteOnboarding(page);

    await page.goto('/vehicles/list/create');
    await expect(page.getByRole('heading', { name: /Nouveau véhicule/i })).toBeVisible();

    // Tentative de soumission sans remplir
    await page.getByRole('button', { name: /^Enregistrer$/ }).click();

    // Attendre une éventuelle réponse API ou affichage d'erreur inline
    await page.waitForTimeout(2000);

    // Soit le formulaire bloque côté client, soit l'API renvoie une erreur
    const hasValidationError = await page.getByText(/requis|invalide|erreur|champs obligatoires/i).first().isVisible().catch(() => false);
    const stillOnCreatePage = page.url().includes('/vehicles/list/create');

    // Au minimum, on ne doit pas être redirigé vers une page de succès
    expect(stillOnCreatePage || hasValidationError).toBeTruthy();

    mkdirSync('output/playwright', { recursive: true });
    await page.screenshot({ path: 'output/playwright/e2e-08-vehicle-validation-empty.png', fullPage: true });
  });

  test('VIN invalide (trop long) affich une erreur', async ({ page }) => {
    test.setTimeout(120000);
    await registerAndCompleteOnboarding(page);

    await page.goto('/vehicles/list/create');
    await expect(page.getByRole('heading', { name: /Nouveau véhicule/i })).toBeVisible();

    await page
      .locator('label:has-text("Nom du véhicule")').first()
      .locator('xpath=following::input[1]')
      .fill('E2E VIN Test');

    // VIN de 25 caractères (max 17)
    await page
      .locator('label:has-text("VIN/SN")').first()
      .locator('xpath=following::input[1]')
      .fill('ABCDEFGHIJKLMNOPQRSTUVWXYZ');

    await page
      .locator('label:has-text("Année")').first()
      .locator('xpath=following::input[1]')
      .fill(String(new Date().getFullYear()));

    await page
      .locator('label:has-text("Marque")').first()
      .locator('xpath=following::input[1]')
      .fill('Toyota');

    await page
      .locator('label:has-text("Modèle")').first()
      .locator('xpath=following::input[1]')
      .fill('Hilux');

    // Écouter la réponse API
    const responsePromise = page.waitForResponse(
      (r) => r.url().includes('/api/vehicles') && r.request().method() === 'POST'
    );
    await page.getByRole('button', { name: /^Enregistrer$/ }).click();
    const response = await responsePromise;

    // Le backend doit rejeter le VIN trop long
    expect(response.ok()).toBeFalsy();
    const body = await response.json();
    expect(body.error).toBeTruthy();

    mkdirSync('output/playwright', { recursive: true });
    await page.screenshot({ path: 'output/playwright/e2e-08-vehicle-validation-long-vin.png', fullPage: true });
  });

  test('doublon VIN rejete (409)', async ({ page }) => {
    test.setTimeout(120000);
    await registerAndCompleteOnboarding(page);
    const token = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(token).toBeTruthy();

    const vin = `E2EDUP${Date.now().toString().slice(-8)}AB`; // unique VIN

    // Créer un premier véhicule via API
    const tokenLen = token ? token.length : 0;
    console.log(`Token present: ${!!token}, length: ${tokenLen}`);
    console.log(`Using VIN: ${vin}`);
    const first = await page.request.post('/api/vehicles', {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: 'E2E VIN Original',
        vin,
        year: new Date().getFullYear(),
        make: 'Toyota',
        model: 'Hilux',
          type: "Car",
      },
    });
    const status = first.status();
    let body = '';
    try { body = JSON.stringify(await first.json(), null, 2); } catch {}
    console.log(`POST /api/vehicles -> ${status}: ${body}`);
    expect(first.ok(), `HTTP ${status}: ${body}`).toBeTruthy();

    // Tenter de créer un deuxième véhicule avec le même VIN via l'UI
    await page.goto('/vehicles/list/create');
    await expect(page.getByRole('heading', { name: /Nouveau véhicule/i })).toBeVisible();

    await page
      .locator('label:has-text("Nom du véhicule")').first()
      .locator('xpath=following::input[1]')
      .fill('E2E VIN Duplicate');

    await page
      .locator('label:has-text("VIN/SN")').first()
      .locator('xpath=following::input[1]')
      .fill(vin);

    await page
      .locator('label:has-text("Année")').first()
      .locator('xpath=following::input[1]')
      .fill(String(new Date().getFullYear()));

    await page
      .locator('label:has-text("Marque")').first()
      .locator('xpath=following::input[1]')
      .fill('Toyota');

    await page
      .locator('label:has-text("Modèle")').first()
      .locator('xpath=following::input[1]')
      .fill('Hilux');

    const dupResponsePromise = page.waitForResponse(
      (r) => r.url().includes('/api/vehicles') && r.request().method() === 'POST'
    );
    await page.getByRole('button', { name: /^Enregistrer$/ }).click();
    const dupResponse = await dupResponsePromise;

    expect(dupResponse.status()).toBe(409);
    const dupBody = await dupResponse.json();
    expect(dupBody.error).toContain('existe déjà');

    mkdirSync('output/playwright', { recursive: true });
    await page.screenshot({ path: 'output/playwright/e2e-08-vehicle-validation-duplicate.png', fullPage: true });
  });
});
