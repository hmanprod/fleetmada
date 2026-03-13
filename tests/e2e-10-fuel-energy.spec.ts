import { mkdirSync } from 'fs';
import { expect, Page, test } from '@playwright/test';

async function registerAndCompleteOnboarding(page: Page) {
  const ts = Date.now();
  const firstName = 'E2E';
  const lastName = `Fuel${ts}`;
  const email = `e2e.fuel.bootstrap.${ts}@example.com`;
  const password = 'Fleetmada!123';

  await page.goto('/register');
  await page.locator('input[name="firstName"]').fill(firstName);
  await page.locator('input[name="lastName"]').fill(lastName);
  await page.locator('input[name="companyName"]').fill(`FleetMada Fuel ${ts}`);
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

test.describe('E2E-10 Fuel & Energy', () => {
  test('creer entrees carburant et recharge puis verifier historique/detail/edit', async ({ page }) => {
    const ts = Date.now();
    const vehicleName = `E2E Fuel Vehicle ${ts}`;
    const vin = `E2EFUEL${ts}`.slice(0, 17).padEnd(17, '0');
    const chargingLocation = `Station E2E ${ts}`;

    await registerAndCompleteOnboarding(page);

    const token = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(token).toBeTruthy();

    const vehicleCreateResponse = await page.request.post('/api/vehicles', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        name: vehicleName,
        vin,
        type: 'Car',
        year: new Date().getFullYear(),
        make: 'Toyota',
        model: 'Prius',
      },
    });
    expect(vehicleCreateResponse.ok()).toBeTruthy();
    const vehicleCreateBody = await vehicleCreateResponse.json();
    const vehicleId = vehicleCreateBody?.data?.id || vehicleCreateBody?.id;
    expect(vehicleId).toBeTruthy();

    await page.goto('/fuel/history/create');
    await expect(
      page.getByRole('heading', { name: /Nouvelle entr.e de carburant/i }),
    ).toBeVisible();
    await page.getByTestId('vehicle-select').selectOption(vehicleId);
    await page.getByTestId('date-input').fill('2026-03-06T10:30');
    await page.getByTestId('vendor-select').selectOption('Shell');
    await page.getByTestId('volume-input').fill('42.5');
    await page.getByTestId('cost-input').fill('300000');

    const fuelCreateResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/fuel/entries') &&
        response.request().method() === 'POST',
    );
    await page.getByTestId('save-button').click();
    const fuelCreateResponse = await fuelCreateResponsePromise;
    expect(fuelCreateResponse.ok()).toBeTruthy();
    const fuelCreateBody = await fuelCreateResponse.json();
    const fuelEntryId = fuelCreateBody?.id || fuelCreateBody?.data?.id;
    expect(fuelEntryId).toBeTruthy();

    await expect(page).toHaveURL(/\/fuel\/history$/, { timeout: 20000 });
    await expect(page.getByTestId('page-title')).toBeVisible();

    await page
      .locator('input[placeholder="Rechercher..."]')
      .first()
      .fill(vehicleName);
    const fuelRow = page.locator('tbody tr').filter({ hasText: vehicleName });
    await expect(fuelRow.first()).toBeVisible();
    await expect(fuelRow.first()).toContainText('Shell');
    await fuelRow.first().click();

    await expect(page).toHaveURL(new RegExp(`/fuel/history/${fuelEntryId}$`));
    await expect(page.getByRole('heading', { name: /Entr.e de carburant/i })).toBeVisible();

    await page.goto(`/fuel/history/${fuelEntryId}/edit`);
    await expect(
      page.getByRole('heading', { name: /Modifier l'entr.e de carburant/i }),
    ).toBeVisible();
    await page
      .getByRole('button', { name: /Enregistrer les modifications/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/fuel\/history$/, { timeout: 20000 });

    await page.goto('/fuel/charging/create');
    await expect(
      page.getByRole('heading', { name: /Nouvelle recharge/i }),
    ).toBeVisible();
    await page.getByTestId('vehicle-select').selectOption(vehicleId);
    await page.getByTestId('vendor-select').selectOption('Tesla');
    await page.getByTestId('start-date-input').fill('2026-03-06');
    await page.getByTestId('start-time-input').fill('09:00');
    await page.getByTestId('end-date-input').fill('2026-03-06');
    await page.getByTestId('end-time-input').fill('10:15');
    await page.getByTestId('energy-input').fill('20');
    await page.getByTestId('price-input').fill('1500');
    await page.getByPlaceholder('Lieu de la station de charge').fill(chargingLocation);
    await expect(page.getByTestId('cost-input')).toHaveValue('30000');

    const chargingCreateResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/charging/entries') &&
        response.request().method() === 'POST',
    );
    await page.getByTestId('save-button').click();
    const chargingCreateResponse = await chargingCreateResponsePromise;
    expect(chargingCreateResponse.ok()).toBeTruthy();
    const chargingCreateBody = await chargingCreateResponse.json();
    const chargingEntryId = chargingCreateBody?.id || chargingCreateBody?.data?.id;
    expect(chargingEntryId).toBeTruthy();

    await expect(page).toHaveURL(/\/fuel\/charging$/, { timeout: 20000 });
    await expect(page.getByTestId('page-title')).toBeVisible();

    await page
      .locator('input[placeholder="Rechercher..."]')
      .first()
      .fill(chargingLocation);
    const chargingRow = page.locator('tbody tr').filter({ hasText: chargingLocation });
    await expect(chargingRow.first()).toBeVisible();
    await expect(chargingRow.first()).toContainText(vehicleName);
    await chargingRow.first().click();

    await expect(page).toHaveURL(new RegExp(`/fuel/charging/${chargingEntryId}$`));
    await expect(page.getByRole('heading', { name: /Recharge #/i })).toBeVisible();

    mkdirSync('output/playwright', { recursive: true });
    await page.screenshot({
      path: 'output/playwright/e2e-10-fuel-energy-charging-detail.png',
      fullPage: true,
    });

    await page.goto(`/fuel/charging/${chargingEntryId}/edit`);
    await expect(page.getByRole('heading', { name: /Modifier la recharge/i })).toBeVisible();
    await page
      .getByRole('button', { name: /Enregistrer les modifications/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/fuel\/charging$/, { timeout: 20000 });
  });
});
