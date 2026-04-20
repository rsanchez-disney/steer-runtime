# Ops Complete Workflows

**End-to-end workflow examples for common operations activities**

---

## Workflow 1: Post-PR AI Metrics Tracking

**Goal:** Track AI productivity impact after completing a ticket

### Step 1: Generate Metrics Report (5 min)

```bash
kiro-cli chat --agent ai_metrics_agent
```

```
Generate AI metrics report for DPAY-14337.
PR: https://github.disney.com/SANCR225/wdpr-config-services/pull/42
```

### Step 2: Review and Confirm (2 min)

Agent will show:
- Original Story Points vs AI Assisted Effort
- Efficiency gain calculation
- Breakdown by activity (coding, testing, analysis)

Confirm the values or adjust before posting to Jira.

### Step 3: Jira Updated Automatically

Agent updates:
- `AI Assisted Effort` field
- `AI Usage Level` field
- `AI Tools Used` field
- Adds `AI-Peer-Reviewed` label
- Posts metrics report as comment

---

## Workflow 2: Pre-Release Validation

**Goal:** Verify everything is ready before a release

### Step 1: Code Quality Check (3 min)

```bash
kiro-cli chat --agent code_quality_agent
```

```
Show full quality report for wdpr-config-services:
- Quality gate status
- Coverage percentage
- Open bugs and vulnerabilities
- Any blockers?
```

### Step 2: Infrastructure Check (2 min)

```bash
kiro-cli chat --agent infra_check_agent
```

```
Check ECS status for:
- payment-service-stage (should have 2 tasks)
- payment-service-prod (should have 3 tasks)
```

### Step 3: Pipeline Verification (2 min)

```bash
kiro-cli chat --agent deployment_agent
```

```
Show the last deployment to stage for payment-service.
Was it successful? When did it complete?
```

### Step 4: Full Report (Alternative — Single Command)

```bash
kiro-cli chat --agent ops_orchestrator_agent
```

```
Pre-release validation for payment-service:
1. SonarQube quality gate status
2. ECS tasks running in stage and prod
3. Last deployment status to stage
```

---

## Workflow 3: Sprint Retrospective AI Metrics

**Goal:** Gather AI impact data for sprint retrospective

### Step 1: Collect Metrics for All Sprint Tickets

```bash
kiro-cli chat --agent ai_metrics_agent
```

```
Generate AI metrics summary for these sprint tickets:
- DPAY-14337
- DPAY-14338
- DPAY-14340
- DPAY-14342

Show aggregate efficiency gain and breakdown by ticket type.
```

### Step 2: Post Summary

Agent generates:
- Per-ticket metrics
- Aggregate efficiency gain
- Breakdown by ticket type (new dev, bug fix, etc.)
- AI usage level distribution

---

## Workflow 4: Incident Response Infrastructure Check

**Goal:** Quickly assess infrastructure during an incident

```bash
kiro-cli chat --agent infra_check_agent
```

```
URGENT: Check all payment-service clusters:
- payment-service-prod (expected: 3 tasks)
- payment-service-stage (expected: 2 tasks)
- payment-service-latest (expected: 1 task)

Report any clusters with fewer tasks than expected.
```

---

## Workflow 5: Post-Deployment Verification

**Goal:** Verify deployment completed successfully

### Step 1: Pipeline Status

```bash
kiro-cli chat --agent deployment_agent
```

```
Show the latest pipeline execution for payment-service to prod.
Include all stage statuses and duration.
```

### Step 2: Infrastructure Health

```bash
kiro-cli chat --agent infra_check_agent
```

```
Verify payment-service-prod has 3 running tasks after deployment.
```

### Step 3: Quality Gate

```bash
kiro-cli chat --agent code_quality_agent
```

```
Confirm quality gate is still passing for wdpr-config-services after latest merge.
```
