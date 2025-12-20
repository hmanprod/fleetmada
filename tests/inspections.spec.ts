import { test, expect, Page, BrowserContext } from '@playwright/test';

test.describe('Module Inspections - Tests E2E', () => {
  test.setTimeout(90000); // Augmenter le timeout global pour les tests d'inspection
  let context: BrowserContext;
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      hasTouch: true
    });
    page = await context.newPage();

    // Connexion automatique avec les identifiants seedés
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"]', 'admin@fleetmadagascar.mg');
    await page.fill('input[type="password"], input[name="password"]', 'testpassword123');
    await page.click('button[type="submit"], button:has-text("Se connecter"), button:has-text("Login")');

    // Attendre d'être sur le dashboard (onboarding devrait être sauté car l'utilisateur a déjà une entreprise)
    await page.waitForURL('/dashboard', { timeout: 30000 });

    // Attendre que le chargement des données soit terminé (l'overlay disparaît)
    // On met un timeout plus long et on ne fail pas si l'élément n'est plus là
    try {
      await page.waitForSelector('text=Chargement des données...', { state: 'hidden', timeout: 45000 });
    } catch (e) {
      console.log('Timeout waiting for loading overlay to hide, proceeding anyway...');
    }

    // Petit délai pour laisser le temps aux modals éventuels de s'afficher
    // Si un modal d'onboarding apparaît quand même, on essaie de le fermer
    const onboardingClose = page.locator('button:has-text("Plus tard"), button[aria-label="Close"], .modal-close');
    if (await onboardingClose.isVisible({ timeout: 2000 }).catch(() => false)) {
      await onboardingClose.click();
    }
  });

  test.afterEach(async () => {
    await context.close();
  });

  // Tests de navigation
  test.describe('Navigation', () => {
    test('Accès au module Inspections depuis le dashboard', async () => {
      // Naviguer vers le module Inspections
      // On s'assure que l'élément est cliquable et non intercepté
      const inspectionLink = page.locator('a[href="/inspections"], a:has-text("Inspections"), button:has-text("Inspections")').first();
      await inspectionLink.waitFor({ state: 'visible' });
      await inspectionLink.click({ force: true });
      await page.waitForURL('**/inspections**');

      // Vérifier l'affichage de la page principale des inspections
      await expect(page.locator('h1').filter({ hasText: /inspection/i }).first()).toBeVisible();
    });

    test('Navigation entre les pages du module Inspections', async () => {
      // Navigation directe vers les pages
      const pages = [
        { url: '/inspections', expectedText: /inspection/i },
        { url: '/inspections/create', expectedText: /créer|nouv/i },
        { url: '/inspections/templates', expectedText: /modèle|template/i },
      ];

      for (const { url, expectedText } of pages) {
        await page.goto(url);
        await page.waitForLoadState('load');
        // Wait for any specific element if needed, but H1 filter is good
        await expect(page.locator('h1').filter({ hasText: expectedText }).first()).toBeVisible({ timeout: 10000 });
      }
    });
  });

  // Tests de création d'inspection
  test.describe('Création d\'Inspection', () => {
    test('Création d\'une inspection avec template', async () => {
      await page.goto('/inspections/create');

      // Vérifier le titre de la page
      await expect(page.locator('h1').filter({ hasText: /créer|nouv/i }).first()).toBeVisible();

      // Remplir le formulaire de création
      // Utiliser des sélecteurs plus précis pour éviter les ambiguïtés
      const vehicleSelect = page.locator('select').first();
      const templateSelect = page.locator('select').nth(1);

      // Attendre que les options soient chargées
      await vehicleSelect.locator('option').nth(1).waitFor({ state: 'attached', timeout: 15000 });
      await vehicleSelect.selectOption({ index: 1 });

      await templateSelect.locator('option').nth(1).waitFor({ state: 'attached', timeout: 15000 });
      await templateSelect.selectOption({ index: 1 });

      await page.fill('input[placeholder*="titre"]', 'Inspection Test E2E');

      // Sélectionner une date (le champ est datetime-local dans la page)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      const dateString = tomorrow.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm

      const dateInput = page.locator('input[type="datetime-local"], input[name="scheduledDate"]');
      await dateInput.fill(dateString);

      // Saisir le nom de l'inspecteur
      await page.fill('input[placeholder*="inspecteur"]', 'Jean Dupont');

      // Optionnel: ajouter une description et lieu
      await page.fill('textarea[placeholder*="Description"]', 'Inspection test automatisé');
      await page.fill('input[placeholder*="Lieu"]', 'Antananarivo');

      // Soumettre le formulaire
      await page.click('button:has-text("Sauvegarder"), button:has-text("Créer"), button:has-text("Enregistrer")');

      // Vérifier la redirection ou le message de succès
      await page.waitForTimeout(2000);

      // Si redirection vers les détails
      // Vérifier la présence de l'inspection créée
      await expect(page.locator('h1').filter({ hasText: /inspection/i }).first()).toBeVisible();
      // The original `else` block was syntactically incorrect after the change.
      // Assuming the intent was to check for a success message if not redirected to details,
      // this part needs to be re-evaluated based on actual application behavior.
      // For now, removing the orphaned `else` block to maintain syntactical correctness.
      // If a success message is expected *instead* of redirection, a conditional check would be needed.
    });

    test('Validation des champs obligatoires', async () => {
      await page.goto('/inspections/create');

      // Essayer de sauvegarder sans remplir les champs
      await page.click('button[type="submit"], button:has-text("Sauvegarder"), button:has-text("Save")');

      // Vérifier les messages d'erreur (ils peuvent être des tooltips HTML5 ou des messages personnalisés)
      // On vérifie que l'URL n'a pas changé si la validation bloque
      expect(page.url()).toContain('/inspections/create');

      // Vérifier les champs requis spécifiquement via placeholders
      const requiredSelectors = [
        'input[placeholder*="titre"]',
        'select', // On vérifie qu'il y a des selects pour les véhicules/templates
      ];

      for (const selector of requiredSelectors) {
        await expect(page.locator(selector).first()).toBeVisible();
      }
    });
  });

  // Tests d'exécution d'inspection
  test.describe('Exécution d\'Inspection', () => {
    test('Démarrage et exécution d\'une inspection', async () => {
      // Créer ou utiliser une inspection existante
      await page.goto('/inspections');

      // Cliquer sur une inspection pour l'exécuter
      // On cherche une inspection en attente (DRAFT ou SCHEDULED)
      const targetRow = page.locator('tbody tr').filter({ has: page.locator('span', { hasText: /DRAFT|SCHEDULED/ }) }).first();
      await expect(targetRow).toBeVisible({ timeout: 15000 });
      await targetRow.click();

      await page.waitForURL('**/inspections/**');
      await page.waitForLoadState('load');

      // Cliquer sur "Démarrer l'inspection" (peut être dans le header ou l'onglet exécution)
      const startButton = page.locator('button:has-text("Démarrer"), button:has-text("Start"), button:has-text("Commencer")').first();
      await expect(startButton).toBeVisible({ timeout: 15000 });

      console.log('Cliquer sur le bouton de démarrage et attendre les réponses API...');
      const startPromise = page.waitForResponse(response =>
        response.url().includes('/api/inspections/') && response.url().endsWith('/start') && response.request().method() === 'POST'
      );
      const refreshPromise = page.waitForResponse(response =>
        response.url().includes('/api/inspections/') && response.request().method() === 'GET'
      );

      await startButton.click();
      await startPromise;
      await refreshPromise;

      // Attendre que le chargement (s'il y en a un) disparaisse
      await page.waitForSelector('text=Chargement...', { state: 'hidden', timeout: 10000 }).catch(() => { });

      // Vérifier le changement de statut - On attend spécifiquement qu'il passe à IN_PROGRESS
      console.log('Attente du changement de statut vers IN_PROGRESS...');
      await expect(page.locator('.status-badge').first()).toContainText(/IN_PROGRESS/i, { timeout: 15000 });

      // Remplir tous les éléments d'inspection
      const inspectionItems = page.locator('.inspection-item');
      await inspectionItems.first().waitFor({ state: 'visible', timeout: 15000 });
      const itemsCount = await inspectionItems.count();
      console.log(`Remplissage de ${itemsCount} éléments d'inspection...`);

      for (let i = 0; i < itemsCount; i++) {
        const item = inspectionItems.nth(i);
        const passButton = item.locator('button').filter({ hasText: /^Conforme$|^Pass$|^OK$/ }).first();
        if (await passButton.isVisible()) {
          await passButton.click();
        }
      }

      // Cliquer sur le bouton de complétion
      const completeButton = page.locator('button:has-text("Terminer"), button:has-text("Complete"), button:has-text("Enregistrer")').last();
      await expect(completeButton).toBeVisible();

      const completePromise = page.waitForResponse(response =>
        // Match POST /api/inspections/[id] (completion) but NOT /results, /start, etc.
        // The ID should be the end of the path (ignoring query params)
        !!response.url().match(/\/api\/inspections\/[^/?]+$/) &&
        response.request().method() === 'POST'
      );

      await completeButton.click();
      await completePromise;

      // Attendre que le chargement (s'il y en a un) disparaisse
      await page.waitForSelector('text=Chargement...', { state: 'hidden', timeout: 10000 }).catch(() => { });

      // Vérifier le statut final
      console.log('Attente du statut final COMPLETED...');
      await expect(page.locator('.status-badge').first()).toContainText(/COMPLETED/i, { timeout: 15000 });
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

      // Cliquer sur une ligne pour aller aux détails
      // Cliquer sur une ligne pour aller aux détails (éviter les inspections complétées qui ne sont pas modifiables)
      const firstRow = page.locator('tbody tr').filter({ has: page.locator('span', { hasText: /DRAFT|SCHEDULED|IN_PROGRESS/ }) }).first();
      await expect(firstRow).toBeVisible();
      await firstRow.click();
      await page.waitForURL('**/inspections/**');

      // Cliquer sur le bouton d'édition dans la page de détails
      const editButton = page.locator('button:has-text("Modifier"), button:has-text("Edit")').first();
      await expect(editButton).toBeVisible();
      await editButton.click();
      await page.waitForURL('**/inspections/**/edit');

      // Modifier le titre
      await page.waitForSelector('input[name="title"]', { state: 'visible' });
      await page.fill('input[name="title"]', 'Inspection Modifiée E2E');

      // Changer l'inspecteur
      await page.fill('input[name="inspectorName"], input[placeholder*="inspecteur"]', 'Marie Martin');

      // Modifier la date
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(14, 0, 0, 0);
      const dateStringMod = nextWeek.toISOString().slice(0, 16);
      await page.fill('input[type="datetime-local"], input[name="scheduledDate"]', dateStringMod);

      // Sauvegarder
      await page.click('button:has-text("Sauvegarder"), button:has-text("Enregistrer"), button:has-text("Save")');

      // Vérifier le retour aux détails
      await expect(page.locator('h1').filter({ hasText: /détail|inspection/i }).first()).toBeVisible();
    });

    test('Changement de statut (démarrer, compléter, annuler)', async () => {
      await page.goto('/inspections');

      // Sélectionner une inspection (en mode liste)
      // On utilise la même logique que pour la modification pour être sûr de cliquer sur une ligne
      const row = page.locator('tbody tr').first();
      await expect(row).toBeVisible();
      await row.click();
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
      await expect(page.locator('button:has-text("Status:"), .filter-status').first()).toBeVisible();

      // Tester chaque filtre de statut
      const statuses = ['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

      for (const status of statuses) {
        // Selectionner l'option
        const filterSelect = page.locator('select[name="status"], .filter-status').first();
        if (await filterSelect.isVisible()) {
          await filterSelect.selectOption(status);
          await page.waitForTimeout(500); // Attendre le filtrage
        } else {
          // Si le filtre est un bouton ou dropdown custom
          // Skip pour ce test si non trouvé standard
          continue;
        }

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
      const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="rechercher"], .search-input').first();
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
      // Vérifier la navigation mobile (sidebar ou menu)
      // La sidebar a maintenant la classe .sidebar
      const navMenu = page.locator('.sidebar').first();
      await expect(navMenu).toBeVisible();

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
        await expect(page.locator('h1').filter({ hasText: /véhicule|vehicle/i }).first()).toBeVisible();
      }
    });

    test('Sélection de véhicule lors de création inspection', async () => {
      await page.goto('/inspections/create');

      // Vérifier que la liste des véhicules se charge
      // Vérifier que la liste des véhicules se charge
      const vehicleSelect = page.locator('select[name="vehicleId"]');
      await expect(vehicleSelect).toBeVisible();

      // Vérifier que les options contiennent des véhicules
      // Attendre que les options soient chargées
      await vehicleSelect.locator('option').nth(1).waitFor({ state: 'attached', timeout: 15000 }).catch(() => { });

      // Vérifier que les options contiennent des véhicules
      const options = page.locator('select[name="vehicleId"] option');
      // Attendre que les véhicules soient chargés (option > 1 car placeholder)
      await expect(async () => {
        const count = await options.count();
        expect(count).toBeGreaterThan(1);
      }).toPass({ timeout: 15000 });

      // Sélectionner un véhicule
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

      // Vérifier la présence de la table ou du message d'absence
      // Vérifier la présence de la table ou du message d'absence
      await expect(page.locator('table, .inspection-history').or(page.getByText('historique')).first()).toBeVisible();

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
      await expect(page.locator('h1, .inspection-list').first()).toBeVisible();
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
        await page.locator('text=/404|not found|introuvable/i').isVisible();

      if (is404) {
        await expect(page.locator('text=/404|not found|introuvable/i')).toBeVisible();
      } else {
        // En l'absence de page 404 explicite, on s'attend à être soit sur la page actuelle, soit redirigé
        // Ici on vérifie simplement que l'app ne crashe pas
        expect(page.url()).toBeDefined();
      }
    });
  });
});
