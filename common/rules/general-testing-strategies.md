# Testing Strategies

## Test Pyramid
- **Unit tests** (70%) — fast, isolated, test single functions/methods
- **Integration tests** (20%) — test component interactions, database, APIs
- **E2E tests** (10%) — test critical user flows end-to-end

## Unit Tests
- Test one thing per test — single assertion focus
- Use descriptive names: `should_returnError_when_inputIsNull`
- Follow Arrange-Act-Assert (AAA) pattern
- Mock external dependencies
- Aim for ≥90% coverage on new code

## Integration Tests
- Test real database interactions (use test containers or in-memory DB)
- Test API endpoints with real HTTP calls
- Test message queue producers/consumers
- Use fixtures for repeatable test data

## Test Quality
- Tests should be deterministic — no flaky tests
- Tests should be independent — no shared mutable state
- Tests should be fast — unit tests < 1s, integration < 10s
- Tests should document behavior — readable as specifications

## What NOT to Test
- Framework internals (Spring, Express, Angular)
- Simple getters/setters with no logic
- Third-party library behavior
- Generated code
