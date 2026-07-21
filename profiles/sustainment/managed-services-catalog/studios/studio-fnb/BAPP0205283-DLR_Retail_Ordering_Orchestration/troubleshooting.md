# Troubleshooting — DLR Retail Ordering Orchestration

## Common Issues

### Issue: Checkout failures

**Symptoms:** Guests cannot complete merchandise purchase, errors at payment step

**Root Cause:** VenueNext POS rejection or payment gateway timeout

**Resolution:**
1. Check health: `https://dlr-roo.wdprapps.disney.com/svc/healthcheck`
2. Splunk: `index=dlr_ro_service level=ERROR`
3. Verify VenueNext status
4. Check payment gateway (DSP/POS team)

---

### Issue: Barcode generation failures

**Symptoms:** Orders complete but receipt has no barcode

**Root Cause:** Barcode Generator Lambda (BAPP0216099) failing

**Resolution:**
1. Check Splunk: `index=wdpr_roo_barcode level=ERROR`
2. Verify Lambda health in CloudWatch
3. Non-blocking — orders still valid without barcode

---

## Escalation Decision Tree

- If VenueNext → help@venuenext.com
- If payment → app-global-dsp
- If barcode → check Lambda logs
- If P1/P2 → DTOC bridge

## Known Quirks

- Redis cache holds session data — restart clears active carts
- Kinesis stream backpressure can cause delays in event publishing
