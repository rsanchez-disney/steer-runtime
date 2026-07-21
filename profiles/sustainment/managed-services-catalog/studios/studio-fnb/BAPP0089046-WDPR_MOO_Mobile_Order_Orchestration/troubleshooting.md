# Troubleshooting — WDPR MOO Mobile Order Orchestration

## Common Issues

### Issue: Orders stuck in processing

**Symptoms:** Guests see spinning/loading state, orders never complete

**Root Cause:** VenueNext API timeout or Pusher websocket disconnection

**Resolution:**
1. Check VenueNext status: https://status.wdw.vnops.net/
2. Check Pusher status: https://status.pusher.com/
3. If VN down: email help@venuenext.com with order UUIDs
4. If Pusher down: orders process but status updates don't reach guests — wait for recovery

---

### Issue: VenueNext missing items in order

**Symptoms:** Splunk alert "MOO - VN Missing Items" fires

**Root Cause:** Menu item mapping mismatch between MOO and VenueNext

**Resolution:**
1. Check Splunk: `index=wdpr_ddpmw "VN Missing Items"`
2. Identify affected items/locations
3. Contact VenueNext for menu sync: help@venuenext.com
4. Notify operations (PitDroids) to temporarily disable affected locations

---

### Issue: Excessive backend errors

**Symptoms:** Splunk alerts for "Excessive MOO Backend Errors" or "Backend Timeout"

**Root Cause:** Downstream service degradation (payment, VN, arrival windows)

**Resolution:**
1. Check MOO health: health-check?show-all=true endpoint
2. Identify failing downstream from health check response
3. Escalate to appropriate downstream team
4. If MOO itself: check Redis connectivity, ECS task count, memory pressure

---

### Issue: Mobile Order Alert (orders < 5 in 15 min)

**Symptoms:** Low order volume alert fires

**Root Cause:** Could be off-peak hours OR actual service disruption

**Resolution:**
1. Verify if alert fired during park hours (if not, likely false alarm)
2. Check health checks for MOO, VenueNext, Arrival Windows
3. Check if specific park/location affected vs. all locations
4. Escalate if all health checks failing

---

## Escalation Decision Tree

- If VenueNext issue → email help@venuenext.com + Teams: External - SkyTab Venue
- If payment issue → escalate to app-global-dsp
- If Pusher issue → check https://status.pusher.com/ (wait for recovery)
- If MOO service itself → restart ECS service, check Redis
- If P1/P2 → DTOC bridge via DX Monitoring Teams channel

## Known Quirks

- DLR and WDW are fully independent — one can be down while other works
- Redis cache expiry can cause brief cold-start delays after restart
- VenueNext has separate maintenance windows (usually late night) — check their status page
