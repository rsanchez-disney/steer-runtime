# Sustainment Prompt Guide

**Effective prompts for incident triage, root cause analysis, stability validation, and GSM reporting**

---

## Quick Reference

| Task | Agent | Example Prompt |
|------|-------|----------------|
| Triage incident | `incident_triage_agent` | "Triage INC0012345 from ServiceNow" |
| Root cause analysis | `rca_agent` | "Perform RCA on the 5xx spike at 14:30 today" |
| Stability check | `stability_validator_agent` | "Validate stability after the v2.3.1 hotfix" |
| GSM report | `gsm_analyst_agent` | "Generate GSM report for May 2026" |
| Full workflow | `sustainment_orchestrator_agent` | "Handle INC0012345: triage, RCA, and validate fix" |

---

## Daily Workflows

### 1. Incident Triage

```
Triage INC0012345 from ServiceNow.
Initial alert: 5xx rate exceeded 5% on cart-service.
Affected: checkout flow for US guests.
```

**What happens:**
1. Classifies severity based on impact and blast radius
2. Identifies affected services and dependencies
3. Determines routing (platform team, app team, vendor)
4. Produces triage summary with recommended actions

---

### 2. Root Cause Analysis

```
Perform RCA on the cart-service 5xx spike at 14:30 today.
What I know:
- Started after v2.3.1 deploy at 14:25
- RDS connection count spiked to max
- Recovered after pool size increase at 15:10
```

**What happens:**
1. Correlates timeline with deployment events
2. Analyzes logs and metrics via Compass/Splunk
3. Identifies root cause and contributing factors
4. Produces RCA document with 5-whys analysis
5. Generates action items with prevention measures

---

### 3. Stability Validation

```
Validate stability after the v2.3.1 hotfix deployed 2 hours ago.
Check:
- Error rates back to baseline
- Latency p99 under 500ms
- No new alerts firing
- Connection pool healthy
```

**What happens:**
1. Queries metrics for error rate trend (before/after)
2. Checks latency percentiles against SLA thresholds
3. Verifies no active alerts in monitoring
4. Produces stability report with go/no-go for closing incident

---

### 4. GSM Reporting

```
Generate GSM report for May 2026.
Services: cart-service, payment-service, checkout-bff.
Include: incident count, MTTR, SLA compliance, trends vs last month.
```

**What happens:**
1. Aggregates incident data from ServiceNow
2. Calculates MTTR, MTTD, and SLA compliance per service
3. Compares against previous month for trend analysis
4. Produces formatted report for leadership review

---

### 5. Full Orchestrated Workflow

```
Handle INC0012345 end-to-end:
1. Triage and classify
2. Perform RCA using logs from the last 2 hours
3. Validate stability after the fix was applied at 16:00
4. Generate incident summary for the GSM
```

**What happens:**
1. Delegates triage to `incident_triage_agent`
2. Delegates RCA to `rca_agent`
3. Delegates stability check to `stability_validator_agent`
4. Delegates reporting to `gsm_analyst_agent`
5. Consolidates into a single incident lifecycle report

---

## Tips

- Provide ServiceNow ticket numbers (INC, CHG, PRB) — agents auto-detect and fetch details
- For RCA, include the timeline and any known facts; the agent fills gaps from logs
- Stability validation works best when you specify the baseline period
- GSM reports can cover multiple services in one prompt
- The orchestrator handles the full incident lifecycle in sequence
