# Troubleshooting — DLP DGE API.Mobile Order

## Common Issues

### Issue: High response times from Agilysys

**Symptoms:** Slow page loads in the food ordering web views, timeouts on menu/timeslot retrieval.

**Root Cause:** Agilysys OnDemand backend performance degradation (external component, not owned by DLP).

**Resolution:** Escalate to Agilysys team (app-frdlp-support-pos). Content issues in Agilysys are out of scope for Beast.

---

### Issue: Payment failures

**Symptoms:** Guests cannot complete payment, errors on /payment-confirmation/ endpoint.

**Root Cause:** Outage or degradation in MPG or WorldPay.

**Resolution:** Escalate to MPG team (app-frdlp-spid-monetique). Check Splunk dashboard DLP_MOBILE_ORDER_FULFFILMENT_ISSUES_AND_MPG-PAYMENTS.

---

### Issue: Cache expiration during checkout

**Symptoms:** Guest gets an error after spending more than 20 minutes in the ordering flow.

**Root Cause:** Cache TTL is 20 minutes. If the guest takes longer than 20 min to complete purchase, the session data expires.

**Resolution:** Guest must restart the order. This is by design (business rule).

---

### Issue: "I am here" CTA not triggering kitchen preparation

**Symptoms:** Guest clicks "I am here" but order preparation doesn't start.

**Root Cause:** Communication issue between provider and Agilysys kitchen system.

**Resolution:** Check logs for the I-am-here endpoint. Counter value from Agilysys format: "Counter [Number] [Restaurant]" — verify parsing is correct.

---

## Escalation Decision Tree

- If payment issue → escalate to MPG (app-frdlp-spid-monetique)
- If Agilysys web views / menu / timeslot issue → escalate to Agilysys (app-frdlp-support-pos)
- If mobile app UI issue → escalate to Mobile APP (app-frdlp-mobile-apps)
- If infrastructure / ECS / deployment issue → escalate to Cloud OPS (ops-frdlp-CloudOps)
- If reverse proxy / IG Web Server issue → escalate to Flex SRE (ops-global-Flex SRE)
- If backend logic / RDJ flows issue → escalate to Software Engineering (app-frdlp-software-engineering)

## Known Quirks

- Casa de Coco restaurant has no timeslots (shows null in logs). Guests have a 4-hour pickup window instead.
- The OneID screen appears before payment (before guest form), NOT at the start of the journey.
- "I am here" CTA now appears in guest profile wallet instead of confirmation email (changed in V12).
- DFM can disable Click & Collect entirely or individual restaurants.
