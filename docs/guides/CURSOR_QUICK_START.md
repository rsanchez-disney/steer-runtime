# Cursor Quick Start Guide

Get started with Cursor using steer-runtime workspaces.

## Prerequisites

- Koda v0.4.208+ (`koda upgrade`)
- Cursor agent CLI (`agent --version` or install from <https://cursor.com>)
- steer-runtime synced (`koda sync`)

## Setup (one time per project)

### 1. Configure runtime

```bash
koda setup runtime
# Select: 2) cursor  or  3) both
```

Or skip — Koda auto-detects on `koda upgrade` if Cursor is installed.

### 2. Generate project config

```bash
cd ~/projects/my-app
koda cursor --ws app-payment-controls
```

This generates `.cursor/` in your project:
- `.cursor/rules/*.mdc` — steering files (auto-attached by glob/description)
- `.cursor/agents/*.md` — all workspace agents as subagents
- `.cursor/skills/*/SKILL.md` — reusable workflows
- `.cursor/mcp.json` — MCP tools (Jira, Confluence, GitHub, Compass)
- `.cursor/.koda-meta.json` — workspace metadata (for auto-detection)

It also syncs globally to `~/.cursor/`:
- `~/.cursor/mcp.json` — MCP tools available in all projects
- `~/.cursor/agents/*.md` — agents available everywhere

## Daily usage

### Zero-config launch

After initial setup, just:

```bash
cd ~/projects/my-app
koda chat
```

Koda auto-detects:
- `.cursor/` exists → uses Cursor agent CLI (not Kiro)
- `.koda-meta.json` → infers the workspace
- Workspace `default_agent` → launches with `@orchestrator`

### Explicit flags (when needed)

```bash
# Force cursor target
koda chat --target cursor

# Specify agent
koda chat --target cursor --agent backend

# Pass initial prompt
koda chat --target cursor "implement DPAY-14555"

# Open Cursor IDE instead of CLI
koda cursor --ws my-team --launch
```

### Using agents in Cursor chat

Agents are available as subagents via `@` mentions:

```
@orchestrator implement DPAY-14555
@backend add health check endpoint
@code_review_agent review the last commit
@planner_agent break down this feature
```

### Using skills

Skills are auto-discovered by Cursor:

```
/dlp-create-rest-api
/dlp-configure-docker
```

### Using MCP tools

MCP tools work automatically — Cursor discovers them from `mcp.json`:

```
Search Jira for my open tickets
Get the Confluence page about deployment process
Create a PR for this branch
```

## Updating

When workspaces change (new agents, updated rules):

```bash
koda sync                        # Pull latest steer-runtime
koda workspace apply my-team     # Re-syncs ~/.cursor/ (MCP + agents)
cd ~/projects/my-app
koda cursor --ws my-team         # Refresh project-level rules
```

## Health check

```bash
koda doctor
```

Shows Cursor-specific checks:
```
✓ cursor-cli       /Users/.../.local/bin/agent
✓ cursor-mcp       ~/.cursor/mcp.json present
✓ cursor-agents    145 agents in ~/.cursor/agents/
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| MCP tools not showing | `koda workspace apply` to sync `~/.cursor/mcp.json` |
| Agents not in chat | `koda workspace apply` to sync `~/.cursor/agents/` |
| Rules not applying | `koda cursor --ws` in the project directory |
| "agent: command not found" | `curl https://cursor.com/install -fsS \| bash` |
| Want to force Kiro | `koda chat --target kiro` |
| Agent shows generic greeting | Re-run `koda cursor --ws` to pick up welcomeMessage |
