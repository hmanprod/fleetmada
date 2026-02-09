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

test.describe('Module Parts - E2E', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/parts');
    await expect(page.getByTestId('page-title')).toHaveText(/Pièces détachées/i);
  });

  test('should load parts list page', async ({ page }) => {
    await expect(page.getByTestId('add-part-button')).toBeVisible();
    await expect(page.getByTestId('search-input')).toBeVisible();
    await expect(page.getByTestId('pagination-info')).toBeVisible();
  });

  test('should create a new part', async ({ page }) => {
    const partNumber = `PART-${Date.now()}`;

    await Promise.all([
      page.waitForURL('**/parts/create', { timeout: 20000 }),
      page.getByTestId('add-part-button').click(),
    ]);

    await page.getByTestId('part-number').fill(partNumber);
    await page.getByTestId('part-description').fill('Nouvelle pièce test E2E');
    await page.getByTestId('part-cost').fill('15000');
    await page.getByTestId('part-quantity').fill('10');
    await page.getByTestId('part-minimum-stock').fill('5');

    await page.getByTestId('save-part-button').click();

    await expect(page.getByText('Pièce créée avec succès')).toBeVisible();
    await page.waitForURL('**/parts', { timeout: 20000 });
    await expect(page.getByText(partNumber)).toBeVisible({ timeout: 15000 });
  });

  test('should edit an existing part', async ({ page }) => {
    const partNumber = `EDIT-${Date.now()}`;

    await page.getByTestId('add-part-button').click();
    await page.getByTestId('part-number').fill(partNumber);
    await page.getByTestId('part-description').fill('Pièce à éditer');
    await page.getByTestId('save-part-button').click();
    await page.waitForURL('**/parts', { timeout: 20000 });

    await page.getByText(partNumber).click();
    await page.waitForURL(/\/parts\/[^/]+$/, { timeout: 15000 });

    await page.getByTestId('edit-part-button').click();
    await page.waitForURL(/\/parts\/[^/]+\/edit$/, { timeout: 15000 });

    const description = page.getByTestId('part-description');
    await expect(description).toBeVisible({ timeout: 30000 });
    await expect(description).toBeEditable({ timeout: 30000 });
    await expect(async () => {
      await description.fill('Pièce éditée - test E2E');
      await expect(description).toHaveValue('Pièce éditée - test E2E');
    }).toPass({ timeout: 30000 });

    const cost = page.getByTestId('part-cost');
    await expect(cost).toBeVisible({ timeout: 30000 });
    await expect(cost).toBeEditable({ timeout: 30000 });
    await expect(async () => {
      await cost.fill('30000');
      await expect(cost).toHaveValue('30000');
    }).toPass({ timeout: 30000 });
    await page.getByTestId('save-changes-button').first().click();

    await page.waitForURL(/\/parts\/[^/]+$/, { timeout: 20000 });
    await expect(page.getByTestId('page-title')).toContainText('Pièce éditée - test E2E');
  });

  test('should adjust stock on a part', async ({ page }) => {
    const partNumber = `STOCK-${Date.now()}`;

    await page.getByTestId('add-part-button').click();
    await page.getByTestId('part-number').fill(partNumber);
    await page.getByTestId('part-description').fill('Pièce pour test stock');
    await page.getByTestId('part-quantity').fill('5');
    await page.getByTestId('part-minimum-stock').fill('10');
    await page.getByTestId('save-part-button').click();
    await page.waitForURL('**/parts', { timeout: 20000 });

    await page.getByText(partNumber).click();
    await page.waitForURL(/\/parts\/[^/]+$/, { timeout: 15000 });

    await expect(page.getByText(/Stock faible/i)).toBeVisible();

    await page.getByTestId('adjust-stock-button').click();
    await page.getByTestId('adjustment-type').selectOption('add');
    await page.getByTestId('adjustment-quantity').fill('10');
    await page.getByTestId('adjustment-reason').fill('Réception commande');
    await page.getByTestId('confirm-adjustment-button').click();

    await expect(page.getByTestId('stock-quantity')).toContainText('15', { timeout: 15000 });
    await expect(page.getByText(/Stock faible/i)).not.toBeVisible();
  });
});
