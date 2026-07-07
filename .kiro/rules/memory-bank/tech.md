# steer-runtime — Technical Context

## MCP Architecture (updated March 22, 2026)

### Token Management
- Single source of truth: `~/.kiro/tokens.env`
- Keys: `JIRA_PAT`, `CONFLUENCE_PAT`, `MYWIKI_PAT`, `GITHUB_TOKEN_disney`
- `./setup.sh mcp-install` writes individual `.env` files + generates `tokens.env`
- `./setup.sh install` reads `tokens.env` and injects into agent JSON `mcpServers.env` blocks
- `./setup.sh configure` edits `tokens.env` directly

### MCP Servers (6 active + 2 optional)
| Server | Binary | Notes |
|--------|--------|-------|
| jira | `jira-mcp/dist/index.cjs` | |
| confluence | `confluence-mcp/dist/index.cjs` | confluence.disney.com |
| cloud-wiki | `confluence-mcp/dist/index.cjs` | disneyexperiences.atlassian.net/wiki — reuses confluence-mcp binary with CONFLUENCE_URL env |
| github | `github-mcp/dist/index.cjs` | github.disney.com |
| mermaid | `mermaid-diagram-mcp/dist/index.cjs` | SDK 0.6.0, two-arg Server constructor |
| sonarqube | `docker mcp/sonarqube` | disabled by default |
| harness | `docker harness/mcp-server` | disabled by default |

### Key Design Decisions
- **cloud-wiki has its own binary** — cannot share `confluence-mcp` because kiro-cli rejects duplicate tool names. Tool names prefixed with `cloud_` (e.g., `get_cloud_page`).
- **mermaid uses SDK 0.6.0** — two-argument `Server()` constructor. Source has no shebang (esbuild banner adds it). No `import.meta.url` (CJS provides `__dirname`).
- **Tokens must be in agent JSONs** — global `mcp.json` only applies to direct sessions. Delegated sessions (orchestrator → specialist) use the agent's own `mcpServers.env` block.
- **All MCP bundles built with esbuild** — `--platform=node --format=cjs --outfile=dist/index.cjs`

### Build Commands
```bash
# Rebuild any MCP server
cd ~/.kiro/tools/mcp-servers/<server-name> && npm run build
```

## setup.sh Architecture
- Uses bash 3.2 (macOS default) — no `local -n` namerefs
- `install_profile()` copies agents + calls `inject_agent_tokens()`
- `inject_agent_tokens()` reads `tokens.env`, iterates agent JSONs, uses Python for JSON manipulation
- `expand_profile_aliases()` has a bash 4.3+ nameref bug (works around via direct profile listing)
