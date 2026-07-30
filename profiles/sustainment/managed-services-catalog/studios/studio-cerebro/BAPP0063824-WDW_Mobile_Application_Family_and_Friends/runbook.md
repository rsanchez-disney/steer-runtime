# Runbook — WDW Mobile Application (Family and Friends)

## Restart Procedures

1. N/A — Native mobile module. No server-side restart applicable.
2. For backend issues: Check Profile B2C (BAPP0245892) and VAS (BAPP0242566) services.
3. For guest-side issues: Clear app data (Android) or reinstall.

**Validation:** Verify FnF features work in the WDW Android app. Check New Relic for error rates.

---

## Scaling

- **Scale up:** Not applicable — mobile module. Backend scaling handled by Profile B2C/VAS services.
- **Scale down:** Not applicable

## Failover

- Not applicable for mobile module. Backend failover handled by upstream services (active-active).
- WDW primary region: US-EAST-1.

## Rollback

- Rollback requires a new mobile app release or feature flag toggle
- Deploy via Harness (https://disney.harness.io)
- Contact Mark Lewis (Disney POC) for release decisions

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
| OneID | IDY Jira | Authentication failures in FnF flows |
| Profile B2C | Backend team | FnF list API failures |
| Salesforce | SF team | Deactivated profiles in FnF list (PRB0048497) |
| Disney POC - Mobile | Mark Lewis | Mobile ownership, feature decisions |
| Disney POC - Web/Services | Glenn Raposo | All SPAs + All Backend Services |
| Android FnF | Irving Franco, Alan Solis | Day-to-day Android FnF investigation |

## Useful Tools

| Tool | URL | Purpose |
|------|-----|---------|
| ServiceNow | https://disney.service-now.com | INCs, CTASKs, PRBs |
| Splunk PROD | https://splunk.wdprapps.disney.com | index: wdpr_profile_ui |
| New Relic | https://one.newrelic.com | Mobile Crashes |
| AWS CloudWatch | https://aws.wdprapps.disney.com | ECS Clusters and Alarms |
| Harness | https://disney.harness.io | CI/CD Deployments |
| Snowman | https://tools.toolbox.disney.com/snowman | Bulk Incident Update |
