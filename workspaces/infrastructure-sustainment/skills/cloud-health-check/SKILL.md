---
name: cloud-health-check
description: Run a comprehensive health check on a cloud service across AWS/GCP/Azure. Checks running status, version, resource utilization, and recent events.
agents: [cloud_ops_agent]
---

# Cloud health check

Comprehensive health assessment for any service in the managed catalog.

## When to use

- After a deployment to verify service health
- During incident investigation to assess current state
- Pre-change validation (before CHG execution)
- Routine health checks requested by app teams

## Workflow

### Step 1: Identify the service

Ask for one of:
- BAPP ID (e.g., `BAPP0006350`)
- Service name (e.g., `payment-service`)
- BEAN ticket number (extract service from ticket)

### Step 2: Resolve cloud config

Look up in `catalog-index.md`:
- Cloud provider (AWS / GCP / Azure)
- Account/project and region
- Cluster and service name
- Expected version (from last CHG if available)

### Step 3: Run diagnostics

Execute in order (all read-only):

1. **Service status** — running count, desired count, health
2. **Deployed version** — container image tag
3. **Resource utilization** — CPU/memory (if available via CloudWatch/Monitoring)
4. **Recent events** — last 10 events, errors, restarts
5. **Connectivity** — endpoint responding, latency

### Step 4: Generate health report

Output structured report:

```markdown
## Health Report: {service_name}

**Timestamp:** {now}
**Requested by:** {user or BEAN ticket}

| Metric | Value | Status |
|--------|-------|--------|
| Cloud | AWS ECS / GCP Cloud Run / Azure | — |
| Region | us-east-1 | — |
| Running Tasks | 3/3 | ✅ Healthy |
| Deployed Version | v2.3.1 | ✅ Expected |
| CPU Utilization | 45% | ✅ Normal |
| Memory | 68% | ✅ Normal |
| Last Restart | 3 days ago | ✅ Stable |
| Endpoint | 200 OK (89ms) | ✅ Responding |

### Overall: ✅ HEALTHY

No issues detected. Service running as expected.
```

### Step 5: Post results

If triggered from a BEAN ticket:
- Add the health report as a comment on the ticket
- If unhealthy, suggest next steps (restart, scale, escalate)

## Health assessment criteria

| Status | Condition |
|--------|-----------|
| ✅ Healthy | All tasks running, expected version, normal utilization |
| ⚠️ Degraded | Some tasks failing, high utilization (>80%), or recent restarts |
| ❌ Critical | No tasks running, endpoint down, or crash loop detected |
