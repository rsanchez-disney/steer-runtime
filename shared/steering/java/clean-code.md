---
inclusion: fileMatch
fileMatchPattern: ["**/*.java"]
description: Clean Code principles - functions, imports, code smells, complexity, concurrency, breaking change remediation (naming baseline in naming-conventions.mdc)
---

# Clean Code Guidelines

> **Related Rules**:
> - `java/naming-conventions.mdc` - **Always-on** baseline: method, variable, constant naming; pointers to class/REST/test naming
> - `dlp/hexagonal-architecture.mdc` - Class naming + ArchUnit naming rules (hexagonal projects)
> - `java/modern-java.mdc` - Records, Pattern Matching, Sealed Classes
> - `dlp/exception-handling.mdc` - Exception handling, Foundation approach

---

## Naming (methods & variables)

Method, parameter, local variable, and constant naming are defined in **`java/naming-conventions.mdc`** (`alwaysApply: true`). Class-, REST-, and test-level naming pointers live there too; this file focuses on structure, hygiene, and complexity.

---

## Null Safety Quick Reference

| Scenario | Use |
|----------|-----|
| Might not find value | `Optional<T>` |
| Operation can fail | Throw specific exception |
| Constructor params | `Objects.requireNonNull()` |
| Collections | Return empty, never null |

> See `dlp/exception-handling.mdc` for Foundation exception types, `java/modern-java.mdc` for records and sealed interfaces

---

## Functions Quick Reference

| Rule | Guideline |
|------|-----------|
| Size | 5-20 lines, extract if longer |
| Parameters | Max 3-4, use parameter object |
| Purpose | ONE thing (SRP) |
| Abstraction | Single level per function |

```java
// ✅ Clean method: validate, execute, convert
public PaymentResponse createPayment(CreatePaymentRequest request) {
    validateRequest(request);
    checkNoDuplicates(request);
    Payment payment = createDomainPayment(request);
    Payment saved = saveAndPublish(payment);
    return toResponse(saved);
}
```

> See `dlp/exception-handling.mdc` for Foundation exception types to use in validation/domain errors

---

## Streams Quick Reference

- Prefer `toList()` (Java 16+, immutable) over `collect(Collectors.toList())`
- Prefer method references (`Payment::getName`) over lambdas
- Extract complex lambdas to named methods (`this::isEligibleForProcessing`)

---

## Code Smells Quick Reference

| Smell | Detection | Fix |
|-------|-----------|-----|
| Long Method | > 20 lines | Extract methods |
| Large Class | > 200 lines | Split responsibilities |
| Long Parameter List | > 3 params | Use parameter object |
| Primitive Obsession | String for ID | Create Value Object |
| Feature Envy | Uses other class's data | Move method |
| Magic Numbers | Literal values | Named constants |
| Code Duplication | Same logic 2+ times | Extract to method |
| Deep Nesting | > 2-3 levels | Early return, extract method |
| God Class | Does too many things | Split by responsibility |
| Dead Code | Unused methods/variables | Delete it |
| Commented-Out Code | Old code left in comments | Delete it (use git history) |

---

## Import Management - MANDATORY

- No wildcard imports (`import java.util.*` is never acceptable)
- Remove ALL unused imports before every commit
- Use IDE "Optimize Imports" (Ctrl+Alt+O)

---

## Code Simplification - MANDATORY

### DRY: Extract Duplication Immediately

When the same logic pattern appears 2+ times, extract to a helper method immediately. Don't wait for a third occurrence.

### Simplification Guidelines

| Situation | Action |
|-----------|--------|
| Same logic 2+ times | Extract immediately (DRY) |
| Complex conditionals | Extract to method |
| Hard to understand | Simplify, improve names (identifier rules: `java/naming-conventions.mdc`) |
| Unused abstraction | Remove it (YAGNI) |

---

## Dead Code & Commented Code - MANDATORY

