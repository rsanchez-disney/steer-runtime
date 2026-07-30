# Troubleshooting — WDW Mobile Application (Family and Friends)

## Common Issues

### Issue: Deactivated profiles remain in FnF list

**Symptoms:** Guest sees deactivated/deleted profiles still appearing in their Family and Friends list.

**Root Cause:** Known issue — deactivated profiles not properly cleaned from FnF associations.

**Resolution:** Escalate to SF (Salesforce team). Reference: PRB0048497 (Open)

---

### Issue: Fumble error on guest removal

**Symptoms:** Error when attempting to remove a guest from the Family and Friends list.

**Root Cause:** Known issue in the removal flow.

**Resolution:** Known issue — retry or escalate if persistent.

---

### Issue: FnF list not loading

**Symptoms:** Family and Friends list returns empty or fails to load.

**Root Cause:** Backend service issue (Profile B2C or VAS not responding).

**Resolution:**
1. Check backend service health in Splunk (see queries below)
2. Verify ECS tasks are healthy in CloudWatch
3. If persistent → escalate to Cesar Muñoz (L2)

---

### Issue: Invite sending fails

**Symptoms:** Guest cannot send connection invites to other guests.

**Root Cause:** Backend API failure or OneID authentication issue.

**Resolution:**
1. Check OneID service health
2. Verify Profile B2C service is responding
3. If OneID issue → create IDY-* Jira ticket

---

## Escalation Decision Tree

- If FnF list not loading → check Profile B2C / VAS backend health → escalate to Cesar Muñoz (L2)
- If invite sending fails → check backend connectivity and OneID auth
- If deactivated profiles in list → escalate to SF (PRB0048497)
- If widespread mobile issues → escalate to Mark Lewis (Disney POC)
- If Android-specific issue → Irving Franco, Alan Solis
- If 504 errors on backend → check ECS health → escalate to Cesar Muñoz (L2)

## Known Quirks

- Deactivated profiles remain in FnF list (PRB0048497 — Open)
- Fumble error on guest removal is a known issue with no current fix
- Uses New Relic for mobile crash monitoring (not Splunk)
- Backend services log to Splunk index `wdpr_profile_ui`
- Android uses expand-service for avatars in FnF list
- Uses CHILD_ASSOCIATION type for linking code even for adults

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

### Mobile HTTP Errors — FnF (New Relic)
```sql
SELECT * FROM MobileRequestError WHERE appName = 'My Disney Experience' AND (requestUrl LIKE '%fnf%' OR requestUrl LIKE '%friends%' OR requestUrl LIKE '%assembly%') AND statusCode >= 400 SINCE 1 hour ago FACET statusCode, requestUrl
```

### Backend Errors — WDW Services (Profile B2C, VAS)
```spl
index=wdpr_profile_ui source="us-east-1:wdw-*" ("error" OR "warn" OR "504" OR "failed") earliest=-1h | stats count by source | sort -count
```

### 504 Gateway Timeouts — WDW
```spl
index=wdpr_profile_ui source="us-east-1:wdw-*" "504 Gateway Time-out" earliest=-1h | stats count by source | sort -count
```

### Profile B2C Service Errors (Primary FnF Backend)
```spl
index=wdpr_profile_ui source="us-east-1:wdw-gam-B0245892-*" ("error" OR "warn" OR "failed") earliest=-1h | stats count by source | sort -count
```

### Profile VAS Errors (Avatar Assembly)
```spl
index=wdpr_profile_ui source="us-east-1:wdw-gam-S0242566-*" ("error" OR "warn" OR "failed") earliest=-1h | stats count by source | sort -count
```

### Volume Timechart — All WDW Profile Services (24h)
```spl
index=wdpr_profile_ui source="us-east-1:wdw-*" earliest=-24h | timechart span=1h count
```

### Current Hour vs Previous Hour (Anomaly Detection)
```spl
index=wdpr_profile_ui source="us-east-1:wdw-*" ("error" OR "warn" OR "504" OR "failed") earliest=-1h | stats count as current_errors | appendcols [search index=wdpr_profile_ui source="us-east-1:wdw-*" ("error" OR "warn" OR "504" OR "failed") earliest=-2h latest=-1h | stats count as previous_hour_errors]
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
