
# ServiceNow Configuration

## Primary Assignment Group

- **Name:** `app-frdlp-digital-ext-support` (Beast)
- **Instance:** disney.service-now.com
- For AG sys_id and encoded query strings, see `#servicenow-reference-ids`

## DLP Squads & Scope

Beast monitors incidents and changes across all DLP squads. For all AG/CI sys_ids and encoded query strings, see `#servicenow-reference-ids`.

| Squad | Assignment Groups | Scope |
|-------|-------------------|-------|
| Cruz Ramirez | app-frdlp-BaseAPP, app-frdlp-resort-dge, app-frdlp-food-dge | Mobile App, BFF, Magic Mobile, OLCI, Digital Key, Book Dine, Mobile Order, Disability Card |
| Storm | app-frdlp-attraction-dge, app-frdlp-guestprofile | Orion, DPA Ultimate, Virtual Queue, Meet & Greet, Bio Services, Maps, Guest Profile, Keyring, Wallet, Ticket Linking, TMS |
| Luigi | N/A (System/Infra) | Architecture, CICD |

## Incident Workflow

1. Alert triggers in Splunk → posts to Teams "🔔 Monitoring Alerts (Production)"
2. On-shift engineer (LATAM or PHI) acknowledges in Teams channel
3. Engineer posts "General Analysis" with: Summary, RCA, Guest Impact, Date/Time Window, Splunk links
4. If action needed → create/update ServiceNow incident
5. If research needed → create Jira task `[sustainment][research][INC{number}]` in APP project
6. Post-mortem for P2+ → create Jira task `[Sustainment][Postmortem][{component}]`

## ServiceNow States Reference

| State ID | Name |
|----------|------|
| 1 | New |
| 6 | Resolved |
| 7 | Closed |
| 10 | Assigned |
| 11 | Work in Progress |
| 12 | Pending Vendor |
| 13 | Pending Customer |
| 14 | Canceled |
| 700 | Pending Change |
| 704 | Pending Validation |

## Incident Volume & Common Patterns

- ~20 incidents/month assigned to the team
- Mostly P4 (auto-resolved alerts) and P3 (service degradation)
- Common alert patterns: DPE Notification delays, OLCI Police Form errors, Magic Mobile QRC errors, Ticket Linking errors, TMS JVM high CPU, MySQL RDS CPU trending
- Common BAPP IDs: see `#servicenow-reference-ids` for all BAPP-to-application mappings

## Teams Channels — DLP Beast Team

| Channel | Purpose |
|---------|---------|
| 🌎🌍🌍 ADM Beast Team | General channel, all shifts |
| 🏠 All shifts | Shift handovers between PHI → INDIA → LATAM |
| 📋 CHGs log | Change request tracking |
| 📈 Daily Report | Automated daily reports |
| 🏰 Castle Keepers | Private ops channel |

## Teams Channels — DLP Digital DGE Train

| Channel | Purpose |
|---------|---------|
| 🔔 Monitoring Alerts (Production) | Splunk alerts for production |
| 🔔 Service Now Updates | SNOW notification feed |
| 🆘 Global Production Support | Cross-team production support |
| 🔔 Incidents | Incident tracking |
| 🚙 FRONT - BEAST - SUPPORT | Frontend support |
| 🚓 BACK - DOC HUDSON - SUPPORT | Backend support |
