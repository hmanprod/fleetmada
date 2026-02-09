import { test, expect, type Page } from '@playwright/test';

const ADMIN_EMAIL = 'admin@fleetmadagascar.mg';
const ADMIN_PASSWORD = 'testpassword123';

async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.getByTestId('email-input').fill(ADMIN_EMAIL);
  await page.getByTestId('password-input').fill(ADMIN_PASSWORD);
  await page.getByTestId('login-button').click();

  await page.waitForURL('**/dashboard**', { timeout: 30000 });

  try {
    await page.getByTestId('loading-overlay').waitFor({ state: 'hidden', timeout: 45000 });
  } catch {
    // ignore
  }
}

test.describe('Module Issues - E2E Tests', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should load issues list and filters', async ({ page }) => {
    await page.goto('/issues');

    await expect(page.getByTestId('issues-filters')).toBeVisible();
    await expect(page.getByTestId('issues-list')).toBeVisible();
    await expect(page.getByTestId('add-issue-button')).toBeVisible();
    await expect(page.getByTestId('search-input')).toBeVisible();
    await expect(page.getByTestId('status-tab-OPEN')).toBeVisible();
    await expect(page.getByTestId('status-tab-RESOLVED')).toBeVisible();
  });

  test('should filter issues by status', async ({ page }) => {
    await page.goto('/issues');

    await page.getByTestId('status-tab-OPEN').click();
    await expect(page.getByTestId('status-tab-OPEN')).toHaveClass(/border-\[#008751\]/);

    await page.getByTestId('status-tab-RESOLVED').click();
    await expect(page.getByTestId('status-tab-RESOLVED')).toHaveClass(/border-\[#008751\]/);
  });

  test('should search issues', async ({ page }) => {
    await page.goto('/issues');

    await page.getByTestId('search-input').fill('moteur');
    await page.getByTestId('search-input').press('Enter');

    await expect(page.getByTestId('issues-list')).toBeVisible();
  });

  test('should create an issue and open its details', async ({ page }) => {
    const uniqueSummary = `Problème test E2E ${Date.now()}`;

    await page.goto('/issues/create');

    const vehicleSelect = page.getByTestId('vehicle-select');
    await vehicleSelect.waitFor({ state: 'attached' });
    await vehicleSelect.selectOption({ index: 1 });

    await page.getByTestId('priority-select').selectOption('HIGH');
    await page.getByTestId('summary-input').fill(uniqueSummary);
    await page.getByTestId('description-textarea').fill('Description E2E');

    await page.getByTestId('save-button').click();

    await page.waitForURL('**/issues', { timeout: 20000 });

    const createdRow = page.locator('table tbody tr').filter({ hasText: uniqueSummary }).first();
    await createdRow.waitFor({ state: 'visible', timeout: 15000 });
    await createdRow.click();

    await page.waitForURL(/\/issues\/[^/]+$/, { timeout: 15000 });
    await expect(page.getByTestId('issue-status')).toBeVisible();
    await expect(page.getByTestId('issue-priority')).toBeVisible();
    await expect(page.getByTestId('issue-vehicle')).toBeVisible();
  });

  test('should show issues metrics on dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByTestId('dashboard-issues-tab').click();
    await expect(page.getByTestId('issues-status')).toBeVisible();
    await expect(page.getByTestId('issues-total')).toBeVisible();
    await expect(page.getByTestId('issues-in-progress')).toBeVisible();
    await expect(page.getByTestId('issues-critical')).toBeVisible();
    await expect(page.getByTestId('recent-issues')).toBeVisible();
  });
});

