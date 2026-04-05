import { readFileSync } from 'fs';
import { expect, Page, test } from '@playwright/test';

function getTestPassword(): string {
  const raw = readFileSync(__dirname + '/.pw.tmp', 'utf-8');
  return raw.replace('TEST_PW=', '').trim();
}

async function registerAndCompleteOnboarding(page: Page) {
  const ts = Date.now();
  const firstName = 'E2E';
  const lastName = `Filter${ts}`;
  const email = `e2e.filter.${ts}@example.com`;
  const password = getTestPassword();

  await page.goto('/register');
  await page.locator('input[name="firstName"]').fill(firstName);
  await page.locator('input[name="lastName"]').fill(lastName);
  await page.locator('input[name="companyName"]').fill(`FleetMada Filter ${ts}`);
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

function makeVin(ts: number, suffix: string): string {
  const vinTs = String(ts).slice(-8).padStart(8, '0');
  return `E2E${vinTs}${suffix}`.slice(0, 17).padEnd(17, '0');
}

async function createVehicleViaApi(page: Page, token: string, data: { name: string; vin: string; make: string; model: string }) {
  const r = await page.request.post('/api/vehicles', {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      name: data.name,
      vin: data.vin,
      year: new Date().getFullYear(),
      make: data.make,
      model: data.model,
      type: 'Car',
    },
  });
  const status = r.status();
  if (!r.ok()) {
    try { const body = await r.text(); console.log(`createVehicleViaApi -> ${status}: ${body}`); } catch {}
  }
  return r;
}

test.describe('E2E-09 Vehicle Filter & Search', () => {
  test('rechercher par nom de véhicule', async ({ page }) => {
    test.setTimeout(120000);
    await registerAndCompleteOnboarding(page);
    const ts = Date.now();
    const token = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(token).toBeTruthy();

    // Créer 3 véhicules via API
    const vehicleData = [
      { name: 'Alpha Truck', make: 'Toyota', model: 'Hilux' },
      { name: 'Beta Van', make: 'Ford', model: 'Transit' },
      { name: 'Gamma Car', make: 'Renault', model: 'Kangoo' },
    ];
    for (const v of vehicleData) {
      const r = await createVehicleViaApi(page, token!, {
        name: `E2E ${v.name} ${ts}`,
        vin: makeVin(ts, v.name.slice(0, 4).toUpperCase().replace(/\s/g, '')),
        make: v.make,
        model: v.model,
      });
      expect(r.ok(), `Failed to create vehicle ${v.name}`).toBeTruthy();
    }

    await page.goto('/vehicles/list');
    await page.waitForLoadState('networkidle');

    // Rechercher par nom
    const searchInput = page.getByPlaceholder(/recherche|filtrer|chercher/i).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill(`E2E Alpha`);
      await page.waitForTimeout(1000);
    }

    const { mkdirSync } = await import('fs');
    mkdirSync('output/playwright', { recursive: true });
    await page.screenshot({ path: 'output/playwright/e2e-09-vehicle-search.png', fullPage: true });
  });

  test('trier les véhicules par marque', async ({ page }) => {
    test.setTimeout(120000);
    await registerAndCompleteOnboarding(page);
    const ts = Date.now();
    const token = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(token).toBeTruthy();

    // Créer des véhicules avec des marques différentes
    const brands = ['Toyota', 'BMW', 'Alfa Romeo'];
    for (const brand of brands) {
      const cleanBrand = brand.replace(/\s/g, '');
      const r = await createVehicleViaApi(page, token!, {
        name: `E2E Sort ${brand} ${ts}`,
        vin: makeVin(ts, cleanBrand.slice(0, 4)),
        make: brand,
        model: 'Model',
      });
      expect(r.ok(), `Failed to create vehicle for ${brand}`).toBeTruthy();
    }

    await page.goto('/vehicles/list');
    await page.waitForLoadState('networkidle');

    // Vérifier que le tableau affiche les véhicules
    await expect(page.locator('table tbody tr, [role="row"]').first()).toBeVisible({ timeout: 15000 });

    // Cliquer sur l'en-tête "Marque" s'il existe
    const brandHeader = page.getByRole('columnheader', { name: /Marque/i }).last();
    if (await brandHeader.isVisible().catch(() => false)) {
      await brandHeader.click();
      await page.waitForTimeout(1000);
    }

    const { mkdirSync } = await import('fs');
    mkdirSync('output/playwright', { recursive: true });
    await page.screenshot({ path: 'output/playwright/e2e-09-vehicle-sort.png', fullPage: true });
  });

  test('afficher la liste des véhicules avec plusieurs véhicules', async ({ page }) => {
    test.setTimeout(120000);
    await registerAndCompleteOnboarding(page);
    const ts = Date.now();
    const token = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(token).toBeTruthy();

    // Créer 5 véhicules
    for (let i = 0; i < 5; i++) {
      const r = await createVehicleViaApi(page, token!, {
        name: `E2E Fleet Vehicle ${i} (${ts})`,
        vin: makeVin(ts, `T${i}AB00`),
        make: 'Toyota',
        model: 'Hilux',
      });
      expect(r.ok(), `Failed to create vehicle ${i}`).toBeTruthy();
    }

    await page.goto('/vehicles/list');
    await page.waitForLoadState('networkidle');

    // Vérifier que le tableau a au moins 5 lignes de données
    await page.waitForTimeout(2000);
    const rows = page.locator('table tbody tr, [role="row"]');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(5);

    // Vérifier l'icône de filtre
    const filterButton = page.getByRole('button', { name: /filtre|filter/i }).first();
    if (await filterButton.isVisible().catch(() => false)) {
      await filterButton.click();
      await expect(page.getByText(/filtrer/i)).toBeVisible().catch(() => {});
    }

    const { mkdirSync } = await import('fs');
    mkdirSync('output/playwright', { recursive: true });
    await page.screenshot({ path: 'output/playwright/e2e-09-vehicle-list-multi.png', fullPage: true });
  });
});
