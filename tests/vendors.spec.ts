import { test, expect, Page, BrowserContext } from '@playwright/test';

test.describe('Module Vendors - E2E Tests', () => {
    test.describe.configure({ mode: 'serial' });
    test.setTimeout(90000);
    let context: BrowserContext;
    let page: Page;

    test.beforeEach(async ({ browser }) => {
        context = await browser.newContext({
            viewport: { width: 1280, height: 720 }
        });
        page = await context.newPage();

        // Login
        await page.goto('/login');
        await page.getByTestId('email-input').fill('admin@fleetmadagascar.mg');
        await page.getByTestId('password-input').fill('testpassword123');
        await page.getByTestId('login-button').click();
        await page.waitForURL('**/dashboard**', { timeout: 30000 });
    });

    test.afterEach(async () => {
        await context.close();
    });

    test('should navigate to Vendors and create a new vendor', async () => {
        const vendorName = `Test Vendor ${Date.now()}`;

        await page.goto('/vendors');
        await expect(page.getByTestId('vendors-title')).toBeVisible();

        await page.getByTestId('add-vendor-button').click();
        await page.waitForURL('**/vendors/create');

        await page.getByTestId('vendor-name-input').fill(vendorName);
        await page.getByTestId('vendor-phone-input').fill('0340000000');
        await page.getByTestId('vendor-email-input').fill('test@vendor.com');

        // Select classification if possible
        const select = page.getByTestId('vendor-classification-select');
        if (await select.isVisible()) {
            await select.selectOption('Fuel');
        }

        await page.getByTestId('save-vendor-button').click();

        await expect(page.getByText(/Fournisseur créé avec succès/i)).toBeVisible({ timeout: 20000 });
        await page.waitForURL('**/vendors', { timeout: 30000 });
    });

    test('should search for vendors', async () => {
        await page.goto('/vendors');
        await page.getByTestId('search-input').fill('Chevron');
        await page.getByTestId('search-input').press('Enter');

        await expect(page.locator('table')).toBeVisible();
    });
});
