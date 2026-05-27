# Runbook — DLR Mobile Application (Profile)

## Restart Procedures

1. N/A — Native mobile module. Cannot be restarted server-side.
2. For guest-side issues: Clear app data (Android) or Offload App (iOS), then relaunch.
3. For backend issues: Investigate the backend service that the mobile module calls (Profile WebAPI, etc.)

**Validation:** Verify via New Relic mobile monitoring that error rates return to normal after fix.

---

## Scaling

- **Scale up:** N/A — Native mobile module. Backend services handle scaling independently.
- **Scale down:** N/A

## Failover

- Mobile module relies on backend services which have their own failover (active-active across regions).
- DLR primary region is US-WEST-2.

## Rollback

- Mobile app releases go through App Store / Google Play review process
- Emergency rollback requires expedited app store review or feature flag toggle
- For backend issues: rollback the relevant backend service

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| OneID | IDY Jira | When OneID callback timeout or authentication failures |
| Mobile Platform (iOS) | Cristopher Escorcia, Abhishek Rajankar | Day-to-day iOS investigation |
| Mobile Platform (Android) | Irving Franco, Alan Solis | Day-to-day Android investigation |
| Disney POC (SHIELD) | Mark Lewis | Mobile ownership, feature decisions |
| Tech Lead | Cesar Muñoz | Architecture decisions, escalation point |
