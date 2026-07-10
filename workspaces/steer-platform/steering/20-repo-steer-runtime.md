---
inclusion: auto
description: Conventions for working in steer-runtime (agents, profiles, workspaces, MCP servers)
---

# steer-runtime repo conventions

## Directory structure

```text
profiles/           → Named profile bundles (dev-core, qa, ops, etc.)
  <profile>/agents/ → Agent JSON configs
  <profile>/prompts/→ Agent prompt markdown
workspaces/         → Team workspace definitions
  <workspace>/      → workspace.json + context/ + skills/ + profiles/
shared/             → Shared across all profiles
  hooks/            → Shell/PS1 hooks (preToolUse, agentSpawn)
  tools/mcp-servers/→ MCP server implementations
common/             → Common context files installed to all users
scripts/            → Validation, telemetry, release scripts
evals/              → Agent evaluation framework
```

## Agent JSON schema (key fields)

```json
{
  "name": "agent_name",
  "description": "One-line purpose",
  "prompt": "file://../prompts/agent_name.md",
  "tools": ["fs_read", "fs_write", "code", "grep", "@jira/*"],
  "resources": ["file://../../../context/file.md"],
  "hooks": { "preToolUse": [...], "agentSpawn": [...] },
  "includeMcpJson": true
}
```

## Workspace JSON schema (key fields)

```json
{
  "name": "team-name",
  "extends": "parent-workspace",
  "profiles": ["dev-core", "qa"],
  "repos": [{ "name": "repo", "path": "~/path", "lang": "Go" }],
  "mcp": { "servers": {...} }
}
```

## Validation commands

```bash
make validate-workspaces    # Required fields, portability
make validate-agents        # Agent JSONs reference existing prompts
make validate-catalog       # Managed services catalog
make validate-all           # All of the above
```

## PR review rules for this repo

- Never modify `profiles/` shared agents with workspace-specific paths
- Workspace PRs must stay scoped to `workspaces/<their-workspace>/`
- All `file://` resource paths must resolve relative to the agent JSON location
- New MCP servers need `mcp-meta.json` for auto-discovery
- Prompt files must exist at the path referenced in agent JSON

## MCP server conventions

- Location: `shared/tools/mcp-servers/<name>/`
- Required: `mcp-meta.json`, `package.json`, entry point
- Build output: `dist/index.cjs` (single bundle)
- Build command: `make mcp-build-<name>` or `npm run bundle`
- Registration: auto-discovered by Koda via `mcp-meta.json`

## Release

- Tags pushed to private origin and public mirror
- Tarball built via `make pack-steer` in Koda repo
- Published via `make publish-steer TAG=<version>` in Koda repo
- Never publish from steer-runtime repo directly (use Koda's `publish-all`)
