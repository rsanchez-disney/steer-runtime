---
inclusion: fileMatch
fileMatchPattern: ["**/*Test.java", "**/*UTest.java"]
description: Testing principles — pyramid, naming, FIRST, AAA, layers, AssertJ, BDD Mockito, @Nested, @DisplayName, anti-patterns, coverage
---

# Testing Guidelines

> **Related Rules**:
> - `spring/integration-testing.mdc` — Testcontainers, WireMock, H2, fixtures, jqwik (loaded for `*ITest`, `*IT`, `*Fixture` files)
> - `java/naming-conventions.mdc` — Baseline Java naming (methods, variables; this file covers test naming)
> - `java/clean-code.mdc` — Code quality and complexity
> - `dlp/hexagonal-architecture.mdc` — ArchUnit enforcement
>
> **Related Skills** (code templates):
> - `dlp-add-archunit-tests` — ArchUnit tests for architecture + conventions enforcement
> - `dlp-create-integration-test-base` — Integration test base classes, fixtures, domain event testing, ProblemDetail testing

## Test Pyramid Strategy

```
        ┌───────────┐
        │    E2E    │  ← Few (5-10%)    - Full system, real dependencies
        │   Tests   │     Slow, Expensive, Brittle
        ├───────────┤
        │Integration│  ← Some (15-25%) - Spring context, real DB
        │   Tests   │     Medium speed, Real boundaries
        ├───────────┤
        │   Unit    │  ← Many (70-80%) - No dependencies, fast
        │   Tests   │     Fast, Cheap, Reliable
        └───────────┘
```

---

## Naming Conventions

### File Naming (DLP Convention)

| Type | Suffix | Example |
|------|--------|---------|
| Unit Test | `*UTest.java` | `PaymentUTest.java` |
| Integration Test | `*ITest.java` | `PaymentApplicationITest.java` |
| Property Test | `*PropertyTest.java` | `OrderIdPropertyTest.java` |
| Fixture | `*Fixture.java` | `OrderFixture.java` |

> Standard alternative: `*Test.java` for unit tests, `*IT.java` for integration tests

### Method Naming: `methodName_condition_expectedResult`

Examples: `cancel_whenCreated_shouldSucceed`, `findById_whenNotFound_shouldReturnEmpty`

### `@DisplayName` (MANDATORY)

Every test class and method **MUST** have `@DisplayName`:
- Class: short component name (e.g., `"CreateOrderUseCaseHandler"`)
- Method: readable sentence (e.g., `"with valid name should create and save"`)

---

## FIRST Principles

| Principle | Meaning |
|-----------|---------|
| **F**ast | Run in milliseconds — no I/O, no Spring context |
| **I**ndependent | No shared state — each test can run alone |
| **R**epeatable | Same result every time — no random data |
| **S**elf-validating | Pass or fail clearly — assertions, not print |
| **T**imely | Written before/with code |

---

## AAA / Given-When-Then Pattern

- Use `// Given` / `// When` / `// Then` comments (or `// Arrange` / `// Act` / `// Assert`)
- ONE action per test
- ONE logical assertion concept per test
- Blank lines between sections

---

## BDD-Style Mockito (MANDATORY)

| Do | Don't |
|----|-------|
| `given(repo.findById(1L)).willReturn(...)` | `when(repo.findById(1L)).thenReturn(...)` |
| `willThrow(...).given(service).method()` | `doThrow(...).when(service).method()` |
| `verify(repo).save(any())` | — |
| `verify(repo, never()).save(any())` | — |
| `verifyNoInteractions(service)` | — |

---

## `@Nested` Test Structuring (MANDATORY)

Group related tests using `@Nested` inner classes:

| Component | Group by |
|-----------|----------|
| Domain entities | Operation: constructor, cancel, activate, equality |
| Use cases | Scenario: success, validation failure, not found |
| Controllers | HTTP endpoint: `GET /v1/orders`, `POST /v1/orders` |
| Value Objects | Category: Valid names, Invalid names, Equality |

---

## `@MockitoBean` vs `@MockBean`

| Spring Boot 3.4+ | Before 3.4 |
|-------------------|------------|
| `@MockitoBean` (from `spring-test`) | `@MockBean` (deprecated) |

