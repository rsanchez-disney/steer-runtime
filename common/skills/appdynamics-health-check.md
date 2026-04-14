---
name: appdynamics-health-check
description: Application health check and incident triage using AppDynamics MCP — violations, errors, snapshots, tiers, and anomalies
---

# AppDynamics Health Check

End-to-end application health assessment using the AppDynamics MCP server.

## Prerequisites

- AppDynamics MCP configured in `mcp.json` with valid OAuth credentials
- Application name in AppDynamics (exact match required)

## Workflow

### Step 1: Identify Application

1. If user provides an app name, use it directly
2. If not, run `list_applications` to show all monitored apps
3. Let user pick the target application

### Step 2: Health Rule Violations

1. Run `get_application_health` for the target app (last 1 hour)
2. Run `get_health_violations` with `durationMinutes: 60`
3. Report:
   - Total violation count
   - Severity breakdown (CRITICAL, WARNING)
   - Affected entities
4. If zero violations, note the app is healthy and continue

### Step 3: Error Analysis with Baseline Comparison

**Step 3a: Discover available metric paths**
1. Run `get_metric_data` with `metricPath: "Overall Application Performance|*"`, `durationMinutes: 60`, `rollup: true`
2. From the results, identify which error and call metrics exist. Common variants:
   - `Overall Application Performance|Number of Errors` or `Overall Application Performance|Errors per Minute`
   - `Overall Application Performance|Number of Calls` or `Overall Application Performance|Calls per Minute`
3. Use the paths that return data for the remaining steps

**Step 3b: Application-level baseline (24h) and current (1h)**
1. Run `get_metric_data` with the discovered error metric path, `durationMinutes: 1440`, `rollup: true` → 24h baseline
2. Run `get_metric_data` with the discovered call metric path, `durationMinutes: 1440`, `rollup: true` → 24h baseline
3. Repeat both with `durationMinutes: 60` → current window
4. Calculate:
   - 24h baseline error rate: `(errors_24h / calls_24h) * 100`
   - 24h average errors per hour: `errors_24h / 24`
   - Current 1h error rate: `(errors_1h / calls_1h) * 100`
   - Deviation: `current_error_rate / baseline_error_rate`

**Step 3c: Per-tier error analysis**
1. Run `get_tiers` to get all tier names (reuse in Step 4)
2. For each tier with nodes > 0, run `get_metric_data` with:
   - `metricPath: "Overall Application Performance|<tierName>|Errors per Minute"` (or discovered variant)
   - `durationMinutes: 60`, `rollup: true`
   - Also query `Calls per Minute` and `Average Response Time (ms)` per tier
3. If tier-level paths return empty, try: `Business Transaction Performance|Business Transactions|<tierName>|*|Errors per Minute`
4. Build a per-tier summary table:

```
Tier                          | Calls (1h) | Errors (1h) | Error Rate | Avg RT (ms)
------------------------------|------------|-------------|------------|------------
<tier_1>                      | <calls>    | <errors>    | <rate>%    | <rt>
<tier_2>                      | <calls>    | <errors>    | <rate>%    | <rt>
```

5. Flag tiers where:
   - Error rate > 1% (absolute) or > 3x the app-level baseline
   - Average response time > 2x the app-level average
   - Error count is disproportionately high relative to call volume

**Step 3d: Snapshots**
1. Run `get_snapshots` with `durationMinutes: 30`, `maxResults: 20`
2. Categorize snapshots by `userExperience` (NORMAL, SLOW, ERROR, VERY_SLOW, STALL)
3. Cross-reference error/slow snapshots with the per-tier analysis to identify which tier is responsible

**Report:**
- App-level: 24h baseline rate, current 1h rate, deviation
- Per-tier breakdown table
- Snapshot categorization with tier correlation
- Patterns: same endpoint, same tier, same error type

**Deviation interpretation:**
- `≤ 1.5x` baseline → normal fluctuation, not degraded
- `1.5x – 3x` baseline → elevated, potentially degraded
- `> 3x` baseline → significant spike, likely degraded or critical