Delete all dead code — git history preserves old versions:
- Unused methods, variables, classes, and parameters
- Commented-out code (use `git blame`/`git log` if needed later)
- Unused imports (see Import Management above)
- Empty catch blocks (add explicit comment if intentional)
- TODO/FIXME without a ticket reference

**Review severity for clarity-only findings:** When the only suggested change is to **add a comment** to explain correct behavior (no bug, no logic change), report as **LOW** (documentation/clarity), not MEDIUM. Example: "Add comment explaining why error count is logged only on response."

---

## Code Complexity - MANDATORY

### Avoid Deep Nesting (Arrow Anti-Pattern)

```java
// ❌ Nested > 2-3 levels (null check → validation → loop → condition)
// ✅ Fix: guard clause early return + stream with extracted method
public void process(Order order) {
    if (order == null || !order.isValid()) return;
    order.getItems().stream()
        .filter(Item::isAvailable)
        .forEach(this::processItem);
}
```

### Complexity Guidelines

| Rule | Threshold | Action |
|------|-----------|--------|
| Nesting depth | Max 2-3 levels | Early return, extract methods |
| Cyclomatic complexity | Max 10 per method | Split into smaller methods |
| Method lines | Max 20 lines | Extract helper methods |
| Class lines | Max 200-300 lines | Split responsibilities |
| Boolean expressions | Max 2-3 conditions | Extract to named method |

---

## Composition Over Inheritance

- Prefer composition (`has-a`) over inheritance (`is-a`) — use interfaces + delegation instead of abstract base classes
- Exception: sealed class hierarchies for type-safe domain modeling are fine (see `java/modern-java.mdc`)

---

## Breaking Change Remediation

When changing **public or protected** methods, interfaces, or classes consumed by other code (services, libraries, ports), apply these remediation strategies so reviewers can recommend them when flagging breaking changes:

| Situation | Remediation guidance |
|-----------|----------------------|
| **Method signature change** (params, return type) | Prefer **add overload** — keep old method, add new one; or **deprecate** old method with `@Deprecated` and `@deprecated` Javadoc including removal version. |
| **Removing a public method or class** | **Deprecate first** — add `@Deprecated`, document removal in next major; remove only in a major version bump. |
| **Shared library / multi-consumer module** | **Bump major version** per semantic versioning; document migration path in release notes and Javadoc. |
| **Interface contract change** (e.g. `Optional` → `null`, exception type) | Add new method or overload; deprecate old; document migration for consumers. |
| **Constants or enum values removed/renamed** | Deprecate first; provide replacement constant/enum; remove in next major. |

**When reporting a breaking change in review:** Include in **Suggested Fix** or **Why This Matters** at least one of: (a) add overload for backward compatibility, (b) deprecate with removal version, (c) bump major version (shared libs), (d) document migration path for consumers.

> REST API breaking changes (URLs, request/response contracts) → see `spring/rest-api.mdc` API Versioning and Deprecation.

---

## Optional Anti-Patterns

- Never use `Optional` as a method parameter -- use overloading or `@Nullable`
- Never use `Optional` for collections -- return empty collection instead
- Never call `Optional.get()` without check -- use `orElse()` / `orElseThrow()` / `map()`
- Always chain: `findById(id).orElseThrow(() -> new NotFoundException(...))` or `.map(this::transform).orElse(default)`

---

## equals / hashCode / toString

- Override `equals`/`hashCode` using **business keys**, not auto-generated IDs (especially for JPA entities)
- Records: auto-generated `equals`/`hashCode`/`toString` -- prefer records for DTOs and value objects
- JPA `toString`: only include eagerly loaded fields -- never lazy-loaded collections

> See `spring/spring-core.mdc` for JPA entity equals/hashCode patterns

---

## Immutability Beyond Records

- Make fields `final` wherever possible
- Return `Collections.unmodifiableList()` or `List.copyOf()` -- never expose mutable internal collections
- Prefer records for DTOs and value objects (see `java/modern-java.mdc`)

