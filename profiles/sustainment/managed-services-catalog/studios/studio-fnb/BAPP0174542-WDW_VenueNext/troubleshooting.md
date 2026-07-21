# Troubleshooting — WDW VenueNext

## Common Issues

### Issue: Orders not reaching kitchen displays

**Symptoms:** Orders submitted via MOO but kitchen doesn't see them

**Root Cause:** VenueNext internal issue or Pusher disconnection

**Resolution:**
1. Check VN status: https://status.wdw.vnops.net/
2. Check Pusher: https://status.pusher.com/
3. Email help@venuenext.com with: site=WDW, time range, order UUIDs, impact
4. Teams: External - SkyTab Venue | Mobile Retail and Restaurant

---

### Issue: Xpedite tablet offline

**Symptoms:** Specific location's kitchen display not working

**Root Cause:** Tablet hardware/network issue or VN service issue

**Resolution:**
1. If single location → likely hardware/network (contact location operations)
2. If multiple locations → VenueNext system issue, email help@venuenext.com

---

## Escalation Decision Tree

- All VenueNext issues → help@venuenext.com first
- If no response within SLA → Nomer Reyes (Disney VN coordinator)
- If critical → Stephen Schor (stephen.schor@shift4.com)

## Known Quirks

- VenueNext maintenance windows are typically late night — check status page
- Pusher is a sub-dependency — VN issues sometimes masked as Pusher issues
