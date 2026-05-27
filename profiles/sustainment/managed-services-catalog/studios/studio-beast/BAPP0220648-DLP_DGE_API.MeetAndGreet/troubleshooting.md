# Troubleshooting — DLP DGE API.MeetAndGreet

## Common Issues

### Issue: Lineberty outages

**Symptoms:** Meet & Greet booking section unavailable in mobile app. Errors when attempting to view timeslots or register bookings.

**Root Cause:** Lineberty (external third-party) experiencing outages — either full platform or specific endpoints.

**Resolution:**
1. Check Lineberty status — contact support@lineberty.com or call (+33) 09.73.72.33.06
2. Verify via deep health check: `https://dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-sales-srv-meet-and-greet-provider/healthcheck/deep`
3. If Lineberty is down, no action on our side — wait for their resolution
4. If only specific endpoints are affected, check Splunk for error patterns

---

### Issue: JWT token generation failure

**Symptoms:** Mobile app cannot authenticate with Lineberty API. Errors in Meet & Greet provider logs.

**Root Cause:** Issue with JWT token generation in the Meet & Greet microservice (Vault secret misconfiguration or expiry).

**Resolution:**
1. Check Splunk for ERROR logs: `index=wdpr_dlp_digital "Identifiers.App-Name"=wdpr-dlp-is-sales-srv-meet-and-greet-provider Level=ERROR`
2. Verify Vault secrets at: `secret/apps/is/eu-west-1/{env}/sales/srv-meet-and-greet-provider/1.0.0/secret`
3. Restart service via Rundeck if needed

---

## Escalation Decision Tree

- If Lineberty is down → contact Lineberty support (support@lineberty.com / +33 09.73.72.33.06)
- If Meet & Greet provider is down → escalate to Nicolas Rameaux (Dev Back)
- If mobile app integration issue → escalate to Mobile APP team (app-frdlp-mobile-apps / DLP.DL-MOBILE.APP.TEAM@disney.com)
- If booking logic/business issue → escalate to Chiara Prencipe (PO) / Yoann Leon

## Known Quirks

- The service only provides the JWT for Lineberty — actual booking calls go directly from mobile app to Lineberty
- Outages in Lineberty affect only the Meet & Greet section of the app, no other features impacted
