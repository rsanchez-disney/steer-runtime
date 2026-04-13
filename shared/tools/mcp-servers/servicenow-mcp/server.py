"""
ServiceNow MCP Server
Provides tools to perform operations on ServiceNow incidents and CTASKs:
- Add work notes to incidents
- Change CI on incidents
- Change assignment group on incidents
- Add parent incident link
- Resolve incidents
- Update CTASKs
- Close CTASKs
"""

import os
import json
import httpx
from fastmcp import FastMCP

# Configuration from environment variables
SNOW_INSTANCE = os.environ.get("SNOW_INSTANCE", "")  # e.g. https://disney.service-now.com
SNOW_USERNAME = os.environ.get("SNOW_USERNAME", "")
SNOW_PASSWORD = os.environ.get("SNOW_PASSWORD", "")

mcp = FastMCP("servicenow-mcp")


def _base_url() -> str:
    return SNOW_INSTANCE.rstrip("/")


def _auth() -> tuple[str, str]:
    return (SNOW_USERNAME, SNOW_PASSWORD)


async def _snow_get(path: str, params: dict = None) -> dict:
    """GET request to ServiceNow REST API."""
    url = f"{_base_url()}/api/now{path}"
    async with httpx.AsyncClient(timeout=30.0, verify=True) as client:
        resp = await client.get(url, params=params, auth=_auth(),
                                headers={"Accept": "application/json"})
        resp.raise_for_status()
        return resp.json()


async def _snow_patch(path: str, data: dict) -> dict:
    """PATCH request to ServiceNow REST API."""
    url = f"{_base_url()}/api/now{path}"
    async with httpx.AsyncClient(timeout=30.0, verify=True) as client:
        resp = await client.patch(url, json=data, auth=_auth(),
                                  headers={"Accept": "application/json",
                                           "Content-Type": "application/json"})
        resp.raise_for_status()
        return resp.json()


async def _snow_post(path: str, data: dict) -> dict:
    """POST request to ServiceNow REST API."""
    url = f"{_base_url()}/api/now{path}"
    async with httpx.AsyncClient(timeout=30.0, verify=True) as client:
        resp = await client.post(url, json=data, auth=_auth(),
                                 headers={"Accept": "application/json",
                                          "Content-Type": "application/json"})
        resp.raise_for_status()
        return resp.json()


async def _get_sys_id(table: str, number_field: str, number_value: str) -> str:
    """Look up the sys_id for a record by its number."""
    result = await _snow_get(f"/table/{table}",
                             params={"sysparm_query": f"{number_field}={number_value}",
                                     "sysparm_fields": "sys_id",
                                     "sysparm_limit": "1"})
    records = result.get("result", [])
    if not records:
        raise ValueError(f"No {table} record found with {number_field}={number_value}")
    return records[0]["sys_id"]


async def _get_sys_id_by_name(table: str, name: str) -> str:
    """Look up the sys_id for a record by its name field."""
    result = await _snow_get(f"/table/{table}",
                             params={"sysparm_query": f"name={name}",
                                     "sysparm_fields": "sys_id,name",
                                     "sysparm_limit": "1"})
    records = result.get("result", [])
    if not records:
        raise ValueError(f"No {table} record found with name={name}")
    return records[0]["sys_id"]


# ── Tool 1: Get Incident Details ───────────────────────────────────

@mcp.tool()
async def get_incident(incident_number: str) -> str:
    """
    Get details of a ServiceNow incident by its number.

    Args:
        incident_number: The incident number (e.g. INC28829968)
    """
    sys_id = await _get_sys_id("incident", "number", incident_number)
    result = await _snow_get(f"/table/incident/{sys_id}",
                             params={"sysparm_display_value": "true"})
    record = result.get("result", {})
    fields = {
        "number": record.get("number"),
        "short_description": record.get("short_description"),
        "state": record.get("state"),
        "priority": record.get("priority"),
        "assignment_group": record.get("assignment_group", {}).get("display_value", ""),
        "assigned_to": record.get("assigned_to", {}).get("display_value", ""),
        "cmdb_ci": record.get("cmdb_ci", {}).get("display_value", ""),
        "parent_incident": record.get("parent_incident", {}).get("display_value", ""),
        "sys_created_on": record.get("sys_created_on"),
    }
    return json.dumps(fields, indent=2)


