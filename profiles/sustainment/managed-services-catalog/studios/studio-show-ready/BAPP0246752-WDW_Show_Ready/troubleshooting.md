# Troubleshooting — WDW Show Ready

## Common Issues

### Device Token Void

**Symptoms:** Not receiving notifications on mobile app

**Root Cause:** 
1. Device token expired on mobile app
2. Device token not received from login or update token from mobile app
3. Exception while registering device token to SNS

**Resolution:** Re-login to applications, if problem persist re-install mobile app

### Null Area Void

**Symptoms:** 
1. User unable to see cast other cast members 
2. User is invisible for other cast Members

**Root Cause:** 
1. Login performed with area value in null or empty 

**Resolution:**
1. Review splunk logs for `castLogin` for affected user to find null or missing device token
2. Review splunk logs for Put requests related to `update Device` to find null, empty or missing device token

### Phone icon disappear

**Symptoms:** 
1. User in cast Member view don't have phone icon to call

**Root Cause:** 
1. Login performed with phone field empty, null

**Resolution:**
1. Review splunk logs for `castLogin` for affected user to find null or missing phone
2. Review splunk logs for Put requests related to `update Device` to find null, empty or missing phone



<!-- ---

## Escalation Decision Tree

- If {condition} → escalate to {team/person}

## Known Quirks

- -->
