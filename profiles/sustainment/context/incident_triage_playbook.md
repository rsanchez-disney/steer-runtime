# Incident Triage Playbook

Operational playbook for the incident_triage_agent. Contains severity classification rules, investigation paths via Splunk/AppDynamics/ServiceNow, and commerce business rules for validating whether an incident is a genuine system issue or expected behavior.

---

## 1. Severity Classification Rules

### P1 — Critical (Service Down)
Assign P1 when ANY of these are true:
- Revenue-generating flow is completely blocked (booking, checkout, payments)
- More than 50% of users affected on a primary channel (WDW, DLR, DCL)
- Complete service outage (all transactions failing for a flow)
- Data loss or corruption confirmed
- Security breach with active exploitation

### P2 — High (Major Degradation)
Assign P2 when ANY of these are true:
- Revenue flow degraded but workaround exists (retry works, alternate path available)
- Response times exceed 5x baseline for a critical service
- Error rate exceeds 25% on a revenue path
- Single environment fully down (stage blocking release, prod partially impacted)
- Intermittent failures affecting 10-50% of users

### P3 — Medium (Minor Impact)
Assign P3 when ANY of these are true:
- Non-revenue flow impacted (admin tools, reporting, internal dashboards)
- Error rate between 5-25% on non-critical path
- Performance degradation noticeable but within tolerance (2-5x baseline)
- Single feature broken, rest of application functional
- Fewer than 10% of users affected

### P4 — Low (Cosmetic / No User Impact)
Assign P4 when ALL of these are true:
- No user-facing impact
- Cosmetic issue or minor logging error
- Monitoring noise (false positive alerts)
- Scheduled maintenance follow-up items

---

## 2. Issue Classification — Which Investigation Path?

When an INC arrives, classify it by keywords to determine the correct investigation rules. This prevents wasting time querying wrong indexes.

### Purchase / Order Flow Issues
| Keywords | Rule | Index |
|----------|------|-------|
| ticket, purchase, buy, order, checkout, confirmation | Rule 1 | `wdpr_wdw_ordervas` (WDW) / `wdpr_dlr_ordervas` (DLR) |
| modification, mod, change ticket, date change | Rule 2 | Same ordervas indexes |
| annual pass, AP, magic key, upgrade, renewal | Rule 3 | Same ordervas indexes |
| package, vacation package, lodging package | Rule 4 | Same ordervas + `wdpr_core_api` for RCA |
| room only, hotel booking | Rule 5 | Same ordervas + `wdpr_core_api` for RCA |

### Ticket/Pass Visibility Issues
| Keywords | Rule | Index |
|----------|------|-------|
| ticket not showing, MyPlans, MDE (WDW) | Rule 6 | `wdpr-ecommerce` (wdw tms) |
| not active, GSS, Disneyland app, VID (DLR) | Rule 7 | `wdpr-ecommerce` (dlr tms) + `wdpr_egalaxy_dlr` |

### Park Reservation Issues
| Keywords | Rule | Index |
|----------|------|-------|
| park reservation, calendar, can't reserve (DLR) | Rules 12-15 | `wdpr-ecommerce` (dlr cme-*) |
| park reservation, calendar, can't reserve (WDW) | Rules 16-19 | `wdpr-ecommerce` (wdw cme-*) |

### CRITICAL: Do NOT mix purchase and reservation queries
- **Rule 20:** Park reservation issues → skip Rules 1-3, 8-9. Go directly to CME rules (12-15 DLR, 16-19 WDW).
- **Rule 22:** Magic Key renewal/new sale → skip ordervas/UC SPA. Go to Rule 21 (booking service pipeline).
- Only cross-reference purchase indexes if CME Eligibility shows no entitlements (exception in Rule 20).

