import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { ensureDir, isoDateLocal, timeSlug, tryRun, writeJson } from './utils';
import { runExploration } from './explore';
import { readPlaywrightSummary, expectedPlaywrightJsonPath } from './playwright-results';
import type { AuditReportJson, Finding } from './types';
import { writeAuditReportFiles } from './report';
import type { UserRole } from '../../qa/routes';
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { QA_MODULES, type QAModule, getModuleById } from '../../qa/modules';
import { writeRunIndexFiles, type RunIndexModuleEntry } from './run-index';

dotenv.config();
dotenv.config({ path: '.env.local' });

async function sleep(ms: number) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

async function isServerUp(baseURL: string): Promise<boolean> {
  try {
    const probeUrl = new URL('/login', baseURL).toString();
    const res = await fetch(probeUrl, { redirect: 'manual' as any });
    if (!res) return false;
    if (res.status < 200 || res.status >= 400) return false;

    // In Next dev mode, the server may accept connections while compilation isn't ready yet.
    // Require that the HTML includes Next static assets so Playwright can actually hydrate.
    const html = await res.text().catch(() => '');
    if (!html) return false;
    if (!html.includes('/_next/static/')) return false;
    return true;
  } catch {
    return false;
  }
}

async function waitForServer(baseURL: string, timeoutMs = 120_000): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await isServerUp(baseURL)) return;
    await sleep(750);
  }
  throw new Error(`Server did not become ready at ${baseURL} within ${Math.round(timeoutMs / 1000)}s`);
}

function startDevServer(baseURL: string): { proc: ChildProcess; stop: () => void } {
  const url = new URL(baseURL);
  const port = url.port || '3000';

  const proc = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: false,
    env: { ...process.env, PORT: port },
  });

  const stop = () => {
    try {
      proc.kill('SIGTERM');
    } catch {
      // ignore
    }
  };

  return { proc, stop };
}

function parseArgs(argv: string[]) {
  const args = new Set(argv);
  const getValue = (name: string): string | undefined => {
    const idx = argv.findIndex(a => a === name);
    return idx >= 0 ? argv[idx + 1] : undefined;
  };

  const baseUrlIdx = argv.findIndex(a => a === '--base-url');
  const baseURL = baseUrlIdx >= 0 ? argv[baseUrlIdx + 1] : 'http://localhost:3000';

  const rolesIdx = argv.findIndex(a => a === '--roles');
  const rolesRaw = rolesIdx >= 0 ? argv[rolesIdx + 1] : 'ADMIN,MANAGER,TECHNICIAN,DRIVER';
  const roles = rolesRaw
    .split(',')
    .map(r => r.trim())
    .filter(Boolean) as UserRole[];

  const module = getValue('--module');
  const modules = getValue('--modules');

  return {
    help: args.has('--help') || args.has('-h'),
    listModules: args.has('--list-modules'),
    module,
    modules,
    all: args.has('--all'),
    strict: args.has('--strict'),
    bail: args.has('--bail'),
    skipSetup: args.has('--skip-setup'),
    skipPlaywright: args.has('--skip-playwright'),
    skipExplore: args.has('--skip-explore'),
    baseURL,
    roles,
  };
}

function gitMeta() {
  const branch = spawnSync('git rev-parse --abbrev-ref HEAD', { shell: true, encoding: 'utf8' }).stdout?.trim();
  const commit = spawnSync('git rev-parse HEAD', { shell: true, encoding: 'utf8' }).stdout?.trim();
  return { branch, commit };
}

