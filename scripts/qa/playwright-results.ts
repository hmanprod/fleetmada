import fs from 'node:fs';
import path from 'node:path';
import type { PlaywrightSummary } from './types';

type PlaywrightJson = any;

function classifyFailure(
  errorMessage = ''
): { classification: PlaywrightSummary['failures'][number]['classification']; confidence: number } {
  const msg = errorMessage.toLowerCase();

  if (msg.includes('timeout') || msg.includes('timed out') || msg.includes('net::err') || msg.includes('page closed')) {
    return { classification: 'flaky', confidence: 0.6 };
  }
  if (
    msg.includes('not found') &&
    (msg.includes('seed') || msg.includes('prisma') || msg.includes('company') || msg.includes('vehicle'))
  ) {
    return { classification: 'data-dependency', confidence: 0.55 };
  }
  if (msg.includes('expected') && msg.includes('to contain text')) {
    return { classification: 'ui-change', confidence: 0.45 };
  }
  if (msg.includes('500') || msg.includes('internal server error')) {
    return { classification: 'bug', confidence: 0.55 };
  }
  return { classification: 'unknown', confidence: 0.3 };
}

function walkTests(node: any, out: any[] = []) {
  if (!node) return out;
  if (Array.isArray(node.suites)) node.suites.forEach((s: any) => walkTests(s, out));
  if (Array.isArray(node.specs)) {
    for (const spec of node.specs) {
      if (Array.isArray(spec.tests)) {
        for (const t of spec.tests) out.push({ spec, test: t });
      }
    }
  }
  return out;
}

export function readPlaywrightSummary(jsonPath: string): PlaywrightSummary | undefined {
  if (!fs.existsSync(jsonPath)) return undefined;
  const raw = fs.readFileSync(jsonPath, 'utf8');
  const data: PlaywrightJson = JSON.parse(raw);

  const startedAt: string = data?.stats?.startTime || data?.config?.metadata?.startedAt || new Date().toISOString();
  const finishedAt: string = new Date().toISOString();

  const stats = data?.stats || {};
  // Playwright JSON reporter exposes: expected (passed), unexpected (failed), flaky, skipped.
  const passed = Number(stats?.expected ?? 0);
  const failed = Number(stats?.unexpected ?? 0);
  const flaky = Number(stats?.flaky ?? 0);
  const skipped = Number(stats?.skipped ?? 0);
  const total = passed + failed + flaky + skipped;
  const durationMs = typeof stats?.duration === 'number' ? stats.duration : undefined;

  const failures: PlaywrightSummary['failures'] = [];
  for (const { spec, test } of walkTests(data)) {
    const results = Array.isArray(test?.results) ? test.results : [];
    const hasFailure = results.some((r: any) => r?.status === 'failed' || r?.status === 'timedOut');
    if (!hasFailure) continue;

    const failingResult =
      results.find((r: any) => r?.status === 'failed' || r?.status === 'timedOut') || results[0];
    const errorMessage: string | undefined = failingResult?.error?.message || failingResult?.error?.stack;
    const { classification, confidence } = classifyFailure(errorMessage || '');

    failures.push({
      titlePath: [...(spec?.titlePath || []), ...(test?.titlePath || [])].filter(Boolean),
      file: spec?.file,
      project: failingResult?.projectName,
      errorMessage,
      classification,
      confidence,
    });
  }

  const status: PlaywrightSummary['status'] = failed > 0 ? 'failed' : 'passed';

  return {
    startedAt,
    finishedAt,
    status,
    total,
    passed,
    failed,
    flaky,
    skipped,
    durationMs,
    failures,
  };
}

export function expectedPlaywrightJsonPath(auditDir: string): string {
  return path.join(auditDir, 'evidence', 'playwright-results.json');
}
