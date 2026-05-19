# Troubleshooting — WDW Order VAS

## Query Templates

### Order Attempts by SWID
```spl
index=wdpr_wdw_ordervas "REQ_IN" "POST[v1/orders]" "{SWID}" earliest=-7d | head 20
```

### By ConvoID
```spl
index=wdpr_wdw_ordervas "{CONVO_ID}" earliest=-7d | head 30
```

### Failures
```spl
index=wdpr_wdw_ordervas "FAILED" OR "ERROR" earliest=-1h | stats count by _time
```

## Known Issues

<!-- Add known issues as they are documented -->

## Escalation

- Assignment Group: `web-global-salescart`
- CI: WDW Order View Assembler Service


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
