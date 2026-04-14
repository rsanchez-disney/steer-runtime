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

## TODOs

New TODOs must include owner and ticket:

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
