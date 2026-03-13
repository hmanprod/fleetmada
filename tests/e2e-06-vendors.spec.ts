import { mkdirSync } from 'fs';
import { expect, Page, test } from '@playwright/test';

async function registerAndCompleteOnboarding(page: Page) {
  const ts = Date.now();
  const firstName = 'E2E';
  const lastName = `Vendors${ts}`;
  const email = `e2e.vendors.bootstrap.${ts}@example.com`;
  const password = 'Fleetmada!123';

  await page.goto('/register');
  await page.locator('input[name="firstName"]').fill(firstName);
  await page.locator('input[name="lastName"]').fill(lastName);
  await page.locator('input[name="companyName"]').fill(`FleetMada Vendors ${ts}`);
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

test.describe('E2E-06 Vendors', () => {
  test('creer, rechercher et modifier un fournisseur', async ({ page }) => {
    const ts = Date.now();
    const vendorName = `E2E Vendor ${ts}`;
    const updatedVendorName = `${vendorName} Updated`;

    await registerAndCompleteOnboarding(page);

    await page.goto('/vendors/create');
    await expect(
      page.getByRole('heading', { name: /Nouveau Fournisseur/i }),
    ).toBeVisible();

    await page.getByTestId('vendor-name-input').fill(vendorName);
    await page.getByTestId('vendor-classification-select').selectOption('Service');
    await page.getByTestId('vendor-phone-input').fill('+261340000001');
    await page.getByTestId('vendor-email-input').fill(`vendor.${ts}@example.com`);
    await page.getByTestId('vendor-address-input').fill('Lot II A 100');

    const createResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/vendors') &&
        response.request().method() === 'POST',
    );
    await page.getByTestId('save-vendor-button').click();
    const createResponse = await createResponsePromise;
    expect(createResponse.ok()).toBeTruthy();
    const createBody = await createResponse.json();
    const vendorId = createBody?.data?.id || createBody?.id;
    expect(vendorId).toBeTruthy();

    await expect(page).toHaveURL(/\/vendors$/, { timeout: 20000 });
    await expect(page.getByTestId('vendors-title')).toBeVisible();

    await page.getByTestId('search-input').fill(vendorName);
    const vendorRow = page.locator('tbody tr').filter({ hasText: vendorName });
    await expect(vendorRow.first()).toBeVisible();
    await vendorRow.first().click();

    await expect(page).toHaveURL(new RegExp(`/vendors/${vendorId}$`));
    await expect(page.getByRole('heading', { name: new RegExp(vendorName) })).toBeVisible();

    await page.getByRole('button', { name: /Modifier/i }).click();
    await expect(page).toHaveURL(new RegExp(`/vendors/${vendorId}/edit$`));

    await page
      .locator('label:has-text("Nom du fournisseur")')
      .first()
      .locator('xpath=following::input[1]')
      .fill(updatedVendorName);

    const updateResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes(`/api/vendors/${vendorId}`) &&
        response.request().method() === 'PUT',
    );
    await page.getByRole('button', { name: /^Enregistrer$/ }).first().click();
    const updateResponse = await updateResponsePromise;
    expect(updateResponse.ok()).toBeTruthy();

    await expect(page).toHaveURL(new RegExp(`/vendors/${vendorId}$`), {
      timeout: 20000,
    });
    await expect(
      page.getByRole('heading', { name: new RegExp(updatedVendorName) }),
    ).toBeVisible();

    mkdirSync('output/playwright', { recursive: true });
    await page.screenshot({
      path: 'output/playwright/e2e-06-vendors-detail.png',
      fullPage: true,
    });
  });
});
