# Troubleshooting — WDW Mobile Application (Profile)

## Common Issues

### Issue: Login loop in app

**Symptoms:** User stuck in infinite login redirect within the WDW mobile app. HIGH frequency.

**Root Cause:** OneID session/token issue or corrupted local app data.

**Resolution:**
- iOS: Settings > General > iPhone Storage > [My Disney Experience] > Offload App. Or: Delete + Reinstall.
- Android: Clear app data or Uninstall + Reinstall.

---

### Issue: Network failures (parks WiFi)

**Symptoms:** Multiple NetworkFailure errors in New Relic. VERY HIGH frequency.

**Root Cause:** Guest is on unstable network (usually parks WiFi). NOT a code issue.

**Resolution:**
1. Check New Relic — if result shows ERROR TYPE of several NetworkFailure → guest is on unstable network
2. Solution: connect to stable network and retry
3. No code fix needed — this is an infrastructure/environment issue

---

### Issue: OneID callback timeout

**Symptoms:** Authentication callback from OneID times out. MEDIUM frequency.

**Root Cause:** OneID service latency or network issues between mobile app and OneID.

**Resolution:**
1. Verify OneID service health
2. Create IDY-* Jira ticket for OneID team investigation

---

### Issue: Push notifications not working

**Symptoms:** Guest not receiving push notifications after enabling them. LOW frequency.

**Root Cause:** MNO service issue or device notification settings misconfigured.

**Resolution:**
1. Check MNO service health (BAPP0229223)
2. Verify device notification settings are enabled
3. Check if opt-in was recorded in MNO service

---

### Issue: 504 Gateway Time-out

**Symptoms:** FluentBit log router reports `http_status=504` or `504 Gateway Time-out` in Splunk logs.

**Root Cause:** Backend service (profile-b2c, profile-b2b, profile-vas, preference-svc, mobile-notification-svc) not responding in time.

**Resolution:**
1. Check which service is affected using the source field in Splunk
2. Verify ECS task health in CloudWatch for the affected service
3. WDW primary region is US-EAST-1

---

## Escalation Decision Tree

- If login loop affecting multiple guests → check OneID service health → escalate to IDY Jira
- If login loop isolated to single guest → clear app data / reinstall
- If NetworkFailure errors → confirm parks WiFi issue → no escalation needed
- If OneID callback timeout → create IDY-* Jira ticket
- If push notifications not working → check MNO service → escalate to Andrew Southwick
- If iOS-specific issue → escalate to Cristopher Escorcia / Abhishek Rajankar
- If Android-specific issue → escalate to Irving Franco / Alan Solis
- If feature/ownership decision needed → escalate to Mark Lewis
- If 504 errors on backend services → check ECS health → escalate to Cesar Muñoz (L2)

## Known Quirks

- NetworkFailure errors are VERY common and almost always caused by parks WiFi — not a code issue
- BAPP ID is shared between iOS and Android platforms
- Mobile releases require App Store / Google Play review process (cannot hotfix instantly)
- New Relic is the primary monitoring tool for mobile (not Splunk)
- WDW primary region is US-EAST-1
- Android uses expand-service for avatars; iOS uses VAS directly
- Android not making OneID profile calls on session refresh
- Android 403 on origin stage URL for managed guest avatar (no auth token)
- iOS Reset Pin screen is in ObjC (older design), pending Swift upgrade

## Splunk Dashboards

- **Splunk PROD:** https://splunk.wdprapps.disney.com (index: `wdpr_profile_ui`)
- **Splunk Lower (Latest, Stage, Load):** https://stage.splunk.wdprapps.disney.com

## Investigation Queries

### ⚠️ FIRST: Check Banned Guest (Axis)
Before any investigation — search SWID in [Axis](https://axis.disney.network). If "Experience Access Restriction" → resolve as Working as Designed (NEVER inform guest).

### Mobile Crashes (New Relic)
```sql
SELECT * FROM MobileCrash WHERE uuid='{UUID}' SINCE 7 days ago
```

### Mobile HTTP Errors (New Relic)
```sql
SELECT * FROM MobileRequestError WHERE appName = 'My Disney Experience' AND requestUrl LIKE '%profile%' AND statusCode >= 400 SINCE 1 hour ago FACET statusCode, requestUrl
```

### Backend Errors — B2C Service (Primary Profile API)
```spl
index=wdpr_profile_ui source="us-east-1:wdw-gam-B0245892-*" ("error" OR "warn" OR "failed") earliest=-1h | stats count by source | sort -count
```

### Backend Errors — All WDW Services
```spl
index=wdpr_profile_ui source="us-east-1:wdw-*" ("error" OR "warn" OR "504" OR "500" OR "failed") earliest=-1h | stats count by source | sort -count
```

### 504 Gateway Timeouts
```spl
index=wdpr_profile_ui source="us-east-1:wdw-*" "504 Gateway Time-out" earliest=-1h | stats count by source | sort -count
```

### FluentBit Flush Failures
```spl
index=wdpr_profile_ui source="us-east-1:wdw-*" "failed to flush" earliest=-1h | stats count by source | sort -count
```

### Volume Timechart (24h)
```spl
index=wdpr_profile_ui source="us-east-1:wdw-*" earliest=-24h | timechart span=1h count
```

### Errors by Service (Parsed Source)
```spl
index=wdpr_profile_ui source="us-east-1:wdw-*" ("error" OR "warn" OR "504" OR "failed") earliest=-1h | rex field=source "(?<region>[^:]+):(?<service_source>[^/]+)" | stats count by service_source | sort -count
```

### Current Hour vs Previous Hour (Anomaly Detection)
```spl
index=wdpr_profile_ui source="us-east-1:wdw-*" ("error" OR "warn" OR "504" OR "failed") earliest=-1h | stats count as current_errors | appendcols [search index=wdpr_profile_ui source="us-east-1:wdw-*" ("error" OR "warn" OR "504" OR "failed") earliest=-2h latest=-1h | stats count as previous_hour_errors]
```

### Mobile Notification Service Errors
```spl
index=wdpr_profile_ui source="us-east-1:wdw-gam2-B0229223-*" ("error" OR "warn" OR "failed") earliest=-1h | stats count by source | sort -count
```

### OneID Authentication Issues
```spl
index=oneid {SWID}
```

## Reassignment Groups (Routing)

| Pattern | Assignment Group |
|---------|-----------------|
| OneID / Login / OTP | Jira IDY-* (NOT ServiceNow) |
| Akamai / Edge / DNS / 502s | ops-global-parks-se-guestexp |
| Disney CAST L4 escalation | app-global-cerebro |
| Payment Methods issues | app-flwdw-payment |
| AWS Infrastructure | ops-global-parks-se-guestexp |
| FnF data integrity | GAM team |
