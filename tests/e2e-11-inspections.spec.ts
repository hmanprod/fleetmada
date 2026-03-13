import { mkdirSync } from 'fs';
import { expect, Page, test } from '@playwright/test';

async function registerAndCompleteOnboarding(page: Page) {
  const ts = Date.now();
  const firstName = 'E2E';
  const lastName = `Inspect${ts}`;
  const email = `e2e.inspect.bootstrap.${ts}@example.com`;
  const password = 'Fleetmada!123';

  await page.goto('/register');
  await page.locator('input[name="firstName"]').fill(firstName);
  await page.locator('input[name="lastName"]').fill(lastName);
  await page.locator('input[name="companyName"]').fill(`FleetMada Inspect ${ts}`);
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

test.describe('E2E-11 Inspections', () => {
  test('creer formulaire, planifier, lancer et retrouver inspection completee', async ({
    page,
  }) => {
    const ts = Date.now();
    const templateName = `E2E Inspection Template ${ts}`;
    const templateDescription = `Template inspection E2E ${ts}`;
    const itemName = `E2E Item ${ts}`;
    const vehicleName = `E2E Inspection Vehicle ${ts}`;
    const vin = `E2EINSP${ts}`.slice(0, 17).padEnd(17, '0');

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
    const vehicleCreateBody = await vehicleCreateResponse.json();
    const vehicleId = vehicleCreateBody?.data?.id || vehicleCreateBody?.id;
    expect(vehicleId).toBeTruthy();

    await page.goto('/inspections/forms/create');
    await expect(
      page.getByRole('heading', { name: /Nouveau formulaire d[’']inspection/i }),
    ).toBeVisible();
    await page.locator('input[type="text"]').first().fill(templateName);
    await page.locator('textarea').first().fill(templateDescription);

    const templateCreateResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/inspection-templates') &&
        response.request().method() === 'POST',
    );
    await page
      .getByRole('button', { name: /Enregistrer le formulaire/i })
      .first()
      .click();
    const templateCreateResponse = await templateCreateResponsePromise;
    expect(templateCreateResponse.ok()).toBeTruthy();
    const templateCreateBody = await templateCreateResponse.json();
    const templateId = templateCreateBody?.data?.id || templateCreateBody?.id;
    expect(templateId).toBeTruthy();

    await expect(
      page,
    ).toHaveURL(new RegExp(`/inspections/forms/${templateId}/edit(\\?|$)`), {
      timeout: 20000,
    });

    const templateUpdateResponse = await page.request.put(
      `/api/inspection-templates/${templateId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          name: templateName,
          description: templateDescription,
          category: 'General',
          items: [
            {
              name: itemName,
              description: 'Item pass/fail E2E',
              category: 'General',
              isRequired: true,
              sortOrder: 0,
              type: 'PASS_FAIL',
              options: [],
              passLabel: 'Pass',
              failLabel: 'Fail',
              enableNA: true,
            },
          ],
        },
      },
    );
    expect(templateUpdateResponse.ok()).toBeTruthy();

    const scheduleCreateResponse = await page.request.post(
      `/api/inspection-templates/${templateId}/schedules`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          ruleType: 'SPECIFIC_VEHICLE',
          ruleValue: vehicleId,
          scheduleEnabled: true,
          frequencyType: 'DAILY',
          frequencyInterval: 1,
        },
      },
    );
    expect(scheduleCreateResponse.ok()).toBeTruthy();

    await page.goto('/inspections/schedules');
    await expect(
      page.getByRole('heading', { name: /Calendrier des Inspections/i }),
    ).toBeVisible();
    await page
      .getByPlaceholder('Rechercher par véhicule ou type d\'inspection...')
      .fill(templateName);

    const scheduleRow = page
      .locator('div.bg-white.border.rounded-lg')
      .filter({ hasText: templateName })
      .filter({ hasText: vehicleName })
      .first();
    await expect(scheduleRow).toBeVisible({ timeout: 30000 });
    await scheduleRow.getByRole('button', { name: /Lancer/i }).click();

    await expect(page).toHaveURL(
      new RegExp(`/inspections/forms/${templateId}/start$`),
      { timeout: 20000 },
    );
    await expect(
      page.getByRole('heading', { name: /S.lectionnez un v.hicule . inspecter/i }),
    ).toBeVisible();

    await page
      .getByPlaceholder('Rechercher (Nom, Marque, VIN)...')
      .fill(vehicleName);
    await page.getByRole('button', { name: new RegExp(vehicleName) }).first().click();

    const checklistItem = page.locator('div').filter({ hasText: itemName }).first();
    await expect(checklistItem).toBeVisible();
    await checklistItem.getByRole('button', { name: /^Pass$/ }).click();

    const inspectionCreateResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/inspections') &&
        response.request().method() === 'POST',
    );
    const inspectionResultsResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/inspections/') &&
        response.url().includes('/results') &&
        response.request().method() === 'POST',
    );
    await page.getByRole('button', { name: /Soumettre le rapport/i }).click();

    const inspectionCreateResponse = await inspectionCreateResponsePromise;
    expect(inspectionCreateResponse.ok()).toBeTruthy();
    const inspectionResultsResponse = await inspectionResultsResponsePromise;
    expect(inspectionResultsResponse.ok()).toBeTruthy();

    await expect(page).toHaveURL(/\/inspections\/history\/[^/]+$/, {
      timeout: 40000,
    });

    const inspectionDetailUrl = page.url();
    const inspectionIdMatch = inspectionDetailUrl.match(/\/inspections\/history\/([^/?#]+)/);
    const inspectionId = inspectionIdMatch?.[1];
    expect(inspectionId).toBeTruthy();

    await page.goto('/inspections/history');
    await expect(
      page.getByRole('heading', { name: /Historique des Inspections/i }),
    ).toBeVisible();
    await page.getByTestId('inspection-search-input').fill(templateName);

    const historyRow = page
      .getByTestId('inspection-row')
      .filter({ hasText: templateName })
      .first();
    await expect(historyRow).toBeVisible({ timeout: 30000 });
    await historyRow.getByRole('button', { name: new RegExp(templateName) }).first().click();

    await expect(page).toHaveURL(new RegExp(`/inspections/history/${inspectionId}$`), {
      timeout: 20000,
    });
    await expect(
      page.getByRole('heading', { name: new RegExp(templateName) }).first(),
    ).toBeVisible({ timeout: 30000 });

    mkdirSync('output/playwright', { recursive: true });
    await page.screenshot({
      path: 'output/playwright/e2e-11-inspections-detail.png',
      fullPage: true,
    });
  });
});
