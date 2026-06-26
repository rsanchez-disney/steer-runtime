# MCP Teams Server

MCP Server for Microsoft Teams integration via Graph API.

## Authentication Modes

### Personal (device code) — recommended for local use

Uses your own Teams account. You only need a `TEAMS_CLIENT_ID` from an app
registered in Azure with delegated permissions. No client secret or admin consent
is needed for basic permissions.

The first time the MCP starts, you'll see a message in the terminal like:

```
To sign in, use a web browser to open https://microsoft.com/devicelogin
and enter the code XXXXXXXX to authenticate.
```

Open that URL, paste the code, and authenticate with your Teams account. The token
is cached at `~/.mcp-teams/token-cache.json` so you don't have to re-authenticate
every time.

### App (client credentials) — for automation/CI

Uses credentials from an app registered with application permissions. Requires
admin consent. Activates automatically if you provide `TEAMS_CLIENT_SECRET`.

## Azure App Registration (both modes)

1. Go to [portal.azure.com](https://portal.azure.com) → Microsoft Entra ID → App registrations → New registration
2. Name: `mcp-teams-kiro` (or whatever you prefer)
3. Supported account types: "Accounts in this organizational directory only"
4. Redirect URI: select "Public client/native" and enter `https://login.microsoftonline.com/common/oauth2/nativeclient`
5. Click Register and copy the "Application (client) ID" — that is your `TEAMS_CLIENT_ID`
6. Go to "Authentication" → in "Advanced settings" enable "Allow public client flows" → Save

### Delegated permissions (personal mode)

In "API permissions" → Add → Microsoft Graph → Delegated permissions:
- `Team.ReadBasic.All`
- `Channel.ReadBasic.All`
- `ChannelMessage.Read.All`
- `ChannelMessage.Send`
- `TeamMember.Read.All`
- `Chat.Read`
- `Chat.ReadWrite`
- `User.Read`
- `offline_access`

Note: some permissions like `ChannelMessage.Read.All` require admin consent.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `TEAMS_TENANT_ID` | No (default: `common`) | Azure AD Tenant ID |
| `TEAMS_CLIENT_ID` | Yes | Application (client) ID |
| `TEAMS_CLIENT_SECRET` | No | Only for app mode (client credentials) |

## Installation

```bash
cd mcps/mcp-teams
npm install
npm run build
```

## Kiro Configuration

The personal mode is the only way to connect at the moment.

### Personal mode (device code) 

```json
{
  "mcpServers": {
    "teams": {
      "command": "node",
      "args": ["${KIRO_MCP_DIR}/teams-mcp/dist/index.cjs"],
      "env": {
        "TEAMS_CLIENT_ID": "<your-client-id>"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### App mode (client credentials)

```json
{
  "mcpServers": {
    "teams": {
      "command": "node",
      "args": ["${KIRO_MCP_DIR}/teams-mcp/dist/index.cjs"],
      "env": {
        "TEAMS_TENANT_ID": "<your-tenant-id>",
        "TEAMS_CLIENT_ID": "<your-client-id>",
        "TEAMS_CLIENT_SECRET": "<your-client-secret>"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

## Available Tools

| Tool | Description |
|---|---|
| `list_teams` | List accessible Teams |
| `list_channels` | List channels in a Team |
| `get_channel` | Get channel details |
| `list_messages` | Recent messages in a channel |
| `get_message` | Get a specific message |
| `list_replies` | Replies to a message |
| `send_message` | Send a message to a channel |
| `reply_to_message` | Reply to a message |
| `list_members` | Members of a Team |
| `list_chats` | List 1:1 and group chats |
| `list_chat_messages` | Messages in a chat |
| `send_chat_message` | Send a message in a chat |
