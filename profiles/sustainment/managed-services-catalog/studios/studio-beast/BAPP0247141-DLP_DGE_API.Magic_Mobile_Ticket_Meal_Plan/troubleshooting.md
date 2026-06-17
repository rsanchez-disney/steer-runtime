# Troubleshooting — DLP DGE API.Magic Mobile Ticket Meal Plan

## Common Issues

### Issue: MagicPass not appearing for guest

**Symptoms:** Guest cannot see their MagicPass in the app despite having a hotel + ticket booking. Booking page shows no MP module.

**Root Cause:** Booking not yet within 7-day window, guest under 3 years old (not eligible), booking data not synced from BMACS, or service failure.

**Resolution:**
1. Verify booking is within 7-day arrival window
2. Check Splunk "wdpr-dlp-is-lodging-bma-magic-mobile-provider" for errors related to the booking
3. Verify BMACS has correct reservation data
4. Check AppDynamics for service health
5. If data sync issue → may need to wait for next sync cycle or force refresh

---

### Issue: MagicPass blocked but guest claims it shouldn't be

**Symptoms:** Guest sees "blocked" flag on MagicPass. Pop-in prevents access to MP Detail page.

**Root Cause:** Magic Mobile set to OFF in Opera (intentional fraud block or operational error).

**Resolution:**
1. Verify in Opera if Magic Mobile is toggled OFF for this guest's reservation
2. If operational error → toggle Magic Mobile back to ON in Opera:
   - Log into Opera → locate reservation → Magic Mobile settings → toggle ON → Save
3. Guest needs to refresh page (back arrow + return) to see unblocked state
4. If intentional fraud block → escalate to security/fraud team

---

### Issue: Meal Plan QR code not working at restaurant/entrance

**Symptoms:** QR code displayed on digital card is not scanning correctly at card readers.

**Root Cause:** QR code data corrupted, card reader hardware issue, or meal plan reservation not properly linked.

**Resolution:**
1. Check if issue is specific to one guest or widespread
2. If single guest → verify meal plan reservation data in backend
3. If widespread → check ECS service health and QR code generation logic
4. Escalate to hotel operations for physical fallback while resolving

---

### Issue: Hotel change (W/O) not reflected on MagicPass

**Symptoms:** Guest moved to different hotel but MagicPass still shows old hotel information.

**Root Cause:** BMACS hotel change not propagated to Magic Mobile provider, or cache not invalidated.

**Resolution:**
1. Verify hotel change was completed in BMACS
2. Check Splunk logs for reservation update events
3. If update not received → check RabbitMQ/event delivery from BMACS
4. Guest may need to force-refresh their booking page in the app

---

## Escalation Decision Tree

- If MagicPass blocked (fraud) → security/fraud team
- If Opera toggle issue → hotel operations team
- If BMACS data sync issue → booking team
- If service outage → restart ECS, then escalate to Beast studio
- If QR code hardware issue → hotel facilities/IT

## Known Quirks

- MagicPass only available 7 days before arrival — earlier access is not supported
- Blocking/unblocking happens in Opera, not in the Magic Mobile service itself
- Some test cases require NRT team assistance (hotel changes, guest add/remove)
- Executive Floor (EF) flag auto-appears for breakfast meals and deluxe suites
- Splunk error rate query available for monitoring endpoint health by URL