# ── Tool 2: Add Work Note ──────────────────────────────────────────

@mcp.tool()
async def add_work_note(incident_number: str, work_note: str) -> str:
    """
    Add a work note to a ServiceNow incident.

    Args:
        incident_number: The incident number (e.g. INC28829968)
        work_note: The work note text to add
    """
    sys_id = await _get_sys_id("incident", "number", incident_number)
    result = await _snow_patch(f"/table/incident/{sys_id}",
                               data={"work_notes": work_note})
    return json.dumps({"status": "success",
                       "incident": incident_number,
                       "message": "Work note added"})


# ── Tool 3: Change Configuration Item ──────────────────────────────

@mcp.tool()
async def change_ci(incident_number: str, ci_name: str) -> str:
    """
    Change the Configuration Item (CI) on a ServiceNow incident.

    Args:
        incident_number: The incident number (e.g. INC28829968)
        ci_name: The name of the CI to set (e.g. 'DLR Ticketing Galaxy (Gateway)')
    """
    inc_sys_id = await _get_sys_id("incident", "number", incident_number)
    ci_sys_id = await _get_sys_id_by_name("cmdb_ci", ci_name)
    result = await _snow_patch(f"/table/incident/{inc_sys_id}",
                               data={"cmdb_ci": ci_sys_id})
    return json.dumps({"status": "success",
                       "incident": incident_number,
                       "ci": ci_name,
                       "message": "Configuration Item updated"})


# ── Tool 4: Change Assignment Group ────────────────────────────────

@mcp.tool()
async def change_assignment_group(incident_number: str, assignment_group: str,
                                   assigned_to_email: str = "") -> str:
    """
    Change the assignment group on a ServiceNow incident and set state to Assigned.

    Args:
        incident_number: The incident number (e.g. INC28829968)
        assignment_group: The assignment group name (e.g. 'ops-global-commerce-sre')
        assigned_to_email: Optional email of the person to assign to. Leave empty for group-level assignment.
    """
    inc_sys_id = await _get_sys_id("incident", "number", incident_number)
    ag_sys_id = await _get_sys_id_by_name("sys_user_group", assignment_group)

    update_data = {
        "assignment_group": ag_sys_id,
        "state": "11",  # Assigned
    }

    if assigned_to_email:
        user_result = await _snow_get("/table/sys_user",
                                      params={"sysparm_query": f"email={assigned_to_email}",
                                              "sysparm_fields": "sys_id",
                                              "sysparm_limit": "1"})
        users = user_result.get("result", [])
        if users:
            update_data["assigned_to"] = users[0]["sys_id"]

    result = await _snow_patch(f"/table/incident/{inc_sys_id}", data=update_data)
    return json.dumps({"status": "success",
                       "incident": incident_number,
                       "assignment_group": assignment_group,
                       "state": "Assigned",
                       "message": "Assignment group updated"})


# ── Tool 5: Add Parent Incident Link ──────────────────────────────

@mcp.tool()
async def add_parent_incident(incident_number: str, parent_incident_number: str) -> str:
    """
    Link a child incident to a parent incident.

    Args:
        incident_number: The child incident number (e.g. INC28829968)
        parent_incident_number: The parent incident number (e.g. INC28800000)
    """
    inc_sys_id = await _get_sys_id("incident", "number", incident_number)
    parent_sys_id = await _get_sys_id("incident", "number", parent_incident_number)
    result = await _snow_patch(f"/table/incident/{inc_sys_id}",
                               data={"parent_incident": parent_sys_id})
    return json.dumps({"status": "success",
                       "incident": incident_number,
                       "parent_incident": parent_incident_number,
                       "message": "Parent incident linked"})


# ── Tool 6: Resolve Incident ──────────────────────────────────────

