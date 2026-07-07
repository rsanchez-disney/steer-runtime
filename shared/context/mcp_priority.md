# MCP Tool Priority

When multiple MCP servers can handle the same task, follow this priority:

## Dedicated MCP First (preferred)

| Task | Use | Tools |
|------|-----|-------|
| Jira tickets, sprints, boards (Cloud) | `@jira-cloud/*` | cloud_get_issue, cloud_search_issues, etc. |
| Jira tickets (on-prem) | `@jira-jira/*` | jira_get_issue, jira_search_issues, etc. |
| Confluence pages (confluence.disney.com) | `@confluence/*` | confluence_get_confluence_page, etc. |
| Confluence Cloud pages (disneyexperiences.atlassian.net/wiki) | `@confluence-cloud/*` | cloud_get_confluence_page, etc. |
| GitHub PRs, repos | `@github/*` | github_get_pr, github_list_repos, etc. |

## Server-to-Prefix Mapping

The MCP config uses multi-instance naming. Here's how server names map to tool prefixes:

| mcp.json server name | Tool prefix | Target URL |
|---------------------|-------------|------------|
| `confluence-confluence` | `confluence_` | confluence.disney.com |
| `confluence-cloud` | `cloud_` | disneyexperiences.atlassian.net/wiki |
| `jira-jira` | `jira_` | jira.disney.com |
| `jira-cloud` | `cloud_` | disneyexperiences.atlassian.net |
| `github-disney` | `@github/*` | github.disney.com |
| `github-public` | `@github/*` | github.com |

**Confluence routing by URL:**
- `confluence.disney.com` → `@confluence/*` (on-prem, still active)
- `disneyexperiences.atlassian.net/wiki` → `@confluence-cloud/*` (prefix: `cloud_`)

## Compass MCP (fallback or exclusive)

| Task | Use | When |
|------|-----|------|
| Email | Compass `sre_toolsets_email_send_email` | Always (Compass only) |
| Splunk / Log analysis | Compass log tools | Always (Compass only) |
| ServiceNow (INC, CHG) | Compass `servicenow_tool_snow_*` | Always (Compass only) |
| GitHub via Compass | Compass GitHub tools | Only if `@github/*` tools are not available |
| Jira via Compass | Compass Jira tools | Only if `@jira/*` tools are not available |
| Confluence via Compass | Compass Confluence tools | Only if `@confluence/*` tools are not available |

## Rule

**Always prefer dedicated MCP servers over Compass for Jira and Confluence.** Dedicated servers have instance-specific auth, richer schemas, and multi-instance support. Use Compass for email, logs, and ServiceNow.

**Fallback**: If `@jira/*`, `@confluence/*`, or `@github/*` tools are unavailable (no dedicated MCP configured), use `@compass/*` tools instead. Key agents (`story_analyzer_agent`, `planner_agent`, `pr_creator_agent`) have `@compass/*` in their allowed tools for this purpose.

## Workspace-Level and Fork-Level MCPs

Teams can define custom MCP servers at two levels:

### Fork-level MCPs (`shared/tools/mcp-servers/<name>/`)

Custom MCPs added to a team's steer-runtime fork. Koda auto-discovers them via `mcp-meta.json`:

```json
{
  "name": "server-name",
  "env": { "VAR": "description" },
  "env_required": ["VAR"],
  "env_secret": ["VAR"],
  "env_defaults": { "VAR": "default" }
}
```

- Koda scans `shared/tools/mcp-servers/*/mcp-meta.json` during `mcp-install`
- Unknown servers (not in the global list) are registered as fork MCPs
- Variables resolved from `tokens.env` → `env_defaults`
- Tagged `_source: "fork"` in final mcp.json

### Workspace-level MCPs (`workspaces/<team>/mcp/`)

Team-specific MCPs that activate with the workspace:

```
workspaces/<team>/mcp/
├── mcp.json          ← Server definitions + variable declarations
├── defaults.env      ← Team-shared non-secret defaults
└── servers/          ← Optional bundled MCP server code
```

### Creating a workspace MCP

Use the template: `cp -r shared/templates/workspace-mcp workspaces/<team>/mcp`

Key rules:
- Reference global MCP binaries via `${KIRO_MCP_DIR}` (e.g., pre-configured Confluence)
- Reference bundled code via `${WORKSPACE_MCP_DIR}/servers/<name>/index.js`
- Declare all required variables in `"variables"` section
- Put non-secret team defaults in `defaults.env` (committed)
- Secrets go in user's `~/.kiro/tokens.env` (never committed)
- Use `"_overrides": "<global-name>"` to replace a global server with a team version

### Variable resolution order

1. `~/.kiro/tokens.env` (user) → 2. `defaults.env` / `env_defaults` (team) → 3. `variable.default` (fallback)

### Server source priority (on name collision)

User-added > Workspace > Fork > Global


## Workspace Path Configuration

`workspace_path` in `workspace.json` supports environment variable expansion for cross-platform compatibility.

**Recommended:** Use `${VAR}` syntax so the same config works on macOS, Linux, and Windows:

```json
"workspace_path": "${WORKSPACE_ROOT}/Disney/DisneyPaymentsOrg"
```

**Supported formats:** `~`, `${VAR}`, `$VAR`, `%VAR%` (Windows)

When helping users create or configure workspaces:
- Suggest `${WORKSPACE_ROOT}` or `~/` for portability
- Never hardcode absolute paths like `/Users/username/...`
- Path separators are normalized automatically — always use `/` in JSON
- Guide users to set the env var in their shell profile (`~/.zshrc`, `~/.bashrc`, or Windows System Environment Variables)


## Jira & Confluence Cloud Setup

For setup, troubleshooting, or configuration questions about Jira Cloud or Confluence Cloud (`disneyexperiences.atlassian.net`), refer users to the setup guide:

**Guide:** `docs/guides/JIRA_CLOUD_SETUP.md` in steer-runtime

Key points:
- Both services use the same Atlassian API token (generated at <https://id.atlassian.com/manage-profile/security/api-tokens>)
- Jira Cloud URL: `https://disneyexperiences.atlassian.net`
- Confluence Cloud URL: `https://disneyexperiences.atlassian.net/wiki` (note the `/wiki` suffix)
- The **Email** field is required — it tells Koda to use Cloud auth (Basic Auth + API v3)
- Configure via `koda` TUI → MCP tab → Jira section (cloud row) and Confluence section (cloud row)
- Both produce `cloud_` prefixed tools: `cloud_get_issue`, `cloud_get_confluence_page`, etc.
- Run `koda mcp-install` to regenerate `mcp.json` after manual `tokens.env` edits
