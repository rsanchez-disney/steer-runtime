# Skill: Go monorepo service implementation

Use when adding or modifying services within a Go monorepo (e.g., alerts-monorepo-go, wait-times-monorepo-go).

## Steps

1. Identify if the change belongs to a specific app or shared code
2. For app-specific changes: work within `internal/{app-name}/`
3. For shared changes: work within `internal/shared/`
4. Define interfaces in the app's or shared `core/` package
5. Implement the feature following Clean Architecture
6. Add tests in the same package
7. Regenerate mocks: `make mock`
8. Build all apps to verify no cross-app breakage: `make build-all`

## Monorepo Structure

```
cmd/
  api/main.go
  process/main.go
  scheduler/main.go
internal/
  api/          # API-specific: app, http, core
  process/      # Processor-specific: app, stream, core
  scheduler/    # Scheduler-specific: app, core
  shared/       # Shared across all apps
    core/
      models/
      repositories/
      services/
      commands/
      streams/
      queues/
    utils/
```

## Checklist

- [ ] Change is in the correct app package (not leaking across app boundaries)
- [ ] Shared code is genuinely shared (used by 2+ apps) — don't put app-specific code in `shared/`
- [ ] No direct imports between app packages (api ↛ process, process ↛ scheduler)
- [ ] All apps still build: `make build-all`
- [ ] All tests pass across all apps: `make test`
- [ ] Mocks regenerated for any changed interfaces
- [ ] If adding a new app: add corresponding `cmd/{app}/main.go`, `build-{app}` Makefile target, and Harness pipeline
- [ ] `make build-all && make test && make lint` passes
