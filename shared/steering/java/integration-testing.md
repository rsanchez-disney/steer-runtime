---
inclusion: fileMatch
fileMatchPattern: ["**/*ITest.java", "**/*IT.java", "**/*IntegrationTest.java", "**/*Fixture.java", "**/*ContainerBase*.java", "**/*BaseITest*.java", "**/*Base*IntegrationTest*.java", "**/src/test/**/application*.properties", "**/src/test/**/application*.yml"]
description: Integration testing — Testcontainers, WireMock, H2, fixtures, domain events, base classes, ProblemDetail, jqwik
---

# Integration Testing

> **Related Rules**:
> - `spring/testing.mdc` — Test principles, naming, BDD Mockito, @Nested, @DisplayName, anti-patterns
> - `spring/database-configuration.mdc` — HikariCP and JPA settings
>
> **Related Skills** (code templates):
> - `dlp-create-integration-test-base` — Base classes, main endpoint ITest, fixtures, context test, domain event testing, ProblemDetail testing, properties
> - `dlp-create-test-container-base` — Testcontainers singleton infrastructure via `ApplicationContextInitializer` (MariaDB, Redis, RabbitMQ)
> - `dlp-add-archunit-tests` — ArchUnit architecture + conventions enforcement

---

## Integration Test Naming (DLP parent)

- Unit tests: `*UTest.java` → **Surefire** (`mvn test`)
- Integration tests: `*ITest.java` → **Failsafe** (`mvn verify`)
- CI / apply-spec / generation gate: always **`mvn verify`**, not `mvn test` alone

---

| Scenario | Tool | Why |
|----------|------|-----|
| Simple CRUD, standard SQL | **H2** | Faster, no Docker needed |
| Native SQL, stored procedures, JSON columns | **Testcontainers** | Real DB behavior |
| Redis caching tests | **Testcontainers** (Redis) | Real cache behavior |
| RabbitMQ messaging tests | **Testcontainers** (RabbitMQ) | Real broker behavior |
| External REST API calls | **WireMock** | Mock HTTP endpoints |
| Timeout/circuit breaker testing | **WireMock** (with delays/faults) | Simulate failures |

---

## Testcontainers Conventions

- Create shared base class (`DatabaseContainerBaseITest`, `FullStackContainerBaseITest`)
- Use `@DynamicPropertySource` to inject container connection details
- Use `withReuse(true)` for faster test runs
- Lock image versions (`mariadb:10.11`, not `latest`)
- Use Alpine variants when available (`redis:7-alpine`)
- Prefer singleton pattern (static block) for faster multi-test execution

---

## WireMock Conventions

- Use `@AutoConfigureWireMock(port = 0)` or `@RegisterExtension`
- Configure `@DynamicPropertySource` for gateway URLs
- Reset stubs in `@BeforeEach` for test isolation
- Test: happy path (200), errors (400, 404, 500), timeouts (`withFixedDelay`), faults (`CONNECTION_RESET_BY_PEER`)
- Verify requests: `wireMock.verify()`

---

## H2 Conventions

- Use for `@DataJpaTest` with standard CRUD, JPQL, pagination
- Use `MODE=MariaDB` for better compatibility
- Use `@TestPropertySource(properties = "spring.sql.init.mode=never")` when using `ddl-auto`

---

## Integration Test Base Classes (MANDATORY)

Two-level hierarchy (templates in skill `dlp-create-integration-test-base`):

| Class | Provides |
|-------|----------|
| `RestBaseIntegrationTest` | `@SpringBootTest(RANDOM_PORT)`, `@ActiveProfiles("integration")`, `TestRestTemplate`, `url()`, `jsonRequest()` |
| `WireMockBaseIntegrationTest` | Extends REST base + `@AutoConfigureWireMock(port=0)`, auto-reset, common stubs |

Key conventions:
- Base classes: `abstract`, `public`
- Profile: `"integration"` (not `"test"`)
- Disable security filters in properties
- Always reset WireMock in `@BeforeEach`

## Testcontainers Container Infrastructure

Use `ApplicationContextInitializer` (NOT inheritance) to inject container properties (template in skill `dlp-create-container-base`):

```java
@ContextConfiguration(initializers = ContainerPropertyInitializer.class)
public abstract class RestBaseIntegrationTest { ... }  // or any test class directly
```

- `ContainerPropertyInitializer` holds static containers + calls `TestPropertyValues.of(...).applyTo(ctx)`
- Composable: add to any base class or standalone test without forcing an inheritance chain
- Do NOT use `extends ContainerBaseITest` — no is-a relationship exists between a REST test and a container holder

