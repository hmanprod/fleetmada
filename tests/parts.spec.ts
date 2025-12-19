import { test, expect, Page } from '@playwright/test'

test.describe('Module Parts - Tests E2E', () => {
  let authToken: string

  test.setTimeout(90000);
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    page = await context.newPage();

    // 1. Authentification
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@fleetmadagascar.mg');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');

    // 2. Attendre la redirection vers le dashboard
    await page.waitForURL('**/dashboard**', { timeout: 30000 });

    // 3. Attendre que l'overlay de chargement disparaisse
    try {
      await page.waitForSelector('text=Chargement des données...', { state: 'hidden', timeout: 45000 });
    } catch (e) {
      console.log('Timeout waiting for loading overlay to hide, proceeding anyway...');
    }

    // 4. Gérer le modal éventuel
    try {
      const modalClose = page.locator('button:has-text("Plus tard"), button[aria-label="Close"], .modal-close').first();
      if (await modalClose.isVisible({ timeout: 5000 })) {
        await modalClose.click();
      }
    } catch (e) {
      // Pas de modal, on continue
    }
  });

  test('Devrait afficher la page des pièces avec la liste vide', async () => {
    // Aller à la page des pièces
    await page.goto('/parts');
    await expect(page).toHaveURL('/parts')

    // Vérifier le titre de la page
    await expect(page.locator('h1').filter({ hasText: 'Parts' }).first()).toBeVisible();

    // Vérifier les onglets
    await expect(page.locator('[data-testid="tab-all"], button:has-text("All")').first()).toBeVisible();
    await expect(page.locator('[data-testid="tab-low-stock"], button:has-text("Low Stock")').first()).toBeVisible();

    // Vérifier les filtres
    await expect(page.locator('input[placeholder*="Search"]').first()).toBeVisible();
  });

  test('Devrait créer une nouvelle pièce', async () => {
    // Cliquer sur "Add Part"
    await page.click('[data-testid="add-part-button"]')
    await expect(page).toHaveURL('/parts/create')

    // Remplir le formulaire
    await page.fill('[data-testid="part-number"]', 'TEST-001')
    await page.fill('[data-testid="part-description"]', 'Pièce de test pour les tests E2E')
    await page.selectOption('[data-testid="part-category"]', 'engine')
    await page.selectOption('[data-testid="part-manufacturer"]', 'bosch')
    await page.fill('[data-testid="part-cost"]', '15000')
    await page.fill('[data-testid="part-quantity"]', '10')
    await page.fill('[data-testid="part-minimum-stock"]', '5')

    // Sauvegarder
    await page.click('[data-testid="save-part-button"]')

    // Vérifier la redirection et le message de succès
    await expect(page).toHaveURL('/parts')
    await expect(page.locator('text=Pièce créée avec succès')).toBeVisible()

    // Vérifier que la pièce apparaît dans la liste
    await expect(page.locator('text=TEST-001')).toBeVisible()
    await expect(page.locator('text=Pièce de test pour les tests E2E')).toBeVisible()
  })

  test('Devrait afficher les détails d\'une pièce', async () => {
    // Créer d'abord une pièce pour les tests
    await page.click('[data-testid="add-part-button"]')
    await page.fill('[data-testid="part-number"]', 'DETAIL-001')
    await page.fill('[data-testid="part-description"]', 'Pièce pour test détails')
    await page.selectOption('[data-testid="part-category"]', 'filters')
    await page.fill('[data-testid="part-cost"]', '25000')
    await page.fill('[data-testid="part-quantity"]', '5')
    await page.click('[data-testid="save-part-button"]')

    // Cliquer sur la pièce pour voir les détails
    await page.click('text=DETAIL-001')
    await expect(page).toHaveURL('/parts/')

    // Vérifier les détails de la pièce
    await expect(page.locator('text=Détails')).toBeVisible()
    await expect(page.locator('text=DETAIL-001')).toBeVisible()
    await expect(page.locator('text=Pièce pour test détails')).toBeVisible()
    await expect(page.locator('text=État du stock')).toBeVisible()
    await expect(page.locator('text=5')).toBeVisible() // Quantité

    // Vérifier le bouton d'édition
    await expect(page.locator('[data-testid="edit-part-button"]')).toBeVisible()
  })

  test('Devrait éditer une pièce existante', async () => {
    // Créer d'abord une pièce
    await page.click('[data-testid="add-part-button"]')
    await page.fill('[data-testid="part-number"]', 'EDIT-001')
    await page.fill('[data-testid="part-description"]', 'Pièce pour test édition')
    await page.click('[data-testid="save-part-button"]')

    // Aller aux détails et cliquer sur Edit
    await page.click('text=EDIT-001')
    await page.click('[data-testid="edit-part-button"]')
    await expect(page).toHaveURL(/\/parts\/.*\/edit/)

    // Modifier les données
    await page.fill('[data-testid="part-description"]', 'Pièce éditée - test E2E')
    await page.selectOption('[data-testid="part-category"]', 'brakes')
    await page.fill('[data-testid="part-cost"]', '30000')

    // Sauvegarder
    await page.click('[data-testid="save-changes-button"]')

    // Vérifier la redirection et la mise à jour
    await expect(page).toHaveURL(/\/parts\/.*/)
    await expect(page.locator('text=Pièce mise à jour avec succès')).toBeVisible()

    // Vérifier les modifications dans les détails
    await expect(page.locator('text=Pièce éditée - test E2E')).toBeVisible()
    await expect(page.locator('text=Ar 30,000')).toBeVisible()
  })

  test('Devrait gérer le stock avec ajustements', async () => {
    // Créer une pièce avec stock
    await page.click('[data-testid="add-part-button"]')
    await page.fill('[data-testid="part-number"]', 'STOCK-001')
    await page.fill('[data-testid="part-description"]', 'Pièce pour test stock')
    await page.fill('[data-testid="part-quantity"]', '5')
    await page.fill('[data-testid="part-minimum-stock"]', '10') // Stock minimum supérieur au stock actuel
    await page.click('[data-testid="save-part-button"]')

    // Aller aux détails
    await page.click('text=STOCK-001')

    // Vérifier l'état du stock faible
    await expect(page.locator('text=Stock faible')).toBeVisible()

    // Ajuster le stock
    await page.click('[data-testid="adjust-stock-button"]')
    await page.selectOption('[data-testid="adjustment-type"]', 'add')
    await page.fill('[data-testid="adjustment-quantity"]', '10')
    await page.fill('[data-testid="adjustment-reason"]', 'Réapprovisionnement test E2E')
    await page.click('[data-testid="confirm-adjustment-button"]')

    // Vérifier la mise à jour du stock
    await expect(page.locator('text=15')).toBeVisible() // 5 + 10
    await expect(page.locator('text=En stock')).toBeVisible()
  })

  test('Devrait filtrer les pièces par catégorie', async () => {
    // Créer plusieurs pièces avec différentes catégories
    const pieces = [
      { number: 'FILTER-001', category: 'filters', description: 'Filtre à huile' },
      { number: 'BRAKE-001', category: 'brakes', description: 'Plaquettes de frein' },
      { number: 'ENGINE-001', category: 'engine', description: 'Joint de culasse' }
    ]

    for (const piece of pieces) {
      await page.click('[data-testid="add-part-button"]')
      await page.fill('[data-testid="part-number"]', piece.number)
      await page.fill('[data-testid="part-description"]', piece.description)
      await page.selectOption('[data-testid="part-category"]', piece.category)
      await page.click('[data-testid="save-part-button"]')
      await page.goto('/parts')
    }

    // Tester le filtre par catégorie
    await page.click('[data-testid="category-filter"]')
    await page.selectOption('[data-testid="category-filter"]', 'filters')

    // Vérifier que seul le filtre apparaît
    await expect(page.locator('text=FILTER-001')).toBeVisible()
    await expect(page.locator('text=BRAKE-001')).not.toBeVisible()
    await expect(page.locator('text=ENGINE-001')).not.toBeVisible()
  })

  test('Devrait rechercher des pièces', async () => {
    // Créer des pièces
    const pieces = [
      { number: 'SEARCH-001', description: 'Pièce moteur' },
      { number: 'SEARCH-002', description: 'Pièce freins' }
    ]

    for (const piece of pieces) {
      await page.click('[data-testid="add-part-button"]')
      await page.fill('[data-testid="part-number"]', piece.number)
      await page.fill('[data-testid="part-description"]', piece.description)
      await page.click('[data-testid="save-part-button"]')
      await page.goto('/parts')
    }

    // Tester la recherche
    await page.fill('[data-testid="search-input"]', 'moteur')
    await page.press('[data-testid="search-input"]', 'Enter')

    // Vérifier les résultats de recherche
    await expect(page.locator('text=SEARCH-001')).toBeVisible()
    await expect(page.locator('text=Pièce moteur')).toBeVisible()
    await expect(page.locator('text=SEARCH-002')).not.toBeVisible()
  })

  test('Devrait afficher les onglets All et Low Stock', async () => {
    // Créer une pièce avec stock faible
    await page.click('[data-testid="add-part-button"]')
    await page.fill('[data-testid="part-number"]', 'LOW-STOCK-001')
    await page.fill('[data-testid="part-description"]', 'Pièce stock faible')
    await page.fill('[data-testid="part-quantity"]', '2')
    await page.fill('[data-testid="part-minimum-stock"]', '10')
    await page.click('[data-testid="save-part-button"]')

    // Vérifier l'onglet All
    await page.click('[data-testid="tab-all"]')
    await expect(page.locator('text=LOW-STOCK-001')).toBeVisible()

    // Vérifier l'onglet Low Stock
    await page.click('[data-testid="tab-low-stock"]')
    await expect(page.locator('text=LOW-STOCK-001')).toBeVisible()

    // Compter les éléments dans l'onglet
    const lowStockCount = await page.locator('[data-testid="tab-low-stock"] .text-xs').textContent()
    expect(lowStockCount).toContain('1')
  })

  test('Devrait gérer la pagination', async () => {
    // Créer plusieurs pièces pour tester la pagination
    for (let i = 1; i <= 15; i++) {
      await page.click('[data-testid="add-part-button"]')
      await page.fill('[data-testid="part-number"]', `PAG-${i.toString().padStart(3, '0')}`)
      await page.fill('[data-testid="part-description"]', `Pièce ${i} pour pagination`)
      await page.click('[data-testid="save-part-button"]')
      await page.goto('/parts')
    }

    // Vérifier la première page
    await expect(page.locator('text=PAG-001')).toBeVisible()
    await expect(page.locator('text=PAG-010')).toBeVisible()
    await expect(page.locator('text=PAG-011')).not.toBeVisible()

    // Tester la pagination
    await page.click('[data-testid="next-page"]')
    await expect(page.locator('text=PAG-011')).toBeVisible()
    await expect(page.locator('text=PAG-001')).not.toBeVisible()

    // Retour à la page précédente
    await page.click('[data-testid="prev-page"]')
    await expect(page.locator('text=PAG-001')).toBeVisible()
  })

  test('Devrait afficher les statistiques en bas de page', async () => {
    // Créer des pièces avec coûts
    const pieces = [
      { number: 'STAT-001', cost: '10000' },
      { number: 'STAT-002', cost: '20000' }
    ]

    for (const piece of pieces) {
      await page.click('[data-testid="add-part-button"]')
      await page.fill('[data-testid="part-number"]', piece.number)
      await page.fill('[data-testid="part-description"]', `Pièce ${piece.number}`)
      await page.fill('[data-testid="part-cost"]', piece.cost)
      await page.click('[data-testid="save-part-button"]')
      await page.goto('/parts')
    }

    // Vérifier les statistiques
    await expect(page.locator('text=Valeur totale:')).toBeVisible()
    await expect(page.locator('text=Ar 30,000')).toBeVisible()
    await expect(page.locator('text=Stock faible:')).toBeVisible()

    // Tester le bouton d'actualisation
    await page.click('[data-testid="refresh-button"]')
    await expect(page.locator('text=Chargement des pièces')).toBeVisible()
  })

  test('Devrait gérer les erreurs de validation', async () => {
    // Essayer de créer une pièce sans numéro
    await page.click('[data-testid="add-part-button"]')
    await page.fill('[data-testid="part-description"]', 'Pièce sans numéro')
    await page.click('[data-testid="save-part-button"]')

    // Vérifier le message d'erreur
    await expect(page.locator('text=Le numéro et la description de la pièce sont requis')).toBeVisible()

    // Essayer avec un numéro mais sans description
    await page.fill('[data-testid="part-number"]', 'ERROR-001')
    await page.fill('[data-testid="part-description"]', '')
    await page.click('[data-testid="save-part-button"]')

    await expect(page.locator('text=Le numéro et la description de la pièce sont requis')).toBeVisible()
  })

  test('Devrait naviguer correctement avec les boutons retour', async () => {
    // Test navigation : Liste -> Création -> Liste
    await page.click('[data-testid="add-part-button"]')
    await expect(page).toHaveURL('/parts/create')

    await page.click('[data-testid="back-button"]')
    await expect(page).toHaveURL('/parts')

    // Test navigation : Liste -> Détails -> Édition -> Détails -> Liste
    await page.click('[data-testid="add-part-button"]')
    await page.fill('[data-testid="part-number"]', 'NAV-001')
    await page.fill('[data-testid="part-description"]', 'Pièce navigation')
    await page.click('[data-testid="save-part-button"]')

    await page.click('text=NAV-001')
    await expect(page).toHaveURL(/\/parts\/.*/)

    await page.click('[data-testid="edit-part-button"]')
    await expect(page).toHaveURL(/\/parts\/.*\/edit/)

    await page.click('[data-testid="back-button"]')
    await expect(page).toHaveURL(/\/parts\/.*/)

    await page.click('[data-testid="back-button"]')
    await expect(page).toHaveURL('/parts')
  })
})

// Tests pour la gestion des catégories (à implémenter plus tard)
test.describe('Module Parts - Gestion des catégories', () => {
  test('Devrait créer et utiliser des catégories personnalisées', async ({ page }) => {
    // Ce test sera implémenté lorsque la gestion des catégories sera disponible
    test.skip()
  })
})

// Tests pour l'intégration avec les fournisseurs (à implémenter plus tard)
test.describe('Module Parts - Intégration fournisseurs', () => {
  test('Devrait associer des pièces aux fournisseurs', async ({ page }) => {
    // Ce test sera implémenté lorsque l'intégration fournisseurs sera disponible
    test.skip()
  })
})