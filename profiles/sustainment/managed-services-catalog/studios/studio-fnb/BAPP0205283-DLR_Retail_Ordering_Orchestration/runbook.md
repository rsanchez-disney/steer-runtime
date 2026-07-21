# Runbook — DLR Retail Ordering Orchestration

## Restart Procedures

1. AWS Console → ECS → Cluster: dlr-revmgmt-S0001535-usw2-prd
2. Service: retailorder-svc-prod-live
3. "Update service" → "Force new deployment" → Update
4. Or Rundeck: https://rundeck.wdprapps.disney.com/project/retail-ordering-orchestration-service_aws/jobs

**Validation:**
- Health check: `https://dlr-roo.wdprapps.disney.com/svc/healthcheck`
- Monitor Splunk index=dlr_ro_service for errors
- Verify Grafana "General Stats - DLR - ROO"

---

## Scaling

- **Scale up:** Increase ECS desired count.
- **Scale down:** Min 2 tasks for HA.

## Failover

- Redis (roo-prod) has auto-failover

## Rollback

- Harness pipeline rollback or Rundeck previous revision

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| VenueNext | help@venuenext.com | POS order submission failures |
| DSP/POS | app-global-dsp | Payment failures |
| DTOC | DX Monitoring Teams channel | P1/P2 bridge |
