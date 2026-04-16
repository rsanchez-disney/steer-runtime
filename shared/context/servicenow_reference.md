# ServiceNow Reference

## Ticket Prefixes

| Prefix | Table | Description |
|--------|-------|-------------|
| INC | incident | Incidents — unplanned interruptions or service degradations |
| RITM | sc_req_item | Requested Items — individual items from a service catalog request |
| REQ | sc_request | Requests — parent container for one or more RITMs |
| CHG | change_request | Change Requests — planned changes to IT infrastructure/services |
| PRB | problem | Problems — root cause investigations for recurring incidents |
| CTASK | change_task | Change Tasks — sub-tasks within a change request |
| SCTASK | sc_task | Catalog Tasks — fulfillment tasks for requested items |
| STASK | sn_si_task | Security Incident Tasks |
| KB | kb_knowledge | Knowledge Articles |
| TASK | task | Generic Tasks |
| HR | sn_hr_core_case | HR Cases |
| LEG | sn_legal_case | Legal Cases |
| CSM | sn_customerservice_case | Customer Service Cases |
| SIR | sn_si_incident | Security Incidents |
| CAB | cab_meeting | Change Advisory Board meetings |

## Detection

When user input matches a ServiceNow prefix followed by digits (e.g., INC28731532, CTASK12142352), use Compass MCP to fetch the ticket details.

## Actions by Type

| Prefix | Primary Action | Follow-up |
|--------|---------------|-----------|
| INC | Fetch details, search related logs | Root cause investigation |
| CTASK | Fetch task details | Pre/post change stability validation |
| CHG | Fetch change details | Risk assessment, related incidents |
| PRB | Fetch problem record | Correlate with incidents, RCA |
| RITM, REQ | Fetch request status | Track fulfillment |
| KB | Retrieve article content | Reference for investigation |
| SCTASK | Fetch task status | Track fulfillment |

## Standard Output Format

```
## [PREFIX][NUMBER]: [Short Description]

**Status:** [state]
**Priority:** [priority]
**Assigned To:** [assignee]
**Assignment Group:** [group]
**CI:** [configuration item]
**Created:** [date]
**Updated:** [date]

### Description
[Full description text]

### Work Notes (latest)
[Recent work notes, most recent first]
```
