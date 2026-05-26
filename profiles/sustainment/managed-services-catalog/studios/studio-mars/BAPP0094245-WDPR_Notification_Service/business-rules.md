# Business Rules — Notification Service

## Overview

Sends confirmation emails after order completion via SparkPost for both DLR and WDW.

## Key Rules

- Triggered by order completion (Booking Service for EC, Order VAS for UC)
- Uses SparkPost for email delivery
- V1 API calls = archive only (saveOnly: true), no email sent
- V2 API calls = actual email delivery (saveOnly: false)
- `recipients.enabled: false` = guest opted out of notifications
- DLR component: us-west-2, WDW component: us-east-1


---

## Related Flows

### Flow: Confirmation Email (Notifications)

> Confirmation emails sent after order completion (UC or EC).

#### Path

```
Order Service → Notification Service → SparkPost → Guest Email
```

#### Services Involved

| Step | Service | Action |
|------|---------|--------|
| 1 | booking-service / order-vas | Order completes, triggers notification |
| 2 | notification-dlr / notification-wdw | Processes notification request |
| 3 | SparkPost | External email delivery |

#### Investigation Order

1. **Search by Confirmation Number** — extract `Correlation-Id` from `Identifiers` block
2. **Get Transmission ID by Correlation-Id** — search for "Transmission created"
3. **Determine outcome:**
   - Transmission ID exists → email was sent to SparkPost. Issue is downstream (spam filter, guest email provider).
   - No Transmission ID → check `recipients.enabled` and `saveOnly` fields:
     - `enabled: false` → guest opted out. WAD.
     - `saveOnly: true` → archive only (V1 call), no delivery. WAD.

#### Key Fields

| Field | Purpose |
|-------|---------|
| `Correlation-Id` | Unique per notification request (in `Identifiers` block) |
| `emailType` | UC_CONFIRMATION_TICKETS_V2, UC_CONFIRMATION_PAYMENT_V2, etc. |
| `recipients.enabled` | true = deliver, false = suppress |
| `saveOnly` | true = archive only (no delivery), false = send + archive |
| `Transmission created. ID: {ID}` | SparkPost transmission ID — confirms email handed off |

#### Key Rules

- V1 calls (`saveOnly: true`) archive only — no transmission.
- V2 calls (`saveOnly: false`) send email.
- Close as WAD if `enabled: false`. Orders confirmed, accessible via app/website.

Ref: INC28971526