function buildTestBacklog(findings: Finding[]): AuditReportJson['testBacklog'] {
  const backlog: AuditReportJson['testBacklog'] = [];
  let i = 1;

  const add = (
    description: string,
    priority: AuditReportJson['testBacklog'][number]['priority'],
    type: AuditReportJson['testBacklog'][number]['type'],
    steps: string[],
    expectedResults: string[],
    tags: string[]
  ) => {
    backlog.push({
      id: `TC-AUDIT-${String(i++).padStart(3, '0')}`,
      description,
      priority,
      type,
      steps,
      expectedResults,
      tags,
    });
  };

  // High-value negative tests (always propose)
  add(
    'Auth: login fails with wrong password shows actionable error',
    'P1',
    'E2E',
    ['Go to /login', 'Enter valid email + wrong password', 'Submit'],
    ['User stays on login', 'Error message displayed', 'No token stored'],
    ['auth', 'negative']
  );
  add(
    'API: protected route without Authorization returns 401',
    'P1',
    'Functional',
    ['Call GET /api/dashboard/overview without Authorization header'],
    ['HTTP 401', 'Body contains success=false and auth error'],
    ['api', 'auth', 'middleware']
  );

  // Findings-derived tests
  for (const f of findings) {
    if (f.type === 'functional' && (f.severity === 'P0' || f.severity === 'P1' || f.severity === 'P2')) {
      add(
        `Regression: ${f.title}`,
        f.severity,
        'E2E',
        [
          ...(f.role ? [`Login as ${f.role}`] : ['Login']),
          ...(f.url ? [`Navigate to ${f.url}`] : []),
          'Verify no console/page errors',
        ],
        ['No uncaught exceptions', 'Page renders expected content'],
        ['regression', ...(f.tags ?? [])]
      );
    }
  }

  return backlog;
}

function usage() {
  return `
QA audit (module-first)

Usage:
  npm run qa:audit -- --module <id> [--strict] [--bail] [options]
  npm run qa:audit -- --modules <id1,id2,...> [--strict] [--bail] [options]
  npm run qa:audit -- --all [--strict] [--bail] [options]
  npm run qa:audit -- --list-modules

Modules:
  (run) npm run qa:audit -- --list-modules

Green criteria (strict mode):
  - Playwright passed
  - No findings with severity P0/P1

Options:
  --strict               Exit 1 if any module is red
  --bail                 Stop at first red module
  --skip-setup           Do not run docker/migrations/seed
  --skip-playwright      Skip Playwright
  --skip-explore         Skip exploration crawl
  --base-url <url>       Base URL (default: http://localhost:3000)
  --roles <csv>          Roles (default: ADMIN,MANAGER,TECHNICIAN,DRIVER)
`.trim();
}

function uniqueRunDir(auditRoot: string): { runId: string; runDir: string } {
  const baseId = `${isoDateLocal()}-${timeSlug()}`;
  let runId = baseId;
  let runDir = path.join(auditRoot, runId);
  let i = 2;
  while (fs.existsSync(runDir)) {
    runId = `${baseId}-${i++}`;
    runDir = path.join(auditRoot, runId);
  }
  return { runId, runDir };
}

function resolveModules(opts: ReturnType<typeof parseArgs>): QAModule[] {
  const selected: QAModule[] = [];

  const add = (idRaw: string) => {
    const id = idRaw.trim();
    if (!id) return;
    const mod = getModuleById(id);
    if (!mod) throw new Error(`Unknown module "${id}". Use --list-modules.`);
    if (!selected.some(m => m.id === mod.id)) selected.push(mod);
  };

  if (opts.all) {
    selected.push(...QA_MODULES);
  } else if (opts.modules) {
    opts.modules.split(',').forEach(add);
  } else if (opts.module) {
    add(opts.module);
  } else {
    throw new Error('Missing required scope. Provide --module, --modules, or --all.');
  }

  return selected;
}

function splitPlaywrightFiles(files: string[]): { setupFiles: string[]; specFiles: string[] } {
  const setupFiles: string[] = [];
  const specFiles: string[] = [];
  for (const f of files) {
    if (f.includes('/tests/setup/') || f.endsWith('.setup.ts')) setupFiles.push(f);
    else specFiles.push(f);
  }
  return { setupFiles, specFiles };
}

