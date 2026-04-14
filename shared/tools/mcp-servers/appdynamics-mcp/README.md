# AppDynamics Node MCP Server

Node.js/TypeScript MCP server that provides tools to query the AppDynamics REST API using OAuth client credentials authentication. Functionally equivalent to `appdynamics-mcp` (Python).

## Prerequisites

- Node.js 18+
- npm
- An AppDynamics SaaS controller with API client credentials (client ID + client secret)

## Installation

```bash
cd shared/tools/mcp-servers/appdynamics-node-mcp
npm install
npm run build
```

## Configuration

Add the server to your Kiro MCP config file.

- User-level (all workspaces): `~/.kiro/settings/mcp.json`
- Workspace-level: `.kiro/settings/mcp.json`

```json
{
  "mcpServers": {
    "appdynamics": {
      "command": "node",
      "args": [
        "/full/path/to/appdynamics-node-mcp/build/index.js"
      ],
      "env": {
        "APPD_CONTROLLER_URL": "https://your-controller.saas.appdynamics.com",
        "APPD_CLIENT_ID": "your-client-id@your-account",
        "APPD_CLIENT_SECRET": "your-client-secret"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

Replace:
- `/full/path/to/appdynamics-node-mcp/build/index.js` with the absolute path to the built entry point
- `APPD_CONTROLLER_URL` with your AppDynamics SaaS controller URL (no trailing slash)
- `APPD_CLIENT_ID` with your OAuth client ID (format: `username@account-name`)
- `APPD_CLIENT_SECRET` with your OAuth client secret

## Authentication

The server uses OAuth 2.0 client credentials flow:
1. Requests an access token from `{controller}/controller/api/oauth/access_token`
2. Caches the token and refreshes automatically before expiry (60s buffer)
3. All API calls use `Authorization: Bearer {token}`

To create API client credentials in AppDynamics:
1. Go to your AppDynamics controller → Settings → Administration
2. Navigate to API Clients
3. Create a new client with the required permissions (at minimum: read access to applications, metrics, and health rules)
4. Note the client ID (format: `client-name@account-name`) and generated secret

## Tools

| Tool | Description |
|------|-------------|
| `list_applications` | List all monitored applications |
| `get_application_health` | Health summary with violation count for the last hour |
| `get_business_transactions` | List business transactions for an app |
| `get_metric_data` | Query any metric by path with configurable duration and rollup |
| `get_tiers` | List tiers and node counts for an app |
| `get_nodes` | List nodes for an app, optionally filtered by tier |
| `get_health_violations` | Health rule violations within a configurable time range |
| `get_error_rate` | Error count and total call count for an app |
| `get_snapshots` | Recent slow/error transaction snapshots |
| `get_anomalies` | AI-detected anomalies with suspected root causes (requires controller 26.x+) |

## Common Metric Paths

Use these with the `get_metric_data` tool:

```
Overall Application Performance|Average Response Time (ms)
Overall Application Performance|Number of Calls
Overall Application Performance|Number of Errors
Overall Application Performance|Number of Slow Calls
Overall Application Performance|Stall Count
Application Infrastructure Performance|<tier>|Individual Nodes|<node>|Hardware Resources|CPU|%Busy
Application Infrastructure Performance|<tier>|Individual Nodes|<node>|Hardware Resources|Memory|Used %
```

Replace `<tier>` and `<node>` with actual tier/node names from `get_tiers` and `get_nodes`.

## Development

```bash
npm run watch       # Rebuild on changes
npm run typecheck   # Type check without emitting
npm run inspector   # Launch MCP Inspector for testing
```

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `Cannot find module` | Not built | Run `npm run build` |
| `Missing required environment variables` | Env vars not set | Check `env` block in mcp.json |
| `OAuth token error: 401` | Bad credentials | Verify `APPD_CLIENT_ID` and `APPD_CLIENT_SECRET` |
| Empty metric results | Metric path doesn't exist | Use `get_tiers` first to find valid tier names |
| `get_anomalies` returns 404 message | Controller < 26.x | Anomaly Detection API requires 26.x+ |
