# Building Custom MCPs

A step-by-step guide for creating custom MCP servers at the fork or workspace level.

---

## Choose Your Level

| I want to... | Level | Location |
|-------------|-------|----------|
| Add an MCP for ALL teams in my fork | Fork | `shared/tools/mcp-servers/<name>/` |
| Add an MCP for ONE team/workspace | Workspace | `workspaces/<team>/mcp/` |
| Pre-configure a global MCP for my team | Workspace (override) | `workspaces/<team>/mcp/` with `_overrides` |

---

## Option A: Create a Fork-Level MCP

### Step 1: Scaffold the server

```bash
cd steer-runtime/shared/tools/mcp-servers
mkdir my-tool-mcp && cd my-tool-mcp
npm init -y
npm install @modelcontextprotocol/sdk
```

### Step 2: Create `mcp-meta.json`

This is the descriptor Koda reads to auto-register your MCP:

```json
{
  "name": "my-tool",
  "description": "What this MCP does (shown in koda mcp status)",
  "type": "node",
  "entry": "dist/index.cjs",
  "env": {
    "MY_TOOL_URL": "Base URL for the tool",
    "MY_TOOL_TOKEN": "API authentication token"
  },
  "env_required": ["MY_TOOL_URL", "MY_TOOL_TOKEN"],
  "env_secret": ["MY_TOOL_TOKEN"],
  "env_defaults": {
    "MY_TOOL_URL": "https://my-tool.wdprapps.disney.com"
  }
}
```

**Field reference:**

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Server name in mcp.json (e.g., `my-tool`) |
| `description` | No | Human-readable description |
| `type` | No | `node` (default), `docker`, `python` |
| `entry` | No | Entry point (default: `dist/index.cjs`) |
| `env` | No | Map of env var → description |
| `env_required` | No | Vars that must be set (Koda prompts if missing) |
| `env_secret` | No | Vars masked in TUI prompts |
| `env_defaults` | No | Default values (used when not in tokens.env) |

### Step 3: Implement the server

```typescript
// src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server(
  { name: "my-tool", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler("tools/list", async () => ({
  tools: [
    {
      name: "my_tool_query",
      description: "Query my tool",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" }
        },
        required: ["query"]
      }
    }
  ]
}));

server.setRequestHandler("tools/call", async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === "my_tool_query") {
    const url = process.env.MY_TOOL_URL;
    const token = process.env.MY_TOOL_TOKEN;
    // ... implement your tool logic
    return { content: [{ type: "text", text: "result" }] };
  }
  
  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

### Step 4: Build

```bash
# Add to package.json scripts:
# "build": "esbuild src/index.ts --bundle --platform=node --outfile=dist/index.cjs --format=cjs"

npm run build
```

### Step 5: Add `.env.example`

```env
MY_TOOL_URL=https://my-tool.wdprapps.disney.com
MY_TOOL_TOKEN=your-api-token-here
```

### Step 6: Commit and push

```bash
git add shared/tools/mcp-servers/my-tool-mcp/
git commit -m "feat: add my-tool MCP server"
git push
```

### Step 7: Users install

```bash
koda upgrade   # or: koda mcp-install
# Koda discovers mcp-meta.json, prompts for MY_TOOL_TOKEN, registers in mcp.json
```

---

## Option B: Create a Workspace-Level MCP

### Step 1: Use the template

```bash
cp -r shared/templates/workspace-mcp workspaces/my-team/mcp
```

### Step 2: Define servers in `mcp/mcp.json`

```json
{
  "mcpServers": {
    "team-api": {
      "command": "node",
      "args": ["${WORKSPACE_MCP_DIR}/servers/team-api/index.js"],
      "env": {
        "API_URL": "${TEAM_API_URL}",
        "API_TOKEN": "${TEAM_API_TOKEN}"
      }
    }
  },
  "variables": {
    "TEAM_API_URL": {
      "description": "Team API base URL",
      "required": true,
      "default": "https://latest.team-api.wdprapps.disney.com"
    },
    "TEAM_API_TOKEN": {
      "description": "Team API authentication token",
      "required": true,
      "secret": true
    }
  }
}
```

### Step 3: Add team defaults

Create `mcp/defaults.env`:

```env
# Team-shared defaults (non-secret, committed)
TEAM_API_URL=https://latest.team-api.wdprapps.disney.com
```

### Step 4: Bundle server code (optional)

If your MCP is custom code (not reusing a global binary):

```bash
mkdir -p workspaces/my-team/mcp/servers/team-api
# Add your MCP server code here
```

Reference it with `${WORKSPACE_MCP_DIR}/servers/team-api/index.js`.

### Step 5: Commit

```bash
git add workspaces/my-team/mcp/
git commit -m "feat: add team-api workspace MCP for my-team"
```

### Step 6: Users activate

```bash
koda workspace use my-team
# Koda reads mcp/mcp.json, resolves variables, prompts for TEAM_API_TOKEN
```

---

## Option C: Override a Global MCP with Team Config

Use `_overrides` to replace a global server with a pre-configured version:

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
    }
  },
  "variables": {}
}
```

