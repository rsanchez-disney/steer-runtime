# Troubleshooting — WDPRD Preference Service

## Common Issues

### Issue: DynamoDB throttling

**Symptoms:** Increased latency or 500 errors. CloudWatch shows throttled read/write capacity.

**Root Cause:** DynamoDB provisioned capacity exceeded during peak traffic.

**Resolution:** Check DynamoDB table metrics in CloudWatch. If on-demand, investigate hot partitions. If provisioned, increase capacity or switch to on-demand.

---

### Issue: Preference data not persisting

**Symptoms:** Guest preferences reset or not saved after update.

**Root Cause:** Write failures to DynamoDB or cross-region replication lag.

**Resolution:** Check DynamoDB write metrics. Verify Global Table replication status. Check service logs for write errors.

---

### Issue: Health check failures

**Symptoms:** ALB health checks failing, tasks being replaced.

**Root Cause:** Service unable to connect to DynamoDB or internal dependency failure.

**Resolution:** Check ECS task logs. Verify DynamoDB connectivity. Check Vault secrets are accessible.

---

## Escalation Decision Tree

- If DynamoDB throttling → check capacity, escalate to AWS support if needed
- If cross-region replication issues → escalate to Andrew Southwick
- If service completely down → escalate to Andrew Southwick / Zachary Boone
- If data integrity issues → escalate to Glenn Raposo (Manager)

## Known Quirks

- Preferences are SWID-based — no PII or PCI data stored
- Service is SOR for legacy DynamoDB tables from ProfileService (BAPP0054836)
- Internal accessibility only — not directly accessible from public internet
