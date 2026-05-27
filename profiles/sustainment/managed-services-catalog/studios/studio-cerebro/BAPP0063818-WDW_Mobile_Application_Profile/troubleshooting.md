# Troubleshooting — WDW Mobile Application (Profile)

## Common Issues

### Issue: Login loop in app

**Symptoms:** User stuck in infinite login redirect within the WDW mobile app. HIGH frequency.

**Root Cause:** OneID session/token issue or corrupted local app data.

**Resolution:**
- iOS: Settings > General > iPhone Storage > [My Disney Experience] > Offload App. Or: Delete + Reinstall.
- Android: Clear app data or Uninstall + Reinstall.

---

### Issue: Network failures (parks WiFi)

**Symptoms:** Multiple NetworkFailure errors in New Relic. VERY HIGH frequency.

**Root Cause:** Guest is on unstable network (usually parks WiFi). NOT a code issue.

**Resolution:**
1. Check New Relic — if result shows ERROR TYPE of several NetworkFailure → guest is on unstable network
2. Solution: connect to stable network and retry
3. No code fix needed — this is an infrastructure/environment issue

---

### Issue: OneID callback timeout

**Symptoms:** Authentication callback from OneID times out. MEDIUM frequency.

**Root Cause:** OneID service latency or network issues between mobile app and OneID.

**Resolution:**
1. Verify OneID service health
2. Create IDY-* Jira ticket for OneID team investigation

---

### Issue: Push notifications not working

**Symptoms:** Guest not receiving push notifications after enabling them. LOW frequency.

**Root Cause:** MNO service issue or device notification settings misconfigured.

**Resolution:**
1. Check MNO service health (BAPP0229223)
2. Verify device notification settings are enabled
3. Check if opt-in was recorded in MNO service

---

## Escalation Decision Tree

- If login loop affecting multiple guests → check OneID service health → escalate to IDY Jira
- If login loop isolated to single guest → clear app data / reinstall
- If NetworkFailure errors → confirm parks WiFi issue → no escalation needed
- If OneID callback timeout → create IDY-* Jira ticket
- If push notifications not working → check MNO service → escalate to Andrew Southwick
- If iOS-specific issue → escalate to Cristopher Escorcia / Abhishek Rajankar
- If Android-specific issue → escalate to Irving Franco / Alan Solis
- If feature/ownership decision needed → escalate to Mark Lewis

## Known Quirks

- NetworkFailure errors are VERY common and almost always caused by parks WiFi — not a code issue
- BAPP ID is shared between iOS and Android platforms
- Mobile releases require App Store / Google Play review process (cannot hotfix instantly)
- New Relic is the primary monitoring tool for mobile (not Splunk)
