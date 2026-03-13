import { mkdirSync } from 'fs';
import { expect, Page, test } from '@playwright/test';

async function registerAndCompleteOnboarding(page: Page) {
  const ts = Date.now();
  const firstName = 'E2E';
  const lastName = `Dashboard${ts}`;
  const email = `e2e.dashboard.bootstrap.${ts}@example.com`;
  const password = 'Fleetmada!123';

  await page.goto('/register');
  await page.locator('input[name="firstName"]').fill(firstName);
  await page.locator('input[name="lastName"]').fill(lastName);
  await page.locator('input[name="companyName"]').fill(`FleetMada Dashboard ${ts}`);
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

test.describe('E2E-14 Dashboard', () => {
  test('verifier kpi, navigation onglets, refresh et coherence des donnees', async ({
    page,
  }) => {
    const ts = Date.now();
    const vehicleName = `E2E Dashboard Vehicle ${ts}`;
    const issueSummary = `E2E Dashboard Issue ${ts}`;
    const vin = `E2EDASH${ts}`.slice(0, 17).padEnd(17, '0');

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
        model: 'Corolla',
      },
    });
    expect(vehicleCreateResponse.ok()).toBeTruthy();
    const vehicleCreateBody = await vehicleCreateResponse.json();
    const vehicleId = vehicleCreateBody?.data?.id as string;
    expect(vehicleId).toBeTruthy();

    const issueCreateResponse = await page.request.post('/api/issues', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        vehicleId,
        summary: issueSummary,
        description: `Description issue dashboard ${ts}`,
        priority: 'CRITICAL',
      },
    });
    expect(issueCreateResponse.ok()).toBeTruthy();

    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard-title')).toContainText('Dashboard FleetMada');

    await expect(page.getByTestId('metric-card-total-vehicles')).toBeVisible({
      timeout: 30000,
    });
    await expect(page.getByTestId('metric-card-total-vehicles')).toContainText('Total Véhicules');
    await expect(page.getByTestId('metric-card-total-costs')).toBeVisible();
    await expect(page.getByTestId('metric-card-maintenance')).toBeVisible();
    await expect(page.getByTestId('alert-summary')).toBeVisible();

    await page.getByTestId('dashboard-vehicles-tab').click();
    await expect(page.getByRole('heading', { name: 'Véhicules Récents' })).toBeVisible();
    await expect(page.getByText(vehicleName).first()).toBeVisible({ timeout: 20000 });

    await page.getByTestId('dashboard-issues-tab').click();
    await expect(page.getByTestId('issues-status')).toBeVisible();
    await expect(page.getByText(issueSummary).first()).toBeVisible({ timeout: 20000 });

    await page.getByTestId('dashboard-costs-tab').click();
    await expect(page.getByText('Analyse des Coûts').first()).toBeVisible();

    await page.getByTestId('dashboard-maintenance-tab').click();
    await expect(
      page.getByRole('heading', { name: 'État Général de Maintenance' }),
    ).toBeVisible();

    const refreshResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/dashboard/overview') &&
        response.request().method() === 'GET',
    );
    await page.getByTestId('refresh-button').click();
    const refreshResponse = await refreshResponsePromise;
    expect(refreshResponse.ok()).toBeTruthy();

    mkdirSync('output/playwright', { recursive: true });
    await page.screenshot({
      path: 'output/playwright/e2e-14-dashboard-maintenance.png',
      fullPage: true,
    });
  });
});
