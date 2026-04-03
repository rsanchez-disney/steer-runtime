# MCP Server Setup

## Overview

steer-runtime uses pre-built MCP server bundles in `~/.kiro/tools/mcp-servers/`. Tokens are centralized in `~/.kiro/tokens.env`.

| Server     | Binary                               | Auth                    | Used by                          |
|------------|--------------------------------------|-------------------------|----------------------------------|
| jira       | `jira-mcp/dist/index.cjs`            | `JIRA_PAT`              | 19 agents                        |
| confluence | `confluence-mcp/dist/index.cjs`      | `CONFLUENCE_PAT`        | 18 agents                        |
| mywiki     | `mywiki-mcp/dist/index.cjs`          | `MYWIKI_PAT`            | 18 agents                        |
| github     | `github-mcp/dist/index.cjs`          | `GITHUB_TOKEN_{remote}` | 14 agents (per-remote instances) |
| mermaid    | `mermaid-diagram-mcp/dist/index.cjs` | none                    | on-demand                        |
| context7   | `npx @upstash/context7-mcp`          | none                    | 8 coding agents                  |
| sonarqube  | `docker mcp/sonarqube`               | `SONARQUBE_TOKEN`       | code_quality_agent               |
| harness    | `docker harness/mcp-server`          | `HARNESS_API_KEY`       | deployment_agent                 |

> **Note:** `mywiki` and `confluence` are separate Confluence instances (mywiki.disney.com vs confluence.disney.com) with separate MCP binaries and unique tool names to avoid collisions.

## Quick Setup

```bash
koda mcp-install          # Verify bundles + configure tokens interactively
koda install dev ba qa ops pm   # Install agents with tokens injected
```

## Token Management

### Centralized tokens file

All tokens live in one file: `~/.kiro/tokens.env`

```env
JIRA_PAT=your-jira-pat
CONFLUENCE_PAT=your-confluence-pat
MYWIKI_PAT=your-mywiki-pat

# GitHub — one pair of keys per remote (suffixed with the remote name)
GITHUB_TOKEN_disney=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_HOST_disney=github.disney.com
GITHUB_TOKEN_public=ghp_yyyyyyyyyyyyyyyyyyyy
GITHUB_HOST_public=github.com
# optional, defaults to /api/v3
# GITHUB_API_PATH_disney=/api/v3

# SONARQUBE_TOKEN=
# HARNESS_API_KEY=
```

