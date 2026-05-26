# Business Rules — WDW Capacity Managed Events

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | | |
| Response time (p95) | | |
| Error rate | | |

## Peak Periods

- Blockout calendar dates for AP tiers
- Holiday weekends and special events

## Business Logic

### WDW AP Concurrent Reservation Limits

| Tier | Concurrent Limit |
|------|-----------------|
| Incredi-Pass | 5 |
| Sorcerer Pass | 3 |
| Pirate Pass | 3 |
| Pixie Dust Pass | 3 |

- "Concurrent" = only `reservationStatus=NEW` with future date count against the limit
- CANCELED/REDEEMED/EXPIRED/NO_SHOW free the slot
- Multi-guest party sharing a TCOD: AP reservations on that TCOD counted against limit regardless of which SWID created them
- Only AP inventory buckets (`invBucketId=WDW_*_AP_DAILY`, `productId=WDW_AP`) count. Ticket reservations (`WDW_*_TICKET_DAILY`, `WDW_TICKET`) do NOT count against AP limit
- Cast overrides: `reservationOrigin=CAST` + `overrideClassification=maxOverride` bypass the limit
- Ref: INC28813696

### Reservation Status Lifecycle

```
NEW → REDEEMED (guest scanned into park)
NEW → CANCELED (guest or system cancelled)
NEW → NO_SHOW (no-show-processor after date passes)
NEW → EXPIRED (reservation date passed without scan or no-show processing)
NEW → RELEASED (frozen inventory thawed — purchase didn't complete)
```

### CME Mobile

- CME Mobile flow is a web view — identical to website
- There is NO native mobile component for CME
- If CME backend is healthy (all services returning 200), the issue is NOT a mobile app problem

### Key Correlation Fields

| Field | Component | Purpose |
|-------|-----------|---------|
| `x-conversation-id` / `convo-id` | Eligibility | Primary correlation ID — fans out to Availability, Reservation, Retrieval |
| `reservationAllowed` | Eligibility | true/false — determines if guest can make reservations |
| `bookingWindowStart` | Eligibility | Date when guest's booking window opens |
| `unreservableReasons` | Availability | Per-date reasons: PARK_FULL, BLOCKOUT, NO_ENTITLEMENT, HOLD_CONFLICT |
| `resId` | Reservation | Reservation ID — used for DELETE (cancel) and PUT (modify) |
| `confId` | Reservation | Confirmation ID — groups multiple resIds in a party reservation |
| `reservationStatus` | Retrieval | NEW, REDEEMED, CANCELED, EXPIRED, NO_SHOW, RELEASED |

## Dependencies

- GAM WDW (entitlement source)
- Akamai KSD (WAF/rate-limiting)
- RES SPA (frontend web view)
- TMS WDW (penalty management)

## Impact Classification

- **Full outage:** Guests cannot make, modify, or cancel park reservations for WDW
- **Degraded:** Partial availability issues, slow responses, or specific tier failures
