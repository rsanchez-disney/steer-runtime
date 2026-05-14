# MCP Levels Guide

This guide explains the four levels of MCP (Model Context Protocol) servers in the steer-runtime ecosystem, how they interact, and when to use each.

---

## Overview

MCP servers provide tools to AI agents (Jira, Confluence, GitHub, custom APIs, etc.). They are organized in four levels, each with different scope and ownership:

```
┌─────────────────────────────────────────────────────┐
│  Final ~/.kiro/settings/mcp.json                    │
├─────────────────────────────────────────────────────┤
│  4. User-added        _source: "user"               │  ← personal, never touched
├─────────────────────────────────────────────────────┤
│  3. Workspace MCPs    _source: "workspace:<name>"   │  ← team, activates with workspace
├─────────────────────────────────────────────────────┤
│  2. Fork MCPs         _source: "fork"               │  ← fork, auto-discovered
├─────────────────────────────────────────────────────┤
│  1. Global MCPs       _source: "global"             │  ← platform, managed by Koda
└─────────────────────────────────────────────────────┘

Priority on name collision: User > Workspace > Fork > Global
```

---

## Level 1: Global MCPs (Platform)

**Managed by:** Koda (hardcoded in `knownServers`)
**Location:** Built into Koda binary + `shared/tools/mcp-servers/` bundles
**Configured via:** `tokens.env` (Koda TUI `m` key)

These are the standard MCPs available to all users:

| Server | Purpose | Required Tokens |
|--------|---------|-----------------|
| `jira` | Jira ticket management | `JIRA_PAT` |
| `confluence` | Confluence page management | `CONFLUENCE_PAT` |
| `github` | GitHub PR/repo operations | `GITHUB_TOKEN` |
| `mermaid` | Diagram generation | — |
| `bruno` | API collection runner | — |
| `chrome` | Browser automation | — |
| `splunk-mcp` | Log querying | `SPLUNK_API_USERNAME`, `SPLUNK_API_PASSWORD` |
| `appdynamics-mcp` | APM metrics | `APPD_CLIENT_ID`, `APPD_CLIENT_SECRET` |
| `servicenow-mcp` | Incident management | `SNOW_API_USERNAME`, `SNOW_API_PASSWORD` |
| `compass` | Multi-tool gateway (SSE) | `COMPASS_TOKEN` |
| `qtest` | Test management | `QTEST_BEARER_TOKEN` |
| `sharepoint` | Document management | `SHAREPOINT_CLIENT_ID`, `SHAREPOINT_CLIENT_SECRET` |

**You don't need to do anything** — these are automatically configured when you run `koda configure` or `koda mcp-install`.

---

## Level 2: Fork MCPs

**Managed by:** Team that maintains the steer-runtime fork
**Location:** `shared/tools/mcp-servers/<name>/` in your fork
**Configured via:** `mcp-meta.json` descriptor + `tokens.env`
**Discovered:** Automatically by Koda during `mcp-install`

Fork MCPs are custom MCP servers added to a team's steer-runtime fork. Koda auto-discovers them via `mcp-meta.json`.

### When to use

- Your team needs an MCP that's not in the global list
- The MCP is useful across ALL workspaces in your fork
- You want it auto-installed for everyone using your fork

### Structure

```
shared/tools/mcp-servers/
├── jira-mcp/              ← global (shipped with main)
├── confluence-mcp/        ← global
├── splunkweb-mcp/         ← FORK-ADDED (your team's custom MCP)
│   ├── mcp-meta.json      ← Koda reads this to auto-register
│   ├── .env.example       ← Developer reference
│   ├── package.json
│   ├── src/
│   │   └── index.ts
│   └── dist/
│       └── index.cjs      ← Built entry point
```

### `mcp-meta.json` format

```json
{
  "name": "splunkweb",
  "description": "Splunk Web browser automation via session cookie",
  "type": "node",
  "entry": "dist/index.cjs",
  "env": {
    "SPLUNKWEB_URL": "Splunk Web base URL",
    "SPLUNKWEB_COOKIE": "Splunk session cookie"
  },
  "env_required": ["SPLUNKWEB_URL", "SPLUNKWEB_COOKIE"],
  "env_secret": ["SPLUNKWEB_COOKIE"],
  "env_defaults": {
    "SPLUNKWEB_URL": "https://splunk.wdprapps.disney.com"
  }
}
```

### How it works

1. You add your MCP server to `shared/tools/mcp-servers/` in your fork
2. Include a `mcp-meta.json` descriptor
3. Build the server (`npm run build` → `dist/index.cjs`)
4. When users run `koda mcp-install`, Koda:
   - Copies the bundle to `~/.kiro/tools/mcp-servers/`
   - Reads `mcp-meta.json`
   - Resolves env vars from `tokens.env` (or prompts if missing)
   - Registers in `mcp.json` with `_source: "fork"`

---

## Level 3: Workspace MCPs

**Managed by:** Team lead / workspace owner
**Location:** `workspaces/<team>/mcp/` in steer-runtime
**Configured via:** `mcp.json` + `defaults.env` + `tokens.env`
**Activated:** When user runs `koda workspace use <team>`

Workspace MCPs are team-specific servers that activate only when a workspace is selected. They can override global servers or add new ones.

### When to use

- MCP is specific to one team/workspace (not all teams in the fork)
- You want to pre-configure a global MCP for your team (e.g., Confluence with your space)
- You need custom variables that differ per team

