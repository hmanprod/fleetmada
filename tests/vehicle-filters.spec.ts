import { test, expect } from '@playwright/test';

test.describe('Vehicle Filters - Advanced filtering', () => {
    test.beforeEach(async ({ page }) => {
        // Login sequence
        await page.goto('/login');
        await page.fill('input[name="email"]', 'admin@fleetmadagascar.mg');
        await page.fill('input[name="password"]', 'testpassword123');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard**');

        // Go to vehicle list
        await page.goto('/vehicles/list');
        await page.waitForSelector('table');
    });

    test('Should open and close the filters sidebar', async ({ page }) => {
        // Find filters button
        const filterButton = page.locator('button', { hasText: 'Filtres' });
        await filterButton.click();

        // Check if sidebar is open
        await expect(page.locator('h2', { hasText: 'Filters' })).toBeVisible();

        // Close it
        await page.locator('svg.cursor-pointer').first().click();
        await expect(page.locator('h2', { hasText: 'Filters' })).not.toBeVisible();
    });

    test('Should add a filter and apply it', async ({ page }) => {
        const filterButton = page.locator('button', { hasText: 'Filtres' });
        await filterButton.click();

        // Click on "Add Filter" or a popular filter
        await page.locator('button', { hasText: 'Add Filter' }).click();

        // By default it adds "Vehicle Status"
        await expect(page.locator('span', { hasText: 'Vehicle Status' })).toBeVisible();

        // Change operator to "is" (already default) and value
        // Select "MAINTENANCE" (In Shop)
        // Since it's a multi-select (is_any_of is NOT default, "is" is default which is a single select in my component)
        // Wait, in my component "is" for enum uses a select.

        // Let's use "is any of" for status
        await page.locator('select').first().selectOption('is_any_of');

        // Find checkbox for Maintenance
        const maintenanceCheckbox = page.locator('label', { hasText: 'In Shop' }).locator('input[type="checkbox"]');
        await maintenanceCheckbox.check();

        // Apply filters
        await page.locator('button', { hasText: 'Apply Filters' }).click();

        // Sidebar should close
        await expect(page.locator('h2', { hasText: 'Filters' })).not.toBeVisible();

        // Wait for table to update (usually there's a loader)
        // For now just wait for some time or check table content
        // In a real scenario we'd check that only maintenance vehicles are shown
    });

    test('Should clear all filters', async ({ page }) => {
        const filterButton = page.locator('button', { hasText: 'Filtres' });
        await filterButton.click();

        await page.locator('button', { hasText: 'Add Filter' }).click();
        await expect(page.locator('span', { hasText: 'Vehicle Status' })).toBeVisible();

        await page.locator('button', { hasText: 'Clear all' }).click();
        await expect(page.locator('p', { hasText: 'No filters applied.' })).toBeVisible();
    });
});