### Specialized Patterns
| Keywords | Rule | Action |
|----------|------|--------|
| LLMP, lightning lane, genie+ (DLR) | Rule 23 | eGalaxy Package/PackageDetail check |
| Purging failing, bookingservice-mariadb | Rule 24 | AUTO-CLOSE (authorized exception) |
| Patching error, POST-CHECK UPDATE | Rule 25 | Route to `ops-global-commerce-sre` |
| unpatched vulnerabilities, penetration test, security scope | Rule 26 | SKIP (security BOT auto-generated) |
| lexvas, trade pricing, PLU, availability | Rule 27 | CME Availability + LexVas price sync |
| MEP, cast entitlement, PERNR, self admission | Rule 28 | TMS + eGalaxy + REX/SENA |
| AIM Utility, card on file, check in gst | Rule 29 | Analyze & suggest routing to `ops-global-resortops` |
| ticket-to-pass upgrade, UNSUBMITTED | Rule 30 | Booking service + payment decline check |
| upgrade, reservation missing after upgrade (DLR) | Rule 31 | CME Retrieval + eGalaxy old VID check |
| penalty, no-show, reservation suspended (DLR) | Rule 32 | eGalaxy admission + alternate ticket check |
| PTAS, EAS, connectivity | Rule 33 | Investigate & resolve if transient |
| old pass showing, discontinued product | Rule 34 | Route to product team (Studio Nike) |
| ticket upgrade, reservation cancelled (WDW) | Rule 35 | CME entitlement-upgrade + entitlement-cancel |
| duck out, resort package checkout error | Rule 36 | `wdpr_commerce_cart` + `wdpr_commerce_ui` |

---

## 3. Splunk Investigation Queries

### 3.1 Splunk Index Map

| Index | Service | Use For |
|-------|---------|---------|
| `wdpr_wdw_ordervas` | WDW Order Vas | WDW ticket/AP/package/room orders |
| `wdpr_dlr_ordervas` | DLR Order Vas | DLR ticket/AP/package/room orders |
| `wdpr_booking_service` | EC Booking Service | MK renewals, new sales, trade tickets, AP sales ⚠️ NO ACCESS |
| `wdpr-ecommerce` | CME, TMS, EVAS, LexVas | Park reservations, entitlement retrieval, product data |
| `wdpr_egalaxy_dlr` | eGalaxy DLR | DLR ticket/pass status, lineage, usage, supplements |
| `wdpr_dtigw_svc` | DTI Gateway | Ticket fulfillment |
| `wdpr_payment` | Payment Service | Payment decline details |
| `dlr_s0001477` | DLR UC SPA/API | DLR consumer checkout errors |
| `wdw_s0001479` | WDW UC SPA/API | WDW consumer checkout errors |
| `wdpr_core_api` | Core API | Package order service RCA |
| `wdpr_wdw_cme` | WDW CME Lambda | WDW entitlement-cancel events |
| `wdpr_commerce_cart` | Commerce Cart | Cart validation, rental car errors |
| `wdpr_commerce_ui` | Commerce UI | Checkout page errors, Duck Out |
| `wdpr_tixsale_dlr` | DLR Ticket Sale Notifications | Confirmation email delivery |
| `wdpr_tixsale_wdw` | WDW Ticket Sale Notifications | Confirmation email delivery |

### 3.2 ECS Cluster Filters (for wdpr-ecommerce index)

| Service | DLR Cluster | WDW Cluster | Task Definition |
|---------|-------------|-------------|-----------------|
| CME Retrieval | `dlr-ecommerce-S0001477*` | `wdw-ecommerce-S0001479-use1-prd` | `cme-rtrvl*` |
| CME Eligibility | `dlr-ecommerce-S0001477*` | `wdw-ecommerce-S0001479-use1-prd` | `cme-elig*` |
| CME Availability | `dlr-ecommerce-S0001477*` | `wdw-ecommerce-S0001479-use1-prd` | `cme-avail*` |
| CME Reservation | `dlr-ecommerce-S0001477*` | `wdw-ecommerce-S0001479-use1-prd` | `cme-res*` |
| TMS DLR | `dlr-ecommerce-S0001477-usw2*` | — | `*tms*` |
| TMS WDW | — | `wdw-ecommerce-S0001479-usw2*` | `*tms*` |


### 3.3 Core Splunk Query Templates

**Ticket Purchase (Rule 1):**
```spl
search index={{INDEX}} "firehose" "{{SWID}}" earliest=-24h latest=now
| rex field="Msg" "Put Record to Firehose stream: (?<payload>.*)"
| spath input=payload
| fields - _raw
| where isnotnull(productName)
| rename purchaser as swid, status as orderStatus
| dedup orderId
| table _time orderId orderStatus orderType itemType productName price errorCode errorDescription isGift
| sort -_time
```
- `orderStatus=BOOKED` → order completed, issue is downstream
- `orderStatus=FAILED` → capture errorCode/errorDescription
- `orderStatus=PENDED` + `isGift=true` → expected (gift fulfillment)
- Zero results → guest didn't complete checkout, try Rule 8 (UC SPA)

