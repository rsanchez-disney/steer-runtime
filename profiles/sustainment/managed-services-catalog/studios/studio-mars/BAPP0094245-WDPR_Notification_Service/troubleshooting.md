# Troubleshooting — Notification Service

## Query Templates

### DLR — By Confirmation Number
```spl
index=wdpr_tixsale_dlr source=*notify* "{CONFIRMATION_NUMBER}" earliest=-7d | head 20
```

### WDW — By Confirmation Number
```spl
index=wdpr_tixsale_wdw source=*notify* "{CONFIRMATION_NUMBER}" earliest=-7d | head 20
```

### DLR — By Correlation ID (get Transmission ID)
```spl
index=wdpr_tixsale_dlr source=*notify* "{CORRELATION_ID}" "Transmission created" earliest=-7d
```

### DLR — Errors
```spl
index=wdpr_tixsale_dlr source=*notify* "ERROR" OR "FAILED" earliest=-1h | stats count by _time
```

### WDW — Errors
```spl
index=wdpr_tixsale_wdw source=*notify* "ERROR" OR "FAILED" earliest=-1h | stats count by _time
```

## Investigation Steps

1. Search by Confirmation Number → extract `Correlation-Id`
2. Search by Correlation-Id for "Transmission created" → get Transmission ID
3. Determine outcome:
   - Transmission ID exists → email sent to SparkPost (downstream issue: spam filter)
   - No Transmission ID → check `recipients.enabled` and `saveOnly`
   - `enabled: false` → guest opted out. WAD.
   - `saveOnly: true` → archive only, no delivery. WAD.

## Key Rules

- V1 calls (saveOnly: true) archive only — no transmission
- V2 calls (saveOnly: false) send email
- Close as WAD if enabled: false

Ref: INC28971526

## Escalation

- Assignment Group: `web-global-salescart`
- CI: WDPR Notification Service


---

## External Dependencies — Quick Reference

### Booking Service (upstream trigger)
| Field | Value |
|-------|-------|
| AG | `web-global-salescart` |
| CI | Booking Service |
| Index | `wdpr_booking_service` |

Notification is triggered AFTER successful order. If no notification sent, first verify order was BOOKED in Booking Service.

---

## Routing

**Assignment Group:** `web-global-salescart`  
**sys_id:** 9d97e22a37970ec09194341643990e1c  
**CI:** WDPRD Commerce UI, DLR UC API/SPA  
**Description:** Express Checkout (Booking Service or UC). TMS links tickets. EVAS/TMS retrieve tickets/passes  
**L2/L3:** UC: Studio Valhalla. EC: Studio Mars

### Quick Route-Away Patterns

| Keywords | Action | AG | CI |
|----------|--------|-----|-----|
| "unable to download photos", "download photopass", "download photos from the app" | Out of ticketing scope — route immediately | app-flwdw-dpi | DPI Magento e-Commerce Platform - DLR |
| "AIM Utility" + resort keywords | See auto-triage Rule 29 | ops-global-resortops | — |
| Old/discontinued product showing in purchase flow | Lexicon config issue | prd-global-DPRD Production | — |

### Key Escalation Groups

| Team | AG | When to escalate |
|------|-----|-----------------|
| DPay/Wallet | app-flwdw-payment | Payment failures |
| DTI | app-flwdw-dticrt | Specify PayloadId |
| eGalaxy DLR | app-cadlr-galaxy | If failing: TMS DLR, CME DLR, DTI, Pended Orders |
| Package Order | app-global-l3defenders | Booking Service (VO, Room Only) |
| Accertify | app-fltwdc-dpep accertify | Fraud decisioning |
