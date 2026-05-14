# Agent Consumption Patterns — Managed Services Catalog

## Overview

The managed services catalog is the single source of truth that connects **incident triggers** to **observability data**. Agents don't guess indexes, CI names, or dashboard URLs — they resolve the affected application from the catalog and extract exactly what they need.

---

## Resolution Flow (All Agents)

```
┌─────────────────────────────────────────────────────────────────┐
│                        INPUT TRIGGER                             │
├─────────────────────────────────────────────────────────────────┤
│  SNOW INC → configuration_item                                  │
│  Jira Defect → app label or component field                     │
│  Alert → app_name or component_name in alert payload            │
│  Manual → user provides app_name or CI                          │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CATALOG RESOLUTION                            │
│                                                                 │
│  1. Match by servicenow.configuration_item (exact)              │
│  2. Match by app_name (exact)                                   │
│  3. Match by bapp_id (exact)                                    │
│  4. Fuzzy match on full_name (fallback)                         │
│                                                                 │
│  Result: loaded app catalog YAML → structured object            │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AGENT-SPECIFIC EXTRACTION                     │
│                                                                 │
│  Each agent reads only the fields it needs from the resolved    │
│  catalog entry (see per-agent patterns below)                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Per-Agent Consumption

### 1. `incident_triage_agent`

**Purpose:** Classify severity, determine impact, route to correct team.

**Fields consumed:**

| Field | Usage |
|-------|-------|
| `servicenow.configuration_item` | Resolve app from INC CI field |
| `servicenow.assignment_group` | Validate/correct routing |
| `support_studio` | Identify owning team |
| `escalation_channel` | Where to escalate |
| `escalation_contacts` | Who to page |
| `components[*].component_type` | Understand blast radius (api vs batch vs worker) |
| `documentation.runbook` | Link in triage notes |

**Workflow:**
```
INC created → extract CI from INC
           → catalog.resolve(ci=CI)
           → validate assignment_group matches INC routing
           → assess impact based on component_type (api = user-facing = higher severity)
           → attach runbook link to INC work notes
           → escalate to escalation_channel if P1/P2
```

---

### 2. `rca_agent`

**Purpose:** Determine root cause using logs, metrics, and documentation.

**Fields consumed:**

| Field | Usage |
|-------|-------|
| `components[*].splunk.error_spl` | Execute to find error patterns |
| `components[*].splunk.base_spl` | Broaden search if error_spl insufficient |
| `components[*].appdynamics` | Check for anomaly detection / slow transactions |
| `components[*].cloudwatch.log_group` | Pull CloudWatch logs if Splunk insufficient |
| `components[*].cloud` | Identify infra layer (ECS task failures, Lambda throttles) |
| `documentation.runbook` | Check known issues / past RCAs |
| `documentation.wiki` | Search for related architecture context |

**Workflow:**
```
Triage complete → rca_agent receives app_name + time window
               → catalog.resolve(app_name)
               → for each component:
                    → run error_spl (scoped to time window)
                    → if errors found → correlate with infra (ECS events, Lambda errors)
                    → if AppD configured → check for anomaly snapshots
                    → if CloudWatch configured → cross-reference log streams
               → check runbook for known failure modes
               → synthesize root cause hypothesis
               → output: RCA summary with evidence links
```

**Key design point:** The `error_spl` field gives the agent a *ready-to-execute* query. The agent only needs to append a time range (`earliest=-4h latest=now`). No guessing indexes or sourcetypes.

---

### 3. `stability_validator_agent`

**Purpose:** Confirm an application/flow is stable after an incident or release.

**Fields consumed:**

| Field | Usage |
|-------|-------|
| `components[*].splunk.latency_spl` | Check response times are within normal range |
| `components[*].splunk.error_spl` | Verify error rate has returned to baseline |
| `components[*].health_check.url` | Hit health endpoint, verify expected_status |
| `components[*].appdynamics` | Check for ongoing violations/anomalies |
| `components[*].cloudwatch.alarm_prefix` | Verify no active alarms |
| `components[*].cloud.service_name` | Check ECS/K8s task health (running count, restarts) |
| `components[*].grafana.dashboard_url` | Reference for human validation |

**Workflow:**
```
Post-incident or post-release → stability_validator receives app_name
                              → catalog.resolve(app_name)
                              → for each component:
                                   → hit health_check.url → assert expected_status
                                   → run latency_spl → compare p95 to baseline
                                   → run error_spl with count → compare to pre-incident rate
                                   → if cloudwatch → check active alarms matching prefix
                                   → if cloud.infra_type=ECS → check running task count
                              → output: stability report (STABLE / DEGRADED / UNSTABLE)
                                   with per-component evidence
```

---

## Resolution Priority

When multiple identifiers are available, agents resolve in this order:

1. **`servicenow.configuration_item`** — Most reliable for SNOW-triggered incidents
2. **`app_name`** — Used by alerts and Jira tickets (exact match, kebab-case)
3. **`bapp_id`** — Used for CMDB/Archer cross-references
4. **`full_name`** — Fuzzy fallback for manual/chat triggers

---

## What Happens When a Field is Missing

Agents treat missing observability blocks as "not available for this component" and skip gracefully:

```
if component.splunk:
    run splunk queries
elif component.cloudwatch:
    fall back to CloudWatch logs
elif component.newrelic:
    fall back to NewRelic
else:
    report: "No log source configured for {component_name}"
```

This means teams only fill in what they have — agents adapt automatically.

---

## Cross-Agent Handoff

The catalog enables clean handoffs between agents in the sustainment workflow:

```
┌──────────────────┐     ┌──────────────┐     ┌─────────────────────────┐
│ incident_triage  │────▶│   rca_agent  │────▶│ stability_validator     │
│                  │     │              │     │                         │
│ Resolves app,    │     │ Uses same    │     │ Uses same catalog entry │
│ validates routing│     │ catalog entry│     │ to verify recovery      │
│ attaches runbook │     │ to query logs│     │                         │
└──────────────────┘     └──────────────┘     └─────────────────────────┘
        │                        │                        │
        └────────────────────────┴────────────────────────┘
                                 │
                    All resolve from the SAME catalog file
                    (e.g., managed-services-catalog/studios/studio-mars/BAPP0012680-Booking_Service/app.yaml)
```

The `app_name` is the shared key passed between agents. Each agent re-resolves from the catalog to get the fields it needs — no coupling between agents on internal data structures.
