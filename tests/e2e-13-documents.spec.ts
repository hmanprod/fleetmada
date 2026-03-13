import { mkdirSync } from 'fs';
import { expect, Page, test } from '@playwright/test';

async function registerAndCompleteOnboarding(page: Page) {
  const ts = Date.now();
  const firstName = 'E2E';
  const lastName = `Documents${ts}`;
  const email = `e2e.documents.bootstrap.${ts}@example.com`;
  const password = 'Fleetmada!123';

  await page.goto('/register');
  await page.locator('input[name="firstName"]').fill(firstName);
  await page.locator('input[name="lastName"]').fill(lastName);
  await page.locator('input[name="companyName"]').fill(`FleetMada Documents ${ts}`);
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

test.describe('E2E-13 Documents', () => {
  test('uploader, rechercher, modifier et supprimer un document', async ({ page }) => {
    const ts = Date.now();
    const fileName = `e2e-document-${ts}.txt`;
    const initialDescription = `Description initiale document ${ts}`;
    const updatedDescription = `Description modifiee document ${ts}`;
    const label = `doc-${ts}`;

    await registerAndCompleteOnboarding(page);

    await page.goto('/documents/upload');
    await expect(
      page.getByRole('heading', { name: /Upload de Documents/i }),
    ).toBeVisible();

    await page.getByTestId('file-input').setInputFiles({
      name: fileName,
      mimeType: 'text/plain',
      buffer: Buffer.from(`Contenu fichier E2E documents ${ts}`),
    });

    await expect(page.getByText(fileName)).toBeVisible();
    await page.getByTestId('description-textarea').fill(initialDescription);
    await page.getByTestId('label-input').fill(label);
    await page.getByTestId('add-label-button').click();
    await expect(page.getByText(label)).toBeVisible();

    const uploadResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/documents/upload') &&
        response.request().method() === 'POST',
    );
    await page.getByTestId('upload-button').click();
    const uploadResponse = await uploadResponsePromise;
    expect(uploadResponse.ok()).toBeTruthy();
    const uploadBody = await uploadResponse.json();
    const documentId = uploadBody?.data?.successful?.[0]?.document?.id as string;
    expect(documentId).toBeTruthy();

    await expect(page).toHaveURL(/\/documents$/, { timeout: 30000 });
    await expect(page.getByTestId('page-title')).toContainText('Documents');

    await page.getByTestId('search-input').fill(fileName);
    await page.getByRole('button', { name: /Rechercher/i }).click();
    await expect(page.getByText(fileName).first()).toBeVisible({ timeout: 20000 });

    await page.goto(`/documents/${documentId}`);
    await expect(page.getByRole('heading', { name: fileName })).toBeVisible();
    await expect(page.getByText(initialDescription)).toBeVisible();

    await page.getByRole('button', { name: 'Modifier' }).click();
    await page.locator('textarea').first().fill(updatedDescription);
    await page
      .locator('input[placeholder="Ajouter une étiquette..."]')
      .first()
      .fill('edited');
    await page
      .locator('input[placeholder="Ajouter une étiquette..."]')
      .first()
      .press('Enter');

    const updateResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes(`/api/documents/${documentId}`) &&
        response.request().method() === 'PUT',
    );
    await page.getByRole('button', { name: /Sauvegarder/i }).click();
    const updateResponse = await updateResponsePromise;
    expect(updateResponse.ok()).toBeTruthy();

    await expect(page.getByText(updatedDescription)).toBeVisible({ timeout: 20000 });

    mkdirSync('output/playwright', { recursive: true });
    await page.screenshot({
      path: 'output/playwright/e2e-13-documents-detail.png',
      fullPage: true,
    });

    const deleteResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes(`/api/documents/${documentId}`) &&
        response.request().method() === 'DELETE',
    );
    await page.getByRole('button', { name: 'Supprimer' }).first().click();
    await page.getByRole('button', { name: 'Supprimer' }).nth(1).click();
    const deleteResponse = await deleteResponsePromise;
    expect(deleteResponse.ok()).toBeTruthy();

    await expect(page).toHaveURL(/\/documents$/, { timeout: 20000 });
    await page.getByTestId('search-input').fill(fileName);
    await page.getByRole('button', { name: /Rechercher/i }).click();
    await expect(page.getByText(fileName)).toHaveCount(0);
  });
});
