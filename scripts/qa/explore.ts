import path from 'node:path';
import { chromium, type Page } from 'playwright';
import { routesForRole, type QARoute, type UserRole } from '../../qa/routes';
import type { ExplorationPageResult, ExplorationReport, Finding } from './types';
import { ensureDir, safeFileSlug, writeJson } from './utils';

type Credentials = { email: string; password: string };

const SEED_USERS: Record<UserRole, Credentials> = {
  ADMIN: { email: 'admin@fleetmadagascar.mg', password: 'testpassword123' },
  MANAGER: { email: 'manager@fleetmadagascar.mg', password: 'userpassword123' },
  TECHNICIAN: { email: 'tech@fleetmadagascar.mg', password: 'userpassword123' },
  DRIVER: { email: 'driver@fleetmadagascar.mg', password: 'userpassword123' },
};

function routeToScreenshotSlug(route: string) {
  const normalized = route === '/' ? 'root' : route || 'root';
  const slug = safeFileSlug(normalized);
  return slug || 'root';
}

async function waitForAppIdle(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(250);
  try {
    await page.waitForLoadState('networkidle', { timeout: 10_000 });
  } catch {
    // Best effort: Next.js pages can keep background requests.
  }
}

async function login(page: Page, baseURL: string, creds: Credentials) {
  await page.goto(`${baseURL}/login`, { waitUntil: 'domcontentloaded' });
  await waitForAppIdle(page);

  await page.waitForSelector('[data-testid="email-input"]', { timeout: 60_000 });
  await page.fill('[data-testid="email-input"]', creds.email);
  await page.fill('[data-testid="password-input"]', creds.password);

  // In dev, initial auth bootstrapping can briefly keep the button disabled.
  await page.waitForSelector('[data-testid="login-button"]:not([disabled])', { timeout: 60_000 });
  await page.click('[data-testid="login-button"]');
  await waitForAppIdle(page);
}

async function runUxSignals(page: Page): Promise<ExplorationPageResult['uxSignals']> {
  return page.evaluate(() => {
    const formControls = Array.from(document.querySelectorAll('input, select, textarea')) as HTMLElement[];

    const isLabeled = (el: HTMLElement) => {
      const ariaLabel = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
      if (ariaLabel) return true;
      const id = el.getAttribute('id');
      if (id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) return true;
      const parentLabel = el.closest('label');
      if (parentLabel) return true;
      return false;
    };

    const unlabeledFormControls = formControls.filter(el => !isLabeled(el)).length;

    const buttons = Array.from(document.querySelectorAll('button, [role="button"]')) as HTMLElement[];
    const emptyButtons = buttons.filter(el => {
      const text = (el.textContent || '').trim();
      const ariaLabel = el.getAttribute('aria-label') || el.getAttribute('title');
      return !text && !ariaLabel;
    }).length;

    const hasH1 = !!document.querySelector('h1');

    return {
      unlabeledFormControls,
      emptyButtons,
      missingH1: !hasH1,
    };
  });
}

