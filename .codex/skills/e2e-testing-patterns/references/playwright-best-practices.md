# Playwright Best Practices

## Purpose
Use these patterns when authoring or reviewing Playwright E2E tests for reliability and maintainability.

## Core Practices
- Prefer semantic locators: `getByRole`, `getByLabel`, `getByText`.
- Reserve `data-testid` for elements without reliable accessible names.
- Avoid CSS and DOM-structure selectors except as a last resort.
- Use explicit assertions (`expect(...)`) instead of manual polling.
- Keep each test isolated; no inter-test ordering dependencies.
- Use fixtures for setup/teardown and test data lifecycle.
- Keep retries only for transient failures, and fix root flakiness.

## Waiting and Synchronization
- Never use `waitForTimeout` for readiness.
- Wait on user-visible conditions or stable network events.
- Use `Promise.all` when triggering an action and waiting for its effect.

## CI and Observability
- Enable trace on retry and screenshots/videos on failure.
- Preserve artifacts in CI for debugging and triage.
- Split slow specs and run shards in parallel when suite grows.

## Minimal Quality Checklist
- Uses stable locators.
- No fixed sleeps.
- Has clear assertions for user-visible outcomes.
- Handles test data cleanup.
- Produces debug artifacts on failure.
