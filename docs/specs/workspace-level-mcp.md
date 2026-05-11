# Spec: Workspace-Level MCP Servers

**Repo**: steer-runtime (config) + Koda (implementation)
**Status**: Proposed
**Author**: Ricardo Sanchez
**Date**: 2026-05-11

---

## Problem

1. **User MCPs lost on upgrade**: Running `koda upgrade` regenerates `mcp.json` from scratch, wiping any custom MCP servers users added manually.

2. **No team-level MCP sharing**: Teams cannot define custom MCP servers (e.g., team databases, internal APIs, pre-configured Confluence spaces) that automatically install when a workspace is activated.

3. **Variable management is fragile**: MCP servers require tokens/credentials that vary per user. There's no abstraction to declare "this MCP needs these variables" and resolve them from a central store.

---

## Solution Overview

### Phase 1: Preserve user-added servers (implemented)

`setup.sh` (and Koda's `GenerateMcpJson`) now identifies user-added servers and preserves them during regeneration. Detection: servers whose name doesn't match known managed prefixes are considered user-added.

**Branch**: `fix/preserve-user-mcp-servers`

### Phase 2: Workspace-level MCPs with variable resolution

Teams define MCP servers in their workspace folder. When activated, Koda merges them into the user's `mcp.json` with resolved variables.

---

## Design

### File Structure

```
workspaces/<team>/
├── workspace.json              ← existing (profiles, rules, agents)
├── mcp/
│   ├── mcp.json                ← MCP server definitions + variable declarations
│   ├── defaults.env            ← team-shared non-secret defaults (committed)
│   └── servers/                ← optional bundled MCP server code
│       └── <server-name>/
│           ├── package.json
│           └── index.js
└── profiles/                   ← existing
```

### Workspace `mcp/mcp.json` Schema

```json
{
  "mcpServers": {
    "<server-name>": {
      "command": "node",
      "args": ["${WORKSPACE_MCP_DIR}/servers/<name>/index.js"],
      "env": {
        "VAR_NAME": "${VARIABLE_REF}"
      },
      "_overrides": "<global-server-name>"
    }
  },
  "variables": {
    "VARIABLE_REF": {
      "description": "Human-readable description",
      "required": true,
      "secret": false,
      "default": "fallback-value"
    }
  }
}
```

### Variable Resolution (3-tier)

| Priority | Source | Scope | Committed? |
|----------|--------|-------|-----------|
| 1 (highest) | `~/.kiro/tokens.env` | Personal | No |
| 2 | `workspaces/<team>/mcp/defaults.env` | Team | Yes |
| 3 | `variables[].default` in `mcp.json` | Fallback | Yes |

### Built-in Path Variables

| Variable | Resolves To |
|----------|-------------|
| `${KIRO_MCP_DIR}` | `~/.kiro/tools/mcp-servers` |
| `${WORKSPACE_MCP_DIR}` | `<steer-root>/workspaces/<name>/mcp` |
| `${KIRO_ROOT}` | `~/.kiro` |
| `${WORKSPACE_NAME}` | Active workspace name |

### Server Source Tracking

Each server in the final `mcp.json` is tagged with `_source`:

```json
{
  "mcpServers": {
    "jira": { "...", "_managed": true, "_source": "global" },
    "team-db": { "...", "_managed": true, "_source": "workspace:app-team" },
    "my-tool": { "...", "_source": "user" }
  }
}
```

### Merge Algorithm

```
Final mcp.json = Global (koda-managed)
               - servers overridden by workspace (_overrides)
               + workspace MCPs (variables resolved)
               + user-added servers (preserved)
```

Priority on name collision: **user > workspace > global**

---

## Koda Commands Affected

| Command | Change |
|---------|--------|
| `koda workspace use <name>` | Load `mcp/mcp.json`, resolve vars, merge into mcp.json |
| `koda upgrade` | Preserve user + workspace servers during global regeneration |
| `koda configure` (TUI `m`) | Show workspace variables section, prompt for missing |
| `koda mcp status` (new) | Display server list with source tags |

### Workspace Activation Flow

```
koda workspace use app-team
  │
  ├── (existing) Load profiles, agents, rules
  │
  └── (NEW) MCP merge:
        ├── Read workspaces/app-team/mcp/mcp.json
        ├── For each variable in "variables":
        │     ├── Check tokens.env
        │     ├── Check defaults.env
        │     ├── Check variable.default
        │     └── If required + missing → prompt user (TUI)
        ├── Resolve ${VAR} references in server env/args
        ├── Remove global servers listed in _overrides
        ├── Add workspace servers with _source: "workspace:app-team"
        ├── Preserve _source: "user" servers
        └── Write ~/.kiro/settings/mcp.json
```

### Workspace Switching

```
koda workspace use bolt-team   (switching from app-team)
  │
  ├── Remove servers with _source: "workspace:app-team"
  ├── Load bolt-team/mcp/mcp.json
  ├── Resolve variables
  ├── Add servers with _source: "workspace:bolt-team"
  └── Preserve _source: "global" and _source: "user"
```

---

## Koda Implementation (Go)

### Data Structures

```go
type WorkspaceMcpConfig struct {
    McpServers map[string]WorkspaceMcpServer `json:"mcpServers"`
    Variables  map[string]VariableDecl       `json:"variables"`
}

type WorkspaceMcpServer struct {
    Command   string            `json:"command"`
    Args      []string          `json:"args"`
    Env       map[string]string `json:"env"`
    URL       string            `json:"url,omitempty"`
    Type      string            `json:"type,omitempty"`
    Headers   map[string]string `json:"headers,omitempty"`
    Overrides string            `json:"_overrides,omitempty"`
    Managed   bool              `json:"_managed,omitempty"`
    Source    string            `json:"_source,omitempty"`
}

type VariableDecl struct {
    Description string `json:"description"`
    Required    bool   `json:"required"`
    Secret      bool   `json:"secret"`
    Default     string `json:"default,omitempty"`
}
```

### Resolution Function

```go
func ResolveVariable(name string, tokensEnv, defaultsEnv map[string]string, decl VariableDecl) (string, error) {
    if v, ok := tokensEnv[name]; ok && v != "" {
        return v, nil
    }
    if v, ok := defaultsEnv[name]; ok && v != "" {
        return v, nil
    }
    if decl.Default != "" {
        return decl.Default, nil
    }
    if decl.Required {
        return "", fmt.Errorf("required variable %s is not set", name)
    }
    return "", nil
}
```

### TUI Prompt (missing variables)

```
🔧 Workspace "app-team" MCP configuration:

  config-services-db:
    CONFIG_DB_HOST [latest-db.disney.com:3306]: ↵
    CONFIG_DB_USER: sancr225
    CONFIG_DB_PASS (secret): ****

  Save to tokens.env? [Y/n]: Y
  ✓ 2 variables saved to ~/.kiro/tokens.env
```

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Workspace has no `mcp/` folder | No workspace MCPs — only global + user |
| Variable in `defaults.env` overridden by `tokens.env` | `tokens.env` wins |
| Two workspaces define same server name | Active workspace wins |
| User adds server with same name as workspace server | User wins |
| `koda upgrade` while workspace active | Regenerate global + re-apply workspace + preserve user |
| Workspace MCP references `${KIRO_MCP_DIR}` | Resolved to `~/.kiro/tools/mcp-servers` |
| Workspace bundles server code in `servers/` | `${WORKSPACE_MCP_DIR}` resolves to workspace `mcp/` path |
| `defaults.env` has secrets | ❌ Don't — use `tokens.env` for secrets. Lint/warn if `secret: true` var has a default. |

---

## Example: app-team workspace MCP

### `workspaces/app-team/mcp/mcp.json`

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

### `workspaces/app-team/mcp/defaults.env`

```env
# Team defaults (non-secret, committed)
CONFIG_DB_HOST=latest-db.adpmtconfig.wdprapps.disney.com:3306
```

---

## Implementation Phases

| Phase | Scope | Effort |
|-------|-------|--------|
| **1** (done) | Preserve user-added servers in `setup.sh` | ✅ Implemented |
| **2a** | Koda: `_source` tracking + user server preservation in `GenerateMcpJson` | Small |
| **2b** | Koda: Read workspace `mcp/mcp.json` on `workspace use` | Medium |
| **2c** | Koda: Variable resolution (3-tier lookup) | Medium |
| **2d** | Koda: TUI prompt for missing required variables | Medium |
| **2e** | Koda: `_overrides` support (replace global server) | Small |
| **3** | `koda mcp status` command | Small |
| **4** | `koda mcp add <name>` scaffold command | Small |

---

## Migration for Existing Users

1. Users with custom MCPs in `mcp.json` → automatically preserved (Phase 1)
2. Teams wanting shared MCPs → create `workspaces/<team>/mcp/mcp.json` (Phase 2)
3. No breaking changes — workspaces without `mcp/` folder behave exactly as today

---

## Fork-Level MCPs

Teams running steer-runtime forks can add custom MCP servers directly to `shared/tools/mcp-servers/`. Koda must discover and register these automatically.

### Discovery mechanism

Each MCP server in `shared/tools/mcp-servers/<name>/` declares itself via `mcp-meta.json`:

```json
{
  "name": "splunkweb",
  "description": "Splunk Web browser automation via session cookie",
  "env": {
    "SPLUNKWEB_URL": "Splunk Web base URL",
    "SPLUNKWEB_COOKIE": "Splunk session cookie (from browser DevTools)"
  }
}
```

### How Koda handles fork-level MCPs

```
koda upgrade / koda mcp-install
  │
  ├── Scan shared/tools/mcp-servers/*/mcp-meta.json
  ├── For each discovered server:
  │     ├── Check if it's a known global server → skip (already handled)
  │     ├── If new (fork-added):
  │     │     ├── Read env vars from mcp-meta.json
  │     │     ├── Resolve from tokens.env (or prompt if missing)
  │     │     ├── Register in mcp.json with _source: "fork"
  │     │     └── npm install if package.json exists
  │     └── Tag with _managed: true, _source: "fork"
  └── Write final mcp.json
```

### `mcp-meta.json` schema (unified)

```json
{
  "name": "server-name",
  "description": "Human-readable description",
  "type": "node",
  "entry": "dist/index.cjs",
  "env": {
    "VAR_NAME": "Description of this variable"
  },
  "env_required": ["VAR_NAME"],
  "env_secret": ["VAR_NAME"],
  "env_defaults": {
    "VAR_NAME": "default-value"
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Server name used in mcp.json |
| `description` | No | Shown in `koda mcp status` |
| `type` | No | `node` (default), `docker`, `python` |
| `entry` | No | Entry point relative to server dir (default: `dist/index.cjs`) |
| `env` | No | Map of env var name → description |
| `env_required` | No | List of required env vars |
| `env_secret` | No | List of secret env vars (masked in TUI) |
| `env_defaults` | No | Default values for env vars |

### Example: fork-added `splunkweb-mcp`

```
shared/tools/mcp-servers/splunkweb-mcp/
├── mcp-meta.json       ← Koda reads this to auto-register
├── .env.example        ← Developer reference
├── package.json
├── src/
│   └── index.ts
└── dist/
    └── index.cjs       ← Built entry point
```

`mcp-meta.json`:
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

Koda generates in `mcp.json`:
```json
{
  "splunkweb": {
    "command": "node",
    "args": ["~/.kiro/tools/mcp-servers/splunkweb-mcp/dist/index.cjs"],
    "env": {
      "SPLUNKWEB_URL": "https://splunk.wdprapps.disney.com",
      "SPLUNKWEB_COOKIE": "<from tokens.env>"
    },
    "_managed": true,
    "_source": "fork"
  }
}
```

---

## Three-Level MCP Architecture

```
┌─────────────────────────────────────────────────────┐
│  Final ~/.kiro/settings/mcp.json                    │
├─────────────────────────────────────────────────────┤
│  User-added servers          _source: "user"        │  ← personal, never touched
├─────────────────────────────────────────────────────┤
│  Workspace MCPs              _source: "workspace:X" │  ← team, from workspaces/<X>/mcp/
│    Variables: tokens.env > defaults.env > default    │
├─────────────────────────────────────────────────────┤
│  Fork MCPs                   _source: "fork"        │  ← fork, from shared/tools/mcp-servers/
│    Variables: tokens.env > mcp-meta.json defaults    │
├─────────────────────────────────────────────────────┤
│  Global MCPs                 _source: "global"      │  ← platform (jira, confluence, github...)
│    Variables: tokens.env                             │
└─────────────────────────────────────────────────────┘
```

### Priority on name collision

**user > workspace > fork > global**

### Koda resolution flow

```
koda upgrade / koda workspace use <name>
  │
  ├── 1. Generate global servers (from known list + tokens.env)
  ├── 2. Discover fork servers (scan mcp-meta.json in shared/tools/mcp-servers/)
  ├── 3. Load workspace servers (from workspaces/<active>/mcp/mcp.json)
  ├── 4. Preserve user-added servers (no _managed flag or _source: "user")
  ├── 5. Resolve all ${VAR} references
  ├── 6. Prompt for missing required variables
  └── 7. Write merged mcp.json with _source tags
```

---

## Backward Compatibility

This feature is fully backward compatible:

| Scenario | Behavior |
|----------|----------|
| Workspace has no `mcp/` folder | Works exactly as today — no change |
| User has no custom MCPs | No difference — global servers regenerated as before |
| Old Koda version + workspace with `mcp/` | Ignores the folder — no crash, no error |
| New Koda version + old workspace (no `mcp/`) | Skips workspace MCP logic entirely |
| Existing `mcp.json` without `_source` tags | All servers treated as global on first run; user-added detected by prefix matching |

No breaking changes. Workspaces without `mcp/` behave identically to today.

---

## Orchestrator Awareness

The steer-orchestrator agent is aware of workspace-level MCPs via `shared/context/mcp_priority.md`. When users ask about creating custom MCPs or configuring workspace tools, the orchestrator can:

1. Point to the template: `shared/templates/workspace-mcp/`
2. Explain the variable resolution order
3. Guide `_overrides` usage for team-configured global servers
4. Remind about `defaults.env` for non-secret team values vs `tokens.env` for secrets
