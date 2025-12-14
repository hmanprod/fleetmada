import { test, expect } from '@playwright/test';

test.describe('Navigation après connexion', () => {
  test('Redirection vers dashboard après connexion réussie', async ({ page }) => {
    console.log('🚀 Test de navigation après connexion avec Playwright...');
    
    // 1. Naviguer vers la page de connexion
    console.log('1. 📄 Navigation vers la page de connexion...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Attendre le formulaire de login
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 });
    console.log('✅ Page de connexion chargée');
    
    // 2. Se connecter avec les credentials de test
    console.log('2. 🔐 Tentative de connexion...');
    await page.fill('input[type="email"]', 'alain@taxibe.mg');
    await page.fill('input[type="password"]', 'userpassword123');
    
    // Cliquer sur le bouton de connexion
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForLoadState('networkidle')
    ]);
    
    console.log('✅ Connexion réussie');
    
    // 3. Vérifier la redirection
    await page.waitForTimeout(2000); // Attendre la navigation automatique
    
    const currentUrl = page.url();
    console.log('📍 URL actuelle:', currentUrl);
    
    // 4. Vérifier si on est sur l'onboarding ou le dashboard
    const bodyText = await page.textContent('body');
    
    console.log('3. 🔍 Analyse du contenu de la page...');
    
    // Vérifier si on est sur l'onboarding
    if (bodyText?.includes('Parlez-nous de votre flotte') || bodyText?.includes('Onboarding')) {
      console.log('✅ Redirection vers onboarding réussie');
      
      // 5. Tester le flux d'onboarding complet
      console.log('4. 🧪 Test du flux d\'onboarding...');
      
      // Étape 1: Sélectionner la taille de flotte
      await page.click('button:has-text("1-10")');
      
      // Vérifier les options disponibles dans le select
      const selectOptions = await page.locator('select option').allTextContents();
      console.log('📋 Options disponibles:', selectOptions);
      
      // Utiliser une option qui existe réellement
      await page.selectOption('select', 'Logistique / Transport');
      
      // Cliquer sur Continuer
      await page.click('button:has-text("Continuer")');
      await page.waitForTimeout(1000);
      
      // Étape 2: Sélectionner les objectifs (au moins un)
      await page.check('input[type="checkbox"]');
      await page.click('button:has-text("Continuer")');
      await page.waitForTimeout(1000);
      
      // Étape 3: Bouton "Aller au tableau de bord"
      console.log('5. 🎯 Test du bouton "Aller au tableau de bord"...');
      
      // Attendre que le bouton soit visible et cliquable
      const dashboardButton = page.locator('button:has-text("Aller au tableau de bord")');
      await expect(dashboardButton).toBeVisible({ timeout: 10000 });
      await expect(dashboardButton).toBeEnabled();
      
      console.log('✅ Bouton "Aller au tableau de bord" trouvé et activé');
      
      // Cliquer sur le bouton
      await dashboardButton.click();
      
      // Attendre la redirection
      await page.waitForTimeout(3000);
      
      const finalUrl = page.url();
      console.log('📍 URL finale après clic:', finalUrl);
      
      // Vérifier la redirection vers le dashboard
      if (finalUrl.includes('/app/(main)') || finalUrl.includes('/dashboard')) {
        console.log('✅ Redirection vers le dashboard réussie!');
        
        // Vérifier que le contenu du dashboard est présent
        await expect(page.locator('body')).toContainText('Bienvenue sur FleetMada');
        console.log('✅ Contenu du dashboard vérifié');
      } else {
        throw new Error(`Redirection inattendue vers: ${finalUrl}`);
      }
      
    } else if (bodyText?.includes('Bienvenue sur FleetMada') || bodyText?.includes('Tableau de bord')) {
      console.log('✅ Redirection directe vers le dashboard réussie!');
    } else {
      throw new Error(`Page inattendue après connexion. Contenu: ${bodyText?.substring(0, 200)}...`);
    }
    
    console.log('🎉 Test de navigation terminé avec succès!');
  });
  
  test('Échec de connexion avec credentials incorrects', async ({ page }) => {
    console.log('🧪 Test d\'échec de connexion...');
    
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Tenter de se connecter avec de mauvais credentials
    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Vérifier qu'un message d'erreur s'affiche - selector plus précis
    const errorMessage = page.locator('p.text-sm.text-red-600');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Gestion d\'erreur de connexion testée');
  });
});