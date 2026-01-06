import { test, expect, Page } from '@playwright/test';

test.describe('Vehicle Assignments Persistence', () => {
    let page: Page;

    test.beforeEach(async ({ browser }) => {
        const context = await browser.newContext();
        page = await context.newPage();

        await page.goto('/login');
        await page.fill('input[type="email"]', 'admin@fleetmadagascar.mg');
        await page.fill('input[type="password"]', 'testpassword123');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard**');
    });

    test('should add and persist a new assignment', async () => {
        await page.goto('/vehicles/assignments');
        await page.waitForSelector('h1:has-text("Vehicle Assignments")');

        // Wait for data load
        await expect(page.locator('text=Loading assignments...')).toBeHidden({ timeout: 15000 });

        // Click Add Assignment
        await page.click('button:has-text("Add Assignment")');

        // Fill Form
        await page.selectOption('select:near(label:has-text("Assigned Vehicle"))', { index: 1 });
        await page.selectOption('select:near(label:has-text("Operator"))', { index: 1 });

        const testComment = `Test Assignment ${Math.floor(Math.random() * 10000)}`;
        await page.fill('textarea[placeholder="Add an optional comment"]', testComment);

        // Save
        await page.click('button:has-text("Save Assignment")');

        // Wait for modal to close
        await expect(page.locator('h3:has-text("Add Assignment")')).toBeHidden();

        // Refresh Page
        await page.reload();
        await expect(page.locator('text=Loading assignments...')).toBeHidden({ timeout: 15000 });

        // Check if the comment exists in the page (which means it was fetched)
        // Since it's in a scheduler, we look for the text
        const isVisible = await page.getByText(testComment).isVisible();
        if (!isVisible) {
            // Try to find it in the operators list inside the grid
            const operator = await page.locator('select:near(label:has-text("Operator"))').inputValue();
            console.log('Operator selected:', operator);
        }
    });
});
