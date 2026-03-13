import { mkdirSync } from 'fs';
import { expect, Page, test } from '@playwright/test';

async function registerAndCompleteOnboarding(page: Page) {
  const ts = Date.now();
  const firstName = 'E2E';
  const lastName = `Reports${ts}`;
  const email = `e2e.reports.bootstrap.${ts}@example.com`;
  const password = 'Fleetmada!123';

  await page.goto('/register');
  await page.locator('input[name="firstName"]').fill(firstName);
  await page.locator('input[name="lastName"]').fill(lastName);
  await page.locator('input[name="companyName"]').fill(`FleetMada Reports ${ts}`);
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

test.describe('E2E-15 Reports & Notifications', () => {
  test('generer rapport, favoriser, verifier favoris et notifications', async ({
    page,
  }) => {
    const ts = Date.now();
    const notificationTitle = `E2E Notification ${ts}`;
    const notificationMessage = `Message notification E2E ${ts}`;

    await registerAndCompleteOnboarding(page);

    const token = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(token).toBeTruthy();

    await page.goto('/reports');
    await expect(page.getByTestId('page-title')).toContainText('Rapports');
    await expect(page.getByTestId('report-card').first()).toBeVisible({
      timeout: 30000,
    });

    page.on('dialog', (dialog) => dialog.accept());

    const generateResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/reports/generate') &&
        response.request().method() === 'POST',
    );
    await page.getByTestId('report-card').first().getByTestId('generate-button').click();
    const generateResponse = await generateResponsePromise;
    expect(generateResponse.ok()).toBeTruthy();
    const generateBody = await generateResponse.json();
    const savedReportId = generateBody?.data?.savedReport?.id as string;
    const savedReportTitle = generateBody?.data?.savedReport?.title as string;
    expect(savedReportId).toBeTruthy();
    expect(savedReportTitle).toBeTruthy();

    await page.getByTestId('search-reports-input').fill(savedReportTitle);
    const savedReportCard = page
      .getByTestId('report-card')
      .filter({ hasText: savedReportTitle })
      .first();
    await expect(savedReportCard).toBeVisible({ timeout: 30000 });

    const favoriteResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes(`/api/reports/${savedReportId}/favorite`) &&
        response.request().method() === 'POST',
    );
    await savedReportCard.getByTestId('favorite-button').click();
    const favoriteResponse = await favoriteResponsePromise;
    expect(favoriteResponse.ok()).toBeTruthy();

    await page.getByTestId('nav-tab-favorites').click();
    await expect(savedReportCard).toBeVisible({ timeout: 30000 });

    const createNotificationResponse = await page.request.post('/api/notifications', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: {
        title: notificationTitle,
        message: notificationMessage,
        type: 'SYSTEM',
      },
    });
    expect(createNotificationResponse.ok()).toBeTruthy();
    const createNotificationBody = await createNotificationResponse.json();
    const notificationId = createNotificationBody?.data?.id as string;
    expect(notificationId).toBeTruthy();

    const notificationsResponse = await page.request.get('/api/notifications?unreadOnly=true', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(notificationsResponse.ok()).toBeTruthy();
    const notificationsBody = await notificationsResponse.json();
    expect(notificationsBody?.data?.unreadCount).toBeGreaterThan(0);

    const markAllReadResponse = await page.request.patch('/api/notifications/mark-all-read', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    expect(markAllReadResponse.ok()).toBeTruthy();

    const notificationsAfterResponse = await page.request.get('/api/notifications?unreadOnly=true', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(notificationsAfterResponse.ok()).toBeTruthy();
    const notificationsAfterBody = await notificationsAfterResponse.json();
    expect(notificationsAfterBody?.data?.unreadCount || 0).toBe(0);

    mkdirSync('output/playwright', { recursive: true });
    await page.screenshot({
      path: 'output/playwright/e2e-15-reports-favorites.png',
      fullPage: true,
    });
  });
});
