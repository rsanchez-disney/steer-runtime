---
name: servicenow-incident-ops
description: ServiceNow incident operations — triage, routing, resolution, CTASK management, reporting, and service validation
---

# ServiceNow Incident Operations

Multi-workflow skill for managing ServiceNow incidents, CTASKs, and generating operational reports using the ServiceNow MCP server.

## Prerequisites

- ServiceNow MCP configured in `mcp.json` with valid credentials
- AppDynamics MCP configured (optional, for service validation and incident triage)

---

## Workflows

This skill supports multiple workflows. Ask for the one you need or describe what you want to do.

---

### Workflow 1: Incident Triage

Investigate an incident, gather context, and determine next steps.

#### Step 1: Get Incident Details
1. Run `get_incident` with the incident number
2. Note: state, priority, assignment group, CI, assigned to, parent incident

#### Step 2: Assess Impact
1. If the CI maps to an AppDynamics application, run the `appdynamics-health-check` skill for that app
2. Query related incidents: run `query_incidents` with `cmdb_ci.name=<CI>^stateNOT IN6,7,8` to find other open incidents on the same CI
3. Check for a parent incident — if linked, get parent details with `get_incident`

#### Step 3: Triage Decision
Based on findings, recommend one of:
- **Route** — reassign to the correct team (→ Workflow 3)
- **Update** — add findings as a work note (→ Workflow 5)
- **Resolve** — if the issue is resolved or not reproducible (→ Workflow 2)
- **Escalate** — link to a parent incident and raise priority (→ Workflow 4)

**⏸ CHECKPOINT — User reviews triage recommendation and decides action**

---

### Workflow 2: Resolve Incident

Close an incident with proper documentation.

#### Step 1: Verify Resolution
1. Run `get_incident` to confirm current state
2. If CI maps to an AppDynamics app, verify the app is healthy (run `get_application_health`)

#### Step 2: Resolve
1. Ask user for close notes (or generate from context)
2. Ask user for close code (default: `Closed/Resolved by caller`)
3. Ask user for caused-by change number (default: `CHG_NOCHG`)
4. Run `resolve_incident` with the provided details

**⏸ CHECKPOINT — User confirms resolution before executing**

---

### Workflow 3: Route Incident

Change the CI and/or assignment group on an incident.

#### Step 1: Get Current State
1. Run `get_incident` to see current CI and assignment group

#### Step 2: Update CI (if needed)
1. Ask user for the new CI name
2. Run `change_ci` with the new CI

#### Step 3: Update Assignment Group
1. Ask user for the new assignment group name
2. Optionally ask for an assignee email
3. Run `change_assignment_group` (this also sets state to Assigned)

#### Step 4: Add Work Note
1. Add a work note documenting the routing reason: run `add_work_note` with context about why the incident was rerouted

**⏸ CHECKPOINT — User confirms routing before executing**

---

### Workflow 4: Update Incident

Modify fields on an incident (priority, category, parent link, or arbitrary fields).

#### Step 1: Get Current State
1. Run `get_incident` to see current values

#### Step 2: Apply Updates
Based on what the user needs:
- **Change priority:** run `update_incident` with `{"priority": "<1-4>"}`
- **Change category:** run `update_incident` with `{"category": "<value>", "subcategory": "<value>"}`
- **Link parent:** run `add_parent_incident` with the parent incident number
- **Arbitrary fields:** run `update_incident` with the user-provided JSON

#### Step 3: Confirm
1. Run `get_incident` again to verify the updates applied

---

### Workflow 5: Add Work Notes

Add work notes to incidents or CTASKs.

#### For Incidents:
1. Ask user for the incident number and note text
2. Run `add_work_note` with the incident number and work note

#### For CTASKs:
1. Ask user for the CTASK number and note text
2. Run `add_ctask_work_note` with the CTASK number and work note

---

### Workflow 6: CTASK Management

View, update, and close Change Tasks.

