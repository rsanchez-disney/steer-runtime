# Runbook — DLR Mobile Ordering Arrival Windows

## Restart Procedures

1. AWS Console → ECS → Cluster: dlrarrw-prod
2. Restart each service individually: svc-prod-live, batch-prod-live, a-api-prod-live, a-ui-prod-live
3. "Update service" → "Force new deployment" → Update
4. Or Rundeck: https://rundeck.wdprapps.disney.com/project/wdpr-sales-dlrarrw-svc_aws/jobs

**Validation:**
- Service: `https://dlrarrw-svc.wdprapps.disney.com/arrival-window-service/healthcheck`
- Batch: `https://dlrarrw-batch.wdprapps.disney.com/arrival-window-batch/healthcheck`
- API: `https://dlrarrw-ui.wdprapps.disney.com/api/healthcheck`

---

## Scaling

- **Scale up:** Increase ECS desired count per service.
- **Scale down:** Min 2 tasks for service component.

## Failover

- RDS MariaDB handles failover within AZ (dlr-arrivalwindow-prod-master.wdatdbs.disney.com)

## Rollback

- Harness pipeline rollback
- Rundeck: deploy previous revision

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| MOO | prd-global-fnb | Arrival windows not consumed properly |
| DTOC | DX Monitoring Teams channel | P1/P2 bridge |
