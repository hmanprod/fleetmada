---
name: product-qa-auditor
description: Automated web application exploration and QA auditing using agent-browser. Detects functional bugs, UX issues, generates structured test cases, and produces actionable QA reports. Use when you need to audit web applications, detect anomalies, generate test suites, or create QA progression reports for staging/sandbox environments.
---

# Product QA Auditor

## Overview

Automates web application exploration and quality assurance auditing using agent-browser integration. This skill enables systematic detection of functional bugs, UX inconsistencies, and generates comprehensive test artifacts for QA teams.

## Core Capabilities

### 1. Automated Web Application Exploration
- Navigate web applications starting from entry URL
- Interact with UI elements (buttons, forms, menus)
- Capture contextual summaries of each screen
- Build comprehensive navigation trees

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

→ **Full Application Audit**: Use complete exploration workflow
→ **Targeted Feature Audit**: Focus on specific workflows/pages
→ **Regression Testing**: Generate tests for existing functionality
→ **UX Review**: Focus on user experience evaluation

## Complete Exploration Workflow

### Step 1: Initialize Exploration
```
agent-browser open <URL>
agent-browser snapshot
```

Capture initial state and identify interactive elements.

### Step 2: Systematic Navigation
- Identify all clickable elements and forms
- Create exploration queue prioritizing critical paths
- Document each interaction and resulting state
- Capture errors and unexpected behaviors

### Step 3: Analysis & Detection
- Compare behaviors against PRD requirements
- Apply UX heuristics to each screen
- Identify anomalies and inconsistencies
- Document findings with context

### Step 4: Test Generation
- Convert observations into structured test cases
- Create regression suites for critical paths
- Generate QA progression checklist
- Format outputs for team consumption

## Agent-Browser Integration

### Essential Commands
```bash
agent-browser open <URL>           # Load application
agent-browser snapshot             # Capture current state
agent-browser click @e<ID>         # Interact with elements
agent-browser fill @e<ID> "value"  # Fill form fields
```

### Navigation Strategy
1. **Breadth-first exploration**: Cover all accessible pages
2. **Interaction mapping**: Document all user flows
3. **State capture**: Snapshot before/after interactions
4. **Error handling**: Capture and analyze error states

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

### Exploration Report Structure
```json
{
  "screens": [
    {
      "url": "https://example.com/login",
      "actions": ["snapshot", "fill email", "fill password", "click login-button"],
      "errors": [],
      "uxObservations": ["placeholder missing on password field"]
    }
  ],
  "anomalies": ["Login button disabled after correct inputs (unexpected)"],
  "testCasesGenerated": [
    {
      "id": "TC-LOGIN-001",
      "description": "Valid login flow",
      "steps": ["Navigate to login", "Enter credentials", "Click login"],
      "expectedResults": ["User successfully logged in", "Redirected to dashboard"]
    }
  ],
  "qaProgress": {
    "identifyWhatToTest": true,
    "selectTestType": true,
    "writeTests": true,
    "runTests": false,
    "coverageCheck": false,
    "fixTests": false
  }
}
```

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

This skill includes specialized resources for QA automation:

### scripts/
- `exploration_engine.py` - Core navigation and interaction logic
- `ux_analyzer.py` - UX heuristics evaluation engine
- `test_generator.py` - Structured test case generation
- `report_formatter.py` - JSON/Markdown report generation

### references/
- `ux_heuristics.md` - Comprehensive UX evaluation criteria
- `test_templates.md` - Standardized test case formats
- `agent_browser_guide.md` - Detailed agent-browser usage patterns
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
