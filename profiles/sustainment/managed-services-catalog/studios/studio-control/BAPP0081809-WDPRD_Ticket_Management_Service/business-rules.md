# Business Rules — TMS WDW

## Overview

Internal and external ticket management for WDW. Source of record: GAM.

## Key Diagnostic: 404 Masking Upstream ERROR

TMS WDW may return 404 "No eligible tickets found" but the actual root cause is an ERROR-level exception thrown BEFORE the 404 response.

1. Search TMS by SWID → extract conversation IDs
2. Search by those conversation IDs with ERROR filter
3. If `SORServiceImpl` "Duplicate key" error → GAM returned same friend XID twice

Route to: `app-global-gam` (CI: WDW GAM Affiliations/Admissions/F&F)

Ref: INC28937912

## Splunk Indexes

| Index | Cluster | Task Definition |
|-------|---------|-----------------|
| wdpr-ecommerce | wdw-ecommerce-S0001479-usw2* | tmsint-svc* OR *tms* |

## Dependencies

| Direction | Service | Relationship |
|-----------|---------|-------------|
| Data source | gam-wdw | Source of record for WDW ticket data |
| Downstream | evas-wdw | EVAS assembles ticket views |
| Downstream | cme-eligibility | CME reads entitlements |

## Related Flows

### Flow: Ticket Linking / Claiming

> Guest links tickets to their account so they become visible in the app and reservation flow.

#### Path

```
Guest App (Link Tickets & Passes) → TMS → Keyring → GAM/eGalaxy
```

#### Services Involved

| Step | Service | Role |
|------|---------|------|
| 1 | tms-dlr / tms-wdw | Ticket data + linking state |
| 2 | evas-dlr / evas-wdw | Entitlement view assembly |
| 3 | egalaxy-dlr / gam-wdw | Source of record |
| 4 | gss | Cast ticket lookup and force refresh |

#### Investigation: Tickets Not Visible in App

1. Extract VID(s) and SWID
2. Search TMS by VID — validate 4 visibility conditions (Status ACTIVE, end date future, remaining usages > 0, linked to guest)
3. Search EVAS by SWID — verify VID present with ACTIVE status
4. If all show ACTIVE → transient app display/caching issue

#### WDW-specific: Check for upstream ERROR masking 404

1. Search TMS by SWID → extract conversation IDs
2. Search those convos for ERROR-level entries
3. If ERRORs appear before the 404 → the 404 may be masking an upstream failure (e.g. GAM duplicate key)
4. Route accordingly based on actual error. Ref: INC28937912

---

### Flow: Ticket Upgrade WDW (AP Upgrade)

> Guest upgrades a WDW ticket to Annual Pass. Old ticket voided, reservations cancelled.

#### Path

```
Mobile App / Booking Service → DTI → GAM/SnApp (void old, activate new) → CME (cancel old reservations)
```

#### TMS Role in WDW Upgrade

- After upgrade: old ticket voided in GAM, new ticket activated
- TMS reflects updated ticket data from GAM
- CME automatically cancels reservations on old VID (SNAPP_VOIDED)

#### Key Rules

- WDW upgrades VOID the old ticket and CANCEL its reservations. Expected behavior.
- Guest must create new reservations on new VID after upgrade.
- DTI determines eligibility — if DTI says ELIGIBLE, backend processes it.

#### Key Scenarios

- **Wrong Ticket Selected (Mobile):** App upgrades whatever DTI returns as ELIGIBLE. Route to `app-flwdw-dticrt` with PayloadIDs. Ref: INC28947022
