---
inclusion: auto
description: Conventions for working in Koda (Go CLI/TUI)
---

# Koda repo conventions

## Directory structure

```text
cmd/koda/           → Main entry point
internal/
  cli/              → Cobra commands (one file per command)
  tui/              → Bubbletea TUI (app.go, chat.go, mcp.go, etc.)
  ops/              → Business logic (sync, upgrade, steer, fork, etc.)
  acp/              → ACP protocol client
  config/           → Settings read/write (~/.kiro/settings/)
  model/            → Data models (agent, workspace, profile)
  team/             → Multi-agent team orchestration
  kitestream/       → KiteStream/Kite bridge
  autopilot/        → Autopilot client
  graphify/         → Code knowledge graph builder
  slack/            → Slack bot integration
bin/                → Build outputs (cross-compiled)
Makefile            → Build, test, release targets
```

## Build and test

```bash
make build                  # Build for current platform
make run                    # Build + launch TUI
make test                   # All tests
make test-ws                # Workspace-specific tests
make cross                  # Cross-compile all platforms
make lint                   # golangci-lint
```

## Key Makefile targets

```bash
make publish TAG=v0.4.x     # Tag + build + upload Koda release
make publish-all            # Auto-version + publish all repos with changes
make pack-steer             # Package steer-runtime tarball
make publish-steer TAG=...  # Upload steer-runtime to public repo
make verify-release-steer   # Verify tarball asset exists
make verify-release-koda    # Verify all platform binaries exist
make verify-versions        # Check private/public/local version consistency
```

## Go patterns

- Commands are thin — business logic lives in `internal/ops/`
- TUI uses Bubbletea model-update-view pattern
- Config files at `~/.kiro/settings/` (JSON)
- MCP server registration via `internal/ops/mcp.go`
- Agent materialization: profiles + workspace overlay merged at install time
- Release key embedded at build time via `-ldflags`

## ACP protocol

- Client in `internal/acp/client.go`
- Events: Thinking, Content, ToolUse, ToolResult, Metadata, SubagentUpdate
- Used by: Koda TUI, Kite, steer-plugins, Mouseketool

## Testing conventions

- Table-driven tests preferred
- Test files: `*_test.go` adjacent to source
- Use `t.Helper()` for test utilities
- Mock external calls (GitHub API, filesystem) via interfaces

## Release flow

- `make publish-all SKIP_CERTIFY=1` is the standard release command
- Builds Koda binaries + yax + prompt-scorer + steer.vsix
- Publishes to `github.com/rsanchez-disney/Koda`
- Then detects steer-runtime changes and publishes separately
- Verify gates run after each publish step