### Structure

```
workspaces/app-team/
├── workspace.json
├── mcp/
│   ├── mcp.json          ← Server definitions + variable declarations
│   ├── defaults.env      ← Team-shared non-secret defaults (committed)
│   └── servers/          ← Optional: bundled MCP server code
│       └── config-db/
│           ├── package.json
│           └── index.js
└── profiles/
```

### `mcp/mcp.json` format

```json
{
  "mcpServers": {
    "payments-confluence": {
      "command": "node",
      "args": ["${KIRO_MCP_DIR}/confluence-mcp/dist/index.cjs"],
      "env": {
        "CONFLUENCE_URL": "https://confluence.disney.com",
        "CONFLUENCE_PAT": "${CONFLUENCE_PAT}",
        "CONFLUENCE_SPACE": "Payments",
        "CONFLUENCE_PARENT_PAGE_ID": "2041887105"
      },
      "_overrides": "confluence"
    },
    "config-db": {
      "command": "node",
      "args": ["${WORKSPACE_MCP_DIR}/servers/config-db/index.js"],
      "env": {
        "DB_HOST": "${CONFIG_DB_HOST}",
        "DB_USER": "${CONFIG_DB_USER}",
        "DB_PASS": "${CONFIG_DB_PASS}"
      }
    }
  },
  "variables": {
    "CONFIG_DB_HOST": {
      "description": "Config services MariaDB host",
      "required": true,
      "default": "localhost:3306"
    },
    "CONFIG_DB_USER": {
      "description": "Database username",
      "required": true
    },
    "CONFIG_DB_PASS": {
      "description": "Database password",
      "required": true,
      "secret": true
    }
  }
}
```

### `defaults.env` (committed, team-shared)

```env
# Non-secret team defaults
CONFIG_DB_HOST=latest-db.adpmtconfig.wdprapps.disney.com:3306
```

### How it works

1. User runs `koda workspace use app-team`
2. Koda reads `workspaces/app-team/mcp/mcp.json`
3. For each `${VAR}`:
   - Checks `~/.kiro/tokens.env` (user secrets)
   - Checks `workspaces/app-team/mcp/defaults.env` (team defaults)
   - Checks `variables[VAR].default` (fallback)
   - If `required` and missing → prompts user
4. Resolves path variables (`${KIRO_MCP_DIR}`, `${WORKSPACE_MCP_DIR}`)
5. Applies `_overrides` (removes the global server it replaces)
6. Writes workspace servers to `mcp.json` with `_source: "workspace:app-team"`

### Switching workspaces

```bash
koda workspace use bolt-team
# → Removes servers with _source: "workspace:app-team"
# → Loads bolt-team/mcp/mcp.json
# → Resolves variables
# → Adds servers with _source: "workspace:bolt-team"
```

---

## Level 4: User-Added MCPs

**Managed by:** Individual user
**Location:** Directly in `~/.kiro/settings/mcp.json`
**Configured via:** Manual edit
**Preserved:** Always — never touched by Koda

User-added MCPs are servers you add manually to your `mcp.json`. Koda detects them (no `_source` or `_managed` flag) and preserves them during all operations.

### When to use

- Personal tool only you need
- Experimenting with a new MCP
- One-off integration not worth formalizing

### How to add

Edit `~/.kiro/settings/mcp.json` directly:

```json
{
  "mcpServers": {
    "my-local-tool": {
      "command": "python3",
      "args": ["/Users/me/tools/my-mcp/server.py"],
      "env": {
        "API_KEY": "my-secret-key"
      }
    }
  }
}
```

Koda will never overwrite or remove this entry.

---

## Variable Resolution

All levels use the same resolution order for `${VAR}` references:

```
1. ~/.kiro/tokens.env          (user secrets — highest priority)
2. workspaces/<team>/mcp/defaults.env  (team defaults)
3. mcp-meta.json env_defaults  (fork defaults)
4. variables[].default         (workspace fallback)
```

### Built-in path variables

| Variable | Resolves To |
|----------|-------------|
| `${KIRO_MCP_DIR}` | `~/.kiro/tools/mcp-servers` |
| `${WORKSPACE_MCP_DIR}` | `<steer-root>/workspaces/<name>/mcp` |
| `${KIRO_ROOT}` | `~/.kiro` |
| `${WORKSPACE_NAME}` | Active workspace name |

---

## Quick Reference

| Question | Answer |
|----------|--------|
| I need a standard tool (Jira, GitHub) | Already there → Level 1 (Global) |
| My fork needs a custom MCP for all teams | Add to `shared/tools/mcp-servers/` → Level 2 (Fork) |
| My team needs a pre-configured MCP | Add to `workspaces/<team>/mcp/` → Level 3 (Workspace) |
| I need a personal one-off tool | Edit `mcp.json` directly → Level 4 (User) |
| I want to override a global MCP with team config | Use `_overrides` in workspace `mcp.json` → Level 3 |

---

## Checking your MCP status

```bash
koda mcp status
```

```
📋 MCP Servers:

  Global (5):
    ✅ jira          configured
    ✅ confluence    configured
    ✅ github-disney configured
    ✅ mermaid       configured
    ✅ bruno         configured

  Fork (1):
    ✅ splunkweb     configured

  Workspace: app-team (2):
    ✅ payments-confluence  configured (overrides: confluence)
    ⚠️  config-db            missing: CONFIG_DB_PASS

  User (1):
    ✅ my-custom-tool
```