**⏸ CHECKPOINT — User reviews error summary and decides whether to dig deeper**

### Step 4: Infrastructure Check

1. Run `get_tiers` to list all tiers and node counts
2. Run `get_nodes` for each tier (or the tier of interest)
3. Flag:
   - Tiers with zero nodes
   - Nodes without machine agents (`machineAgentPresent: false` is normal for containers)
   - Unexpected node count changes

### Step 5: Metric Deep Dive (Optional)

If user wants more detail, run `get_metric_data` for key metrics:

```
Overall Application Performance|Average Response Time (ms)
Overall Application Performance|Number of Calls
Overall Application Performance|Number of Errors
Overall Application Performance|Number of Slow Calls
Overall Application Performance|Stall Count
```

For tier-specific metrics:
```
Application Infrastructure Performance|<tier>|Individual Nodes|<node>|Hardware Resources|CPU|%Busy
Application Infrastructure Performance|<tier>|Individual Nodes|<node>|Hardware Resources|Memory|Used %
```

Replace `<tier>` and `<node>` with actual names from Steps 4.

### Step 6: Anomaly Detection (Controller 26.x+ Only)

1. Run `get_anomalies` with `durationHours: 24`, `includeSuspectedCauses: true`
2. If API returns 404, note that the controller version doesn't support anomaly detection and skip
3. If anomalies found, report:
   - Active vs resolved count
   - Suspected root causes and affected entities
   - Correlated metrics

### Step 7: Summary Report

Generate a concise health report:

```
Application: <name>
Status: HEALTHY | DEGRADED | CRITICAL
Time: <timestamp>

Health Violations: <count> (last 1h)
Baseline Error Rate (24h): <errors_24h>/<calls_24h> (<baseline_rate>%), avg <avg_errors_per_hour> errors/hour
Current Error Rate (1h): <errors_1h>/<calls_1h> (<current_rate>%), deviation: <deviation>x baseline
Slow Transactions: <count> (last 30min)
Error Transactions: <count> (last 30min)
Tiers: <count> | Nodes: <count>
Anomalies (24h): <count> active, <count> resolved

Per-Tier Breakdown:
Tier                          | Calls (1h) | Errors (1h) | Error Rate | Avg RT (ms) | Status
------------------------------|------------|-------------|------------|-------------|-------
<tier_1>                      | <calls>    | <errors>    | <rate>%    | <rt>        | OK/WARN
<tier_2>                      | <calls>    | <errors>    | <rate>%    | <rt>        | OK/WARN

Findings:
- <finding 1>
- <finding 2>

Recommended Actions:
- <action 1>
- <action 2>
```

Status criteria (based on baseline comparison):
- **HEALTHY** — zero violations, error rate ≤ 1.5x baseline, no slow/error snapshots
- **DEGRADED** — warnings present, error rate 1.5x–3x baseline, or slow/error snapshots detected but not spiking
- **CRITICAL** — critical violations, error rate > 3x baseline, stalls detected, or sustained error pattern across multiple endpoints

If baseline data is unavailable, fall back to absolute thresholds:
- **HEALTHY** — zero violations, error rate < 1%, no slow transactions
- **DEGRADED** — warnings present, error rate 1-5%, or slow transactions detected
- **CRITICAL** — critical violations, error rate > 5%, or stalls detected

## Incident Triage Mode

When used alongside a ServiceNow incident:

1. Run the full health check (Steps 1-7) for the app referenced in the incident CI
2. Cross-reference AppDynamics findings with the incident description
3. Add a work note to the incident with the health check summary using `add_work_note`
4. Recommend next steps: escalate, reassign, or resolve based on findings

## Important Rules

- **Always use exact app names** — AppDynamics is case-sensitive
- **Don't skip the health violations step** — it's the fastest signal
- **Report what you find, not what you expect** — zero violations is a valid finding
- **Pause at checkpoints** — let the user decide how deep to go
