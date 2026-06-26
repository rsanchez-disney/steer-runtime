# MCP ServiceNow

MCP Server for ServiceNow integration with automatic browser-based authentication.

## What's New: Auto-Authentication

No more manually copying cookies and tokens! The MCP now:

1. **On startup** — if no credentials are provided, opens a Chromium browser for you to log in via SSO
2. **On session expiry** — automatically detects 401/403 errors and re-opens the browser for re-authentication
3. **Seamless** — captures cookies and X-UserToken automatically from the browser session

## Available Tools

| Tool | Description |
|------|-------------|
| `search_incidents` | Search incidents with encoded query |
| `get_incident` | Get incident by sys_id |
| `create_incident` | Create new incident |
| `update_incident` | Update existing incident |
| `search_change_requests` | Search change requests |
| `get_change_request` | Get change request by sys_id |
| `create_change_request` | Create change request |
| `update_change_request` | Update change request |
| `search_users` | Search users |
| `search_cmdb_ci` | Search CIs in the CMDB |
| `query_table` | Query any table |
| `create_record` | Create record in any table |
| `update_record` | Update record in any table |

## Setup

```bash
npm install
npm run build
npx playwright install chromium
```

## Configuration

### Option A: Auto-authentication (recommended)

Just provide the instance URL — the MCP will open a browser for login:

```json
{
  "mcpServers": {
    "servicenow": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/mcp-servicenow",
      "env": {
        "SERVICENOW_INSTANCE_URL": "https://disney.service-now.com"
      }
    }
  }
}
```

When the session expires, the browser will open again automatically.

### Option B: Manual credentials (legacy)

You can still provide credentials manually if preferred:

```json
{
  "mcpServers": {
    "servicenow": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/mcp-servicenow",
      "env": {
        "SERVICENOW_INSTANCE_URL": "https://disney.service-now.com",
        "SERVICENOW_SESSION_COOKIE": "JSESSIONID=xxx; glide_user_route=xxx",
        "SERVICENOW_USER_TOKEN": "your-x-usertoken-value"
      }
    }
  }
}
```

Even with manual credentials, the MCP will auto-reauthenticate when they expire.

## ServiceNow query examples

- Open P1 incidents: `priority=1^state!=7`
- Incidents assigned to a group: `assignment_group.name=Network`
- Emergency changes: `type=emergency`
- Search user by name: `nameLIKEjohn`
- Active CIs: `install_status=1`
