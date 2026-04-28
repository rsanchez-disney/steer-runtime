# Java + Spring Boot Conventions

## Code Style

- Google Java Style Guide or project-specific style
- Organize by feature or layer (`controller`, `service`, `repository`, `dto`, `model`, `config`)
- Prefer immutability — use `final` fields, unmodifiable collections
- Document public APIs with Javadoc
- Format with project formatter (`mvn formatter:format` or IDE settings)

## Method Contracts

- Never return `null` — use `Optional`, empty collections, or throw exceptions
- If `null` is accepted/returned, document it in Javadoc
- Don't pre-initialize variables assigned from multiple paths — let the compiler enforce

## Null Handling

Null checks only when a value could reasonably be null:
- External input (API, file, network)
- Methods that explicitly document null returns

No defensive null checks on internal methods that should never return null.

## Exception Handling

- Wrap checked exceptions in domain-specific runtime exceptions
- Always pass the original exception as `cause`
- Handle runtime exceptions at controller level with `@ControllerAdvice`
- Never swallow exceptions silently
- Use problem-detail format (RFC 7807) for error responses

## Spring Boot Specifics (version-adaptive)

- **1.5.x–2.x**: `javax.persistence`, `javax.validation`
- **3.x+**: `jakarta.persistence`, `jakarta.validation`
- Constructor injection — never `@Autowired` on fields (all versions)
- `@ConfigurationProperties` with `@Validated` for typed config (2.x+)
- `@Valid` on all `@RequestBody` parameters (all versions)
- Return DTOs from controllers — never JPA entities (all versions)
- Use `@Transactional` on service methods that modify data (all versions)
- `@ControllerAdvice` for global exception handling (all versions)

## REST API Design

- Resource-oriented URLs: `/api/v1/{resource}`
- HTTP methods: GET (read), POST (create), PUT (full update), PATCH (partial), DELETE
- Pagination: `page`, `size`, `sort` parameters on list endpoints
- Consistent error response format across all endpoints
- API versioning in URL path

## Data Access

- Spring Data JPA repositories
- Use `@EntityGraph` or `JOIN FETCH` to avoid N+1 queries
- Always paginate list queries
- Parameterized queries only — never string concatenation
- Flyway or Liquibase for schema migrations

## Logging

- SLF4J + Logback (Spring Boot default)
- `LoggerFactory.getLogger(ClassName.class)`
- Structured JSON in production
- Correlation IDs via MDC
- Never log passwords, tokens, PII, or full request/response bodies

## Testing (MANDATORY)

Unit tests are required for every code change. No exceptions.

- JUnit 5 + Mockito for unit tests (JUnit 4 acceptable for legacy Spring Boot 1.5 projects)
- `@SpringBootTest` + `@Transactional` for integration tests
- Test naming: `{ClassName}Test.java`
- AssertJ `assertThat` over JUnit assertions
- Cover happy path + error cases + edge cases
- Target: ≥80% line coverage
- Bug fixes must include a regression test

## Dependency Management

- Maven with `spring-boot-starter-parent` BOM
- Pin versions — no SNAPSHOT in main/release branches
- Verify with `mvn clean verify`
- Remove unused dependencies regularly

## Security

- Spring Security for authentication/authorization
- Input validation on all endpoints (`@Valid`, `@NotNull`, `@Size`, etc.)
- CORS configured explicitly — never `allowAll` in production
- No secrets in code, properties, or logs
- Use environment variables or secrets manager for credentials
