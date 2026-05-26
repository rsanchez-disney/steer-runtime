# Business Rules — PEOS

## Overview

Payment + Entitlement Orchestration Service. Final orchestration step in the UC path — coordinates payment capture and ticket fulfillment.

## Key Rules

- Path: UC SPA → Order VAS → Order Service → PEOS → Payment Service + DTI Gateway
- Orchestrates payment capture (via Payment Service) and entitlement fulfillment (via DTI)
- Handles both DLR (us-west-2) and WDW (us-east-1) in separate components
- If PEOS fails after payment capture → potential orphaned payment (requires manual reconciliation)


---

## Related Flows

### Flow: UC Checkout (Unified Commerce)

> Consumer ticket purchase/mods, schedule activities, Genie+/LL (DLR), AP MK-to-MK upgrades, AP upgrades WDW, VO/Packages consumer, Room Only consumer, Cast Life.

#### Path

```
UC SPA/API → Order VAS → Order Service → PEOS → DTI → eGalaxy/GAM
```

#### Services Involved

| Step | Service | Action |
|------|---------|--------|
| 1 | uc-spa-dlr / uc-spa-wdw | Guest-facing UI — generates ConvoIDs |
| 2 | order-vas-dlr / order-vas-wdw | Order orchestration (REQ_IN POST) |
| 3 | order-service | Order processing |
| 4 | peos | Payment + Entitlement Orchestration |
| 5 | payment-service | Payment capture/authorization |
| 6 | dti-gateway | Entitlement fulfillment |

#### PEOS Role in UC Checkout

- Final orchestration step — coordinates payment capture and ticket fulfillment
- Calls Payment Service for payment capture/authorization
- Calls DTI Gateway for entitlement fulfillment
- If PEOS fails after payment capture → potential orphaned payment (requires manual reconciliation)

#### Investigation (Sequential — ALL steps MANDATORY)

1. **Order VAS attempts by SWID** → extract ConvoIDs
2. **UC SPA errors for most recent ConvoIDs** — extract `paymentSessionId`, `paymentClientId`
3. **PEOS by ConvoID** — check for `CmdErrorText` errors

#### Special Cases

- **MK-to-MK Tier Upgrade:** `orderType=UPGRADE` + `itemType=AP` in Order VAS.
- **Gift Card / Stored Value Card Errors:** Route to `app-flwdw-payment`.

#### Dependencies

| Dependency | AG | Impacts |
|------------|-----|---------|
| Payment Service | app-flwdw-payment | All UC orders |
| DTI | app-flwdw-dticrt | Fulfillment |
| Galaxy (DLR) | app-cadlr-galaxy | DLR ticket creation |
| GAM (WDW) | app-global-gam | WDW ticket creation |
