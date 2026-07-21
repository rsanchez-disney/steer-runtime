# Runbook — WDW Mobile Ordering Arrival Windows

## Restart Procedures

1. AWS Console → ECS → Cluster: wdw-revmgmt-S0001409-use1-prd
2. Restart services: arrw-svc-prod-live, arrw-batch-prod-live, arrw-api-prod-live, arrw-ui-prod-live
3. "Update service" → "Force new deployment" → Update

**Validation:**
- Service: `https://wdwarrw-svc.wdprapps.disney.com/arrival-window-service/healthcheck`
- Batch: `https://wdwarrw-batch.wdprapps.disney.com/arrival-window-batch/healthcheck`
- API: `https://wdwarrw-ui.wdprapps.disney.com/api/healthcheck`

---

## Scaling

- **Scale up:** Increase ECS desired count.
- **Scale down:** Min 2 tasks for service.

## Failover

- RDS cross-region replica in us-west-2 for DR
- MariaDB: wdw-arrivalwindow-prod-master.wdatdbs.disney.com

## Rollback

- Harness pipeline rollback

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| MOO | prd-global-fnb | Arrival windows not consumed |
| DTOC | DX Monitoring Teams channel | P1/P2 bridge |
