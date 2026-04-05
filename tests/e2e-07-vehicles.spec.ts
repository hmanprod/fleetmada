import { mkdirSync } from 'fs';
import { expect, Page, test } from '@playwright/test';

async function registerAndCompleteOnboarding(page: Page) {
  const ts = Date.now();
  const firstName = 'E2E';
  const lastName = `Vehicles${ts}`;
  const email = `e2e.vehicles.bootstrap.${ts}@example.com`;
  const password = 'Fleetmada!123';

  await page.goto('/register');
  await page.locator('input[name="firstName"]').fill(firstName);
  await page.locator('input[name="lastName"]').fill(lastName);
  await page.locator('input[name="companyName"]').fill(`FleetMada Vehicles ${ts}`);
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

test.describe('E2E-07 Vehicles', () => {
  test('creer, modifier, affecter et ajouter une lecture compteur', async ({ page }) => {
    test.setTimeout(120000);
    const ts = Date.now();
    const vehicleName = `E2E Vehicle ${ts}`;
    const updatedVehicleName = `${vehicleName} Updated`;
    const vin = `E2EVEH${ts}`.slice(0, 17).padEnd(17, '0');
    const contactFirstName = `Op${ts}`;
    const contactLastName = 'Driver';
    const contactEmail = `op.${ts}@example.com`;
    const operatorFullName = `${contactFirstName} ${contactLastName}`;

    await registerAndCompleteOnboarding(page);
    const token = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(token).toBeTruthy();

    const contactCreateResponse = await page.request.post('/api/contacts', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        firstName: contactFirstName,
        lastName: contactLastName,
        email: contactEmail,
        phone: '+261340000002',
      },
    });
    expect(contactCreateResponse.ok()).toBeTruthy();

    await page.goto('/vehicles/list/create');
    await expect(
      page.getByRole('heading', { name: /Nouveau véhicule/i }),
    ).toBeVisible();

    await page
      .locator('label:has-text("Nom du véhicule")')
      .first()
      .locator('xpath=following::input[1]')
      .fill(vehicleName);
    await page
      .locator('label:has-text("VIN/SN")')
      .first()
      .locator('xpath=following::input[1]')
      .fill(vin);
    await page
      .locator('label:has-text("Année")')
      .first()
      .locator('xpath=following::input[1]')
      .fill(String(new Date().getFullYear()));
    await page
      .locator('label:has-text("Marque")')
      .first()
      .locator('xpath=following::input[1]')
      .fill('Toyota');
    await page
      .locator('label:has-text("Modèle")')
      .first()
      .locator('xpath=following::input[1]')
      .fill('Hilux');

    const createResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/vehicles') &&
        response.request().method() === 'POST',
    );
    await page.getByRole('button', { name: /^Enregistrer$/ }).click();
    const createResponse = await createResponsePromise;
    expect(createResponse.ok()).toBeTruthy();
    const createBody = await createResponse.json();
    const vehicleId = createBody?.data?.id || createBody?.id;
    expect(vehicleId).toBeTruthy();

    await expect(page).toHaveURL(new RegExp(`/vehicles/list/${vehicleId}$`), {
      timeout: 20000,
    });
    await expect(page.getByRole('heading', { name: new RegExp(vehicleName) })).toBeVisible();

    await page.getByRole('button', { name: /Modifier le véhicule/i }).click();
    await expect(page).toHaveURL(new RegExp(`/vehicles/list/${vehicleId}/edit$`));
    await page
      .locator('label:has-text("Nom du véhicule")')
      .first()
      .locator('xpath=following::input[1]')
      .fill(updatedVehicleName);

    const updateResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes(`/api/vehicles/${vehicleId}`) &&
        response.request().method() === 'PUT',
    );
    await page.getByRole('button', { name: /^Enregistrer$/ }).click();
    const updateResponse = await updateResponsePromise;
    expect(updateResponse.ok()).toBeTruthy();

    await expect(page).toHaveURL(new RegExp(`/vehicles/list/${vehicleId}$`), {
      timeout: 20000,
    });
    await expect(
      page.getByRole('heading', { name: new RegExp(updatedVehicleName) }),
    ).toBeVisible();

    await page.goto('/vehicles/assignments');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: /Affectations de véhicules/i }),
    ).toBeVisible({ timeout: 30000 });
    await page.getByRole('button', { name: /Ajouter une affectation/i }).click();
    await expect(
      page.getByRole('heading', { name: /Ajouter une affectation/i }),
    ).toBeVisible();

    await page
      .locator('label:has-text("Véhicule affecté")')
      .first()
      .locator('xpath=following::select[1]')
      .selectOption(vehicleId);
    await page
      .locator('label:has-text("Opérateur")')
      .first()
      .locator('xpath=following::select[1]')
      .selectOption({ label: operatorFullName });

    const assignmentResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes(`/api/vehicles/${vehicleId}/assignments`) &&
        response.request().method() === 'POST',
    );
    await page
      .getByRole('button', { name: /Enregistrer l'affectation/i })
      .click();
    const assignmentResponse = await assignmentResponsePromise;
    expect(assignmentResponse.ok()).toBeTruthy();
    await expect(
      page.getByRole('heading', { name: /Ajouter une affectation/i }),
    ).not.toBeVisible();
    await expect(page.getByText(operatorFullName).first()).toBeVisible();

    await page.goto('/vehicles/meter-history');
    await expect(
      page.getByRole('heading', { name: /Historique des compteurs/i }),
    ).toBeVisible();
    await page.getByRole('button', { name: /Ajouter une lecture/i }).click();
    await expect(
      page.getByText(/Ajouter une lecture de compteur/i),
    ).toBeVisible();

    const vehicleSelectTrigger = page
      .locator('label:has-text("Véhicule")')
      .first()
      .locator('xpath=following::div[contains(@class,"cursor-pointer")][1]');
    await vehicleSelectTrigger.click();
    await page
      .getByPlaceholder('Rechercher par nom ou VIN...')
      .fill(updatedVehicleName);
    await page.getByText(updatedVehicleName, { exact: false }).first().click();

    await page
      .locator('label:has-text("Valeur du compteur")')
      .first()
      .locator('xpath=following::input[1]')
      .fill('12345');

    const meterResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes(`/api/vehicles/${vehicleId}/meter-entries`) &&
        response.request().method() === 'POST',
    );
    await page.getByRole('button', { name: /^Enregistrer$/ }).click();
    const meterResponse = await meterResponsePromise;
    expect(meterResponse.ok()).toBeTruthy();

    await expect(page.getByText(updatedVehicleName).first()).toBeVisible();

    await page.goto(`/vehicles/list/${vehicleId}`);
    await expect(
      page.getByRole('heading', { name: new RegExp(updatedVehicleName) }),
    ).toBeVisible();

    mkdirSync('output/playwright', { recursive: true });
    await page.screenshot({
      path: 'output/playwright/e2e-07-vehicles-detail.png',
      fullPage: true,
    });
  });
});