**CME Retrieval (Rule 12/16):**
```spl
search index=wdpr-ecommerce ecs_cluster="{{CLUSTER}}" ecs_task_definition="cme-rtrvl*" "{{SWID}}" earliest=-24h latest=now
| sort -_time | head 30
```

**CME Eligibility (Rule 13/17):**
```spl
search index=wdpr-ecommerce ecs_cluster="{{CLUSTER}}" ecs_task_definition="cme-elig*" "{{SWID}}" earliest=-24h latest=now
| sort -_time | head 20
```

**CME Availability (Rule 14/18):**
```spl
search index=wdpr-ecommerce ecs_cluster="{{CLUSTER}}" ecs_task_definition="cme-avail*" "{{SWID_OR_VID}}" earliest=-24h latest=now
| sort -_time | head 20
```

**CME Reservation (Rule 15/19):**
```spl
search index=wdpr-ecommerce ecs_cluster="{{CLUSTER}}" ecs_task_definition="cme-res*" "{{SWID_OR_VID}}" earliest=-24h latest=now
| sort -_time | head 20
```

**TMS DLR (Rule 7):**
```spl
search index=wdpr-ecommerce ecs_cluster="dlr-ecommerce-S0001477-usw2*" ecs_task_definition="*tms*" "{{SWID}}" earliest=-24h latest=now
| sort -_time | head 50
```

**eGalaxy DLR (Rule 7 Step 2):**
```spl
search index=wdpr_egalaxy_dlr "{{VID}}" earliest=-7d latest=now
| sort -_time | head 100
```

**UC SPA Fallback (Rule 8):**
```spl
search index={{UC_INDEX}} source="*uc-*prod*" "{{SWID}}" earliest=-24h latest=now
| sort -_time | head 50
```
Where `{{UC_INDEX}}` = `dlr_s0001477` (DLR) or `wdw_s0001479` (WDW).

**Conversation ID Trace (Rule 9):**
```spl
search index=wdpr-ecommerce ecs_cluster="{{ECS_CLUSTER}}" "{{SWID}}" "REQ_IN" earliest=-24h latest=now
| sort -_time | head 20
```

**Similar Resolved Incidents (Rule 11):**
```
ServiceNow query_incidents:
state=6^ORstate=7^assignment_group.name={{AG}}^short_descriptionLIKE{{KEYWORD}}^resolved_at>=javascript:gs.daysAgoStart(30)
Fields: number,short_description,close_notes,close_code,resolved_at
```

### 3.4 Access Limitations

⚠️ The agent does NOT have Splunk access to `wdpr_booking_service`. For Magic Key renewals/new sales (Rule 21) and ticket-to-pass upgrades (Rule 30):
1. Skip booking service queries (Steps 1-2)
2. Start at TMS (Step 3) and eGalaxy (Step 4)
3. Note in findings that order status could not be verified

---

## 4. AppDynamics Validation Paths

Use the AppDynamics MCP (`appdynamics-mcp`). Primary application: `prod_ecommerce_S0001479_cme-wdw_aws`.

### 4.1 Quick Health Check
**Tool:** `get_application_health`
**When:** First step for any performance or availability incident.
**Look for:** Health rule violations (CRITICAL vs WARNING), which rules are violated.

### 4.2 Error Rate Trend
**Tool:** `get_error_rate` (durationMinutes: 60, expand to 240 for longer incidents)
**When:** After health check shows error-related violations.
**Thresholds:** >5% on revenue path = P2 minimum. >25% = P1 candidate.

### 4.3 Specific Error Types
**Tool:** `get_errors` (durationMinutes: 60)
**When:** After confirming elevated error rate.
**Look for:** Top errors by count, new error types (regression), timeout/connection errors (infra vs code).

### 4.4 Transaction Snapshots
**Tool:** `get_snapshots` (durationMinutes: 30)
**When:** Need to trace specific slow or errored transactions.
**Look for:** Response time >5x baseline, error stack traces, bottleneck tier/backend.

### 4.5 Health Rule Violations History
**Tool:** `get_health_violations` (durationMinutes: 240)
**When:** Need to understand when the issue started.
**Look for:** First violation timestamp ≈ incident start. Recurring = chronic. Multiple rules = systemic.

### 4.6 Backend Dependencies
**Tool:** `get_backends`
**When:** Errors point to downstream failures.
**Look for:** Database backends with errors, HTTP backends returning 5xx, queue backends with high latency.

