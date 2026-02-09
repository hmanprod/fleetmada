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
        await page.getByTestId('email-input').fill('admin@fleetmadagascar.mg');
        await page.getByTestId('password-input').fill('testpassword123');
        await page.getByTestId('login-button').click();
        await page.waitForURL('**/dashboard**', { timeout: 30000 });
    });

    test.afterEach(async () => {
        await context.close();
    });

    test('should navigate to Contacts and create a new contact', async () => {
        await page.goto('/contacts');
        await expect(page.getByTestId('contacts-title')).toBeVisible();

        await page.getByTestId('add-contact-button').click();
        await page.waitForURL('**/contacts/create');

        await page.getByTestId('first-name-input').fill(`Jean-${Date.now()}`);
        await page.getByTestId('last-name-input').fill('Dupont');

        page.once('dialog', async dialog => {
            await dialog.accept();
        });
        await page.getByTestId('save-contact-button').first().click();

        await page.getByRole('button', { name: /^Contacts$/ }).click();
        await page.waitForURL('**/contacts', { timeout: 30000 });
    });

    test('should search for contacts', async () => {
        await page.goto('/contacts');
        await page.getByTestId('search-input').fill('Marie');
        await page.getByTestId('search-input').press('Enter');

        await expect(page.locator('table')).toBeVisible();
    });
});
