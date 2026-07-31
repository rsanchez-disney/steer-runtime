# Atlassian Rovo MCP

Remote MCP server for Jira, Confluence, Bitbucket, and Jira Service Management — powered by Atlassian's Teamwork Graph.

## Setup

This is a remote (SSE) MCP server hosted by Atlassian. No local binaries or npm packages needed.

### Option 1: OAuth 2.1 browser flow (recommended)

```bash
koda mcp auth atlassian --login
```

Opens your browser for Atlassian login. Authorize the connection and return to the terminal. Token is stored locally and used as a Bearer header in all requests.

After authenticating:

```bash
koda mcp-install
```

### Option 2: SSE inline auth (during chat)

When the server is first used in a chat session, it initiates the OAuth flow inline:

1. Start a chat: `koda chat`
2. Use any `@atlassian/*` tool
3. The MCP server provides an auth URL
4. Open the URL in your browser, authenticate
5. Session is authenticated automatically

### Option 3: API token (non-interactive / CI)

Generate a token at <https://id.atlassian.com/manage-profile/security/api-tokens>, then:

```bash
koda tokens set ATLASSIAN_API_TOKEN
koda mcp-install
```

## Revoking access

```bash
koda mcp auth atlassian --reset
```

This removes local tokens and opens the Atlassian app permissions page for full revocation.

## Advanced: custom client ID

The OAuth flow uses Atlassian's shared MCP public client by default. If your organization requires a different client ID (e.g., registered via <https://developer.atlassian.com/console/myapps/>):

```bash
koda tokens set ATLASSIAN_CLIENT_ID <your-client-id>
```

The next `--login` will use your custom client.

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

- [Getting started][rovo-docs]
- [Supported tools][supported-tools]
- [Auth docs][auth-docs]

<!-- Links -->
[auth-docs]: https://support.atlassian.com/atlassian-rovo-mcp-server/docs/authentication-and-authorization/
[rovo-docs]: https://support.atlassian.com/atlassian-rovo-mcp-server/docs/getting-started-with-the-atlassian-remote-mcp-server/
[supported-tools]: https://support.atlassian.com/atlassian-rovo-mcp-server/docs/supported-tools/