function moduleIsRed(params: {
  setupFailed: string[];
  playwright?: AuditReportJson['playwright'];
  findings: Finding[];
}): { red: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (params.setupFailed.length) reasons.push('setup_failed');
  if (params.playwright && params.playwright.status === 'failed') reasons.push('playwright_failed');
  if (params.findings.some(f => f.severity === 'P0' || f.severity === 'P1')) reasons.push('p0_p1_findings');
  return { red: reasons.length > 0, reasons };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help) {
    // eslint-disable-next-line no-console
    console.log(usage());
    return '';
  }

  if (opts.listModules) {
    // eslint-disable-next-line no-console
    console.log('Available QA modules:\n');
    for (const m of QA_MODULES) {
      // eslint-disable-next-line no-console
      console.log(`- ${m.id}: ${m.label}`);
    }
    // eslint-disable-next-line no-console
    console.log('\nExample:\n  npm run qa:audit -- --module vehicles --strict\n');
    return '';
  }

  let modules: QAModule[];
  try {
    modules = resolveModules(opts);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`❌ ${e instanceof Error ? e.message : String(e)}\n`);
    // eslint-disable-next-line no-console
    console.error(usage());
    process.exitCode = 1;
    return '';
  }

  const auditRoot = path.join(process.cwd(), 'qa', 'audits');
  ensureDir(auditRoot);

  // Storage layout:
  //   qa/audits/<YYYY-MM-DD>/<runId>/index.(md|json)
  //   qa/audits/<YYYY-MM-DD>/<moduleId>/<runId>/report.(md|json) + evidence/...
  const dateDir = path.join(auditRoot, isoDateLocal());
  ensureDir(dateDir);

  const { runId, runDir } = uniqueRunDir(dateDir);
  ensureDir(runDir);

  const setupCommandsRun: string[] = [];
  const setupFailed: string[] = [];
  const modulesIndex: RunIndexModuleEntry[] = [];

  // Ensure we always stop the dev server if we started it.
  let serverStartedByAudit = false;
  let server: { proc: ChildProcess; stop: () => void } | undefined;

  try {
    if (!opts.skipSetup) {
      const setupCommands = [
        'npm run docker:up',
        'npm run test:infra',
        'npm run db:generate',
        'npm run db:migrate',
        'npm run db:seed',
      ];
      for (const cmd of setupCommands) {
        setupCommandsRun.push(cmd);
        const code = tryRun(cmd);
        if (code !== 0) {
          setupFailed.push(`${cmd} (exit ${code})`);
          break;
        }
      }
    }

    const needsServer = !opts.skipExplore || !opts.skipPlaywright;
    if (needsServer) {
      const alreadyUp = await isServerUp(opts.baseURL);
      if (!alreadyUp) {
        server = startDevServer(opts.baseURL);
        serverStartedByAudit = true;
        await waitForServer(opts.baseURL);
      }
    }

    for (const mod of modules) {
      const moduleDir = path.join(dateDir, mod.id, runId);
      ensureDir(moduleDir);
      ensureDir(path.join(moduleDir, 'evidence'));

      const moduleCommandsRun: string[] = [...setupCommandsRun];
      const moduleFindings: Finding[] = [];
      const moduleRoles = mod.roles ? Array.from(new Set(mod.roles)) : Array.from(new Set(opts.roles));

      let playwrightSummary: AuditReportJson['playwright'] | undefined;
      let playwrightRunExit: number | undefined;
      let playwrightSetupExit: number | undefined;

      if (!opts.skipPlaywright && !setupFailed.length) {
        const { setupFiles, specFiles } = splitPlaywrightFiles(mod.playwrightFiles);

        if (setupFiles.length) {
          const setupAuditDir = path.join(moduleDir, '.setup');
          ensureDir(setupAuditDir);
          moduleCommandsRun.push(
            `npx playwright test -c qa/playwright.qa.config.ts ${setupFiles.join(' ')} --reporter=line`
          );
          playwrightSetupExit = tryRun(
            `npx playwright test -c qa/playwright.qa.config.ts ${setupFiles.join(' ')} --reporter=line`,
            { env: { QA_AUDIT_DIR: setupAuditDir, QA_BASE_URL: opts.baseURL } }
          );
          if (playwrightSetupExit !== 0) {
            moduleFindings.push({
              id: `PW-SETUP-${mod.id.toUpperCase()}`,
              type: 'test',
              severity: 'P0',
              title: 'Playwright setup failed',
              observed: `Setup files failed with exit ${playwrightSetupExit}: ${setupFiles.join(', ')}`,
              tags: ['playwright', 'setup'],
            });
            if (opts.bail) {
              const report: AuditReportJson = {
                metadata: {
                  generatedAt: new Date().toISOString(),
                  baseURL: opts.baseURL,
                  auditDir: moduleDir,
                  git: gitMeta(),
                  module: {
                    id: mod.id,
                    label: mod.label,
                    areas: mod.areas,
                    playwrightFiles: mod.playwrightFiles,
                  },
                  status: 'red',
                  statusReasons: ['playwright_setup_failed'],
                },
                setup: { skipped: opts.skipSetup, commandsRun: moduleCommandsRun },
                playwright: playwrightSummary,
                exploration: undefined,
                findings: moduleFindings,
                testBacklog: buildTestBacklog(moduleFindings),
              };
              writeAuditReportFiles(moduleDir, report);
              modulesIndex.push({
                id: mod.id,
                label: mod.label,
                status: 'red',
                statusReasons: report.metadata.statusReasons || [],
                reportDir: moduleDir,
                reportMdPath: path.join(moduleDir, 'report.md'),
                playwright: playwrightSummary,
                findingsBySeverity: { P0: 1, P1: 0, P2: 0, P3: 0 },
              });
              break;
            }
          }
        }

        if (specFiles.length) {
          moduleCommandsRun.push(`npx playwright test -c qa/playwright.qa.config.ts ${specFiles.join(' ')}`);
          playwrightRunExit = tryRun(`npx playwright test -c qa/playwright.qa.config.ts ${specFiles.join(' ')}`, {
            env: { QA_AUDIT_DIR: moduleDir, QA_BASE_URL: opts.baseURL },
          });
          const jsonPath = expectedPlaywrightJsonPath(moduleDir);
          playwrightSummary = readPlaywrightSummary(jsonPath);
          if (!playwrightSummary) {
            writeJson(jsonPath, {
              error: `Playwright run exited with code ${playwrightRunExit} and did not produce JSON.`,
              files: specFiles,
            });
            moduleFindings.push({
              id: `PW-NOJSON-${mod.id.toUpperCase()}`,
              type: 'test',
              severity: 'P0',
              title: 'Playwright did not produce JSON results',
              observed: `Playwright exit ${playwrightRunExit}. Expected JSON at ${path.relative(process.cwd(), jsonPath)}.`,
              tags: ['playwright', 'reporting'],
            });
          }
        }
      }
      if (!opts.skipPlaywright && setupFailed.length) {
        moduleFindings.push({
          id: `SETUP-SKIPPED-PW-${mod.id.toUpperCase()}`,
          type: 'test',
          severity: 'P0',
          title: 'Setup failed; Playwright skipped',
          observed: setupFailed.join('; '),
          tags: ['setup', 'playwright'],
        });
      }

      let explorationReport: AuditReportJson['exploration'] | undefined;
      if (!opts.skipExplore && !setupFailed.length) {
        try {
          const { exploration, findings: expFindings } = await runExploration({
            auditDir: moduleDir,
            baseURL: opts.baseURL,
            roles: moduleRoles,
            areas: mod.areas,
          });
          explorationReport = exploration;
          moduleFindings.push(...expFindings);
        } catch (e) {
          moduleFindings.push({
            id: `EXPLORE-FAILED-${mod.id.toUpperCase()}`,
            type: 'test',
            severity: 'P0',
            title: 'Exploration failed (automation error)',
            observed: e instanceof Error ? e.message : String(e),
            tags: ['exploration'],
          });
        }
      } else if (setupFailed.length && !opts.skipExplore) {
        moduleFindings.push({
          id: `SETUP-SKIPPED-EXPLORE-${mod.id.toUpperCase()}`,
          type: 'test',
          severity: 'P0',
          title: 'Setup failed; exploration skipped',
          observed: setupFailed.join('; '),
          tags: ['setup', 'exploration'],
        });
      }

      const docsReportsRoutesDisabled = process.env.FLEETMADA_DISABLE_DOCS_REPORTS_ROUTES === '1';
      if (docsReportsRoutesDisabled && (mod.areas.includes('documents') || mod.areas.includes('reports'))) {
        moduleFindings.push({
          id: 'NOTE-MW-DOCS-REPORTS',
          type: 'test',
          severity: 'P3',
          title: 'Documents/Reports routes disabled by config',
          observed:
            'FLEETMADA_DISABLE_DOCS_REPORTS_ROUTES=1 is set; middleware redirects /documents and /reports to /. This is expected in this configuration.',
          tags: ['middleware', 'routing', 'config'],
        });
      }

      if (setupFailed.length) {
        moduleFindings.push({
          id: 'SETUP-FAILED',
          type: 'test',
          severity: 'P0',
          title: 'Setup failed; audit results may be incomplete',
          observed: setupFailed.join('; '),
          tags: ['setup'],
        });
      }

      const { red, reasons } = moduleIsRed({
        setupFailed,
        playwright: playwrightSummary,
        findings: moduleFindings,
      });

      const report: AuditReportJson = {
        metadata: {
          generatedAt: new Date().toISOString(),
          baseURL: opts.baseURL,
          auditDir: moduleDir,
          git: gitMeta(),
          module: {
            id: mod.id,
            label: mod.label,
            areas: mod.areas,
            playwrightFiles: mod.playwrightFiles,
          },
          status: red ? 'red' : 'green',
          statusReasons: reasons,
        },
        setup: {
          skipped: opts.skipSetup,
          commandsRun: moduleCommandsRun,
        },
        playwright: playwrightSummary,
        exploration: explorationReport,
        findings: moduleFindings,
        testBacklog: buildTestBacklog(moduleFindings),
      };

      writeAuditReportFiles(moduleDir, report);

      const counts = moduleFindings.reduce(
        (acc, f) => {
          acc[f.severity] += 1;
          return acc;
        },
        { P0: 0, P1: 0, P2: 0, P3: 0 } as Record<AuditReportJson['findings'][number]['severity'], number>
      );

      modulesIndex.push({
        id: mod.id,
        label: mod.label,
        status: report.metadata.status || 'red',
        statusReasons: report.metadata.statusReasons || [],
        reportDir: moduleDir,
        reportMdPath: path.join(moduleDir, 'report.md'),
        playwright: playwrightSummary,
        findingsBySeverity: counts,
      });

      if (opts.bail && report.metadata.status === 'red') break;
    }

    writeRunIndexFiles(runDir, {
      runId,
      baseURL: opts.baseURL,
      runDir,
      git: gitMeta(),
      generatedAt: new Date().toISOString(),
      options: {
        strict: opts.strict,
        bail: opts.bail,
        skipSetup: opts.skipSetup,
        skipPlaywright: opts.skipPlaywright,
        skipExplore: opts.skipExplore,
        roles: opts.roles,
        modulesRequested: modules.map(m => m.id),
      },
      setup: { skipped: opts.skipSetup, commandsRun: setupCommandsRun, setupFailed },
      modules: modulesIndex,
    });

    const anyRed = modulesIndex.some(m => m.status === 'red');
    if (opts.strict && anyRed) process.exitCode = 1;

    return runDir;
  } finally {
    if (serverStartedByAudit && server) {
      server.stop();
    }
  }
}

main()
  .then(dir => {
    // eslint-disable-next-line no-console
    if (dir) console.log(`\n✅ QA audit complete: ${dir}\n`);
  })
  .catch(err => {
    // eslint-disable-next-line no-console
    console.error('❌ QA audit failed:', err);
    process.exit(1);
  });
