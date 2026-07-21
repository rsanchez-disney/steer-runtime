# Runbook — WDPRT MO Batch Service

## Restart Procedures

1. AWS Console → Batch → Job Definitions
2. WDW: wdpr-mo-batch-svc-prod (us-east-1, account wdpr-revmgmt-prod)
3. DLR: wdpr-mo-batch-svc-prod (us-west-2, account wdpr-revmgmt-prod)
4. Submit new job manually if scheduled run was missed

**Validation:**
- Check Splunk: index=wdpr_revmgmt_prod_use1_awsbatch source=*mo-batch* (WDW)
- Check Splunk: index=wdpr_revmgmt_prd_usw2_awsbatch source=*mo-batch* (DLR)
- Verify no alerts firing for "MO Batch Service is not running"

---

## Scaling

- N/A — batch job, not a long-running service

## Failover

- DynamoDB tables have cross-region replicas in production

## Rollback

- Update AWS Batch job definition to previous revision
- Harness pipeline rollback

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| DSP/POS | app-global-dsp | Refund processing failures |
| AWS Batch | Cloud team | Infrastructure issues |
