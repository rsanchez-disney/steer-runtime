# Atlassian Rovo MCP — quick start guide

Get Jira, Confluence, and Bitbucket access working in your agents in under 5 minutes.

## Prerequisites

- Koda v0.4.295+ (includes `koda mcp auth atlassian --login`)
- An Atlassian Cloud account (Jira/Confluence)
- A profile with `@atlassian/*` tools (dev-core, core, ba, cloudops, or any custom)

## Step 1: Enable the server

```bash
koda mcp-install
```

Verify atlassian appears in the output:

```text
  Servers included:
    • atlassian
    • jira
    • confluence
    ...
```

## Step 2: Authenticate

### Option A: Browser flow (recommended)

```bash
koda mcp auth atlassian --login
```

This opens your browser for Atlassian login. Authorize the connection and return to the terminal:

```text
🔐 Opening browser for Atlassian authentication...
   Callback listening on http://127.0.0.1:59389
   Complete the login in your browser. Waiting up to 2 minutes...

✓ Authorization code received. Exchanging for token...
✅ Atlassian authenticated successfully!
   Run 'koda mcp-install' to regenerate mcp.json with the token.
```

Then regenerate mcp.json:

```bash
koda mcp-install
```

### Option B: Inline auth (during chat)

Skip step 2 entirely. When you first use an `@atlassian/*` tool in a chat session, the MCP server will prompt you with an auth URL. Open it, authenticate, and the session connects automatically.

### Option C: API token (no browser / CI)

```bash
koda tokens set ATLASSIAN_API_TOKEN
koda mcp-install
```

Generate a token at <https://id.atlassian.com/manage-profile/security/api-tokens>.

## Step 3: Verify

Run `koda mcp auth atlassian` to see auth status, or test in a chat:

```bash
koda chat
```

```text
"What's the status of PROJ-1234?"
```

If it works, you're done.

## Step 4: Use it

Any agent with `@atlassian/*` in its tools can access Jira, Confluence, and Bitbucket:

```text
"What's the status of PROJ-1234?"
"Summarize the Q2 planning page in Confluence."
"Create a Jira issue for the auth migration."
"Find all open bugs assigned to me."
```

## What tools are available

| Tool              | Description                                       |
|-------------------|---------------------------------------------------|
| Search Jira       | Find issues by JQL, text, or project              |
| Get issue         | Read issue details, comments, transitions         |
| Create issue      | Create new work items from natural language        |
| Update issue      | Edit fields, transition status, add comments      |
| Search Confluence | Find pages by title, space, or content            |
| Get page          | Read full page content                            |
| Create/update page| Write or edit Confluence pages                    |
| Rovo search       | Search across all Atlassian products              |

## Agents with Atlassian access

These profiles include `@atlassian/*` tools:

| Profile    | Key agents                                                            |
|------------|-----------------------------------------------------------------------|
| dev-core   | story_analyzer, planner, pr_creator, code_review, technical_writer    |
| core       | story_analyzer, document_analyzer                                     |
| ba         | requirements_analyst, feature_writer, backlog_generator               |
| pm         | sprint_manager, standup, delivery_reporter, retro, risk_tracker       |
| leadership | quarterly_reporter, portfolio_analyst, executive_briefing             |
| ops        | ai_metrics, release_manager, release_documenter                       |
| qa         | test_planner, e2e_test_generator, defect_analyst, test_coverage       |

To add Atlassian tools to your own agent:

```json
{
  "tools": ["@atlassian/*"],
  "allowedTools": ["@atlassian/*"]
}
```

## Priority chain

When multiple Atlassian MCPs are configured, the orchestrator follows this priority:

```text
@atlassian/* (Rovo) > @jira-cloud/* / @confluence-cloud/* > @compass/* (fallback)
```

Rovo is preferred because it provides unified access via a single authenticated connection. If Rovo fails on first call, agents fall back to `cloud_` prefix tools for the rest of the session.

## Revoking access

```bash
koda mcp auth atlassian --reset
```

This:
1. Removes local tokens (`ATLASSIAN_API_TOKEN`, `ATLASSIAN_REFRESH_TOKEN`)
2. Opens Atlassian's app permissions page for server-side revocation

## Advanced: custom client ID

The OAuth flow uses Atlassian's shared MCP public client ID by default. If your organization needs its own registered app:

1. Create an app at <https://developer.atlassian.com/console/myapps/>
2. Configure OAuth 2.1 with:
   - Redirect URI: `http://127.0.0.1:*`
   - Grant type: Authorization Code with PKCE
3. Set the client ID:

```bash
koda tokens set ATLASSIAN_CLIENT_ID <your-client-id>
```

## Troubleshooting

### `unauthorized_client` error

The OAuth client ID may have been rotated. Check for updates:

```bash
koda upgrade
koda mcp auth atlassian --login
```

Or set a known-good client ID manually:

```bash
koda tokens set ATLASSIAN_CLIENT_ID <client-id>
```

### Auth callback timeout (2 minutes)

The local callback server times out after 2 minutes. If you need more time:

```bash
koda mcp auth atlassian --login   # try again
```

### Token expired / 401

Tokens auto-refresh if a refresh token was stored. If it stops working:

```bash
koda mcp auth atlassian --reset   # clean slate
koda mcp auth atlassian --login   # re-authenticate
koda mcp-install                  # regenerate mcp.json
```

### Server not appearing in mcp-install output

Ensure you have Koda v0.4.295+:

```bash
koda --version
koda upgrade   # if needed
```

### Windows: "filename or extension is too long"

This is fixed in Koda v0.4.295+. If you're on an older version:

```bash
koda upgrade
```

## How it works

```text
┌──────────────┐     SSE transport      ┌──────────────────────────┐
│  koda chat   │ ◄─────────────────────► │  mcp.atlassian.com       │
│  (kiro-cli)  │     Bearer token        │  Rovo MCP Server         │
└──────────────┘                         └────────┬─────────────────┘
                                                  │
                                     ┌────────────┼────────────────┐
                                     │            │                │
                                ┌────▼───┐  ┌────▼─────┐  ┌──────▼────┐
                                │  Jira  │  │Confluence│  │ Bitbucket │
                                └────────┘  └──────────┘  └───────────┘
```

Authentication uses OAuth 2.1 with PKCE (public client, no secret). All requests respect your existing Atlassian permissions — the token scopes what you can access.

<!-- Links -->
[api-tokens]: https://id.atlassian.com/manage-profile/security/api-tokens
[rovo-docs]: https://support.atlassian.com/atlassian-rovo-mcp-server/docs/getting-started-with-the-atlassian-remote-mcp-server/
[supported-tools]: https://support.atlassian.com/atlassian-rovo-mcp-server/docs/supported-tools/
