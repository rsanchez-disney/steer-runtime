# Testing & Code Review Standards

## Coverage Requirements
- ≥90% for all new code
- Unit tests for all new methods
- Integration tests for new endpoints
- E2E tests for critical user flows
- Tests must cover error cases and edge cases

## Test Commands
- Java/Maven: `mvn test`, `mvn jacoco:report`
- Java/Gradle: `./gradlew test jacocoTestReport`
- Node/Jest: `npm test -- <file>`, `npm run test:coverage`
- Angular: `ng test --code-coverage`
- Go: `go test ./...`, `go test -cover`
- Flutter: `flutter test`

## Test Patterns
- Tests should be independent — no shared mutable state
- Each test sets up its own data and cleans up after
- Use descriptive test names that explain the scenario
- Use test data factories, not hardcoded values
- Fix flaky tests immediately

## Code Review Checklist

### Security (CRITICAL — blocks PR)
- No hardcoded secrets, API keys, passwords
- No SQL injection (use parameterized queries)
- No XSS (sanitize user input)
- Authentication/authorization on all endpoints
- No path traversal or command injection

### Quality (WARNING)
- Follows existing codebase patterns
- No code duplication (DRY)
- Functions <50 lines, <3 nesting levels
- No magic numbers (extract to constants)
- Proper error handling in all paths

### Performance (WARNING)
- No N+1 queries
- Caching for expensive operations
- No unbounded loops/recursion
- No memory leaks (clean up listeners)
- No blocking operations in async code
