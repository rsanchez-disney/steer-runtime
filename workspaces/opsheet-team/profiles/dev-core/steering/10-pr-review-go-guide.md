---
inclusion: manual
---

# PR Review Guide — OpSheet+ Go Services

## Purpose

Codified review criteria for Go microservices in the OpSheet+ core backend. Use this when reviewing any PR in Go repositories.

---

## 1. PR Metadata Checks

### Branch Naming

Expected: `{type}/OPS-{number}` or `{type}/OPS-{number}-{short-description}`

Types: `feat`, `fix`, `refactor`, `test`, `chore`, `docs`, `perf`

Flag:
- `feature/` instead of `feat/`
- Missing ticket number
- Inconsistent separators

### Commit / PR Title

Expected: `{type}: OPS-{number} - {description}`

Flag:
- Brackets around ticket: `[OPS-XXXXX]` → should be `OPS-XXXXX`
- Title type doesn't match actual change
- Missing ticket number

### PR Description

Must include:
- What changed and why
- Pre-submission check screenshots (build, test, cover, lint)
- Related Jira tickets

### Checklist Compliance

All boxes in the PR template should be explicitly checked/unchecked. Flag:
- Unchecked checklists left as default
- Missing coverage/lint screenshots

---

## 2. Architecture Compliance

### Clean Architecture

Flag:
- Controllers importing from `core/` implementations (should use interfaces)
- Business logic in controllers (should be in services)
- Services importing from `http/` package
- Repository logic in services (should be in repository layer)
- Concrete types in `core/` interfaces (e.g., `*gin.Context` instead of `context.Context`)

### Dependency Flow

```
cmd/main.go → app/ (bootstrap)
               ├→ core/ (interfaces)
               ├→ http/ (controllers, routes)
               └→ models/ (domain types)
```

Flag violations:
- `core/` importing from `http/` or `app/`
- `models/` importing from any other internal package
- Circular dependencies between packages

### Monorepo Boundaries

For monorepo services, flag:
- App-specific code in `shared/`
- Direct imports between app packages (e.g., `api/` importing from `process/`)
- Shared code that only one app uses

---

## 3. Code Quality

### Redundant Logic

Flag conditions and branches that are logically unnecessary or duplicate existing checks.

**Redundant boolean comparisons:**
```go
// ❌ comparing bool to literal
if isActive == true { ... }
if isActive == false { ... }

// ✅
if isActive { ... }
if !isActive { ... }
```

**Unnecessary else after return:**
```go
// ❌ else is unreachable — if already returns
if err != nil {
    return err
} else {
    doSomething()
}

// ✅
if err != nil {
    return err
}
doSomething()
```

**Duplicate conditions in if/else-if chains:**
```go
// ❌ second branch can never be reached
if status == "open" {
    handleOpen()
} else if status == "open" {
    handleOpenAgain()
}
```

**Both branches return the same value:**
```go
// ❌
if !found {
    return defaultValue
} else {
    return defaultValue
}

// ✅
return defaultValue
```

**Unnecessary nil guard before a nil-safe operation:**
```go
// ❌ len() on nil slice is 0 — guard is redundant
if items != nil && len(items) > 0 { ... }

// ✅
if len(items) > 0 { ... }
```

**Redundant assignment before unconditional overwrite:**
```go
// ❌ initial value is never read
result := ""
result = computeResult()
```

**Pointer compared as if it were a value:**
```go
// ❌ compares addresses, not the underlying values
var a, b *string
if a == b { ... }

if user1 == user2 { ... }

// ✅ nil-guard then dereference for scalars
if a != nil && b != nil && *a == *b { ... }

// ✅ use reflect.DeepEqual for structs with unexported fields
if reflect.DeepEqual(user1, user2) { ... }
```

---

### Error Handling

Flag:
- Ignored errors (`_, _ := ...` or `_ = fn()`)
- Missing error wrapping (bare `return err` without context)
- `panic` for recoverable errors
- Error strings starting with uppercase or ending with punctuation

### Interface Design

Flag:
- Interfaces with too many methods (>5 suggests splitting)
- Interfaces defined where implemented instead of where consumed
- `I` prefix on interfaces (`IService` → `Service`)

### Naming

Flag:
- Non-idiomatic Go names (camelCase files, `I` prefix interfaces)
- Stuttering: `counts.CountsService` → `counts.Service`
- Unexported types that should be exported (or vice versa)

### Import Ordering

Must follow gci convention:
1. Standard library
2. Third-party
3. Disney organization prefix
4. Local module

Flag: unordered imports (should run `make format-imports`)

---

## 4. Testing

### Coverage

- Minimum 75% enforced
- Flag PRs that decrease coverage without justification

### Test Quality

Flag:
- Missing error case tests
- Tests without assertions
- Tests that don't use table-driven pattern for multiple cases
- Mocks not regenerated after interface changes
- `mock.Anything` overuse when specific values should be asserted
- Missing `t` parameter in mock constructors
- service method, controller method, repository method without any tests

### Mock Usage

Flag:
- Mocks imported in production code
- Hand-written mocks when mockery should be used
- Stale mocks (interface changed but mocks not regenerated)

---

## 5. Security

Flag immediately:
- Hardcoded secrets, tokens, API keys
- Logging of PII, tokens, or sensitive data
- Missing input validation on API endpoints
- SQL injection vectors (string concatenation in queries)
- Disabled TLS verification

---

## 6. Performance

Flag:
- Unbounded goroutine creation without limits
- Missing context cancellation/timeout
- N+1 query patterns
- Large allocations in hot paths (use `sync.Pool` or pre-allocate)
- Missing `defer` for resource cleanup (connections, files)

**Unbounded goroutine creation:**
```go
// ❌ spawns one goroutine per item — no limit, no error collection
for _, item := range items {
    go process(item)
}
```

**Bounded with `errgroup.SetLimit`:**
```go
// ✅ limits concurrency and collects the first error
import "golang.org/x/sync/errgroup"

g, ctx := errgroup.WithContext(ctx)
g.SetLimit(10)

for _, item := range items {
    item := item // capture loop var
    g.Go(func() error {
        return process(ctx, item)
    })
}

if err := g.Wait(); err != nil {
    return err
}
```

---

## 7. Quick Checklist for Reviewers

```
[ ] Branch name follows {type}/OPS-{number} format
[ ] Title follows {type}: OPS-{number} - {description} format
[ ] Description explains what and why
[ ] Pre-submission checks completed (build, test, cover, lint)
[ ] Clean Architecture respected (dependency flow correct)
[ ] All errors handled explicitly (no ignored errors)
[ ] Error messages wrapped with context
[ ] Interfaces defined in core/, implementations in outer layers
[ ] Import ordering follows gci convention
[ ] Tests added/updated (table-driven preferred)
[ ] Coverage ≥75%
[ ] Mocks regenerated if interfaces changed
[ ] No secrets in code or logs
[ ] No PII logged
[ ] TODOs have owner + ticket (OPS-XXXXX)
```
