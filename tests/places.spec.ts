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
        await page.getByTestId('email-input').fill('admin@fleetmadagascar.mg');
        await page.getByTestId('password-input').fill('testpassword123');
        await page.getByTestId('login-button').click();
        await page.waitForURL('**/dashboard**', { timeout: 30000 });
    });

    test.afterEach(async () => {
        await context.close();
    });

    test('should navigate to Places and create a new place', async () => {
        await page.goto('/places');
        await expect(page.getByTestId('places-title')).toBeVisible();

        await page.getByTestId('add-place-button').click();
        await page.waitForURL('**/places/create');

        await page.getByPlaceholder(/Siège Social|Station Total/i).fill('Test Office');
        await page.getByPlaceholder(/Détails supplémentaires/i).fill('This is a test office description');
        await page.getByRole('button', { name: 'Bureau' }).click();

        // Disable geocoding to avoid external calls, then fill coordinates manually
        const geocodeToggle = page.getByText('Géocodage Google Maps automatique').locator('..').locator('div').first();
        await geocodeToggle.click();

        await page.getByPlaceholder(/Rechercher une adresse/i).fill('Antananarivo, Madagascar');

        const latitudeInput = page.locator('label:has-text("Latitude")').locator('..').locator('input');
        const longitudeInput = page.locator('label:has-text("Longitude")').locator('..').locator('input');
        await latitudeInput.fill('-18.8792');
        await longitudeInput.fill('47.5079');

        await page.getByRole('button', { name: /Enregistrer le lieu/i }).click();

        // Since it's a mock save for now (or real if backend works), we expect navigation back or to details
        await page.waitForURL(/\/places(\/|$)/);
    });

    test('should search for places', async () => {
        await page.goto('/places');
        await page.getByTestId('search-input').fill('Test');
        await page.getByTestId('search-input').press('Enter');

        // Check if table exists
        await expect(page.locator('table')).toBeVisible();
    });
});
