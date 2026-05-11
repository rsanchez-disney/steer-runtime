# MCP Tool Priority

When multiple MCP servers can handle the same task, follow this priority:

## Dedicated MCP First (preferred)

| Task | Use | Tools |
|------|-----|-------|
| Jira tickets, sprints, boards | `@jira/*` | jira_get_issue, jira_search_issues, etc. |
| Confluence pages (confluence.disney.com) | `@confluence/*` | get_confluence_page, search_confluence_pages, etc. |
| MyWiki pages (mywiki.disney.com) | `@mywiki/*` | get_confluence_page, search_confluence_pages, etc. |
| GitHub PRs, repos | `@github/*` | github_get_pr, github_list_repos, etc. |

## Server-to-Prefix Mapping

The MCP config uses multi-instance naming. Here's how server names map to tool prefixes:

| mcp.json server name | Tool prefix | Target URL |
|---------------------|-------------|------------|
| `confluence-confluence` | `@confluence/*` | confluence.disney.com |
| `confluence-mywiki` | `@mywiki/*` | mywiki.disney.com |
| `jira-jira` | `@jira/*` (prefix: `jira_`) | jira.disney.com |
| `jira-myjira` | `@jira/*` (prefix: `myjira_`) | myjira.disney.com |
| `github-disney` | `@github/*` | github.disney.com |
| `github-public` | `@github/*` | github.com |

**Confluence vs MyWiki**: These are two separate Confluence instances sharing the same MCP binary (`confluence-mcp`). Route by URL:
- `confluence.disney.com` → `@confluence/*`
- `mywiki.disney.com` → `@mywiki/*`

## Compass MCP (fallback or exclusive)

| Task | Use | When |
|------|-----|------|
| Email | Compass `sre_toolsets_email_send_email` | Always (Compass only) |
| Splunk / Log analysis | Compass log tools | Always (Compass only) |
| ServiceNow (INC, CHG) | Compass `servicenow_tool_snow_*` | Always (Compass only) |
| Jira via Compass | Compass Jira tools | Only if `@jira/*` tools are not available |
| Confluence via Compass | Compass Confluence tools | Only if `@confluence/*` tools are not available |

## Rule

**Always prefer dedicated MCP servers over Compass for Jira and Confluence.** Dedicated servers have instance-specific auth, richer schemas, and multi-instance support. Use Compass for email, logs, and ServiceNow.

## Workspace-Level MCPs

Teams can define custom MCP servers in their workspace under `workspaces/<team>/mcp/`. These are automatically merged into the user's MCP config when the workspace is activated.

### Structure

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

1. `~/.kiro/tokens.env` (user) → 2. `defaults.env` (team) → 3. `variable.default` (fallback)

### Server source priority (on name collision)

User-added > Workspace > Global
