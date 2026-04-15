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
| appdynamics | `appdynamics-mcp/dist/index.cjs` | `APPD_CLIENT_ID` + `APPD_CLIENT_SECRET` | AppDynamics health, metrics, tiers, snapshots, anomalies (10 tools) |
| servicenow | `servicenow-mcp/dist/index.cjs` | `SNOW_USERNAME` + `SNOW_PASSWORD` | ServiceNow incidents, problems, change requests, CTASKs (15 tools) |

### Remote Servers (SSE)

| Server | Type | Auth | Description |
|--------|------|------|-------------|
| compass | SSE | `COMPASS_TOKEN` | Compass service catalog — custom discoverable tools |

> `mywiki` and `confluence` are separate Confluence instances with separate binaries and unique tool names.

### Docker Servers

| Server | Type | Port | Description |
|--------|------|------|-------------|
| memory | Docker (SSE) | 9377 | Persistent semantic memory — Redis vector search + local embeddings |

## Quick Setup

```bash
koda setup                          # Install all dependencies first
koda mcp-install                    # Setup MCP servers (interactive on first run)
koda install dev ba qa ops pm       # Install agents with tokens injected
```

Or use the Koda TUI:
- `[t]` Tokens — set Jira, Confluence, MyWiki, SonarQube, Harness, Figma, Compass tokens
- `[g]` GitHub — manage GitHub remotes (multi-instance)
- `[e]` Env Vars — configure URLs (Confluence, MyWiki, Compass endpoint)

## Command Modes

`koda mcp-install` adapts its behavior based on your current configuration:

| Scenario                         | Behavior                                                                |
|----------------------------------|-------------------------------------------------------------------------|
| No `mcp.json` exists (first run) | Interactive assistant — server selection, token prompts, GitHub remotes |
| `mcp.json` already has servers   | Quick reinstall — re-verifies and regenerates config silently           |
| `--assistant` flag used          | Forces interactive assistant regardless of existing config              |
| Non-TTY (CI, piped input)        | Installs all verified servers without prompting                         |

```bash
koda mcp-install               # Auto-detects: assistant on first run, quick reinstall after
koda mcp-install --assistant   # Force interactive assistant to reconfigure servers/tokens
echo "" | koda mcp-install     # Non-TTY: install all verified servers silently
```

### Interactive Assistant Flow

The assistant runs automatically on first install (no existing `mcp.json`), or when you pass `--assistant`. It walks through these phases:

1. **Bundle verification** — scans `~/.kiro/tools/mcp-servers/` and reports which servers are ready
2. **Server selection** — numbered toggle list to pick which servers to install (toggle with numbers, `a`=all, `n`=none, `Enter`=confirm)
3. **Token configuration** — prompts only for tokens required by selected servers; existing values shown masked, press Enter to keep
4. **GitHub remotes** (if github selected) — shows existing remotes, lets you add new ones (name → host → token)
5. **Config generation** — writes `~/.kiro/settings/mcp.json` with selected servers and configured tokens

### Quick Reinstall Mode

When `mcp.json` already contains at least one server, running `koda mcp-install` without `--assistant` performs a quick reinstall: re-verifies bundles, selects all verified servers, reads existing tokens and GitHub remotes, and regenerates the config silently.

To reconfigure servers or tokens after initial setup:

```bash
koda mcp-install --assistant
```

### Non-Interactive Mode

When stdin is not a TTY (CI, scripts, piped input), Koda installs all verified servers without prompting. This preserves backward compatibility with automated workflows.

```bash
echo "" | koda mcp-install
```

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

# AppDynamics OAuth (client credentials)
# APPD_CONTROLLER_URL=https://your-controller.saas.appdynamics.com
# APPD_CLIENT_ID=your-client-id@your-account
# APPD_CLIENT_SECRET=your-client-secret

# ServiceNow (basic auth)
# SNOW_INSTANCE=https://your-instance.service-now.com
# SNOW_USERNAME=your-service-account
# SNOW_PASSWORD=your-password

