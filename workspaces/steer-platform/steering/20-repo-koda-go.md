---
inclusion: fileMatch
fileMatchPattern: ["**/*.go", "go.mod", "go.sum", "Makefile"]
description: Go development rules for Koda CLI/TUI
---

# Koda (Go) steering

## Architecture

- Koda is a Go CLI/TUI built with Cobra (CLI), Bubbletea (TUI), and Lipgloss (styling)
- Package layout: `internal/cli/` (commands), `internal/tui/` (UI), `internal/ops/` (business logic), `internal/model/` (structs), `internal/config/` (settings)
- Business logic belongs in `internal/ops/` — CLI and TUI are thin wrappers
- Models live in `internal/model/` with JSON tags and `omitempty` for optional fields

## Conventions

- All new model fields must use `omitempty` for backward compatibility
- Use `cobra.Command` for new CLI commands — register in `internal/cli/commands.go`
- TUI screens follow the Bubbletea `Init/Update/View` pattern
- Feature gates: check `config.IsTUIEnabled("feature")` before exposing in TUI
- Error handling: wrap with `fmt.Errorf("context: %w", err)` — never swallow errors
- Logging: use `log.Printf` for debug, `fmt.Printf` for user-facing output

## Cross-platform

- File paths: always use `filepath.Join`, never hardcode separators
- Windows parity: `.sh` hooks must have matching `.ps1` equivalents
- ANSI: check `config.IsColorEnabled()` before emitting color codes
- Test on both macOS and Windows when changing path handling or process spawning

## Testing

- Unit tests: `go test ./...` from repo root
- Test files: `*_test.go` next to implementation
- Use `t.TempDir()` for filesystem tests
- Mock external dependencies (GitHub API, filesystem) via interfaces

## Do not

- Do not add runtime dependencies without justification — Koda ships as a single binary
- Do not change existing CLI command signatures (breaking for users)
- Do not modify `internal/config/features.json` without rebuilding
- Do not use `os.Exit` outside of `main.go` — return errors instead
