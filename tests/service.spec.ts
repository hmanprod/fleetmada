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

test.describe('Module Service - E2E', () => {
  test.setTimeout(120000);

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should load service dashboard and quick actions', async ({ page }) => {
    await page.goto('/service');

    await expect(page.getByTestId('service-dashboard-title')).toBeVisible();
    await expect(page.getByTestId('service-stats-grid')).toBeVisible();
    await expect(page.getByTestId('quick-action-history')).toBeVisible();
    await expect(page.getByTestId('quick-action-programs')).toBeVisible();

    await Promise.all([
      page.waitForURL('**/service/history**', { timeout: 30000 }),
      page.getByTestId('quick-action-history').click(),
    ]);
  });

  test('should load service programs page', async ({ page }) => {
    await page.goto('/service/programs');

    await expect(page.getByTestId('page-title')).toBeVisible();
    await expect(page.getByTestId('program-stats-row')).toBeVisible();
    await expect(page.getByTestId('search-input')).toBeVisible();
    await expect(page.getByTestId('filter-vehicle-button')).toBeVisible();
    await expect(page.getByTestId('add-program-button')).toBeVisible();
  });

  test('should load service history page', async ({ page }) => {
    await page.goto('/service/history');

    await expect(page.getByTestId('page-title')).toContainText('Historique de Service');
    await expect(page.getByTestId('history-stats-row')).toBeVisible();
    await expect(page.getByTestId('search-input')).toBeVisible();
    await expect(page.getByTestId('filter-filters-button')).toBeVisible();
  });
});
