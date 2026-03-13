import { mkdirSync } from 'fs';
import { expect, Page, test } from '@playwright/test';

async function registerAndCompleteOnboarding(page: Page) {
  const ts = Date.now();
  const firstName = 'E2E';
  const lastName = `Reminders${ts}`;
  const email = `e2e.reminders.bootstrap.${ts}@example.com`;
  const password = 'Fleetmada!123';

  await page.goto('/register');
  await page.locator('input[name="firstName"]').fill(firstName);
  await page.locator('input[name="lastName"]').fill(lastName);
  await page.locator('input[name="companyName"]').fill(`FleetMada Reminders ${ts}`);
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

test.describe('E2E-05 Service reminders', () => {
  test('creer puis modifier un rappel de service', async ({ page }) => {
    const ts = Date.now();
    const vehicleName = `E2E Reminder Vehicle ${ts}`;
    const vin = `E2EREM${ts}`.slice(0, 17).padEnd(17, '0');
    const taskNameRegex = /Remplacement huile moteur et filtre/i;
    const updatedInterval = '6';

    await registerAndCompleteOnboarding(page);
    const token = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(token).toBeTruthy();

    const vehicleCreateResponse = await page.request.post('/api/vehicles', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        name: vehicleName,
        vin,
        type: 'Car',
        year: new Date().getFullYear(),
        make: 'Toyota',
        model: 'Yaris',
      },
    });
    expect(vehicleCreateResponse.ok()).toBeTruthy();

    await page.goto('/reminders/service/create');
    await expect(
      page.getByRole('heading', { name: /Nouveau rappel de service/i }),
    ).toBeVisible();

    const vehicleSelectTrigger = page
      .locator('label:has-text("Véhicule")')
      .locator('..')
      .locator('div.cursor-pointer')
      .first();
    await vehicleSelectTrigger.click();
    await page.getByPlaceholder('Rechercher par nom ou VIN...').fill(vehicleName);
    await expect(page.getByText(vehicleName, { exact: false }).first()).toBeVisible();
    await page.getByText(vehicleName, { exact: false }).first().click();

    const serviceTaskSelectTrigger = page
      .locator('label:has-text("Tâche de service")')
      .locator('..')
      .locator('div.cursor-pointer')
      .first();
    await serviceTaskSelectTrigger.click();
    await page.getByPlaceholder('Rechercher une tâche...').fill('huile');
    await expect(page.getByText(taskNameRegex).first()).toBeVisible();
    await page.getByText(taskNameRegex).first().click();

    await page.getByTestId('time-interval-input').fill('3');
    await page.getByTestId('time-interval-unit').selectOption('month(s)');

    const createResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/service/reminders') &&
        response.request().method() === 'POST',
    );
    await page.getByTestId('save-reminder').click();
    const createResponse = await createResponsePromise;
    const createBody = await createResponse.json();
    const reminderId =
      createBody?.data?.id || createBody?.id || createBody?.reminder?.id;
    expect(reminderId).toBeTruthy();

    await expect(page).toHaveURL(/\/reminders\/service$/, { timeout: 20000 });
    await expect(page.getByTestId('page-title')).toContainText('Rappels de service');
    const row = page.locator('[data-testid="reminder-row"]').filter({
      hasText: vehicleName,
    });
    await expect(row.first()).toBeVisible();
    await row.first().click();

    await expect(page).toHaveURL(new RegExp(`/reminders/service/${reminderId}$`));
    await expect(page.getByText(taskNameRegex).first()).toBeVisible();

    await page.getByRole('button', { name: /Modifier/i }).click();
    await expect(page).toHaveURL(
      new RegExp(`/reminders/service/${reminderId}/edit$`),
    );
    await page.getByTestId('time-interval-input').fill(updatedInterval);

    const updateResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes(`/api/service/reminders/${reminderId}`) &&
        response.request().method() === 'PUT',
    );
    await page.getByTestId('save-reminder').click();
    const updateResponse = await updateResponsePromise;
    expect(updateResponse.ok()).toBeTruthy();

    await expect(page).toHaveURL(
      new RegExp(`/reminders/service/${reminderId}$`),
      { timeout: 20000 },
    );
    await expect(
      page.getByText(new RegExp(`Tous les ${updatedInterval} mois`)).first(),
    ).toBeVisible();

    mkdirSync('output/playwright', { recursive: true });
    await page.screenshot({
      path: 'output/playwright/e2e-05-reminders-detail.png',
      fullPage: true,
    });
  });
});
