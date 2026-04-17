---
inclusion: fileMatch
fileMatchPattern: ["**/*.go", "go.mod"]
description: Go code patterns — error handling, DI, interfaces, naming, and conventions
---

# OpSheet+ Go — Code Patterns & Conventions

## Error Handling

Always return and check errors explicitly. Never ignore them.

```go
// ✅ Correct
result, err := service.Process(ctx, input)
if err != nil {
    return fmt.Errorf("process failed for entity %s: %w", entityID, err)
}

// ❌ Wrong — silent failure
result, _ := service.Process(ctx, input)
```

### Error wrapping

Use `fmt.Errorf` with `%w` to wrap errors with context:

```go
if err != nil {
    return fmt.Errorf("fetch counts for entity %s: %w", entityID, err)
}
```

### Collecting multiple errors

Use `errors.Join` (Go 1.20+) when you need to accumulate several independent errors and return them all at once — common in validation, batch processing, and multi-step teardown:

```go
// ✅ Validation — collect all failures before returning
func validateInput(input *models.CountsInput) error {
    var errs []error
    if input.EntityID == "" {
        errs = append(errs, errors.New("entityID is required"))
    }
    if input.Count < 0 {
        errs = append(errs, errors.New("count must be non-negative"))
    }
    return errors.Join(errs...)
}

// ✅ Batch processing — continue on failure, report all errors
func (s *Service) ProcessBatch(ctx context.Context, items []models.Item) error {
    var errs []error
    for _, item := range items {
        if err := s.process(ctx, item); err != nil {
            errs = append(errs, fmt.Errorf("item %s: %w", item.ID, err))
        }
    }
    return errors.Join(errs...)
}

// ✅ Teardown — close multiple resources, capture all failures
func (s *Service) Close() error {
    return errors.Join(s.db.Close(), s.cache.Close())
}
```

`errors.Join` returns `nil` when all values are `nil`, so callers can check `err != nil` as usual. Each wrapped error remains individually inspectable via `errors.Is` / `errors.As`.

```go
// ❌ Wrong — only the last error survives
var lastErr error
for _, item := range items {
    if err := s.process(ctx, item); err != nil {
        lastErr = err // previous errors are lost
    }
}
return lastErr
```

### Custom errors

Define domain errors in `core/` or `models/`:

```go
var (
    ErrEntityNotFound = errors.New("entity not found")
    ErrUnauthorized   = errors.New("unauthorized")
)
```

## Dependency Injection

Wire all dependencies in `internal/app/` bootstrap. Use constructor injection.

```go
// internal/app/app.go
func NewApp(cfg *Config) *App {
    repo := repository.NewCountsRepo(cfg.DB)
    svc := service.NewCountsService(repo)
    ctrl := controller.NewCountsController(svc)
    router := routes.NewRouter(ctrl)
    return &App{Router: router}
}
```

## Interface Design

Define interfaces in `core/` where they are consumed, not where they are implemented.

```go
// internal/core/services/counts_service.go
type CountsService interface {
    GetByEntity(ctx context.Context, entityID string) (*models.Counts, error)
    Update(ctx context.Context, input *models.CountsInput) error
}
```

Keep interfaces small and focused (Interface Segregation).

## Naming Conventions

- **Files:** snake_case (`counts_service.go`, `counts_service_test.go`)
- **Packages:** lowercase, single word when possible (`core`, `models`, `http`)
- **Interfaces:** no `I` prefix — use the noun (`CountsService`, not `ICountsService`)
- **Constructors:** `New{Type}` (`NewCountsService`)
- **Test functions:** `Test{Function}_{Scenario}` or table-driven with subtests

## Import Ordering

Enforced via `gci` (run `make format-imports`):

```go
import (
    // 1. Standard library
    "context"
    "fmt"

    // 2. Third-party
    "github.com/gin-gonic/gin"

    // 3. Disney internal (organization prefix)
    "github.disney.com/wdpr-parkops-opsheet-suite/http-go/v2"
    "github.disney.com/wdpr-parkops-opsheet-suite/secrets-go/v3"

    // 4. Local module
    "github.disney.com/wdpr-parkops-opsheet-suite/counts-service-go/internal/core"
    "github.disney.com/wdpr-parkops-opsheet-suite/counts-service-go/internal/models"
)
```

## Struct Tags

Use `json` tags on all model fields. Follow snake_case for JSON:

```go
type Entity struct {
    ID        string `json:"id"`
    Name      string `json:"name"`
    CreatedAt string `json:"created_at"`
}
```

