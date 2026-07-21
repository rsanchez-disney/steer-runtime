# Runbook — WDW Retail Ordering Batch

## Restart Procedures

1. AWS Console → Batch → Submit job: B0205134-wdprt-ro-batch-prod (us-east-1)
2. Or trigger via Lambda: wdpr-revmgmt-S0001320-use1-prd-ro-awsbatch-cw

**Validation:**
- Splunk: index=wdpr_revmgmt_prd_use1_awsbatch source=*ro-batch*
- No "RO Batch Service is not running" alert

---

## Scaling

- N/A — batch job

## Failover

- N/A — single region job

## Rollback

- Update job definition to previous revision via Harness

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| DSP/POS | app-global-dsp | Refund failures |
