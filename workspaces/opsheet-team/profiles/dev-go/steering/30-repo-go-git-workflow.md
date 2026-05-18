---
inclusion: fileMatch
fileMatchPattern: ["**/*.go", "go.mod", ".semver.yaml", "cz.yaml", ".pre-commit-config.yaml"]
description: Git workflow, branch naming, conventional commits, and CI/CD for Go services
---

# OpSheet+ Go — Git Workflow & CI/CD

## Branch Naming

Format: `{type}/OPS-{ticket}` or `{type}/OPS-{ticket}-{short-description}`

Types: `feat`, `fix`, `refactor`, `test`, `chore`, `docs`, `perf`

```
feat/OPS-1234
fix/OPS-5678-counts-nil-pointer
refactor/OPS-9012-extract-service
```

## Commit Messages

Follow conventional commits:

```
{type}: OPS-{ticket} - {description}
{type}({scope}): OPS-{ticket} - {description}
```

Examples:
```
feat: OPS-1234 - add dispatch interval endpoint
fix(counts): OPS-5678 - handle nil pointer in summarization
refactor: OPS-9012 - extract counts service from controller
test: OPS-3456 - add table-driven tests for alert scheduler
```

## Pre-Submission Checklist

Before creating a PR:

```bash
make format-imports   # Fix import ordering
make build            # Compile + swagger + tidy
make test             # Run all tests
make cover            # Verify ≥75% coverage
make lint             # Run golangci-lint
```

Or if available:
```bash
make build-local      # swag-fmt + mock + build (full local build)
```

## PR Template

All Go repos use `.github/pull_request_template.md` with:

- Change type (fix/feature/refactor)
- Description of what and why
- Pre-submission checks (build, test, cover, lint — with screenshots)
- Related Jira tickets
- PR dependencies
- Reviewer guidelines

## CI/CD — Harness

Pipelines defined in `.harness/` directory:

- `main.yaml` — main branch pipeline
- `pipeline.yaml` — PR/feature branch pipeline
- `hotfix.yaml` — hotfix pipeline
- `service.yaml` — service definition

### Monorepo Pipelines

Monorepos have per-app pipeline configs:
```
.harness/
  alerts_api_service.yaml
  alerts_process_service.yaml
  alerts_scheduler_service.yaml
```

## Versioning

- Semantic versioning via `.semver.yaml`
- Commitizen config via `cz.yaml`
- Tags follow `v{major}.{minor}.{patch}`

## Pre-commit Hooks

Configured via `.pre-commit-config.yaml`:
- Format checks
- Lint checks
- Secret scanning
