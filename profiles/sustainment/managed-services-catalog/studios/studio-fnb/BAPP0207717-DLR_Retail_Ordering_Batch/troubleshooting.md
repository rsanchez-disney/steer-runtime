# Troubleshooting — DLR Retail Ordering Batch

## Common Issues

### Issue: Batch job not running

**Symptoms:** Alert "Mobile Checkout - DLR - RO Batch Service is not running"

**Root Cause:** AWS Batch scheduler or Lambda trigger (wdpr-revmgmt-S0001535-usw2-prd-ro-awsbatch-cw) failure

**Resolution:**
1. Check Lambda trigger in CloudWatch for errors
2. Manually submit Batch job if needed
3. Verify job definition revision

---

## Escalation Decision Tree

- If batch infra → Cloud team
- If refund failures → app-global-dsp

## Known Quirks

- Same as WDW batch but us-west-2
