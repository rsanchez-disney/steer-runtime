# Bug Triage Rules — DSP Releases

## Tech Stack → Service Mapping

### Android (DSP Go)
- UI changes on the mobile app
- DSP Go client-side logic

### PHP (Connect API ecosystem)
- Connect API
- Checkout service
- Reduction Service
- Audit service
- Core API (Venue, Vendors, Terminal)
- Settings and Configurations

### React (Embedded in Connect)
- Flash Reports UI
- Config Exceptions (C.H.) UI
- Any Connect-embedded frontend component

### Go (Backend services)
- Orders downstream
- CAP (Central Authorization Platform)
- CAP Order Export
- Product Catalog
- all_items service
- CFA / CFA Venue
- Terminal Reports backend
- Flash Reports backend
- Stock Count API

### Data (Analytics & Reporting)
- Reporting pipelines
- Tableau dashboards
- Snowflake queries/models

---

## Ownership Rules

### Globant Ownership Criteria
1. Bug's Epic Link points to an epic present in the "DSP 2.1" Jira filter
2. Bug description references work covered by an epic in the "DSP 2.1" filter
3. The "DSP 2.1" filter is the single source of truth — ALL epics in that filter belong to Globant

### Disney Ownership Criteria
- Default if no match to any epic in the "DSP 2.1" filter is found
- Bug relates to infrastructure, platform, or Disney-only areas (kitchen, hardware, security)

### JQL for GLB Epics
```
filter = "DSP 2.1" AND issuetype = Epic
```

> **Important:** There is NO "globant-team" group or "GLB" label. The filter itself defines the scope.

### Team Field (Post-Filter)
- The team is stored in `customfield_10001` (alias "epicTheme" / "cloudTeam")
- JQL cannot reliably filter this field — use post-filtering
- Disney teams to exclude: "POS - Heimdall", "POS - Bifrost", "POS - Finance Testing", "POS - OSI Testing", "POS - Product", "POS - Studio Hiro"
- Globant team value: "POS - Globant Product"
- Bugs with no team ("Not set") should be listed separately for manual routing

### Target Release Field
The Jira field name for target release in JQL is: `"Target Release[Short text]"`

### Triage Label
- `glb-prod-triage` — Added after a bug has been triaged. Exclude from future runs.

---

## Product Components (Canonical List)

APP/FiPay, Back Office, Bar Tabs, CAP, Cart, Cash Drawers, CastAPI, Categories, Check Action, Checks, CheckSync, CoreAPI, CS-GO, Dining Plan, Discounts, EAS, EDS, Electronic Journal, EMMA, Employee Roles, Folio, Gift Card, Hardware, Items, KDS, Kitchen, Log In/Out, Logs, Menu, MMC, Modifiers, MongoDB, Monitoring and Alerting, Offline, Operational Participants, Orders, Payments, POS Launcher, Proxy Server, QSRA, Recall, Receipts, Refunds, Reporting, Returns/Exchanges, Sailpoint, Security, Shipping, Tax, Terminal Report, TGR, Tips & Gratuities, Training Mode, User/Accounts, Vericast, Vertex
