# Troubleshooting — DLP DGE API.ORION services

## Common Issues

### Issue: PEA Attraction Provider outage — guests cannot buy DPA

**Symptoms:** DPA purchase flow completely unavailable. Guests see errors when trying to buy passes.

**Root Cause:** PEA Attraction Provider V2 service down or degraded.

**Resolution:** Check health endpoint. Verify ECS service `pea-attraction-provider-v2` in cluster `dlp-apps-S0001481-euw1-prd`. Check Splunk "PEA V2 Technical Dashboard" and AppDynamics `PROD_DLP_ORION_BAPP0218964`. Consider engaging ITOC for DFM if revenue impact.

---

### Issue: Payment failures (PSP/Worldpay)

**Symptoms:** Guests cannot complete DPA purchase. Payment step failing.

**Root Cause:** PSP Payment Methods Provider issue or Worldpay downstream failure.

**Resolution:** Check Splunk `DLP_PSP_WORLDPAY_PAYMENT_ISSUES`. Verify PSP service health. If Worldpay issue, escalate to Support.Flavien.Goirand@Worldpay.com (copy Pierre Andre Marty and Lorry Moreau).

---

### Issue: Push notifications not delivered (expiring timeslot, autorecovery)

**Symptoms:** Guests not receiving DPA timeslot expiry or autorecovery notifications.

**Root Cause:** Push Notification Publisher service down or Airship delivery issue.

**Resolution:** Check Splunk `wdpr-dlp-is-guest-push-notification-publisher`. Verify ECS service health. If Airship issue, contact Adolo Malonga.

---

### Issue: Guest Itinerary not showing DPA passes

**Symptoms:** Guests cannot see purchased DPA passes in their plans/itinerary.

**Root Cause:** Guest Itinerary Provider service issue.

**Resolution:** Check Splunk `wdpr-dlp-is-guest-itinerary-provider`. Verify ECS service health.

---

### Issue: Core API Order/Payment Reference failures

**Symptoms:** Order creation or payment reference failing during DPA purchase flow.

**Root Cause:** Core API services down (external dependency).

**Resolution:** Escalate to Core API team (app-frdlp-coreapi). Contact Nadim Momin. Teams Channel: DLP Core API | DLP Core API L3 Support.

---

## Escalation Decision Tree

- If PEA/PSP/Itinerary/Push service issue → Storm Squad (app-frdlp-attraction-dge)
- If Core API issue → app-frdlp-coreapi (Nadim Momin)
- If Experience Access issue → app-frdlp-experienceaccess (Sushil Kumar), Teams: DLP DPA Support
- If Worldpay issue → Support.Flavien.Goirand@Worldpay.com
- If TBX Ops issue → ops-global-pcs-sre (Teams: travelbox-production)
- If Airship issue → Adolo Malonga
- If Surqual/content issue → Discovery & Nav squad (business hours) or ECOM Oncall (weekends)
- If revenue impact → engage ITOC for DFM; during business hours engage Alejandra Arevalo
- If PC OPS needed → engage through ITOC (weekends via DPA Incident channel)

## Known Quirks

- No known application issues
- InPark endpoint must be called before buying DPA One
- Attractions close at specific hours — DPA not available after closing
- CC token no longer saved in stage (deactivated per PO request)
