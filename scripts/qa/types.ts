import type { UserRole } from '../../qa/routes';
import type { QAModuleId } from '../../qa/modules';

export type Severity = 'P0' | 'P1' | 'P2' | 'P3';
export type FindingType = 'functional' | 'ux' | 'a11y' | 'test';

export type Finding = {
  id: string;
  type: FindingType;
  severity: Severity;
  title: string;
  role?: UserRole;
  url?: string;
  steps?: string[];
  expected?: string;
  observed?: string;
  evidence?: string[];
  hypothesis?: string;
  tags?: string[];
};

export type ExplorationPageResult = {
  role: UserRole;
  route: string;
  finalUrl: string;
  httpStatus?: number;
  title?: string;
  timingsMs?: { goto?: number };
  consoleErrors: string[];
  pageErrors: string[];
  requestFailures: string[];
  apiErrors: { url: string; status: number }[];
  uxSignals: {
    unlabeledFormControls: number;
    emptyButtons: number;
    missingH1: boolean;
  };
  screenshot?: string;
};

export type ExplorationReport = {
  baseURL: string;
  startedAt: string;
  finishedAt: string;
  roles: UserRole[];
  pages: ExplorationPageResult[];
  navigationTree: Record<UserRole, { visited: string[] }>;
};

export type PlaywrightSummary = {
  startedAt: string;
  finishedAt: string;
  status: 'passed' | 'failed';
  total: number;
  passed: number;
  failed: number;
  flaky: number;
  skipped: number;
  durationMs?: number;
  failures: Array<{
    titlePath: string[];
    file?: string;
    project?: string;
    errorMessage?: string;
    classification: 'bug' | 'flaky' | 'data-dependency' | 'ui-change' | 'unknown';
    confidence: number;
  }>;
};

export type AuditReportJson = {
  metadata: {
    generatedAt: string;
    baseURL: string;
    auditDir: string;
    git?: { branch?: string; commit?: string };
    module?: {
      id: QAModuleId;
      label: string;
      areas: string[];
      playwrightFiles: string[];
    };
    status?: 'green' | 'red';
    statusReasons?: string[];
  };
  setup: {
    skipped: boolean;
    commandsRun: string[];
  };
  playwright?: PlaywrightSummary;
  exploration?: ExplorationReport;
  findings: Finding[];
  testBacklog: Array<{
    id: string;
    description: string;
    priority: Severity;
    type: 'E2E' | 'Functional' | 'UX' | 'A11y';
    steps: string[];
    expectedResults: string[];
    tags: string[];
  }>;
};