# GitHub remotes (suffixed — one pair per host)
GITHUB_TOKEN_disney=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_HOST_disney=github.disney.com
GITHUB_TOKEN_public=ghp_yyyyyyyyyyyyyyyyyyyy
GITHUB_HOST_public=github.com
```

### Configure tokens

| Method                | Command                                                              |
|-----------------------|----------------------------------------------------------------------|
| Interactive assistant | `koda mcp-install --assistant` (prompts inline for selected servers) |
| TUI                   | `koda` → `[t]` Tokens                                                |
| CLI                   | `koda configure`                                                     |
| Direct                | Edit `~/.kiro/tokens.env` then `koda install <profiles>`             |

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
| AppDynamics | Controller → Settings → Administration → API Clients (OAuth client credentials) |
| ServiceNow | Service account with API access — contact your ServiceNow admin |

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

## Memory MCP (Docker)

Unlike stdio and SSE servers, memory-mcp runs as a **Docker Compose** service — two containers (FastAPI app + Redis Stack).

### Lifecycle

```bash
koda memory start     # docker compose up -d (pulls images on first run)
koda memory status    # Check container health
koda memory stop      # docker compose down
```

Or via Kite: Settings → Health tab → memory-mcp toggle.

### mcp.json entry

```json
"memory": {
  "url": "http://localhost:9377/mcp",
  "type": "sse"
}
```

`koda mcp-install` generates this entry automatically when memory-mcp containers are detected.

### Container runtime

Set `CONTAINER_RUNTIME` in your shell or env.vars if auto-detection picks the wrong one:

```bash
export CONTAINER_RUNTIME=podman   # or docker, nerdctl
```

> See [MEMORY_MCP.md](MEMORY_MCP.md) for full details — data model, tools reference, and troubleshooting.

## AppDynamics MCP

Queries the AppDynamics REST API using OAuth 2.0 client credentials. Provides 10 tools for application health monitoring.

### Setup

```bash
cd shared/tools/mcp-servers/appdynamics-mcp
npm install
npm run build
```

### mcp.json entry

```json
"appdynamics-mcp": {
  "command": "node",
  "args": ["/path/to/appdynamics-mcp/dist/index.cjs"],
  "env": {
    "APPD_CONTROLLER_URL": "https://your-controller.saas.appdynamics.com",
    "APPD_CLIENT_ID": "your-client-id@your-account",
    "APPD_CLIENT_SECRET": "your-client-secret"
  }
}
```

### Tools

`list_applications`, `get_application_health`, `get_business_transactions`, `get_metric_data`, `get_tiers`, `get_nodes`, `get_health_violations`, `get_error_rate`, `get_snapshots`, `get_anomalies`

### Skills

- `appdynamics-health-check` — 7-step health assessment with 24h baseline comparison and per-tier analysis

> See [appdynamics-mcp README](../shared/tools/mcp-servers/appdynamics-mcp/README.md) for full details.

## ServiceNow MCP

Manages ServiceNow incidents, problems, change requests, and CTASKs via the REST API using HTTP Basic Auth. Provides 15 tools.

### Setup

```bash
cd shared/tools/mcp-servers/servicenow-mcp
npm install
npm run build
```

### mcp.json entry

```json
"servicenow-mcp": {
  "command": "node",
  "args": ["/path/to/servicenow-mcp/dist/index.cjs"],
  "env": {
    "SNOW_INSTANCE": "https://your-instance.service-now.com",
    "SNOW_USERNAME": "your-service-account",
    "SNOW_PASSWORD": "your-password"
  }
}
```

### Tools

`get_incident`, `add_work_note`, `change_ci`, `change_assignment_group`, `add_parent_incident`, `resolve_incident`, `update_incident`, `query_incidents`, `create_incident`, `create_problem`, `create_change_request`, `get_ctask`, `add_ctask_work_note`, `update_ctask`, `close_ctask`

### Skills

- `servicenow-incident-ops` — 9 workflows for incident triage, routing, resolution, CTASK management, and reporting

### Disney Instance Notes

- State codes are non-standard: `12` = Pending Vendor, `14` = Canceled
- Use `sysparm_display_value=all` in queries to see both raw and display values

> See [servicenow-mcp README](../shared/tools/mcp-servers/servicenow-mcp/README.md) for full details.

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

| Issue                               | Fix                                                                                               |
|-------------------------------------|---------------------------------------------------------------------------------------------------|
| `0 MCP servers available`           | steer-runtime hasn't been synced yet — run `koda sync` first                                      |
| Bundle missing for a server         | Server shows `(bundle missing)` in the selector — run `koda sync --update` to re-download bundles |
| context7 install fails              | Requires `npm` on your PATH — run `koda setup` to install Node.js                                 |
| Compass not in config               | Compass only appears if `COMPASS_TOKEN` is set — enter it during the token prompt                 |
| Tokens showing `YOUR_TOKEN`         | `koda install <profiles>` to re-inject                                                            |
| MyWiki tools rejected as duplicates | Rebuild: `cd ~/.kiro/tools/mcp-servers/mywiki-mcp && npm run build`                               |
| Mermaid init failure                | Rebuild: `cd ~/.kiro/tools/mcp-servers/mermaid-diagram-mcp && npm run build`                      |
| Delegation timeout                  | Check agent JSON has real tokens — global mcp.json only applies to direct sessions                |
| Compass connection failed           | Verify `COMPASS_URL` in env.vars and `COMPASS_TOKEN` in tokens.env                                |
| memory-mcp tools unavailable        | Run `koda memory start` — containers must be running. Check port 9377                             |
| appdynamics-mcp `fetch is not defined` | Node.js < 16 or missing `node-fetch` — run `npm install` in the server directory                |
| appdynamics-mcp `OAuth token error` | Verify `APPD_CLIENT_ID` and `APPD_CLIENT_SECRET` in mcp.json env block                           |
| servicenow-mcp `401 Unauthorized`   | Verify `SNOW_USERNAME` and `SNOW_PASSWORD` in mcp.json env block                                  |
| servicenow-mcp query returns wrong results | State codes are instance-specific — use numeric values (12=Pending Vendor, 14=Canceled)     |

---

Back to [README](../README.md)