GitHub tokens use a **suffixed key pattern** — each remote gets its own `GITHUB_TOKEN_{remote}` and `GITHUB_HOST_{remote}` pair. See [Multi-Instance GitHub Configuration](#multi-instance-github-configuration) for details.

### How tokens flow

```
~/.kiro/tokens.env (single source of truth)
  ├── koda install → injects into ~/.kiro/agents/*.json env blocks
  ├── koda mcp-install → generates ~/.kiro/settings/mcp.json
  └── ./setup.sh cursor install → generates .cursor/mcp.json
```

### Configure tokens

Option A — interactive:
```bash
koda mcp-install    # Prompts for each token, saves to .env files + tokens.env
```

Option B — edit directly:
```bash
vi ~/.kiro/tokens.env     # Edit tokens
koda install dev ba qa ops pm   # Re-inject into agents
```

Option C — quick configure:
```bash
koda configure      # Interactive editor for tokens.env
```

### Generate tokens

| Service          | URL                                                                                                                           |
|------------------|-------------------------------------------------------------------------------------------------------------------------------|
| Jira             | https://myjira.disney.com/secure/ViewProfile.jspa?selectedTab=com.atlassian.pats.pats-plugin:jira-user-personal-access-tokens |
| Confluence       | https://confluence.disney.com/plugins/personalaccesstokens/usertokens.action                                                  |
| MyWiki           | https://mywiki.disney.com/plugins/personalaccesstokens/usertokens.action                                                      |
| GitHub (public)  | https://github.com/settings/tokens                                                                                            |
| GitHub (disney)  | https://github.disney.com/settings/tokens                                                                                     |
| GitHub (espn)    | https://github.espn.com/settings/tokens                                                                                       |

> Add a row for each GitHub remote you configure. The token URL follows the pattern `https://{host}/settings/tokens`.

## Multi-Instance GitHub Configuration

The `github-mcp` server supports running as multiple independent processes — one per GitHub host. Each process receives flat, non-suffixed environment variables via the MCP JSON `env` block. The `setup.sh` script handles the mapping from suffixed keys in `tokens.env` to flat vars per process.

### How it works

1. You store credentials in `tokens.env` using **suffixed keys** (one pair per remote):

   | Suffixed Key (tokens.env)  | Description                                         |
   |----------------------------|-----------------------------------------------------|
   | `GITHUB_TOKEN_{remote}`    | GitHub PAT for this remote                          |
   | `GITHUB_HOST_{remote}`     | GitHub hostname (e.g., `github.disney.com`)         |
   | `GITHUB_API_PATH_{remote}` | API path override (optional, defaults to `/api/v3`) |

2. `setup.sh` discovers all remotes by scanning for `GITHUB_TOKEN_{remote}` keys.

3. For each remote, `setup.sh` generates an `mcpServers` entry named `github-{remote}` with **flat env vars** scoped to that process:

   | Flat Env Var (per process) | Mapped from                                    |
   |----------------------------|------------------------------------------------|
   | `GITHUB_REMOTE`            | The remote name itself                         |
   | `GITHUB_HOST`              | `GITHUB_HOST_{remote}`                         |
   | `GITHUB_TOKEN`             | `GITHUB_TOKEN_{remote}`                        |
   | `GITHUB_API_PATH`          | `GITHUB_API_PATH_{remote}` (only when present) |

4. Each process prefixes its tool names with the remote name (e.g., `disney_github_get_pr`) to avoid MCP client name collisions.

### Example `tokens.env`

```env
GITHUB_TOKEN_disney=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_HOST_disney=github.disney.com
GITHUB_TOKEN_public=ghp_yyyyyyyyyyyyyyyyyyyy
GITHUB_HOST_public=github.com
```

### Generated `mcp.json`

Running `koda mcp-install` with the above `tokens.env` produces:

```json
{
  "mcpServers": {
    "github-disney": {
      "command": "node",
      "args": ["~/.kiro/tools/mcp-servers/github-mcp/dist/index.cjs"],
      "env": {
        "GITHUB_REMOTE": "disney",
        "GITHUB_HOST": "github.disney.com",
        "GITHUB_TOKEN": "ghp_xxxxxxxxxxxxxxxxxxxx"
      }
    },
    "github-public": {
      "command": "node",
      "args": ["~/.kiro/tools/mcp-servers/github-mcp/dist/index.cjs"],
      "env": {
        "GITHUB_REMOTE": "public",
        "GITHUB_HOST": "github.com",
        "GITHUB_TOKEN": "ghp_yyyyyyyyyyyyyyyyyyyy"
      }
    }
  }
}
```

The same pattern applies to `setup.sh cursor install` (writes `.cursor/mcp.json`) and `inject_agent_tokens()` (updates agent JSON files).

### Adding a new remote

Interactive:
```bash
koda mcp-install
# Prompts: remote name → host → token → "Add another? (y/N)"
```

Manual:
```bash
# 1. Add suffixed keys to tokens.env
echo 'GITHUB_TOKEN_espn=ghp_zzzzzzzzzzzzzzzzzzzz' >> ~/.kiro/tokens.env
echo 'GITHUB_HOST_espn=github.espn.com' >> ~/.kiro/tokens.env

# 2. Regenerate mcp.json and re-inject agent tokens
koda mcp-install
koda install dev ba qa ops pm
```

### Backward compatibility

If no `GITHUB_TOKEN_{remote}` keys are found in `tokens.env`, `setup.sh` falls back to generating a single `github` entry using the legacy `GITHUB_URL` + `GITHUB_TOKEN` variables. The server also falls back to reading `GITHUB_URL` from a local `.env` file when `GITHUB_HOST` is not set, preserving local development workflows.

## Kiro CLI Global Config

`~/.kiro/settings/mcp.json` is auto-generated by `koda mcp-install`. It provides MCP servers for direct kiro-cli sessions (non-delegated).

## Verification

```bash
# Check bundles exist
ls ~/.kiro/tools/mcp-servers/*/dist/index.cjs

# Check tokens are set
cat ~/.kiro/tokens.env

# Check agents have real tokens (not YOUR_TOKEN)
grep -rl 'YOUR_TOKEN' ~/.kiro/agents/*.json | wc -l
# Should be 0 (or only sonarqube/harness agents)
```

## Troubleshooting

### MyWiki tools rejected as duplicates

Both confluence and mywiki are Confluence-based. If you see "tools rejected because they conflict", the mywiki-mcp bundle needs rebuilding with unique tool names:

```bash
cd ~/.kiro/tools/mcp-servers/mywiki-mcp && npm run build
```

### Mermaid init failure

If mermaid shows "connection closed: initialize response", rebuild:

```bash
cd ~/.kiro/tools/mcp-servers/mermaid-diagram-mcp && npm run build
```

### Tokens showing YOUR_TOKEN after install

Re-inject from tokens.env:

```bash
koda install dev ba qa ops pm
```

### Delegation timeout

If delegated agents time out, check that the agent JSON has real tokens (not placeholders). The global `mcp.json` only applies to direct sessions — delegated sessions use the agent's own `mcpServers.env` block.

---

Back to [README](../README.md)
