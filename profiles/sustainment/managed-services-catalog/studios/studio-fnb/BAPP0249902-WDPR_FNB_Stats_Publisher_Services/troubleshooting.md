# Troubleshooting — WDPR FNB Stats Publisher Services

## Common Issues

### Issue: Stats not publishing

**Symptoms:** Reporting dashboards showing gaps

**Root Cause:** Service down or source data unavailable

**Resolution:**
1. Restart ECS service
2. Check CloudWatch logs for errors
3. Verify upstream FNB services are healthy

---

## Escalation Decision Tree

- If service down → restart ECS
- Non-critical: no guest impact

## Known Quirks

- Internal service — lower priority during incidents
