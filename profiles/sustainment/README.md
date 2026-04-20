# Sustainment Profile

**Incident response, root cause analysis, stability validation, and service health management**

---

## Agents (5)

| Agent | Description |
|-------|-------------|
| `sustainment_orchestrator_agent` | Coordinates sustainment workflows and delegates to specialists |
| `incident_triage_agent` | Classifies incidents from SNOW/Jira/alerts, determines severity and routing |
| `rca_agent` | Root cause analysis using logs, metrics, and documentation via Compass |
| `stability_validator_agent` | Validates application stability post-incident or post-release |
| `gsm_analyst_agent` | GSM analysis — impact summaries, SLA tracking, incident trends |

---

## Input Triggers

| Source | Types |
|--------|-------|
| ServiceNow | INC (incidents), CTASK (patching, releases) |
| Jira | Defects, tickets |
| Alerts | Observability tool alerts, threshold breaches |
| Manual | Chat, email, ad-hoc investigations |

## Observability (via Compass MCP)

Splunk · AppDynamics · AWS CloudWatch · New Relic · GCP · Datadog · Grafana · Archer · LogInsights

## Direct MCP Integrations

The sustainment orchestrator also has direct access to these MCP servers (no Compass proxy needed):

| MCP Server | Tools | Use Case |
|------------|-------|----------|
| `appdynamics-mcp` | 17 | Application health, metrics, tiers, backends, errors, events, snapshots, anomalies, policies |
| `servicenow-mcp` | 23 | Incidents, CTASKs, change requests, CI details, KB search, on-call, timeline, bulk ops |
| `splunk-mcp` | 21 | Log search, dashboards, alerts, saved searches, reports, data models, field discovery |

> `ecommerce-mcp` (Compass SSE) is also available but requires a Compass token. Contact your team lead for `COMPASS_TOKEN` and configure it in `~/.kiro/settings/mcp.json`. Without it, Compass-based tools will not be available.

---

## Quick Start

```bash
koda install sustainment

kiro-cli chat --agent sustainment_orchestrator_agent
> "Investigate INC28829968 — checkout service returning 500 errors since 2pm"
```

## Prompt Examples

### Incident Triage
```
kiro-cli chat --agent incident_triage_agent
> "Triage INC28829968 — classify severity and identify affected services"
```

### Root Cause Analysis
```
kiro-cli chat --agent rca_agent
> "Investigate the payment-service 500 errors. Search logs for the last 4 hours and trace the request flow."
```

### Stability Validation
```
kiro-cli chat --agent stability_validator_agent
> "Validate stability of checkout-service after the hotfix deployment. Compare against last 7 days baseline."
```

### GSM Analysis
```
kiro-cli chat --agent gsm_analyst_agent
> "Generate an impact summary for INC28829968 for stakeholder communication"
> "Generate SLA compliance report for the last 30 days"
> "Analyze incident trends for Q1 — top affected services and recurring issues"
```

### CTASK (Patching/Release)
```
kiro-cli chat --agent sustainment_orchestrator_agent
> "CTASK1234567 — validate stability before and after the patching window for payment-service"
```

---

## Install

```bash
koda install sustainment              # Sustainment only
koda install dev-core sustainment     # Dev + Sustainment
```

---

**Profile Version:** 1.0
**Agents:** 5
**Last Updated:** April 16, 2026
