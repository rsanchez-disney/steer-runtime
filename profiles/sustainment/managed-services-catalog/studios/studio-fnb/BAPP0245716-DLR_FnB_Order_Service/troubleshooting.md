# Troubleshooting — DLR FnB Order Service

## Common Issues

### Issue: Orders not being stored

**Symptoms:** Orders placed but not in DynamoDB

**Root Cause:** DynamoDB write throttling or service error

**Resolution:**
1. Check Splunk: `index=wdpr_fnb_order_service source="*usw2*prod*" level=ERROR`
2. Check DynamoDB CloudWatch metrics
3. Check Redis connectivity

---

## Escalation Decision Tree

- If DynamoDB/Kinesis → check AWS infrastructure
- If service itself → restart ECS

## Known Quirks

- Same codebase as WDW, deployed to us-west-2
