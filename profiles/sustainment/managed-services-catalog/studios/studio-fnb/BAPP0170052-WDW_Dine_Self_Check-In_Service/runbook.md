# Runbook — WDW Dine Self Check-In Service

## Restart Procedures

1. AWS Console → ECS → Cluster: wdpr-revmgmt-S0001422-use1-prd
2. Service: dinescisvc-svc-prod-live
3. "Update service" → "Force new deployment" → Update

**Validation:**
- Health check: `https://dine-sci-svc.wdprapps.disney.com/svc/healthcheck`
- Monitor Splunk index=wdpr_disco for errors
- Verify Grafana "General Stats - WDW - DiSCO"

---

## Scaling

- **Scale up:** Increase ECS desired count.
- **Scale down:** Reduce count. Min 2 tasks.

## Failover

- DynamoDB handles failover automatically
- Redis (Elasticache) has auto-failover within AZ

## Rollback

- Harness pipeline rollback
- Or Rundeck: select previous task definition

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| DREAMS | Dining reservations team | Reservation validation failures |
| Automic | Automic admin team | JOBS.WDPR_DINING.NOTIFY_WDW not running |
| AJO/Shuri | Notification team | Push notifications not delivered |
| DTOC | DX Monitoring Teams channel | P1/P2 bridge |
