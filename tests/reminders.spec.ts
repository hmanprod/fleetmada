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

test.describe('Module Reminders - E2E', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should load service reminders page', async ({ page }) => {
    await page.goto('/reminders/service');

    await expect(page.getByTestId('page-title')).toContainText('Rappels de service');
    await expect(page.getByTestId('tab-all')).toBeVisible();
    await expect(page.getByTestId('tab-due-soon')).toBeVisible();
    await expect(page.getByTestId('tab-overdue')).toBeVisible();
    await expect(page.getByTestId('tab-snoozed')).toBeVisible();
    await expect(page.getByTestId('reminders-table')).toBeVisible({ timeout: 30000 });
  });

  test('should filter service reminders by overdue tab', async ({ page }) => {
    await page.goto('/reminders/service');
    await page.getByTestId('tab-overdue').click();
    await expect(page.getByTestId('tab-overdue')).toHaveClass(/text-\[#008751\]/);
    await expect(page.getByTestId('reminders-table')).toBeVisible({ timeout: 30000 });
  });

  test('should allow selecting all service reminders', async ({ page }) => {
    await page.goto('/reminders/service');

    await page.getByTestId('select-all-checkbox').click();

    const checkboxes = page.getByTestId('reminder-checkbox');
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).toBeChecked();
    }
  });

  test('should load vehicle renewals page', async ({ page }) => {
    await page.goto('/reminders/vehicle-renewals');

    await expect(page.getByTestId('page-title')).toContainText('Renouvellements');
    await expect(page.getByTestId('renewals-table')).toBeVisible({ timeout: 30000 });
  });
});
