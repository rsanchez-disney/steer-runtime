# Cursor Integration

> 🧪 **Status:** Experimental
> **Since:** v0.4.207 (Koda) / v0.2.137 (steer-runtime)

Run steer-platform agents in Cursor IDE alongside Kiro CLI. Same workspace, same agents, same MCP tools — different runtime.

## Quick start

```bash
# Generate .cursor/ from a workspace
koda cursor --ws app-payment-controls --dir ~/projects/my-app

# Or let auto-detection handle it
cd ~/projects/my-app
koda chat   # detects .cursor/ → routes to Cursor automatically
```

## How it works

Koda translates workspace configuration into Cursor-native formats:

| Workspace source | Cursor output |
|-----------------|---------------|
| `steering/*.md` | `.cursor/rules/*.mdc` (frontmatter → globs/alwaysApply) |
| `context/*.md` | `.cursor/rules/ctx-*.mdc` (alwaysApply: true) |
| `agents/*.json` + prompts | `.cursor/agents/*.md` (with MCP tool hints) |
| `skills/` | `.cursor/skills/` (as-is) |
| `mcp.json` | `.cursor/mcp.json` (cleaned: no `_source`, no `disabled`) |

## MCP tools in Cursor

All configured MCP servers are synced to `~/.cursor/mcp.json`:

```bash
# Check current state
cat ~/.cursor/mcp.json | jq '.mcpServers | keys'
```

Servers include: yax, compass, jira-cloud, confluence-cloud, github, memory, and more.

## Auto-detection

When you run `koda chat` in a directory with `.cursor/`, Koda:
1. Reads `.cursor/.koda-meta.json` to identify the workspace
2. Infers the default agent
3. Checks freshness (skips regeneration if workspace hasn't changed)
4. Routes to Cursor agent CLI

## Project registry

Koda tracks all Cursor projects:

```bash
koda cursor list          # show all registered projects
koda cursor sync          # refresh all projects
koda cursor remove <path> # unregister a project
```

## Setup runtime preference

```bash
koda setup runtime   # choose: kiro, cursor, or both
```

When "both" is selected, `SyncCursorGlobal` runs automatically during workspace apply, keeping `~/.cursor/` in sync.

## Limitations

- Cursor MCP servers only load on application startup (restart after config changes)
- No TUI experience in Cursor — agents run in terminal mode
- Cursor doesn't support `subagent` tool natively (single-agent sessions)
- `.cursor/` regeneration requires workspace to be newer than existing config

## Compatibility

All features work across both runtimes:

| Feature | Kiro | Cursor |
|---------|:----:|:------:|
| Steering rules | ✅ | ✅ (.mdc) |
| MCP tools | ✅ | ✅ |
| Agent prompts | ✅ | ✅ (.md) |
| Skills | ✅ | ✅ |
| Autopilot mode | ✅ | ✅ |
| Subagent delegation | ✅ | ❌ |
| TUI dashboard | ✅ | ❌ |
| Per-project memory | ✅ | ✅ |