@mcp.tool()
async def resolve_incident(incident_number: str, close_notes: str,
                           close_code: str = "Closed/Resolved by caller",
                           caused_by_change: str = "CHG_NOCHG") -> str:
    """
    Resolve a ServiceNow incident.

    Args:
        incident_number: The incident number (e.g. INC28829968)
        close_notes: Notes explaining the resolution
        close_code: The close code (default: 'Closed/Resolved by caller')
        caused_by_change: The caused-by change number (default: 'CHG_NOCHG')
    """
    inc_sys_id = await _get_sys_id("incident", "number", incident_number)

    update_data = {
        "state": "6",  # Resolved
        "close_notes": close_notes,
        "close_code": close_code,
    }

    if caused_by_change and caused_by_change != "CHG_NOCHG":
        try:
            chg_sys_id = await _get_sys_id("change_request", "number", caused_by_change)
            update_data["caused_by"] = chg_sys_id
        except ValueError:
            pass  # If CHG not found, skip it

    result = await _snow_patch(f"/table/incident/{inc_sys_id}", data=update_data)
    return json.dumps({"status": "success",
                       "incident": incident_number,
                       "state": "Resolved",
                       "close_notes": close_notes,
                       "message": "Incident resolved"})


# ── Tool 7: Update Incident Fields ────────────────────────────────

@mcp.tool()
async def update_incident(incident_number: str, fields_json: str) -> str:
    """
    Update arbitrary fields on a ServiceNow incident. Use this for any field
    not covered by the other tools (e.g. priority, category, subcategory).

    Args:
        incident_number: The incident number (e.g. INC28829968)
        fields_json: JSON string of field names and values to update (e.g. '{"priority": "2", "category": "Software"}')
    """
    inc_sys_id = await _get_sys_id("incident", "number", incident_number)
    fields = json.loads(fields_json)
    result = await _snow_patch(f"/table/incident/{inc_sys_id}", data=fields)
    return json.dumps({"status": "success",
                       "incident": incident_number,
                       "updated_fields": list(fields.keys()),
                       "message": "Incident updated"})


# ── Tool 8: Get CTASK Details ─────────────────────────────────────

@mcp.tool()
async def get_ctask(ctask_number: str) -> str:
    """
    Get details of a ServiceNow Change Task (CTASK) by its number.

    Args:
        ctask_number: The CTASK number (e.g. CTASK1234567)
    """
    sys_id = await _get_sys_id("change_task", "number", ctask_number)
    result = await _snow_get(f"/table/change_task/{sys_id}",
                             params={"sysparm_display_value": "true"})
    record = result.get("result", {})
    fields = {
        "number": record.get("number"),
        "short_description": record.get("short_description"),
        "state": record.get("state"),
        "assignment_group": record.get("assignment_group", {}).get("display_value", ""),
        "assigned_to": record.get("assigned_to", {}).get("display_value", ""),
        "change_request": record.get("change_request", {}).get("display_value", ""),
        "sys_created_on": record.get("sys_created_on"),
    }
    return json.dumps(fields, indent=2)


# ── Tool 9: Update CTASK ──────────────────────────────────────────

@mcp.tool()
async def update_ctask(ctask_number: str, fields_json: str) -> str:
    """
    Update fields on a ServiceNow Change Task (CTASK).

    Args:
        ctask_number: The CTASK number (e.g. CTASK1234567)
        fields_json: JSON string of field names and values to update (e.g. '{"work_notes": "Validated OK", "state": "3"}')
    """
    sys_id = await _get_sys_id("change_task", "number", ctask_number)
    fields = json.loads(fields_json)
    result = await _snow_patch(f"/table/change_task/{sys_id}", data=fields)
    return json.dumps({"status": "success",
                       "ctask": ctask_number,
                       "updated_fields": list(fields.keys()),
                       "message": "CTASK updated"})


# ── Tool 10: Close CTASK ──────────────────────────────────────────

