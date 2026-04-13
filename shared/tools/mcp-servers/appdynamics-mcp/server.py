"""
AppDynamics MCP Server
Provides tools to query AppDynamics REST API for application health,
metrics, business transactions, and health rule violations.
"""

import os
import json
import httpx
from datetime import datetime, timedelta
from fastmcp import FastMCP

# Configuration from environment variables
APPD_CONTROLLER_URL = os.environ.get("APPD_CONTROLLER_URL", "")  # e.g. https://mycompany.saas.appdynamics.com
APPD_CLIENT_ID = os.environ.get("APPD_CLIENT_ID", "")             # OAuth client ID (e.g. user@account)
APPD_CLIENT_SECRET = os.environ.get("APPD_CLIENT_SECRET", "")     # OAuth client secret

mcp = FastMCP("appdynamics-mcp")

# Token cache
_token_cache = {"access_token": None, "expires_at": 0}


def _base_url() -> str:
    return APPD_CONTROLLER_URL.rstrip("/")


async def _get_oauth_token() -> str:
    """Get an OAuth token using client_id and client_secret (client_credentials grant)."""
    now = datetime.utcnow().timestamp()

    # Return cached token if still valid (with 60s buffer)
    if _token_cache["access_token"] and _token_cache["expires_at"] > now + 60:
        return _token_cache["access_token"]

    token_url = f"{_base_url()}/controller/api/oauth/access_token"

    async with httpx.AsyncClient(timeout=30.0, verify=True) as client:
        resp = await client.post(
            token_url,
            data={
                "grant_type": "client_credentials",
                "client_id": APPD_CLIENT_ID,
                "client_secret": APPD_CLIENT_SECRET,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        resp.raise_for_status()
        token_data = resp.json()

    _token_cache["access_token"] = token_data["access_token"]
    _token_cache["expires_at"] = now + token_data.get("expires_in", 300)

    return _token_cache["access_token"]


async def _appd_get(path: str, params: dict = None) -> dict | list | str:
    """Make a GET request to the AppDynamics REST API using OAuth token."""
    token = await _get_oauth_token()
    url = f"{_base_url()}/controller/rest{path}"
    if params is None:
        params = {}
    params["output"] = "JSON"

    async with httpx.AsyncClient(timeout=30.0, verify=True) as client:
        resp = await client.get(
            url,
            params=params,
            headers={"Authorization": f"Bearer {token}"},
        )
        resp.raise_for_status()
        try:
            return resp.json()
        except Exception:
            return resp.text


async def _appd_get_raw(url_path: str, params: dict = None) -> dict | list | str:
    """Make a GET request to any AppDynamics controller URL path (not just /controller/rest)."""
    token = await _get_oauth_token()
    url = f"{_base_url()}{url_path}"
    if params is None:
        params = {}

    async with httpx.AsyncClient(timeout=30.0, verify=True) as client:
        resp = await client.get(
            url,
            params=params,
            headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
        )
        resp.raise_for_status()
        try:
            return resp.json()
        except Exception:
            return resp.text


async def _resolve_app_id(app_name: str) -> int:
    """Resolve an application name to its numeric ID."""
    data = await _appd_get("/applications")
    if isinstance(data, list):
        for app in data:
            if app.get("name") == app_name:
                return app["id"]
    raise ValueError(f"Application '{app_name}' not found in AppDynamics")


# ── Tool 1: List Applications ──────────────────────────────────────

@mcp.tool()
async def list_applications() -> str:
    """List all applications monitored by AppDynamics."""
    data = await _appd_get("/applications")
    if isinstance(data, list):
        apps = [{"id": a.get("id"), "name": a.get("name")} for a in data]
        return json.dumps(apps, indent=2)
    return json.dumps(data, indent=2)


# ── Tool 2: Get Application Health ─────────────────────────────────

@mcp.tool()
async def get_application_health(app_name: str) -> str:
    """
    Get the overall health summary for an application.
    Returns node health, business transaction health, and error counts.

    Args:
        app_name: The application name in AppDynamics
    """
    # Get health rule violations in the last hour
    now = int(datetime.utcnow().timestamp() * 1000)
    one_hour_ago = int((datetime.utcnow() - timedelta(hours=1)).timestamp() * 1000)

    violations = await _appd_get(
        f"/applications/{app_name}/problems/healthrule-violations",
        params={"time-range-type": "BETWEEN_TIMES", "start-time": one_hour_ago, "end-time": now},
    )

    result = {
        "application": app_name,
        "time_range": "last 1 hour",
        "health_rule_violations": len(violations) if isinstance(violations, list) else 0,
        "violations": violations if isinstance(violations, list) else [],
    }
    return json.dumps(result, indent=2)


# ── Tool 3: Get Business Transactions ──────────────────────────────

@mcp.tool()
async def get_business_transactions(app_name: str) -> str:
    """
    List all business transactions for an application.

    Args:
        app_name: The application name in AppDynamics
    """
    data = await _appd_get(f"/applications/{app_name}/business-transactions")
    if isinstance(data, list):
        bts = [
            {
                "id": bt.get("id"),
                "name": bt.get("name"),
                "tierName": bt.get("tierName"),
                "entryPointType": bt.get("entryPointType"),
            }
            for bt in data
        ]
        return json.dumps(bts, indent=2)
    return json.dumps(data, indent=2)


# ── Tool 4: Get Metric Data ───────────────────────────────────────

@mcp.tool()
async def get_metric_data(
    app_name: str,
    metric_path: str,
    duration_minutes: int = 60,
    rollup: bool = True,
) -> str:
    """
    Query a specific metric from AppDynamics.

    Args:
        app_name: The application name in AppDynamics
        metric_path: The full metric path (e.g. "Overall Application Performance|Average Response Time (ms)")
        duration_minutes: How many minutes of data to retrieve (default 60)
        rollup: Whether to rollup data into a single value (default True)
    """
    params = {
        "metric-path": metric_path,
        "time-range-type": "BEFORE_NOW",
        "duration-in-mins": duration_minutes,
        "rollup": str(rollup).lower(),
    }
    data = await _appd_get(f"/applications/{app_name}/metric-data", params=params)
    return json.dumps(data, indent=2)


# ── Tool 5: Get Tiers and Nodes ────────────────────────────────────

@mcp.tool()
async def get_tiers(app_name: str) -> str:
    """
    List all tiers for an application.

    Args:
        app_name: The application name in AppDynamics
    """
    data = await _appd_get(f"/applications/{app_name}/tiers")
    if isinstance(data, list):
        tiers = [
            {"id": t.get("id"), "name": t.get("name"), "numberOfNodes": t.get("numberOfNodes")}
            for t in data
        ]
        return json.dumps(tiers, indent=2)
    return json.dumps(data, indent=2)


@mcp.tool()
async def get_nodes(app_name: str, tier_name: str = "") -> str:
    """
    List nodes for an application, optionally filtered by tier.

    Args:
        app_name: The application name in AppDynamics
        tier_name: Optional tier name to filter nodes
    """
    path = f"/applications/{app_name}/tiers/{tier_name}/nodes" if tier_name else f"/applications/{app_name}/nodes"
    data = await _appd_get(path)
    if isinstance(data, list):
        nodes = [
            {
                "id": n.get("id"),
                "name": n.get("name"),
                "tierName": n.get("tierName"),
                "machineName": n.get("machineName"),
                "machineAgentPresent": n.get("machineAgentPresent"),
            }
            for n in data
        ]
        return json.dumps(nodes, indent=2)
    return json.dumps(data, indent=2)


# ── Tool 6: Get Health Rule Violations ─────────────────────────────

@mcp.tool()
async def get_health_violations(
    app_name: str,
    duration_minutes: int = 60,
) -> str:
    """
    Get health rule violations for an application within a time range.

    Args:
        app_name: The application name in AppDynamics
        duration_minutes: How many minutes back to check (default 60)
    """
    now = int(datetime.utcnow().timestamp() * 1000)
    start = int((datetime.utcnow() - timedelta(minutes=duration_minutes)).timestamp() * 1000)

    data = await _appd_get(
        f"/applications/{app_name}/problems/healthrule-violations",
        params={"time-range-type": "BETWEEN_TIMES", "start-time": start, "end-time": now},
    )

    if isinstance(data, list):
        violations = [
            {
                "id": v.get("id"),
                "name": v.get("name"),
                "severity": v.get("severity"),
                "status": v.get("status"),
                "startTimeInMillis": v.get("startTimeInMillis"),
                "detectedTimeInMillis": v.get("detectedTimeInMillis"),
                "affectedEntityName": v.get("affectedEntityDefinition", {}).get("name"),
            }
            for v in data
        ]
        return json.dumps({"count": len(violations), "violations": violations}, indent=2)
    return json.dumps(data, indent=2)


# ── Tool 7: Get Errors / Error Rates ──────────────────────────────

@mcp.tool()
async def get_error_rate(
    app_name: str,
    duration_minutes: int = 60,
) -> str:
    """
    Get the overall error rate and error count for an application.

    Args:
        app_name: The application name in AppDynamics
        duration_minutes: How many minutes of data to retrieve (default 60)
    """
    error_metric = "Overall Application Performance|Number of Errors"
    calls_metric = "Overall Application Performance|Number of Calls"

    errors = await _appd_get(
        f"/applications/{app_name}/metric-data",
        params={
            "metric-path": error_metric,
            "time-range-type": "BEFORE_NOW",
            "duration-in-mins": duration_minutes,
            "rollup": "true",
        },
    )
    calls = await _appd_get(
        f"/applications/{app_name}/metric-data",
        params={
            "metric-path": calls_metric,
            "time-range-type": "BEFORE_NOW",
            "duration-in-mins": duration_minutes,
            "rollup": "true",
        },
    )

    result = {"application": app_name, "duration_minutes": duration_minutes, "errors": errors, "calls": calls}
    return json.dumps(result, indent=2)


# ── Tool 8: Get Snapshots ─────────────────────────────────────────

@mcp.tool()
async def get_snapshots(
    app_name: str,
    duration_minutes: int = 30,
    max_results: int = 20,
) -> str:
    """
    Get recent transaction snapshots for an application (slow/error transactions).

    Args:
        app_name: The application name in AppDynamics
        duration_minutes: How many minutes back to search (default 30)
        max_results: Maximum number of snapshots to return (default 20)
    """
    data = await _appd_get(
        f"/applications/{app_name}/request-snapshots",
        params={
            "time-range-type": "BEFORE_NOW",
            "duration-in-mins": duration_minutes,
            "maximum-results": max_results,
        },
    )
    if isinstance(data, list):
        snaps = [
            {
                "id": s.get("id"),
                "businessTransactionName": s.get("businessTransactionName"),
                "URL": s.get("URL"),
                "timeTakenInMilliSecs": s.get("timeTakenInMilliSecs"),
                "errorOccurred": s.get("errorOccurred"),
                "userExperience": s.get("userExperience"),
            }
            for s in data
        ]
        return json.dumps({"count": len(snaps), "snapshots": snaps}, indent=2)
    return json.dumps(data, indent=2)


# ── Tool 9: Get Anomalies with Suspected Causes ───────────────────

@mcp.tool()
async def get_anomalies(
    app_name: str,
    duration_hours: int = 24,
    include_suspected_causes: bool = True,
) -> str:
    """
    Get anomaly violations detected by AppDynamics AI for an application,
    including suspected root causes. Uses the Anomaly Detection API which
    leverages machine learning to identify abnormal behavior in business
    transactions and provides automated root cause analysis.

    Args:
        app_name: The application name in AppDynamics
        duration_hours: How many hours back to check for anomalies (default 24)
        include_suspected_causes: Whether to include AI-determined suspected causes (default True)
    """
    app_id = await _resolve_app_id(app_name)

    now = int(datetime.utcnow().timestamp() * 1000)
    start = int((datetime.utcnow() - timedelta(hours=duration_hours)).timestamp() * 1000)

    try:
        data = await _appd_get_raw(
            f"/controller/anomaly/rest/api/v1/applications/{app_id}/anomalies",
            params={
                "startTime": start,
                "endTime": now,
                "fetchSuspectedCause": str(include_suspected_causes).lower(),
            },
        )
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            return json.dumps({
                "application": app_name,
                "app_id": app_id,
                "error": "Anomaly Detection API not available",
                "message": "The Anomaly Detection API endpoint returned 404. This typically means "
                           "anomaly detection is not enabled on this controller or the controller "
                           "version does not support this API. Check Settings > Anomaly Detection "
                           "in the AppDynamics UI, or contact your AppDynamics admin.",
            }, indent=2)
        raise

    violations = data.get("violationListItem", []) if isinstance(data, dict) else []

    anomalies = []
    for v in violations:
        anomaly = {
            "id": v.get("id"),
            "status": v.get("status"),
            "description": v.get("description"),
            "startTime": v.get("startTime"),
            "endTime": v.get("endTime"),
            "duration_ms": v.get("duration"),
            "affectedEntityName": v.get("affectedEntityName"),
            "affectedEntityType": v.get("affectedEntityType"),
        }

        # Extract suspected causes from event details
        if include_suspected_causes and v.get("eventDetailMap"):
            causes = []
            for event_id, event in v["eventDetailMap"].items():
                event_info = {
                    "eventId": event_id,
                    "severity": event.get("eventSeverity"),
                    "type": event.get("eventType"),
                    "summary": event.get("eventSummary"),
                    "suspectedCauses": [],
                }
                for cause in event.get("suspectedCauses", []):
                    event_info["suspectedCauses"].append({
                        "entityName": cause.get("entityName"),
                        "entityType": cause.get("entityType"),
                        "rcaSummary": cause.get("rcaSummary"),
                        "metrics": [
                            m.get("metricName")
                            for m in cause.get("affectedEntityMetricIds", [])
                        ],
                    })
                causes.append(event_info)
            anomaly["events"] = causes

        anomalies.append(anomaly)

    # Summary
    active = [a for a in anomalies if a.get("status") == "OPEN"]
    resolved = [a for a in anomalies if a.get("status") == "RESOLVED"]
    with_causes = [a for a in anomalies if a.get("events") and
                   any(e.get("suspectedCauses") for e in a.get("events", []))]

    return json.dumps({
        "application": app_name,
        "app_id": app_id,
        "duration_hours": duration_hours,
        "summary": {
            "total_anomalies": len(anomalies),
            "active": len(active),
            "resolved": len(resolved),
            "with_suspected_causes": len(with_causes),
        },
        "anomalies": anomalies,
    }, indent=2)


# ── Entry Point ────────────────────────────────────────────────────

if __name__ == "__main__":
    import asyncio
    from mcp.server.stdio import stdio_server

    async def run():
        server = mcp._mcp_server
        async with stdio_server() as (read_stream, write_stream):
            await server.run(read_stream, write_stream, server.create_initialization_options())

    asyncio.run(run())
