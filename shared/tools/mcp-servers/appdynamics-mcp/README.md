# AppDynamics MCP Server

MCP server that provides tools to query the AppDynamics REST API using OAuth client credentials authentication.

## Prerequisites

- Python 3.11+
- `pip` (Python package manager)
- An AppDynamics SaaS controller with API client credentials (client ID + client secret)

## Installation

1. Clone or copy the `appdynamics-mcp/` directory to your machine.

2. Install dependencies:
   ```bash
   pip3 install -r requirements.txt
   ```
   This installs `fastmcp` and `httpx`.

3. Verify your Python path — the MCP config needs the full path to your Python 3.11 binary. Find it with:
   ```bash
   which python3
   ```
   On macOS with a framework install, this is typically:
   ```
   /Library/Frameworks/Python.framework/Versions/3.11/bin/python3
   ```
   The system Python (`/usr/bin/python3`) will NOT work — it doesn't have the required packages installed.

## Configuration

Add the server to your Kiro MCP config file.

- User-level (all workspaces): `~/.kiro/settings/mcp.json`
- Workspace-level: `.kiro/settings/mcp.json`

```json
{
  "mcpServers": {
    "appdynamics": {
      "command": "/Library/Frameworks/Python.framework/Versions/3.11/bin/python3",
      "args": [
        "/full/path/to/appdynamics-mcp/server.py"
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
- `/full/path/to/appdynamics-mcp/server.py` with the absolute path to `server.py` on your machine
- `APPD_CONTROLLER_URL` with your AppDynamics SaaS controller URL (no trailing slash)
- `APPD_CLIENT_ID` with your OAuth client ID (format: `username@account-name`)
- `APPD_CLIENT_SECRET` with your OAuth client secret

After saving the config, the MCP server will auto-connect in Kiro. You can also reconnect manually from the MCP Server view in the Kiro feature panel.

## Authentication

The server uses OAuth 2.0 client credentials flow:
1. Requests an access token from `{controller}/controller/api/oauth/access_token`
2. Caches the token and refreshes it automatically before expiry (60s buffer)
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
| `get_anomalies` | AI-detected anomalies with suspected root causes (Automated RCA). Requires controller version 26.x+. Returns a clear message on older controllers (25.x). |

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

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `spawn python ENOENT` | Kiro can't find `python` | Use the full Python path in `command` (e.g., `/Library/Frameworks/Python.framework/Versions/3.11/bin/python3`) |
| `Connection closed` | FastMCP banner output corrupts stdio protocol | The server bypasses `fastmcp run` and uses `mcp.server.stdio.stdio_server` directly — this is already handled in `server.py` |
| `ModuleNotFoundError: httpx` | Wrong Python binary (system Python without packages) | Ensure `command` points to the Python where you installed the dependencies |
| `FastMCP() got unexpected keyword argument` | FastMCP v3 API change | Don't pass `description` to the `FastMCP()` constructor — already fixed in `server.py` |
| Empty metric results | Metric path doesn't exist for the app | Use `get_tiers` first to find valid tier names, then build the metric path |
| `get_anomalies` returns 404 | Controller version < 26.x | The Anomaly Detection API requires Splunk AppDynamics 26.x+. Current Disney-Prod controller is 25.7.0-3004. The tool will work automatically once the controller is upgraded. |