@mcp.tool()
async def close_ctask(ctask_number: str, close_notes: str = "Validated and closed.") -> str:
    """
    Close a ServiceNow Change Task (CTASK) by setting state to Closed.

    Args:
        ctask_number: The CTASK number (e.g. CTASK1234567)
        close_notes: Notes explaining the closure (default: 'Validated and closed.')
    """
    sys_id = await _get_sys_id("change_task", "number", ctask_number)
    result = await _snow_patch(f"/table/change_task/{sys_id}",
                               data={"state": "3",  # Closed
                                     "work_notes": close_notes,
                                     "close_notes": close_notes})
    return json.dumps({"status": "success",
                       "ctask": ctask_number,
                       "state": "Closed",
                       "message": "CTASK closed"})


# ── Tool 11: Add Work Note to CTASK ───────────────────────────────

@mcp.tool()
async def add_ctask_work_note(ctask_number: str, work_note: str) -> str:
    """
    Add a work note to a ServiceNow Change Task (CTASK).

    Args:
        ctask_number: The CTASK number (e.g. CTASK1234567)
        work_note: The work note text to add
    """
    sys_id = await _get_sys_id("change_task", "number", ctask_number)
    result = await _snow_patch(f"/table/change_task/{sys_id}",
                               data={"work_notes": work_note})
    return json.dumps({"status": "success",
                       "ctask": ctask_number,
                       "message": "Work note added to CTASK"})


# ── Tool 12: Query Incidents ──────────────────────────────────────

@mcp.tool()
async def query_incidents(query: str, fields: str = "number,short_description,state,priority,assignment_group",
                          limit: int = 50) -> str:
    """
    Query ServiceNow incidents using an encoded query string.

    Args:
        query: ServiceNow encoded query string (e.g. 'assignment_group.name=web-global-salestickets^stateNOT IN6,7,8')
        fields: Comma-separated list of fields to return
        limit: Maximum number of results (default 50)
    """
    result = await _snow_get("/table/incident",
                             params={"sysparm_query": query,
                                     "sysparm_fields": fields,
                                     "sysparm_limit": str(limit),
                                     "sysparm_display_value": "true"})
    records = result.get("result", [])
    return json.dumps({"count": len(records), "records": records}, indent=2)


# ── Tool 13: Create Incident ───────────────────────────────────────

@mcp.tool()
async def create_incident(short_description: str, description: str = "",
                          assignment_group: str = "", caller_email: str = "",
                          priority: str = "4", category: str = "",
                          subcategory: str = "", ci_name: str = "") -> str:
    """
    Create a new ServiceNow incident.

    Args:
        short_description: Brief summary of the incident (required)
        description: Detailed description of the incident
        assignment_group: Assignment group name (e.g. 'ops-global-commerce-sre')
        caller_email: Email of the caller/requester
        priority: Priority level 1-4 (1=Critical, 2=High, 3=Moderate, 4=Low). Default: 4
        category: Incident category
        subcategory: Incident subcategory
        ci_name: Configuration Item name to set on the incident
    """
    data: dict = {
        "short_description": short_description,
        "priority": priority,
    }
    if description:
        data["description"] = description
    if category:
        data["category"] = category
    if subcategory:
        data["subcategory"] = subcategory

    if assignment_group:
        ag_sys_id = await _get_sys_id_by_name("sys_user_group", assignment_group)
        data["assignment_group"] = ag_sys_id

    if caller_email:
        user_result = await _snow_get("/table/sys_user",
                                      params={"sysparm_query": f"email={caller_email}",
                                              "sysparm_fields": "sys_id",
                                              "sysparm_limit": "1"})
        users = user_result.get("result", [])
        if users:
            data["caller_id"] = users[0]["sys_id"]

    if ci_name:
        ci_sys_id = await _get_sys_id_by_name("cmdb_ci", ci_name)
        data["cmdb_ci"] = ci_sys_id

    result = await _snow_post("/table/incident", data=data)
    record = result.get("result", {})
    return json.dumps({
        "status": "success",
        "number": record.get("number"),
        "sys_id": record.get("sys_id"),
        "message": f"Incident {record.get('number')} created"
    })


# ── Tool 14: Create Problem ───────────────────────────────────────

