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

    test('Should update a vehicle with specialized fields', async ({ page }) => {
        await page.goto('/vehicles/list');
        // Wait for the table to have rows
        await page.waitForSelector('table tbody tr', { timeout: 20000 });

        // Find the first vehicle row and click it (it has an onClick handler to go to detail)
        const firstRow = page.locator('table tbody tr').first();
        await firstRow.click();

        // Wait for detail page (URL should contain the ID which is usually a CUID starting with cm)
        await page.waitForURL(/\/vehicles\/list\/[a-zA-Z0-9]+/);

        // Find "Edit Vehicle" button in the header (exact match to avoid "Edit Vehicle Settings")
        const editButton = page.getByRole('button', { name: 'Edit Vehicle', exact: true });
        await editButton.waitFor({ state: 'visible' });
        await editButton.click();

        // Now on edit page
        await page.waitForURL(/\/edit/);

        // Go to specifications tab
        await page.locator('button', { hasText: 'Spécifications' }).click();

        // Fill passenger count
        // Using locator with near as a fallback, or just finding the input after the text
        await page.fill('input:near(label:has-text("Nombre de passagers"))', '7');

        // Go to details tab
        await page.locator('button', { hasText: 'Détails' }).click();

        // Fill license plate
        await page.fill('input:near(label:has-text("Plaque d\'immatriculation"))', 'ABC-123-FIX');

        // Save
        const saveButton = page.locator('button', { hasText: 'Enregistrer' });
        await saveButton.click();

        // Should show success or redirect back to detail page
        // The button text changes to "Mis à jour !" for 1s before redirecting
        await Promise.race([
            page.locator('button', { hasText: 'Mis à jour !' }).waitFor({ state: 'visible' }),
            page.waitForURL(/\/vehicles\/list\/[a-zA-Z0-9]+(?!\/edit)/)
        ]);
    });
});
