---
inclusion: fileMatch
fileMatchPattern: ["**/*Service.java", "**/*ServiceImpl.java", "**/*UseCaseHandler.java", "**/*Handler.java", "**/*Config.java", "**/*Configuration.java", "**/*Properties.java", "**/*Entity.java", "**/*Jpa.java", "**/*Repository.java", "**/*Adapter.java", "**/*PersistenceAdapter.java", "**/application*.properties", "**/application*.yml"]
description: Core Spring Boot conventions - DI, transactions, configuration, JPA, anti-patterns
---

# Spring Core Conventions

> **Related Rules**:
> - `spring/rest-api.mdc` — REST API design: endpoints, DTOs, pagination, versioning, documentation, CORS
> - `spring/spring-infrastructure.mdc` — Health indicators, AOP, servlet filters, caching, mappers
> - `spring/spring-batch.mdc` — Spring Batch job/step configuration, chunk processing, error handling
> - `spring/database-configuration.mdc` — HikariCP and JPA settings
> - `dlp/hexagonal-architecture.mdc` — Package structure (hexagonal projects only)
> - `dlp/logging-wdpr.mdc` — WDPR logging (DLP projects)
> - `dlp/exception-handling.mdc` — Foundation exceptions (DLP projects)
> - `dlp/foundation-usage.mdc` — Foundation libraries (DLP projects)
> - `resilience/resilience-overview.mdc` — Resilience patterns for external calls

---

## Dependency Injection

### Always Use Constructor Injection

- Use constructor injection with `final` fields -- single constructor auto-wires (no `@Autowired` needed)
- Use `Objects.requireNonNull()` in constructors for fail-fast validation

> **Severity**: Field injection (`@Autowired` on fields) is a best practice violation (Medium), NOT a security issue.

### Bean Registration via @Configuration

```java
@Configuration
public class ServiceConfiguration {
    @Bean
    public PaymentService paymentService(
            PaymentRepository repo, EventPublisher publisher) {
        return new PaymentService(repo, publisher);
    }
}
```

> For hexagonal architecture bean registration (DomainConfiguration), see `dlp/hexagonal-architecture.mdc`

---

## REST API

> See `spring/rest-api.mdc` for the complete REST API rule: endpoints, DTOs, pagination, filtering,
> versioning, idempotency, CORS, HTTP caching, file handling, Swagger/OpenAPI documentation.

---

## Data Layer Quick Reference

- Entity: `@Entity @Table(name = "...")` class with business key equals/hashCode (see JPA section below)
- Repository: extend `JpaRepository<Entity, ID>` -- Spring Data handles CRUD

> For hexagonal persistence adapters (entity <-> domain mapping), see `dlp/hexagonal-architecture.mdc`

---

## Configuration

### Application Properties Pattern

```yaml
server:
  servlet.context-path: /api
  port: ${SERVER_PORT:8080}

spring:
  datasource:
    url: ${DATABASE_URL}
    hikari:
      maximum-pool-size: ${DB_POOL_SIZE:20}
  jpa:
    hibernate.ddl-auto: validate
    open-in-view: false  # Always disable OSIV
# See database-configuration.mdc for detailed pool sizing and tuning
```

### Type-Safe Properties

**MANDATORY: Use `@ConfigurationProperties` with `@Validated` for all service configuration.** Avoid scattered `@Value` annotations.
**Exception:** `@Value` is acceptable for individual Vault-injected secrets — see `dlp/security-pii.mdc`.

```java
@ConfigurationProperties(prefix = "app.payment")
@Validated
public record PaymentProperties(
    @DefaultValue("100") int maxNameLength,
    @DefaultValue("PT1H") Duration cacheTtl,
    @Valid RetryConfig retry
) {
    public record RetryConfig(
        @DefaultValue("3") int maxAttempts,
        @DefaultValue("PT1S") Duration delay
    ) {}
}
```

Key conventions:
- Use records for immutable config or classes with `@Validated` for mutable
- Add `@Min`, `@Max`, `@NotBlank` validation on properties
- Support nested configuration with inner records/classes
- Enable with `@ConfigurationPropertiesScan` or `@EnableConfigurationProperties`
- Externalize secrets via environment variables or a secret manager

---

## Logging

> See `dlp/logging-wdpr.mdc` for WDPR logging standards (Log4j2 mandatory, parameterized logging, no PII).

---

## Exception Handling

> See `dlp/exception-handling.mdc` for the complete exception handling strategy.
> Extend Foundation's `AbstractProblemDetailExceptionHandler` — do NOT create a standalone `@RestControllerAdvice`.
> Skill: `dlp-create-exception-handler`

---

## Security

> See `dlp/security-pii.mdc` for PII protection checklist and `java/security.mdc` for OWASP guidelines.

---

## @Transactional Best Practices

```java
// ❌ @Transactional on private method — proxy can't intercept, SILENTLY IGNORED
@Transactional private void doWork() { }

// ❌ @Transactional on controller — too broad, holds connection during entire request
@Transactional @PostMapping public ResponseEntity<?> create() { }

// ❌ External call inside transaction — holds DB connection during HTTP call
@Transactional
public void process() { save(entity); callExternalApi(); }
```

