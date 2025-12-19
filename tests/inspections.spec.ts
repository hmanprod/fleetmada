import { test, expect, Page, BrowserContext } from '@playwright/test';

test.describe('Module Inspections - Tests E2E', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    page = await context.newPage();
  });

  test.afterEach(async () => {
    await context.close();
  });

  // Tests de connexion et navigation
  test.describe('Connexion et Navigation', () => {
    test('Connexion utilisateur et accès au module Inspections', async () => {
      // Aller à la page de connexion
      await page.goto('/login');
      
      // Vérifier que la page de connexion s'affiche
      await expect(page.locator('h1, h2')).toContainText(/connexion|login/i);
      
      // Saisir les identifiants (à adapter selon l'authentification réelle)
      await page.fill('input[type="email"], input[name="email"]', 'test@fleetmada.com');
      await page.fill('input[type="password"], input[name="password"]', 'password123');
      
      // Cliquer sur le bouton de connexion
      await page.click('button[type="submit"], button:has-text("Se connecter"), button:has-text("Login")');
      
      // Vérifier la redirection vers le dashboard
      await page.waitForURL('/dashboard');
      await expect(page.locator('h1')).toContainText(/dashboard|accueil/i);
      
      // Naviguer vers le module Inspections
      await page.click('a[href*="inspections"], button:has-text("Inspections")');
      await page.waitForURL('**/inspections**');
      
      // Vérifier l'affichage de la page principale des inspections
      await expect(page.locator('h1, h2')).toContainText(/inspection/i);
    });

    test('Navigation entre les pages du module Inspections', async () => {
      // Navigation directe vers les pages
      const pages = [
        { url: '/inspections', expectedText: /liste|inspection/i },
        { url: '/inspections/create', expectedText: /créer|nouveau/i },
        { url: '/inspections/history', expectedText: /historique/i }
      ];

      for (const { url, expectedText } of pages) {
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        await expect(page.locator('h1, h2')).toContainText(expectedText);
      }
    });
  });

  // Tests de création d'inspection
  test.describe('Création d\'Inspection', () => {
    test('Création d\'une inspection avec template', async () => {
      await page.goto('/inspections/create');
      
      // Vérifier le titre de la page
      await expect(page.locator('h1, h2')).toContainText(/créer|nouveau/i);
      
      // Remplir le formulaire de création
      await page.fill('input[name="title"], input[placeholder*="titre"]', 'Inspection Test E2E');
      
      // Sélectionner un véhicule (utiliser le premier disponible)
      const vehicleSelect = page.locator('select[name="vehicleId"], select[label*="véhicule"]');
      await vehicleSelect.selectOption({ index: 1 });
      
      // Sélectionner un template (utiliser le premier disponible)
      const templateSelect = page.locator('select[name="templateId"], select[label*="template"]');
      await templateSelect.selectOption({ index: 1 });
      
      // Sélectionner une date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];
      await page.fill('input[type="date"], input[name="scheduledDate"]', dateString);
      
      // Saisir le nom de l'inspecteur
      await page.fill('input[name="inspectorName"], input[placeholder*="inspecteur"]', 'Jean Dupont');
      
      // Optionnel: ajouter une description
      await page.fill('textarea[name="description"], input[name="location"]', 'Inspection test automatisé');
      
      // Soumettre le formulaire
      await page.click('button[type="submit"], button:has-text("Créer"), button:has-text("Enregistrer")');
      
      // Vérifier la redirection ou le message de succès
      await page.waitForTimeout(2000);
      
      // Si redirection vers les détails
      if (page.url().includes('/inspections/')) {
        await expect(page.locator('h1, h2')).toContainText(/détail|inspection/i);
      } else {
        // Vérifier un message de succès
        await expect(page.locator('.alert, .toast, .success')).toBeVisible();
      }
    });

    test('Validation des champs obligatoires', async () => {
      await page.goto('/inspections/create');
      
      // Essayer de soumettre le formulaire vide
      await page.click('button[type="submit"], button:has-text("Créer")');
      
      // Vérifier la présence des messages d'erreur
      await expect(page.locator('.error, .invalid, [role="alert"]')).toBeVisible();
      
      // Vérifier les champs requis spécifiquement
      const requiredFields = [
        'input[name="title"]',
        'select[name="vehicleId"]',
        'select[name="templateId"]'
      ];
      
      for (const field of requiredFields) {
        await expect(page.locator(field)).toHaveAttribute('required');
      }
    });
  });

  // Tests d'exécution d'inspection
  test.describe('Exécution d\'Inspection', () => {
    test('Démarrage et exécution d\'une inspection', async () => {
      // Créer ou utiliser une inspection existante
      await page.goto('/inspections');
      
      // Cliquer sur une inspection pour l'exécuter
      const inspectionLink = page.locator('a[href*="/inspections/"]:has-text("Démarrer")').first();
      if (await inspectionLink.isVisible()) {
        await inspectionLink.click();
      } else {
        // Fallback: cliquer sur la première inspection disponible
        const firstInspection = page.locator('a[href*="/inspections/"]').first();
        await firstInspection.click();
      }
      
      await page.waitForURL('**/inspections/**');
      
      // Cliquer sur "Démarrer l'inspection"
      await page.click('button:has-text("Démarrer"), button:has-text("Start")');
      
      // Vérifier le changement de statut
      await expect(page.locator('.status, .badge')).toContainText(/en cours|progress/i);
      
      // Remplir quelques éléments d'inspection
      const inspectionItems = page.locator('.inspection-item, .checklist-item');
      const itemCount = await inspectionItems.count();
      
      if (itemCount > 0) {
        // Cocher quelques éléments comme "Conforme"
        const firstRadio = page.locator('input[type="radio"][value="conforme"], input[type="radio"][value="pass"]').first();
        await firstRadio.click();
        
        const secondRadio = page.locator('input[type="radio"][value="non-conforme"], input[type="radio"][value="fail"]').nth(1);
        await secondRadio.click();
        
        // Ajouter des notes si disponible
        const notesField = page.locator('textarea[name="notes"], input[name="notes"]').first();
        if (await notesField.isVisible()) {
          await notesField.fill('Test E2E - Notes d\'inspection');
        }
      }
      
      // Compléter l'inspection
      await page.click('button:has-text("Terminer"), button:has-text("Complete")');
      
      // Vérifier le statut final
      await expect(page.locator('.status, .badge')).toContainText(/terminé|completed/i);
    });

    test('Système de scoring et conformité', async () => {
      await page.goto('/inspections');
      
      // Aller à une inspection complétée
      const completedInspection = page.locator('a[href*="/inspections/"]:has-text("Terminé"), a[href*="/inspections/"]:has-text("Completed")').first();
      if (await completedInspection.isVisible()) {
        await completedInspection.click();
        await page.waitForURL('**/inspections/**');
        
        // Vérifier l'affichage du score
        await expect(page.locator('.score, .compliance-score, .rating')).toBeVisible();
        
        // Vérifier les éléments de scoring
        const scoreElements = page.locator('.score-item, .scoring-element');
        const scoreCount = await scoreElements.count();
        
        if (scoreCount > 0) {
          // Vérifier que chaque élément a un score
          for (let i = 0; i < Math.min(scoreCount, 3); i++) {
            const element = scoreElements.nth(i);
            await expect(element.locator('.score, .points')).toBeVisible();
          }
        }
        
        // Vérifier le calcul du score global
        await expect(page.locator('.total-score, .overall-score, .final-score')).toBeVisible();
      }
    });
  });

  // Tests de modification et statut
  test.describe('Modification et Statut', () => {
    test('Modification d\'une inspection', async () => {
      await page.goto('/inspections');
      
      // Cliquer sur le bouton d'édition
      const editButton = page.locator('button:has-text("Modifier"), button:has-text("Edit"), a[href*="/edit"]').first();
      await editButton.click();
      await page.waitForURL('**/inspections/**/edit');
      
      // Modifier le titre
      await page.fill('input[name="title"], input[placeholder*="titre"]', 'Inspection Modifiée E2E');
      
      // Changer l'inspecteur
      await page.fill('input[name="inspectorName"], input[placeholder*="inspecteur"]', 'Marie Martin');
      
      // Modifier la date
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const dateString = nextWeek.toISOString().split('T')[0];
      await page.fill('input[type="date"], input[name="scheduledDate"]', dateString);
      
      // Sauvegarder
      await page.click('button[type="submit"], button:has-text("Sauvegarder"), button:has-text("Save")');
      
      // Vérifier le retour aux détails
      await expect(page.locator('h1, h2')).toContainText(/détail|inspection/i);
    });

    test('Changement de statut (démarrer, compléter, annuler)', async () => {
      await page.goto('/inspections');
      
      // Sélectionner une inspection
      const inspectionLink = page.locator('a[href*="/inspections/"]').first();
      await inspectionLink.click();
      await page.waitForURL('**/inspections/**');
      
      // Test démarrage inspection
      const startButton = page.locator('button:has-text("Démarrer"), button:has-text("Start")');
      if (await startButton.isVisible()) {
        await startButton.click();
        await expect(page.locator('.status')).toContainText(/en cours/i);
      }
      
      // Test annulation inspection
      const cancelButton = page.locator('button:has-text("Annuler"), button:has-text("Cancel")');
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
        
        // Confirmer l'annulation si nécessaire
        const confirmButton = page.locator('button:has-text("Confirmer"), button:has-text("Confirm")');
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }
        
        await expect(page.locator('.status')).toContainText(/annulé|cancelled/i);
      }
    });
  });

  // Tests de filtres et recherche
  test.describe('Filtres et Recherche', () => {
    test('Filtres par statut', async () => {
      await page.goto('/inspections');
      
      // Vérifier la présence des filtres
      await expect(page.locator('select[name="status"], .filter-status')).toBeVisible();
      
      // Tester chaque filtre de statut
      const statuses = ['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
      
      for (const status of statuses) {
        await page.selectOption('select[name="status"], .filter-status', status);
        await page.waitForTimeout(500); // Attendre le filtrage
        
        // Vérifier que les résultats correspondent au filtre
        const statusBadges = page.locator('.status-badge, .status');
        const badgeCount = await statusBadges.count();
        
        if (badgeCount > 0) {
          // Vérifier que tous les éléments affichés correspondent au filtre
          for (let i = 0; i < Math.min(badgeCount, 3); i++) {
            const badge = statusBadges.nth(i);
            await expect(badge).toContainText(new RegExp(status, 'i'));
          }
        }
      }
    });

    test('Recherche textuelle', async () => {
      await page.goto('/inspections');
      
      // Vérifier la présence du champ de recherche
      const searchInput = page.locator('input[type="search"], input[placeholder*="rechercher"], .search-input');
      await expect(searchInput).toBeVisible();
      
      // Effectuer une recherche
      await searchInput.fill('Test');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      
      // Vérifier que les résultats contiennent le terme recherché
      // (La vérification exacte dépend de l'implémentation du filtrage)
      const results = page.locator('.inspection-item, tr, .result-item');
      await expect(results.first()).toBeVisible();
    });

    test('Filtres par véhicule et période', async () => {
      await page.goto('/inspections');
      
      // Filtre par véhicule
      const vehicleFilter = page.locator('select[name="vehicleId"], .filter-vehicle');
      if (await vehicleFilter.isVisible()) {
        await vehicleFilter.selectOption({ index: 1 });
        await page.waitForTimeout(500);
      }
      
      // Filtre par période
      const dateFilter = page.locator('select[name="dateRange"], .filter-date');
      if (await dateFilter.isVisible()) {
        // Utiliser une valeur fixe au lieu d'une regex
        await dateFilter.selectOption({ label: '30 derniers jours' });
        await page.waitForTimeout(500);
      }
      
      // Vérifier que les filtres s'appliquent
      const results = page.locator('.inspection-item, tr');
      await expect(results.first()).toBeVisible();
    });
  });

  // Tests responsive design
  test.describe('Responsive Design', () => {
    test('Affichage mobile du module Inspections', async () => {
      // Redimensionner pour mobile
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/inspections');
      
      // Vérifier que le menu mobile s'affiche
      const mobileMenu = page.locator('.mobile-menu, .hamburger, .menu-toggle');
      if (await mobileMenu.isVisible()) {
        await mobileMenu.click();
      }
      
      // Vérifier la navigation mobile
      await expect(page.locator('.sidebar, .mobile-nav')).toBeVisible();
      
      // Vérifier que les éléments s'affichent correctement en mobile
      const inspectionCards = page.locator('.inspection-card, .grid > div');
      const cardCount = await inspectionCards.count();
      
      if (cardCount > 0) {
        // En mobile, les cartes doivent être empilées verticalement
        const firstCard = inspectionCards.first();
        await expect(firstCard).toBeVisible();
      }
    });

    test('Navigation tactile sur mobile', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/inspections/create');
      
      // Tester les interactions tactiles
      await page.touchscreen.tap(200, 300);
      
      // Tester la navigation entre onglets si disponible
      const tabs = page.locator('.tab, .nav-tab');
      if (await tabs.count() > 0) {
        await tabs.first().click();
        await page.waitForTimeout(500);
        await tabs.nth(1).click();
      }
    });
  });

  // Tests d'intégration véhicules
  test.describe('Intégration Véhicules', () => {
    test('Navigation vers fiche véhicule depuis inspection', async () => {
      await page.goto('/inspections');
      
      // Cliquer sur un lien véhicule depuis une inspection
      const vehicleLink = page.locator('a[href*="/vehicles/"], .vehicle-link').first();
      if (await vehicleLink.isVisible()) {
        await vehicleLink.click();
        await page.waitForURL('**/vehicles/**');
        
        // Vérifier l'affichage de la fiche véhicule
        await expect(page.locator('h1, h2')).toContainText(/véhicule|vehicle/i);
      }
    });

    test('Sélection de véhicule lors de création inspection', async () => {
      await page.goto('/inspections/create');
      
      // Vérifier que la liste des véhicules se charge
      const vehicleSelect = page.locator('select[name="vehicleId"]');
      await expect(vehicleSelect).toBeVisible();
      
      // Vérifier que les options contiennent des véhicules
      const options = page.locator('select[name="vehicleId"] option');
      const optionCount = await options.count();
      expect(optionCount).toBeGreaterThan(1); // Au moins une option vide + des véhicules
      
      // Sélectionner un véhicule
      await vehicleSelect.selectOption({ index: 1 });
      
      // Vérifier que les informations du véhicule s'affichent si implémenté
      const vehicleInfo = page.locator('.vehicle-info, .vehicle-details');
      if (await vehicleInfo.isVisible()) {
        await expect(vehicleInfo).toBeVisible();
      }
    });
  });

  // Tests d'historique et rapports
  test.describe('Historique et Rapports', () => {
    test('Consultation de l\'historique des inspections', async () => {
      await page.goto('/inspections/history');
      
      // Vérifier l'affichage de l'historique
      await expect(page.locator('h1, h2')).toContainText(/historique/i);
      
      // Vérifier la présence des inspections historiques
      const historyItems = page.locator('.history-item, .inspection-history tr');
      await expect(historyItems.first()).toBeVisible();
      
      // Tester les filtres d'historique si disponibles
      const dateFilter = page.locator('input[type="date"], select[name="dateRange"]');
      if (await dateFilter.isVisible()) {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const dateString = lastMonth.toISOString().split('T')[0];
        await page.fill('input[type="date"]', dateString);
        await page.waitForTimeout(1000);
      }
    });

    test('Export des données d\'inspections', async () => {
      await page.goto('/inspections/history');
      
      // Chercher le bouton d'export
      const exportButton = page.locator('button:has-text("Export"), button:has-text("CSV"), button:has-text("PDF")');
      if (await exportButton.isVisible()) {
        await exportButton.click();
        
        // Vérifier le téléchargement (selon l'implémentation)
        // await page.waitForEvent('download');
      }
    });
  });

  // Tests de performance et accessibilité
  test.describe('Performance et Accessibilité', () => {
    test('Temps de chargement des pages inspections', async () => {
      const startTime = Date.now();
      
      await page.goto('/inspections');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Moins de 5 secondes
      
      // Vérifier que le contenu principal se charge
      await expect(page.locator('h1, .inspection-list')).toBeVisible();
    });

    test('Navigation au clavier', async () => {
      await page.goto('/inspections');
      
      // Tester la navigation au clavier
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      
      // Vérifier que la navigation fonctionne
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('Accessibilité des couleurs et contrastes', async () => {
      await page.goto('/inspections');
      
      // Vérifier les couleurs des statuts
      const statusElements = page.locator('.status, .badge, .status-badge');
      const statusCount = await statusElements.count();
      
      for (let i = 0; i < Math.min(statusCount, 3); i++) {
        const element = statusElements.nth(i);
        const color = await element.evaluate(el => getComputedStyle(el).color);
        const backgroundColor = await element.evaluate(el => getComputedStyle(el).backgroundColor);
        
        // Vérifier que les couleurs sont définies
        expect(color).toBeTruthy();
        expect(backgroundColor).toBeTruthy();
      }
    });
  });

  // Tests d'erreurs et cas limites
  test.describe('Gestion d\'Erreurs', () => {
    test('Affichage des erreurs de réseau', async () => {
      // Simuler une erreur réseau
      await page.route('**/api/**', route => {
        route.abort('internetdisconnected');
      });
      
      await page.goto('/inspections');
      await page.waitForTimeout(2000);
      
      // Vérifier l'affichage du message d'erreur
      await expect(page.locator('.error, .alert-error, [role="alert"]')).toBeVisible();
    });

    test('Gestion des données vides', async () => {
      await page.goto('/inspections');
      
      // Si pas de données, vérifier l'état vide
      const emptyState = page.locator('.empty-state, .no-data, .placeholder');
      const hasEmptyState = await emptyState.isVisible();
      
      if (hasEmptyState) {
        await expect(emptyState).toContainText(/aucun|pas de|empty/i);
      }
    });

    test('Redirection en cas d\'URL invalide', async () => {
      await page.goto('/inspections/invalid-id-12345');
      
      // Vérifier la redirection ou l'affichage d'erreur 404
      await page.waitForTimeout(2000);
      
      const is404 = page.url().includes('404') || 
                    page.locator('text=/404|not found|introuvable/i').isVisible();
      
      if (is404) {
        await expect(page.locator('text=/404|not found|introuvable/i')).toBeVisible();
      } else {
        // Ou redirection vers la liste
        await expect(page.locator('h1, h2')).toContainText(/inspection|liste/i);
      }
    });
  });
});
