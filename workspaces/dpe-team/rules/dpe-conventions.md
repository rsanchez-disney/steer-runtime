# DPE Development Conventions

## GraphQL API

- All services expose GraphQL APIs (not REST, except Cache Service which uses CXF REST)
- Schema files live in `src/main/resources/graphql/`
- Use GraphiQL at `http://localhost:{port}/graphiql` for testing
- Max 10 products per pricing request
- Query timeout: 60 seconds
- Always validate schema backward compatibility — additive changes only
- Use parameterized GraphQL variables — never concatenate values into query strings, even for trusted input

## Calculator Rules

- Calculators MUST be stateless — never store state in calculator beans
- Calculators are cached for 60s (`dpe.calculator-bean-cache-ttl-millis`)
- Every calculator must declare an accurate DataContract for batch loading
- Bundle calculators require pre-calculated component prices (depth-first processing)
- Adjustment timing matters: before/after averaging or replication changes pricing fundamentally
- Always test time-machine scenarios when modifying calculator logic
- Freeze duration (30 min default) guarantees price stability for transactions

## Database

- Schema version must be validated on startup
- Never create past effective dates unless admin override toggle is enabled
- Use preprocessing window for change set validation
- Always consider impact on existing change sets when modifying schema
- HikariCP max 100 connections — monitor pool exhaustion
- Create migration scripts for all schema changes

## Caching

- Multi-level: EhCache (local) + Redis (distributed)
- ALWAYS invalidate cache when underlying data changes
- Cache keys follow patterns in CacheUtil
- Never cache time-machine query results (avoids cache pollution)
- Redis connection pooling: max 100 active connections

## Security

- All new endpoints require OAuth2 scope definitions
- Test with both JWT and opaque tokens
- Never commit credentials — use Vault or environment variables
- Use `@Auth` GraphQL directive for operation-level security
- Validate all GraphQL inputs in resolvers

## Method Design

- Prefer returning values over mutating passed-in collections (no side effects)
- Don't iterate a collection multiple times when once suffices — use an incrementing counter instead of pre-counting
- Don't collect into an intermediate list just to iterate it — pass items directly to the consumer
- Variable names must reflect the actual type — don't call something `Map` when it's a DTO

## Testing

- `mvn clean test` for unit tests (required before every PR)
- `mvn clean test jacoco:report` for coverage
- H2 in-memory database for data layer tests
- Test resources: `schema.sql` and `data.sql` in test resources
- Integration tests with Docker test containers (MySQL, Redis, DynamoDB)
- Always test error cases and edge cases for calculator logic
- Use resource files (`src/test/resources/test-data/`) for test data — not embedded multi-line strings
- Cover multi-item scenarios — don't only test single-item lists when a method processes collections
- Remove methods only called by tests — update tests to use the production API instead
- Include integration tests for scenarios where code changes may impact functionalities that have no obvious relation to the changed functionality (see `integration-test-cross-impact` rule)
- Validate that all Acceptance Criteria from the Jira ticket are reflected in the implementation and covered by tests (see `acceptance-criteria-validation` rule)

## Docker

- Non-root user: UID 1000, GID 3000
- Health check endpoint: `/{context-path}/healthcheck`
- Use `docker-compose-local.yml` for local dev
- `docker-compose.secure.yml` for HTTPS testing (port 8443)

## Logging

- Use wdpr-loggingapi for JSON structured logging (Splunk)
- Log all API requests with correlation IDs
- Log errors with full stack traces
- Use appropriate levels: DEBUG for dev, INFO for operations, WARN/ERROR for issues
- Never log sensitive data (tokens, credentials, PII)
- Don't log the same event at info level before AND after the action — one post-action info log is enough
- Guard `log.debug()` with `isDebugEnabled()` when building expensive payloads
- Include payload in error logs directly — don't rely on a separate debug log that won't be visible in prod

## Branch Naming

- Feature: `feat/PPODPE-{ticket}-{short-description}`
- Bugfix: `fix/PPODPE-{ticket}-{short-description}`
- Hotfix: `hotfix/PPODPE-{ticket}-{short-description}`

## PR Conventions

- One Jira ticket = one PR
- PR title: `PPODPE-{ticket}: {description}`
- Include BEFORE/AFTER for any behavioral change
- Run `mvn clean test` before submitting
- Minimal diff — don't refactor unrelated code

## Java 17 Conventions

All DPE services use Java 17. Code must follow modern Java idioms:

### Prefer

- `record` for immutable data carriers (DTOs, value objects) — not classes with Lombok `@Value`
- `sealed` interfaces/classes for closed type hierarchies (e.g., pipeline results, error types)
- Pattern matching with `instanceof` — no explicit cast after type check
- `switch` expressions (with `->` and `yield`) over `switch` statements
- `Stream.toList()` over `Collectors.toList()` (returns unmodifiable list)
- Text blocks (`"""`) for multi-line strings (SQL, JSON templates, GraphQL queries)
- `Optional` for return types that may be absent — never for fields or parameters
- `var` for local variables when the type is obvious from the right-hand side
- `List.of()`, `Map.of()`, `Set.of()` for immutable collections
- `Objects.requireNonNull()` at method entry for fail-fast validation

### Avoid

- Raw types (`List` instead of `List<String>`)
- `null` returns — use `Optional` or empty collections
- Mutable DTOs when immutability suffices — prefer records
- `instanceof` + cast on separate lines (use pattern matching)
- Anonymous inner classes where a lambda or method reference works
- `StringBuffer` — use `StringBuilder` (no thread contention in local scope)
- Checked exceptions for control flow — use unchecked + proper error handling
- Fully qualified class names inline — always use `import` statements and reference classes by simple name

### Review Checklist (Java 17)

When reviewing DPE PRs, flag:
- [ ] `instanceof` without pattern matching
- [ ] `switch` statements that could be expressions
- [ ] Mutable DTOs that should be records
- [ ] `Collectors.toList()` instead of `Stream.toList()`
- [ ] Multi-line strings not using text blocks
- [ ] Missing `var` where type is redundant
