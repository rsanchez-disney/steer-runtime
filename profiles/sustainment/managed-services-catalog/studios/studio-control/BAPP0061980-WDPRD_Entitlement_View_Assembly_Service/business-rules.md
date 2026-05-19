# Business Rules — EVAS WDW

## Overview

Assembles ticket and pass entitlement views for guest-facing display at WDW.

## Key Rules

- Consumes data from TMS-WDW to build guest-visible entitlement views
- If EVAS returns no VIDs but TMS is healthy → problem is in EVAS assembly logic
- Used by My Disney Experience and other guest-facing apps
- Does not modify entitlement data — read-only assembly layer


---

## Related Flows

### Flow: Ticket Linking / Claiming

> Guest links tickets to their account so they become visible in the app and reservation flow.

#### Path

```
Guest App (Link Tickets & Passes) → TMS → Keyring → GAM/eGalaxy
```

#### EVAS Role in Ticket Linking

- EVAS assembles entitlement views from TMS data for guest-facing display
- If EVAS does NOT return VIDs but TMS is healthy → EVAS assembly issue, needs escalation
- If TMS returns ZERO → problem is upstream, not EVAS

#### Investigation: Tickets Not Visible in App

1. Extract VID(s) and SWID
2. Search TMS by VID — validate 4 visibility conditions (Status ACTIVE, end date future, remaining usages > 0, linked to guest)
3. Search EVAS by SWID — verify VID present with ACTIVE status
4. If TMS healthy but EVAS missing VIDs → EVAS problem
5. If all show ACTIVE → transient app display/caching issue

#### WDW-specific: Check for upstream ERROR masking 404

If TMS WDW returns 404 but actual root cause is an ERROR-level exception (e.g. GAM duplicate key), EVAS will also show no data. Route to `app-global-gam`. Ref: INC28937912
