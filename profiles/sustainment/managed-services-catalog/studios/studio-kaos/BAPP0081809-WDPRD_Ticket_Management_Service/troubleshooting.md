# Troubleshooting — TMS DLR

## Query Templates

### By VID
```spl
search index=wdpr-ecommerce ecs_cluster="dlr-ecommerce-S0001477-usw2*" ecs_task_definition="tmsint-svc*" OR ecs_task_definition="tms-svc*" "{VID}" earliest=-7d | head 20
```

### By SWID
```spl
search index=wdpr-ecommerce ecs_cluster="dlr-ecommerce-S0001477-usw2*" ecs_task_definition="*tms*" "{SWID}" earliest=-7d | head 30
```

### Publish to Keyring
```spl
search index=wdpr-ecommerce ecs_cluster="dlr-ecommerce-S0001477-usw2*" ecs_task_definition="*tms*" "{VID}" "publish" OR "keyring" earliest=-7d | sort -_time | head 20
```

---

## Issue: TMS returns ZERO for SWID but eGalaxy shows Status=0

**Symptoms:** Ticket not visible in app, question marks under guest names, missing Future Plans.

**Root Cause:** TMS-to-Keyring sync delay. Order BOOKED, DTI fulfilled, eGalaxy active, but TMS hasn't synced.

**Resolution:**
- If no longer reproducible → close as WAD (transient sync delay resolved itself)
- If still active → recommend TMS-to-Keyring republish for the VID

---

## Issue: `primaryGuestLinked=false`

**Symptoms:** Ticket exists in eGalaxy but not visible to guest.

**Root Cause:** Ticket never linked — guest must manually link via app.

**Resolution:** Guide guest to link ticket in app.

---

## Issue: `primaryGuestLinked=false` AFTER online renewal

**Symptoms:** Renewed pass not linked to guest profile.

**Root Cause:** System failure during renewal linking step.

**Resolution:** Route to `app-cadlr-galaxy`. Ref: INC28969668.

---

## Issue: DLR Self-Admit Not Displaying

**Symptoms:** CM's Self-Admit not showing on DLR side. MEP clean-up attempted but did not resolve.

**Investigation Steps:**

### Step 1: Verify PERNR in eGalaxy (Source of Record)

```spl
search index=wdpr_egalaxy_dlr "QueryTicketResponse" "{PERNR}" earliest=-7d | head 20
```

Validate:
- `<Status>0</Status>` (0=Active)
- `<ValidatedExpirationDate>` > today
- `<ValidUntil>` > today
- `<RemainingUse>Unlimited</RemainingUse>`

If Status???0 ??? pass voided/exchanged/blocked. NOT a TMS issue. Route to `app-cadlr-galaxy`.

### Step 2: Verify PERNR in TMS (Display Layer)

```spl
search index=wdpr-ecommerce ecs_cluster="dlr-ecommerce-S0001477-usw2*" ecs_task_definition="tms-service-svc*" "LoggingOutInterceptor" "Outbound Message" "{PERNR}" earliest=-7d | head 20
```

In the `LoggingOutInterceptor] Outbound Message:` payload, find `"visualId": "{PERNR}"` and validate:
1. `"status": "ACTIVE"` (NOT VOIDED/FILTERED/EXPIRED)
2. `"endDateTime"` in the future
3. `"remainingUse"` > 0 or 999
4. `"primaryGuestLinked": true` with SWID populated

**Decision:**
- eGalaxy Status=0 AND TMS ACTIVE with all 4 met ??? sync/display issue. Recommend TMS refresh via GSS.
- eGalaxy Status=0 BUT TMS VOIDED/FILTERED ??? TMS-to-eGalaxy sync issue. Recommend data refresh.
- eGalaxy Status???0 ??? pass voided at source. Route to `app-cadlr-galaxy`.
- No SA record exists (only MEP) ??? provisioning gap. Route to `app-cadlr-galaxy` to issue new SA record (SKU 40341).

**Refs:** INC28962976, INC24373658, INC24238966, INC24239604, INC29159390

---

## Issue: 404 for parking VIDs (PLU 126834, 126850, 78366)