### 4.7 Metric Comparison (Before/After)
**Tool:** `compare_metrics`
**Params:** `metricPath: "Overall Application Performance|Average Response Time (ms)"`, `baselineOffsetMinutes: 1440`
**When:** Quantify degradation vs normal baseline.
**Thresholds:** Response time +100% = significant. Throughput -50% = potential outage.

### 4.8 Recent Deployments and Config Changes
**Tool:** `get_events` (eventTypes: "APPLICATION_DEPLOYMENT,APPLICATION_CONFIG_CHANGE,APP_SERVER_RESTART", durationMinutes: 240)
**When:** Checking if a deployment caused the incident.
**Look for:** Deployment within 30 min before incident = strong correlation. App restart = crash loop.

---

## 5. ServiceNow Incident Correlation

### 5.1 Find Related Incidents
**Tool:** `get_related_incidents`
**When:** Always — check if this is part of a larger outage.

### 5.2 Search by CI (Pattern Detection)
**Tool:** `query_incidents`
**Query:** `cmdb_ci.name={{CI}}^opened_at>=javascript:gs.hoursAgoStart(72)^stateNOT IN7,14`
**Rule:** 3+ incidents on same CI in 72 hours = recurring issue → consider Problem record.

### 5.3 Search Knowledge Base
**Tool:** `search_knowledge_base`
**When:** Before deep investigation — a known fix may already exist.

### 5.4 Check Recent Changes
**Tool:** `get_change_request` or query change_request table
**When:** Incident may be caused by a recent change. Look for CHGs implemented within 4 hours before incident start.

### 5.5 Get CI Details
**Tool:** `get_ci_details`
**When:** Need service topology and ownership for escalation.

### 5.6 Similar Resolved Incidents (Rule 11)
**Tool:** `query_incidents`
**Query:** `state=6^ORstate=7^assignment_group.name={{AG}}^short_descriptionLIKE{{KEYWORD}}^resolved_at>=javascript:gs.daysAgoStart(30)`
**When:** Always — leverage prior resolutions before deep investigation.

---

## 6. Commerce Business Rules — Known Non-Bugs

These patterns are expected behavior, NOT system issues. Recognizing them avoids unnecessary investigation.

### Order Statuses
| Status | Meaning | Action |
|--------|---------|--------|
| BOOKED | Order completed | Issue is downstream (fulfillment, email, reservation) |
| FAILED | Order failed | Investigate errorCode/errorDescription |
| PENDED + isGift=true | Gift pending fulfillment | Expected — do NOT escalate |
| PENDED + isGift=false | Order stuck | Investigate |

### Reservation Statuses (CME)
| Status | Meaning |
|--------|---------|
| NEW | Active reservation |
| CANCELED | Reservation was canceled — `modificationEligible: false` |
| NO_SHOW | Guest didn't scan in — `updatedUsr: "no-show-processor"` |

**Key rule:** CME Retrieval returns ALL reservations including CANCELED. A VID in the response does NOT mean it has an active reservation. Always check `reservationStatus`.

### Known Non-Bug Patterns

| Pattern | Why It's Not a Bug | Reference |
|---------|-------------------|-----------|
| DLR ticket-to-pass upgrade: reservations not transferred | CME has no auto-transfer mechanism. Guest must cancel old + create new. | INC28813634 |
| TMS-to-Keyring sync delay (question marks, missing Future Plans) | Transient — may self-resolve. Check if still active before recommending republish. | INC28786197 |
| Magic Key not linked after purchase | Passes never linked to guest account. Guest must link via app. | INC28819976 |
| Ticket "removed" after scanning | App moves used ticket to past section. Ticket still ACTIVE. | INC28784894 |
| TMS DLR 404 from parking ticket VIDs | Parking tickets not in TMS catalog. Filter out before assessing error rate. | INC27703488 |
| WDW AP concurrent reservation limit reached | System correct — verify count matches tier limit (Incredi=5, others=3). | INC28813696 |
| WDW ticket upgrade: reservations cancelled | Expected — `entitlement-cancel` with `SNAPP_VOIDED`. Guest must rebook. | Rule 35 |
| Magic Key renewal: duplicate showing in Memberships & Passes | TMS returns both original and renewed entitlement for same VID. | INC28873626 |
| Park reservation white screen | Login redirect issue, not CME. Clear cookies/try different browser. | INC28807187 |
| Reservation NO_SHOW on past date | no-show-processor auto-transitions after date passes without scan. | INC28837153 |
| DLR Magic Key LLMP: geniePlus=false | MK LLMP sold via Titus, not TMS/eGalaxy. Expected for MK VIDs. | Commerce Rules |
| LexVas: PLU fully booked | Park at capacity. salesEndDate ≠ availability. | INC28786899 |
| Disney Rewards card checkout error | Transient, guest-specific. Check if order eventually completed. | INC28785819 |


