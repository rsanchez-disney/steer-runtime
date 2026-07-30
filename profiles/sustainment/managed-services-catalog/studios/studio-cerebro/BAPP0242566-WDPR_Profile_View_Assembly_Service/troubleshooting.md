# Troubleshooting — WDPR Profile View Assembly Service

## Common Issues

### Issue: Duplicate Key Exception (P2)

**Symptoms:** 500 errors propagating to Profile SPA, MB+C SPA, FnF SPA. Splunk query: `index=wdpr-gam "ids.app"="*profile-view-assembly-service" "Duplicate key"`

**Root Cause:** Collectors.toMap() lacks merge function — throws exception when 2 avatars share the same ID. Cache does NOT protect against this.

**Resolution:** Code fix required. No workaround available. Escalate to development team.

---

### Issue: MAGIC_BAND_DCL_RESERVATION_PROCESS_WARNING

**Symptoms:** DCL reservation data missing from profile view response.

**Root Cause:** DCL Reservation sync issue. Order suppressed from response.

**Resolution:** Check DCL Reservation Service health. If DCL service is healthy, investigate data integrity.

---

### Issue: MAGIC_BAND_WDW_RESERVATION_PROCESS_ERROR

**Symptoms:** Reservation data incomplete. externalReferenceList.size() issue.

**Root Cause:** Reservation data from XBMS has incomplete external reference list.

**Resolution:** Check XBMS service health. Verify reservation data integrity.

---

### Issue: MAGIC_BANDS_RESOURCE_ORDERS_PROCESSING_WARNING_PRIMARY_XID_NOT_DETECTED

**Symptoms:** Order missing from profile view.

**Root Cause:** Order missing primary guest xid in XBMS data.

**Resolution:** Data issue in XBMS. Escalate to XBMS team.

---

### Issue: MAGIC_BANDS_MANAGER_MANAGED_XBANDS_PROCESSING_WARNING

**Symptoms:** Managed xbands not appearing in profile view.

**Root Cause:** Managed xbands not detected in response data.

**Resolution:** Check XBMS managed bands endpoint. Verify guest has managed bands.

---

### Issue: requestUrlMapWithout200ResponseCount > 0

**Symptoms:** Partial profile data returned. Some sections empty.

**Root Cause:** One or more downstream service calls returned non-200 status.

**Resolution:** Check requestUrlMap field in logs to identify which downstream service failed. Investigate that specific service.

---

## Escalation Decision Tree

- If Duplicate Key Exception → escalate to development team (code fix required)
- If downstream service failures (requestUrlMapWithout200ResponseCount > 0) → identify failing service from requestUrlMap and escalate to that team
- If DCL reservation warnings → escalate to DCL Reservation Service team
- If XBMS order warnings → escalate to XBMS team
- If cascading 500s across all SPAs → escalate to Andrew Southwick / Zachary Boone immediately

## Known Quirks

- Duplicate Key Exception (P2) — known bug, no workaround, code fix pending
- Cache does NOT protect against the Duplicate Key issue
- DCL Reservation data only fetched for DCL page requests (isWdwBrandRequest=false)
- Orders in the past are intentionally suppressed (ordersSuppressedInThePast field)
- FnF data integrity failures are logged but may not block the response
- Also logs to `wdpr_profile_ui` index via FluentBit (source: `*profile-vas*`)

## ⚠️ FIRST: Check Banned Guest (Axis)
Before any investigation — search SWID in [Axis](https://axis.disney.network). If "Experience Access Restriction" → resolve as Working as Designed (NEVER inform guest).

## Splunk Dashboards

- **Splunk PROD:** https://splunk.wdprapps.disney.com (index: `wdpr-gam`)

## Investigation Queries

### Duplicate Key Exception
```spl
index=wdpr-gam "ids.app"="*profile-view-assembly-service" "Duplicate key" earliest=-1h | table _time, log.exception
```

### Errors (level >= 40)
```spl
index=wdpr-gam "ids.app"="*profile-view-assembly-service" level>=40 earliest=-1h
```

### 5XX Errors
```spl
index=wdpr-gam "ids.app"="*profile-view-assembly-service" msg.code>=500 earliest=-1h | stats count by msg.code, msg.path | sort -count
```

### Downstream Service Failures
```spl
index=wdpr-gam "ids.app"="*profile-view-assembly-service" "requestUrlMapWithout200ResponseCount" earliest=-1h | stats count by requestUrlMap
```

### Volume Timechart (24h)
```spl
index=wdpr-gam "ids.app"="*profile-view-assembly-service" earliest=-24h | timechart span=1h count
```

### FluentBit Logs (alternative index)
```spl
index=wdpr_profile_ui source="*profile-vas*" earliest=-1h | stats count by source | sort -count
```

### Current Hour vs Previous Hour
```spl
index=wdpr-gam "ids.app"="*profile-view-assembly-service" level>=40 earliest=-1h | stats count as current_errors | appendcols [search index=wdpr-gam "ids.app"="*profile-view-assembly-service" level>=40 earliest=-2h latest=-1h | stats count as previous_hour_errors]
```

## Reassignment Groups (Routing)

| Pattern | Assignment Group |
|---------|-----------------|
| OneID / Login / OTP | Jira IDY-* (NOT ServiceNow) |
| Akamai / Edge / DNS / 502s | ops-global-parks-se-guestexp |
| Disney CAST L4 escalation | app-global-cerebro |
| MB+C physical shipment | Merchandise / Fulfillment |
| MB+C DCL orders not in XBMS | app-global-magicband |
| AWS Infrastructure | ops-global-parks-se-guestexp |