This replaces the generic `confluence` server with one pre-configured for the Payments space. The user still provides their `CONFLUENCE_PAT` via `tokens.env`.

---

## Testing Your MCP Locally

### Test the server directly

```bash
# Set env vars
export MY_TOOL_URL=https://my-tool.wdprapps.disney.com
export MY_TOOL_TOKEN=test-token

# Run the server
node dist/index.cjs

# In another terminal, send a test request via stdio
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node dist/index.cjs
```

### Test with Kiro CLI

```bash
# Add temporarily to mcp.json
koda mcp status  # verify it appears

# Start a chat
kiro chat
# Ask the agent to use your tool
```

### Verify variable resolution

```bash
# Check what Koda resolves
koda mcp status
# Should show your server as "configured" or "missing: VAR_NAME"
```

---

## Best Practices

### Do

- ✅ Use `env_defaults` for non-secret values (URLs, project IDs)
- ✅ Mark tokens/passwords as `env_secret` (masked in TUI)
- ✅ Include a `description` for every variable
- ✅ Add `.env.example` for developer reference
- ✅ Use `${KIRO_MCP_DIR}` to reference global MCP binaries
- ✅ Use `${WORKSPACE_MCP_DIR}` for bundled workspace code
- ✅ Test your MCP server standalone before integrating

### Don't

- ❌ Put secrets in `defaults.env` (use `tokens.env`)
- ❌ Hardcode absolute paths (use `${VAR}` path variables)
- ❌ Name your server with a global prefix (e.g., don't name it `jira-custom` — use `team-jira`)
- ❌ Commit `node_modules/` (only commit `dist/`)
- ❌ Skip `mcp-meta.json` for fork MCPs (Koda won't discover it)

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| MCP not appearing after `koda mcp-install` | Check `mcp-meta.json` exists and has valid JSON |
| "missing: VAR_NAME" in `koda mcp status` | Run `koda configure` (TUI `m`) to set the variable |
| Server errors in agent chat | Check env vars: `echo $MY_TOOL_URL` |
| Workspace MCP not loading | Verify `koda workspace use <name>` is run |
| Override not working | Check `_overrides` value matches exact global server name |
| Variable not resolving | Check order: tokens.env > defaults.env > default |

---

## Reference: Path Variables

| Variable | Resolves To | Example |
|----------|-------------|---------|
| `${KIRO_MCP_DIR}` | `~/.kiro/tools/mcp-servers` | Reuse global MCP binaries |
| `${WORKSPACE_MCP_DIR}` | `<steer-root>/workspaces/<name>/mcp` | Reference bundled code |
| `${KIRO_ROOT}` | `~/.kiro` | Reference Kiro home |
| `${WORKSPACE_NAME}` | Active workspace name | Dynamic references |
