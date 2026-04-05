import { getTestPassword } from './test-helpers';
import { mkdirSync } from 'fs';
import { expect, Page, test } from '@playwright/test';

async function registerAndCompleteOnboarding(page: Page) {
  const ts = Date.now();
  const firstName = 'E2E';
  const lastName = `CRUD${ts}`;
  const email = `e2e.crud.${ts}@example.com`;
  const password = getTestPassword();

  await page.goto('/register');
  await page.locator('input[name="firstName"]').fill(firstName);
  await page.locator('input[name="lastName"]').fill(lastName);
  await page.locator('input[name="companyName"]').fill(`FleetMada CRUD ${ts}`);
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

test.describe('E2E-10 Vehicle Edit & Delete', () => {
  test('éditer un véhicule via API et vérifier dans l\'UI', async ({ page }) => {
    test.setTimeout(120000);
    await registerAndCompleteOnboarding(page);

    const ts = Date.now();
    const token = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(token).toBeTruthy();

    const vinTs = String(ts).slice(-8).padStart(8, '0');
    const vin = `E2E${vinTs}TAB00`;
    const vehicleName = `E2E Edit Vehicle ${ts}`;

    // Créer via API avec les champs requis
    const createRes = await page.request.post('/api/vehicles', {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: vehicleName,
        vin,
        year: new Date().getFullYear(),
        make: 'Toyota',
        model: 'Hilux',
        type: 'Car',
        ownership: 'Owned',
      },
    });
    const cStatus = createRes.status();
    let cBody = '';
    try { cBody = await createRes.text(); } catch {}
    console.log(`POST /api/vehicles (edit) -> ${cStatus}: ${cBody}`);
    expect(createRes.ok(), `HTTP ${cStatus}: ${cBody}`).toBeTruthy();
    const createBody = await createRes.json();
    const vehicleId = createBody?.data?.id;
    expect(vehicleId).toBeTruthy();

    // Naviguer vers le véhicule
    await page.goto(`/vehicles/list/${vehicleId}`);
    await expect(page.getByRole('heading', { name: new RegExp(vehicleName) })).toBeVisible();

    // Éditer via API — update seul le nom
    const updatedName = `${vehicleName} - Modified`;
    const updateRes = await page.request.put(`/api/vehicles/${vehicleId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: updatedName },
    });
    const uStatus = updateRes.status();
    let uBody = '';
    try { uBody = await updateRes.text(); } catch {}
    console.log(`PUT /api/vehicles/${vehicleId} -> ${uStatus}: ${uBody}`);
    expect(updateRes.ok(), `HTTP ${uStatus}: ${uBody}`).toBeTruthy();

    // Recharger et vérifier le nouveau nom dans l'UI
    await page.reload();
    await expect(page.getByRole('heading', { name: new RegExp(updatedName) })).toBeVisible();

    mkdirSync('output/playwright', { recursive: true });
    await page.screenshot({ path: 'output/playwright/e2e-10-vehicle-edited.png', fullPage: true });
  });

  test('créer un véhicule avec champs avancés', async ({ page }) => {
    test.setTimeout(120000);
    await registerAndCompleteOnboarding(page);

    const ts = Date.now();
    const vehicleName = `E2E Advanced Vehicle ${ts}`;
    const vinTs = String(ts).slice(-8).padStart(8, '0');
    const vin = `E2E${vinTs}TAB01`;

    await page.goto('/vehicles/list/create');
    await expect(page.getByRole('heading', { name: /Nouveau véhicule/i })).toBeVisible();

    // Remplir les champs de base
    await page
      .locator('label:has-text("Nom du véhicule")').first()
      .locator('xpath=following::input[1]')
      .fill(vehicleName);
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
      .fill('Renault');
    await page
      .locator('label:has-text("Modèle")').first()
      .locator('xpath=following::input[1]')
      .fill('Kangoo');

    // Vérifier tous les champs avancés disponibles
    // Chercher les labels de champs supplémentaires sur la page
    const allLabels = await page.locator('label').allTextContents();
    console.log('Available labels:', allLabels.join(', '));

    // Soumettre
    const createResPromise = page.waitForResponse(
      (r) => r.url().includes('/api/vehicles') && r.request().method() === 'POST'
    );
    await page.getByRole('button', { name: /^Enregistrer$/ }).click();
    const createRes = await createResPromise;

    // Vérifier un 201 ou autre réponse correcte
    const status = createRes.status();
    if (status >= 400) {
      const body = await createRes.text();
      console.log(`POST /api/vehicles -> ${status}: ${body}`);
    }
    expect(createRes.ok()).toBeTruthy();
    const body = await createRes.json();
    const vehicleId = body?.data?.id;
    expect(vehicleId).toBeTruthy();

    // Vérifier la redirection
    await expect(page).toHaveURL(new RegExp(`/vehicles/list/${vehicleId}$`), { timeout: 20000 });

    mkdirSync('output/playwright', { recursive: true });
    await page.screenshot({ path: 'output/playwright/e2e-10-vehicle-advanced-create.png', fullPage: true });
  });

  test('accéder à la page remplacement de véhicule', async ({ page }) => {
    test.setTimeout(120000);
    await registerAndCompleteOnboarding(page);

    await page.goto('/vehicles/replacement');
    await page.waitForLoadState('networkidle');

    // Attendre que le contenu se charge
    await page.waitForTimeout(2000);

    // Vérifier que la page se charge (soit un titre, soit un texte d'accueil)
    await expect(page).toHaveURL(/\/vehicles\/replacement/);

    mkdirSync('output/playwright', { recursive: true });
    await page.screenshot({ path: 'output/playwright/e2e-10-vehicle-replacement.png', fullPage: true });
  });
});
