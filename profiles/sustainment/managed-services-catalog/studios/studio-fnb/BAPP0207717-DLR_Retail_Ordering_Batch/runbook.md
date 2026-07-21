# Runbook — DLR Retail Ordering Batch

## Restart Procedures

1. AWS Console → Batch → Submit job: B0205283-wdprt-ro-batch-prod (us-west-2)
2. Or trigger via Lambda: wdpr-revmgmt-S0001535-usw2-prd-ro-awsbatch-cw

**Validation:**
- Splunk: index=wdpr_revmgmt_prd_usw2_awsbatch source=*ro-batch*
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