### Magic Key Renewal — eGalaxy Expiration Bug
After renewal, eGalaxy may NOT update `ValidatedExpirationDate` to the new period. TMS reads old date → shows EXPIRED → pass invisible in app/GSS. Fix: Galaxy team (`app-cadlr-galaxy`) must correct the date manually, then TMS republish. Reference: INC28784254.

### LLMP — eGalaxy Missing Package/PackageDetail (PRB0074406)
Known systemic issue. eGalaxy QueryTicketResponse missing `<Package>` / `<PackageDetail>` XML block → TMS has no supplements → Keyring incomplete → app doesn't show Lightning Lane. Root cause is always eGalaxy. Escalate to `app-cadlr-galaxy`. If tickets already redeemed → informational close, no fix needed.

### Ticket Upgrade — Inherited Voided Scans
New VID inherits voided scan history from old ticket. `ValidatedExpirationDate` stuck at old ticket's date. Fix: Galaxy team corrects the date. Route to `app-cadlr-galaxy`, NOT CME. Reference: INC28806827.

---

## 7. Auto-Action Rules

These patterns have pre-authorized actions:

### Rule 24: Booking Service MariaDB Purging — AUTO-CLOSE
**Match:** `web-global-salescart` + "Purging is failing" + "bookingservice-mariadb" + created >= 2026-04-02
**Action:** Add work note → Close INC → Set cause code (Software / Applied patch)
**Reference:** COM-173604

### Rule 25: Patching POST-CHECK UPDATE — ROUTE TO SRE
**Match:** "Patching error" + step 3 "POST-CHECK UPDATE" failure
**Action:** Add work note → Reassign to `ops-global-commerce-sre` → Set state to Assigned

### Rule 26: Security BOT — SKIP
**Match:** "unpatched vulnerabilities" OR "has not received a penetration test" OR "missing security scope"
**Action:** Skip entirely. BOT will auto-close.

---

## 8. Triage Decision Tree

```
START: New incident received
│
├─ Match auto-action keywords? (Rules 24, 25, 26)
│   ├─ MariaDB purging → AUTO-CLOSE
│   ├─ Patching POST-CHECK → ROUTE TO SRE
│   ├─ Security BOT → SKIP
│   └─ None → Continue
│
├─ Is this a park reservation issue?
│   ├─ YES → Skip purchase rules. Go to CME rules (12-15 DLR, 16-19 WDW)
│   └─ NO → Continue
│
├─ Is this a Magic Key renewal/new sale?
│   ├─ YES → Skip ordervas. Go to Rule 21 (booking service → TMS → eGalaxy)
│   └─ NO → Continue
│
├─ Is this a ticket/pass visibility issue?
│   ├─ DLR → Rule 7 (TMS DLR + eGalaxy)
│   ├─ WDW → Rule 6 (TMS WDW)
│   └─ NO → Continue
│
├─ Is this a purchase/order issue?
│   ├─ YES → Rule 1-5 based on order type
│   │   └─ Zero results? → Rule 8 (UC SPA) → Rule 9 (Conversation ID)
│   └─ NO → Continue
│
├─ Is this an LLMP issue? (DLR)
│   ├─ YES → Rule 23 (eGalaxy Package/PackageDetail check)
│   └─ NO → Continue
│
├─ Is this a penalty/no-show? (DLR)
│   ├─ YES → Rule 32 (eGalaxy admission + alternate ticket)
│   └─ NO → Continue
│
├─ Is this a WDW resort package / Duck Out error?
│   ├─ YES → Rule 36 (commerce cart + commerce UI)
│   └─ NO → Continue
│
├─ Check AppDynamics health (Section 4.1)
├─ Check related incidents (Section 5.1)
├─ Check similar resolved incidents (Section 5.6 / Rule 11)
├─ Search knowledge base (Section 5.3)
└─ Check recent changes (Section 5.4)
```

---

## 9. Escalation Routing

