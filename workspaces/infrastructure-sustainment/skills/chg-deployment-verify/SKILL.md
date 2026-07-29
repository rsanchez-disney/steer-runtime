---
name: chg-deployment-verify
description: End-to-end CHG deployment verification — validates that all CTASKs in a change request are deployed correctly across cloud environments.
agents: [chg_analyzer_agent, cloud_ops_agent, stability_validator_agent]
---

# CHG deployment verification

Verify that a change request (CHG) has been fully deployed and all services are running the expected versions.

## When to use

- After a CHG has been implemented
- During CHG review phase (confirm implementation is complete)
- When an app team reports "we deployed but something seems wrong"

## Workflow

### Step 1: Fetch CHG details

Using ServiceNow (via Compass):
1. Get the CHG record (number, state, CTASKs)
2. Extract all CTASKs and their assignments
3. Parse service names and versions from CTASK descriptions

### Step 2: For each CTASK

| Check | How |
|-------|-----|
| Service deployed? | Cloud CLI → check running version matches CTASK version |
| Correct environment? | Verify the cluster/project matches expected prod/nonprod |
| Health status? | Run cloud-health-check skill for the service |
| Code comparison | GitHub: diff between previous tag and deployed tag |

### Step 3: Version comparison

For each service:
```bash
# Generate GitHub compare URL
https://github.disney.com/{org}/{repo}/compare/{old_tag}...{new_tag}
```

Report:
- Number of commits between versions
- Files changed count
- Any breaking change indicators (major version bump, migration files)

### Step 4: Generate compliance report

```markdown
## CHG Deployment Verification Report

**CHG:** {chg_number}
**Description:** {short_description}
**Verified:** {timestamp}

### CTASK Results

| CTASK | Service | Expected | Deployed | Status |
|-------|---------|----------|----------|--------|
| CTASK001 | payment-service | v2.3.1 | v2.3.1 | ✅ Match |
| CTASK002 | auth-gateway | v1.8.0 | v1.8.0 | ✅ Match |
| CTASK003 | order-api | v3.1.2 | v3.1.1 | ❌ Mismatch |

### Health Summary

| Service | Status | Notes |
|---------|--------|-------|
| payment-service | ✅ Healthy | 3/3 tasks, 200 OK |
| auth-gateway | ✅ Healthy | 2/2 tasks, 200 OK |
| order-api | ⚠️ Degraded | Version mismatch — deploy may be in progress |

### Overall: ⚠️ PARTIAL — 1 service pending

**Action required:** CTASK003 (order-api) shows v3.1.1 but CHG specifies v3.1.2.
Possible causes: deployment in progress, failed deploy, or wrong environment targeted.
```

### Step 5: Update tickets

- Add the verification report to the CHG work notes
- If mismatches found:
  - Comment on the affected CTASK(s) with details
  - Create a BEAN ticket if investigation needed
- If all pass:
  - Add "Deployment verified by automation" to CHG work notes
  - Recommend moving CHG to Review state

## Integration with other skills

This skill calls:
- `cloud-health-check` for per-service health assessment
- `chg_analyzer_agent` for ServiceNow CHG/CTASK parsing
- `stability_validator_agent` for pre/post comparison if baseline exists
