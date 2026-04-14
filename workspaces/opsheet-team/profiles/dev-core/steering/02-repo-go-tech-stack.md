---
inclusion: fileMatch
fileMatchPattern: ["**/*.go", "go.mod", "go.sum", "Makefile", "Dockerfile", "ECS.Dockerfile", "serverless.yml"]
description: Go toolchain, shared libraries, build configuration, and deployment details
---

# OpSheet+ Go — Technology Stack & Build

## Runtime

- Go 1.23+ (target for new services; some legacy at 1.20–1.21)
- Cross-compilation: `GOARCH=amd64 GOOS=linux CGO_ENABLED=0`
- Build flags: `-ldflags="-s -w"` (strip debug info)

## HTTP Framework

- Gin (`github.com/gin-gonic/gin`) for API services
- Swagger via `swag init` for API documentation
- Swagger UI at `/api/v1/{service}/docs/index.html`

## Internal Shared Libraries

All under `github.disney.com/wdpr-parkops-opsheet-suite/`:

| Library                  | Version | Purpose                                    |
|--------------------------|---------|--------------------------------------------|
| `http-go`                | v2      | HTTP client wrapper with auth, correlation |
| `secrets-go`             | v3      | Vault secret management                    |
| `kafka-utils-go`         | v2      | Kafka consumer/producer                    |
| `rabbitmq-utils-go`      | —       | RabbitMQ utilities                         |
| `container-utils-go`     | —       | DI container utilities                     |
| `graph-utils-go`         | v3      | Graph data utilities                       |
| `async-go`               | —       | Async/concurrent utilities                 |
| `summarization-utils-go` | v2      | Summarization logic                        |
| `test-utils-go`          | —       | Test helpers                               |
| `opsheet-vault-go`       | —       | Vault integration                          |
| `logger-go`              | —       | Structured logging                         |
| `lambda-utils-go`        | v2      | Lambda bootstrap utilities                 |
| `opsheet-types-go`       | v2      | Shared domain types                        |
| `authz-go`               | v2      | Authorization utilities                    |

## Code Quality

- **Linter:** golangci-lint v2 with `.golangci.yml`
- **Key linters enabled:** bodyclose, errcheck, exhaustive, gocritic, gosec, govet, revive, staticcheck, unused, goconst, gocognit
- **Formatter:** gofumpt (via golangci-lint formatters)
- **Import ordering:** gci — `standard → default → prefix(github.disney.com/wdpr-parkops-opsheet-suite) → localmodule`

## Mocking

- **Tool:** Mockery v2 (v2.53.x)
- **Config:** `.mockery.yaml` at repo root
- **Output:** `mocks/` directory (with `internal_/` subdirs for internal packages)
- **Convention:** `with-expecter: true`, snake_case filenames, interface name as mock name
- **Regenerate:** `make mock` (deletes and recreates all mocks)

## Testing

- Table-driven tests preferred
- Coverage minimum: 75% (enforced via `scripts/cov.sh`)
- Race detection: `CGO_ENABLED=1 go test -race`
- Coverage packages exclude: `mocks/`, `cmd/`, `docs/`, `internal/app/`

## Deployment

- **Lambda:** `serverless.yml` + `Dockerfile` (Go binary in Lambda runtime)
- **ECS:** `ECS.Dockerfile` (custom Disney base image)
- **CI/CD:** Harness pipelines (`.harness/` directory)
- **Versioning:** `.semver.yaml` + `cz.yaml` (commitizen)
- **Pre-commit:** `.pre-commit-config.yaml`

## Common Makefile Targets

```bash
make build          # Format imports + swagger + tidy + compile
make test           # Clean cache + run all tests with coverage
make cover          # Full coverage report with 75% threshold
make cover-dev      # Coverage with race detection + HTML report
make lint           # golangci-lint v2
make lint-local     # Lint only changes vs main branch
make mock           # Regenerate all mocks via mockery
make format-imports # gci import ordering
make run            # Run locally (go run ./cmd/api/main.go)
make clean          # Remove build artifacts
```

## Swagger

- Generated via `swag init` with `--parseGoList` and `--parseDependency`
- Annotations in controller methods (Gin handlers)
- Output to `cmd/api/docs/` or service-specific docs dir
- Format check via `swag fmt`
