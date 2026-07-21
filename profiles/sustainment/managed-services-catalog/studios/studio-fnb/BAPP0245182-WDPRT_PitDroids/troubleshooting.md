# Troubleshooting — WDPRT PitDroids

## Common Issues

### Issue: Dashboard showing stale data

**Symptoms:** Location statuses not updating, old wait times

**Root Cause:** Backend service unable to reach MOO/ROO/DiSCO APIs

**Resolution:**
1. Verify upstream services (MOO, ROO, DiSCO) are healthy
2. Restart PitDroids service if upstream is healthy
3. Check network connectivity between ECS tasks

---

## Escalation Decision Tree

- If upstream service down → escalate to prd-global-fnb for that service
- If PitDroids itself → restart ECS service

## Known Quirks

- Internal tool — lower priority than guest-facing services
- Flutter app may need cache clear on device for stale UI
