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
