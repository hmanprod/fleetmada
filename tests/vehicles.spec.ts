import { test, expect } from '@playwright/test';

test.describe('Module Véhicules - Tests E2E', () => {

    test.beforeEach(async ({ page }) => {
        // Connexion avant chaque test
        await page.goto('/login');
        await page.fill('input[type="email"]', 'admin@fleetmadagascar.mg');
        await page.fill('input[type="password"]', 'testpassword123');
        await page.click('button[type="submit"]');
        // Attendre que l'URL change (dashboard ou root)
        await page.waitForURL(/.*(\/|\/dashboard)$/);
    });

    test.describe('Liste des véhicules', () => {
        test('Affichage de la liste des véhicules', async ({ page }) => {
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

        test('Navigation vers les détails d\'un véhicule', async ({ page }) => {
            await page.goto('/vehicles/list');
            // Cliquer sur le premier véhicule
            const firstRow = page.locator('tbody tr').first();
            await firstRow.click();

            // Vérifier la redirection vers /vehicles/[id]
            await page.waitForURL(/\/vehicles\/[a-zA-Z0-9]+/);
            await expect(page.locator('h1')).toBeVisible();
        });
    });

    test.describe('Affectations de véhicules', () => {
        test('Affichage de la page des affectations', async ({ page }) => {
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
        test('Affichage de la page des dépenses', async ({ page }) => {
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
        test('Affichage de l\'historique des compteurs', async ({ page }) => {
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
        test('Affichage de l\'analyse de remplacement', async ({ page }) => {
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
