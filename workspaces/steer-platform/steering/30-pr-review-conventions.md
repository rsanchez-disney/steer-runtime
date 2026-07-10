---
inclusion: auto
description: How to review PRs in steer-runtime and Koda
---

# PR review conventions

## steer-runtime PR checklist

### Blockers (request changes)

- Modifies `profiles/` shared agents with workspace-specific paths or resources
- Resource `file://` paths that won't resolve (wrong relative depth, typos, underscores vs hyphens)
- Workspace PR touches files outside `workspaces/<their-workspace>/`
- New MCP server missing `mcp-meta.json`
- Agent JSON references a prompt file that doesn't exist
- Hardcoded absolute paths (non-portable)

### Warnings (comment, don't block)

- Large SKILL.md files (500+ lines) — suggest splitting knowledge base from workflow
- Adding heavy resources to multiple agents unnecessarily (context window bloat)
- Missing newline at EOF
- Validation warnings from `make validate-all`

### Approval criteria

- Changes scoped to their workspace
- No global profile pollution
- All file paths resolve correctly
- Validations pass (or warnings are acknowledged)

## Koda PR checklist

### Blockers

- Breaks `go build ./...`
- Fails `make test-ws`
- Removes existing CLI commands without deprecation
- Changes ACP protocol events (breaking downstream: Kite, steer-plugins)
- Security: secrets in process listing, hardcoded keys, `git push --force`

### Warnings

- Missing tests for new business logic in `internal/ops/`
- Large functions (80+ lines) in `internal/tui/`
- Commented-out code

## Review tone

- Friendly, constructive, solution-oriented
- Always explain WHY something is a problem
- Provide fix examples when requesting changes
- Approve when no blockers exist, even with nits
- Use emoji sparingly: ✅ approve, ❌ blocker, 💡 suggestion, 🐛 bug

## Fork PRs (source branch = main)

External contributors fork the repo, so their source branch is `main` from their fork. This is normal. After merge, do NOT delete the `main` branch (it's theirs). Use `--squash` for cleaner history.
