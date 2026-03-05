# Flaky Test Debugging

## Triage Workflow
1. Reproduce locally with repeated runs.
2. Check failure type: selector, timing, network, state leakage, environment.
3. Inspect artifacts (trace, screenshot, video, logs).
4. Minimize test to smallest failing path.
5. Fix root cause and re-run multiple times.

## Common Root Causes
- Ambiguous selectors matching multiple elements.
- UI assertions before async work settles.
- Shared mutable state across tests.
- Third-party API instability.
- Test-data collisions in parallel runs.

## Fix Patterns
- Replace brittle selectors with accessible locators or test IDs.
- Wait for observable state, not elapsed time.
- Isolate test data per run (unique IDs/emails).
- Mock unstable third-party dependencies.
- Harden cleanup and teardown paths.

## Exit Criteria
- 20+ consecutive local passes for the formerly flaky spec.
- No residual intermittent failure in CI over several runs.
