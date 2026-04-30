# ServiceNow MCP Server

Node.js/TypeScript MCP server for ServiceNow incidents, problems, change requests, and CTASKs via the ServiceNow REST API.

## Prerequisites

- Node.js 16+
- npm
- A ServiceNow service account with API access

## Installation

```bash
cd shared/tools/mcp-servers/servicenow-mcp
npm install
npm run build    # TypeScript compile (build/index.js)
npm run bundle   # Single-file bundle (dist/index.cjs) — recommended for deployment
```

## Configuration

Add to your Kiro MCP config (`~/.kiro/settings/mcp.json` or `.kiro/settings/mcp.json`):

```json
{
  "mcpServers": {
    "servicenow-mcp": {
      "command": "node",
      "args": [
        "/full/path/to/servicenow-mcp/dist/index.cjs"
      ],
      "env": {
        "SNOW_INSTANCE": "https://your-instance.service-now.com",
        "SNOW_API_USERNAME": "your-service-account",
        "SNOW_API_PASSWORD": "your-password"
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
| `close_ctask` | Close a CTASK with close notes, close code, and target state |

#### close_ctask Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `ctaskNumber` | Yes | — | The CTASK number (e.g. `CTASK1234567`) |
| `closeNotes` | No | `Validated and closed.` | Notes explaining the closure |
| `closeCode` | No | `successful` | `successful`, `unsuccessful`, `issues`, `supplier`, or `disney` |
| `targetState` | No | `closed_complete` | Target close state (see table below) |

#### Target States

| targetState | SNOW Value | Label |
|-------------|-----------|-------|
| `closed_complete` | 3 | Closed Complete |
| `closed_cancelled` | 4 | Closed Cancelled |
| `closed_skipped` | 7 | Closed Skipped |
| `successful` | 8 | Successful |

#### State Transition Logic

- If the CTASK is already in a closed state (3, 4, 7, or 8), the tool skips with a message.
- If the parent CHG is in a closed/complete/cancelled state, the tool returns a "blocked" status.
- If the CTASK is in a pre-work state (Scheduled, Draft, Pending Approval, or Review), the tool auto-transitions through intermediate states before closing.
- If the CTASK is already in "Work in Progress" or "In Progress", it closes directly to the target state.
- The tool verifies the state actually changed after each attempt.

#### Disney-Specific Notes

- Close code is written to the custom field `u_close_code` (not the standard `close_code`).
- Available `u_close_code` values: `successful`, `unsuccessful`, `issues`, `supplier`, `disney`.
- The service account must be a **member of the CTASK's assignment group** to change the state (enforced by ACL).
- If the close fails, check the assignment group — reassign to a group the service account belongs to.

#### Examples

```text
close CTASK1234567 as successful with notes "Patching validated"
close CTASK1234567 with state closed_cancelled, notes "Change window missed"
close CTASK1234567 with state closed_skipped, close code unsuccessful, notes "Not applicable"
```

### Investigation & Triage

| Tool | Description |
|------|-------------|
| `get_incident_comments` | Get all comments and work notes history |
| `get_related_incidents` | Find incidents related by CI or parent |
| `get_change_request` | Get change request details by number |
| `get_ci_details` | Get CI details (owner, environment, support group) |
| `search_knowledge_base` | Search KB articles for known solutions |
| `get_on_call` | Get on-call person/rotation for a group |
| `bulk_update_incidents` | Update multiple incidents at once |
| `get_incident_timeline` | Full activity timeline (state changes, notes, assignments) |

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
| `fetch is not defined` | Node.js < 16 or missing `node-fetch` | Run `npm install` to ensure `node-fetch` is installed |
| `Missing required environment variables` | Env vars not set | Check `env` block in mcp.json |
| `401 Unauthorized` | Bad credentials | Verify `SNOW_API_USERNAME` and `SNOW_API_PASSWORD` |
| `No record found` | Wrong number format | Include the prefix (e.g. `INC`, `CTASK`, `CHG`) |
