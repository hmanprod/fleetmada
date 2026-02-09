---
name: product-qa-auditor
description: Module-by-module QA auditing with Playwright. Runs targeted audits, generates per-module reports, and supports an iterate-until-green workflow for product QA.
---

# Product QA Auditor

## Overview

Automates module-by-module QA auditing using Playwright. Produces per-module reports and supports an iterate-until-green workflow (audit → fix → re-run).

## Core Capabilities

### 1. Automated Web Application Exploration
- Crawl a module’s routes and collect console/page/API errors
- Capture screenshots and navigation trees for triage

### 2. Functional Bug Detection
- Compare observed behavior against PRD requirements
- Identify visible errors and unexpected behaviors
- Detect logical inconsistencies and omissions
- Flag broken workflows and error states

### 3. UX Audit & Analysis
- Evaluate user experience against established heuristics
- Identify missing or ambiguous labels
- Assess workflow efficiency (click count analysis)
- Check basic accessibility compliance
- Analyze feedback mechanisms and error messaging

### 4. Test Artifact Generation
- Generate structured test cases from observations
- Create regression test suites
- Produce QA progression checklists
- Export reports in JSON/Markdown formats

## Workflow Decision Tree

**Start Here:** What type of QA audit do you need?

→ **Targeted Module Audit (recommended)**: audit 1 module, fix, re-run until GREEN  
→ **Full Application Audit**: audit all modules sequentially (index + per-module reports)  
→ **Regression Testing**: add/update Playwright specs for the module and re-run  
→ **UX Review**: treat UX findings as backlog items; keep tests stable

## FleetMada: Module-by-module audits

Dans FleetMada, le script `npm run qa:audit` fonctionne en mode **module-first**:

```bash
# Lister les modules
npm run qa:audit -- --list-modules

# Auditer un module et itérer jusqu’au vert (recommandé)
npm run qa:audit -- --module vehicles --strict
```

Définition “GREEN” (mode `--strict`):
- Playwright `passed`
- Aucun finding `P0` / `P1`

Boucle de travail recommandée:
1) Lancer l’audit d’un module (`--strict`)
2) Lire `qa/audits/<YYYY-MM-DD>/<runId>/index.md` puis `qa/audits/<YYYY-MM-DD>/<moduleId>/<runId>/report.md`
3) Corriger (code ou tests)
4) Relancer le même module jusqu’à **GREEN**

## Workflow (Playwright-first)

### Step 1: Run targeted audit

```bash
npm run qa:audit -- --module <id> --strict
```

### Step 1b: Full run (optional)

```bash
npm run qa:audit -- --all --strict --bail
```

### Step 2: Triage
- Open `qa/audits/<YYYY-MM-DD>/<runId>/index.md` to see RED/GREEN per module
- For the module under test, open `qa/audits/<YYYY-MM-DD>/<moduleId>/<runId>/report.md`
- If Playwright failed, open `qa/audits/<YYYY-MM-DD>/<moduleId>/<runId>/evidence/playwright-report/`
- Use screenshots/exploration evidence under `qa/audits/<YYYY-MM-DD>/<moduleId>/<runId>/evidence/`

### Step 3: Fix + re-run
- Fix code or update tests for the module
- Re-run the same module until it’s GREEN

## Notes (keeping the skill coherent)
- This workflow relies on **Playwright** (tests + exploration).
- If you add/update module tests, update the module mapping in `qa/modules.ts` so `qa:audit` runs the right files.

## Where tests live (FleetMada)
- Playwright specs: `tests/*.spec.ts`
- Module mapping: `qa/modules.ts`
- Module commands reference: `qa/MODULES.md`

## QA Progression Checklist

Every audit generates a standardized progression checklist:

```
Test Implementation Progress:
- [ ] Step 1: Identify what to test
- [ ] Step 2: Select appropriate test type  
- [ ] Step 3: Write tests following templates
- [ ] Step 4: Run tests and verify passing
- [ ] Step 5: Check coverage meets targets
- [ ] Step 6: Fix any failing tests
```

### Checklist Definitions
- **Identify what to test**: Map functionality from PRD + exploration
- **Select test type**: Choose unit/functional/integration/UX/E2E
- **Write tests**: Generate using structured templates
- **Run & verify**: Execute tests and validate results
- **Coverage check**: Ensure critical paths are covered
- **Fix failing tests**: Address failures or document bugs

## Output Formats

FleetMada writes, per run:
- Index du run: `qa/audits/<YYYY-MM-DD>/<runId>/index.md` + `index.json`
- Rapport d’un module: `qa/audits/<YYYY-MM-DD>/<moduleId>/<runId>/report.md` + `report.json`
- Evidence: `qa/audits/<YYYY-MM-DD>/<moduleId>/<runId>/evidence/`

### Test Case Template
```
Test Case ID: TC-[FEATURE]-[NUMBER]
Description: [Clear description of what is being tested]
Preconditions: [Required setup/state]
Steps:
  1. [Action step]
  2. [Action step]
  3. [Verification step]
Expected Results:
  - [Expected outcome 1]
  - [Expected outcome 2]
Priority: [High/Medium/Low]
Type: [Functional/UX/Integration/E2E]
```

## Success Criteria

### Navigation & Exploration
- Explore 80%+ of accessible pages from entry point
- Document all user interactions and flows
- Capture comprehensive screen summaries

### Bug Detection
- Identify visible errors and inconsistencies
- Flag missing/incorrect labels and feedback
- Document unexpected behaviors with context

### Test Coverage
- Generate test cases for critical user paths
- Complete QA progression checklist
- Achieve minimum coverage targets for core functionality

### Report Quality
- Structured, exportable reports (JSON/Markdown)
- Actionable findings for dev/QA teams
- Clear prioritization of issues found

## Technical Constraints

- **Web Applications Only**: Chromium-based exploration
- **Authentication**: Requires provided credentials or sandbox access
- **Context Efficiency**: Snapshots summarized to minimize token usage
- **Scope Limitation**: Focus on visible UI and basic interactions

## Resources

This skill is documentation-only for the FleetMada workflow (no bundled scripts).
- `ux_heuristics.md` - Comprehensive UX evaluation criteria
- `test_templates.md` - Standardized test case formats
- `qa_best_practices.md` - Industry QA standards and methodologies

### assets/
- `report_template.html` - HTML report template for stakeholders
- `test_case_template.json` - JSON schema for test case structure
- `checklist_template.md` - QA progression checklist template

---

**Usage Examples:**
- "Audit this staging application for bugs and UX issues"
- "Generate test cases for the user registration flow"
- "Create a QA report for this e-commerce checkout process"
- "Explore this dashboard and identify accessibility problems"