---

## Application Context Verification Test (MANDATORY)

Every project must have a `*ApplicationContextITest` that:
- Verifies the Spring context loads
- Checks all key beans are wired, grouped by layer (`@Nested`: Domain, Use Cases, Infrastructure)

---

## Domain Event Integration Testing

When the project uses domain events, test with:
- Inner `@Component` + `@EventListener` to capture events
- `CountDownLatch` for async waiting (NOT `Thread.sleep()`)
- `Collections.synchronizedList()` for thread safety
- `@Import` to register the test listener
- Clear events in `@BeforeEach`

---

## Error Response Format Testing (RFC 7807)

Integration tests MUST verify error responses have ProblemDetail fields:
- `$.type`, `$.title`, `$.status`, `$.detail`, `$.instance`
- Correct HTTP status codes (400, 404, 409)

---

## Test Properties (`application-integration.properties`)

Must include:
- `server.port=0` (random port)
- `server.servlet.context-path` matching production
- WireMock health check URL: `http://localhost:${wiremock.server.port}/stub/healthcheck`
- H2 database config with `ddl-auto=create-drop`
- Disabled filters: authz, http-logging, boundary-logging
- `spring.cache.type=none`
- Reduced logging: `root=WARN`, project package=`DEBUG`
- **Vault secret overrides** for every `@Value("${...}")` secret key (envconsul in prod): at minimum `client.id` and `client.secret` when OAuth2 RestClient is enabled; add service-specific keys (`supermoon.api.key`, webhook secrets, PEM key properties, etc.)

> **Do not use `ConfigReader` for startup-static Vault keys** (`secret/`, `tech/env/` URLs/hosts) — use `@Value` so integration properties resolve without Vault. See `dlp-configure-mpropz` → *When to Use ConfigReader vs @Value*.

---

## Test Fixtures (MANDATORY)

| Convention | Example |
|------------|---------|
| Package | `fixtures/` |
| Domain fixture | `OrderFixture` — `activeOrder()`, `withId(long)`, `multipleOrders(int)` |
| JPA fixture | `OrderJpaFixture` — `activeOrderEntity()`, `withNameAndStatus(String, String)` |
| Class type | Utility class (private constructor, static factory methods) |

---

## Property-Based Testing with jqwik

Use for Value Objects and domain invariants:
- `@Property` instead of `@Test`
- `@ForAll` with constraints (`@Positive`, `@StringLength`)
- Custom `@Provide` methods for domain-specific generators
- Test invariants ("for all valid inputs, X holds"), not specific values

---

## Integration Test Anti-Patterns

| Anti-Pattern | What to look for | Why it's wrong |
|---|---|---|
| Testcontainers without reuse / pinned image | `latest` image or new container per class | Slow, flaky CI |
| `@ContextConfiguration` missing initializer | Containers not registered | Wrong datasource or random port |
| Hitting real external URLs in IT | Live third-party calls | Flaky; data pollution |
| No WireMock reset | Stubs leak between tests | Order-dependent failures |
| Auth filters enabled in IT | Same security as prod on `@SpringBootTest` | 401 noise; use integration profile |
| Missing Vault / env config overrides | Context load fails on `${client.id}`, API keys, or unresolved URLs | Add dummy values or WireMock URLs in `application-integration.properties` |
| `ConfigReader` for startup-static config | Secret/URL lookup via MPropZ instead of `@Value` | Use `@Value` for `secret/` and `tech/env/`; ConfigReader only for runtime-dynamic keys |

---

## Checklist

- [ ] Base class hierarchy: `RestBaseIntegrationTest` -> `WireMockBaseIntegrationTest`
- [ ] `application-integration.properties` (disabled filters, WireMock port, Vault secret overrides; H2 or Testcontainers datasource)
- [ ] Testcontainers: `ContainerPropertyInitializer` with `@ContextConfiguration` (NOT inheritance); images version-locked
- [ ] Application context verification test (`*ApplicationContextITest`)
- [ ] Testcontainers for native SQL / messaging (images version-locked)
- [ ] WireMock for external HTTP stubs (reset in `@BeforeEach`)
- [ ] Domain event tests with `CountDownLatch` (no `Thread.sleep`)
- [ ] Error response tests verify RFC 7807 ProblemDetail fields
- [ ] Fixtures in `fixtures/` package (domain + JPA, `*Fixture` suffix)
- [ ] Database reset in `@BeforeEach` for data isolation
- [ ] jqwik for Value Object invariant testing
