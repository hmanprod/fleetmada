import { mkdirSync } from 'fs';
import { expect, Page, test } from '@playwright/test';

async function registerAndCompleteOnboarding(page: Page) {
  const ts = Date.now();
  const firstName = 'E2E';
  const lastName = `Contacts${ts}`;
  const email = `e2e.contacts.bootstrap.${ts}@example.com`;
  const password = 'Fleetmada!123';

  await page.goto('/register');
  await page.locator('input[name="firstName"]').fill(firstName);
  await page.locator('input[name="lastName"]').fill(lastName);
  await page.locator('input[name="companyName"]').fill(`FleetMada Contacts ${ts}`);
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

test.describe('E2E-03 Contacts', () => {
  test('creer, rechercher, consulter et modifier un contact', async ({ page }) => {
    const ts = Date.now();
    const firstName = `QAContact${ts}`;
    const lastName = 'Module3';
    const updatedFirstName = `${firstName}-Edit`;
    const email = `qa.contact.${ts}@example.com`;

    await registerAndCompleteOnboarding(page);

    await page.goto('/contacts/create');
    await expect(
      page.getByRole('heading', { name: /Nouveau contact/i }),
    ).toBeVisible();
    await page.getByTestId('first-name-input').fill(firstName);
    await page.getByTestId('last-name-input').fill(lastName);
    await page.locator('input[type="email"]').first().fill(email);
    await page.locator('label:has-text("Téléphone mobile") + input').fill('+261340000000');
    await page
      .locator('label:has-text("Opérateur") input[type="checkbox"]')
      .check();
    const createResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/contacts') &&
        response.request().method() === 'POST',
    );
    await page.getByTestId('save-contact-button').first().click();
    const createResponse = await createResponsePromise;
    const createBody = await createResponse.json();
    const contactId = createBody?.data?.id as string;
    expect(contactId).toBeTruthy();

    await expect(page).toHaveURL(/\/contacts(\?created=true)?$/);
    await expect(page.getByTestId('contacts-title')).toBeVisible();
    await expect(page.locator('tbody tr').first()).toContainText(firstName);
    await page.goto(`/contacts/${contactId}`);
    await expect(page).toHaveURL(new RegExp(`/contacts/${contactId}$`));
    await expect(page.getByRole('button', { name: /Modifier/i })).toBeVisible();
    await page.getByRole('button', { name: /Modifier/i }).click();

    await expect(page).toHaveURL(new RegExp(`/contacts/${contactId}/edit$`));
    await page.getByTestId('first-name-input').fill(updatedFirstName);
    await page.getByTestId('save-contact-button').first().click();

    await expect(page).toHaveURL(new RegExp(`/contacts/${contactId}\\?updated=true$`));
    await expect(page.getByText(/Contact mis . jour/i).first()).toBeVisible();
    await expect(page.getByText(updatedFirstName).first()).toBeVisible();

    mkdirSync('output/playwright', { recursive: true });
    await page.screenshot({
      path: 'output/playwright/e2e-03-contacts-detail.png',
      fullPage: true,
    });
  });
});
