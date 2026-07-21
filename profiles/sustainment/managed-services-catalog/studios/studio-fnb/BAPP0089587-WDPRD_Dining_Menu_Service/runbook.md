# Runbook — WDPRD Dining Menu Service

## Restart Procedures

1. Navigate to AWS Console → ECS
2. WDW: Cluster wdw-revmgmt-S0016153-use1-prd → Service dining-menu-svc-prod-live
3. DLR: Cluster dlr-revmgmt-S0015639-usw2-prd → Service dining-menu-svc-prod-live
4. "Update service" → "Force new deployment" → Update

**Validation:**
- WDW: `https://dining-menu.wdw.wdprapps.disney.com/diningMenuSvc/healthcheck`
- DLR: `https://dining-menu.dlr.wdprapps.disney.com/diningMenuSvc/healthcheck`
- Monitor Splunk index=wdpr_diningmenu_service for errors

---

## Scaling

- **Scale up:** Increase ECS desired count. Auto-scaling configured.
- **Scale down:** Reduce desired count. Min 2 tasks for HA.

## Failover

- WDW and DLR are independent deployments
- Legacy (wdpr-apps) cluster being decommissioned — use revmgmt clusters

## Rollback

- Harness pipeline rollback to previous version
- Or manually update ECS task definition to previous revision

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| VenueNext | help@venuenext.com | Menu source data issues |
| DTOC | DX Monitoring Teams channel | P1/P2 escalation |
