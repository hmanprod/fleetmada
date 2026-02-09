import path from 'node:path';
import type { AuditReportJson, Finding } from './types';
import { writeJson, writeText } from './utils';

function mdEscape(text: string) {
  return text.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function findingsToMarkdown(findings: Finding[]): string {
  if (!findings.length) return '_No findings collected._\n';

  const sorted = [...findings].sort((a, b) => {
    const order = { P0: 0, P1: 1, P2: 2, P3: 3 } as const;
    return order[a.severity] - order[b.severity];
  });

  let out = `| Severity | Type | Title | Role | URL | Evidence |\n|---|---|---|---|---|---|\n`;
  for (const f of sorted) {
    out += `| ${f.severity} | ${f.type} | ${mdEscape(f.title)} | ${f.role ?? ''} | ${
      f.url ? mdEscape(f.url) : ''
    } | ${f.evidence?.[0] ? mdEscape(f.evidence[0]) : ''} |\n`;
  }
  out += `\n`;
  return out;
}

export function writeAuditReportFiles(auditDir: string, report: AuditReportJson) {
  writeJson(path.join(auditDir, 'report.json'), report);

  const pw = report.playwright;
  const exp = report.exploration;
  const mod = report.metadata.module;
  const status = report.metadata.status;
  const statusReasons = (report.metadata.statusReasons || []).join(', ');

  const md = `# QA Audit Report

**Generated:** ${report.metadata.generatedAt}
**Base URL:** ${report.metadata.baseURL}
**Audit dir:** ${report.metadata.auditDir}
${mod ? `**Module:** ${mod.id} — ${mod.label}\n` : ''}${status ? `**Status:** ${status.toUpperCase()}${statusReasons ? ` (${statusReasons})` : ''}\n` : ''}${
    mod?.playwrightFiles?.length ? `**Playwright files:** ${mod.playwrightFiles.join(', ')}\n` : ''
  }

## Executive Summary

- Playwright: ${
    pw ? `${pw.status} (failed: ${pw.failed}, flaky: ${pw.flaky}, total: ${pw.total})` : 'skipped'
  }
- Exploration: ${exp ? `${exp.pages.length} page(s) visited across roles: ${exp.roles.join(', ')}` : 'skipped'}
- Findings: ${report.findings.length}

## Playwright Regression

${pw ? `- Total: ${pw.total}\n- Passed: ${pw.passed}\n- Failed: ${pw.failed}\n- Flaky: ${pw.flaky}\n- Skipped: ${pw.skipped}\n` : '_Skipped._'}

${
    pw && pw.failures.length
      ? `### Failures triage

| Test | Classification | Confidence | Project | Error |
|---|---|---:|---|---|
${pw.failures
  .map(
    f =>
      `| ${mdEscape(f.titlePath.join(' › '))} | ${f.classification} | ${f.confidence.toFixed(2)} | ${
        f.project ?? ''
      } | ${mdEscape((f.errorMessage || '').slice(0, 180))} |`
  )
  .join('\n')}

`
      : ''
  }

## Exploration (crawl)

${exp ? `- Started: ${exp.startedAt}\n- Finished: ${exp.finishedAt}\n- Pages: ${exp.pages.length}\n` : '_Skipped._'}

## Findings

${findingsToMarkdown(report.findings)}

## Test backlog (to automate)

${
    report.testBacklog.length
      ? report.testBacklog.map(tc => `- **${tc.id}** (${tc.priority}, ${tc.type}): ${tc.description}`).join('\n')
      : '_No backlog generated._'
  }

`;

  writeText(path.join(auditDir, 'report.md'), md);
}
