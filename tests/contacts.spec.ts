import { test, expect, Page, BrowserContext } from '@playwright/test';

test.describe('Module Contacts - E2E Tests', () => {
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
        await page.fill('input[type="email"]', 'admin@fleetmadagascar.mg');
        await page.fill('input[type="password"]', 'testpassword123');
        await page.click('button[type="submit"]');
        await page.waitForURL('/dashboard');
    });

    test.afterEach(async () => {
        await context.close();
    });

    test('should navigate to Contacts and create a new contact', async () => {
        await page.goto('/contacts');
        await expect(page.getByTestId('contacts-title')).toBeVisible();

        await page.getByTestId('add-contact-button').click();
        await page.waitForURL('**/contacts/create');

        await page.getByTestId('first-name-input').fill('Jean');
        await page.getByTestId('last-name-input').fill('Dupont');

        await page.getByTestId('save-contact-button').last().click();

        await page.waitForURL('**/contacts');
    });

    test('should search for contacts', async () => {
        await page.goto('/contacts');
        await page.getByTestId('search-input').fill('Marie');
        await page.press('input[data-testid="search-input"]', 'Enter');

        await expect(page.locator('table')).toBeVisible();
    });
});
