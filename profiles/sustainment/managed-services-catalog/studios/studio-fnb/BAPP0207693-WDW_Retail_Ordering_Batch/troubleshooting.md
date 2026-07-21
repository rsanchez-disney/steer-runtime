# Troubleshooting — WDW Retail Ordering Batch

## Common Issues

### Issue: Batch job not running

**Symptoms:** Alert "Mobile Checkout - WDW - RO Batch Service is not running"

**Root Cause:** AWS Batch scheduler or Lambda trigger (wdpr-revmgmt-S0001320-use1-prd-ro-awsbatch-cw) failure

**Resolution:**
1. Check Lambda trigger in CloudWatch for errors
2. Manually submit Batch job if needed
3. Verify job definition revision

---

## Escalation Decision Tree

- If batch infra → Cloud team
- If refund failures → app-global-dsp

## Known Quirks

- Lambda trigger fires the batch job — check Lambda logs first