---

## Test Types by Layer

| Layer | Test Type | What to Mock |
|-------|-----------|--------------|
| **Domain / Model** | Unit (`*UTest`) | Nothing — pure logic |
| **Service / Use Case** | Unit (`*UTest`) | Repository, external ports |
| **Controller** | `@WebMvcTest` | Use case interfaces |
| **Repository** | `@DataJpaTest` | Nothing — test queries |
| **Integration** | `@SpringBootTest` | External services only |

---

## AssertJ Rules

| Do | Don't |
|----|-------|
| `isNull()`, `isTrue()`, `isEmpty()`, `hasSize(n)` | `isEqualTo(null)`, `isEqualTo(true)` |
| `assertThatThrownBy(...).isInstanceOf(X.class)` | `assertThatThrownBy(...)` alone (no type check) |
| `assertThat(x).as("desc").isEqualTo(y)` | `assertThat(x).isEqualTo(y).as("desc")` |

---

## Value Object Testing (MANDATORY for DLP)

Test Value Objects with `@Nested` (Valid/Invalid/Equality) + `@ParameterizedTest`:
- Valid: boundary values (min, max length), allowed chars, trimming
- Invalid: `@NullAndEmptySource` + `@ValueSource` for blank/reserved/invalid chars/too short/too long
- Equality: same value equal, different not equal, toString contract

---

## Constructor Validation Testing

For classes with required dependencies (controllers, adapters): test each null-arg throws `NullPointerException` with descriptive message.

---

## Parameterized Tests

| Source | Use When |
|--------|----------|
| `@ValueSource(strings = {...})` | One input, same assertion |
| `@NullAndEmptySource` | Null and empty string |
| `@CsvSource({"input, expected"})` | Input/output pairs |
| `@MethodSource("provider")` | Complex objects |
| `@EnumSource(Status.class)` | All enum values |

---

## Testing Anti-Patterns

| Anti-Pattern | Solution |
|--------------|----------|
| Test with no assertions | Add meaningful assertions |
| Excessive mocking | Test real objects where possible |
| Flaky tests | Remove randomness, fix race conditions |
| Test interdependence | Make tests self-contained |
| Testing implementation | Test observable behavior |
| Copy-paste tests | Use `@ParameterizedTest` |
| `@SpringBootTest` for pure unit logic | Use JUnit 5 + Mockito without context |
| Shared mutable static test data | Instance fields or `@BeforeEach` reset |
| Mock-only tests (no behavior check) | Assert return values / state, not only `verify` |
| `Thread.sleep` for timing | `Awaitility`, `CountDownLatch`, or virtual time |
| Secrets or prod URLs in test config | WireMock, Testcontainers, or dummy values |
| JUnit 4 `@RunWith` in new tests | JUnit Jupiter + Spring extension |

---

## Test Coverage Goals

| Layer | Target | Priority |
|-------|--------|----------|
| Domain / Model | 90%+ | Critical |
| Value Objects | 95%+ | Critical |
| Services / Use Cases | 90%+ | Critical |
| Controllers | 80%+ | High |
| Persistence / Adapters | 70%+ | Medium |

**Coverage is a metric, not a goal.** Focus on testing behavior, not lines.

---

## Checklist

- [ ] Test naming: `*UTest` for unit, `*ITest` for integration
- [ ] `@DisplayName` on every test class and method
- [ ] `@Nested` for grouping related tests
- [ ] BDD Mockito: `given/willReturn` (not `when/thenReturn`)
- [ ] `@MockitoBean` (not deprecated `@MockBean`) in Spring Boot 3.4+
- [ ] Unit tests use Mockito, not Spring context
- [ ] AssertJ for assertions (not JUnit `assertEquals`)
- [ ] `@ParameterizedTest` for Value Object validation
- [ ] No `Thread.sleep()` — use `CountDownLatch` or `Awaitility`
- [ ] Constructor validation tested for required dependencies
- [ ] ArchUnit tests enforce architecture and naming — **only if hexagonal architecture** (skill: `dlp-add-archunit-tests`)
- [ ] Integration test infrastructure — **only if hexagonal architecture** (skill: `dlp-create-integration-test-base`)
