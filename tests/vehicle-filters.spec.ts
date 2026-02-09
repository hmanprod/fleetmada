import { test, expect, type Page } from '@playwright/test';

const ADMIN_EMAIL = 'admin@fleetmadagascar.mg';
const ADMIN_PASSWORD = 'testpassword123';

async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.getByTestId('email-input').fill(ADMIN_EMAIL);
  await page.getByTestId('password-input').fill(ADMIN_PASSWORD);
  await page.getByTestId('login-button').click();
  await page.waitForURL('**/dashboard**', { timeout: 30000 });
}

test.describe('Vehicle Filters - Advanced filtering', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/vehicles/list');
    await expect(page.locator('table')).toBeVisible();
  });

  test('Should open and close the filters sidebar', async ({ page }) => {
    await page.getByRole('button', { name: /Filtres/i }).click();
    await expect(page.getByRole('heading', { name: /Filtres/i })).toBeVisible();

    // Close via the X icon inside the heading
    await page.locator('h2 svg.cursor-pointer').first().click();
    await expect(page.getByRole('heading', { name: /Filtres/i })).not.toBeVisible();
  });

  test('Should add a filter field and apply filters', async ({ page }) => {
    await page.getByRole('button', { name: /Filtres/i }).click();
    await page.getByRole('button', { name: /Ajouter un filtre/i }).click();

    // Pick a known field from definitions
    await page.getByRole('button', { name: /Statut du véhicule/i }).click();
    await expect(page.getByText('Statut du véhicule')).toBeVisible();

    await page.getByRole('button', { name: /Appliquer les filtres/i }).click();
    await expect(page.getByRole('heading', { name: /Filtres/i })).not.toBeVisible();
  });

  test('Should clear all filters', async ({ page }) => {
    await page.getByRole('button', { name: /Filtres/i }).click();
    await page.getByRole('button', { name: /Ajouter un filtre/i }).click();
    await page.getByRole('button', { name: /Statut du véhicule/i }).click();

    await page.getByRole('button', { name: /Tout effacer/i }).click();
    await expect(page.getByText(/Aucun filtre appliqué/i)).toBeVisible();
  });
});

