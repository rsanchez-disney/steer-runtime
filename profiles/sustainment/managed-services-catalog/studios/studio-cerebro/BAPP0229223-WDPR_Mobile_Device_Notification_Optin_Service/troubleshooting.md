# Troubleshooting — WDPR Mobile Device Notification Optin Service (MNO)

## Common Issues

### Issue: Healthcheck failing

**Symptoms:** Healthcheck endpoint returns non-200 status. Alerts fire from monitoring.

**Root Cause:** Service may be unhealthy due to dependency failure (DynamoDB, Vault, RabbitMQ) or deployment issue.

**Resolution:**
1. Check ECS task status in AWS Console
2. Check Splunk: `index=wdpr-gam "ids.app"="*mobile-notification*" environment=prod level>=40`
3. Verify DynamoDB connectivity
4. Check RabbitMQ queue health (SHURI queue: gam-exp-rmq-vhl)
5. If task is crashing, check CloudWatch logs for startup errors
6. Redeploy via Harness or restart via Rundeck

---

### Issue: Push notifications not being received by guests

**Symptoms:** Guests report not receiving push notifications after opting in.

**Root Cause:** MNO only records opt-ins — actual push delivery is handled by mobile app services. Verify opt-in was recorded, then escalate to mobile team.

**Resolution:**
1. Verify opt-in record exists in MNO service
2. If opt-in exists: issue is with push delivery service, not MNO → escalate to Mark Lewis (mark.s.lewis@disney.com)
3. If opt-in missing: check MNO logs for errors during opt-in request
4. Check RabbitMQ queue for backed-up messages
5. Check device notification settings

---

### Issue: RabbitMQ queue backup

**Symptoms:** MNO opt-in events not being processed. Queue depth increasing.

**Root Cause:** Consumer not keeping up, or consumer crashed.

**Resolution:**
1. Check RabbitMQ console: queue depth, consumer count for gam-exp-rmq-vhl
2. If no consumers → restart MNO service
3. If consumers active but queue growing → check for errors in MNO logs
4. Escalate to Andrew Southwick (andrew.southwick@disney.com)

---

## Escalation Decision Tree

- If healthcheck failing in both regions → P2, escalate to Andrew Southwick (andrew.southwick@disney.com)
- If DynamoDB issues → check AWS Health Dashboard, escalate to AWS support if needed
- If RabbitMQ queue backup → check consumer health, escalate to Cesar Muñoz (Cesar.A.Munoz.Acevedo.-ND@disney.com)
- If push notifications not working but opt-ins recorded → escalate to mobile app team: Mark Lewis (mark.s.lewis@disney.com)
- If Vault/secrets issues → escalate to DevOps team

## Known Quirks

- Service does NOT perform actual push notifications — only records opt-ins
- Vault paths differ between environments and regions
- Lower environment Splunk queries require adding environment="latest|stage|load" filter
- Also logs to `wdpr_profile_ui` index via FluentBit log router (source: `*mobile-notification*`)
- RabbitMQ SHURI queue: gam-exp-rmq-vhl — if queue backs up, opt-in events are delayed

## ⚠️ FIRST: Check Banned Guest (Axis)
Before any investigation — search SWID in [Axis](https://axis.disney.network). If "Experience Access Restriction" → resolve as Working as Designed (NEVER inform guest).

## Splunk Dashboards

- **Splunk PROD:** https://splunk.wdprapps.disney.com (index: `wdpr-gam`)

## Investigation Queries

### Errors (level >= 40)
```spl
index=wdpr-gam "ids.app"="*mobile-notification*" environment=prod level>=40 earliest=-1h
```

### Error Rate by Endpoint
```spl
index=wdpr-gam "ids.app"="*mobile-notification*" environment=prod earliest=-1h | stats count by msg.code, msg.path | sort -count
```

### 5XX Errors
```spl
index=wdpr-gam "ids.app"="*mobile-notification*" environment=prod msg.code>=500 earliest=-1h | stats count by msg.code, msg.path | sort -count
```

### Volume Timechart (24h)
```spl
index=wdpr-gam "ids.app"="*mobile-notification*" environment=prod earliest=-24h | timechart span=1h count
```

### FluentBit Logs (alternative index)
```spl
index=wdpr_profile_ui source="*mobile-notification*" earliest=-1h | stats count by source | sort -count
```

### Current Hour vs Previous Hour (Anomaly Detection)
```spl
index=wdpr-gam "ids.app"="*mobile-notification*" environment=prod level>=40 earliest=-1h | stats count as current_errors | appendcols [search index=wdpr-gam "ids.app"="*mobile-notification*" environment=prod level>=40 earliest=-2h latest=-1h | stats count as previous_hour_errors]
```

## Reassignment Groups (Routing)

| Pattern | Assignment Group |
|---------|-----------------|
| OneID / Login / OTP | Jira IDY-* (NOT ServiceNow) |
| Akamai / Edge / DNS / 502s | ops-global-parks-se-guestexp |
| Disney CAST L4 escalation | app-global-cerebro |
| AWS Infrastructure | ops-global-parks-se-guestexp |
