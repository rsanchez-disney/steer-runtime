# ServiceNow Reference

Quick reference for Disney ServiceNow conventions used by sustainment agents.

## Ticket Prefixes

| Prefix | Type | Example |
|--------|------|---------|
| INC | Incident | INC28731532 |
| CTASK | Change Task | CTASK1234567 |
| CHG | Change Request | CHG4274206 |
| PRB | Problem | PRB0075640 |
| RITM | Request Item | RITM1234567 |
| REQ | Request | REQ1234567 |
| SCTASK | Service Catalog Task | SCTASK1234567 |
| KB | Knowledge Article | KB0012345 |

## State Codes (Disney Custom)

Disney uses non-standard state codes. Always use `sysparm_display_value=all` to get both codes and labels.

| Code | Standard Meaning | Disney Meaning |
|------|-----------------|----------------|
| 1 | New | New |
| 2 | In Progress | In Progress |
| 3 | On Hold | On Hold |
| 6 | Resolved | Resolved |
| 7 | Closed | Closed |
| 8 | Canceled (standard) | — |
| 12 | — | Pending Vendor |
| 14 | — | Canceled |

## Priority Matrix

| Priority | Response SLA | Resolution SLA | Escalation |
|----------|-------------|----------------|------------|
| P1 - Critical | 15 min | 4 hours | Immediate — page on-call |
| P2 - High | 30 min | 8 hours | Escalate within 1 hour |
| P3 - Moderate | 4 hours | 3 business days | Normal queue |
| P4 - Low | 1 business day | 5 business days | Normal queue |

## MCP Tools Available

### Incident Management
- `get_incident` — fetch incident details
- `add_work_note` — add work notes to an incident
- `update_incident` — update arbitrary fields
- `resolve_incident` — resolve with close notes and close code
- `get_incident_comments` — get all comments and work notes
- `get_incident_timeline` — full activity timeline
- `get_related_incidents` — find related by CI, parent, or assignment group
- `bulk_update_incidents` — mass update during outages

### Change & Problem Management
- `get_change_request` — fetch change request details
- `create_change_request` — create normal/standard/emergency changes
- `create_problem` — create problem records (requires CI)
- `get_ctask` — fetch CTASK details
- `add_ctask_work_note` — add work notes to CTASK
- `update_ctask` — update CTASK fields
- `close_ctask` — close with notes

### Assignment & CI
- `change_assignment_group` — reassign incident
- `change_ci` — update Configuration Item
- `get_ci_details` — CI details including owner, environment, relationships
- `get_on_call` — current on-call for an assignment group

### Discovery
- `query_incidents` — query with encoded query strings
- `search_knowledge_base` — search KB articles for known solutions
- `create_incident` — create new incidents

## Common Encoded Queries

```
# Active P1/P2 incidents for a CI
cmdb_ci.name=DLR Capacity Managed Events^priority<=2^stateNOT IN7,14

# Incidents opened in last 24 hours
opened_at>=javascript:gs.hoursAgoStart(24)^stateNOT IN7,14

# Incidents assigned to a group
assignment_group.name=app-global-cme^stateNOT IN7,14
```

## Key Rules
- The `_SNAPI_CME-L1Support` service account can read and update but CANNOT create incidents
- Always use `sysparm_display_value=all` for human-readable state/priority labels
- Disney state code 12 = Pending Vendor, 14 = Canceled (non-standard)
- Problem records require a Configuration Item (CI) per Disney data policy
