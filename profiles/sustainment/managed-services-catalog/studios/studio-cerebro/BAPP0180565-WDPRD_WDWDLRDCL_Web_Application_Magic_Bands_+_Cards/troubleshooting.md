# Troubleshooting — WDPRD WDWDLRDCL Web Application Magic Bands + Cards

## Common Issues

### Issue: VAS Duplicate Key cascading

**Symptoms:** MB+C fails to load band data. Errors in VAS logs showing "Duplicate key". All band-related features broken.

**Root Cause:** VAS has the Duplicate Key Exception, which cascades to MB+C since all band data comes from VAS.

**Resolution:**
1. Check VAS logs: `index=wdpr-gam "ids.app"="*profile-view-assembly-service" "Duplicate key" | table _time, log.exception`
2. See VAS runbook for resolution
3. MB+C will recover automatically once VAS is fixed

---

### Issue: MB+ Booking Flow Access Error (INC28751650)

**Symptoms:** Guest unable to access booking flow for MagicBand/DisneyBand.

**Root Cause:** Booking window restrictions, xBMS order issues, or entitlement problems.

**Resolution:**
1. Check booking window: 45-11 days before arrival for DisneyBand, 5 days for MagicBand
2. Verify xBMS orders
3. Check entitlement in Axis (Force Sync)
4. If within eligible window: Confirm guests linked in GSS. Confirm xBMS link ID matches in Vincent.
5. Set INC to Pending Validation → reassign to Product Team (Melanie Bosco)

---

### Issue: No Get Started button — no billing address (PRB0066891)

**Symptoms:** Guest does not see the "Get Started" button to begin band customization.

**Root Cause:** Guest has no billing address on file.

**Resolution:** Workaround: add billing address in Dreams/XBMS/Hotel Experience.

---

### Issue: Analytics 404 not found

**Symptoms:** Analytics file returning 404 error.

**Root Cause:** Analytics file not loaded on S3.

**Resolution:** Check if file is loaded on S3. If not, rebuild and deploy the SPA.

---

## MB/DB Incident Triage Guide (from XBMS)

Due to VAS logging limitations, use the XBMS tool to investigate MB/DB incidents.

### Scenario 1: Verify Order Status in XBMS
Look up the order in XBMS. If status is Sent to Fulfillment, Acknowledged by Fulfillment, or Shipped → Guest successfully submitted. Attach screenshot and close INC.

### Scenario 2: Verify Guest Eligibility
- MagicBand (MB): Order created at booking. Guest cannot complete starting 5 days before arrival.
- DisneyBand (DB): Order created at booking. Guest cannot complete starting 10 days before arrival.
- If within eligible window: Confirm guests linked in GSS. Confirm xBMS link ID matches in Vincent. Set INC to Pending Validation → reassign to Product Team (Melanie Bosco).

### Scenario 3: DCL Orders
If DCL order not in XBMS → assign to app-global-magicband

### Scenario 4: Order appears "completed" in logs
Verify OrderDataComplete = True in VAS logs. Close: "No issues with this order. Problem is delayed sync with backend systems."

### Scenario 5: Fulfill on Site status
Order window closed. Close: "Order window closed. Band available for pickup at Front Desk."

### How to Review xBMS link in Vincent
Search for SWID in Vincent → Go to Guest Data → Guest Identifiers → look for xbms-link-id

### How to Review xBMS link in XBMS
Go to Fulfillment menu → Guest Details → Enter reservation number → Select Guest ID → View Guest Details → View transactional Guest ID

---

## Escalation Decision Tree

- If VAS Duplicate Key cascading → check VAS health first, escalate to Martin Uribe
- If booking flow access error → check booking window and xBMS, escalate to Melanie Bosco (Product Team)
- If no Get Started button → add billing address (Dreams/XBMS/Hotel Experience)
- If DCL orders not in XBMS → assign to app-global-magicband
- If widespread outage → P1, escalate to Andrew Southwick (Tech Lead)
- If Akamai 502s → escalate to ops-global-parks-se-guestexp
- For xBMS/Fulfillment issues → Will McKnight

## Known Quirks

- Highly dependent on VAS — if VAS has Duplicate Key issue, MB+C also fails
- Booking windows differ: MB = 5 days before arrival cutoff, DB = 10 days (45-11 days window)
- Alert thresholds: Error > 3% (East/West) | ART East > 5s | West > 6s | CPU > 30% | Memory > 50%
- Teams Group Chat for triage: MB-Triage-Latest-Stage-Load-Prod
- Terraform var files use "B000180565" (extra zero) for ALB workspaces vs "B0180565" for Fargate
- Disney POC: Glenn Raposo | xBMS/Fulfillment POC: Will McKnight
