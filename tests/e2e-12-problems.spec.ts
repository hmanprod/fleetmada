import { mkdirSync } from 'fs';
import { expect, Page, test } from '@playwright/test';

async function registerAndCompleteOnboarding(page: Page) {
  const ts = Date.now();
  const firstName = 'E2E';
  const lastName = `Problems${ts}`;
  const email = `e2e.problems.bootstrap.${ts}@example.com`;
  const password = 'Fleetmada!123';

  await page.goto('/register');
  await page.locator('input[name="firstName"]').fill(firstName);
  await page.locator('input[name="lastName"]').fill(lastName);
  await page.locator('input[name="companyName"]').fill(`FleetMada Problems ${ts}`);
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

test.describe('E2E-12 Problems', () => {
  test('creer, modifier priorite, resoudre et verifier en liste', async ({ page }) => {
    const ts = Date.now();
    const issueSummary = `E2E Problem ${ts}`;
    const updatedIssueSummary = `${issueSummary} Updated`;
    const vehicleName = `E2E Problems Vehicle ${ts}`;
    const vin = `E2EPRB${ts}`.slice(0, 17).padEnd(17, '0');

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

    await page.goto('/issues/create');
    await expect(page.getByRole('heading', { name: /Nouveau Probl.me/i })).toBeVisible();

    await page.waitForFunction((id) => {
      const sel = document.querySelector(
        '[data-testid="vehicle-select"]',
      ) as HTMLSelectElement | null;
      return !!sel && Array.from(sel.options).some((o) => o.value === id);
    }, vehicleId);
    await page.getByTestId('vehicle-select').selectOption(vehicleId, { force: true });
    await page.getByTestId('priority-select').selectOption('HIGH', { force: true });
    await page.getByTestId('summary-input').fill(issueSummary);
    await page
      .getByTestId('description-textarea')
      .fill(`Description problème E2E ${ts}`);

    const createResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/issues') &&
        response.request().method() === 'POST',
    );
    await page.getByTestId('save-button').click();
    const createResponse = await createResponsePromise;
    expect(createResponse.ok()).toBeTruthy();
    const createBody = await createResponse.json();
    const issueId = createBody?.issue?.id || createBody?.data?.id;
    expect(issueId).toBeTruthy();

    await expect(page).toHaveURL(/\/issues(\?.*)?$/, { timeout: 20000 });
    await expect(page.getByTestId('issues-list')).toBeVisible();
    await page.getByTestId('search-input').fill(issueSummary);
    await expect(page.getByText(issueSummary).first()).toBeVisible();
    await page.getByText(issueSummary).first().click();

    await expect(page).toHaveURL(new RegExp(`/issues/${issueId}$`), {
      timeout: 20000,
    });
    await expect(page.getByRole('heading', { name: new RegExp(issueSummary) })).toBeVisible();
    await expect(page.getByTestId('issue-status')).toContainText('OPEN');
    await expect(page.getByTestId('issue-priority')).toContainText('HIGH');

    await page.getByRole('button', { name: /^Modifier$/ }).click();
    await expect(page).toHaveURL(new RegExp(`/issues/${issueId}/edit$`));
    await page.getByTestId('priority-select').selectOption('CRITICAL');
    await page.getByTestId('summary-input').fill(updatedIssueSummary);

    const updateResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes(`/api/issues/${issueId}`) &&
        response.request().method() === 'PUT',
    );
    await page.getByTestId('save-button').click();
    const updateResponse = await updateResponsePromise;
    expect(updateResponse.ok()).toBeTruthy();

    await expect(page).toHaveURL(new RegExp(`/issues/${issueId}$`), {
      timeout: 20000,
    });
    await expect(
      page.getByRole('heading', { name: new RegExp(updatedIssueSummary) }),
    ).toBeVisible();
    await expect(page.getByTestId('issue-priority')).toContainText('CRITICAL');

    await page.getByRole('button', { name: /^R.soudre$/ }).click();
    await page
      .getByPlaceholder(
        'Décrivez les travaux effectués pour résoudre ce problème.',
      )
      .fill(`Résolution E2E ${ts}`);

    const resolveResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes(`/api/issues/${issueId}/status`) &&
        response.request().method() === 'POST',
    );
    await page.getByRole('button', { name: /R.soudre le probl.me/i }).click();
    const resolveResponse = await resolveResponsePromise;
    expect(resolveResponse.ok()).toBeTruthy();
    await expect(page.getByTestId('issue-status')).toContainText('RESOLVED');

    mkdirSync('output/playwright', { recursive: true });
    await page.screenshot({
      path: 'output/playwright/e2e-12-problems-detail.png',
      fullPage: true,
    });

    await page.goto('/issues');
    await expect(page.getByTestId('issues-list')).toBeVisible();
    await page.getByTestId('status-tab-RESOLVED').click();
    await page.getByTestId('search-input').fill(updatedIssueSummary);
    await expect(page.getByText(updatedIssueSummary).first()).toBeVisible();
  });
});
