# Troubleshooting — WDPR Child Authorization Service

## Common Issues

### Issue: PRIVO consent verification failures

**Symptoms:** Parents unable to authorize child accounts. Consent flow returns errors or times out.

**Root Cause:** PRIVO external service unavailable or responding with errors.

**Resolution:** Check PRIVO service status (external vendor). Verify network connectivity to PRIVO endpoints. Check Vault secrets for PRIVO API credentials. Escalate to PRIVO support if their service is down.

---

### Issue: Child profile data unavailable

**Symptoms:** Child account details/profile cannot be retrieved. 500 errors on child profile endpoints.

**Root Cause:** Service unable to connect to data store or internal dependency failure.

**Resolution:** Check ECS task health. Verify Vault secrets are accessible. Check service logs for connection errors.

---

### Issue: Health check failures

**Symptoms:** ALB health checks failing at /child-auth-svc/healthcheck.

**Root Cause:** Service startup failure, Vault secret rotation, or dependency connectivity issue.

**Resolution:** Check ECS task logs. Verify Vault paths are accessible (secret/gam2/child-auth/svc-ha/us-east-1/prod). Force new deployment if tasks are stuck.

---

### Issue: IndexOutOfBoundsException in childConsent()

**Symptoms:** HTTP 500 on `/child-auth-svc/authorization/{SWID}` endpoint. Logger: `ChildAuthorizationServiceImpl`.

**Root Cause:** `RegisteredAccountUpdate.accountStatus()` attempts `ArrayList.get(0)` on an empty registered accounts list for the given SWID.

**Resolution:** Verify the SWID has a registered account in DynamoDB (table: `wdpr-experience-B0054836-childauth-prd-keys`). If account data is missing, the guest may need to re-register. Low frequency (~7/day), all observed in us-east-1.

---

### Issue: OkHttp OAuth2 token refresh warnings

**Symptoms:** WARN level logs from `OkHttpOAuth2ClientAuthHelper`. Typically ~35 occurrences per 24h.

**Root Cause:** Normal OAuth token rotation with PRIVO API credentials.

**Resolution:** Monitor for spikes — a sudden increase could indicate PRIVO connectivity issues or credential expiry. Check Vault paths if sustained failures occur.

---

## Escalation Decision Tree

- If PRIVO external service down → contact PRIVO support (external vendor), notify Andrew Southwick
- If service completely down in both regions → escalate to Andrew Southwick / Martin Uribe immediately
- If COPPA compliance at risk → escalate to Glenn Raposo (Manager) — regulatory risk
- If child auth flow broken in SPA → escalate to Profile SPA team (Gino Caverzan)

## Known Quirks

- PRIVO is an external vendor dependency — outages are outside Disney's control
- Internal accessibility only — not directly accessible from public internet
- COPPA compliance is a regulatory requirement — outages carry legal risk
- Low traffic service compared to B2C/VAS but high business criticality due to compliance
- AppDynamics uses separate tiers: core-child-auth-svc-ha-east / core-child-auth-svc-ha-west

---

## Log Structure

- **Index:** `wdpr-gam`
- **Source:** `stdout`
- **Sourcetype:** `httpevent`
- **Format:** JSON with fields: `date`, `thread`, `ids` (app, corr, conv, region), `level`, `logger`, `msg`
- **App identifier:** `ids.app` contains `us-east-1-profile-child-auth-service` or `us-west-2-profile-child-auth-service`
- **Log levels observed:** PERF (majority — HttpTimeline + HttpBatchMetrics), INFO, WARN, ERROR, DEBUG
- **Regions:** us-east-1, us-west-2 (active-active)
- **Throughput:** ~960 events/hr per region (healthcheck-dominated)

## Splunk Dashboards

- **Profile UI KPI:** `profile_ui_kpis` (Splunk app: gam)
- **Profile Service KPI:** `profile_service_kpis`
- **GAM WebAPI:** [Splunk Dashboard](https://splunk.wdprapps.disney.com/en-US/app/gam/profile_gam_webapi)

## Investigation Queries

### Base Query
```spl
index=wdpr-gam "ids.app"="*child-auth-service"
```

### Error Investigation
```spl
index=wdpr-gam "ids.app"="*child-auth-service" level=ERROR
| spath ids.region
| table _time, ids.region, logger, msg
```

### Log Level Distribution
```spl
index=wdpr-gam "ids.app"="*child-auth-service"
| stats count by level, logger
| sort -count
```

### HTTP Status Code Distribution
```spl
index=wdpr-gam "ids.app"="*child-auth-service" logger=HttpTimeline
| spath msg.code
| stats count by msg.code
| sort -count
```

### Endpoint Performance (non-healthcheck)
```spl
index=wdpr-gam "ids.app"="*child-auth-service" logger=HttpTimeline
| spath msg.path | spath msg.code | spath msg.ms
| search msg.path!="/child-auth-svc/healthcheck"
| stats count avg(msg.ms) as avg_ms p95(msg.ms) as p95_ms by msg.path, msg.code
```

### Regional Throughput (hourly)
```spl
index=wdpr-gam "ids.app"="*child-auth-service"
| spath ids.region
| timechart span=1h count by ids.region
```

### 500 Errors with Correlation IDs
```spl
index=wdpr-gam "ids.app"="*child-auth-service" logger=HttpTimeline
| spath msg.code | search msg.code=500
| spath ids.corr | spath ids.region | spath msg.path
| table _time, ids.region, ids.corr, msg.path, msg.ms
```

### WARN Analysis (OAuth / PRIVO connectivity)
```spl
index=wdpr-gam "ids.app"="*child-auth-service" level=WARN
| stats count by logger
| sort -count
```

### Child Auth Authorization Stats (from wiki)
```spl
index=wdpr-gam source="*child-auth-svc-*" "*/authorization*"
| stats count by msg.path, msg.query, msg.code, msg.clientId
```

### Notification Endpoint Performance
```spl
index=wdpr-gam "ids.app"="*child-auth-service" logger=HttpTimeline
| spath msg.path | search msg.path="/child-auth-svc/notification"
| spath msg.ms | spath msg.code
| timechart span=5m avg(msg.ms) as avg_ms count by msg.code
```

### Current Hour vs Previous Hour (anomaly detection)
```spl
index=wdpr-gam "ids.app"="*child-auth-service" level=ERROR earliest=-2h
| spath ids.region
| bin _time span=1h
| stats count by _time, ids.region
```

## AWS Validation

### DynamoDB — Validate Child Consent Status
1. Go to `aws.wdprapps.disney.com` → prod environment (856092292319)
2. DynamoDB → Table: `wdpr-experience-B0054836-childauth-prd-keys`
3. Search by SWID (partition key)
4. Validate `consentStatus` = APPROVED

## Dependencies

- **PRIVO** (external) — child consent verification service
- **Profile WebAPI WAM** (upstream) — triggers child auth flow
- **Profile SPA** (upstream) — UI for parental consent
