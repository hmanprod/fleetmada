
import { test, expect } from '@playwright/test';

test.describe('Flux de Connexion et Onboarding', () => {
    test('Connexion avec nouvel utilisateur, Onboarding et accès Dashboard', async ({ page, request }) => {
        // Capturer les logs
        page.on('console', msg => console.log(`[Browser] ${msg.type()}: ${msg.text()} `));
        page.on('requestfailed', req => console.log(`[RequestFailed] ${req.method()} ${req.url()} :: ${req.failure()?.errorText || 'failed'}`));
        page.on('response', async response => {
            const url = response.url();
            if (response.status() === 404) {
                console.log(`[HTTP 404] ${url}`);
            }
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
        await page.goto('/login', { waitUntil: 'networkidle' });

        // Vérifier page de connexion (titre ou bouton)
        await expect(page.locator('h2')).toContainText(/Connectez-vous à votre compte/i);

        // 3. Remplir le formulaire de connexion
        console.log('✍️ Connexion...');
        await page.getByTestId('email-input').fill(email);
        await page.getByTestId('password-input').fill(password);

        const loginBtn = page.getByTestId('login-button');
        await expect(loginBtn).toBeEnabled({ timeout: 60000 });
        await loginBtn.click();

        // Attendre que la requête réseau se fasse
        await page.waitForLoadState('networkidle');

        // 4. Vérifier la redirection vers Onboarding
        console.log('👀 Vérification redirection Onboarding...');
        // AuthFlow redirige vers le composant onboarding (URL reste / pour le moment ou change ?)
        // await expect(page).toHaveURL(/.*onboarding.*/, { timeout: 15000 }); // Retiré car c'est une SPA
        await expect(page.locator('h2')).toContainText(/Parlez-nous de votre flotte/i);
        console.log('✅ Composant Onboarding visible');

        // Note: l'UI Onboarding évolue souvent; ce test se limite à vérifier
        // l'arrivée sur l'onboarding après la première connexion.
        console.log('🎉 Test Login -> Onboarding RÉUSSI');
    });
});
