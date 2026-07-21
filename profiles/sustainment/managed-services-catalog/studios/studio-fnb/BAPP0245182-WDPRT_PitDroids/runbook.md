# Runbook — WDPRT PitDroids

## Restart Procedures

1. AWS Console → ECS → Cluster: wdpr-cast-S0001416-use1-{env}
2. Service: pitdroids-svc-{env}-live
3. "Update service" → "Force new deployment" → Update

**Validation:**
- Health check: `https://pitdroids.wdprapps.disney.com` (WDW prod)
- Health check: `https://pitdroids-dlr.wdprapps.disney.com` (DLR prod)
- Monitor Splunk index=wdpr_pitdroids_service

---

## Scaling

- **Scale up:** Increase ECS desired count. Low-traffic internal tool.
- **Scale down:** Can run single task outside peak hours.

## Failover

- No cross-region failover — internal tool

## Rollback

- Rundeck: deploy previous task definition revision

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| MOO/ROO/DiSCO | prd-global-fnb | Backend data unavailable |
