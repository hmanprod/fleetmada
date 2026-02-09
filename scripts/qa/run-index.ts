import path from 'node:path';
import type { AuditReportJson } from './types';
import { writeJson, writeText } from './utils';

export type RunIndexModuleEntry = {
  id: string;
  label: string;
  status: NonNullable<AuditReportJson['metadata']['status']>;
  statusReasons: string[];
  reportDir: string;
  reportMdPath: string;
  playwright?: AuditReportJson['playwright'];
  findingsBySeverity: Record<'P0' | 'P1' | 'P2' | 'P3', number>;
};

export type RunIndexJson = {
  metadata: {
    runId: string;
    generatedAt: string;
    baseURL: string;
    runDir: string;
    git?: { branch?: string; commit?: string };
  };
  options: {
    strict: boolean;
    bail: boolean;
    skipSetup: boolean;
    skipPlaywright: boolean;
    skipExplore: boolean;
    roles: string[];
    modulesRequested: string[];
  };
  setup: {
    skipped: boolean;
    commandsRun: string[];
    setupFailed: string[];
  };
  modules: Array<{
    id: string;
    label: string;
    status: 'green' | 'red';
    statusReasons: string[];
    reportDir: string;
    reportMdPath: string;
    playwright?: {
      status: 'passed' | 'failed';
      total: number;
      passed: number;
      failed: number;
      flaky: number;
      skipped: number;
    };
    findingsBySeverity: Record<'P0' | 'P1' | 'P2' | 'P3', number>;
  }>;
};

function mdEscape(text: string) {
  return text.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

export function writeRunIndexFiles(
  runDir: string,
  input: {
    runId: string;
    generatedAt: string;
    baseURL: string;
    runDir: string;
    git?: { branch?: string; commit?: string };
    options: RunIndexJson['options'];
    setup: RunIndexJson['setup'];
    modules: RunIndexModuleEntry[];
  }
) {
  const indexJson: RunIndexJson = {
    metadata: {
      runId: input.runId,
      generatedAt: input.generatedAt,
      baseURL: input.baseURL,
      runDir: input.runDir,
      git: input.git,
    },
    options: input.options,
    setup: input.setup,
    modules: input.modules.map(m => ({
      id: m.id,
      label: m.label,
      status: m.status,
      statusReasons: m.statusReasons,
      reportDir: m.reportDir,
      reportMdPath: m.reportMdPath,
      playwright: m.playwright
        ? {
            status: m.playwright.status,
            total: m.playwright.total,
            passed: m.playwright.passed,
            failed: m.playwright.failed,
            flaky: m.playwright.flaky,
            skipped: m.playwright.skipped,
          }
        : undefined,
      findingsBySeverity: m.findingsBySeverity,
    })),
  };

  writeJson(path.join(runDir, 'index.json'), indexJson);

  const rows = input.modules
    .map(m => {
      const pw = m.playwright ? `${m.playwright.status} (${m.playwright.failed}/${m.playwright.total})` : 'skipped';
      const f = m.findingsBySeverity;
      const relReport = path.relative(runDir, m.reportMdPath);
      const status = m.status === 'green' ? 'GREEN' : 'RED';
      const reasons = m.statusReasons.length ? m.statusReasons.join(', ') : '';
      const reportLink = `[${mdEscape(relReport)}](${mdEscape(relReport)})`;
      return `| ${mdEscape(m.id)} | ${mdEscape(m.label)} | ${status} | ${mdEscape(pw)} | ${f.P0} | ${f.P1} | ${f.P2} | ${f.P3} | ${mdEscape(reasons)} | ${reportLink} |`;
    })
    .join('\n');

  const md = `# QA Audit Index

**Run ID:** ${input.runId}
**Generated:** ${input.generatedAt}
**Base URL:** ${input.baseURL}
**Run dir:** ${input.runDir}

## Modules

| Module | Label | Status | Playwright | P0 | P1 | P2 | P3 | Reasons | Report |
|---|---|---|---|---:|---:|---:|---:|---|---|
${rows || '| _none_ |  |  |  |  |  |  |  |  |  |'}
`;

  writeText(path.join(runDir, 'index.md'), md);
}
