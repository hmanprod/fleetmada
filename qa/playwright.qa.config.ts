import path from 'node:path';
import { defineConfig } from '@playwright/test';
import baseConfig from '../playwright.config';

const repoRoot = process.cwd();
const testDir = path.join(repoRoot, 'tests');

const auditDir = process.env.QA_AUDIT_DIR || path.join(process.cwd(), 'qa', 'audits', 'dev-run');
const baseURL =
  process.env.QA_BASE_URL ||
  process.env.BASE_URL ||
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((baseConfig as any)?.use?.baseURL as string | undefined) ||
  'http://localhost:3000';

export default defineConfig({
  ...baseConfig,
  testDir,
  // QA runs sometimes include setup-style specs (ex: `*.setup.ts`) that are invoked explicitly
  // by the module runner. Ensure Playwright can discover them.
  testMatch: ['**/*.spec.ts', '**/*.setup.ts'],
  use: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(((baseConfig as any).use as any) || {}),
    baseURL,
  },
  webServer: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(((baseConfig as any).webServer as any) || {}),
    url: baseURL,
  },
  reporter: [
    ['html', { outputFolder: path.join(auditDir, 'evidence', 'playwright-report'), open: 'never' }],
    ['json', { outputFile: path.join(auditDir, 'evidence', 'playwright-results.json') }],
  ],
  outputDir: path.join(auditDir, 'evidence', 'test-results'),
});
