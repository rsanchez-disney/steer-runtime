# Runbook — DLR Dine Self Check-In Service

## Restart Procedures

1. AWS Console → ECS → Cluster: dlr-revmgmt-S0001535-usw2-prd
2. Service: dinescisvc-svc-prod-live
3. "Update service" → "Force new deployment" → Update

**Validation:**
- Health check: `https://dine-sci-svc-dlr.wdprapps.disney.com/svc/healthcheck`
- Monitor Splunk index=wdpr_disco_dlr for errors
- Verify Grafana "DLR Dine Self Check-in and Wait List (TSR)"

---

## Scaling

- **Scale up:** Increase ECS desired count.
- **Scale down:** Reduce count. Min 2 tasks.

## Failover

- Same as WDW DiSCO but in us-west-2

## Rollback

- Harness pipeline rollback

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| DREAMS | Dining reservations team | Reservation validation failures |
| Automic | Automic admin team | JOBS.WDPR_DINING.NOTIFY_DLR not running |
| AJO/Shuri | Notification team | Push notifications not delivered |
| DTOC | DX Monitoring Teams channel | P1/P2 bridge |
