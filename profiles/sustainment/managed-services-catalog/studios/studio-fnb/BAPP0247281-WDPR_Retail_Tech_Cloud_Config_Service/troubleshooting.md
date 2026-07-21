# Troubleshooting — WDPR Retail Tech Cloud Config Service

## Common Issues

### Issue: Services failing to fetch config

**Symptoms:** Consumer services logging config fetch errors

**Root Cause:** Config server ECS task unhealthy

**Resolution:**
1. Restart config server ECS service
2. Consumer services will retry and reconnect
3. Cached configs continue working during outage

---

## Escalation Decision Tree

- If config server → restart ECS
- If bad config deployed → revert git repository changes

## Known Quirks

- Consumer services cache configs — brief outages are tolerable
