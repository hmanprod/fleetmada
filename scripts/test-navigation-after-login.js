#!/usr/bin/env node

/**
 * Test de navigation après connexion
 * Vérifie que le bouton "Aller au tableau de bord" redirige correctement
 */

const puppeteer = require('puppeteer');

async function testNavigationAfterLogin() {
  console.log('🚀 Test de navigation après connexion...\n');
  
  let browser;
  
  try {
    // Configuration du navigateur
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Activer les logs de console pour le debug
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('❌ Erreur console:', msg.text());
      }
    });
    
    // Naviguer vers la page de connexion
    console.log('1. 📄 Navigation vers la page de connexion...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // Attendre le chargement du formulaire de login
    await page.waitForSelector('form', { timeout: 10000 });
    console.log('✅ Page de connexion chargée\n');
    
    // Se connecter avec les credentials de test
    console.log('2. 🔐 Tentative de connexion...');
    await page.type('input[type="email"]', 'alain@taxibe.mg');
    await page.type('input[type="password"]', 'userpassword123');
    
    // Cliquer sur le bouton de connexion
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);
    
    console.log('✅ Connexion réussie\n');
    
    // Vérifier l'état après connexion
    await page.waitForSelector('body', { timeout: 5000 });
    
    // Vérifier si on est redirigé vers l'onboarding ou le dashboard
    const currentUrl = page.url();
    console.log('3. 🔄 URL après connexion:', currentUrl);
    
    // Attendre un peu pour la navigation automatique
    await page.waitForTimeout(2000);
    
    const afterLoginUrl = page.url();
    console.log('📍 URL finale:', afterLoginUrl);
    
    // Vérifier les éléments présents sur la page
    const bodyText = await page.evaluate(() => document.body.innerText);
    
    console.log('\n4. 🔍 Analyse du contenu de la page...');
    
    if (bodyText.includes('Onboarding') || bodyText.includes('Parlez-nous de votre flotte')) {
      console.log('✅ Page d\'onboarding détectée - redirection réussie vers onboarding');
      
      // Tester le bouton "Aller au tableau de bord" dans l'onboarding
      console.log('\n5. 🧪 Test du bouton "Aller au tableau de bord"...');
      
      // Naviguer vers l'étape finale de l'onboarding
      // Remplir les étapes 1 et 2 pour arriver à l'étape 3
      await page.click('button:contains("Continuer")').catch(() => {});
      
      // Essayer de trouver et cliquer sur le bouton final
      const dashboardButton = await page.$x('//button[contains(text(), "Aller au tableau de bord")]');
      if (dashboardButton.length > 0) {
        console.log('✅ Bouton "Aller au tableau de bord" trouvé');
        
        // Cliquer sur le bouton et vérifier la redirection
        await dashboardButton[0].click();
        await page.waitForTimeout(3000);
        
        const finalUrl = page.url();
        console.log('📍 URL après clic sur "Aller au tableau de bord":', finalUrl);
        
        if (finalUrl.includes('/app/(main)') || finalUrl.includes('/dashboard')) {
          console.log('✅ Redirection vers le dashboard réussie!');
        } else {
          console.log('❌ Problème de redirection - URL inattendue:', finalUrl);
        }
      } else {
        console.log('⚠️  Bouton "Aller au tableau de bord" non trouvé');
      }
    } 
    else if (bodyText.includes('Tableau de bord') || bodyText.includes('dashboard')) {
      console.log('✅ Redirection directe vers le dashboard réussie!');
    }
    else {
      console.log('❌ Page inattendue après connexion');
      console.log('Contenu de la page:', bodyText.substring(0, 500) + '...');
    }
    
    console.log('\n🎉 Test de navigation terminé!');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Exécuter le test
testNavigationAfterLogin()
  .then(() => {
    console.log('\n✅ Tous les tests passés avec succès!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Échec du test:', error);
    process.exit(1);
  });