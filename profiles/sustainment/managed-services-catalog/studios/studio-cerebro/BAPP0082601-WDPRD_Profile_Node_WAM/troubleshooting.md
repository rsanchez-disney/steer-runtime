# Troubleshooting — WDPRD Profile Node WAM

> ⛔ **DEPRECATED** — This service has been migrated to Java WAM (BAPP0253435). Node.js 14 is EOL. All traffic should be routed to the Java WAM.

## Common Issues

### Issue: Traffic still hitting deprecated Node WAM

**Symptoms:** Requests appearing in Node WAM logs/clusters instead of Java WAM (BAPP0253435).

**Root Cause:** DNS or routing not fully migrated to Java WAM.

**Resolution:** Verify Route53 records point to Java WAM. Coordinate with Andrew Southwick (andrew.southwick@disney.com) to complete migration.

---

### Issue: ECS tasks unhealthy

**Symptoms:** Health check failures on origin.profile-wam.wdprapps.disney.com

**Root Cause:** Service may have been scaled to zero or tasks are failing to start.

**Resolution:** Check ECS cluster status. If service is intentionally deprecated, confirm no traffic should be routed here.

---

## Escalation Decision Tree

- If traffic is still hitting Node WAM → escalate to Andrew Southwick (andrew.southwick@disney.com)
- If DNS/routing issues → escalate to Glenn Raposo (glenn.raposo@disney.com)
- If service needs to be fully decommissioned → escalate to Krista Betts (krista.l.betts@disney.com)

## Known Quirks

- Service is DEPRECATED — all functionality migrated to Java WAM (BAPP0253435)
- Node.js 14 is EOL — no security patches available
- ECS clusters may still exist in both us-east-1 and us-west-2 for historical reasons
- Splunk index is `wdpr-gam` (NOT `wdpr_profile_ui`). Filter: `ids.app=wdw-webapi`

## Splunk Dashboards

- **Splunk PROD:** https://splunk.wdprapps.disney.com (index: `wdpr-gam`)

## Investigation Queries

### ⚠️ FIRST: Check Banned Guest (Axis)
Before any investigation — search SWID in [Axis](https://axis.disney.network). If "Experience Access Restriction" → resolve as Working as Designed (NEVER inform guest).

### Errors (level >= 40)
```spl
index=wdpr-gam ids.app=wdw-webapi level>=40 earliest=-1h
```

### Error Rate (15m buckets)
```spl
index=wdpr-gam ids.app=wdw-webapi msg.path!=/status environment=prod | eval statusCode='msg.code' | timechart span=15m count as calls, count(eval(not like(statusCode,"2%"))) as Errors | eval pcErrors=round((Errors/calls)*100,0)
```

### 5XX Errors
```spl
index=wdpr-gam ids.app=wdw-webapi msg.code>=500 environment=prod earliest=-1h | stats count by msg.code, msg.path | sort -count
```

### OneID Authentication Issues
```spl
index=oneid {SWID}
```

## Reassignment Groups (Routing)

| Pattern | Assignment Group |
|---------|-----------------|
| OneID / Login / OTP | Jira IDY-* (NOT ServiceNow) |
| Akamai / Edge / DNS / 502s | ops-global-parks-se-guestexp |
| Disney CAST L4 escalation | app-global-cerebro |
| AWS Infrastructure | ops-global-parks-se-guestexp |
