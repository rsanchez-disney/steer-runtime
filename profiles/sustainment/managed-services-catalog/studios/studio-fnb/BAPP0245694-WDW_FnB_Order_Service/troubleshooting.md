# Troubleshooting — WDW FnB Order Service

## Common Issues

### Issue: Orders not being stored

**Symptoms:** Orders placed but not appearing in DynamoDB

**Root Cause:** DynamoDB write throttling or service error

**Resolution:**
1. Check Splunk: `index=wdpr_fnb_order_service source="*use1*prod*" level=ERROR`
2. Check DynamoDB metrics in CloudWatch (throttling, latency)
3. Check Redis connectivity

---

### Issue: Kinesis events not publishing

**Symptoms:** Downstream consumers not receiving order events

**Root Cause:** Kinesis stream capacity or service publishing failure

**Resolution:**
1. Check Kinesis stream metrics (wdw-revmgmt-S0002005-use1-fnb-order-prd)
2. Check service logs for publishing errors
3. May need to increase Kinesis shard count

---

## Escalation Decision Tree

- If DynamoDB/Kinesis → check AWS infrastructure
- If service itself → restart ECS, check AppDynamics

## Known Quirks

- Cross-region DynamoDB replica exists for DR
