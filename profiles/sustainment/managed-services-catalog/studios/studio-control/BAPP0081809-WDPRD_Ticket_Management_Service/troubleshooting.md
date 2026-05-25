# Troubleshooting — TMS WDW

## Query Templates

### By VID
```spl
search index=wdpr-ecommerce ecs_cluster="wdw-ecommerce-S0001479-usw2*" ecs_task_definition="tmsint-svc*" OR ecs_task_definition="*tms*" "{VID}" earliest=-7d | head 20
```

### By SWID
```spl
search index=wdpr-ecommerce ecs_cluster="wdw-ecommerce-S0001479-usw2*" ecs_task_definition="*tms*" "{SWID}" earliest=-7d | head 30
```

### Conversation IDs by SWID (for error correlation)
```spl
search index=wdpr-ecommerce ecs_cluster="wdw-ecommerce-S0001479-usw2*" ecs_task_definition="*tms*" "{SWID}" earliest=-7d | rex "ConvoId=(?<convo_id>[^\s]+)" | stats count by convo_id | sort -count
```

### Errors by ConvoIds
```spl
search index=wdpr-ecommerce ecs_cluster="wdw-ecommerce-S0001479-usw2*" ecs_task_definition="*tms*" ("{CONVO_ID1}" OR "{CONVO_ID2}" OR "{CONVO_ID3}") "ERROR" earliest=-7d | table _time, _raw | sort -_time | head 20
```

---

## Issue: 404 "No eligible tickets found" masking upstream ERROR

**Symptoms:** TMS WDW returns 404 but actual root cause is an ERROR-level exception thrown BEFORE the 404 response.

**Root Cause:** GAM returned duplicate friend XIDs → `SORServiceImpl` "Duplicate key" error.

**Resolution:**
1. Search TMS by SWID → extract conversation IDs
2. Search by those conversation IDs with ERROR filter
3. If `SORServiceImpl` "Duplicate key" error → route to `app-global-gam` (CI: WDW GAM Affiliations/Admissions/F&F)

Ref: INC28937912

---

## Escalation Decision Tree

- If 404 with upstream ERROR containing "Duplicate key" → route to `app-global-gam`
- If ticket not visible but GAM shows active → TMS sync issue
- If GAM data is corrupt → route to `app-global-gam` for deduplication


---

## External Dependencies — Quick Reference

### GAM WDW
| Field | Value |
|-------|-------|
| AG | `app-global-gam` |
| CI | WDW GAM - Affiliations/Admissions/F&F |

**Known Issue:** GAM may return duplicate friend XIDs → causes TMS `SORServiceImpl` "Duplicate key" error → TMS returns 404 masking the real issue. Route to `app-global-gam` for deduplication. Ref: INC28937912

### GSS (Cast Tool)
| Field | Value |
|-------|-------|
| URL | gssmain.wdprapps.disney.com/#/search |
| Index | `wdpr-dce` |

**Key Query:**
```spl
search index=wdpr-dce "gss-vas" "{VID}" earliest=-7d | head 20
```

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
| GAM | app-global-gam | Profile/account. If failing → impacts TMS WDW |
| MIRS | prd-global-tktsrvcs | TMS MIRS link/unlink |
| Studio Nike | prd-global-DPRD Production | Lexicon config/cache |
