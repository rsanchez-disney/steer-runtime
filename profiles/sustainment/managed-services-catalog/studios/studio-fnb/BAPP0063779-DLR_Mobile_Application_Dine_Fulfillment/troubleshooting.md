# Troubleshooting — DLR Mobile Application Dine Fulfillment

## Common Issues

### Issue: App crashes or feature not loading

**Symptoms:** Feature module crashes, blank screen, or infinite loading

**Root Cause:** Backend service down, network issue, or app bug

**Resolution:**
1. Check backend service health (MOO/ROO/DiSCO/Dining Menu)
2. Review New Relic crash reports for stack trace
3. If backend healthy: may be client-side bug — check recent releases
4. Emergency: disable feature via Canopy feature flag

---

### Issue: Feature flag misconfiguration

**Symptoms:** Feature appearing/disappearing unexpectedly

**Root Cause:** Canopy configuration change

**Resolution:**
1. Verify Canopy feature flag state for the feature
2. Contact feature flag team if unexpected change

---

## Escalation Decision Tree

- If backend down → prd-global-fnb
- If app crash (client-side) → Check New Relic, coordinate with Shield team
- If feature flag → Canopy team

## Known Quirks

- App updates require App Store/Play Store review — hotfixes take time
- Feature flags are the fastest mitigation path
