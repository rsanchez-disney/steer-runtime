# Troubleshooting — DLP API DGE.BOOK DINE

## Common Issues

### Issue: DRS errors & high response times

**Symptoms:** High 500 error rate in Splunk. AppDynamics showing DRS high response times. Guests cannot book/cancel reservations.

**Root Cause:** DRS system degradation or QSLWebBooking.asmx endpoint down.

**Resolution:** Check AppDynamics `PROD_DLP_PAAP_SALES-BOOKDINE`. Verify DRS endpoint availability. Escalate to POS team (app-frdlp-support-pos / Guillaume Dubuisson). Consider DFM via ITOC if guest impact is significant.

---

### Issue: QSLWebBooking.asmx endpoint down

**Symptoms:** All booking operations failing. DRS completely unavailable.

**Root Cause:** DRS infrastructure issue.

**Resolution:** Escalate immediately to app-frdlp-support-pos. Contact ITOC for DFM if needed.

---

### Issue: High availability discrepancy

**Symptoms:** Availability shown in app doesn't match actual restaurant availability.

**Root Cause:** DRS inventory sync issue or Bio Schedules data mismatch.

**Resolution:** Check DRS inventory. Verify Bio Schedules data for the restaurant. Check if restaurant is under refurbishment.

---

### Issue: "Object reference not set to an instance of an object" errors

**Symptoms:** Errors appearing in logs/Splunk.

**Root Cause:** **EXPECTED behavior** — triggered when there's no availability. Common error that can be ignored.

**Resolution:** No action needed. This is normal when no slots are available.

---

### Issue: Book Dine Publisher not sending emails

**Symptoms:** Guests not receiving reservation reminder emails.

**Root Cause:** Publisher batch failure, Notification Service down, or Sparkpost/Airship issue.

**Resolution:** Check Splunk `wdpr-dlp-is-sales-drs-book-dine-publisher`. Verify Notification Service health. Check Rundeck for batch execution status.

---

## Escalation Decision Tree

- If DRS issue → app-frdlp-support-pos (Guillaume Dubuisson)
- If Bio Schedules issue → Beast team (BIO Services BAPP0215510)
- If Notification/email issue → check Notification Service, then Sparkpost/Airship
- If ECS/infrastructure → Cloud OPS
- If application logic → Cruz Ramirez Food DGE (app-frdlp-food-dge)
- If guest impact significant → contact ITOC for DFM

## INC Handling

- **P3:** Open incident with app-frdlp-food-dge + engage Mobile Oncall Team
- **P4:** Open incident with app-frdlp-food-dge
- **AppDynamics agent issue:** Correct installation with Squad Cloud Digital. If persists, contact app-frdlp-mobile-apps

## Known Quirks

- "Object reference not set" errors are EXPECTED (no availability) — ignore them
- PPD (Prince or Princess) shares same backend — BookDine incidents impact PPD
- DRS horizon period: 365 days max
- Table held only 15 minutes on the day
