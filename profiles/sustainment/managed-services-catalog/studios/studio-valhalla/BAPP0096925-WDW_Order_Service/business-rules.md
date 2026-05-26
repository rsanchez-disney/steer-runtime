# Business Rules — WDW Order Service

## Overview

Core order processing for WDW. Sits between Order VAS and PEOS in the UC path.

## Key Rules

- Path: UC SPA → Order VAS → Order Service → PEOS
- Handles order validation, transformation, and routing to PEOS
- WDW-specific order logic applied here


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

#### Investigation (Sequential — ALL steps MANDATORY)

1. **Order VAS attempts by SWID** → extract ConvoIDs
2. **UC SPA errors for most recent ConvoIDs** — extract `paymentSessionId`, `paymentClientId`

#### Order Service Role

- Sits between Order VAS and PEOS
- Handles order validation, transformation, and routing to PEOS
- WDW-specific order logic applied here

#### Special Cases

- **MK-to-MK Tier Upgrade:** `orderType=UPGRADE` + `itemType=AP` in Order VAS. Creates new VID, old VID exchanged.
- **Gift Card / Stored Value Card Errors:** Look for `STORED_VALUE_CARD_APPLIED` with `success: false`. Route to `app-flwdw-payment`.

#### Dependencies

| Dependency | AG | Impacts |
|------------|-----|---------|
| Payment Service | app-flwdw-payment | All UC orders |
| DTI | app-flwdw-dticrt | Fulfillment |
| Galaxy (DLR) | app-cadlr-galaxy | DLR ticket creation |
| GAM (WDW) | app-global-gam | WDW ticket creation |