**Symptoms:** TMS returns 404 for parking ticket VIDs.

**Root Cause:** Expected noise — eGalaxy sends parking usage events → Keyring/GAM calls TMS → parking tickets not in TMS catalog → 404.

**Resolution:** Do NOT escalate. Filter out before assessing error rate. Ref: INC27703488.

---

## Issue: `geniePlus: false` on MK VID

**Symptoms:** MK pass shows geniePlus as false.

**Root Cause:** Expected — MK LLMP is purchased day-of through Titus, not TMS/Galaxy.

**Resolution:** WAD. Not a bug.

---

## Escalation Decision Tree

- If TMS returns ZERO but eGalaxy Status=0 → sync delay, wait or republish
- If `primaryGuestLinked=false` after purchase → system failure, route to `app-cadlr-galaxy`
- If 404 on parking PLUs → expected noise, ignore
- If ticket Status≠0 in eGalaxy → ticket is exchanged/voided/blocked, not a TMS issue


---

## External Dependencies — Quick Reference

### eGalaxy DLR
| Field | Value |
|-------|-------|
| AG | `app-cadlr-galaxy` |
| CI | DLR Ticketing Galaxy (Gateway) |
| Index | `wdpr_egalaxy_dlr` |

**Key Queries:**
```spl
search index=wdpr_egalaxy_dlr "QueryTicketResponse" "{VID}" earliest=-7d
```
```spl
search index=wdpr_egalaxy_dlr "{VID}" "UsageRecords" "Admission" earliest=-7d | head 20
```

**SoCal MK Zip Validation Query:**
```spl
search index=wdpr_egalaxy_dlr "QueryTicketResponse" "{VID}" earliest=-7d | search "ZipCode"
```
> For SoCal MK eligibility, verify the zip code in `QueryTicketResponse` is in range **90000???93599**. If outside this range ??? guest is not eligible for SoCal MK renewal. Route zip discrepancies to `app-cadlr-galaxy`.

**Status Codes:** 0=Active, 4=Exchanged, 5=Voided, 8=Blocked

**Business Rules:**
- ValidatedExpirationDate propagation delay: 24-48h after first admission
- Event count: divide by 2 (events ingested twice)
- Ignore 3AM spikes (log backup replay)
- Date format: `earliest=MM/DD/YYYY:HH:MM:SS` (NOT ISO 8601)

### GSS (Cast Tool)
| Field | Value |
|-------|-------|
| URL | gssmain.wdprapps.disney.com/#/search |
| Index | `wdpr-dce` |

**Key Query:**
```spl
search index=wdpr-dce "gss-vas" "{VID}" earliest=-7d | head 20
```
Used to verify ticket state when TMS/EVAS show discrepancies. Cast can force TMS refresh via GSS.

---

## Routing

**Assignment Group:** `web-global-salestickets`  
**sys_id:** cce9aa2e37970ec09194341643990e5e  
**CI:** WDPRD Ticket Management Service  
**Description:** Standalone Tickets. Ticket config pages, Lexvas, Claiming DLR. Checkout/Renewal → web-global-salescart  
**L2/L3:** DLR: Studio Kaos. WDW: Studio Control

### Quick Route-Away Patterns

| Keywords | Action | AG | CI |
|----------|--------|-----|-----|
| "unable to download photos", "download photopass", "download photos from the app" | Out of ticketing scope — route immediately | app-flwdw-dpi | DPI Magento e-Commerce Platform - DLR |
| "AIM Utility" + resort keywords | See auto-triage Rule 29 | ops-global-resortops | — |
| Old/discontinued product showing in purchase flow | Lexicon config issue | prd-global-DPRD Production | — |

### Key Escalation Groups

| Team | AG | When to escalate |
|------|-----|-----------------|
| eGalaxy DLR | app-cadlr-galaxy | If failing: TMS DLR, CME DLR, DTI, Pended Orders |
| MIRS | prd-global-tktsrvcs | TMS MIRS link/unlink |
| DLR Keyring | app-global-keyring | TMS DLR entitlement events |
| Studio Nike | prd-global-DPRD Production | Lexicon config/cache |
