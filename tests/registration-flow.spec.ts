import { test, expect } from '@playwright/test';

test.describe('Flux d\'inscription user (SPA Flow)', () => {
    test('Inscription complète, onboarding et redirection vers dashboard', async ({ page }) => {
        // Capturer les logs du navigateur
        page.on('console', msg => console.log(`[Browser] ${msg.type()}: ${msg.text()}`));

        console.log('🚀 Démarrage du test d\'inscription (SPA)...');

        // Générer un email unique pour ce test
        const timestamp = new Date().getTime();
        const email = `user_${timestamp}@test.com`;
        const password = 'Password123!';

        console.log(`📧 Email généré: ${email}`);

        // 1. Aller sur la racine (SPA Entry Point)
        await page.goto('/login');

        // Vérifier qu'on est sur le Login initialement
        await expect(page.locator('h2')).toContainText(/Connectez-vous à votre compte/i);

        // 2. Changer vers Inscription
        console.log('🔄 Passage vers la page d\'inscription...');
        // Cliquer sur le bouton "Créer un compte" du bas
        await page.click('button:has-text("Créer un compte")');

        // Vérifier qu'on est sur la vue Inscription
        await expect(page.locator('h2')).toContainText(/Commencez/i);

        // 3. Remplir le formulaire
        console.log('✍️ Remplissage du formulaire...');
        await page.fill('input[name="firstName"]', 'Test');
        await page.fill('input[name="lastName"]', `User ${timestamp}`);
        await page.fill('input[name="companyName"]', `Company ${timestamp}`);
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', password);
        await page.fill('input[name="confirmPassword"]', password);

        // Cocher les conditions
        await page.check('input[name="terms"]');

        // 4. Soumettre
        console.log('🚀 Soumission du formulaire...');
        await page.click('button:has-text("Commencer")');

        // 5. Onboarding Step 1: Taille de flotte
        // Le titre devrait changer
        console.log('🚚 Step 1: Taille de flotte');
        await expect(page.locator('h2')).toContainText(/Parlez-nous de votre flotte/i, { timeout: 15000 });

        // Sélectionner taille
        await page.click('button:has-text("1-10")');
        // Sélectionner industrie
        await page.selectOption('select', { index: 1 }); // Premier choix après placeholder
        // Continuer
        await page.click('button:has-text("Continuer")');

        // 6. Onboarding Step 2: Objectifs
        console.log('🎯 Step 2: Objectifs');
        await expect(page.locator('h2')).toContainText(/Quelles sont vos priorités/i);
        // Cocher le premier objectif
        await page.click('input[type="checkbox"] >> nth=0');
        // Continuer
        await page.click('button:has-text("Continuer")');

        // 7. Validation finale (Step 3)
        console.log('🏁 Validation finale');
        await expect(page.locator('h2')).toContainText(/Vous êtes prêt/i);

        const dashboardButton = page.locator('button:has-text("Aller au tableau de bord")');
        await expect(dashboardButton).toBeVisible();
        await dashboardButton.click();

        // 8. Vérifier redirection vers le dashboard
        // AuthFlow redirige vers /dashboard
        console.log('⏳ Attente de redirection vers dashboard...');
        await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });

        console.log('🎉 Test réussi: Inscription -> Onboarding -> Dashboard OK');
    });
});
