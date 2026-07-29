# Atlassian Rovo MCP

Remote MCP server for Jira, Confluence, Bitbucket, and Jira Service Management — powered by Atlassian's Teamwork Graph.

## Setup

This is a remote (SSE) MCP server hosted by Atlassian. No local binaries or npm packages needed.

### Option 1: OAuth 2.1 (recommended)

When the server is first used, it initiates an OAuth 2.1 browser flow:

1. Browser opens Atlassian login
2. Authorize the MCP connection
3. Token stored and auto-refreshes

### Option 2: API token

Generate a token at <https://id.atlassian.com/manage-profile/security/api-tokens>, then:

```bash
koda tokens set ATLASSIAN_API_TOKEN
```

## What it provides

- Search and retrieve Jira issues
- Create, update, and transition issues
- Search and read Confluence pages
- Create and update Confluence content
- Search Bitbucket repositories and PRs
- Rovo knowledge graph search

## Server URL

```text
https://mcp.atlassian.com/v1/mcp/authv2
```

## Reference

- [Getting started](https://support.atlassian.com/atlassian-rovo-mcp-server/docs/getting-started-with-the-atlassian-remote-mcp-server/)
- [Supported tools](https://support.atlassian.com/atlassian-rovo-mcp-server/docs/supported-tools/)
- [Auth docs](https://support.atlassian.com/atlassian-rovo-mcp-server/docs/authentication-and-authorization/)
