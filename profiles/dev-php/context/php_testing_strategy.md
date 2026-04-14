# PHP Testing Strategy

## Framework
- PHPUnit as the test framework
- `phpunit.xml.dist` at project root

## Test Organization
- Mirror `src/` structure under `test/`
- Service tests: unit tests with mocked dependencies
- Controller tests: dispatch requests, assert status codes and response content
- Form/InputFilter tests: validate input filtering and validation rules

## Coverage Expectations
- Services: success path, validation failure, dependency failure
- Controllers: happy path, invalid input, not found
- Use data providers for parameterized scenarios

## Practices
- Strict mocking — no unnecessary mock allowances
- Independent tests — no shared state between test methods
- Deterministic — no reliance on external services or databases in unit tests
- Use `setUp()` for common test fixtures
