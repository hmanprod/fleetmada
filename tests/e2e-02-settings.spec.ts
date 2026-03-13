import { mkdirSync } from 'fs';
import { expect, Page, test } from '@playwright/test';

async function registerAndCompleteOnboarding(page: Page) {
  const ts = Date.now();
  const firstName = 'E2E';
  const lastName = `Settings${ts}`;
  const email = `e2e.settings.${ts}@example.com`;
  const password = 'Fleetmada!123';

  await page.goto('/register');
  await page.locator('input[name="firstName"]').fill(firstName);
  await page.locator('input[name="lastName"]').fill(lastName);
  await page.locator('input[name="companyName"]').fill(`FleetMada Settings ${ts}`);
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
}

test.describe('E2E-02 Parametres', () => {
  test('profil, parametres generaux, groupes et validation mot de passe', async ({
    page,
  }) => {
    const groupName = `QA Groupe ${Date.now()}`;

    await registerAndCompleteOnboarding(page);

    await page.goto('/settings/user-profile');
    await expect(
      page.getByRole('heading', { name: /Profil utilisateur/i }),
    ).toBeVisible();
    await page.locator('#firstName').fill('E2E-Settings');
    await page.getByRole('button', { name: /^Enregistrer$/ }).click();
    await expect(page.locator('#firstName')).toHaveValue('E2E-Settings');

    await page.goto('/settings/general');
    await expect(
      page.getByRole('heading', { name: /Param.tres g.n.raux/i }),
    ).toBeVisible();
    await page
      .locator('input[placeholder="Ex: ONNO"]')
      .fill(`ONNO E2E ${Date.now()}`);
    await page.getByRole('button', { name: /^Enregistrer$/ }).first().click();
    await expect(page.getByRole('heading', { name: /Param.tres g.n.raux/i })).toBeVisible();

    await page.goto('/settings/groups');
    await expect(
      page.getByRole('heading', { name: /G.rer les groupes/i }),
    ).toBeVisible();
    await page.getByRole('button', { name: /Nouveau groupe/i }).click();
    await page.getByPlaceholder(/Ex: .*Maintenance/i).fill(groupName);
    await page.getByRole('button', { name: /Cr.er le groupe/i }).click();
    await expect(page.getByText(groupName)).toBeVisible();

    await page.goto('/settings/login-password');
    await expect(
      page.getByRole('heading', { name: /Identifiant .* Mot de passe/i }),
    ).toBeVisible();
    await page
      .getByRole('button', { name: /Changer le mot de passe/i })
      .click();
    await page
      .getByPlaceholder(/Saisissez votre mot de passe actuel/i)
      .fill('WrongPass123!');
    await page.getByPlaceholder(/Au moins 8 caract.res/i).fill('Abcdef12');
    await page
      .getByPlaceholder(/Confirmez votre nouveau mot de passe/i)
      .fill('Abcdef13');
    await page.getByRole('button', { name: /^Enregistrer$/ }).click();
    await expect(page.getByText(/ne correspondent pas/i)).toBeVisible();

    mkdirSync('output/playwright', { recursive: true });
    await page.goto('/settings/groups');
    await expect(page.getByText(groupName)).toBeVisible();
    await page.screenshot({
      path: 'output/playwright/e2e-02-settings-groups.png',
      fullPage: true,
    });
  });
});
