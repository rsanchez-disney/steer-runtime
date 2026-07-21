# Runbook — WDPR FNB Barcode Generator Service

## Restart Procedures

1. Lambda-based — auto-recovers from cold starts
2. If persistent failures: redeploy via Harness pipeline
3. Rundeck: https://rundeck.wdprapps.disney.com/project/barcode-gen-svc_aws/jobs

**Validation:**
- Check API Gateway logs for 5xx responses
- Splunk: index=wdpr_roo_barcode

---

## Scaling

- Lambda auto-scales — no manual intervention

## Failover

- Lambda is highly available within region

## Rollback

- Harness pipeline rollback to previous Lambda version

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| ROO | prd-global-fnb | Barcode requests failing from ROO |
