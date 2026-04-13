# ServiceNow MCP Server

MCP server that provides tools to perform operations on ServiceNow incidents and Change Tasks (CTASKs) via the ServiceNow REST API.

## Prerequisites

- Python 3.11+
- `pip` (Python package manager)
- A ServiceNow service account with API access and permissions to read/update incidents and change tasks

## Installation

1. Clone or copy the `servicenow-mcp/` directory to your machine.

2. Install dependencies:
   ```bash
   pip3 install -r requirements.txt
   ```

3. Verify your Python path — the MCP config needs the full path to your Python binary:
   ```bash
   which python3
   ```
   On macOS with a framework install, this is typically:
   ```
   /Library/Frameworks/Python.framework/Versions/3.11/bin/python3
   ```

## Configuration

Add the server to your Kiro MCP config file.

- User-level (all workspaces): `~/.kiro/settings/mcp.json`
- Workspace-level: `.kiro/settings/mcp.json`

```json
{
  "mcpServers": {
    "servicenow": {
      "command": "/Library/Frameworks/Python.framework/Versions/3.11/bin/python3",
      "args": [
        "/full/path/to/servicenow-mcp/server.py"
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

Replace:
- `/full/path/to/servicenow-mcp/server.py` with the absolute path to `server.py`
- `SNOW_INSTANCE` with your ServiceNow instance URL (no trailing slash)
- `SNOW_USERNAME` with your service account username
- `SNOW_PASSWORD` with your service account password

## Authentication

The server uses HTTP Basic Auth against the ServiceNow REST API. All requests go through `/api/now/table/*` endpoints.

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
| `create_incident` | Create a new incident with assignment group, CI, priority, caller |

### Problems

| Tool | Description |
|------|-------------|
| `create_problem` | Create a new problem record with assignment group, CI, priority |

### Change Requests

| Tool | Description |
|------|-------------|
| `create_change_request` | Create a new change request (normal/standard/emergency) with dates, CI, assignment group |

### Change Tasks (CTASKs)

| Tool | Description |
|------|-------------|
| `get_ctask` | Get CTASK details by number |
| `add_ctask_work_note` | Add a work note to a CTASK |
| `update_ctask` | Update arbitrary fields on a CTASK (JSON input) |
| `close_ctask` | Close a CTASK with close notes |

## Usage Examples

Once connected in Kiro, you can use natural language:

- "Add a work note to INC28829968 saying the issue was investigated"
- "Change the assignment group on INC28829968 to ops-global-commerce-sre"
- "Change the CI on INC28829968 to DLR Ticketing Galaxy (Gateway)"
- "Link INC28829968 as a child of INC28800000"
- "Resolve INC28829968 with close notes: Issue resolved after TMS republish"
- "Close CTASK1234567 with notes: Validated — all healthchecks passing"
- "Query incidents for assignment group web-global-salestickets in Pending Vendor state"
- "Create an incident for a booking service outage, priority 2, assigned to ops-global-commerce-sre"
- "Create a problem record for the eGalaxy PackageDetail missing issue, assigned to app-cadlr-galaxy"
- "Create a normal change request for patching the booking service nodes this weekend"

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `spawn python ENOENT` | Kiro can't find `python` | Use the full Python path in `command` |
| `Connection closed` | FastMCP banner corrupts stdio | Server uses `mcp.server.stdio.stdio_server` directly (already handled) |
| `ModuleNotFoundError: httpx` | Wrong Python binary | Ensure `command` points to the Python where dependencies are installed |
| `401 Unauthorized` | Bad credentials | Verify `SNOW_USERNAME` and `SNOW_PASSWORD` in the env config |
| `No record found` | Wrong number format | Ensure you include the prefix (e.g. `INC`, `CTASK`, `CHG`) |
