---
inclusion: fileMatch
fileMatchPattern: ["**/*.java"]
description: >
---

# Modern Java Features

> **Related Rules**: `java/naming-conventions.mdc`, `java/clean-code.mdc`, `dlp/exception-handling.mdc`

---

## Feature Decision Guide

| Need | Feature | Java Version |
|------|---------|--------------|
| Immutable data carrier | **Records** | 16+ |
| Type checking | **Pattern Matching** | 16+ (instanceof), 21+ (switch) |
| Closed type hierarchy | **Sealed Classes** | 17+ |
| Multiline strings | **Text Blocks** | 15+ |
| Multi-way branching | **Switch Expressions** | 14+ |
| Destructuring | **Record Patterns** | 21+ |
| Unused variables | **Unnamed `_`** | 22+ |

---

## Records (Java 16+)

**Use for**: DTOs, Value Objects, Commands, Events

```java
// Simple
public record Person(String name, int age) {}

// With validation
public record PaymentId(long value) {
    public PaymentId {
        if (value <= 0) throw new IllegalArgumentException("Must be positive");
    }
}
```

**Rules**:
- Use compact constructor for validation
- Override equals/hashCode if contains arrays
- Use factory methods for complex creation

**Tip**: Use records for DTOs and Value Objects (typed IDs, Money, Email, etc.)

---

## Pattern Matching (Java 16+)

**Use for**: Type checks, multi-branch dispatch, destructuring

```java
// instanceof (Java 16+)
if (obj instanceof String s && !s.isEmpty()) {
    return s.toUpperCase();
}

// switch with types (Java 21+)
return switch (obj) {
    case String s when s.isEmpty() -> "empty";
    case String s -> "string: " + s;
    case Integer i -> "int: " + i;
    default -> "unknown";
};
```

**Rules**:
- Use pattern matching instead of instanceof + cast
- Use `when` guards instead of if inside case body
- Prefer switch over long if-else chains

**Tip**: Combine with sealed classes for exhaustive handling

---

## Sealed Classes (Java 17+)

**Use for**: Domain states, exceptions, commands, events

```java
public sealed interface PaymentStatus {
    record Pending(Instant at) implements PaymentStatus {}
    record Completed(String txId) implements PaymentStatus {}
    record Failed(String reason) implements PaymentStatus {}
}

// Exhaustive switch - compiler verifies all cases
String msg = switch (status) {
    case Pending p -> "Waiting...";
    case Completed c -> "Done: " + c.txId();
    case Failed f -> "Error: " + f.reason();
};
```

**Rules**:
- Omit `permits` when subtypes in same file
- Use records as subtypes when possible
- Leverage exhaustive switch (no default needed)

**Tip**: Consider sealed interfaces for domain exceptions when the hierarchy is well-defined (skill: `dlp-create-exception-handler`)

---

## Text Blocks (Java 15+)

**Use for**: SQL, JSON, HTML, multiline strings

```java
String sql = """
    SELECT id, name
    FROM users
    WHERE status = 'ACTIVE'
    """;

String json = """
    {"name": "%s", "age": %d}
    """.formatted(name, age);
```

**Rules**:
- Use consistent indentation (tabs OR spaces, not mixed)
- Don't use escape sequences (\n) inside text blocks

---

## Switch Expressions (Java 14+)

**Use for**: Multi-way branching that returns a value

```java
// Arrow syntax (preferred)
String type = switch (code) {
    case 200, 201 -> "Success";
    case 400, 404 -> "Client Error";
    case 500 -> "Server Error";
    default -> "Unknown";
};

// With yield for complex logic
String msg = switch (day) {
    case MONDAY -> {
        log.info("Week started");
        yield "Monday blues";
    }
    default -> "Regular day";
};
```

**Rules**:
- Use arrow labels (no fall-through)
- Use `yield` in blocks, not `return`
- Prefer expression form over statement form

---

## Java 21+ Features Quick Reference

| Feature | Example |
|---------|---------|
| Record patterns | `case Point(int x, int y) ->` |
| Switch guards | `case String s when s.isEmpty() ->` |
| Reversed view | `list.reversed().forEach(...)` |
| Math.clamp | `Math.clamp(value, min, max)` |

---

## Java 22+ Features Quick Reference

| Feature | Example |
|---------|---------|
| Unnamed variables | `catch (Exception _)` |
| Unnamed in lambda | `list.forEach(_ -> count++)` |
| Unnamed in for | `for (var _ : list) doSomething();` |

---

## Restricted Identifiers - Don't Use As Names

```java
// ❌ These are restricted - don't use as variable names
var var = "bad";      // 'var' is restricted
int yield = 10;       // 'yield' is restricted  
String record = "x";  // 'record' is restricted
boolean sealed = true; // 'sealed' is restricted
```

---

## Modern Java Anti-Patterns

| Anti-Pattern | What to look for | Why it's wrong |
|---|---|---|
| Record with mutable component | `List`/`array` exposed without defensive copy | Immutability broken |
| Non-exhaustive switch on sealed type | Missing permitted subtype case | Compiler error or logic gap |
| Preview features without CI flag | `--enable-preview` only locally | Pipeline fails |
| Over-nested record patterns | Hard-to-read `instanceof` chains | Subtle binding bugs |

---

## Checklist

- [ ] Records for immutable data (DTOs, Value Objects)
- [ ] Pattern matching instead of instanceof + cast
- [ ] Switch expressions instead of switch statements
- [ ] Sealed classes for closed hierarchies
- [ ] Text blocks for multiline strings
- [ ] Restricted identifiers not used as variable names
