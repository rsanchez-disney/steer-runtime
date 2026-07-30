# Runbook — WDW Mobile Application (Profile)

## Restart Procedures

1. N/A — Native mobile module. Cannot be restarted server-side.
2. For guest-side issues: Clear app data (Android) or Offload App (iOS), then relaunch.
3. For backend issues: Investigate the backend service that the mobile module calls (Profile B2C, Profile B2B, Profile VAS, Preference Service, Mobile Notification Service).

**Validation:** Verify via New Relic mobile monitoring that error rates return to normal after fix.

---

## Scaling

- **Scale up:** N/A — Native mobile module. Backend services handle scaling independently.
- **Scale down:** N/A

## Failover

- Mobile module relies on backend services which have their own failover (active-active across regions).
- WDW primary region is US-EAST-1.
- If backend is down in one region, Route 53 routes to the other region transparently.
- Services in this index: profile-b2c-ha, profile-b2b-ha, profile-vas-ha, preference-svc-ha, mobile-notification-svc-ha.

## Rollback

- Mobile app releases go through App Store / Google Play review process
- Emergency rollback requires expedited app store review or feature flag toggle
- For backend issues: rollback the relevant backend service via Harness (https://disney.harness.io)

## On-Call

- **On-call Number:** +1 934 647 4549
- **Incidents Channel:** DX Profile Incidents Ack
- **Rotation:** Weekly (every Wednesday at 12:00 AM) | Client Time Zone: EST (GMT-4)

### Shift 1 — LATAM (Weekday 8AM-6PM local)

| Name | Location | Stack | Time Zone |
|------|----------|-------|-----------|
| Cesar Munoz | CO | TL Java Developer Sr | CO (GMT-5) |
| Irving Franco | MX | Android Mobile Developer Jr Adv | MX (GMT-6) |
| Alan Solis | MX | Android Mobile Developer Sr | MX (GMT-6) |
| Nerio Baez Delgado | PE | Java Developer SSr Adv | PE (GMT-5) |
| Julian Martinez | CO | Java Developer SSr | CO (GMT-5) |
| Gerson Barrera | CO | Web UI Developer SSr | CO (GMT-5) |
| Cristopher Escorcia | CO | iOS Mobile Developer SSr | CO (GMT-5) |

### Shift 2 — India (Weekday 8AM-5PM IST = 11PM-8AM EST)

| Name | Location | Stack | Time Zone |
|------|----------|-------|-----------|
| Abhishek Rajankar | IN | iOS Mobile Developer Sr | IST (GMT+5:30) |
| Yash Sugandh | IN | Java Developer Sr | IST (GMT+5:30) |

**Weekend:** Shift 1 covers Sat/Sun daytime · Shift 2 covers Sat/Sun night (IST hours)

## Escalation Path

| Level | Contact | Role |
|-------|---------|------|
| L1 | On-Call Glober | First responder |
| L2 | Cesar Muñoz | Tech Lead |
| L3 | Martin Uribe | Tech Manager |
| L4 | Sebastian / Celeste | PMs |
| L5 | Eugenio Tomasino | Director |

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| OneID | IDY Jira | When OneID callback timeout or authentication failures |
| MNO Service | Andrew Southwick | When push notification opt-in issues |
| Mobile Platform (iOS) | Cristopher Escorcia, Abhishek Rajankar | Day-to-day iOS investigation |
| Mobile Platform (Android) | Irving Franco, Alan Solis | Day-to-day Android investigation |
| Disney POC - Mobile | Mark Lewis | Mobile ownership, feature decisions |
| Disney POC - Web/Services | Glenn Raposo | All SPAs + All Backend Services |
| Tech Lead (WDW) | Gino Caverzan | WDW mobile architecture decisions |

## Useful Tools

| Tool | URL | Purpose |
|------|-----|---------|
| ServiceNow | https://disney.service-now.com | INCs, CTASKs, PRBs |
| Splunk PROD | https://splunk.wdprapps.disney.com | index: wdpr_profile_ui |
| AppDynamics | https://disney-prod.saas.appdynamics.com | Performance and latency |
| Grafana | https://grafana.wdprapps.disney.com | Active-Active Dashboard |
| New Relic | https://one.newrelic.com | Mobile Crashes |
| Axis | https://axis.disney.network | Guest Status / Banned |
| AWS CloudWatch | https://aws.wdprapps.disney.com | ECS Clusters and Alarms |
| Harness | https://disney.harness.io | CI/CD Deployments |
| Snowman | https://tools.toolbox.disney.com/snowman | Bulk Incident Update |
| Akamai Edge | https://control.akamai.com/apps/edge-diagnostics | Translate Error String |
| ContentSquare | https://app.contentsquare.com | Web UX Monitoring |
