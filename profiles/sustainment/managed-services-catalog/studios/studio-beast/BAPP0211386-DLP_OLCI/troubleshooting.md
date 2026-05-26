# Troubleshooting — DLP OLCI

## Common Issues

### Issue: DocuSign envelope creation failure

**Symptoms:** Non-French guests cannot see or complete registration forms in the mobile app. Check-in remains pending.

**Root Cause:** DocuSign API unavailable or PMS Registration Form Provider cannot communicate with DocuSign.

**Resolution:**
1. Check PMS Registration Form Provider health: `https://dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-lodging-pms-registration-form-provider/healthcheck/deep`
2. Check Splunk for errors: `index=wdpr_dlp_digital "Identifiers.App-Name"=wdpr-dlp-is-lodging-pms-registration-form-provider Level=ERROR`
3. Verify DocuSign service status externally
4. Check Vault secrets for DocuSign credentials

---

### Issue: Opera Business Event changes not propagating

**Symptoms:** Reservation changes made in Opera PMS not reflected in the mobile app OLCI flow. Guest sees outdated reservation info.

**Root Cause:** OLCI Business Event Processor failing to consume Opera Business Events.

**Resolution:**
1. Check Business Event Processor health: `https://dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-lodging-ooc-olci-business-event-processor/healthcheck/deep`
2. Check Splunk: `index=wdpr_dlp_digital "Identifiers.App-Name"=wdpr-dlp-is-lodging-ooc-olci-business-event-processor Level=ERROR`
3. Note: PMS Registration Form Provider can still get reservations directly from Opera or via Package Digital Provider flow

---

### Issue: DocuSign Purge not executing

**Symptoms:** Completed registration forms remain visible to guests after expected purge window. Online check-in shows as pending.

**Root Cause:** DocuSign Purge Processor failing to clean up data.

**Resolution:**
1. Validate purge for specific booking: `index=wdpr_dlp_digital source=eu-west-1:dlp-apps-S0001481-euw1-*-applogs:wdpr-dlp-is-lodging-dcs-docusign-purge-processor-*/* "Identifiers.App-Name"=wdpr-dlp-is-lodging-dcs-docusign-purge-processor BOOKINGID`
2. Check Splunk dashboard: https://splunk.wdprapps.disney.com/en-US/app/dlp_digital_back_end/wdpr-dlp-is-lodging-dcs-docusign-purge-processor
3. Check AppDynamics for component health

---

## Escalation Decision Tree

- If OLCI service issues → engage #dlp-hotels-ohip Slack channel
- If backend dev needed → Nicolas Rameaux
- If Opera/PMS integration issues → engage Hotels OHIP team via #dlp-hotels-ohip
- If DocuSign issues → check DocuSign service status, then escalate to dev team

## Known Quirks

- Known PROD errors documented at: https://confluence.disney.com/pages/viewpage.action?spaceKey=DGMA&title=Production+Errors
- If Business Event Processor is down, reservations can still be obtained by PMS Registration Form Provider directly from Opera or through Package Digital Provider flow
- Non-French guests who don't complete the Registration Form before arrival date will have it purged automatically by DocuSign Purge Processor
