# ServiceNow Node MCP Server

Node.js/TypeScript MCP server for ServiceNow incidents, problems, change requests, and CTASKs via the ServiceNow REST API. Functionally equivalent to `servicenow-mcp` (Python).

## Prerequisites

- Node.js 18+
- npm
- A ServiceNow service account with API access

## Installation

```bash
cd shared/tools/mcp-servers/servicenow-node-mcp
npm install
npm run build
```

## Configuration

Add to your Kiro MCP config (`~/.kiro/settings/mcp.json` or `.kiro/settings/mcp.json`):

```json
{
  "mcpServers": {
    "servicenow": {
      "command": "node",
      "args": [
        "/full/path/to/servicenow-node-mcp/build/index.js"
      ],
      "env": {
        "SNOW_INSTANCE": "https://disney.service-now.com",
        "SNOW_USERNAME": "your-service-account",
        "SNOW_PASSWORD": "your-password"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

## Authentication

HTTP Basic Auth against the ServiceNow REST API (`/api/now/table/*` endpoints).

## Tools

### Incidents

| Tool | Description |
|------|-------------|
| `get_incident` | Get incident details by number |
| `add_work_note` | Add a work note to an incident |
| `change_ci` | Change the Configuration Item on an incident |
| `change_assignment_group` | Change assignment group and set state to Assigned |
| `add_parent_incident` | Link a child incident to a parent incident |
| `resolve_incident` | Resolve an incident with close notes and close code |
| `update_incident` | Update arbitrary fields on an incident (JSON input) |
| `query_incidents` | Query incidents using ServiceNow encoded query strings |
| `create_incident` | Create a new incident |

### Problems

| Tool | Description |
|------|-------------|
| `create_problem` | Create a new problem record |

### Change Requests

| Tool | Description |
|------|-------------|
| `create_change_request` | Create a new change request (normal/standard/emergency) |

### Change Tasks (CTASKs)

| Tool | Description |
|------|-------------|
| `get_ctask` | Get CTASK details by number |
| `add_ctask_work_note` | Add a work note to a CTASK |
| `update_ctask` | Update arbitrary fields on a CTASK (JSON input) |
| `close_ctask` | Close a CTASK with close notes |

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
| `401 Unauthorized` | Bad credentials | Verify `SNOW_USERNAME` and `SNOW_PASSWORD` |
| `No record found` | Wrong number format | Include the prefix (e.g. `INC`, `CTASK`, `CHG`) |
