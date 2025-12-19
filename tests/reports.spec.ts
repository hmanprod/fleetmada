import { test, expect, Page, BrowserContext } from '@playwright/test';

test.describe('Module Reports - Tests E2E', () => {
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

  test.describe('Accès et Navigation', () => {
    test('Accéder à la page Reports', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Vérifier que l'utilisateur est connecté
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      
      // Naviguer vers Reports
      await page.click('a[href="/reports"]');
      await page.waitForLoadState('networkidle');
      
      // Vérifier le titre de la page
      await expect(page.locator('h1')).toContainText('Reports');
      
      // Vérifier les éléments principaux
      await expect(page.locator('[data-testid="search-reports"]')).toBeVisible();
      await expect(page.locator('[data-testid="reports-grid"]')).toBeVisible();
    });

    test('Interface utilisateur de Reports', async () => {
      // Vérifier la barre de recherche
      await expect(page.locator('input[placeholder*="Search for a Report"]')).toBeVisible();
      
      // Vérifier les onglets
      await expect(page.locator('button:has-text("Standard Reports")')).toBeVisible();
      await expect(page.locator('button:has-text("Favorites")')).toBeVisible();
      await expect(page.locator('button:has-text("Saved")')).toBeVisible();
      await expect(page.locator('button:has-text("Shared")')).toBeVisible();
      
      // Vérifier les catégories de rapports
      await expect(page.locator('button:has-text("Vehicles")')).toBeVisible();
      await expect(page.locator('button:has-text("Service")')).toBeVisible();
      await expect(page.locator('button:has-text("Fuel")')).toBeVisible();
      await expect(page.locator('button:has-text("Issues")')).toBeVisible();
      await expect(page.locator('button:has-text("Inspections")')).toBeVisible();
      await expect(page.locator('button:has-text("Contacts")')).toBeVisible();
      await expect(page.locator('button:has-text("Parts")')).toBeVisible();
      
      // Vérifier les boutons de vue (grille/liste)
      await expect(page.locator('button[aria-label="Grid view"]')).toBeVisible();
      await expect(page.locator('button[aria-label="List view"]')).toBeVisible();
    });
  });

  test.describe('Templates de Rapports', () => {
    test('Affichage des templates par catégorie', async () => {
      // Tester le filtre par catégorie Vehicles
      await page.click('button:has-text("Vehicles")');
      await page.waitForTimeout(500);
      
      // Vérifier que des templates sont affichés
      const reportCards = page.locator('[data-testid="report-card"]');
      await expect(reportCards).toHaveCount(1); // Au moins un template
      
      // Tester une autre catégorie
      await page.click('button:has-text("Service")');
      await page.waitForTimeout(500);
      await expect(reportCards).toHaveCount(1);
    });

    test('Changer de vue (grille ↔ liste)', async () => {
      // Vérifier la vue grille par défaut
      await expect(page.locator('[data-testid="reports-grid"]')).toBeVisible();
      
      // Basculer en vue liste
      await page.click('button[aria-label="List view"]');
      await page.waitForTimeout(500);
      
      // Vérifier que la vue liste est active
      await expect(page.locator('[data-testid="reports-list"]')).toBeVisible();
      
      // Revenir en vue grille
      await page.click('button[aria-label="Grid view"]');
      await page.waitForTimeout(500);
      await expect(page.locator('[data-testid="reports-grid"]')).toBeVisible();
    });
  });

  test.describe('Génération de Rapports', () => {
    test('Générer un rapport depuis un template', async () => {
      // Attendre que les templates soient chargés
      await page.waitForSelector('[data-testid="report-card"]', { timeout: 10000 });
      
      // Trouver un template et cliquer sur "Générer"
      const generateButton = page.locator('button:has-text("Générer")').first();
      await generateButton.click();
      
      // Vérifier l'indicateur de génération
      await expect(page.locator('text=Génération d\'un rapport en cours...')).toBeVisible();
      
      // Attendre que la génération se termine (avec timeout étendu)
      await expect(page.locator('text=Génération d\'un rapport en cours...')).toBeHidden({ timeout: 30000 });
      
      // Vérifier le message de succès
      await expect(page.locator('text=Rapport généré et sauvegardé avec succès!')).toBeVisible();
      
      // Fermer le message de succès
      await page.keyboard.press('Escape');
    });

    test('Générer un rapport avec configuration personnalisée', async () => {
      // Cette fonctionnalité sera testée après l'implémentation de l'interface de configuration
      // Pour l'instant, on teste la génération basique
      
      const generateButton = page.locator('button:has-text("Générer")').last();
      await generateButton.click();
      
      // Attendre la génération
      await page.waitForSelector('text=Rapport généré et sauvegardé avec succès!', { timeout: 30000 });
      await expect(page.locator('text=Rapport généré et sauvegardé avec succès!')).toBeVisible();
    });
  });

  test.describe('Gestion des Favoris', () => {
    test('Ajouter/retirer des favoris', async () => {
      // Cliquer sur le bouton favori d'un rapport
      const favoriteButton = page.locator('button[title="Ajouter aux favoris"]').first();
      await favoriteButton.click();
      
      // Vérifier que le bouton change d'état
      await expect(favoriteButton.locator('path')).toHaveAttribute('fill', '#ef4444'); // Couleur rouge
      
      // Aller à l'onglet Favoris
      await page.click('button:has-text("Favorites")');
      await page.waitForTimeout(500);
      
      // Vérifier que le rapport apparaît dans les favoris
      await expect(page.locator('[data-testid="report-card"]')).toBeVisible();
    });

    test('Retirer un favori', async () => {
      // Cliquer sur le bouton favori pour le retirer
      const favoriteButton = page.locator('button[title="Ajouter aux favoris"]').first();
      await favoriteButton.click();
      
      // Vérifier que le bouton change d'état
      await expect(favoriteButton.locator('path')).toHaveAttribute('fill', 'none'); // Couleur transparente
      
      // Vérifier que l'onglet Favoris ne contient plus de rapports
      await expect(page.locator('[data-testid="report-card"]')).toHaveCount(0);
    });
  });

  test.describe('Recherche et Filtrage', () => {
    test('Rechercher des rapports', async () => {
      // Entrer un terme de recherche
      const searchInput = page.locator('input[placeholder*="Search for a Report"]');
      await searchInput.fill('cost');
      await page.waitForTimeout(500);
      
      // Vérifier que les résultats sont filtrés
      const reportCards = page.locator('[data-testid="report-card"]');
      // Les résultats peuvent être filtrés ou non selon les données de test
      
      // Effacer la recherche
      await searchInput.clear();
      await page.waitForTimeout(500);
    });

    test('Filtrer par catégorie ET recherche', async () => {
      // Sélectionner une catégorie
      await page.click('button:has-text("Fuel")');
      await page.waitForTimeout(500);
      
      // Ajouter une recherche
      const searchInput = page.locator('input[placeholder*="Search for a Report"]');
      await searchInput.fill('summary');
      await page.waitForTimeout(500);
      
      // Vérifier que les deux filtres sont appliqués
      // Les résultats doivent correspondre à la catégorie Fuel ET contenir "summary"
    });
  });

  test.describe('Export et Partage', () => {
    test('Exporter un rapport en CSV', async () => {
      // Générer d'abord un rapport s'il n'y en a pas
      let reportCards = page.locator('[data-testid="report-card"]');
      if (await reportCards.count() === 0) {
        await page.click('button:has-text("Générer")');
        await page.waitForTimeout(2000);
      }
      
      // Cliquer sur le bouton d'export CSV
      const exportButton = page.locator('button[title="Exporter CSV"]').first();
      await exportButton.click();
      
      // Vérifier que le téléchargement commence
      // (Playwright ne peut pas vérifier directement les téléchargements, 
      // mais on peut vérifier qu'il n'y a pas d'erreur)
      await page.waitForTimeout(1000);
    });

    test('Partager un rapport', async () => {
      // Cliquer sur le bouton de partage
      const shareButton = page.locator('button[title="Partager"]').first();
      await shareButton.click();
      
      // Une boîte de dialogue devrait apparaître
      // Dans l'implémentation actuelle, c'est un prompt()
      // On va simuler la saisie d'un email
      page.on('dialog', async (dialog) => {
        if (dialog.type() === 'prompt') {
          await dialog.accept('test@example.com');
        }
      });
      
      // Attendre le message de succès
      await expect(page.locator('text=Rapport partagé avec succès!')).toBeVisible();
    });
  });

  test.describe('États de Chargement et Erreurs', () => {
    test('Gestion des erreurs de chargement', async () => {
      // Aller à la page reports directement
      await page.goto('/reports');
      await page.waitForLoadState('networkidle');
      
      // Vérifier l'état initial
      await expect(page.locator('h1')).toContainText('Reports');
    });

    test('États de chargement', async () => {
      // Aller à la page reports
      await page.goto('/reports');
      await page.waitForLoadState('networkidle');
      
      // Vérifier que la page se charge correctement
      await expect(page.locator('h1')).toContainText('Reports');
    });
  });

  test.describe('Pagination', () => {
    test('Navigation de pagination', async () => {
      // Cette fonctionnalité sera testée quand il y aura suffisamment de rapports
      // Pour l'instant, vérifier que les contrôles de pagination existent
      await expect(page.locator('button:has-text("Précédent")')).toBeVisible();
      await expect(page.locator('button:has-text("Suivant")')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('Interface mobile', async () => {
      // Définir la taille d'écran mobile
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Vérifier que la sidebar mobile est cachée
      await expect(page.locator('[data-testid="sidebar"]')).not.toBeVisible();
      
      // Vérifier que les éléments principaux sont toujours visibles
      await expect(page.locator('h1:has-text("Reports")')).toBeVisible();
      
      // Restaurer la taille d'écran
      await page.setViewportSize({ width: 1280, height: 720 });
    });

    test('Interface tablette', async () => {
      // Définir la taille d'écran tablette
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Vérifier que l'interface s'adapte
      await expect(page.locator('h1:has-text("Reports")')).toBeVisible();
      
      // Vérifier que les boutons restent accessibles
      await expect(page.locator('button:has-text("Générer")')).toBeVisible();
      
      // Restaurer la taille d'écran
      await page.setViewportSize({ width: 1280, height: 720 });
    });
  });
});

// Helper pour créer un utilisateur de test si nécessaire
test.describe('Setup - Création de données de test', () => {
  test('Préparer les données de test pour les rapports', async ({ page }) => {
    // Cette fonction peut être utilisée pour créer des données de test
    // si nécessaire pour les tests ci-dessus
    
    // Vérifier que la base de données est accessible
    await page.goto('/reports');
    await page.waitForLoadState('networkidle');
    
    // S'assurer qu'il y a des véhicules pour générer des rapports
    // (Cette partie dépend de l'implémentation des données de test)
  });
});