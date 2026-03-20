# QA Guidelines

## Testing Principles
- Shift-left: test during development, not after
- Automate repetitive tests, keep exploratory testing manual
- Tests must be independent, repeatable, and self-contained
- Continuous testing in CI/CD pipeline

## Test Types
- Unit tests: individual functions, fast, high coverage (developer owned)
- Integration tests: component interactions, DB/API/service (shared ownership)
- E2E tests: complete user flows, UI + API + DB (QA owned)
- Regression tests: verify existing functionality on every release

## Automation Strategy
Automate: regression, smoke, API, data-driven, performance tests
Don't automate: one-time tests, exploratory, usability, frequently changing tests

## Defect Management
- Severity (technical impact) ≠ Priority (business urgency)
- Lifecycle: New → Assigned → In Progress → Fixed → Ready for Test → Verified → Closed
- Metrics: defect density, removal efficiency, MTTD, MTTR

## Quality Metrics
- Code coverage ≥90% for new code
- Automation coverage tracked per sprint
- Test execution time monitored
- Flaky tests fixed immediately

## Best Practices
- Descriptive test names explaining the scenario
- Test data factories instead of hardcoded values
- Meaningful assertions with clear failure messages
- Review test code like production code
