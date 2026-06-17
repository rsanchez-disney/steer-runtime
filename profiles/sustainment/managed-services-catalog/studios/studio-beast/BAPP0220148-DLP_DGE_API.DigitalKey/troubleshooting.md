# Troubleshooting — DLP DGE API.DigitalKey

## Common Issues

### Issue: CISA servers down — cannot retrieve eligible rooms

**Symptoms:** Digital Key Provider impacted. Guests cannot see eligible rooms or activate Digital Key.

**Root Cause:** CISA external dependency servers are down.

**Resolution:** Check CISA server health:
- DCR: https://dlp-cisa-e-server-dcr.emea.wdpr.disney.com/
- NY: https://dlp-cisa-e-server-ny.emea.wdpr.disney.com/
- DL: https://dlp-cisa-e-server-dl.emea.wdpr.disney.com/

Escalate to CISA/infrastructure team if servers are down.

---

### Issue: Room Not Found / Room Not Authorized

**Symptoms:** Guest gets error when trying to open door. Room 2403 or 2406 (dirty status rooms).

**Root Cause:** Room assigned has dirty status or is not authorized for Digital Key.

**Resolution:** Check Opera room assignment. Verify room status. Known test rooms 2403/2406 trigger this error intentionally.

---

### Issue: "I'm here" CTA not appearing

**Symptoms:** Guest on arrival day but cannot see the "I'm here" button.

**Root Cause:** OLCI not completed, Magic Mobile flag OFF in Opera, or not arrival date yet.

**Resolution:** Verify in Opera: Magic Mobile feature flag is ON. Confirm OLCI is completed. Confirm it's the arrival date. For last-minute bookings (≤3 days), Magic Mobile flag may be OFF — enable in Opera.

---

### Issue: Room Not Ready

**Symptoms:** Guest activated Digital Key but room shows "not ready."

**Root Cause:** Room not yet prepared by housekeeping. Guest can set up Room-is-Ready reminder.

**Resolution:** This is expected behavior. Guest will be notified via SMS/email when room is ready. If check-in was reversed in Opera, guest needs to redo steps from "I'm here" CTA.

---

### Issue: Push notification not received on arrival day

**Symptoms:** Guest doesn't receive Digital Key activation notification by 10:00 AM.

**Root Cause:** Magic Mobile flag OFF, OLCI not completed, or push notification service issue.

**Resolution:** Verify Opera: Magic Mobile ON, PFO and OLC in Preferences, reservation pre-registered, room assigned. Check push notification publisher service.

---

## Escalation Decision Tree

- If CISA servers down → CISA/infrastructure team
- If Opera Cloud issue → Opera support team
- If Digital Key Provider application issue → Cruz Ramirez Resort DGE (app-frdlp-resort-dge)
- If push notification issue → check Push Notification Publisher
- If ECS/infrastructure → Cloud OPS

## Known Quirks

- CISA server outage is the main known issue
- Rooms 2403 and 2406 are known to trigger "Room Not Found/Not Authorized" errors (dirty status)
- QA can test remotely with Opera except room door opening animation (requires physical presence)
- CC token no longer saved in stage
- Last-minute bookings (≤3 days) require manual Magic Mobile flag activation in Opera
