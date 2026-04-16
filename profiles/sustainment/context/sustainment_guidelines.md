# Sustainment Guidelines

## Mission
Maintain application stability, respond to incidents, perform root cause analysis, and ensure service health across all environments.

## Input Triggers

### ServiceNow
- **INC** — Incidents requiring investigation and resolution
- **CTASK** — Change tasks: patching, release validation, maintenance windows

### Jira
- **Defect** — Bug tickets requiring triage and fix coordination
- **Ticket** — General sustainment work items

### Alerts
- Observability tool alerts (Splunk, AppDynamics, CloudWatch, etc.)
- Automated threshold breaches
- Health check failures

### Manual
- Chat requests, email escalations, ad-hoc investigations

## Severity Classification

| Severity | Criteria | Response Time | Resolution Target |
|----------|----------|---------------|-------------------|
| P1 Critical | Service down, revenue impact | 15 min | 4 hours |
| P2 High | Major degradation, workaround exists | 30 min | 8 hours |
| P3 Medium | Minor impact, limited users | 2 hours | 24 hours |
| P4 Low | Cosmetic, no user impact | 4 hours | 5 business days |

## Core Tasks

1. **Determine Root Cause** — trace through logs, metrics, and code to identify the source of failure
2. **Summarize Impact** — quantify affected users, transactions, revenue, and duration
3. **Validate Stability** — confirm application/flow is healthy after fix or release
4. **GSM Analysis** — track SLAs, incident trends, and service health metrics

## Escalation Path
1. Sustainment team investigates
2. If code fix needed → escalate to dev team via Jira defect
3. If infrastructure → escalate to ops/infra team
4. If vendor/external → escalate to GSM with impact summary
