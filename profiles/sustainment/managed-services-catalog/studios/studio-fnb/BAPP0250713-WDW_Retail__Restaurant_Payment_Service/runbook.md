# Runbook — WDW Retail & Restaurant Payment Service

## Restart Procedures

1. AWS Console → ECS → Cluster: rr-payment-prod (us-east-1)
2. Service: rr-payment-service-prod
3. "Update service" → "Force new deployment"
4. Harness: https://disney.harness.io/ng/.../Retail_Restaurant_Payment_Service/pipelines

**Validation:**
- Health check: `https://latest.rr-payment.wdw.wdprapps.disney.com/healthcheck`
- Swagger: `https://latest.rr-payment.wdw.wdprapps.disney.com/webjars/swagger-ui/index.html`
- Splunk: index=wdpr-revmgmt service=rr-payment-service aws_region=us-east-1

---

## Scaling

- **Scale up:** Increase ECS desired count.
- **Scale down:** Min 2 tasks.

## Failover

- DynamoDB auto-failover within region

## Rollback

- Harness pipeline rollback

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| DSP/POS | app-global-dsp | Payment gateway issues |
| MOO/ROO | prd-global-fnb | Upstream caller issues |
