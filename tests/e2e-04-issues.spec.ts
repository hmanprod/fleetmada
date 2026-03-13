import { mkdirSync } from 'fs';
import { expect, Page, test } from '@playwright/test';

async function registerAndCompleteOnboarding(page: Page) {
  const ts = Date.now();
  const firstName = 'E2E';
  const lastName = `Issues${ts}`;
  const email = `e2e.issues.bootstrap.${ts}@example.com`;
  const password = 'Fleetmada!123';

  await page.goto('/register');
  await page.locator('input[name="firstName"]').fill(firstName);
  await page.locator('input[name="lastName"]').fill(lastName);
  await page.locator('input[name="companyName"]').fill(`FleetMada Issues ${ts}`);
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

test.describe('E2E-04 Issues', () => {
  test('creer, lister et modifier un probleme', async ({ page }) => {
    const ts = Date.now();
    const summary = `Issue QA ${ts}`;
    const updatedSummary = `${summary} - Updated`;
    const vin = `E2E${ts}`.slice(0, 17).padEnd(17, '0');

    await registerAndCompleteOnboarding(page);
    const token = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(token).toBeTruthy();

    const vehicleCreateResponse = await page.request.post('/api/vehicles', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        name: `E2E Vehicle ${ts}`,
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

    await page.goto('/issues/create');
    await expect(page.getByRole('heading', { name: /Nouveau probl.me/i })).toBeVisible();

    await page.waitForFunction((id) => {
      const sel = document.querySelector('[data-testid="vehicle-select"]') as HTMLSelectElement | null;
      return !!sel && Array.from(sel.options).some((o) => o.value === id);
    }, vehicleId);

    const vehicleSelect = page.getByTestId('vehicle-select');
    await vehicleSelect.selectOption(vehicleId, { force: true });
    await page.getByTestId('summary-input').fill(summary);

    const createResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/issues') &&
        response.request().method() === 'POST',
    );
    await page.getByTestId('save-button').click();
    const createResponse = await createResponsePromise;
    const createBody = await createResponse.json();
    const issueId = createBody?.issue?.id || createBody?.data?.id;
    expect(issueId).toBeTruthy();

    await expect(page).toHaveURL(/\/issues(\?.*)?$/);
    await expect(page.getByText(summary).first()).toBeVisible();

    await page.goto(`/issues/${issueId}/edit`);
    await expect(page).toHaveURL(new RegExp(`/issues/${issueId}/edit$`));
    await page.getByTestId('summary-input').fill(updatedSummary);
    await page.getByTestId('save-button').click();

    await expect(page).toHaveURL(new RegExp(`/issues/${issueId}$`));
    await expect(page.getByText(updatedSummary).first()).toBeVisible();

    mkdirSync('output/playwright', { recursive: true });
    await page.screenshot({
      path: 'output/playwright/e2e-04-issues-detail.png',
      fullPage: true,
    });
  });
});
