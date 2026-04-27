# Splunk MCP Server

Node.js/TypeScript MCP server for searching logs, querying events, and monitoring applications via the Splunk REST API.

## Prerequisites

- Node.js 16+
- npm
- A Splunk API account with search permissions

## Installation

```bash
cd shared/tools/mcp-servers/splunk-mcp
npm install
npm run build    # TypeScript compile (build/index.js)
npm run bundle   # Single-file bundle (dist/index.cjs) — recommended for deployment
```

## Configuration

Add to your Kiro MCP config (`~/.kiro/settings/mcp.json`):

```json
{
  "mcpServers": {
    "splunk-mcp": {
      "command": "node",
      "args": [
        "/full/path/to/splunk-mcp/dist/index.cjs"
      ],
      "env": {
        "SPLUNK_BASE_URL": "https://splunk.wdprapps.disney.com:8089",
        "SPLUNK_API_USERNAME": "your-api-account",
        "SPLUNK_API_PASSWORD": "your-password"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

## Authentication

The server uses HTTP Basic Auth:
1. Credentials are sent as `Authorization: Basic {base64(username:password)}` on every request
2. No session management or token caching required
3. Compatible with Splunk instances that restrict session-based auth (e.g. Disney Splunk 9.4.x)

## Tools

| Tool | Description |
|------|-------------|
| `search_events` | Run an SPL query and return results (async, waits for completion) |
| `oneshot_search` | Run a quick blocking search (best for simple queries, small results) |
| `get_indexes` | List available indexes with event counts and sizes |
| `get_sourcetypes` | List sourcetypes in an index or across all indexes |
| `get_fields` | Get field summary for an index/sourcetype (names, types, counts) |
| `get_saved_searches` | List saved searches/reports/alerts in an app |
| `run_saved_search` | Dispatch a saved search and return results |
| `get_job_status` | Check status of a running/completed search job |
| `get_alerts` | Get recently fired alerts |
| `get_alert_details` | Get full details of a specific alert (config, triggers, severity) |
| `get_alert_history` | Get trigger history with frequency stats and patterns |
| `suppress_alert` | Temporarily disable/re-enable an alert (maintenance windows) |
| `export_results` | Run a search and export results in CSV format |
| `list_dashboards` | List dashboards available in a Splunk app |
| `get_dashboard` | Get dashboard definition with panel search queries |
| `run_dashboard_panel` | Execute a specific panel's search from a dashboard |
| `get_datamodels` | List available data models (CIM datasets) with acceleration status |
| `get_datamodel_fields` | Get fields and constraints for a data model object |
| `list_reports` | List scheduled reports with run time and status |
| `get_report_results` | Get latest results from a scheduled report (no re-run) |
| `get_server_info` | Get Splunk server version and info |

## Usage Examples

Search for errors in the last 15 minutes:
```
search_events: { query: "index=wdpr_dti* error | head 20", earliestTime: "-15m" }
```

Run a timechart:
```
search_events: { query: "index=wdpr_dti* sourcetype=dti_gateway \"COREAPI Quote Svc Failed\" | timechart count span=1m", earliestTime: "-1h" }
```

Get fired alerts:
```
get_alerts: { count: 10 }
```

## Development

```bash
npm run watch       # Rebuild on changes
npm run typecheck   # Type check without emitting
npm run inspector   # Launch MCP Inspector for testing
```

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `Cannot find module` | Not built | Run `npm run build` or `npm run bundle` |
| `fetch is not defined` | Node < 16 or missing node-fetch | Run `npm install` |
| `Splunk auth error: 401` | Bad credentials | Verify `SPLUNK_API_USERNAME` and `SPLUNK_API_PASSWORD` |
| `404 Not Found` on v2 endpoints | Splunk version < 9.5 | Server uses v1 REST API only — this is expected |
| `Search timed out` | Query too broad | Add time bounds or reduce scope, increase `maxWaitSeconds` |
| Empty results | Wrong index or time range | Check index name and `earliestTime`/`latestTime` |
| `Cannot edit/create a saved search for wildcarded users` | RBAC limitation | Service account can't dispatch saved searches owned by other users |
