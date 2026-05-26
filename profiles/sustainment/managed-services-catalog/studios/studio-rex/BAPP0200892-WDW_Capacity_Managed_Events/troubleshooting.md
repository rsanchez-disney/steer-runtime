# Troubleshooting — WDW Capacity Managed Events

## Common Issues

### Issue: No Eligibility logs for SWID/VID

**Symptoms:** No logs found in Splunk for the guest's SWID or VID in cme-elig task definition.

**Root Cause:** Request never reached CME backend.

**Resolution:**
1. Investigate upstream: SPA, Akamai KSD (WAF rate-limiting), login redirect
2. Check `wdpr_wdw_com_shared_api` for "cme-res-spa" errors

---

### Issue: Eligibility 200 but no downstream convoId match

**Symptoms:** Eligibility returned successfully but no Availability or Reservation calls found with same conversationId.

**Root Cause:** Guest abandoned or UI failed after eligibility check.

**Resolution:** Not a backend issue. Close if guest confirms they abandoned.

---

### Issue: `cancellationEligible: false`

**Symptoms:** Guest reports they cannot cancel reservation.

**Root Cause:** UI correctly blocked cancel client-side based on eligibility response.

**Resolution:** Not a backend bug. Explain to guest that cancellation is not available for their reservation type/state.

---

### Issue: `unreservableCode: AP_SUSPENDED`

**Symptoms:** Guest cannot make reservations, eligibility returns AP_SUSPENDED.

**Root Cause:** Pass is in penalty state.

**Resolution:** See TMS WDW penalty troubleshooting. Route to appropriate WDW support group if penalty needs removal.

---

### Issue: All dates show `PARK_FULL`

**Symptoms:** No available dates for guest's inventory bucket.

**Root Cause:** Park sold out for that inventory bucket — expected behavior.

**Resolution:** WAD. Guest must try different dates or parks.

---

### Issue: All dates show `BLOCKOUT`

**Symptoms:** Every date returns BLOCKOUT unreservable reason.

**Root Cause:** Pass type blocked for those dates.

**Resolution:** Check WDW AP tier blockout calendar. WAD for blocked pass types.

---

### Issue: `MAX_RESERVATIONS_REACHED` on all dates

**Symptoms:** Guest hit concurrent reservation limit.

**Root Cause:** Guest has maximum allowed concurrent reservations.

**Resolution:** Guest must cancel an existing reservation first. WDW AP limits:
- Incredi-Pass: 5
- Sorcerer Pass: 3
- Pirate Pass: 3
- Pixie Dust Pass: 3

---

### Issue: Known benign error — MariaDBAvailabilityDAO

**Symptoms:** `Error occurred while retrieving rule setting by rule constraint IDs. Incorrect result size: expected 1, actual 0`

**Root Cause:** Known benign error in MariaDBAvailabilityDAO.

**Resolution:** Does NOT impact guest availability or reservation flow. Do NOT escalate.

---

### Issue: PUT returns 400 `INCOMPLETE_ELIGIBILITY_DATA` (1015)

**Symptoms:** Same-day modify returns 400 error.

**Root Cause:** Other party members already redeemed (scanned into park).

**Resolution:** WAD — cannot modify reservation after partial party redemption.

---

### Issue: `cancellationReason: SNAPP_VOIDED`

**Symptoms:** Reservations cancelled with SNAPP_VOIDED reason.

**Root Cause:** WDW upgrade voided old ticket → reservations cancelled automatically.

**Resolution:** Expected behavior during ticket upgrade flow.

---

### Issue: `reservationStatus: NO_SHOW` + `updatedUsr: no-show-processor`

**Symptoms:** Reservation shows NO_SHOW status.

**Root Cause:** Auto-transitioned — guest didn't scan into park after date passed.

**Resolution:**
- If guest was NOT at park → expected
- If guest WAS at park with different ticket → penalty investigation needed

---

### Issue: VIDs in Retrieval ≠ VIDs in original POST

**Symptoms:** Different VIDs appear in retrieval vs original reservation.

**Root Cause:** Ticket upgrade occurred — VID was exchanged.

