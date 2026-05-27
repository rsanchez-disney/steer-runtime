# Troubleshooting — WDPR Mobile Device Notification Optin Service

## Common Issues

### Issue: Healthcheck failing

**Symptoms:** Healthcheck endpoint returns non-200 status. Alerts fire from monitoring.

**Root Cause:** Service may be unhealthy due to dependency failure (DynamoDB, Vault) or deployment issue.

**Resolution:**
1. Check ECS task status in AWS Console
2. Check Splunk: `index=wdpr-gam "ids.app"="*mobile-notification*" environment=prod level>=40`
3. Verify DynamoDB connectivity
4. If task is crashing, check CloudWatch logs for startup errors
5. Redeploy via Harness or restart via Rundeck

---

### Issue: Push notifications not being received by guests

**Symptoms:** Guests report not receiving push notifications after opting in.

**Root Cause:** MNO only records opt-ins — actual push delivery is handled by mobile app services. Verify opt-in was recorded, then escalate to mobile team.

**Resolution:**
1. Verify opt-in record exists in MNO service
2. If opt-in exists: issue is with push delivery service, not MNO
3. If opt-in missing: check MNO logs for errors during opt-in request
4. Check device notification settings

---

## Escalation Decision Tree

- If healthcheck failing in both regions → P2, escalate to Andrew Southwick
- If DynamoDB issues → check AWS Health Dashboard, escalate to AWS support if needed
- If push notifications not working but opt-ins recorded → escalate to mobile app team (Mark Lewis)
- If Vault/secrets issues → escalate to DevOps team

## Known Quirks

- Service does NOT perform actual push notifications — only records opt-ins
- Vault paths differ between environments and regions (see wiki for full mapping)
- Lower environment Splunk queries require adding environment="latest|stage|load" filter
