import { mkdirSync } from 'fs';
import { expect, test } from '@playwright/test';

test.describe('E2E-01 Authentification et onboarding', () => {
  test('inscription -> onboarding -> dashboard -> logout -> login', async ({ page }) => {
    const ts = Date.now();
    const firstName = 'E2E';
    const lastName = `Auth${ts}`;
    const email = `e2e.auth.${ts}@example.com`;
    const password = 'Fleetmada!123';

    await page.goto('/register');
    await page.locator('input[name="firstName"]').fill(firstName);
    await page.locator('input[name="lastName"]').fill(lastName);
    await page.locator('input[name="companyName"]').fill(`FleetMada E2E ${ts}`);
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await page.locator('input[name="confirmPassword"]').fill(password);
    await page.locator('#terms').check();
    await page.getByRole('button', { name: /^Commencer$/ }).click();

    await expect(page).toHaveURL(/\/onboarding/);
    await page.getByRole('button', { name: '1-10' }).click();
    await page.locator('select').selectOption('Logistique / Transport');
    await page.getByRole('button', { name: /^Continuer$/ }).click();

    await page.locator('#goal-0').check();
    await page.getByRole('button', { name: /^Continuer$/ }).click();
    await page.getByRole('button', { name: /Aller au tableau de bord/i }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByTestId('dashboard-title')).toBeVisible();

    await page
      .getByRole('button', { name: new RegExp(`${firstName}\\s+${lastName}`) })
      .click();
    await page.getByRole('button', { name: /Se d.connecter/i }).click();

    await expect(page).toHaveURL(/\/login/);
    await page.getByTestId('email-input').fill(email);
    await page.getByTestId('password-input').fill(password);
    await page.getByTestId('login-button').click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByTestId('dashboard-title')).toBeVisible();
    await expect(page.getByText(/Chargement des donn.es/i)).toHaveCount(0, {
      timeout: 20000,
    });

    mkdirSync('output/playwright', { recursive: true });
    await page.screenshot({
      path: 'output/playwright/e2e-01-auth-onboarding-dashboard.png',
      fullPage: true,
    });
  });

  test('route protegee redirige vers login si non authentifie', async ({ page }) => {
    await page.goto('/vehicles/list');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText(/Vous devez .*connect/i)).toBeVisible();
  });
});
