# Troubleshooting — WDPRD Profile Node WAM

## Common Issues

### Issue: Traffic still hitting deprecated Node WAM

**Symptoms:** Requests appearing in Node WAM logs/clusters instead of Java WAM (BAPP0253435).

**Root Cause:** DNS or routing not fully migrated to Java WAM.

**Resolution:** Verify Route53 records point to Java WAM. Coordinate with Andrew Southwick to complete migration.

---

### Issue: ECS tasks unhealthy

**Symptoms:** Health check failures on origin.profile-wam.wdprapps.disney.com

**Root Cause:** Service may have been scaled to zero or tasks are failing to start.

**Resolution:** Check ECS cluster status. If service is intentionally deprecated, confirm no traffic should be routed here.

---

## Escalation Decision Tree

- If traffic is still hitting Node WAM → escalate to Andrew Southwick (Tech Lead)
- If DNS/routing issues → escalate to Glenn Raposo (Manager)
- If service needs to be fully decommissioned → escalate to Krista Betts (Executive)

## Known Quirks

- Service is DEPRECATED — all functionality migrated to Java WAM (BAPP0253435)
- Node.js 14 is EOL — no security patches available
- ECS clusters may still exist in both us-east-1 and us-west-2 for historical reasons
