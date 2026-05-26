# Troubleshooting — Commerce Cart

## Common Issues

### Issue: DefaultAvailabilityDAO ERROR + rental car 500 / error code 010028

**Symptoms:** Rental car availability service returning 500 errors, guest can't proceed to checkout.

**Root Cause:** Rental car availability service failing.

**Resolution:** Guest remove rental car from cart and retry.

---

### Issue: Repeated validation errors on proceed-to-checkout

**Symptoms:** Guest gets repeated errors when clicking proceed-to-checkout.

**Root Cause:** Backend service error during cart validation.

**Resolution:** Investigate which downstream service failed. Check commerce-ui for `PCI_COMMERCE_UI_ERROR`.

---

## Queries

### By SWID
```spl
search index=wdpr_commerce_cart "{SWID}" earliest=-7d | sort -_time | head 50
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
