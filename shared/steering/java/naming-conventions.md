---
inclusion: always
description: >
---

# Java Naming Conventions (Baseline)

> **Comments inside code examples** (section labels, “Avoid: …”) are **documentation only**. **Application code does not need** to copy those lines. What you must apply is each **`Requirement:`** paragraph in plain prose.

> Pointers to other rule files are in the **Scope** section below (single table — avoids repeating the same links in multiple places).

---

## Scope (no duplicate content elsewhere)

This file owns **Java identifier baseline** (casing, abbreviations, common method prefixes, locals/constants) plus **high-level** comment/Javadoc clarity. **Do not re-copy** the detailed rules in the files below — only **point** to them:

| Topic | Authoritative location |
|-------|-------------------------|
| Type **suffixes**, packages, ArchUnit naming | `dlp/hexagonal-architecture.mdc` |
| **HTTP** paths, spinal-case URLs, resource design | `spring/rest-api.mdc` |
| `*UTest` / `*ITest`, `@DisplayName`, BDD test method names | `spring/testing.mdc` |
| Serialized names for **masking / PII** (full guidance) | `dlp/security-pii.mdc`, skill `dlp-add-masking` |
| Method **size**, complexity, imports, dead code, concurrency | `java/clean-code.mdc` |
| Records, pattern matching, sealed types | `java/modern-java.mdc` (identifiers still follow this file) |

**Overlap that is OK:** `clean-code` may say “simplify, improve names” or “extract to **named** method” — that is **refactoring**, not a second copy of casing or prefix rules.

---

## Java standard casing and abbreviations

**Requirement (casing):** Use **Java’s usual identifier shapes**: **`camelCase`** for methods, parameters, local variables, and **instance fields** (including `final` instance fields); **`PascalCase`** for types (classes, interfaces, enums, records). Layer-specific type names (*Controller*, *Request*, *UseCaseHandler*, …) still follow **`dlp/hexagonal-architecture.mdc`**. Use **`UPPER_SNAKE_CASE`** for **`static final`** constants.

**Requirement (abbreviations):** Names should **describe purpose**. **Avoid abbreviations** unless they are **widely recognized** (e.g. `URL`, `HTML`, `HTTP`, `ID` inside a compound name like `guestId`). Do **not** use opaque truncations (`oid`, `cid`, `sts`).

---

## Method naming

**Requirement:** Name methods so callers can infer behavior — queries use `find` / `get` / `exists` / `count`; commands use `save` / `delete` / `create` / `cancel`; booleans use `is` / `has` / `can`.

```java
// Query methods — find, get, exists, count
Optional<Order> findById(OrderId id);
List<Order> findByStatus(OrderStatus status);
List<Order> findAll();
boolean existsById(OrderId id);

// Command methods — save, delete, create, cancel
Order save(Order order);
void delete(OrderId id);
Order create(CreateOrderCommand command);
Order cancel(OrderId id);

// Boolean methods — is, has, can
boolean isActive();
boolean hasItems();
boolean canBeCancelled();
```

Prefer intention-revealing names for **factories, mappers, validators** (`toResponse`, `validateRequest`, `build`) — same spirit as above; see `java/clean-code.mdc` for method size and structure.

---

## Variable and parameter naming

**Requirement:** Use **meaningful, intention-revealing** names for locals, parameters, and fields you introduce. **Do not** use cryptic abbreviations (`oid`, `cid`, `sts` for `orderId`, `customerId`, `currentStatus`).

```java
OrderId orderId;
CustomerId customerId;
List<OrderItem> orderItems;
OrderStatus currentStatus;
// Avoid: oid, cid, sts
```

- **Constants** (`static final`): `UPPER_SNAKE_CASE` (see **Java standard casing** above).
- **Loop indices**: `i`, `j`, `k` only in very short loops; otherwise use a real name (`index`, `rowIndex`, `user`).
- **Lambdas / streams**: prefer a named method reference or a clear parameter (`user` not `u`) when the block is non-trivial.

---

## Comments and Javadoc

**Requirement:** Same clarity standard as names — explain **why** or non-obvious constraints; avoid cryptic abbreviations in prose; define acronyms on first use when helpful. Javadoc on public API: complete sentences; `@param` / `@return` must add real context (not bare `dto`, `result`). Not compiler-enforced.

### Domain layer Javadoc (mandatory where valuable)

**Requirement:** Add Javadoc on domain-layer classes and methods where the business intent, invariants, or side effects are not obvious from the signature alone. Skip it when the method name + parameters already communicate everything.

| Element | Javadoc? | Rationale |
|---------|----------|-----------|
| Use case interfaces (inbound ports) | **Yes** | Describe the business operation, preconditions, domain errors thrown |
| Use case handlers (implementations) | **Yes** (class-level) | Explain orchestration steps, side effects (events published, notifications sent) |
| Domain services | **Yes** | Explain business rules enforced, invariants maintained |
| Domain events | **Yes** | What triggers them, who consumes them, payload semantics |
| Complex value objects | **Yes** | Explain the domain concept they represent |
| Entity getters/setters | **No** | Signature is self-documenting |
| Trivial repository port methods (`findById`, `save`) | **No** | The signature says it all |
| Controllers that delegate to a use case | **No** | OpenAPI annotations serve as documentation |

**Style:**
- Lead with a single sentence describing the business action (not the technical mechanism)
- Use `@param` only when the parameter name is ambiguous or has constraints (e.g., `@param amount must be positive, in cents`)
- Use `@throws` for domain exceptions that callers should handle
- Keep Javadoc concise — 1–3 sentences maximum for methods; a short paragraph for class-level

---

## Serialized names (logs, APIs, masking)

For JSON/XML/logging/masking matchers, the name that matters is the **serialized** form (`@JsonProperty`, `@JacksonXmlProperty(localName = ...)`), not necessarily the Java field name. See `dlp/security-pii.mdc` and skill `dlp-add-masking`.