**Resolution:** Follow ticket-upgrade-wdw flow.

---

### Issue: White screen / login redirect loop (RES SPA)

**Symptoms:** Guest sees white screen or gets stuck in login loop.

**Root Cause:** Authentication issue — not CME.

**Resolution:** Clear cookies, try Chrome, try app, try incognito. Do NOT escalate to CME backend. Ref: INC28807187.

---

### Issue: DAS Chat overlay blocking page

**Symptoms:** DAS chat overlay covers reservation UI.

**Root Cause:** Frontend UI issue.

**Resolution:** Route to `app-flwdw-ccn-agent-assistsup`. Refs: INC28651391, INC28807731.

---

## Escalation Decision Tree

- If no logs in any CME component → upstream issue (Akamai, login, SPA)
- If Eligibility returns error → check entitlement source (GAM WDW)
- If Availability all PARK_FULL/BLOCKOUT → WAD, close
- If Reservation 500 → escalate to `app-global-cme`
- If RES SPA errors but backend healthy → frontend/auth issue

## Known Quirks

- MariaDBAvailabilityDAO "expected 1, actual 0" error is benign — do NOT escalate
- CME Mobile is a web view, not native — backend health = mobile health
- `SNAPP_VOIDED` cancellations are expected during ticket upgrade flows

## Query Templates

### Eligibility — By SWID (WDW)
```spl
search index=wdpr-ecommerce ecs_cluster="wdw-ecommerce-S00892-use1*" ecs_task_definition="cme-elig*" "{SWID}" earliest=-14d | sort -_time | head 30 | table _time, _raw
```

### Eligibility — By VID (WDW)
```spl
search index=wdpr-ecommerce ecs_cluster="wdw-ecommerce-S00892-use1*" ecs_task_definition="cme-elig*" "{VID}" earliest=-14d | sort -_time | head 30 | table _time, _raw
```

### Availability — By ConversationId (WDW)
```spl
search index=wdpr-ecommerce ecs_cluster="wdw-ecommerce-S0001479-use1-prd" ecs_task_definition="cme-avail*" "{CONVERSATION_ID}" earliest=-7d | sort -_time | head 30
```

### Reservation — By ConversationId (WDW)
```spl
search index=wdpr-ecommerce ecs_cluster="wdw-ecommerce-S0001479-use1-prd" ecs_task_definition="cme-res*" "{CONVERSATION_ID}" earliest=-7d | sort -_time | head 30
```

### Reservation — By SWID (WDW)
```spl
search index=wdpr-ecommerce ecs_cluster="wdw-ecommerce-S0001479-use1-prd" ecs_task_definition="cme-res*" "{SWID}" earliest=-7d | head 10
```

### Reservation — Entitlement Upgrade by VID
```spl
search index=wdpr-ecommerce "entitlement-upgrade" ("{VID1}" OR "{VID2}" OR "{VID3}") earliest=-14d | head 10
```

### Reservation — Entitlement Cancel by Old VID (WDW)
```spl
search index=wdpr_wdw_cme "entitlement-cancel" "{OLD_VID}" earliest=-14d | head 10
```

### Retrieval — By ConversationId (WDW)
```spl
search index=wdpr-ecommerce ecs_cluster="wdw-ecommerce-S0001479-use1-prd" ecs_task_definition="cme-rtrvl*" "{CONVERSATION_ID}" earliest=-7d | sort -_time | head 30
```

### Retrieval — By SWID (WDW)
```spl
search index=wdpr-ecommerce ecs_cluster="wdw-ecommerce-S0001479-use1-prd" ecs_task_definition="cme-rtrvl*" "{SWID}" earliest=-7d | sort -_time | head 30
```

### Retrieval — By Confirmation ID
```spl
search index=wdpr-ecommerce ecs_task_definition="cme-rtrvl*" "RESP_OUT" "{CONF_ID}" earliest=-7d | head 5
```

### RES SPA — By SWID (WDW)
```spl
search index=wdpr_wdw_com_shared_api "cme-res-spa" "{SWID}" earliest=-7d | head 20
```
