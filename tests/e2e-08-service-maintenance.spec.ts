import { mkdirSync } from 'fs';
import { expect, Page, test } from '@playwright/test';

async function registerAndCompleteOnboarding(page: Page) {
  const ts = Date.now();
  const firstName = 'E2E';
  const lastName = `Service${ts}`;
  const email = `e2e.service.bootstrap.${ts}@example.com`;
  const password = 'Fleetmada!123';

  await page.goto('/register');
  await page.locator('input[name="firstName"]').fill(firstName);
  await page.locator('input[name="lastName"]').fill(lastName);
  await page.locator('input[name="companyName"]').fill(`FleetMada Service ${ts}`);
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

test.describe('E2E-08 Service Maintenance', () => {
  test('creer tache/programme/ordre puis terminer ordre', async ({ page }) => {
    const ts = Date.now();
    const vehicleName = `E2E Service Vehicle ${ts}`;
    const taskName = `E2E Service Task ${ts}`;
    const programName = `E2E Service Program ${ts}`;
    const vin = `E2ESRV${ts}`.slice(0, 17).padEnd(17, '0');

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
        model: 'Corolla',
      },
    });
    expect(vehicleCreateResponse.ok()).toBeTruthy();

    await page.goto('/service/tasks/create');
    await expect(
      page.getByRole('heading', { name: /Nouvelle T.che de Service/i }),
    ).toBeVisible();
    await page.getByTestId('task-name').fill(taskName);

    const taskCreateResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/service/tasks') &&
        response.request().method() === 'POST',
    );
    await page.getByTestId('save-button').click();
    const taskCreateResponse = await taskCreateResponsePromise;
    expect(taskCreateResponse.ok()).toBeTruthy();

    await expect(page).toHaveURL(/\/service\/tasks$/, { timeout: 20000 });
    await page.getByTestId('search-input').fill(taskName);
    await expect(page.getByText(taskName).first()).toBeVisible();

    await page.goto('/service/programs/create');
    await expect(
      page.getByRole('heading', { name: /Nouveau programme d'entretien/i }),
    ).toBeVisible();
    await page.getByTestId('program-name').fill(programName);
    await page.getByTestId('program-template').selectOption('basic');

    const programCreateResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/service/programs') &&
        response.request().method() === 'POST',
    );
    await page.getByTestId('save-button').first().click();
    const programCreateResponse = await programCreateResponsePromise;
    expect(programCreateResponse.ok()).toBeTruthy();

    await expect(page).toHaveURL(/\/service\/programs$/, { timeout: 20000 });
    await expect(page.getByText(programName).first()).toBeVisible();

    await page.goto('/service/work-orders/create');
    await expect(
      page.getByRole('heading', { name: /Nouvel ordre de travail/i }),
    ).toBeVisible();

    const vehicleSelectTrigger = page
      .locator('label:has-text("Véhicule")')
      .first()
      .locator('xpath=following::div[contains(@class,"cursor-pointer")][1]');
    await vehicleSelectTrigger.click();
    await page.getByPlaceholder('Rechercher par nom ou VIN...').fill(vehicleName);
    await page.getByText(vehicleName, { exact: false }).first().click();

    await page.getByText("Rechercher des tâches d'entretien...").first().click();
    await page.getByPlaceholder('Rechercher une tâche...').fill(taskName);
    await page.getByText(taskName, { exact: false }).first().click();
    await expect(page.getByText(taskName).first()).toBeVisible();

    const workOrderCreateResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/service/entries') &&
        response.request().method() === 'POST',
    );
    await page.getByRole('button', { name: /Enregistrer l'ordre/i }).click();
    const workOrderCreateResponse = await workOrderCreateResponsePromise;
    expect(workOrderCreateResponse.ok()).toBeTruthy();
    const workOrderCreateBody = await workOrderCreateResponse.json();
    const workOrderId = workOrderCreateBody?.data?.id as string;
    expect(workOrderId).toBeTruthy();

    await expect(page).toHaveURL(/\/service\/work-orders$/, { timeout: 20000 });
    await expect(
      page.getByRole('heading', { name: /Ordres de travail/i }),
    ).toBeVisible();

    await page.goto(`/service/work-orders/${workOrderId}`);
    await expect(
      page.getByRole('heading', { name: /Ordre de Travail/i }),
    ).toBeVisible();
    await expect(page.getByText(vehicleName).first()).toBeVisible();

    const completeResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes(`/api/service/entries/${workOrderId}`) &&
        response.request().method() === 'PUT',
    );
    await page.getByRole('button', { name: /^Terminer$/ }).click();
    const completeResponse = await completeResponsePromise;
    expect(completeResponse.ok()).toBeTruthy();
    await expect(page.getByRole('button', { name: /^Terminer$/ })).toHaveCount(0);
    await expect(
      page.getByText(/Termin./i).first(),
    ).toBeVisible();

    mkdirSync('output/playwright', { recursive: true });
    await page.screenshot({
      path: 'output/playwright/e2e-08-service-work-order-detail.png',
      fullPage: true,
    });
  });
});
