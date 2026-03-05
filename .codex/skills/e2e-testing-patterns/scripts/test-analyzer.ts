#!/usr/bin/env -S node --experimental-strip-types

/**
 * Basic E2E report analyzer for Playwright JSON report output.
 *
 * Usage:
 *   scripts/test-analyzer.ts <report.json>
 */

import fs from 'node:fs';
import path from 'node:path';

type TestCase = {
  title?: string;
  outcome?: 'expected' | 'flaky' | 'unexpected' | 'skipped';
  duration?: number;
};

type Suite = {
  title?: string;
  suites?: Suite[];
  specs?: Array<{
    title?: string;
    tests?: TestCase[];
  }>;
};

type PlaywrightReport = {
  suites?: Suite[];
};

function flattenTests(suite: Suite, parents: string[] = []): Array<{ name: string; test: TestCase }> {
  const scope = suite.title ? [...parents, suite.title] : parents;
  const rows: Array<{ name: string; test: TestCase }> = [];

  for (const spec of suite.specs ?? []) {
    const namePrefix = [...scope, spec.title ?? 'untitled-spec'].join(' > ');
    for (const t of spec.tests ?? []) {
      rows.push({ name: namePrefix, test: t });
    }
  }

  for (const child of suite.suites ?? []) {
    rows.push(...flattenTests(child, scope));
  }

  return rows;
}

function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node scripts/test-analyzer.ts <report.json>');
    process.exit(1);
  }

  const reportPath = path.resolve(file);
  if (!fs.existsSync(reportPath)) {
    console.error(`Report not found: ${reportPath}`);
    process.exit(1);
  }

  const parsed = JSON.parse(fs.readFileSync(reportPath, 'utf8')) as PlaywrightReport;
  const rows = (parsed.suites ?? []).flatMap((suite) => flattenTests(suite));

  if (!rows.length) {
    console.log('No tests found in report.');
    return;
  }

  const flaky = rows.filter((r) => r.test.outcome === 'flaky');
  const failed = rows.filter((r) => r.test.outcome === 'unexpected');
  const durations = rows
    .map((r) => ({ name: r.name, duration: r.test.duration ?? 0 }))
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 10);

  console.log(`Total tests: ${rows.length}`);
  console.log(`Flaky tests: ${flaky.length}`);
  console.log(`Failed tests: ${failed.length}`);

  if (flaky.length) {
    console.log('\nTop flaky tests:');
    for (const f of flaky.slice(0, 10)) {
      console.log(`- ${f.name}`);
    }
  }

  if (failed.length) {
    console.log('\nTop failed tests:');
    for (const f of failed.slice(0, 10)) {
      console.log(`- ${f.name}`);
    }
  }

  console.log('\nSlowest tests:');
  for (const d of durations) {
    console.log(`- ${d.duration}ms :: ${d.name}`);
  }
}

main();
