# Atlassian Rovo MCP — quick start guide

Get Jira, Confluence, and Bitbucket access working in your agents in under 5 minutes.

## Prerequisites

- Koda v0.4.253+ (includes `koda mcp auth` command)
- An Atlassian Cloud account (Jira/Confluence)
- A profile with `@atlassian/*` tools (dev-core, core, ba, cloudops, or any custom)

## Step 1: Authenticate

```bash
koda mcp auth atlassian
```

This opens your browser for Atlassian login. Authorize the connection and return to the terminal.

```text
🔐 Opening browser for Atlassian authentication...
   Callback listening on http://127.0.0.1:59389
   Complete the login in your browser. Waiting up to 2 minutes...

✓ Authorization code received. Exchanging for token...
✅ Atlassian authenticated successfully!
```

## Step 2: Sync

```bash
koda sync
```

This regenerates `~/.kiro/settings/mcp.json` with the atlassian server entry and your Bearer token.

## Step 3: Verify

```bash
koda mcp list | grep atlassian
```

Expected output:

```text
  atlassian                ✓ enabled
```

## Step 4: Use it

Restart your Kiro session (or Kite), then ask your agent:

```text
"What's the status of PROJ-1234?"
"Summarize the Q2 planning page in Confluence."
"Create a Jira issue for the auth migration."
"Find all open bugs assigned to me."
```

Any agent with `@atlassian/*` in its tools can access Jira, Confluence, and Bitbucket.

## Alternative: API token auth (no browser)

If you can't use the browser flow (CI, headless, etc.):

1. Generate a token at <https://id.atlassian.com/manage-profile/security/api-tokens>
2. Set it in Koda:

```bash
koda tokens set ATLASSIAN_API_TOKEN
```

3. Sync:

```bash
koda sync
```

## What tools are available

Once connected, agents can use:

| Tool | Description |
|------|-------------|
| Search Jira | Find issues by JQL, text, or project |
| Get issue | Read issue details, comments, transitions |
| Create issue | Create new work items from natural language |
| Update issue | Edit fields, transition status, add comments |
| Search Confluence | Find pages by title, space, or content |
| Get page | Read full page content |
| Create/update page | Write or edit Confluence pages |
| Rovo search | Search across all Atlassian products via Teamwork Graph |

## Agents with Atlassian access

These profiles include `@atlassian/*` tools:

| Profile  | Agents |
|----------|--------|
| dev-core | code_review, planner, pr_creator, story_analyzer, technical_writer |
| core     | ai_adoption_stats, deck_builder, document_analyzer, story_analyzer |

To add Atlassian tools to your own agent, add `"@atlassian/*"` to the `tools` array in your agent JSON.

## Troubleshooting

### Auth callback fails (port not listening)

The local callback server has a 2-minute timeout. If you take longer in the browser:

```bash
koda mcp auth atlassian   # try again, complete faster
```

### Token expired

Tokens auto-refresh if a refresh token was stored. If it stops working:

```bash
koda mcp auth atlassian   # re-authenticate
koda sync
```

### Server not appearing in mcp.json

```bash
koda sync   # regenerates mcp.json (Selected=nil includes all servers)
```

### Wrong Atlassian site

The OAuth flow lets you choose which site to authorize. If you selected the wrong one, re-authenticate:

```bash
koda mcp auth atlassian
```

## How it works

```text
┌─────────────┐     SSE transport      ┌──────────────────────────┐
│   kiro-cli  │ ◄─────────────────────► │  mcp.atlassian.com       │
│  (or Kite)  │     Bearer token        │  Rovo MCP Server         │
└─────────────┘                         └────────┬─────────────────┘
                                                 │
                                    ┌────────────┼────────────────┐
                                    │            │                │
                               ┌────▼───┐  ┌────▼─────┐  ┌──────▼────┐
                               │  Jira  │  │Confluence│  │ Bitbucket │
                               └────────┘  └──────────┘  └───────────┘
```

The Atlassian Rovo MCP is a remote server — no local binaries, no npm packages. Authentication uses OAuth 2.1 with PKCE, and all requests respect your existing Atlassian permissions.

<!-- Links -->
[rovo-docs]: https://support.atlassian.com/atlassian-rovo-mcp-server/docs/getting-started-with-the-atlassian-remote-mcp-server/
[supported-tools]: https://support.atlassian.com/atlassian-rovo-mcp-server/docs/supported-tools/
[api-tokens]: https://id.atlassian.com/manage-profile/security/api-tokens
