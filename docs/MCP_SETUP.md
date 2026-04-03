# MCP Server Setup

## Overview

steer-runtime uses MCP (Model Context Protocol) servers to give agents access to external tools. Servers are either **local** (pre-built Node.js bundles) or **remote** (SSE endpoints). Tokens are centralized in `~/.kiro/tokens.env`, env vars in `~/.kiro/env.vars`.

## Available MCP Servers

### Local Servers (pre-built bundles)

| Server | Bundle | Auth | Description |
|--------|--------|------|-------------|
| jira | `jira-mcp/dist/index.cjs` | `JIRA_PAT` | Jira issues, boards, sprints |
| confluence | `confluence-mcp/dist/index.cjs` | `CONFLUENCE_PAT` | Confluence pages, search |
| mywiki | `mywiki-mcp/dist/index.cjs` | `MYWIKI_PAT` | MyWiki (separate Confluence instance) |
| github | `github-mcp/dist/index.cjs` | `GITHUB_TOKEN_{remote}` | GitHub PRs, repos, issues (multi-instance) |
| figma | `figma-mcp/dist/index.cjs` | `FIGMA_TOKEN` | Figma files, nodes, styles, comments, image export |
| mermaid | `mermaid-diagram-mcp/dist/index.cjs` | none | Mermaid diagram rendering |
| bruno | `bruno-mcp/dist/index.cjs` | none | Bruno API collection runner |
| context7 | `npx @upstash/context7-mcp` | none | Library documentation lookup |

### Remote Servers (SSE)

| Server | Type | Auth | Description |
|--------|------|------|-------------|
| compass | SSE | `COMPASS_TOKEN` | Compass service catalog — custom discoverable tools |

> `mywiki` and `confluence` are separate Confluence instances with separate binaries and unique tool names.

## Quick Setup

```bash
koda mcp-install                    # Verify bundles + generate mcp.json
koda install dev ba qa ops pm       # Install agents with tokens injected
```

Or use the Koda TUI:
- `[t]` Tokens — set Jira, Confluence, MyWiki, SonarQube, Harness, Figma, Compass tokens
- `[g]` GitHub — manage GitHub remotes (multi-instance)
- `[e]` Env Vars — configure URLs (Confluence, MyWiki, Compass endpoint)

## Token Management

### tokens.env

All tokens live in `~/.kiro/tokens.env`:

```env
# Simple tokens (one per service)
JIRA_PAT=your-jira-pat
CONFLUENCE_PAT=your-confluence-pat
MYWIKI_PAT=your-mywiki-pat
FIGMA_TOKEN=your-figma-token
COMPASS_TOKEN=your-compass-token
# SONARQUBE_TOKEN=
# HARNESS_API_KEY=

# GitHub remotes (suffixed — one pair per host)
GITHUB_TOKEN_disney=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_HOST_disney=github.disney.com
GITHUB_TOKEN_public=ghp_yyyyyyyyyyyyyyyyyyyy
GITHUB_HOST_public=github.com
```

### Configure tokens

| Method | Command |
|--------|---------|
| TUI | `koda` → `[t]` Tokens |
| CLI | `koda configure` |
| Direct | Edit `~/.kiro/tokens.env` then `koda install <profiles>` |

### env.vars

Configurable URLs and endpoints in `~/.kiro/env.vars`:

| Key | Default | Description |
|-----|---------|-------------|
| `CONFLUENCE_URL` | `https://confluence.disney.com` | Confluence base URL |
| `MYWIKI_URL` | `https://mywiki.disney.com` | MyWiki base URL |
| `JIRA_URL` | `https://jira.disney.com` | Jira base URL |
| `COMPASS_URL` | `https://compass.wdprapps.disney.com/api/mcp/mcp-...` | Compass MCP endpoint (user-configurable) |

Configure via TUI `[e]` Env Vars or edit `~/.kiro/env.vars` directly.

### How tokens flow

```
~/.kiro/tokens.env
  ├── koda install → injects into ~/.kiro/agents/*.json env blocks
  ├── koda mcp-install → generates ~/.kiro/settings/mcp.json
  └── setup.sh cursor install → generates .cursor/mcp.json
```

### Generate tokens

| Service | URL |
|---------|-----|
| Jira | https://myjira.disney.com/secure/ViewProfile.jspa → Personal Access Tokens |
| Confluence | https://confluence.disney.com/plugins/personalaccesstokens/usertokens.action |
| MyWiki | https://mywiki.disney.com/plugins/personalaccesstokens/usertokens.action |
| GitHub | `https://{host}/settings/tokens` (one per remote) |
| Figma | https://www.figma.com/developers/api#access-tokens |
| Compass | Contact your team lead |

## Multi-Instance GitHub

The `github-mcp` server supports N independent processes — one per GitHub host.

### Setup

Via TUI: `koda` → `[g]` GitHub → `n` to add remote (name → host → token).

Via tokens.env:
```env
GITHUB_TOKEN_disney=ghp_xxx
GITHUB_HOST_disney=github.disney.com
GITHUB_TOKEN_public=ghp_yyy
GITHUB_HOST_public=github.com
```

### Behavior

| Remotes | mcp.json entry | Tool prefix |
|---------|---------------|-------------|
| 1 remote | `"github"` (backward compat) | none |
| 2+ remotes | `"github-disney"`, `"github-public"` | `disney_`, `public_` |

Each process gets flat env vars: `GITHUB_REMOTE`, `GITHUB_HOST`, `GITHUB_TOKEN`. Tool names are prefixed with the remote name to avoid collisions.

### Backward compatibility

Existing `GITHUB_TOKEN` + `GITHUB_URL` → treated as single remote named "disney".

## Compass MCP

Compass is a **remote SSE MCP** — no local bundle needed. It connects to the Compass service catalog at Disney, providing custom discoverable tools.

### Setup

1. Set token: TUI `[t]` → Compass Token, or add `COMPASS_TOKEN=...` to tokens.env
2. (Optional) Custom endpoint: TUI `[e]` → `COMPASS_URL`, or edit env.vars

### Generated mcp.json entry

```json
"compass": {
  "url": "https://compass.wdprapps.disney.com/api/mcp/mcp-YOUR-ID",
  "type": "sse",
  "headers": { "Authorization": "Bearer <token>" }
}
```

The URL is configurable via `COMPASS_URL` in env.vars — each user can point to their own Compass MCP instance.

## Verification

```bash
# Check local bundles
ls ~/.kiro/tools/mcp-servers/*/dist/index.cjs

# Check tokens
cat ~/.kiro/tokens.env

# Check mcp.json
cat ~/.kiro/settings/mcp.json | python3 -m json.tool

# Check agents have real tokens
grep -rl 'YOUR_TOKEN' ~/.kiro/agents/*.json | wc -l   # should be 0
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Tokens showing `YOUR_TOKEN` | `koda install <profiles>` to re-inject |
| MyWiki tools rejected as duplicates | Rebuild: `cd ~/.kiro/tools/mcp-servers/mywiki-mcp && npm run build` |
| Mermaid init failure | Rebuild: `cd ~/.kiro/tools/mcp-servers/mermaid-diagram-mcp && npm run build` |
| Delegation timeout | Check agent JSON has real tokens — global mcp.json only applies to direct sessions |
| Compass connection failed | Verify `COMPASS_URL` in env.vars and `COMPASS_TOKEN` in tokens.env |

---

Back to [README](../README.md)
