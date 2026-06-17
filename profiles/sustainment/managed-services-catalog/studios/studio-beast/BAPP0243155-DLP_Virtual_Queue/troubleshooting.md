# Troubleshooting — DLP Virtual Queue

## Common Issues

### Issue: Lineberty TLS certificate failure — /notifications endpoint rejected

**Symptoms:** Lineberty fails to communicate with VQ /notifications endpoint. Guests don't receive VQ notifications.

**Root Cause:** Invalid TLS certificate. Request rejected by AWS API Gateway.

**Resolution:** Check API Gateway logs for TLS rejection. Verify Lineberty certificate validity. Escalate to Lineberty support (support@lineberty.com / +33 09.73.72.33.06) for certificate renewal.

---

### Issue: VQ Provider service down

**Symptoms:** Guests cannot access HTC activity. All VQ operations failing.

**Root Cause:** ECS service `virtual-queue-provider-prod-live` down or degraded.

**Resolution:** Check health endpoint. Verify ECS service in cluster `dlp-apps-S0001481-euw1-prd`. Check Splunk "DLP Virtual Queue - Command Center" and AppDynamics dashboard.

---

### Issue: Guest cannot join VQ — eligibility check failing

**Symptoms:** Guest gets error when trying to book a wave. Eligibility check returns false.

**Root Cause:** Ticket not inPark, ticket not linked, or max 5 reservations reached.

**Resolution:** Verify guest's ticket status (must be inPark). Check if ticket is linked to account. Verify daily reservation count (max 5). Check Tickets Linking Service health.

---

### Issue: Booking errors

**Symptoms:** Booking creation failing. Errors in Splunk BOOKING_ERRORS dashboard.

**Root Cause:** Lineberty API issue, pass combinability check failure, or wave full.

**Resolution:** Check Splunk `wdpr-dlp-is-operations-virtual-queue-provider_BOOKING_ERRORS`. Verify Lineberty API availability. Check if wave has available slots.

---

## Escalation Decision Tree

- If Lineberty issue (TLS, API, passes) → Lineberty support (support@lineberty.com / +33 09.73.72.33.06)
- If Airship notification issue → Airship team
- If Tickets Linking issue → Luigi Squad (BAPP0203964)
- If Guest Extended Profile issue → Luigi Squad (BAPP0177719)
- If ECS/infrastructure → Cloud OPS
- If application logic → Storm Squad (app-frdlp-attraction-dge)

## Known Quirks

- Impact limited to HTC activity only
- Known TLS certificate issue with Lineberty → /notifications endpoint
- Guest must be physically in park (inPark status required)
- Max 5 reservations per day per ticket
