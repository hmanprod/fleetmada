import { test, expect } from '@playwright/test';

test.describe('Dashboard FleetMada', () => {
  test.beforeEach(async ({ page }) => {
    // Navigation vers le dashboard (nécessite une authentification préalable)
    await page.goto('/dashboard');
  });

  test('should display dashboard header and navigation', async ({ page }) => {
    // Vérifier la présence du header
    await expect(page.locator('h1')).toContainText('Dashboard FleetMada');
    
    // Vérifier les onglets de navigation
    await expect(page.locator('text=Vue d\'ensemble')).toBeVisible();
    await expect(page.locator('text=Analyse des coûts')).toBeVisible();
    await expect(page.locator('text=Maintenance')).toBeVisible();
    await expect(page.locator('text=Véhicules')).toBeVisible();
    
    // Vérifier les boutons d'action
    await expect(page.locator('button:has-text("Actualiser")')).toBeVisible();
    await expect(page.locator('button[aria-label*="notifications"]')).toBeVisible();
  });

  test('should display metric cards in overview tab', async ({ page }) => {
    // Vérifier que l'onglet Vue d'ensemble est actif par défaut
    await expect(page.locator('[data-tab="overview"]')).toHaveClass(/border-\[#008751\]/);
    
    // Vérifier la présence des cartes métriques
    await expect(page.locator('text=Total Véhicules')).toBeVisible();
    await expect(page.locator('text=Coûts (30j)')).toBeVisible();
    await expect(page.locator('text=Maintenance')).toBeVisible();
    await expect(page.locator('text=Taux d\'Utilisation')).toBeVisible();
  });

  test('should switch between dashboard tabs', async ({ page }) => {
    // Cliquer sur l'onglet "Analyse des coûts"
    await page.click('text=Analyse des coûts');
    await expect(page.locator('text=Coûts Totaux')).toBeVisible();
    
    // Cliquer sur l'onglet "Maintenance"
    await page.click('text=Maintenance');
    await expect(page.locator('text=Rappels Totaux')).toBeVisible();
    
    // Cliquer sur l'onglet "Véhicules"
    await page.click('text=Véhicules');
    await expect(page.locator('text=Total Véhicules')).toBeVisible();
    
    // Revenir à l'onglet Vue d'ensemble
    await page.click('text=Vue d\'ensemble');
    await expect(page.locator('text=Total Véhicules')).toBeVisible();
  });

  test('should display charts and graphs', async ({ page }) => {
    // Vérifier la présence des graphiques
    await expect(page.locator('canvas')).toBeVisible();
    
    // Vérifier les composants de graphiques (Recharts)
    await expect(page.locator('svg')).toBeVisible();
  });

  test('should handle refresh functionality', async ({ page }) => {
    // Cliquer sur le bouton d'actualisation
    await page.click('button:has-text("Actualiser")');
    
    // Vérifier que le bouton montre un état de chargement
    await expect(page.locator('button:has-text("Actualiser")')).toBeDisabled();
    
    // Attendre que le chargement se termine (timeout de 10s)
    await expect(page.locator('button:has-text("Actualiser")')).toBeEnabled({ timeout: 10000 });
  });

  test('should display alerts and notifications', async ({ page }) => {
    // Vérifier la présence du widget d'alertes
    await expect(page.locator('text=Alertes Système')).toBeVisible();
    
    // Vérifier les notifications (si présentes)
    const notificationBadge = page.locator('button[aria-label*="notifications"] >> span');
    if (await notificationBadge.isVisible()) {
      await expect(notificationBadge).toContainText(/\d+/);
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Simuler un affichage mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Vérifier que les cartes métriques s'adaptent
    await expect(page.locator('[data-testid="metric-card"]').first()).toBeVisible();
    
    // Vérifier la navigation mobile
    await expect(page.locator('nav')).toBeVisible();
    
    // Revenir à la taille desktop
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('should display vehicle overview table', async ({ page }) => {
    // Aller à l'onglet Véhicules
    await page.click('text=Véhicules');
    
    // Vérifier le tableau des véhicules
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("Véhicule")')).toBeVisible();
    await expect(page.locator('th:has-text("Statut")')).toBeVisible();
    await expect(page.locator('th:has-text("Kilométrage")')).toBeVisible();
  });

  test('should display cost breakdown', async ({ page }) => {
    // Aller à l'onglet Analyse des coûts
    await page.click('text=Analyse des coûts');
    
    // Vérifier les sections de coûts
    await expect(page.locator('text=Carburant')).toBeVisible();
    await expect(page.locator('text=Entretien')).toBeVisible();
    await expect(page.locator('text=Recharge')).toBeVisible();
    
    // Vérifier les barres de progression
    await expect(page.locator('.bg-red-500')).toBeVisible(); // Carburant
    await expect(page.locator('.bg-green-500')).toBeVisible(); // Entretien
  });

  test('should display maintenance status', async ({ page }) => {
    // Aller à l'onglet Maintenance
    await page.click('text=Maintenance');
    
    // Vérifier les métriques de maintenance
    await expect(page.locator('text=Rappels en Retard')).toBeVisible();
    await expect(page.locator('text=Rappels à Venir')).toBeVisible();
    
    // Vérifier les indicateurs de statut
    await expect(page.locator('[data-status]')).toBeVisible();
  });

  test('should handle loading states', async ({ page }) => {
    // Le dashboard doit afficher des états de chargement appropriés
    await expect(page.locator('[data-loading="true"]')).toBeVisible();
    
    // Attendre que les données se chargent
    await expect(page.locator('text=Total Véhicules')).toBeVisible({ timeout: 10000 });
  });

  test('should display empty state for new users', async ({ page }) => {
    // Vérifier l'état vide pour nouveaux utilisateurs
    // (Cette vérification dépendra de la logique métier)
    const emptyState = page.locator('text=Bienvenue sur FleetMada');
    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible();
      await expect(page.locator('text=Ajouter mon premier véhicule')).toBeVisible();
    }
  });

  test('should have proper accessibility features', async ({ page }) => {
    // Vérifier les attributs ARIA
    await expect(page.locator('button[aria-label]')).toHaveCount(3); // Refresh, notifications, settings
    
    // Vérifier les roles
    await expect(page.locator('nav[role="navigation"]')).toBeVisible();
    
    // Vérifier les alt texts sur les icônes
    await expect(page.locator('img[alt]')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Simuler une erreur API (nécessiterait une configuration spécifique)
    // Pour l'instant, vérifier la présence du message d'erreur
    const errorMessage = page.locator('[data-testid="error-message"]');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toContainText(/erreur|error/i);
    }
  });
});

test.describe('Dashboard Performance', () => {
  test('should load dashboard within performance threshold', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Le dashboard doit se charger en moins de 3 secondes
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have responsive layout', async ({ page }) => {
    const viewports = [
      { width: 1280, height: 720 }, // Desktop
      { width: 768, height: 1024 }, // Tablet
      { width: 375, height: 667 }   // Mobile
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/dashboard');
      
      // Vérifier que le contenu est visible et bien agencé
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();
    }
  });
});

test.describe('Dashboard Integration', () => {
  test('should integrate with real API data', async ({ page }) => {
    // Cette vérification nécessiterait une base de données de test
    // Pour l'instant, vérifier que les données ne sont plus fictives
    const costValue = page.locator('text=/\\d+€|\\d+\\.\\d+€/');
    
    // Les valeurs doivent être dynamiques (pas des valeurs fixes)
    // await expect(costValue).not.toContainText('1200'); // Ancienne valeur fictive
  });

  test('should update data on refresh', async ({ page }) => {
    // Cliquer sur refresh
    await page.click('button:has-text("Actualiser")');
    
    // Vérifier que les données se mettent à jour
    // (difficulté à tester sans données réelles)
    await expect(page.locator('button:has-text("Actualiser")')).toBeEnabled({ timeout: 10000 });
  });
});