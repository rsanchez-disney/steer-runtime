# Troubleshooting — DLP Disney Premier Access Ultimate

## Common Issues

### Issue: DPA All Access Show Provider outage

**Symptoms:** Guests cannot create any DPA Ultimate or SYS passes. Revenue impact.

**Root Cause:** ECS service `dpa-all-access-show-provider-prod-live` down or degraded.

**Resolution:** Check health endpoint. Verify ECS service in cluster `dlp-apps-S0001481-euw1-prd`. Check Splunk "ALL-ACCESS - Global Technical Dashboard". Consider DFM via ITOC.

---

### Issue: Payment failures (PSP/Worldpay)

**Symptoms:** Guests cannot complete DPA Ultimate/SYS purchase.

**Root Cause:** PSP Payment Methods Provider or Worldpay downstream failure.

**Resolution:** Check Splunk "DLP_PSP_WORLDPAY_PAYMENT_ISSUES". Escalate to Worldpay (Support.Flavien.Goirand@Worldpay.com, cc Pierre Andre Marty, Lorry Moreau).

---

### Issue: Fulfillment issues

**Symptoms:** Pass created but not properly fulfilled. Guest has pass but cannot use it.

**Root Cause:** Experience Access or Core API issue.

**Resolution:** Check Splunk "ALL-ACCESS - Functional Fulfilment Issues" or "SYS Fulfillment Issues". Escalate to Experience Access (app-frdlp-experienceaccess) or Core API (app-frdlp-coreapi).

---

### Issue: Guest Itinerary not showing DPA Ultimate/SYS passes

**Symptoms:** Guests cannot see purchased passes in itinerary.

**Root Cause:** Guest Itinerary Provider service issue.

**Resolution:** Check Splunk "ITINERARY - Global Technical Dashboard". Verify ECS service `guest-itinerary-provider-prod-live`.

---

## Escalation Decision Tree

- If DPA All Access Provider issue → Storm Squad (app-frdlp-attraction-dge)
- If Experience Access issue → app-frdlp-experienceaccess (Sushil Kumar), Teams: DLP DPA Support
- If Experience Access Oncall → app-flwdw-ngexpas
- If Product Gateway issue → app-global-titus (engage via DTOC)
- If Core API issue → app-frdlp-coreapi (Nadim Momin)
- If TBX Ops issue → app-global-l3tbxdlp (Teams: travelbox-production)
- If Worldpay issue → Support.Flavien.Goirand@Worldpay.com
- If Airship issue → Adolo Malonga
- If Surqual/content → Discovery & Nav squad (business hours) / ECOM Oncall (weekends)
- If revenue impact → engage ITOC for DFM; business hours engage Alejandra Arevalo
- If PC OPS needed → engage through ITOC (weekends via DPA Incident)

## Known Quirks

- Same external POCs as Orion (BAPP0218964)
- DFM process same as Orion
- Autorecovery test cases should be run first (need NRT team help)
