# Troubleshooting — WDPRT MO Batch Service

## Common Issues

### Issue: Batch job not running on schedule

**Symptoms:** Alert "MO Batch Service is not running" fires

**Root Cause:** AWS Batch scheduler issue, job definition error, or infrastructure

**Resolution:**
1. Check AWS Batch console for job status
2. Manually submit job if schedule missed
3. Check CloudWatch for Batch compute environment issues
4. Verify job definition revision is correct

---

### Issue: VenueNext refund errors

**Symptoms:** "MO Batch - WDW/DLR VenueNext Errors" alert

**Root Cause:** VenueNext rejecting refund requests

**Resolution:**
1. Check Splunk for specific error codes
2. May be stale order data — verify order still needs refund
3. Contact VenueNext if persistent

---

## Escalation Decision Tree

- If batch not running → check AWS Batch, resubmit
- If refund failures → check payment team + VenueNext
- If DynamoDB issues → check table health in CloudWatch

## Known Quirks

- WDW and DLR are separate batch jobs in separate regions
- Cross-region DynamoDB replicas exist in prod