### @Transactional Rules

| Rule | Guideline |
|------|-----------|
| Placement | Persistence adapter (hexagonal) or service layer (layered) — never controller or handler. Domain stays framework-free. No DB = no transaction. |
| Read-only | Always use `readOnly = true` for queries |
| Scope | Keep transactions short — no external HTTP/API calls inside |
| Private methods | Never annotate `private` methods (proxy bypass) |
| Self-invocation | Call via injected proxy, not `this` (see Proxy Gotcha below) |
| Propagation | Use `REQUIRED` (default) unless you need `REQUIRES_NEW` for independent tx |
| Rollback | Spring rolls back on unchecked exceptions by default; use `rollbackFor` for checked |

### Data Integrity Checklist

- [ ] Write endpoints (`POST`/`PUT`) are **idempotent** if retryable (→ see `rest-api.mdc` Idempotency section for `Idempotency-Key` pattern)
- [ ] `@Version` on JPA entities with concurrent updates for **optimistic locking** (if JPA is used)
- [ ] Transaction propagation **explicit** when calling between services (`REQUIRES_NEW` vs `REQUIRED` — inner rollback effect understood)
- [ ] No **business logic after `@Transactional` commit boundary** (side effects outside transaction may see stale data)

---

## Spring Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| Field injection | Hidden dependencies | Constructor injection |
| `@Autowired` on constructor | Unnecessary | Single constructor auto-wires |
| Business logic in controller | SRP violation | Move to service layer |
| JPA entity as DTO | Tight coupling | Separate DTOs |
| `@Transactional` on domain models/ports/services | Framework leak in domain layer | Only on persistence adapters (infrastructure) |
| OSIV enabled | Lazy loading issues | `open-in-view: false` |
| Calling via `this` | Proxy bypassed | Inject and call via proxy |

---

## Proxy Method Gotcha

```java
// ❌ WRONG - Proxy bypassed
@Service
public class MyService {
    public void process() {
        doAsync();  // @Async won't work via 'this'
    }
    @Async public void doAsync() { }
}

// ✅ CORRECT - Use injected proxy for self-invocation
// Note: Self-injection is an accepted exception to the constructor injection rule
// (constructor self-injection causes a circular dependency)
@Service
public class MyService {
    @Resource private MyService self;  // jakarta.annotation.Resource (Spring Boot 3.x)
    
    public void process() {
        self.doAsync();  // Works via proxy
    }
    @Async public void doAsync() { }
}
```

## JPA Entity equals / hashCode

```java
// ❌ WRONG: Using auto-generated ID in equals/hashCode
@Override
public boolean equals(Object o) {
    return this.id != null && this.id.equals(((Payment) o).id);
    // Fails for transient (unsaved) entities!
}

// ✅ CORRECT: Use business key (natural identifier)
@Entity
public class PaymentEntity {
    @Id @GeneratedValue private Long id;
    @Column(unique = true) private String referenceNumber;  // business key

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PaymentEntity that)) return false;
        return referenceNumber != null && referenceNumber.equals(that.referenceNumber);
    }

    @Override
    public int hashCode() {
        return Objects.hash(referenceNumber);
    }
}
```

- JPA `toString`: only include eagerly loaded fields -- never lazy-loaded collections (`LazyInitializationException`)
- Records: auto-generated `equals`/`hashCode`/`toString` -- safe since no JPA lazy fields

---

## Spring Core Anti-Patterns

| Anti-Pattern | What to look for | Why it's wrong |
|---|---|---|
| Field injection | `@Autowired` on fields | Harder to test; mutable dependencies |
| God controller | Business rules, transactions, or repository calls in `@RestController` | Wrong layer; untestable web layer |
| `@Transactional` on repository interface | `@Transactional` on `JpaRepository` | Wrong boundary; prefer service/use-case |
| Public `@Transactional` self-invocation | Internal call bypasses proxy | Transaction does not apply |
| Missing propagation for nested calls | Default `REQUIRED` assumed for all cross-service calls | Wrong isolation when partial commit needed |
| Idempotent write without safeguard | POST retry from client/gateway without idempotency key | Duplicate rows |
| Optimistic lock ignored | `@Version` present but `OptimisticLockException` not handled | Lost updates surfaced as 500 |

---

## Checklist

- [ ] Constructor injection only (no `@Autowired` on fields)
- [ ] `@ConfigurationProperties` for grouped config (not many `@Value`)
- [ ] `@Transactional` on persistence adapters (hexagonal) or service methods (layered), not handlers, controllers, or repositories interfaces
- [ ] No business logic in controllers
- [ ] JPA entity `equals`/`hashCode` use business keys, not generated IDs
- [ ] REST API conventions followed (see `spring/rest-api.mdc`)
- [ ] Write endpoints are idempotent if retryable
- [ ] `@Version` on JPA entities with concurrent updates
- [ ] Transaction propagation explicit when calling between services
