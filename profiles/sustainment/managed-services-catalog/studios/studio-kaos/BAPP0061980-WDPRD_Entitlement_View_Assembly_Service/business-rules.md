# Business Rules — EVAS

## Overview

Entitlement View Assembly Service. Assembles ticket/pass views for guest-facing display from TMS data.

## Key Rules

- Assembles entitlement data from TMS for display in guest apps
- If EVAS does NOT return VIDs but TMS is healthy → EVAS assembly issue
- Serves both DLR (us-west-2) and WDW (us-east-1)
- Downstream of TMS — if TMS has no data, EVAS won't either


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
5. If all show ACTIVE → transient app display/caching issue. TMS refresh should resolve.

#### Key Scenarios

- **Magic Key Not Linked After Purchase:** `primaryGuest` empty in TMS. Guest must manually link. NOT a system bug. Ref: INC28819976
- **TMS-to-Keyring Sync Delays:** If no longer reproducible → close as WAD. If still active → TMS-to-Keyring republish. Ref: INC28786197
