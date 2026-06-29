# Cursor Quick Start Guide

Get started with Cursor using steer-runtime workspaces in 3 steps.

## Prerequisites

- Koda installed (`koda version` shows v0.4.205+)
- Cursor installed (`cursor --version` or download from <https://cursor.com>)
- steer-runtime synced (`koda sync`)

## Step 1: Configure runtime

```bash
koda setup runtime
# Select: 2) cursor  or  3) both
```

Or let it auto-detect on first upgrade:

```bash
koda upgrade
# Output: 🔍 Detected runtimes: kiro + cursor
```

## Step 2: Apply your workspace

```bash
koda workspace apply my-team
```

This automatically syncs to `~/.cursor/`:
- `~/.cursor/mcp.json` — all MCP tools (Jira, Confluence, GitHub, Compass)
- `~/.cursor/agents/*.md` — all workspace agents as Cursor subagents

## Step 3: Set up project rules

```bash
cd ~/projects/my-app
koda cursor --ws my-team
```

This generates `.cursor/` in your project:
- `.cursor/rules/*.mdc` — steering files (auto-attached by glob/description)
- `.cursor/skills/*/SKILL.md` — reusable workflows
- `.cursor/mcp.json` — project-level MCP (same as global)

## Usage

Open your project in Cursor — agents, rules, and MCP tools are ready:

```bash
# Open Cursor directly
koda cursor --ws my-team --dir ~/projects/my-app --launch

# Or just open Cursor normally (global agents + MCP already synced)
cursor ~/projects/my-app
```

### Using agents

In Cursor chat, reference agents by name:
```
@orchestrator implement DPAY-14555
@backend add health check endpoint
@code_review_agent review the last 3 commits
```

### Using skills

Skills are auto-discovered by Cursor. Invoke via:
```
/dlp-create-rest-api
/dlp-configure-docker
```

### Using MCP tools

MCP tools work automatically. Cursor discovers them from `mcp.json`:
```
Search Jira for my open tickets
Get the Confluence page about deployment process
Create a PR for this branch
```

## Updating

When workspaces change (new agents, updated rules):

```bash
koda sync              # Pull latest steer-runtime
koda workspace apply   # Re-materialize → auto-syncs ~/.cursor/
cd ~/projects/my-app
koda cursor --ws my-team  # Refresh project-level rules
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| MCP tools not showing | Check `~/.cursor/mcp.json` exists. Run `koda workspace apply` |
| Agents not in chat | Check `~/.cursor/agents/`. Run `koda workspace apply` |
| Rules not applying | Verify `.cursor/rules/*.mdc` in project. Run `koda cursor --ws` |
| "cursor: command not found" | Install: `curl https://cursor.com/install -fsS \| bash` |
| Want to switch back to Kiro | `koda setup runtime` → select 1) kiro |
