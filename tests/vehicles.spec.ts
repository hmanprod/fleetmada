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

async function openFirstVehicleDetails(page: Page) {
  await page.goto('/vehicles/list');
  await expect(page.locator('table')).toBeVisible();

  const firstRow = page.locator('tbody tr').first();
  await firstRow.click();

  await page.waitForURL(/\/vehicles\/list\/[^/]+$/, { timeout: 30000 });
  await expect(page.getByText('Chargement du véhicule...')).toBeHidden({ timeout: 30000 });
}

test.describe('Module Véhicules - E2E', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should load vehicles list and open details', async ({ page }) => {
    await page.goto('/vehicles/list');
    await expect(page.locator('table')).toBeVisible();

    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 15000 });

    await rows.first().click();
    await page.waitForURL(/\/vehicles\/list\/[^/]+$/, { timeout: 30000 });
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('should navigate between vehicle detail tabs', async ({ page }) => {
    await openFirstVehicleDetails(page);

    await expect(page.getByTestId('tab-overview')).toBeVisible();
    await page.getByTestId('tab-specs').click();
    await expect(page.getByRole('heading', { name: 'Spécifications' })).toBeVisible();

    await page.getByTestId('tab-financial').click();
    await expect(page.locator('main').getByText(/Achat et Finance/i)).toBeVisible();

    await page.getByTestId('more-tabs-button').click();
    await expect(page.getByRole('button', { name: 'Historique du carburant' })).toBeVisible();
  });

  test('should toggle right sidebar panels', async ({ page }) => {
    await openFirstVehicleDetails(page);

    await expect(page.getByTestId('right-sidebar')).toBeVisible();
    await expect(page.getByTestId('sidebar-panel-content')).toBeVisible();

    await page.getByTestId('sidebar-photos-btn').click();
    await expect(page.getByText('Photos')).toBeVisible();
    await expect(page.getByTestId('upload-area-photos')).toBeVisible();

    await page.getByTestId('sidebar-documents-btn').click();
    await expect(page.getByText('Documents')).toBeVisible();
    await expect(page.getByTestId('upload-area-documents')).toBeVisible();

    await page.getByTestId('sidebar-comments-btn').click();
    await expect(page.getByText('Commentaires')).toBeVisible();
  });

  test('should load vehicle assignments page', async ({ page }) => {
    await page.goto('/vehicles/assignments');
    await expect(page.locator('h1')).toContainText(/Affectations/i);
    await expect(page.locator('button:has-text(\"Ajouter une affectation\")')).toBeVisible();
  });
});
