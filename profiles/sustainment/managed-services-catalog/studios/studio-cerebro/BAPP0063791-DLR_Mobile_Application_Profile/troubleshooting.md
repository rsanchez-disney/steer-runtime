# Troubleshooting — DLR Mobile Application (Profile)

## Common Issues

### Issue: Login loop in app

**Symptoms:** User stuck in infinite login redirect within the DLR mobile app.

**Root Cause:** OneID session/token issue or corrupted local app data.

**Resolution:**
- iOS: Offload App or Delete + Reinstall.
- Android: Clear app data or Uninstall + Reinstall.

---

### Issue: Network failures (parks WiFi)

**Symptoms:** Multiple NetworkFailure errors in New Relic.

**Root Cause:** Guest is on unstable network (usually parks WiFi). NOT a code issue.

**Resolution:**
1. Connect to stable network and retry
2. No code fix needed — this is an infrastructure/environment issue

---

### Issue: OneID callback timeout

**Symptoms:** Authentication callback from OneID times out.

**Root Cause:** OneID service latency or network issues between mobile app and OneID.

**Resolution:**
1. Verify OneID service health
2. Create IDY-* Jira ticket for OneID team investigation

---

## Escalation Decision Tree

- If login loop affecting multiple guests → check OneID service health → escalate to IDY Jira
- If login loop isolated to single guest → clear app data / reinstall
- If NetworkFailure errors → confirm parks WiFi issue → no escalation needed
- If OneID callback timeout → create IDY-* Jira ticket
- If iOS-specific issue → escalate to Cristopher Escorcia / Abhishek Rajankar
- If Android-specific issue → escalate to Irving Franco / Alan Solis
- If feature/ownership decision needed → escalate to Mark Lewis

## Known Quirks

- NetworkFailure errors are very common and almost always caused by parks WiFi — not a code issue
- BAPP ID is shared between iOS and Android platforms
- Mobile releases require App Store / Google Play review process (cannot hotfix instantly)
- New Relic is the primary monitoring tool for mobile (not Splunk)
- DLR primary region is US-WEST-2 (unlike WDW which is US-EAST-1)
