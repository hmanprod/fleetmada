import { test, expect, Page, BrowserContext } from '@playwright/test';

test.describe('Module Places - E2E Tests', () => {
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

    test('should navigate to Places and create a new place', async () => {
        await page.goto('/places');
        await expect(page.getByTestId('places-title')).toBeVisible();

        await page.getByTestId('add-place-button').click();
        await page.waitForURL('**/places/create');

        await page.getByTestId('place-name-input').fill('Test Office');
        await page.getByTestId('place-description-textarea').fill('This is a test office description');
        await page.getByTestId('place-type-select').selectOption('OFFICE');
        await page.getByTestId('place-address-input').fill('Antananarivo, Madagascar');

        // We don't click Geocode because it might call an external API or fail in test environment
        // But we can fill manual coordinates if we disable auto geocode
        await page.locator('#autoGeocode').uncheck();
        await page.fill('input[name="latitude"], label:has-text("Latitude") + input', '-18.8792');
        await page.fill('input[name="longitude"], label:has-text("Longitude") + input', '47.5079');

        await page.getByTestId('save-place-button').last().click();

        // Since it's a mock save for now (or real if backend works), we expect navigation back or to details
        await page.waitForURL(/\/places(\/|$)/);
    });

    test('should search for places', async () => {
        await page.goto('/places');
        await page.getByTestId('search-input').fill('Test');
        await page.press('input[data-testid="search-input"]', 'Enter');

        // Check if table exists
        await expect(page.locator('table')).toBeVisible();
    });
});
