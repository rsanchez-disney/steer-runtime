# Shift Log Format Reference

This file is the **single source of truth** for shift log entry formats, deduplication rules, and valid field values. All agents reference this via `#shift-log-format`.

The shift-updates-log.md file in the workspace root feeds both the Teams shift update post AND the Microsoft Forms URLs (via `scripts/generate-form-urls.js`).

## File Header Format

```markdown
# Shift Updates Log — <Date>

## <Shift Name> Shift
```

Use three sections in this exact order: **Alerts**, **Incidents**, **Deployments**. No emojis in entries.

---

## Alert Entry Format

```markdown
- <Alert Name> — <brief context>
  - Summary: <Brief description of the issue>
  - RCA: <Root cause description>
  - Guest Impact: <Description or number of guests. Use "0" for no guest impact>
  - Date/Time Window: <YYYY-MM-DD HH:MM> to <~HH:MM or YYYY-MM-DD HH:MM> Paris Time
  - Internal APP: <Exact Form value, comma-separated if multiple. e.g. OLCI, Digital Key, BFF>
  - External Dependency: <Exact Form value. e.g. Opera, TravelBox, OneID. Use "N/A" if none>
  - Caused by CHG: <Yes or No>
  - Category: <One of: P1 / P2 | Outages | Known PRBs or Parent INCs | High Error Rate / Connection lost / Specific error | New trend in alerts | Support during the weekend>
  - Business Transaction: <Exact BT name from Form if known, otherwise omit>
  - Related INC: <INC numbers, comma-separated>
  - Teams Thread: <URL to the Teams thread where the alert was posted>
  - Context: <Additional context, next steps, who confirmed what>
  - **STATUS: <Resolved / Ongoing / Monitoring>**
```

---

## Incident Entry Format

```markdown
- <INC number> : <Short Description>
  - Status: <Closed | Work in Progress | Pending Vendor | Pending Change | Cancelled>. <Priority: P1/P2/P3/P4>. Opened <YYYY-MM-DD HH:MM> Paris.
  - RCA: <Root cause description>
  - Guest Impact: <Description or number. Use "0" for no guest impact>
  - Internal APP: <Exact Form value, comma-separated if multiple>
  - External Dependency: <Exact Form value. Use "N/A" if none>
  - Squad: <Cruz Ramirez | Storm | Forky | Luigi>
  - PROD issue: <Yes or No. Yes if P1/P2 or caused engagement>
  - Assigned to: <Assignment group. Default: app-frdlp-digital-ext-support>
  - Teams Thread: <URL to the Teams thread>
  - <Additional notes, analysis, actions taken>
```

---

## Deployment Entry Format

```markdown
- <CHG number> - <Short Description>
  - Activity Window: <YYYY-MM-DD HH:MM> to <YYYY-MM-DD HH:MM> Paris Time
  - Scope: <DGE Impact / E-commerce Train / etc.>
  - Status: <Deployed successfully / Rolled back / In progress / Scheduled>
  - Notes: <Additional notes>
```

If no deployments: `- No active deployments for today.`

---

## Deduplication Rules

Before adding a new entry, check for existing entries that match:

| Entry Type | Match By | Rule |
|------------|----------|------|
| Alert | Alert name | Same alert name within the same shift date → **update** existing entry (don't duplicate) |
| Incident | INC number | Same INC number within the same shift date → **update** existing entry |
| Deployment | CHG number | Same CHG number within the same shift date → **update** existing entry |

If a duplicate is found, ask the user: "This entry already exists. Update it with new information?"

---

## Valid Values: Internal APP

Use these exact values (comma-separate if multiple apply):

Arrival Reservation System, ARS Cast Tools, BFF, BIO Services, Book Dine, Capacity Managed Events, CME TPAC API (Ticket Price & Availability), CME Yield Management, Digital Key, Disability Card, Disney Premier Access Ultimate, Entitlement Product Service, Guest Activity Block, Guest Extended Profile, Keyring, Magic Mobile Ticket Meal Plan, Meet and Greet, Mobile App, Mobile Order, Notification service, OLCI, ORION Services, PACS API, Ticket Linking Services, Ticket Management Service, TMS, Virtual Queue, Wallet Server Proxy Provider

## Valid Values: External Dependency

Use these exact values (use "N/A" if none):

Airship, Agilysis, BMACS DB, Content API, Docusign, DRS, EA, EBX, Galaxy, InPark, Lineberty, Marketing Team, On-Premise Infra, OneID, Opera, Package Reservation Service (Core API), SparkPost, Splunk, TravelBox, WorldPay

---

## Full Example

```markdown
# Shift Updates Log — 2026-04-30

## LATAM Shift

Alerts:

- Opera/OHIP Slowness Spike — 35+ alerts over 2+ hours
  - Summary: Opera/OHIP downstream calls with high latency, cascading across OLCI, Digital Key, BFF.
  - RCA: Opera (OHIP) sustained high response time spike. Known recurring pattern since Apr 21.
  - Guest Impact: Guests using OLCI, Digital Key, and package detail experienced timeouts and errors.
  - Date/Time Window: 2026-04-30 17:28 to ~19:41 Paris Time (CEST)
  - Internal APP: OLCI, Digital Key, BFF
  - External Dependency: Opera
  - Caused by CHG: No
  - Category: Known PRBs or Parent INCs
  - Related INC: INC28879684, INC28935538
  - Teams Thread: https://teams.microsoft.com/l/message/...
  - Context: Sergio Arean confirmed recurring pattern since Apr 21.
  - **STATUS: Resolved**

Incidents:

- INC28935538 : [OLCI] DLP_BT_OLCI_SET-TRANSPORT-MODE_ERROR
  - Status: Closed. P3. Opened 2026-04-30 18:11 Paris.
  - RCA: Part of Opera/OHIP slowness event.
  - Guest Impact: 0
  - Internal APP: OLCI
  - External Dependency: Opera
  - Squad: Cruz Ramirez
  - PROD issue: No
  - Assigned to: app-frdlp-digital-ext-support
  - Linked to parent INC28879684. Tags: causedByOpera.

Deployments:

- No active deployments for today.
```
