# Cypress Best Practices

## Purpose
Apply these guidelines to keep Cypress tests deterministic and easy to debug.

## Authoring Guidelines
- Use custom commands for repeated flows (`cy.login`, `cy.seedUser`, etc.).
- Prefer `data-cy` selectors for long-term stability.
- Keep tests independent and idempotent.
- Control network behavior with `cy.intercept` for deterministic flows.
- Avoid mixing too many assertions in one test; focus on one intent.

## Stability Patterns
- Use aliases with `cy.wait('@alias')` for expected request timing.
- Minimize hard waits (`cy.wait(1000)`); use conditions instead.
- Reset state between tests (`beforeEach` setup).
- Use API helpers to prepare state instead of brittle UI-only setup.

## Debugging
- Capture screenshots/videos for failures in CI.
- Validate intercepted payloads for flaky backend-driven issues.
- Re-run failing specs with headed mode for visual diagnosis.
