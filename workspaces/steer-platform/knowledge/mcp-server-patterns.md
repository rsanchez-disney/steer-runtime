# MCP server development patterns

## Creating a new MCP server

### Location

```text
steer-runtime/shared/tools/mcp-servers/<name>/
├── mcp-meta.json       ← Required for Koda auto-discovery
├── package.json        ← Dependencies + bundle script
├── src/index.ts        ← Source (TypeScript preferred)
├── dist/index.cjs      ← Built output (single CommonJS bundle)
└── README.md           ← Setup instructions
```

### mcp-meta.json schema

```json
{
  "name": "<name>",
  "description": "What it does",
  "transport": "stdio",
  "command": "node",
  "args": ["dist/index.cjs"],
  "env": {
    "REQUIRED_TOKEN": { "description": "API key for service", "secret": true }
  }
}
```

### Build conventions

- Single-file CJS bundle at `dist/index.cjs` (no node_modules shipped)
- Use esbuild or tsup for bundling
- `npm run bundle` should produce the dist
- Source files (`src/`, `package.json`, `tsconfig.json`) excluded from release tarball

### What Koda does with MCP servers

1. `mcp-install` scans `shared/tools/mcp-servers/*/mcp-meta.json`
2. Presents available servers to user
3. Prompts for required env vars (tokens)
4. Registers in `~/.kiro/settings/mcp.json`
5. kiro-cli reads mcp.json and spawns servers as stdio children

### Common patterns

- **Auth via env vars** — tokens in `~/.kiro/tokens.env`, loaded by Koda
- **Chrome CDP** — for services requiring browser auth (Glow, ServiceNow, Splunk)
- **Self-bootstrapping** — minimal config, discover user context on first run
- **MCP SDK** — use `@modelcontextprotocol/sdk` for stdio transport

### Testing MCP servers locally

```bash
cd shared/tools/mcp-servers/<name>
npm install
npm run bundle
# Test with MCP inspector:
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"capabilities":{}}}' | node dist/index.cjs
```

### Release integration

- `make mcp-build` in steer-runtime builds all servers in parallel
- `make mcp-build-<name>` builds a single server
- `publish-all` runs `mcp-build` before packaging the tarball
- Source files are excluded from the tarball; only `dist/index.cjs` ships
