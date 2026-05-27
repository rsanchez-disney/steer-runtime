# Troubleshooting — FNF New Connection Methods SPA

## Common Issues

### Issue: Friend list not loading complete

**Symptoms:** Guest not displaying connected guests on Family and Friends page. HIGH frequency. Ref: INC27024664.

**Root Cause:** Missing property in backend response or network issue.

**Resolution:**
1. Check console log for error
2. Verify network tab for failed requests
3. Check FnF endpoint response
4. If missing property in response → redirect to GAM team
5. If no discrepancy found → create web ticket and notify Glenn or web team

---

### Issue: Akamai Rule Issue — Access Denied

**Symptoms:** Guest getting "Access Denied" error. MEDIUM frequency. Ref: INC27627862.

**Root Cause:** Akamai BOTMAN rule blocking legitimate traffic.

**Resolution:**
1. Check Akamai Splunk query: `index=wdpr-profile-ui source=*akamai* "fnf" "BOTMAN" | stats count by src_ip, action`
2. If high volume of requests from SWID, check log endpoint query
3. Escalate to ops-global-parks-se-guestexp if Akamai config change needed

---

### Issue: Watching Friends Plans Showing Incorrectly

**Symptoms:** Plans from other connections appearing incorrectly. LOW frequency. Ref: INC27731435.

**Root Cause:** Share Plans toggle configuration issue.

**Resolution:** Users C/D must disable "Share Plans" toggle for their connection with A/B.

---

### Issue: Archived Managed Guests appearing

**Symptoms:** Archived managed guests still visible in FnF list. LOW frequency. Ref: INC27795375.

**Root Cause:** Archiving is not guest-facing functionality.

**Resolution:** Escalate to GAM team.

---

### Issue: Deactivated profiles remain in FnF list

**Symptoms:** Deactivated profiles still showing in friend list. Ref: PRB0048497.

**Root Cause:** Cannot be resolved by standard triage.

**Resolution:** Escalate to SF (Salesforce team).

---

### Issue: Fumble error on guest removal

**Symptoms:** Error when removing a guest from friend list.

**Root Cause:** Known issue — not sending xid on request.

**Resolution:** Known bug, escalate to development team.

---

### Issue: Blank pages on Canada English

**Symptoms:** Page renders blank when locale is Canada English.

**Root Cause:** Locale handling issue.

**Resolution:** Workaround: change to US English.

---

### Issue: Analytics 404 not found

**Symptoms:** Analytics file returning 404.

**Root Cause:** Analytics file not present on S3.

**Resolution:** Check if file is loaded on S3. If not, rebuild and deploy the SPA.

---

## Escalation Decision Tree

- If friend list not loading → check backend response → if GAM data issue → escalate to GAM team
- If Access Denied errors → check Akamai BOTMAN → escalate to ops-global-parks-se-guestexp
- If login/auth issues → escalate to Cesar Munoz (AuthenticatorJS)
- If backend service failures → escalate to Andrew Southwick (WebAPI WAM)
- If deactivated profiles in list → escalate to SF
- If archived managed guests → escalate to GAM

## Known Quirks

- Alert thresholds: Error > 3%, Content endpoint: 0.02%, CPU > 30%, Memory > 50%
- Blank pages on Canada English locale — workaround: switch to US English
- Fumble error on guest removal is a known bug (missing xid on request)
- Deactivated profiles in FnF list cannot be resolved by standard triage (PRB0048497)
- ContentSquare dashboard available for user behavior analytics
