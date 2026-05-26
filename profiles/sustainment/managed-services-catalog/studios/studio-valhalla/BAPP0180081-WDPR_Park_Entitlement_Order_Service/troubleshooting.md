# Troubleshooting — PEOS

## Query Templates

### DLR — By ConvoID
```spl
index=wdpr_peos source=*west* "{CONVO_ID}" earliest=-7d | head 20
```

### WDW — By ConvoID
```spl
index=wdpr_peos source=*east* "{CONVO_ID}" earliest=-7d | head 20
```

### DLR — Errors
```spl
index=wdpr_peos source=*west* CmdErrorText earliest=-1h | stats count by _time
```

### WDW — Errors
```spl
index=wdpr_peos source=*east* CmdErrorText earliest=-1h | stats count by _time
```

## Known Issues

<!-- Add known issues as they are documented -->

## Escalation

- Assignment Group: `web-global-salescart`
- CI: WDPR Park Entitlement Order Service


---

## External Dependencies — Quick Reference

### Payment Service
| Field | Value |
|-------|-------|
| AG | `app-flwdw-payment` |
| CI | Adaptive Payment Platform |
| Index | `wdpr_payment` |

**Key Query:**
```spl
search index=wdpr_payment "{paymentSessionId}" earliest=-7d | head 20
```

### DTI Gateway
| Field | Value |
|-------|-------|
| AG | `app-flwdw-dticrt` |
| CI | Disney Ticketing Interface (DTI) Gateway |
| Index | `wdpr_dtigw_svc` |

**Key Query:**
```spl
search index=wdpr_dtigw_svc "{PAYLOAD_ID}" "Received response" earliest=-7d | head 10
```

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
