# Troubleshooting — WDW Retail & Restaurant Payment Service

## Common Issues

### Issue: Payment authorization failures

**Symptoms:** Guests cannot complete payment for orders

**Root Cause:** Payment gateway issue or service error

**Resolution:**
1. Check Splunk: `index=wdpr-revmgmt service=rr-payment-service aws_region=us-east-1 level=ERROR`
2. Verify ECS service health
3. Check DynamoDB for order state
4. Escalate to DSP/POS team if gateway issue

---

### Issue: Refund processing failures

**Symptoms:** Refunds not completing

**Root Cause:** Payment gateway rejecting refund or Lambda error

**Resolution:**
1. Check Lambda CloudWatch logs
2. Verify DynamoDB refund records

---

## Escalation Decision Tree

- If payment gateway → app-global-dsp
- If service itself → restart ECS

## Known Quirks

- New service — production URLs may still be stabilizing