@mcp.tool()
async def create_problem(short_description: str, description: str = "",
                         assignment_group: str = "", priority: str = "4",
                         category: str = "", ci_name: str = "") -> str:
    """
    Create a new ServiceNow problem record.

    Args:
        short_description: Brief summary of the problem (required)
        description: Detailed description of the problem
        assignment_group: Assignment group name (e.g. 'app-cadlr-galaxy')
        priority: Priority level 1-4 (1=Critical, 2=High, 3=Moderate, 4=Low). Default: 4
        category: Problem category
        ci_name: Configuration Item name to set on the problem
    """
    data: dict = {
        "short_description": short_description,
        "priority": priority,
    }
    if description:
        data["description"] = description
    if category:
        data["category"] = category

    if assignment_group:
        ag_sys_id = await _get_sys_id_by_name("sys_user_group", assignment_group)
        data["assignment_group"] = ag_sys_id

    if ci_name:
        ci_sys_id = await _get_sys_id_by_name("cmdb_ci", ci_name)
        data["cmdb_ci"] = ci_sys_id

    result = await _snow_post("/table/problem", data=data)
    record = result.get("result", {})
    return json.dumps({
        "status": "success",
        "number": record.get("number"),
        "sys_id": record.get("sys_id"),
        "message": f"Problem {record.get('number')} created"
    })


# ── Tool 15: Create Change Request ────────────────────────────────

@mcp.tool()
async def create_change_request(short_description: str, description: str = "",
                                assignment_group: str = "", priority: str = "4",
                                change_type: str = "normal", category: str = "",
                                ci_name: str = "", requested_by_email: str = "",
                                start_date: str = "", end_date: str = "") -> str:
    """
    Create a new ServiceNow change request.

    Args:
        short_description: Brief summary of the change (required)
        description: Detailed description and justification for the change
        assignment_group: Assignment group name (e.g. 'ops-global-commerce-sre')
        priority: Priority level 1-4 (1=Critical, 2=High, 3=Moderate, 4=Low). Default: 4
        change_type: Type of change — 'normal', 'standard', or 'emergency'. Default: normal
        category: Change category
        ci_name: Configuration Item name affected by the change
        requested_by_email: Email of the person requesting the change
        start_date: Planned start date/time (format: YYYY-MM-DD HH:MM:SS)
        end_date: Planned end date/time (format: YYYY-MM-DD HH:MM:SS)
    """
    type_map = {"normal": "normal", "standard": "standard", "emergency": "emergency"}
    data: dict = {
        "short_description": short_description,
        "priority": priority,
        "type": type_map.get(change_type.lower(), "normal"),
    }
    if description:
        data["description"] = description
    if category:
        data["category"] = category
    if start_date:
        data["start_date"] = start_date
    if end_date:
        data["end_date"] = end_date

    if assignment_group:
        ag_sys_id = await _get_sys_id_by_name("sys_user_group", assignment_group)
        data["assignment_group"] = ag_sys_id

    if ci_name:
        ci_sys_id = await _get_sys_id_by_name("cmdb_ci", ci_name)
        data["cmdb_ci"] = ci_sys_id

    if requested_by_email:
        user_result = await _snow_get("/table/sys_user",
                                      params={"sysparm_query": f"email={requested_by_email}",
                                              "sysparm_fields": "sys_id",
                                              "sysparm_limit": "1"})
        users = user_result.get("result", [])
        if users:
            data["requested_by"] = users[0]["sys_id"]

    result = await _snow_post("/table/change_request", data=data)
    record = result.get("result", {})
    return json.dumps({
        "status": "success",
        "number": record.get("number"),
        "sys_id": record.get("sys_id"),
        "message": f"Change Request {record.get('number')} created"
    })


# ── Entry Point ────────────────────────────────────────────────────

if __name__ == "__main__":
    import asyncio
    from mcp.server.stdio import stdio_server

    async def run():
        server = mcp._mcp_server
        async with stdio_server() as (read_stream, write_stream):
            await server.run(read_stream, write_stream, server.create_initialization_options())

    asyncio.run(run())
