# Troubleshooting — WDW Mobile Application (Family and Friends)

## Common Issues

### Issue: Deactivated profiles remain in FnF list

**Symptoms:** Guest sees deactivated/deleted profiles still appearing in their Family and Friends list.

**Root Cause:** Known issue — deactivated profiles not properly cleaned from FnF associations.

**Resolution:** Escalate to SF (Salesforce team). Reference: PRB0048497 (Open)

---

### Issue: Fumble error on guest removal

**Symptoms:** Error when attempting to remove a guest from the Family and Friends list.

**Root Cause:** Known issue in the removal flow.

**Resolution:** Known issue — retry or escalate if persistent.

---

## Escalation Decision Tree

- If FnF list not loading → check Profile B2C / VAS backend health
- If invite sending fails → check backend connectivity and OneID auth
- If deactivated profiles in list → escalate to SF (PRB0048497)
- If widespread mobile issues → escalate to Mark Lewis (Disney POC)
- For sustainment issues → Irving Franco, Alan Solis

## Known Quirks

- Deactivated profiles remain in FnF list (PRB0048497 — Open)
- Fumble error on guest removal is a known issue with no current fix
- Uses New Relic for monitoring (not Splunk)
