# GoDev Agent — Workflow Guide

## How to Use

The `orchestrator` automatically detects `godev` via the agent registry and can delegate Go tasks to it. You can also invoke it directly:

```bash
kiro-cli chat --agent godev
```

No explicit installation step is needed — the orchestrator already knows about `godev` and will suggest it for Go code changes.

## What Loads Automatically

Steering files with `fileMatch` inclusion activate when you open or reference Go files:

| File | Triggers On | Content |
|------|-------------|---------|
| `01-repo-go-architecture.md` | `*.go`, `go.mod`, `Makefile`, `Dockerfile`, `serverless.yml` | Clean Architecture, project categories, dependency flow |
| `02-repo-go-tech-stack.md` | Same as above | Runtime, libraries, mocking, deployment, Makefile targets |
| `05-repo-go-code-patterns.md` | `*.go`, `go.mod` | Error handling, DI, interfaces, naming, imports, logging, MongoDB, concurrency |
| `06-error-handling-convention.md` | `*.go`, `go.mod` | Sentinel errors, error mapping, handleError, status codes |
| `20-repo-go-testing.md` | `*_test.go`, `*.go`, `.mockery.yaml`, `.covignore` | Table-driven tests, mockery, coverage, assertions |
| `30-repo-go-git-workflow.md` | `*.go`, `go.mod`, `.semver.yaml`, `cz.yaml` | Branch naming, commits, CI/CD |

### Manual Activation

| File | How to Activate | Content |
|------|-----------------|---------|
| `10-pr-review-go-guide.md` | Reference with `#` in chat | Full PR review checklist |

## Available Skills

Activate these by describing the task to the agent:

| Skill | When to Use |
|-------|-------------|
| `go-api-endpoint-implementation` | Adding or modifying HTTP endpoints |
| `go-event-processor-implementation` | Adding or modifying Kinesis/Kafka/SQS processors |
| `go-shared-library-development` | Creating or modifying shared Go libraries |
| `go-monorepo-service-implementation` | Working within monorepo services |

## Typical Workflow

### Implementing a Jira ticket

1. Open the repo in your IDE
2. Start a chat with the godev agent
3. Tell it: "Implement OPS-XXXXX — [brief description]"
4. The agent reads the steering files, understands the architecture, and implements
5. Review the changes, run `make build && make test && make lint`
6. Create the PR manually (or via your Create PR hook)

### Multi-repo changes (shared libs → consumers)

Example: adding a new reporting processor that needs a new domain type.

```
opsheet-types-go          → push-to-reporting-go     → reporting-legacy-emitter-go
(new type/struct)           (new processor using it)    (wires the processor)
```

1. Start in `opsheet-types-go` — add the new type with JSON + BSON tags
2. Run tests, commit, push, tag a new version (e.g., `v2.X.Y`)
3. Switch to `push-to-reporting-go` — `go get` the new types version
4. Implement the new processor (struct, `Process` method, table name, tests)
5. Run tests, commit, push, tag a new version
6. Switch to `reporting-legacy-emitter-go` — `go get` both new versions
7. Wire the new processor in the handler (register it for the matching partition key)
8. Run tests, commit, push
9. Create PRs for all three repos, listing dependencies in each PR description

### Code review

1. Activate the PR review guide: reference `10-pr-review-go-guide.md` in chat
2. Tell the agent: "Review this PR" or "Review branch feat/OPS-XXXXX"
3. The agent follows the full review checklist

## Agent Preferences

### Execution Style

- When the user gives a clear, specific instruction (repo, what to change, branch name), execute directly without exploring or asking clarifying questions.
- When the user describes a goal without specifics, first propose a plan, then execute after confirmation.

### Token Efficiency

- Start new conversations for new tickets or unrelated tasks
- Use `runCommand` hooks for deterministic tasks (test, lint, build)
- Avoid reading the same file multiple times in one conversation
- Keep tool call outputs short: use flags like `--oneline`, `--stat` when possible
- Prefer `go test ./... -count=1` over verbose mode unless debugging failures
