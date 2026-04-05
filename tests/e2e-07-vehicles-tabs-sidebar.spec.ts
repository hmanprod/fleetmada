import { getTestPassword } from './test-helpers';
import { mkdirSync } from 'fs';
import { expect, Page, test } from '@playwright/test';

async function registerAndCompleteOnboarding(page: Page) {
  const ts = Date.now();
  const firstName = 'E2E';
  const lastName = `VehiclesTabs${ts}`;
  const email = `e2e.vehicles.tabs.${ts}@example.com`;
  const password = getTestPassword();

  await page.goto('/register');
  await page.locator('input[name="firstName"]').fill(firstName);
  await page.locator('input[name="lastName"]').fill(lastName);
  await page.locator('input[name="companyName"]').fill(`FleetMada Vehicles ${ts}`);
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

async function createVehicle(page: Page) {
  const ts = Date.now();
  const vehicleName = `E2E Vehicle Tabs ${ts}`;
  // VIN must be exactly 17 chars. Build: prefix(3) + timestamp(8) + suffix(6) = 17
  const vinTs = String(ts).slice(-8).padStart(8, '0');
  const vin = `E2E${vinTs}TAB00`; // 3+8+6=17

  await page.goto('/vehicles/list/create');
  await expect(page.getByRole('heading', { name: /Nouveau véhicule/i })).toBeVisible();

  await page
    .locator('label:has-text("Nom du véhicule")')
    .first()
    .locator('xpath=following::input[1]')
    .fill(vehicleName);
  await page
    .locator('label:has-text("VIN/SN")')
    .first()
    .locator('xpath=following::input[1]')
    .fill(vin);
  await page
    .locator('label:has-text("Année")')
    .first()
    .locator('xpath=following::input[1]')
    .fill(String(new Date().getFullYear()));
  await page
    .locator('label:has-text("Marque")')
    .first()
    .locator('xpath=following::input[1]')
    .fill('Toyota');
  await page
    .locator('label:has-text("Modèle")')
    .first()
    .locator('xpath=following::input[1]')
    .fill('Hilux');

  const createResponsePromise = page.waitForResponse(
    (response) => response.url().includes('/api/vehicles') && response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: /^Enregistrer$/ }).click();
  const createResponse = await createResponsePromise;
  const status = createResponse.status();
  let body = '';
  try { body = await createResponse.text(); } catch {}
  console.log(`POST /api/vehicles -> ${status}: ${body}`);
  expect(createResponse.ok(), `HTTP ${status}: ${body}`).toBeTruthy();
  const createBody = await createResponse.json();
  const vehicleId = createBody?.data?.id || createBody?.id;
  expect(vehicleId).toBeTruthy();

  await expect(page).toHaveURL(new RegExp(`/vehicles/list/${vehicleId}$`), { timeout: 20000 });
  await expect(page.getByRole('heading', { name: new RegExp(vehicleName) })).toBeVisible();

  return { vehicleId, vehicleName };
}

test.describe('E2E-07 Vehicles Tabs & Sidebar', () => {
  test('navigation onglets + sidebar', async ({ page }) => {
    test.setTimeout(120000);

    await registerAndCompleteOnboarding(page);
    const { vehicleId, vehicleName } = await createVehicle(page);

    mkdirSync('output/playwright', { recursive: true });

    // Overview
    await expect(page.getByText('Détails')).toBeVisible();
    await page.screenshot({ path: 'output/playwright/e2e-07-vehicles-overview.png', fullPage: true });

    // Specs
    await page.getByTestId('tab-specs').click();
    await expect(page.getByRole('heading', { name: 'Spécifications' })).toBeVisible();
    await page.screenshot({ path: 'output/playwright/e2e-07-vehicles-specs.png', fullPage: true });

    // Financial
    await page.getByTestId('tab-financial').click();
    await expect(page.getByText('Achat et Finance')).toBeVisible();
    await page.screenshot({ path: 'output/playwright/e2e-07-vehicles-financial.png', fullPage: true });

    // Service history
    await page.getByTestId('tab-service-history').click();
    await expect(page.getByRole('columnheader', { name: 'Ordre de travail' })).toBeVisible();

    // Inspection history
    await page.getByTestId('tab-inspection-history').click();
    await expect(page.getByRole('columnheader', { name: 'Inspection' })).toBeVisible();

    // Work orders
    await page.getByTestId('tab-work-orders').click();
    await expect(page.getByRole('columnheader', { name: 'Priorité' })).toBeVisible();

    // Service reminders
    await page.getByTestId('tab-service-reminders').click();
    await expect(page.getByRole('columnheader', { name: 'Tâche de service' })).toBeVisible();
    await page.screenshot({ path: 'output/playwright/e2e-07-vehicles-service-reminders.png', fullPage: true });

    // More tabs -> meter history
    await page.getByTestId('more-tabs-button').click();
    await page.getByRole('button', { name: /Historique des compteurs/i }).click();
    await expect(page.getByRole('columnheader', { name: /Date du compteur/i })).toBeVisible();
    await page.screenshot({ path: 'output/playwright/e2e-07-vehicles-meter-history.png', fullPage: true });

    // Sidebar panels — comments is active by default, so verify it first
    await expect(page.getByTestId('sidebar-panel-content')).toBeVisible();
    await expect(page.getByTestId('comment-input')).toBeVisible();
    await page.screenshot({ path: 'output/playwright/e2e-07-vehicles-sidebar-comments.png', fullPage: true });

    // Toggle photos panel
    await page.getByTestId('sidebar-photos-btn').click();
    await expect(page.getByTestId('upload-area-photos')).toBeVisible();
    await page.screenshot({ path: 'output/playwright/e2e-07-vehicles-sidebar-photos.png', fullPage: true });

    // Toggle documents panel
    await page.getByTestId('sidebar-documents-btn').click();
    await expect(page.getByTestId('upload-area-documents')).toBeVisible();
    await page.screenshot({ path: 'output/playwright/e2e-07-vehicles-sidebar-documents.png', fullPage: true });

    // Return to overview for final snapshot
    await page.getByTestId('tab-overview').click();
    await expect(page.getByRole('heading', { name: new RegExp(vehicleName) })).toBeVisible();
    await page.screenshot({ path: 'output/playwright/e2e-07-vehicles-overview-final.png', fullPage: true });
  });
});
