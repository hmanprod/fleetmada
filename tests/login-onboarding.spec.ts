
import { test, expect } from '@playwright/test';

test.describe('Flux de Connexion et Onboarding', () => {
    test('Connexion avec nouvel utilisateur, Onboarding et accès Dashboard', async ({ page, request }) => {
        // Capturer les logs
        page.on('console', msg => console.log(`[Browser] ${msg.type()}: ${msg.text()} `));
        page.on('response', async response => {
            const url = response.url();
            if (url.includes('/api/auth') || url.includes('/api/profile')) {
                console.log(`[Network] ${response.status()} ${url}`);
                try {
                    const json = await response.json();
                    console.log(`[Response Body]`, JSON.stringify(json, null, 2));
                } catch (e) {
                    console.log(`[Response Body] (Not JSON)`);
                }
            }
        });

        // 1. Préparation: Créer un utilisateur via API (SANS entreprise pour forcer l'onboarding)
        const timestamp = new Date().getTime();
        const email = `login_test_${timestamp}@test.com`;
        const password = 'Password123!';
        const firstName = 'Login';
        const lastName = 'Test';

        console.log(`📧 Création utilisateur via API: ${email} `);

        const registerResponse = await request.post('/api/auth/register', {
            data: {
                email,
                password,
                firstName,
                lastName,
                // PAS de companyName pour s'assurer que l'onboarding est requis
            }
        });

        const responseData = await registerResponse.json();
        console.log(`[API] Register status: ${registerResponse.status()}`);
        if (!registerResponse.ok()) {
            console.error('[API] Register error:', responseData);
        }
        expect(registerResponse.ok()).toBeTruthy();
        expect(responseData.success).toBe(true);
        console.log('✅ Utilisateur créé avec succès');

        // 2. Aller sur la page de connexion
        console.log('🔄 Navigation vers la page de connexion...');
        await page.goto('/');

        // Vérifier page de connexion (titre ou bouton)
        await expect(page.locator('h2')).toContainText(/Connectez-vous à votre compte/i);

        // 3. Remplir le formulaire de connexion
        console.log('✍️ Connexion...');
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', password);
        // await page.click('button:has-text("Se connecter")'); // Parfois fragile
        await page.click('button[type="submit"]');

        // Attendre que la requête réseau se fasse
        await page.waitForLoadState('networkidle');

        // 4. Vérifier la redirection vers Onboarding
        console.log('👀 Vérification redirection Onboarding...');
        // AuthFlow redirige vers le composant onboarding (URL reste / pour le moment ou change ?)
        // await expect(page).toHaveURL(/.*onboarding.*/, { timeout: 15000 }); // Retiré car c'est une SPA
        await expect(page.locator('h2')).toContainText(/Parlez-nous de votre flotte/i);
        console.log('✅ Composant Onboarding visible');

        // 5. Remplir Onboarding
        console.log('🚚 Remplissage Onboarding Step 1 (Taille)...');
        await page.click('button:has-text("1-10")');
        await page.selectOption('select', { index: 1 }); // Sélectionner une industrie
        await page.click('button:has-text("Continuer")');

        console.log('🎯 Remplissage Onboarding Step 2 (Objectifs)...');
        await expect(page.locator('h2')).toContainText(/Quelles sont vos priorités/i);
        await page.click('input[type="checkbox"] >> nth=0');
        await page.click('button:has-text("Continuer")');

        // 6. Finalisation
        console.log('🏁 Validation Onboarding...');
        await expect(page.locator('h2')).toContainText(/Vous êtes prêt/i);

        const dashboardButton = page.locator('button:has-text("Aller au tableau de bord")');
        await expect(dashboardButton).toBeVisible();
        await dashboardButton.click();

        // 7. Vérifier redirection Dashboard
        console.log('⏳ Attente redirection Dashboard...');
        await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });

        // Vérifier le titre de bienvenue personnalisé
        await expect(page.locator('h1')).toContainText(/Bienvenue sur FleetMada/i);

        // Vérifier la présence des widgets clés
        await expect(page.locator('h2', { hasText: 'Premiers pas' })).toBeVisible();
        await expect(page.locator('text=Coûts Totaux')).toBeVisible();

        console.log('🎉 Test Login -> Onboarding -> Dashboard RÉUSSI');
    });
});
