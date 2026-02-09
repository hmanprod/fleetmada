import { test as setup } from '@playwright/test';

/**
 * Test setup - Seed data for Parts E2E tests
 * This script creates initial test data before running Parts tests
 */

const STORAGE_STATE = 'playwright/.auth/user.json';

setup('authenticate and seed parts data', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@fleetmadagascar.mg');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="login-button"]');

    // 2. Wait for redirect to dashboard
    await page.waitForURL('**/dashboard**', { timeout: 30000 });

    // 3. Save authentication state
    await page.context().storageState({ path: STORAGE_STATE });

    // 4. Seed test data via API
    console.log('Seeding parts test data...');

    const token = await page.evaluate(() => {
        return (
            localStorage.getItem('authToken') ||
            document.cookie.match(/authToken=([^;]*)/)?.[1] ||
            null
        );
    });

    if (!token) throw new Error('Missing auth token after login (cannot seed parts)');

    const testParts = [
        {
            number: 'SEED-001',
            description: 'Test Engine Part',
            category: 'engine',
            manufacturer: 'bosch',
            cost: 15000,
            quantity: 20,
            minimumStock: 5
        },
        {
            number: 'SEED-002',
            description: 'Test Brake Part',
            category: 'brakes',
            manufacturer: 'continental',
            cost: 8000,
            quantity: 15,
            minimumStock: 5
        },
        {
            number: 'SEED-003',
            description: 'Low Stock Item',
            category: 'filters',
            manufacturer: 'wix',
            cost: 2500,
            quantity: 2,
            minimumStock: 10
        }
    ];

    // Create parts using the API
    for (const partData of testParts) {
        const resp = await page.request.post('/api/parts', {
            data: partData,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (resp.ok()) {
            console.log(`Created part: ${partData.number}`);
            continue;
        }

        if (resp.status() === 409) {
            console.log(`Part ${partData.number} already exists, skipping...`);
            continue;
        }

        const text = await resp.text().catch(() => '');
        throw new Error(`Failed to seed part ${partData.number}: HTTP ${resp.status()} ${text}`);
    }

    console.log('Seed data creation completed');
});
