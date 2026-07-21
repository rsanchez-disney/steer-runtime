# Runbook — WDPR FNB Stats Publisher Services

## Restart Procedures

1. Standard ECS restart: "Update service" → "Force new deployment"

**Validation:**
- Service starts publishing stats (check downstream dashboards)
- No errors in CloudWatch logs

---

## Scaling

- Low traffic — minimal scaling needed

## Failover

- Non-critical service — no immediate guest impact if down

## Rollback

- Harness pipeline rollback

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| Reporting team | Internal | If stats gaps observed |