#### Get CTASK Details:
1. Run `get_ctask` with the CTASK number
2. Report: state, assignment group, assigned to, parent change request

#### Update CTASK:
1. Run `update_ctask` with the CTASK number and fields JSON

#### Close CTASK:
1. Ask user for close notes (default: "Validated and closed.")
2. Run `close_ctask` with the CTASK number and close notes

**⏸ CHECKPOINT — User confirms before closing**

---

### Workflow 7: Service Validation and CTASK Closure

Validate a service is healthy, document findings on a CTASK, and close it.

#### Step 1: Get CTASK Details
1. Run `get_ctask` to understand what needs validation
2. Identify the service/CI from the CTASK or parent change request

#### Step 2: Validate Service
1. If the service maps to an AppDynamics application:
   - Run `get_application_health` — check for violations
   - Run `get_error_rate` — check error rates
   - Run `get_snapshots` — check for error/slow transactions
2. If the service maps to a ServiceNow CI:
   - Run `query_incidents` with `cmdb_ci.name=<CI>^stateNOT IN6,7,8` to check for open incidents
3. Summarize: service healthy / degraded / issues found

#### Step 3: Document and Close
1. Generate a validation summary work note:
   ```
   Service Validation — <service_name>
   Status: HEALTHY | DEGRADED | ISSUES FOUND
   Health Violations: <count>
   Error Rate: <rate>%
   Open Incidents on CI: <count>
   Validated by: <agent>
   ```
2. Run `add_ctask_work_note` with the validation summary
3. If healthy, run `close_ctask` with close notes referencing the validation

**⏸ CHECKPOINT — User reviews validation results before closing CTASK**

---

### Workflow 8: Create New Incident

Create a new incident with proper categorization.

#### Step 1: Gather Details
Ask user for (required fields marked with *):
- *Short description
- Description (detailed)
- Assignment group
- Priority (1-4, default: 4)
- Category / subcategory
- CI name
- Caller email

#### Step 2: Create
1. Run `create_incident` with the provided details
2. Report the new incident number

#### Step 3: Post-Creation (Optional)
- Link to a parent incident if needed: run `add_parent_incident`
- Add initial work note: run `add_work_note`

---

### Workflow 9: Assignment Group Stats Report

Generate a report of incident counts by priority and state for an assignment group.

#### Step 1: Query Incidents
Run multiple `query_incidents` calls to build the matrix:

1. **Open incidents by priority:**
   - `assignment_group.name=<group>^stateNOT IN6,7,8` with fields `number,priority,state,short_description`

2. **By specific state (if requested):**
   - `assignment_group.name=<group>^state=<state_value>` — common states:
     - `1` = New
     - `2` = In Progress
     - `11` = Assigned
     - `16` = Pending Vendor
     - `6` = Resolved
     - `7` = Closed

#### Step 2: Build Report
Parse results and generate a summary:

```
Assignment Group: <group_name>
Report Time: <timestamp>

Open Incidents by Priority:
Priority    | Count
------------|------
1-Critical  | <n>
2-High      | <n>
3-Moderate  | <n>
4-Normal    | <n>
Total       | <n>

By State:
State           | Count
----------------|------
New             | <n>
Assigned        | <n>
In Progress     | <n>
Pending Vendor  | <n>
Total Open      | <n>

Top Incidents (P1/P2):
Number       | Priority | State      | Short Description
-------------|----------|------------|------------------
INC...       | 1        | ...        | ...
```

#### Step 3: Drill Down (Optional)
If user wants details on a specific priority or state, query with tighter filters and list individual incidents.

**⏸ CHECKPOINT — User reviews report**

---

## Important Rules

- **Always get incident/CTASK details first** before making changes — confirm you're updating the right record
- **Pause at checkpoints** — never resolve, close, or route without user confirmation
- **Document everything** — add work notes before and after significant changes
- **Use exact CI and group names** — ServiceNow lookups are name-based and case-sensitive
- **Don't guess state values** — use the state mapping above or get current state first
