import { mkdirSync } from 'fs';
import { expect, Page, test } from '@playwright/test';

async function registerAndCompleteOnboarding(page: Page) {
  const ts = Date.now();
  const firstName = 'E2E';
  const lastName = `Parts${ts}`;
  const email = `e2e.parts.bootstrap.${ts}@example.com`;
  const password = 'Fleetmada!123';

  await page.goto('/register');
  await page.locator('input[name="firstName"]').fill(firstName);
  await page.locator('input[name="lastName"]').fill(lastName);
  await page.locator('input[name="companyName"]').fill(`FleetMada Parts ${ts}`);
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

test.describe('E2E-09 Parts', () => {
  test('creer, rechercher, ajuster stock et modifier une piece', async ({ page }) => {
    const ts = Date.now();
    const partNumber = `E2E-PART-${ts}`;
    const partDescription = `Filtre huile E2E ${ts}`;
    const updatedPartDescription = `${partDescription} - MAJ`;
    const updatedPartCost = '15000';
    const initialQuantity = '2';
    const minimumStock = '5';
    const adjustmentQuantity = '4';

    await registerAndCompleteOnboarding(page);

    await page.goto('/parts/create');
    await expect(page.getByRole('heading', { name: /Nouvelle Pi.ce/i })).toBeVisible();

    await page.getByTestId('part-number').fill(partNumber);
    await page.getByTestId('part-description').fill(partDescription);
    await page.getByTestId('part-cost').fill('12000');
    await page.getByTestId('part-quantity').fill(initialQuantity);
    await page.getByTestId('part-minimum-stock').fill(minimumStock);

    const createResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/parts') &&
        response.request().method() === 'POST',
    );
    await page.getByTestId('save-part-button').click();
    const createResponse = await createResponsePromise;
    expect(createResponse.ok()).toBeTruthy();
    const createBody = await createResponse.json();
    const partId = createBody?.data?.id || createBody?.id;
    expect(partId).toBeTruthy();

    await expect(page).toHaveURL(/\/parts$/, { timeout: 20000 });
    await expect(page.getByTestId('page-title')).toBeVisible();

    await page.getByTestId('search-input').fill(partNumber);
    await expect(page.getByText(partNumber).first()).toBeVisible();

    await page.getByTestId('tab-low-stock').click();
    await expect(page.getByText(partNumber).first()).toBeVisible();

    await page.getByTestId('tab-all').click();
    const targetRow = page.getByTestId('part-row').filter({ hasText: partNumber });
    await expect(targetRow.first()).toBeVisible();
    await targetRow.first().click();

    await expect(page).toHaveURL(new RegExp(`/parts/${partId}$`));
    await expect(page.getByTestId('page-title')).toContainText(partNumber);
    await expect(page.getByTestId('stock-quantity')).toHaveText(initialQuantity);
    await expect(page.getByTestId('stock-status-text')).toContainText(/Stock faible/i);

    await page.getByTestId('adjust-stock-button').click();
    await page.getByTestId('adjustment-type').selectOption('add');
    await page.getByTestId('adjustment-quantity').fill(adjustmentQuantity);
    await page.getByTestId('adjustment-reason').fill(`Ajustement E2E ${ts}`);

    const adjustResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes(`/api/parts/${partId}/adjust-stock`) &&
        response.request().method() === 'POST',
    );
    await page.getByTestId('confirm-adjustment-button').click();
    const adjustResponse = await adjustResponsePromise;
    expect(adjustResponse.ok()).toBeTruthy();
    await expect(page.getByTestId('stock-quantity')).toHaveText('6');
    await expect(page.getByTestId('stock-status-text')).toContainText(/En stock/i);

    await page.getByTestId('edit-part-button').click();
    await expect(page).toHaveURL(new RegExp(`/parts/${partId}/edit$`));

    await page.getByTestId('part-description').fill(updatedPartDescription);
    await page.getByTestId('part-cost').fill(updatedPartCost);

    const updateResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes(`/api/parts/${partId}`) &&
        response.request().method() === 'PUT',
    );
    await page.getByTestId('save-changes-button').first().click();
    const updateResponse = await updateResponsePromise;
    expect(updateResponse.ok()).toBeTruthy();

    await expect(page).toHaveURL(new RegExp(`/parts/${partId}$`), { timeout: 20000 });
    await expect(page.getByTestId('page-title')).toContainText(partNumber);
    await expect(page.getByText(updatedPartDescription).first()).toBeVisible();
    await expect(page.getByText(/Ar 15,000/).first()).toBeVisible();
    await expect(page.getByTestId('stock-quantity')).toHaveText('6');

    mkdirSync('output/playwright', { recursive: true });
    await page.screenshot({
      path: 'output/playwright/e2e-09-parts-detail.png',
      fullPage: true,
    });
  });
});
