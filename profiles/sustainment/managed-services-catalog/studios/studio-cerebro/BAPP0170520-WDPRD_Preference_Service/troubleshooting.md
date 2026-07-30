# Troubleshooting — WDPRD Preference Service

## Common Issues

### Issue: DynamoDB throttling

**Symptoms:** Increased latency or 500 errors. CloudWatch shows throttled read/write capacity.

**Root Cause:** DynamoDB provisioned capacity exceeded during peak traffic.

**Resolution:** Check DynamoDB table metrics in CloudWatch. If on-demand, investigate hot partitions. If provisioned, increase capacity or switch to on-demand.

---

### Issue: Preference data not persisting

**Symptoms:** Guest preferences reset or not saved after update.

**Root Cause:** Write failures to DynamoDB or cross-region replication lag.

**Resolution:** Check DynamoDB write metrics. Verify Global Table replication status. Check service logs for write errors.

---

### Issue: Health check failures

**Symptoms:** ALB health checks failing, tasks being replaced.

**Root Cause:** Service unable to connect to DynamoDB or internal dependency failure.

**Resolution:** Check ECS task logs. Verify DynamoDB connectivity. Check Vault secrets are accessible.

---

### Issue: Redis cache miss spike

**Symptoms:** Increased latency, DynamoDB read spikes, ElastiCache CacheHitRate dropping.

**Root Cause:** Redis evictions due to memory pressure, or cache invalidation after deployment.

**Resolution:**
1. Check CloudWatch ElastiCache metrics: CacheHitRate, Evictions, FreeableMemory
2. If after deployment — expected behavior, cache will warm up
3. If persistent — check if Redis node needs scaling

---

## Escalation Decision Tree

- If DynamoDB throttling → check capacity, escalate to AWS support if needed
- If cross-region replication issues → escalate to Andrew Southwick (andrew.southwick@disney.com)
- If service completely down → P1, escalate to Andrew Southwick immediately
- If Redis/cache issues → check CloudWatch, escalate to Cesar Muñoz (Cesar.A.Munoz.Acevedo.-ND@disney.com)
- If data integrity issues → escalate to Glenn Raposo (glenn.raposo@disney.com)

## Known Quirks

- Preferences are SWID-based — no PII or PCI data stored
- Service is SOR for legacy DynamoDB tables from ProfileService (BAPP0054836)
- Internal accessibility only — not directly accessible from public internet
- Redis cache (ElastiCache) used for performance — cache miss doesn't cause failure, just latency
- Also logs to `wdpr_profile_ui` index (FluentBit log router) in addition to `wdpr-gam`

## Splunk Dashboards

- **Splunk PROD:** https://splunk.wdprapps.disney.com (index: `wdpr-gam`)

## Investigation Queries

### ⚠️ FIRST: Check Banned Guest (Axis)
Before any investigation — search SWID in [Axis](https://axis.disney.network). If "Experience Access Restriction" → resolve as Working as Designed (NEVER inform guest).

### Errors (level >= 40)
```spl
index=wdpr-gam "ids.app"="*preference-service*" level>=40 earliest=-1h
```

### Error Rate by Endpoint
```spl
index=wdpr-gam "ids.app"="*preference-service*" environment=prod earliest=-1h | stats count by msg.code, msg.path | sort -count
```

### 5XX Errors
```spl
index=wdpr-gam "ids.app"="*preference-service*" environment=prod msg.code>=500 earliest=-1h | stats count by msg.code, msg.path | sort -count
```

### Latency by Endpoint
```spl
index=wdpr-gam "ids.app"="*preference-service*" environment=prod earliest=-1h | stats avg(response_time) as avg_rt, p95(response_time) as p95_rt by endpoint
```

### Volume Timechart (24h)
```spl
index=wdpr-gam "ids.app"="*preference-service*" environment=prod earliest=-24h | timechart span=1h count
```

### FluentBit Logs (alternative index)
```spl
index=wdpr_profile_ui source="*preference-svc*" earliest=-1h | stats count by source | sort -count
```

### Current Hour vs Previous Hour (Anomaly Detection)
```spl
index=wdpr-gam "ids.app"="*preference-service*" environment=prod level>=40 earliest=-1h | stats count as current_errors | appendcols [search index=wdpr-gam "ids.app"="*preference-service*" environment=prod level>=40 earliest=-2h latest=-1h | stats count as previous_hour_errors]
```

## Reassignment Groups (Routing)

| Pattern | Assignment Group |
|---------|-----------------|
| OneID / Login / OTP | Jira IDY-* (NOT ServiceNow) |
| Akamai / Edge / DNS / 502s | ops-global-parks-se-guestexp |
| Disney CAST L4 escalation | app-global-cerebro |
| AWS Infrastructure | ops-global-parks-se-guestexp |
