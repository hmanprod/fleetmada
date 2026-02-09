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

test.describe('Vehicle Assignments', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should load assignments page and open create modal', async ({ page }) => {
    await page.goto('/vehicles/assignments');

    await expect(page.locator('h1')).toContainText('Affectations de véhicules');
    await page.getByRole('button', { name: /Ajouter une affectation/i }).click();
    await expect(page.getByRole('heading', { name: /Ajouter une affectation/i })).toBeVisible();
  });
});

