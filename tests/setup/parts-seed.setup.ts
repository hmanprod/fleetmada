import { test as setup } from '@playwright/test';
import { partsAPI } from '../lib/services/parts-api';

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
        try {
            await partsAPI.createPart(partData);
            console.log(`Created part: ${partData.number}`);
        } catch (error) {
            console.log(`Part ${partData.number} might already exist, skipping...`);
        }
    }

    console.log('Seed data creation completed');
});