---

## Concurrency Essentials

### Thread Safety Quick Reference

| Need | Use | Avoid |
|------|-----|-------|
| Counter | `AtomicInteger`, `AtomicLong` | `int++` on shared field |
| Thread-safe map | `ConcurrentHashMap` | `synchronized HashMap` |
| Visibility flag | `volatile boolean` | Plain `boolean` field |
| Shared immutable data | `final` fields, records | Mutable shared state |
| Parallel work | `CompletableFuture`, virtual threads | Raw `Thread` creation |
| Scheduled tasks | `@Scheduled` + `ScheduledExecutorService` | `Timer` / `TimerTask` |

**Rules:**
- Prefer immutable objects (records, final fields) — they're inherently thread-safe
- Never share mutable state between threads without synchronization
- Use `@Async` or `CompletableFuture` for async work — don't create raw threads
- Use virtual threads (Java 21+) for I/O-bound concurrent tasks

### Spring Concurrency Pitfalls

- [ ] No **mutable fields in singleton Spring beans** (`@Service`/`@Component` with non-final fields modified at runtime = race condition)
- [ ] **Severity for singleton mutability**: Field set **only once at startup** (e.g. by an auto-configurer setter, no dynamic reconfig) → report as **MEDIUM** (prefer constructor injection). **HIGH** only when there is a realistic race (e.g. field modified by multiple threads after construction, or config reload at runtime).
- [ ] **Storing a reference to caller-owned collection** (e.g. `Set`/`List` in constructor without defensive copy): report as **MEDIUM** (recommend `Set.copyOf()` / defensive copy). **HIGH** only if there is evidence of concurrent modification in the same process.
- [ ] No **non-thread-safe classes shared across threads** (`SimpleDateFormat`, `HashMap` — use `DateTimeFormatter`, `ConcurrentHashMap`)
- [ ] `@Async` / `CompletableFuture` chains have **timeout** (`orTimeout()` or `completeOnTimeout()` — no indefinite blocking)
- [ ] Collections modified concurrently use **concurrent types** (`ConcurrentHashMap`, `CopyOnWriteArrayList`)
- [ ] Thread pools have **bounded queue + rejection policy** (not unbounded `LinkedBlockingQueue`)
- [ ] `synchronized` scope **minimized** (critical section only, not entire method)

---

## Regex Correctness

- **Compile once** — `private static final Pattern` (never `String.matches()` in loops — recompiles every call)
- **Boundary assertions** — no contradictory anchors (`^$abc`, `$abc` — pattern after `$` never matches)
- **Lookaheads** — no contradictions (`(?=a)b` — can't be both `a` and `b`)
- **Back references** — reference valid groups only (`\2` requires group 2 to exist, defined before the reference)
- **Possessive quantifiers** — don't make patterns unmatchable (`a{2,}+a` — possessive consumes all, trailing `a` never matches)
- **Unicode** — use `Pattern.CANON_EQ` for accented characters, `\p{L}` for Unicode letters
- **Alternatives** — no redundant branches (`a|a`), use character classes for single-char alternation (`[abc]` not `a|b|c`)

> ReDoS prevention (nested quantifiers, input length limiting) is a security concern — see `java/security.mdc`.

---

## Build Verification Checklist

Before every commit:

- [ ] All tests pass (`mvn test`)
- [ ] No new warnings in IDE
- [ ] No unused imports
- [ ] No wildcard imports
- [ ] No dead code (unused methods, variables, classes)
- [ ] No commented-out code
- [ ] No code duplication
- [ ] No deep nesting (> 2-3 levels)
- [ ] No TODO without ticket reference
- [ ] No secrets in logs
- [ ] Specific exceptions thrown (see `dlp/exception-handling.mdc` for Foundation types)
- [ ] Fields are `final` where possible
