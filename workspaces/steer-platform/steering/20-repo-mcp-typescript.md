---
inclusion: fileMatch
fileMatchPattern: ["shared/tools/mcp-servers/**/*.ts", "shared/tools/mcp-servers/**/*.js", "shared/tools/mcp-servers/**/package.json", "shared/tools/mcp-servers/**/tsconfig.json"]
description: TypeScript rules for steer-runtime MCP servers
---

# MCP servers (TypeScript) steering

## Architecture

- Each MCP server lives in `shared/tools/mcp-servers/<name>/`
- Source in `src/`, bundled output in `dist/` (esbuild → single CJS file)
- Every server must have `mcp-meta.json` for Koda auto-discovery
- Servers communicate via stdio transport (stdin/stdout JSON-RPC)

## Structure

```text
shared/tools/mcp-servers/<name>/
├── src/
│   ├── index.ts          ← Entry point, MCP server setup
│   ├── tools/            ← Tool definitions (one file per tool or group)
│   └── utils/            ← Shared helpers
├── dist/
│   └── index.js          ← Bundled output (committed)
├── package.json
├── tsconfig.json
├── esbuild.config.js
└── mcp-meta.json         ← Koda discovery metadata
```

## Conventions

- Use the `@modelcontextprotocol/sdk` package for server scaffold
- Tools must define JSON Schema for parameters — no `any` types
- Environment variables: declare in `mcp-meta.json` `env` section
- Required secrets: list in `env_secret` — Koda routes to `tokens.env`
- Always handle errors gracefully — return error responses, never crash
- Use `toolPrefix.ts` pattern for multi-instance support (see confluence-mcp, jira-mcp)

## Building

- `npm run build` → esbuild bundles to `dist/index.js`
- Bundle IS committed (users without Node can still use the server)
- After changes: rebuild and commit both source and dist

## Multi-instance support

- Servers that support multiple instances (Jira, Confluence, GitHub) use tool prefixing
- Pattern: `${prefix}_${toolName}` where prefix comes from MCP server name
- Example: server named `jira-cloud` → tools become `jira_cloud_get_issue`, etc.

## Testing

- Test with `echo '{"jsonrpc":"2.0","method":"..."}' | node dist/index.js`
- Use `koda doctor` to verify MCP health after changes
- Validate mcp-meta.json against the schema in Koda's `internal/ops/mcp.go`

## Do not

- Do not add runtime dependencies that aren't bundled — only the `dist/` output runs
- Do not use `console.log` for user messages — use stderr for diagnostics
- Do not hardcode URLs or credentials — use environment variables
- Do not break existing tool names — downstream agents reference them