| Condition | Assignment Group |
|-----------|-----------------|
| eGalaxy ticket/pass issue (DLR) | `app-cadlr-galaxy` |
| CME reservation issue | `app-global-cme` |
| Payment decline confirmation | `app-flwdw-payment` |
| Infrastructure / patching | `ops-global-commerce-sre` |
| AIM Utility / resort operations | `ops-global-resortops` |
| Folio service issues | `app-global-l3sflio` |
| Cast entitlement linking | `prd-global-tktsrvcs` |
| Discontinued product config | `prd-global-DPRD Production` (Studio Nike) |
| Code fix needed | Create Jira defect, link to INC |
| Vendor dependency | Set state to Pending Vendor (state=12), add work note |
| Same CI, 3+ incidents in 72h | Create Problem record (PRB) |
| P1 confirmed | Page on-call via `get_on_call` |
| P2 not resolved in 2 hours | Escalate to P1 |

---

## 10. Flow → Backend Service Mapping

| Flow | Backend | Investigation Rule |
|------|---------|-------------------|
| Consumer Ticket Purchase | UC (SPA → API → Order Vas → PEOS → DTI) | Rules 1, 8, 9 |
| Consumer Ticket Mods | UC (SPA → API → Order Vas) | Rule 2 |
| Lightning Lane / Genie+ DLR | UC DLR | Rule 23 (LLMP) |
| Trade Ticket Purchase/Mods | EC Booking Service | Rules 1, 2 |
| Ticket-to-Pass Upgrade | EC Booking Service | Rule 3 / Rule 30 |
| Consumer WDW AP New Sales | EC Booking Service | Rule 3 / Rule 21 |
| Consumer DLR MK New Sales | EC Booking Service | Rule 21 |
| Consumer AP Renewals | EC Booking Service | Rule 21 |
| Consumer AP Upgrades WDW | UC | Rule 3 |
| Consumer MK-to-MK Upgrades | UC | Rule 3 |
| Vacation Offers (Packages) | EC Booking Service (DTA) / UC (Consumer) | Rule 4 |
| Room Only | EC Booking Service (DTA) / UC (Consumer) | Rule 5 |
| Theme Park Reservations | CME | Rules 12-15 (DLR), 16-19 (WDW) |
| WDW MyPlans / Tickets & Passes | TMS / EVAS | Rule 6 |
| DLR Ticket/Pass Visibility | TMS / EVAS | Rule 7 |
| Sellable Products | Lexvas / Product Service | Rule 27 |

---

## 11. Key Identifiers

| Identifier | Format | Where to Find |
|------------|--------|---------------|
| SWID | `{XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX}` | INC description, wrap bare GUID in `{}` |
| VID | Numeric (e.g., `312974200523075392586427`) | INC description, eGalaxy, TMS |
| Conversation ID | UUID or prefixed string | Splunk logs (`x-conversation-id`, `ConvoId`) |
| Confirmation Number (confId) | Numeric (e.g., `085579549308113408`) | CME Reservation response |
| PayloadId | Alphanumeric | Booking service Orderanalyticslogger |
| Payment Session ID | Hex string (e.g., `500bd08021dd4cb6...`) | UC SPA payment sheet init logs |
| TCOD | Numeric (e.g., `24188508042600002`) | WDW ticket code, CME reservation |
| PLU | Alphanumeric (e.g., `128182PAH`, `81021R`) | eGalaxy, product catalog |
| PERNR | Numeric (e.g., `00909749`) | Cast entitlement, HR system |

---

## 12. Upstream Dependencies (Not L1-Supported)

These external services can impact our services but are NOT supported by L1:

| Dependency | Flows Affected |
|------------|----------------|
| Galaxy (eGalaxy) | TMS DLR, CME DLR, UC PEOS DLR |
| GAM | TMS WDW, CME WDW, UC WDW |
| Snapp / EAPI | CME WDW |
| Accommodation Service / Package Order Service | Booking Service (Vacation Offers) |
| DTI | UC PEOS (DLR + WDW), Booking Service (AP Sales) |
| ADM Quote Service | EVAS Mods |

When investigating, check if the root cause is in one of these dependencies before escalating within our services.

---

## 13. Common AppDynamics Applications

| App Name | BAPP | Domain |
|----------|------|--------|
| `prod_ecommerce_S0001479_cme-wdw_aws` | S0001479 | CME WDW Commerce |

Use `list_applications` to discover additional applications when investigating services outside CME.

---

## 14. Seasonal Considerations

- **Spring Break** (March-April): Higher volume, more failures expected due to load
- **Summer** (June-August): Peak season for both parks
- **Halloween/Holiday** (Sept-Dec): Special event tickets have separate rules
- **Blockout periods**: AP/Magic Key blockout dates cause expected FAILED reservations — NOT a system error