export async function runExploration(params: {
  auditDir: string;
  baseURL: string;
  roles: UserRole[];
  areas?: QARoute['area'][];
}): Promise<{ exploration: ExplorationReport; findings: Finding[] }> {
  const startedAt = new Date().toISOString();
  const screenshotsDir = path.join(params.auditDir, 'evidence', 'exploration', 'screenshots');
  ensureDir(screenshotsDir);

  const browser = await chromium.launch({ headless: true });

  const pages: ExplorationPageResult[] = [];
  const findings: Finding[] = [];

  type Occurrence = { role: UserRole; route: string; url: string; screenshot?: string };
  const consoleErrorOccurrences = new Map<string, { count: number; occ: Occurrence[] }>();
  const pageErrorOccurrences = new Map<string, { count: number; occ: Occurrence[] }>();
  const apiErrorOccurrences = new Map<string, { count: number; occ: Occurrence[] }>();
  const redirectOccurrences = new Map<string, { count: number; occ: Occurrence[] }>();

  for (const role of params.roles) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const creds = SEED_USERS[role];

    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    const requestFailures: string[] = [];
    const apiErrors: { url: string; status: number }[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => pageErrors.push(String(err)));
    page.on('requestfailed', req =>
      requestFailures.push(`${req.method()} ${req.url()} (${req.failure()?.errorText || 'failed'})`)
    );
    page.on('response', resp => {
      const url = resp.url();
      if (url.includes('/api/') && resp.status() >= 400) {
        apiErrors.push({ url, status: resp.status() });
      }
    });

    const roleRoutes = routesForRole(role).filter(r => !params.areas || params.areas.includes(r.area));
    const preAuthRoutes = roleRoutes.map(r => r.path).filter(p => ['/login', '/register'].includes(p));
    const postAuthRoutes = roleRoutes.map(r => r.path).filter(p => !['/login', '/register'].includes(p));

    // Auth module: visit login/register before logging in.
    for (const route of preAuthRoutes) {
      consoleErrors.length = 0;
      pageErrors.length = 0;
      requestFailures.length = 0;
      apiErrors.length = 0;

      const url = `${params.baseURL}${route}`;
      const started = Date.now();
      let httpStatus: number | undefined;
      try {
        const resp = await page.goto(url, { waitUntil: 'domcontentloaded' });
        httpStatus = resp?.status();
        await waitForAppIdle(page);
      } catch (e) {
        pageErrors.push(`Navigation error for ${url}: ${e instanceof Error ? e.message : String(e)}`);
      }
      const gotoMs = Date.now() - started;

      const finalUrl = page.url();
      const title = await page.title().catch(() => undefined);
      const uxSignals = await runUxSignals(page).catch(() => ({
        unlabeledFormControls: 0,
        emptyButtons: 0,
        missingH1: false,
      }));

      const screenshotRel = path.join(
        'evidence',
        'exploration',
        'screenshots',
        `${role}_${routeToScreenshotSlug(route)}.png`
      );
      const screenshotAbs = path.join(params.auditDir, screenshotRel);
      await page.screenshot({ path: screenshotAbs, fullPage: true }).catch(() => undefined);

      const result: ExplorationPageResult = {
        role,
        route,
        finalUrl,
        httpStatus,
        title,
        timingsMs: { goto: gotoMs },
        consoleErrors: consoleErrors.slice(-50),
        pageErrors: pageErrors.slice(-50),
        requestFailures: requestFailures.slice(-50),
        apiErrors: apiErrors.slice(-50),
        uxSignals,
        screenshot: screenshotRel,
      };
      pages.push(result);

      const occ: Occurrence = { role, route, url: finalUrl, screenshot: screenshotRel };

      for (const msg of result.consoleErrors) {
        const entry = consoleErrorOccurrences.get(msg) || { count: 0, occ: [] };
        entry.count += 1;
        if (entry.occ.length < 20) entry.occ.push(occ);
        consoleErrorOccurrences.set(msg, entry);
      }
      for (const msg of result.pageErrors) {
        const entry = pageErrorOccurrences.get(msg) || { count: 0, occ: [] };
        entry.count += 1;
        if (entry.occ.length < 20) entry.occ.push(occ);
        pageErrorOccurrences.set(msg, entry);
      }
      for (const api of result.apiErrors) {
        const key = `${api.status} ${api.url}`;
        const entry = apiErrorOccurrences.get(key) || { count: 0, occ: [] };
        entry.count += 1;
        if (entry.occ.length < 20) entry.occ.push(occ);
        apiErrorOccurrences.set(key, entry);
      }
      if ((route === '/documents' || route === '/reports') && !finalUrl.endsWith(route)) {
        const key = `${route} -> ${finalUrl}`;
        const entry = redirectOccurrences.get(key) || { count: 0, occ: [] };
        entry.count += 1;
        if (entry.occ.length < 20) entry.occ.push(occ);
        redirectOccurrences.set(key, entry);
      }
    }

    if (postAuthRoutes.length) {
      await login(page, params.baseURL, creds);
    }

    for (const route of postAuthRoutes) {
      // Reset per-page collectors to avoid carrying errors between routes.
      consoleErrors.length = 0;
      pageErrors.length = 0;
      requestFailures.length = 0;
      apiErrors.length = 0;

      const url = `${params.baseURL}${route}`;
      const started = Date.now();
      let httpStatus: number | undefined;
      try {
        const resp = await page.goto(url, { waitUntil: 'domcontentloaded' });
        httpStatus = resp?.status();
        await waitForAppIdle(page);
      } catch (e) {
        pageErrors.push(`Navigation error for ${url}: ${e instanceof Error ? e.message : String(e)}`);
      }
      const gotoMs = Date.now() - started;

      const finalUrl = page.url();
      const title = await page.title().catch(() => undefined);
      const uxSignals = await runUxSignals(page).catch(() => ({
        unlabeledFormControls: 0,
        emptyButtons: 0,
        missingH1: false,
      }));

      const screenshotRel = path.join(
        'evidence',
        'exploration',
        'screenshots',
        `${role}_${routeToScreenshotSlug(route)}.png`
      );
      const screenshotAbs = path.join(params.auditDir, screenshotRel);
      await page.screenshot({ path: screenshotAbs, fullPage: true }).catch(() => undefined);

      const result: ExplorationPageResult = {
        role,
        route,
        finalUrl,
        httpStatus,
        title,
        timingsMs: { goto: gotoMs },
        consoleErrors: consoleErrors.slice(-50),
        pageErrors: pageErrors.slice(-50),
        requestFailures: requestFailures.slice(-50),
        apiErrors: apiErrors.slice(-50),
        uxSignals,
        screenshot: screenshotRel,
      };
      pages.push(result);

      const occ: Occurrence = { role, route, url: finalUrl, screenshot: screenshotRel };

      for (const msg of result.consoleErrors) {
        const entry = consoleErrorOccurrences.get(msg) || { count: 0, occ: [] };
        entry.count += 1;
        if (entry.occ.length < 20) entry.occ.push(occ);
        consoleErrorOccurrences.set(msg, entry);
      }
      for (const msg of result.pageErrors) {
        const entry = pageErrorOccurrences.get(msg) || { count: 0, occ: [] };
        entry.count += 1;
        if (entry.occ.length < 20) entry.occ.push(occ);
        pageErrorOccurrences.set(msg, entry);
      }
      for (const api of result.apiErrors) {
        const key = `${api.status} ${api.url}`;
        const entry = apiErrorOccurrences.get(key) || { count: 0, occ: [] };
        entry.count += 1;
        if (entry.occ.length < 20) entry.occ.push(occ);
        apiErrorOccurrences.set(key, entry);
      }
      if ((route === '/documents' || route === '/reports') && !finalUrl.endsWith(route)) {
        const key = `${route} -> ${finalUrl}`;
        const entry = redirectOccurrences.get(key) || { count: 0, occ: [] };
        entry.count += 1;
        if (entry.occ.length < 20) entry.occ.push(occ);
        redirectOccurrences.set(key, entry);
      }
    }

    await context.close();
  }

  await browser.close();

  const finishedAt = new Date().toISOString();
  const navigationTree = params.roles.reduce((acc, role) => {
    acc[role] = { visited: pages.filter(p => p.role === role).map(p => p.finalUrl) };
    return acc;
  }, {} as ExplorationReport['navigationTree']);

  const exploration: ExplorationReport = {
    baseURL: params.baseURL,
    startedAt,
    finishedAt,
    roles: params.roles,
    pages,
    navigationTree,
  };

  writeJson(path.join(params.auditDir, 'navigation-tree.json'), exploration.navigationTree);
  writeJson(path.join(params.auditDir, 'evidence', 'exploration', 'exploration.json'), exploration);

  // Synthesize actionable, de-duplicated findings.
  const mkDetails = (occ: Occurrence[]) =>
    occ.map(o => `${o.role} ${o.route} (${o.url})`).join('; ');

  for (const [msg, data] of pageErrorOccurrences.entries()) {
    const first = data.occ[0];
    findings.push({
      id: `PAGEERROR-${safeFileSlug(msg).slice(0, 60)}`,
      type: 'functional',
      severity: 'P1',
      title: 'Page error (uncaught exception)',
      role: first?.role,
      url: first?.url,
      observed: msg,
      evidence: first?.screenshot ? [first.screenshot] : undefined,
      hypothesis: `Observed ${data.count} time(s). Occurrences: ${mkDetails(data.occ)}`,
      tags: ['exploration', 'pageerror'],
    });
  }

  for (const [msg, data] of consoleErrorOccurrences.entries()) {
    const first = data.occ[0];
    const isServerError = msg.includes('status of 500') || msg.includes('(Internal Server Error)');
    const isNextRscFallback =
      msg.includes('Failed to fetch RSC payload') && msg.includes('Falling back to browser navigation');
    findings.push({
      id: `CONSOLE-${safeFileSlug(msg).slice(0, 60)}`,
      type: 'functional',
      severity: isServerError ? 'P1' : isNextRscFallback ? 'P3' : 'P2',
      title: isNextRscFallback ? 'Console error (Next.js RSC fallback)' : 'Console error',
      role: first?.role,
      url: first?.url,
      observed: msg,
      evidence: first?.screenshot ? [first.screenshot] : undefined,
      hypothesis: `Observed ${data.count} time(s). Occurrences: ${mkDetails(data.occ)}`,
      tags: ['exploration', 'console'],
    });
  }

  for (const [key, data] of apiErrorOccurrences.entries()) {
    const first = data.occ[0];
    const status = Number(String(key).split(' ')[0]);
    const severity: Finding['severity'] = Number.isFinite(status) && status >= 500 ? 'P1' : 'P2';
    findings.push({
      id: `API-${safeFileSlug(key).slice(0, 60)}`,
      type: 'functional',
      severity,
      title: 'API error response during page load',
      role: first?.role,
      url: first?.url,
      observed: key,
      evidence: first?.screenshot ? [first.screenshot] : undefined,
      hypothesis: `Observed ${data.count} time(s). Occurrences: ${mkDetails(data.occ)}`,
      tags: ['exploration', 'api'],
    });
  }

  for (const [key, data] of redirectOccurrences.entries()) {
    const first = data.occ[0];
    findings.push({
      id: `REDIRECT-${safeFileSlug(key).slice(0, 60)}`,
      type: 'functional',
      severity: 'P2',
      title: 'Route redirected (middleware / guard)',
      role: first?.role,
      url: `${params.baseURL}${first?.route ?? ''}`,
      expected: `Access ${first?.route} for authenticated users (or show an explicit 403/blocked page)`,
      observed: key,
      evidence: first?.screenshot ? [first.screenshot] : undefined,
      hypothesis: `Observed ${data.count} time(s). Occurrences: ${mkDetails(data.occ)}`,
      tags: ['middleware', 'routing'],
    });
  }

  return { exploration, findings };
}
