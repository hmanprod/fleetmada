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

test.describe('Module Fuel - E2E', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should load fuel history page', async ({ page }) => {
    await page.goto('/fuel/history');

    await expect(page.getByTestId('page-title')).toContainText('Historique de Carburant');
    await expect(page.getByTestId('add-fuel-entry-button')).toBeVisible();
    await expect(page.getByTestId('refresh-button')).toBeVisible();
  });

  test('should create a fuel entry', async ({ page }) => {
    await page.goto('/fuel/history/create');

    const vehicleSelect = page.getByTestId('vehicle-select');
    await vehicleSelect.waitFor({ state: 'visible' });
    await vehicleSelect.selectOption({ index: 1 });

    const vendorSelect = page.getByTestId('vendor-select');
    await vendorSelect.selectOption({ index: 1 });

    const now = new Date();
    const yyyy = String(now.getFullYear());
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    await page.getByTestId('date-input').fill(`${yyyy}-${mm}-${dd}T${hh}:${min}`);

    await page.getByTestId('volume-input').fill('50');
    await page.getByTestId('cost-input').fill('150000');

    await page.getByTestId('save-button').click();
    await expect(page).toHaveURL('/fuel/history', { timeout: 20000 });
  });

  test('should load charging history page', async ({ page }) => {
    await page.goto('/fuel/charging');

    await expect(page.getByTestId('page-title')).toContainText('Recharges Électriques');
    await expect(page.getByTestId('add-charging-entry-button')).toBeVisible();
    await expect(page.getByTestId('refresh-button')).toBeVisible();
  });

  test('should create a charging entry', async ({ page }) => {
    await page.goto('/fuel/charging/create');

    const vehicleSelect = page.getByTestId('vehicle-select');
    await vehicleSelect.waitFor({ state: 'visible' });
    await vehicleSelect.selectOption({ index: 1 });

    const vendorSelect = page.getByTestId('vendor-select');
    await vendorSelect.selectOption({ index: 1 });

    await page.getByTestId('start-date-input').fill('2026-02-07');
    await page.getByTestId('start-time-input').fill('10:30');

    await page.getByTestId('end-date-input').fill('2026-02-07');
    await page.getByTestId('end-time-input').fill('11:30');

    await page.getByTestId('energy-input').fill('25.0');
    await page.getByTestId('price-input').fill('800');

    await page.getByTestId('save-button').click();
    await expect(page).toHaveURL('/fuel/charging', { timeout: 20000 });
  });
});

