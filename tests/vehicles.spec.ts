import { test, expect, Page } from '@playwright/test';

test.describe('Module Véhicules - Tests E2E', () => {
    const randomSuffix = Math.floor(Math.random() * 10000).toString();
    let page: Page;

    test.setTimeout(90000);

    test.beforeEach(async ({ browser }) => {
        // 1. Create explicit context
        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 }
        });
        page = await context.newPage();

        // 2. UI-based authentication
        await page.goto('/login');
        await page.fill('input[type="email"]', 'admin@fleetmadagascar.mg');
        await page.fill('input[type="password"]', 'testpassword123');
        await page.click('button[type="submit"]');

        // 3. Wait for redirect to dashboard
        await page.waitForURL('**/dashboard**', { timeout: 30000 });

        // 4. Wait for loading overlay to hide
        try {
            await page.waitForSelector('text=Chargement des données...', { state: 'hidden', timeout: 45000 });
        } catch (e) {
            console.log('Timeout waiting for loading overlay to hide, proceeding anyway...');
        }

        // 5. Handle any modals
        try {
            const modalClose = page.locator('button:has-text("Plus tard"), button[aria-label="Close"], .modal-close').first();
            if (await modalClose.isVisible({ timeout: 5000 })) {
                await modalClose.click();
            }
        } catch (e) {
            // No modal, continue
        }
    });

    test.describe('Liste des véhicules', () => {
        test('Affichage de la liste des véhicules', async () => {
            await page.goto('/vehicles/list');
            await expect(page).toHaveURL(/\/vehicles\/list/);

            // Vérifier le titre de la page
            await expect(page.locator('h1')).toContainText(/véhicules|vehicles/i);

            // Vérifier la présence du tableau
            await expect(page.locator('table')).toBeVisible();

            // Vérifier qu'il y a des lignes (si seeding a fonctionné)
            const rows = page.locator('tbody tr');
            await expect(rows.first()).toBeVisible();
        });

        test('Navigation vers les détails d\'un véhicule', async () => {
            await page.goto('/vehicles/list');
            // Cliquer sur le premier véhicule
            const firstRow = page.locator('tbody tr').first();
            await firstRow.click();

            // Vérifier la redirection vers /vehicles/[id]
            await page.waitForURL(/\/vehicles\/list\/[a-zA-Z0-9]+/);
            await expect(page.locator('h1').first()).toBeVisible();
        });
    });

    test.describe('Page détails véhicule - Onglets horizontaux', () => {
        test.beforeEach(async () => {
            await page.goto('/vehicles/list');
            // Navigate to first vehicle
            const firstRow = page.locator('tbody tr').first();
            await firstRow.click();
            await page.waitForURL(/\/vehicles\/list\/[a-zA-Z0-9]+/);
            await expect(page.getByText('Chargement du véhicule...')).toBeHidden({ timeout: 15000 });
        });

        test('Affichage de l\'onglet Overview par défaut', async () => {
            // Overview tab should be active by default
            const overviewTab = page.locator('[data-testid="tab-overview"]');
            await expect(overviewTab).toBeVisible();
            await expect(overviewTab).toHaveClass(/text-\[#008751\]/);

            // Details section should be visible
            await expect(page.locator('text=Details')).toBeVisible();
        });

        test('Navigation entre les onglets principaux', async () => {
            // Click on Specs tab
            await page.click('[data-testid="tab-specs"]');
            await expect(page.locator('text=Specifications')).toBeVisible();

            // Click on Financial tab
            await page.click('[data-testid="tab-financial"]');
            await expect(page.locator('text=Purchase & Financial')).toBeVisible();

            // Click on Service History tab
            await page.click('[data-testid="tab-service-history"]');
            await expect(page.locator('th:has-text("Work Order")')).toBeVisible();

            // Click on Inspection History tab
            await page.click('[data-testid="tab-inspection-history"]');
            await expect(page.locator('th:has-text("Submitted")')).toBeVisible();
        });

        test('Menu More affiche les onglets supplémentaires', async () => {
            // Click More button
            await page.click('[data-testid="more-tabs-button"]');

            // Verify dropdown items are visible
            await expect(page.locator('text=Renewal Reminders')).toBeVisible();
            await expect(page.locator('text=Issues')).toBeVisible();
            await expect(page.locator('text=Meter History')).toBeVisible();
            await expect(page.locator('text=Fuel History')).toBeVisible();

            // Click on Fuel History
            await page.click('text=Fuel History');
            await expect(page.locator('th:has-text("Fuel Economy")')).toBeVisible();
        });
    });

    test.describe('Page détails véhicule - Sidebar droite', () => {
        test.beforeEach(async () => {
            await page.goto('/vehicles/list');
            const firstRow = page.locator('tbody tr').first();
            await firstRow.click();
            await page.waitForURL(/\/vehicles\/list\/[a-zA-Z0-9]+/);
            // Wait for loading to finish
            await expect(page.getByText('Chargement du véhicule...')).toBeHidden({ timeout: 15000 });
        });

        test('Sidebar droite avec Comments, Photos, Documents', async () => {
            // Right sidebar should be visible
            await expect(page.locator('[data-testid="right-sidebar"]')).toBeVisible();

            // Comments panel should be active by default
            await expect(page.locator('h3:has-text("Commentaires")')).toBeVisible();
            await expect(page.locator('[data-testid="sidebar-comments-btn"]')).toBeVisible();
        });

        test('Basculer entre les panneaux de la sidebar', async () => {
            // Click on Photos button
            await page.click('[data-testid="sidebar-photos-btn"]');
            await expect(page.locator('h3:has-text("Photos")')).toBeVisible();
            await expect(page.locator('[data-testid="upload-area-photos"]')).toBeVisible();

            // Click on Documents button
            await page.click('[data-testid="sidebar-documents-btn"]');
            await expect(page.locator('h3:has-text("Documents")')).toBeVisible();
            await expect(page.locator('text=Aucun document trouvé')).toBeVisible();

            // Click back on Comments
            await page.click('[data-testid="sidebar-comments-btn"]');
            await expect(page.locator('input[placeholder="Ajouter un commentaire..."]')).toBeVisible();
        });

        test('Replier la sidebar', async () => {
            // Comments is active by default
            await expect(page.locator('[data-testid="sidebar-panel-content"]')).toBeVisible();

            // Click comments button again to collapse
            await page.click('[data-testid="sidebar-comments-btn"]');
            await expect(page.locator('[data-testid="sidebar-panel-content"]')).toBeHidden();

            // Click again to expand
            await page.click('[data-testid="sidebar-comments-btn"]');
            await expect(page.locator('[data-testid="sidebar-panel-content"]')).toBeVisible();
        });
    });

    test.describe('Affectations de véhicules', () => {
        test('Affichage de la page des affectations', async () => {
            await page.goto('/vehicles/assignments');
            await expect(page).toHaveURL(/\/vehicles\/assignments/);

            // Vérifier le titre
            await expect(page.locator('h1')).toContainText(/affectations|assignments/i);

            // Vérifier la présence du bouton de nouvelle affectation
            const addButton = page.locator('button:has-text("Add Assignment")');
            await expect(addButton).toBeVisible();
        });
    });

    test.describe('Dépenses véhicules', () => {
        test('Affichage de la page des dépenses', async () => {
            await page.goto('/vehicles/expense');
            await expect(page).toHaveURL(/\/vehicles\/expense/);

            // Vérifier le titre
            // Vérifier le titre
            await expect(page.locator('h1')).toContainText(/Expense/i);

            // Vérifier la présence du tableau ou de la liste
            await expect(page.locator('table, .expense-list')).toBeVisible();
        });
    });

    test.describe('Historique des compteurs', () => {
        test('Affichage de l\'historique des compteurs', async () => {
            await page.goto('/vehicles/meter-history');
            await expect(page).toHaveURL(/\/vehicles\/meter-history/);

            // Vérifier le titre
            await expect(page.locator('h1')).toContainText(/compteur|meter/i);

            // Vérifier la présence du bouton d'ajout
            const addButton = page.locator('button:has-text("Ajouter"), button:has-text("Add")');
            await expect(addButton).toBeVisible();
        });
    });

    test.describe('Analyse de remplacement', () => {
        test('Affichage de l\'analyse de remplacement', async () => {
            await page.goto('/vehicles/replacement');
            await expect(page).toHaveURL(/\/vehicles\/replacement/);

            // Vérifier le titre
            await expect(page.locator('h1')).toContainText(/remplacement|replacement/i);

            // Vérifier la présence de graphiques ou tableaux
            // Vérifier la présence de graphiques ou tableaux
            // Vérifier la présence de graphiques ou tableaux
            await expect(page.locator('.recharts-responsive-container, .recharts-wrapper').first()).toBeVisible();
        });
    });

});
