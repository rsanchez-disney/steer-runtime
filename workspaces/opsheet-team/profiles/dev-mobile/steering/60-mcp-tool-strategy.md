---
inclusion: auto
description: Tracks disabled MCP tools/servers and guides the agent to request re-enabling when needed
---

# MCP Tool Optimization Strategy

## Context
Kiro recommends keeping active MCP tools under 50. Exceeding this limit causes:
- Degraded tool selection accuracy — the agent is more likely to pick the wrong tool or miss the right one.
- High token usage — every active tool's schema is injected into context on each turn, eating into the available window.
- Slower responses — more context to process means longer round-trips.

To stay under the limit, rarely-used tools and entire servers have been disabled. If a task requires a disabled tool, inform the user with:
> "I need the `{tool_name}` tool from the `{server_name}` MCP server for this task. Could you enable it temporarily in the MCP Servers view?"

After the task is done, remind the user to disable it again to keep the tool count lean.

## Disabled MCP Servers

MCP Server disabled by default, keep them in context to ask for enable when needed.

- `atlassian-confluence` — entire server disabled
- `atlassian-jira` — entire server disabled (individual tools also pruned via `disabledTools`)
- `fetch` — entire server disabled
- `github-disney` — entire server disabled (GitHub Enterprise at github.disney.com)
- `mermaid` — entire server disabled (diagram generation)

## Disabled GitHub Tools
- `fork_repository`
- `search_users`
- `search_issues`
- `search_code`
- `add_issue_comment`
- `update_issue`
- `get_pull_request_status`
- `update_pull_request_branch`

## Disabled Jira Tools
- `jira_remove_watcher`
- `jira_get_worklog`
- `jira_add_worklog`
- `jira_download_attachments`
- `jira_get_issue_images`
- `jira_batch_get_changelogs`
- `jira_get_issues_development_info`
- `jira_create_remote_issue_link`
- `jira_remove_issue_link`
- `jira_create_version`
- `jira_batch_create_versions`
- `jira_get_service_desk_for_project`
- `jira_get_service_desk_queues`
- `jira_get_queue_issues`
- `jira_get_issue_proforma_forms`
- `jira_get_proforma_form_details`
- `jira_update_proforma_form_answers`
- `jira_create_repository`

## When to Request Re-enabling
- Confluence pages → need `atlassian-confluence` server
- Worklog tasks → need `jira_get_worklog` / `jira_add_worklog`
- Attachment handling → need `jira_download_attachments` / `jira_get_issue_images`
- Version management → need `jira_create_version` / `jira_batch_create_versions`
- Changelog analysis → need `jira_batch_get_changelogs`
- ProForma forms → need the proforma tools
- Forking repos → need `fork_repository`
- Cross-repo issue search → need `search_issues`
- PR branch updates → need `update_pull_request_branch`
