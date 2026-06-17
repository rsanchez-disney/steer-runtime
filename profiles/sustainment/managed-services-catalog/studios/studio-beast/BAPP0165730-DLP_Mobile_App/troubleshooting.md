# Troubleshooting — DLP Mobile App

## Common Issues

### Issue: App unable to complete park check-in (OLCI)

**Symptoms:** Guests cannot complete online check-in through the mobile app, errors or timeouts during OLCI flow.

**Root Cause:** OLCI service (BAPP0211386) degradation or connectivity issue between app and OLCI backend.

**Resolution:** Check OLCI service health. Escalate to OLCI team if backend is down. Verify BFF Core connectivity.

---

### Issue: Digital Key not working (Bluetooth room access)

**Symptoms:** Guests cannot open room doors using the app's Digital Key feature. Bluetooth authentication fails.

**Root Cause:** Digital Key service (BAPP0220148) issue, Bluetooth connectivity problem, or device compatibility issue.

**Resolution:** Check Digital Key service health. Verify guest's device Bluetooth is enabled. Escalate to Digital Key team (BAPP0220148) if service-side issue.

---

### Issue: Digital passes not loading

**Symptoms:** Guests cannot view their digital passes (park entry, attraction passes) in the app.

**Root Cause:** Keyring service or ticket management service degradation.

**Resolution:** Check Keyring (BAPP0177699) and Ticket Management Service health. Verify guest has valid linked tickets.

---

### Issue: App crashes or performance degradation

**Symptoms:** App freezes, crashes, or responds slowly on Android or iOS.

**Root Cause:** React Native rendering issues, memory leaks, or backend response timeouts from BFF Core.

**Resolution:** Check AppDynamics dashboards (Android: AD-AAB-ABJ-AFD, iOS: AD-AAB-ABJ-AFE). Identify slow transactions or error spikes. Check BFF Core health endpoints.

---

### Issue: Push notifications not received

**Symptoms:** Guests do not receive expected push notifications (booking confirmations, reminders).

**Root Cause:** Notification Service (BAPP0225827) issue or device notification permissions disabled.

**Resolution:** Verify Notification Service health. Check if guest has notifications enabled on device. Review notification delivery logs.

---

## Escalation Decision Tree

- If OLCI / check-in issue → check BAPP0211386 (OLCI V2)
- If Digital Key / room access issue → check BAPP0220148 (DLP Digital Key)
- If app UI / crash issue → escalate to Mobile APP team via #dlp-dct
- If BFF Core / backend issue → check BFF Core service health
- If content display issue → check Tridion Content API
- If infrastructure issue → escalate to Cloud OPS

## Known Quirks

- Android and iOS may behave differently due to platform-specific Bluetooth implementations (Digital Key)
- STAGE and LOAD AppDynamics dashboard links are the same — environment depends on App Bundle ID
- Local setup procedures are documented separately in the team wiki
