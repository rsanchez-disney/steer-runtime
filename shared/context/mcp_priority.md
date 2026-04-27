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
