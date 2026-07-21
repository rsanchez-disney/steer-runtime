# Troubleshooting — WDPR FNB Barcode Generator Service

## Common Issues

### Issue: Barcode generation failures

**Symptoms:** ROO receipts missing barcodes, API Gateway 5xx

**Root Cause:** Lambda timeout, S3 write failure, or authorization Lambda issue

**Resolution:**
1. Check API Gateway execution logs: `index=wdpr_roo_barcode`
2. Check Lambda CloudWatch logs for auth and create functions
3. Verify S3 bucket permissions

---

## Escalation Decision Tree

- If Lambda → redeploy via Harness
- If S3 → check bucket policies

## Known Quirks

- Non-blocking for orders — orders complete even without barcode
- Auth Lambda validates request before create Lambda generates barcode
