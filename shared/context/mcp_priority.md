# MCP Tool Priority

When multiple MCP servers can handle the same task, follow this priority:

## Dedicated MCP First (preferred)

| Task | Use | Tools |
|------|-----|-------|
| Jira tickets, sprints, boards | `@jira/*` | jira_get_issue, jira_search_issues, etc. |
| Confluence pages | `@confluence/*` | get_confluence_page, search_confluence_pages, etc. |
| MyWiki pages | `@mywiki/*` | get_confluence_page, search_confluence_pages, etc. |
| GitHub PRs, repos | `@github/*` | github_get_pr, github_list_repos, etc. |

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
