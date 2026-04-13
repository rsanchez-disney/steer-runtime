---
inclusion: fileMatch
fileMatchPattern: ["**/*.go", "go.mod", "go.sum", "Makefile", "Dockerfile", "ECS.Dockerfile", "serverless.yml"]
description: Clean Architecture patterns and dependency flow for OpSheet+ Go services
---

# OpSheet+ Go — Architecture & Code Patterns

## What are these projects?

OpSheet+ core backend is a suite of Go microservices that power real-time operational data for theme park entities. They handle counts, wait times, alerts, dispatch intervals, occupancy, scheduling, and reporting. Services are deployed as AWS Lambda functions and/or ECS containers.

**All services follow Clean Architecture** with strict dependency flow from outer to inner layers.

## Project Categories

### 1. API Services (single-service repos)

Standard layout:

```
cmd/api/main.go              # Entry point
internal/
  app/                       # DI bootstrap, wire dependencies
  core/                      # Interfaces (repositories, services)
  http/
    controllers/v1/          # HTTP handlers (Gin)
    routes/                  # Route registration
    middleware/              # Custom middleware
  models/                    # Domain models
  shared/                    # Shared utilities (optional)
mocks/                       # Auto-generated mocks (mockery)
scripts/                     # Build/coverage scripts
```

Examples: `counts-service-go`, `admin-service-go`, `translation-service-go`, `wait-time-service-go`, `ops-data-import-go`, `authz-service`

### 2. Monorepo Services (multiple apps in one repo)

```
cmd/
  api/main.go                # API app entry
  process/main.go            # Processor app entry
  scheduler/main.go          # Scheduler app entry
internal/
  api/                       # API-specific layers (app, http, core)
  process/                   # Processor-specific layers
  scheduler/                 # Scheduler-specific layers
  shared/                    # Shared across all apps
    core/
      models/
      repositories/
      services/
    utils/
mocks/
```

Examples: `alerts-monorepo-go`, `wait-times-monorepo-go`

### 3. Event Processors / Lambdas

Single-purpose consumers (Kinesis, Kafka, SQS):

```
cmd/api/main.go              # Entry point (Lambda handler)
internal/
  app/                       # Bootstrap + consumer wiring
  core/                      # Processing logic, interfaces
  models/                    # Event/message models
```

Examples: `opsheet-process-dispatch`, `opsheet-process-system-event`, `counts-summarization-go`, `push-to-reporting-go`

### 4. Shared Libraries

Flat or minimal structure, versioned modules:

```
module github.disney.com/wdpr-parkops-opsheet-suite/{lib-name}/v{N}

├── {lib}.go
├── {lib}_test.go
└── go.mod
```

Examples: `http-go/v2`, `secrets-go/v3`, `kafka-utils-go/v2`, `async-go`, `graph-utils-go/v3`, `container-utils-go`, `rabbitmq-utils-go`, `summarization-utils-go/v2`, `test-utils-go`

## Dependency Flow

```
cmd/main.go
  └─→ internal/app/          (bootstrap: wires everything)
        ├─→ internal/core/    (interfaces: repos, services)
        ├─→ internal/http/    (controllers call services via interfaces)
        └─→ internal/models/  (shared domain types)
```

### Key Rules

- `core/` defines interfaces only — no implementations
- `http/controllers/` depend on `core/` interfaces, never on concrete implementations
- `app/` is the only place where concrete types are wired to interfaces
- `models/` has zero dependencies on other internal packages
- Services call repositories, never the reverse
- Controllers call services, never repositories directly

## Anti-Patterns

### ❌ Controller calling repository directly
```go
// WRONG
func (c *CountsController) GetCounts(ctx *gin.Context) {
    counts, err := c.repo.FindByEntity(ctx, entityID) // Skip service!
}
```
**Fix**: Controller → Service → Repository

### ❌ Business logic in controller
```go
// WRONG
func (c *Controller) Handle(ctx *gin.Context) {
    data := c.service.Get(ctx)
    if data.Status == "open" && data.Count > threshold { // Business logic!
        // ...
    }
}
```
**Fix**: Move logic to service layer

### ❌ Concrete types in core interfaces
```go
// WRONG — core/ importing from http/
type CountsService interface {
    Process(ctx *gin.Context) error // gin dependency in core!
}
```
**Fix**: Use `context.Context` in core interfaces

### ❌ Global state or init() for DI
```go
// WRONG
var globalService *CountsService

func init() {
    globalService = NewCountsService(...)
}
```
**Fix**: Wire in `app/` bootstrap, pass via constructor injection
