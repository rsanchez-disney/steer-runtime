# Per-Project Memory

> 🧪 **Status:** Experimental
> **Since:** v0.4.205 (Koda)

SQLite-backed persistent memory isolated per project. Agents automatically remember decisions, patterns, and context across sessions within a specific codebase.

## Quick start

```bash
# Check memory status
koda memory status

# Prune old observations (default: 45 days)
koda memory prune

# Hard delete (permanent)
koda memory prune --hard
```

## How it works

Each workspace project gets its own SQLite database at `~/.kiro/memory/<project>/memory.db`. The `memory` MCP server runs as a sidecar, exposing tools like:

- `mem_save` — store an observation (decision, bugfix, pattern, etc.)
- `mem_search` — full-text search across project memories
- `mem_get` — retrieve by ID
- `mem_list` — recent observations

## Memory vs Yax

| Feature | Per-project memory (`mem_*`) | Yax (`yax_*`) |
|---------|------------------------------|---------------|
| Scope | Single project | Cross-project, global |
| Storage | `~/.kiro/memory/<project>/memory.db` | `~/.yax/yax.db` |
| Best for | Project-specific bugfixes, configs, patterns | Team decisions, personal workflows, cross-project learnings |
| Sessions | No session tracking | Full session lifecycle |
| Edges | No graph relationships | Link observations together |

## What agents remember

- Architecture decisions ("we chose DynamoDB over Postgres because...")
- Bug fixes with root cause ("OOM was caused by unbounded cache, fixed with TTL")
- Local development quirks ("service X needs env var Y to start")
- Code patterns ("this project uses the repository pattern with...")
- Configuration ("deploy to stage-3 for testing, not stage-1")

## Auto-save triggers

Agents save to project memory automatically when:
- A bug is fixed with a clear root cause
- An architecture or implementation decision is made
- A non-obvious configuration is discovered
- A pattern or convention is established

## Pruning

Observations older than 45 days are soft-deleted by default:

```bash
koda memory prune              # soft-delete (recoverable)
koda memory prune --days 90    # custom retention
koda memory prune --hard       # permanent deletion
```

## MCP integration

The memory server is automatically included in `mcp.json` when workspaces have projects. Agents see it as the `memory` MCP server with tools prefixed by project context.
