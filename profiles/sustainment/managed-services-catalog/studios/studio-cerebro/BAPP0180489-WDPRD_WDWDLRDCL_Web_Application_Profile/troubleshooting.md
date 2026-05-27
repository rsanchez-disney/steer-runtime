# Troubleshooting — WDPRD WDWDLRDCL Web Application Profile

## Common Issues

### Issue: Login Loops (OneID V5 Trust State)

**Symptoms:** Users stuck in infinite login redirect. OneID v5 Trust State transitions failing. P1/P2 severity.

**Root Cause:** Token expiry or Trust State value mismatch between AuthenticatorJS and OneID.

**Resolution:**
1. Check AuthenticatorJS logs: `index=wdpr-profile-ui Identifiers.App-Name="AuthenticatorJS"`
2. Verify OneID token expiry and Trust State value (use SWID in Cribl)
3. If widespread: check OneID service health
4. If isolated: clear user session and retry
5. Escalate to IDY Jira if OneID-side issue

---

### Issue: Akamai 502s / Edge Routing

**Symptoms:** 502 errors reaching the application. No traffic reaching origin servers. P1/P2 severity.

**Root Cause:** Akamai edge routing failure or origin health check failures.

**Resolution:**
1. Get Akamai Reference String from error page
2. Translate Error String
3. Escalate to ops-global-parks-se-guestexp

---

### Issue: Payment Methods — Pin Not Accepted (INC26572212)

**Symptoms:** Guest cannot set or use room pin for payment methods. P3 severity.

**Root Cause:** Room pin not properly set.

**Resolution:** Have guest go to reset room pin page and set their room pin.

---

### Issue: Payment Methods — Cannot Remove (INC27567951)

**Symptoms:** Guest unable to remove a payment method from their profile. P3 severity.

**Root Cause:** Backend payment service issue.

**Resolution:** Reassign to app-flwdw-payment.

---

### Issue: Avatar Not Loading

**Symptoms:** Guest avatar not displaying on profile page. P3 severity.

**Root Cause:** VAS Duplicate Key issue or New Relic network failure.

**Resolution:** Check New Relic network failure or avatar endpoint Splunk logs. Related to VAS Duplicate Key issue.

---

### Issue: Affiliation Not Loading (GCXPWS-8942)

**Symptoms:** Guest affiliations section not loading on profile page. P3 severity.

**Root Cause:** Backend endpoint failure.

**Resolution:** Check endpoint logs on Splunk. Endpoints documented on GCXPWS-8942.

---

### Issue: Unable to Link MEP (GCXPWS-8942)

**Symptoms:** Guest cannot link Magic Express Pass. P3 severity.

**Root Cause:** Race condition between MEP Flow endpoints.

**Resolution:** Check for race condition between MEP Flow endpoints.

---

### Issue: Analytics 404 Not Found

**Symptoms:** Analytics file returning 404. P4 severity.

**Root Cause:** Analytics file not loaded on S3.

**Resolution:** Check if file is loaded on S3. If not, rebuild and deploy the SPA.

---

## Debug Mode

Works on all environments and all brands (WDW, DLR, DCL):
1. Go to the environment page (e.g., https://stage.disneyworld.disney.go.com)
2. Sign in with an account
3. Add /debug/dashboard at the end of the URL
4. Sign in with myId credentials
5. Type "debug:" in the search space
6. Select Developer Toggles tab
7. Enable: Debug Module Enabled, Debug Module Prior Page Enabled, Debug Show Affiliations in Session, Debug Module Show Request Headers, Show Debug Panel
8. Submit → go back to main page → scroll down to see request logs
9. Check Guest Affiliations: Add /debug/session-data/ to the URL → search for Guest_Affiliations

---

## Escalation Decision Tree

- If login loops → check AuthenticatorJS logs first, then escalate to Cesar Muñoz / IDY Jira
- If 502 errors → get Akamai Reference String → escalate to ops-global-parks-se-guestexp
- If payment issues → reassign to app-flwdw-payment
- If avatar/VAS issues → check VAS health, escalate to Martin Uribe
- If backend API failures → check Profile WebAPI WAM health, escalate to Andrew Southwick
- If widespread outage → P1, escalate to Gino Caverzan (Disney POC)

## Known Quirks

- Cribl migration changed source field — now only has ECS container ID. Use Identifiers.App-Name="profile-spa" for filtering instead of source
- Vault paths differ between East (gam2) and West (gam) in prod
- Alert thresholds: CPU > 30% | Memory > 50% → triggers alert to gac-profile-prod-alerts
- Latest environment cluster uses "S0180489" prefix instead of "B0180489"