## Context Propagation

Always pass `context.Context` as the first parameter. Never store it in a struct.

```go
// ✅ Correct
func (s *Service) Process(ctx context.Context, input Input) error { ... }

// ❌ Wrong
func (s *Service) Process(input Input) error { ... } // missing context
```

## Logging

Use structured logging via `logger-go`. Never log PII, tokens, or secrets.

```go
logger.Info("processing entity", "entityID", entityID, "action", "update")
logger.Error("failed to process", "entityID", entityID, "error", err)
```

## Concurrency

### Parallelize independent queries

When a handler or service needs results from multiple independent data sources, fetch them concurrently with `errgroup` instead of sequentially.

```go
// ❌ Sequential — total latency = A + B + C
entity, err := s.repo.GetEntity(ctx, id)
if err != nil {
    return nil, err
}
schedule, err := s.repo.GetSchedule(ctx, id)
if err != nil {
    return nil, err
}
waitTimes, err := s.repo.GetWaitTimes(ctx, id)
if err != nil {
    return nil, err
}

// ✅ Parallel — total latency = max(A, B, C)
var (
    entity    *models.Entity
    schedule  *models.Schedule
    waitTimes []models.WaitTime
)

g, ctx := errgroup.WithContext(ctx)

g.Go(func() (err error) {
    entity, err = s.repo.GetEntity(ctx, id)
    return
})
g.Go(func() (err error) {
    schedule, err = s.repo.GetSchedule(ctx, id)
    return
})
g.Go(func() (err error) {
    waitTimes, err = s.repo.GetWaitTimes(ctx, id)
    return
})

if err := g.Wait(); err != nil {
    return nil, err
}
```

Apply this pattern whenever:
- Queries hit different tables or services
- Results are not inputs to each other
- Latency matters (user-facing endpoints)


### Channels 
Use channels to communicate data or signals between goroutines. Keep ownership clear: one goroutine writes, one reads.

```go
// ✅ Fan-out: dispatch work, collect results
func fetchAll(ctx context.Context, ids []string) ([]Result, error) {
    results := make(chan Result, len(ids))

    for _, id := range ids {
        go func() {
            r, err := fetch(ctx, id)
            if err != nil {
                results <- Result{Err: err}
                return
            }
            results <- r
        }()
    }

    out := make([]Result, 0, len(ids))
    for range ids {
        out = append(out, <-results)
    }
    return out, nil
}

// ✅ Done signal — unblock a waiting goroutine
done := make(chan struct{})
go func() {
    doWork()
    close(done)
}()
<-done

// ❌ Wrong — unbuffered channel with no receiver causes goroutine leak
go func() {
    result <- compute() // blocks forever if nobody reads
}()
```

Rules:
- Buffer channels when the sender must not block (`make(chan T, n)`)
- Close channels from the **sender** side only, never the receiver
- Use `select` with a `ctx.Done()` case to respect cancellation
- Prefer `close(done)` over sending a value for pure signals

### errgroup over WaitGroup

Prefer `golang.org/x/sync/errgroup` over `sync.WaitGroup` whenever goroutines can return errors. It propagates the first error, cancels the shared context, and eliminates the boilerplate of a separate error channel.

```go
// ✅ Preferred — errgroup with context cancellation
import "golang.org/x/sync/errgroup"

func (s *Service) ProcessAll(ctx context.Context, items []models.Item) error {
    g, ctx := errgroup.WithContext(ctx)

    for _, item := range items {
        item := item // capture loop var (pre-Go 1.22)
        g.Go(func() error {
            return s.process(ctx, item)
        })
    }

    return g.Wait() // returns first non-nil error; all goroutines finish
}

// ❌ Avoid — WaitGroup requires a separate error channel and manual wiring
var wg sync.WaitGroup
errc := make(chan error, len(items))
for _, item := range items {
    wg.Add(1)
    go func(item models.Item) {
        defer wg.Done()
        if err := s.process(ctx, item); err != nil {
            errc <- err
        }
    }(item)
}
wg.Wait()
close(errc)
// still need to drain errc...
```

Use `sync.WaitGroup` only when goroutines do not return errors

# New TODOs must include owner and ticket:

```go
// TODO(OPS-XXXXX): description of what needs to be done
```

## Do Not

- Do not use `init()` for dependency wiring — use explicit bootstrap in `app/`
- Do not use global variables for service instances
- Do not import from `mocks/` in production code
- Do not use `interface{}` or `any` when a concrete type is known
- Do not log sensitive data at any level
- Do not use `panic` for recoverable errors
