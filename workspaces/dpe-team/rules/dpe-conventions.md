# DPE Development Conventions

## GraphQL API

- All services expose GraphQL APIs (not REST, except Cache Service which uses CXF REST)
- Schema files live in `src/main/resources/graphql/`
- Use GraphiQL at `http://localhost:{port}/graphiql` for testing
- Max 10 products per pricing request
- Query timeout: 60 seconds
- Always validate schema backward compatibility — additive changes only

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

## Testing

- `mvn clean test` for unit tests (required before every PR)
- `mvn clean test jacoco:report` for coverage
- H2 in-memory database for data layer tests
- Test resources: `schema.sql` and `data.sql` in test resources
- Integration tests with Docker test containers (MySQL, Redis, DynamoDB)
- Always test error cases and edge cases for calculator logic

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
