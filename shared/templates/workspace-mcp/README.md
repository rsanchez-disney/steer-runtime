# Workspace MCP Template

Copy this folder into your workspace to add team-level MCP servers:

```bash
cp -r shared/templates/workspace-mcp workspaces/<your-team>/mcp
```

## Structure

```
workspaces/<your-team>/mcp/
├── mcp.json          ← Server definitions + variable declarations
├── defaults.env      ← Team-shared non-secret defaults (committed)
└── servers/          ← Optional: bundled MCP server code
    └── <name>/
        ├── package.json
        └── index.js
```

## mcp.json format

```json
{
  "mcpServers": {
    "<server-name>": {
      "command": "node",
      "args": ["${WORKSPACE_MCP_DIR}/servers/<name>/index.js"],
      "env": {
        "VAR": "${VARIABLE_NAME}"
      },
      "_overrides": "<global-server-to-replace>"
    }
  },
  "variables": {
    "VARIABLE_NAME": {
      "description": "What this variable is for",
      "required": true,
      "secret": false,
      "default": "fallback-value"
    }
  }
}
```

## Available path variables

| Variable | Resolves To |
|----------|-------------|
| `${KIRO_MCP_DIR}` | `~/.kiro/tools/mcp-servers` (global MCP binaries) |
| `${WORKSPACE_MCP_DIR}` | This `mcp/` folder |
| `${KIRO_ROOT}` | `~/.kiro` |
| `${WORKSPACE_NAME}` | Active workspace name |

## Variable resolution order

1. `~/.kiro/tokens.env` (user secrets — never committed)
2. `defaults.env` (team defaults — committed)
3. `variables[].default` in `mcp.json` (fallback)

## Tips

- Use `_overrides` to replace a global server with a team-configured version
- Mark `"secret": true` for tokens/passwords — Koda will mask them in TUI
- Put non-secret team defaults in `defaults.env` so teammates don't need to configure them
- Bundle custom MCP server code in `servers/` — reference with `${WORKSPACE_MCP_DIR}`
- Reuse global MCP binaries via `${KIRO_MCP_DIR}` (e.g., pre-configured Confluence)
