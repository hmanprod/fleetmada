# E2E Testing Checklist

## Coverage
- Critical user journeys are covered.
- Authentication and authorization flows are covered.
- Error/empty/loading states are verified.

## Reliability
- Stable selectors only.
- No fixed sleeps.
- Tests are isolated and repeatable.

## Maintainability
- Repeated flows extracted to page objects/commands/fixtures.
- Assertions are explicit and user-centric.
- Specs are grouped by domain or journey.

## CI Readiness
- Retries configured appropriately.
- Failure artifacts enabled.
- Parallel/sharded execution strategy documented.
